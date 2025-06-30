import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, Message, User, CreateConversationDto, SendMessageDto } from '../models/chat.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = environment.apiUrl || 'https://localhost:7001/api';

  constructor(private http: HttpClient) {}

  // Conversations
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/chat/conversations`);
  }

  createConversation(dto: CreateConversationDto): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/chat/conversations`, dto);
  }

  createDirectConversation(userId: number): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/chat/conversations/direct`, { userId });
  }

  // Messages
  getMessages(conversationId: number, page: number = 1, pageSize: number = 50): Observable<Message[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<Message[]>(`${this.apiUrl}/chat/conversations/${conversationId}/messages`, { params });
  }

  markAsRead(conversationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/chat/conversations/${conversationId}/read`, {});
  }

  // Users
  getAvailableUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/chat/users`);
  }
}
