import api from "./api";

export interface ChatUser {
    id: string;
    name: string;
    email: string;
}

export interface ConversationMember {
    id: string;
    userId: string;
    joinedAt: string;
    user: ChatUser;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    sender: ChatUser;
}

export interface Conversation {
    id: string;
    type: "DIRECT" | "GROUP";
    name: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    members: ConversationMember[];
    messages: Message[];
    unreadCount?: number;
}

export async function getChatUsers(search?: string) {
    const response = await api.get("/api/chat/users", {
        params: search ? { search } : undefined,
    });

    return response.data.data as ChatUser[];
}

export async function getConversations() {
    const response = await api.get(
        "/api/chat/conversations"
    );

    return response.data.data as Conversation[];
}

export async function createDirectChat(
    userId: string
) {
    const response = await api.post(
        "/api/chat/conversations/direct",
        { userId }
    );

    return response.data.data as Conversation;
}

export async function createGroupChat(
    name: string,
    memberIds: string[]
) {
    const response = await api.post(
        "/api/chat/conversations/group",
        {
            name,
            memberIds,
        }
    );

    return response.data.data as Conversation;
}

export async function getMessages(
    conversationId: string
) {
    const response = await api.get(
        `/api/chat/conversations/${conversationId}/messages`
    );

    return response.data.data as Message[];
}

export async function sendMessage(
    conversationId: string,
    content: string
) {
    const response = await api.post(
        `/api/chat/conversations/${conversationId}/messages`,
        {
            content,
        }
    );

    return response.data.data as Message;
}

export async function addMember(
    conversationId: string,
    userId: string
) {
    const response = await api.post(
        `/api/chat/conversations/${conversationId}/members`,
        {
            userId,
        }
    );

    return response.data.data;
}

export async function removeMember(
    conversationId: string,
    userId: string
) {
    const response = await api.delete(
        `/api/chat/conversations/${conversationId}/members/${userId}`
    );

    return response.data;
}