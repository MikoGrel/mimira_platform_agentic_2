"use client";

import { Tables } from "$/types/supabase";
import useCurrentUser from "$/features/auth/hooks/use-current-user";
import useTenderComments from "../hooks/use-tender-comments";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Button,
  Spinner,
} from "@heroui/react";
import { useState } from "react";
import { MessageCircle, Send, Trash2, User } from "lucide-react";

interface CommentsDrawerProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  tender?: Tables<"tenders"> | null;
}

export function CommentsDrawer({ open, setOpen, tender }: CommentsDrawerProps) {
  const { user } = useCurrentUser();
  const [newCommentText, setNewCommentText] = useState("");

  const {
    comments,
    isLoading,
    addComment,
    isAddingCommentLoading,
    addCommentError,
    deleteComment,
    isDeletingComment,
  } = useTenderComments(tender?.id || null);

  const handleAddComment = () => {
    if (!user || !newCommentText.trim()) return;

    addComment({
      text: newCommentText.trim(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      tender_id: tender?.id || null,
    });
    setNewCommentText("");
  };

  return (
    <Drawer isOpen={open} onOpenChange={setOpen} size="xl" radius="sm">
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="flex flex-col gap-1 border-b">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Comments</h3>
                <span className="text-muted-foreground">
                  ({comments.length})
                </span>
              </div>
              {tender?.orderobject && (
                <p className="text-sm text-muted-foreground truncate">
                  {tender.orderobject}
                </p>
              )}
            </DrawerHeader>

            <DrawerBody className="flex flex-col">
              <div className="flex-1 max-h-96 overflow-y-auto">
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Spinner>Loading comments ...</Spinner>
                  </div>
                )}

                {comments.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageCircle className="size-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No comments yet</p>
                    <p className="text-sm text-muted-foreground/75">
                      Be the first to add a comment
                    </p>
                  </div>
                )}

                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 py-4 border-b">
                    <div className="flex-shrink-0">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="size-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">
                            {[
                              comment.profile?.first_name,
                              comment.profile?.last_name,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                          {comment.created_at && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        {user?.id === comment.user_id && (
                          <Button
                            size="sm"
                            variant="light"
                            onPress={() => deleteComment(comment.id)}
                            disabled={isDeletingComment}
                            className="size-7 text-muted-foreground hover:text-destructive"
                            isIconOnly
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        )}
                      </div>

                      <p className="text-sm whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DrawerBody>

            <DrawerFooter className="border-t">
              <div className="space-y-3 w-full">
                <div className="flex gap-2">
                  <div className="flex-shrink-0">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="size-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">
                      {user?.profile?.first_name && user?.profile?.last_name
                        ? `${user.profile.first_name} ${user.profile.last_name}`
                        : user?.id || "Anonymous"}
                    </p>
                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Write your comment..."
                      className="w-full min-h-[80px] resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                {addCommentError && (
                  <p className="text-sm text-destructive">
                    Failed to add comment. Please try again.
                  </p>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="flat"
                    size="sm"
                    onPress={() => setNewCommentText("")}
                    disabled={isAddingCommentLoading}
                  >
                    Clear
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    onPress={handleAddComment}
                    isLoading={isAddingCommentLoading}
                    startContent={<Send className="size-3 mr-1" />}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
