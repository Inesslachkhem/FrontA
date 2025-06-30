import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message, ChatNotification, TypingIndicator } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: HubConnection;
  private readonly isConnected$ = new BehaviorSubject<boolean>(false);
  private readonly messageReceived$ = new BehaviorSubject<Message | null>(null);
  private readonly userStatusChanged$ = new BehaviorSubject<{ userId: number; isOnline: boolean } | null>(null);
  private readonly userTyping$ = new BehaviorSubject<TypingIndicator | null>(null);
  private readonly conversationsUpdated$ = new BehaviorSubject<boolean>(false);
  private readonly messagesRead$ = new BehaviorSubject<{ conversationId: number; userId: number } | null>(null);

  constructor() {}

  public startConnection(token: string): Promise<void> {
    if (!token) {
      return Promise.reject(new Error('No authentication token provided'));
    }

    console.log('🔗 Configuring SignalR connection...');

    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5256/chatHub', {
        accessTokenFactory: () => {
          // Always get the latest token in case it was refreshed
          const latestToken = localStorage.getItem('token') || token;
          console.log('🔑 SignalR requesting token - Available:', !!latestToken);
          if (latestToken) {
            console.log('🔑 Token length:', latestToken.length);
            console.log('🔑 Token prefix:', latestToken.substring(0, 20) + '...');
          }
          return latestToken;
        },
        skipNegotiation: false,
        withCredentials: false,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:4200'
        }
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Debug)
      .build();

    // Add additional event handlers for debugging
    this.hubConnection.onclose((error) => {
      console.log('🔴 SignalR connection closed:', error);
      this.isConnected$.next(false);
    });

    this.hubConnection.onreconnecting((error) => {
      console.log('🟡 SignalR reconnecting:', error);
      this.isConnected$.next(false);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('🟢 SignalR reconnected:', connectionId);
      this.isConnected$.next(true);
    });

    this.setupEventListeners();

    console.log('🚀 Starting SignalR connection...');
    return this.hubConnection.start()
      .then(() => {
        console.log('✅ SignalR connection started successfully');
        console.log('Connection ID:', this.hubConnection?.connectionId);
        console.log('Connection state:', this.hubConnection?.state);
        this.isConnected$.next(true);
      })
      .catch((err: any) => {
        console.error('❌ SignalR connection failed:', err);
        console.log('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        
        this.isConnected$.next(false);
        
        // Enhanced error handling
        if (err.message && err.message.includes('401')) {
          console.error('🔐 Authentication failed: Token might be invalid or expired');
          throw new Error('Authentication failed: Please login again');
        }
        
        throw err;
      });
  }

  public stopConnection(): Promise<void> {
    if (this.hubConnection) {
      return this.hubConnection.stop().then(() => {
        this.isConnected$.next(false);
        console.log('SignalR connection stopped');
      });
    }
    return Promise.resolve();
  }

  private setupEventListeners(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      this.messageReceived$.next(message);
    });

    this.hubConnection.on('UserStatusChanged', (data: { userId: number; isOnline: boolean }) => {
      this.userStatusChanged$.next(data);
    });

    this.hubConnection.on('UserTyping', (data: TypingIndicator) => {
      this.userTyping$.next(data);
    });

    this.hubConnection.on('ConversationsUpdated', () => {
      this.conversationsUpdated$.next(true);
    });

    this.hubConnection.on('MessagesRead', (data: { conversationId: number; userId: number }) => {
      this.messagesRead$.next(data);
    });

    this.hubConnection.on('Error', (error: string) => {
      console.error('SignalR error:', error);
    });

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.isConnected$.next(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.isConnected$.next(true);
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed');
      this.isConnected$.next(false);
    });
  }

  // Public methods to send messages to the hub
  public async sendMessage(conversationId: number, content: string, type: number = 0): Promise<void> {
    if (this.hubConnection && this.isConnected$.value) {
      await this.hubConnection.invoke('SendMessage', {
        conversationId,
        content,
        type
      });
    }
  }

  public async joinConversation(conversationId: number): Promise<void> {
    if (this.hubConnection && this.isConnected$.value) {
      await this.hubConnection.invoke('JoinConversation', conversationId);
    }
  }

  public async leaveConversation(conversationId: number): Promise<void> {
    if (this.hubConnection && this.isConnected$.value) {
      await this.hubConnection.invoke('LeaveConversation', conversationId);
    }
  }

  public async startTyping(conversationId: number): Promise<void> {
    if (this.hubConnection && this.isConnected$.value) {
      await this.hubConnection.invoke('StartTyping', conversationId);
    }
  }

  public async stopTyping(conversationId: number): Promise<void> {
    if (this.hubConnection && this.isConnected$.value) {
      await this.hubConnection.invoke('StopTyping', conversationId);
    }
  }

  // Observables for components to subscribe to
  public get isConnected(): Observable<boolean> {
    return this.isConnected$.asObservable();
  }

  public get messageReceived(): Observable<Message | null> {
    return this.messageReceived$.asObservable();
  }

  public get userStatusChanged(): Observable<{ userId: number; isOnline: boolean } | null> {
    return this.userStatusChanged$.asObservable();
  }

  public get userTyping(): Observable<TypingIndicator | null> {
    return this.userTyping$.asObservable();
  }

  public get conversationsUpdated(): Observable<boolean> {
    return this.conversationsUpdated$.asObservable();
  }

  public get messagesRead(): Observable<{ conversationId: number; userId: number } | null> {
    return this.messagesRead$.asObservable();
  }
}
