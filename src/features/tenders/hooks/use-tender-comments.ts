"use client";

import { createClient } from "$/lib/supabase/client";
import { TablesInsert } from "$/types/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useTenderComments(tenderId: string | null) {
  const client = createClient();
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tender-comments", tenderId],
    queryFn: async () => {
      if (!tenderId) return [];

      const { data: commentsData, error: commentsError } = await client
        .from("comments")
        .select("id, text, created_at, user_id")
        .eq("tender_id", tenderId)
        .order("id");

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        return [];
      }

      const userIds = [
        ...new Set(
          commentsData
            .map((comment) => comment.user_id)
            .filter((userId): userId is string => userId !== null)
        ),
      ];

      const { data: profilesData, error: profilesError } = await client
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const commentsWithProfiles = commentsData.map((comment) => ({
        ...comment,
        profile:
          profilesData?.find((profile) => profile.id === comment.user_id) ||
          null,
      }));

      return commentsWithProfiles;
    },
    enabled: !!tenderId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: TablesInsert<"comments">) => {
      if (!tenderId) throw new Error("No tender ID provided");

      const { data, error } = await client
        .from("comments")
        .insert(commentData)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tender-comments", tenderId],
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await client
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tender-comments", tenderId],
      });
    },
  });

  return {
    comments,
    isLoading,
    error,
    addComment: addCommentMutation.mutate,
    isAddingCommentLoading: addCommentMutation.isPending,
    addCommentError: addCommentMutation.error,
    deleteComment: deleteCommentMutation.mutate,
    isDeletingComment: deleteCommentMutation.isPending,
  };
}
