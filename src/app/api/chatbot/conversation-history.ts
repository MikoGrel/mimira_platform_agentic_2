import { createClient } from "$/lib/supabase/server";

interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>;
  timestamp: string;
  searchResults?: Array<{
    fileId: string;
    filename?: string;
    text?: string;
    vectorStoreFileId?: string;
  }>;
}

interface ConversationData {
  messages: ConversationMessage[];
  lastUpdated: string;
}

export class ConversationHistoryManager {
  private static readonly SYSTEM_PROMPT = 
    "You are an assistant for tender intelligence. Answer only using the provided documentation. If the documentation does not contain the answer, say that you do not know. Keep responses concise, focused, and avoid speculation. Always reply in the same language as the user's latest message. Please do not offer things beyond answering questions (e.g. you are NOT able to prepare the docuemntation - do NOT offer it)";

  static async getHistory(mappingId: string): Promise<ConversationMessage[]> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('companies_tenders_mappings')
        .select('*')
        .eq('id', mappingId)
        .single();

      if (error) {
        console.error('Error fetching conversation history:', error);
        return this.createNewConversation();
      }

      const chatbotResponses = data?.chatbot_responses;
      if (!chatbotResponses) {
        // Initialize new conversation with system prompt
        const newConversation = this.createNewConversation();
        await this.saveConversation(mappingId, {
          messages: newConversation,
          lastUpdated: new Date().toISOString(),
        });
        return newConversation;
      }

      const conversationData = chatbotResponses as unknown as ConversationData;
      return conversationData.messages || this.createNewConversation();
    } catch (error) {
      console.error('Error in getHistory:', error);
      return this.createNewConversation();
    }
  }

  // Convert stored conversation to OpenAI format (removes timestamps and metadata)
  static async getOpenAIHistory(mappingId: string): Promise<Array<{role: string, content: any[]}>> {
    const history = await this.getHistory(mappingId);
    
    return history.map(message => ({
      role: message.role,
      content: message.content
      // Remove timestamp, searchResults, and other metadata that OpenAI doesn't accept
    }));
  }

  private static createNewConversation(): ConversationMessage[] {
    return [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: this.SYSTEM_PROMPT,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ];
  }

  private static async saveConversation(mappingId: string, conversationData: ConversationData): Promise<void> {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('companies_tenders_mappings')
        .update({ 
          chatbot_responses: conversationData as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', mappingId);

      if (error) {
        console.error('Error saving conversation:', error);
      }
    } catch (error) {
      console.error('Error in saveConversation:', error);
    }
  }

  static async addUserMessage(mappingId: string, message: string): Promise<ConversationMessage[]> {
    const history = await this.getHistory(mappingId);
    
    const userMessage: ConversationMessage = {
      role: "user",
      content: [
        {
          type: "input_text",
          text: message,
        },
      ],
      timestamp: new Date().toISOString(),
    };
    
    history.push(userMessage);
    
    // Save updated conversation to database
    await this.saveConversation(mappingId, {
      messages: history,
      lastUpdated: new Date().toISOString(),
    });
    
    return history;
  }

  static async addAssistantResponse(
    mappingId: string, 
    responseOutput: any[],
    searchResults?: any[]
  ): Promise<void> {
    const history = await this.getHistory(mappingId);

    // Add assistant messages from the response output
    for (const output of responseOutput) {
      if (output.role && output.content) {
        const assistantMessage: ConversationMessage = {
          role: output.role,
          content: Array.isArray(output.content) ? output.content : [output.content],
          timestamp: new Date().toISOString(),
          searchResults: searchResults || undefined,
        };
        history.push(assistantMessage);
      }
    }
    
    // Save updated conversation to database
    await this.saveConversation(mappingId, {
      messages: history,
      lastUpdated: new Date().toISOString(),
    });
  }

  static async addAssistantMessage(
    mappingId: string,
    content: string,
    searchResults?: any[]
  ): Promise<void> {
    const history = await this.getHistory(mappingId);

    const assistantMessage: ConversationMessage = {
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: content,
        },
      ],
      timestamp: new Date().toISOString(),
      searchResults: searchResults || undefined,
    };

    history.push(assistantMessage);

    // Save updated conversation to database
    await this.saveConversation(mappingId, {
      messages: history,
      lastUpdated: new Date().toISOString(),
    });
  }

  // Note: Clear history functionality removed per user request
  // Conversations will be stored permanently for all tenders
}
