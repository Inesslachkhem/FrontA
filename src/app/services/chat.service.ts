import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  Conversation,
  Message,
  User,
  CreateConversationDto,
  SendMessageDto,
} from '../models/chat.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = environment.apiUrl || 'https://localhost:7001/api';
  private readonly baseUrl = this.apiUrl.replace('/api', ''); // Remove /api for static files

  constructor(private http: HttpClient) {}

  // Conversations
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/chat/conversations`);
  }

  createConversation(dto: CreateConversationDto): Observable<Conversation> {
    return this.http.post<Conversation>(
      `${this.apiUrl}/chat/conversations`,
      dto
    );
  }

  createDirectConversation(userId: number): Observable<Conversation> {
    return this.http.post<Conversation>(
      `${this.apiUrl}/chat/conversations/direct`,
      { userId }
    );
  }

  // Messages
  getMessages(
    conversationId: number,
    page: number = 1,
    pageSize: number = 50
  ): Observable<Message[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Message[]>(
      `${this.apiUrl}/chat/conversations/${conversationId}/messages`,
      { params }
    );
  }

  markAsRead(conversationId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/chat/conversations/${conversationId}/read`,
      {}
    );
  }

  // Users
  getAvailableUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/chat/users`);
  }

  // File uploads
  uploadFileMessage(formData: FormData): Observable<{
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    contentType?: string;
  }> {
    console.log(
      '🌐 ChatService: Starting file upload to:',
      `${this.apiUrl}/chat/upload`
    );

    // Log FormData contents for debugging
    console.log('📝 FormData contents:');
    for (let pair of (formData as any).entries()) {
      if (pair[1] instanceof File) {
        console.log(
          `  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes, ${pair[1].type})`
        );
      } else {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
    }

    return this.http
      .post<{
        fileUrl: string;
        fileName: string;
        fileSize?: number;
        contentType?: string;
      }>(`${this.apiUrl}/chat/upload`, formData)
      .pipe(
        tap((response: any) => {
          console.log('🌐 ChatService: Upload successful:', response);
        }),
        catchError((error: any) => {
          console.error('🌐 ChatService: Upload failed:', error);
          console.error('🌐 Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message,
            error: error.error,
          });
          throw error;
        })
      );
  }

  // Utility method to get full file URL
  getFullFileUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http')) return relativeUrl; // Already absolute
    return `${this.baseUrl}${relativeUrl}`;
  }
}
