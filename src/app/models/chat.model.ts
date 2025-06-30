export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  type: MessageType;
  sentAt: Date;
  editedAt?: Date;
  isDeleted: boolean;
  attachmentUrl?: string;
  attachmentFileName?: string;
  attachmentSize?: number;
  readByUserIds: number[];
  isOwnMessage: boolean;
}

export interface Conversation {
  id: number;
  title: string;
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface CreateConversationDto {
  title: string;
  participantIds: number[];
  isGroup: boolean;
}

export interface SendMessageDto {
  conversationId: number;
  content: string;
  type: MessageType;
}

export enum MessageType {
  Text = 0,
  Image = 1,
  File = 2,
  System = 3
}

export interface ChatNotification {
  type: string; // "new_message", "user_online", "user_offline", "typing"
  data: any;
}

export interface TypingIndicator {
  conversationId: number;
  userId: number;
  isTyping: boolean;
}
