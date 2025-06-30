import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ChatService } from '../../services/chat.service';
import { SignalRService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { Conversation, Message, User, MessageType, TypingIndicator } from '../../models/chat.models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  availableUsers: User[] = [];
  currentMessage = '';
  loading = false;
  isConnected = false;
  showUserList = false;
  typingUsers: Map<number, Set<number>> = new Map();
  currentUserId: number = 0;

  private subscriptions: Subscription[] = [];
  private typingTimeout: any;
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private signalRService: SignalRService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.currentUserId = this.getCurrentUserId();
    
    // Diagnostic du token avant la connexion SignalR
    await this.diagnosticAuthentication();
    
    await this.initializeSignalR();
    this.loadConversations();
    this.loadAvailableUsers();
    this.setupSignalRSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.signalRService.stopConnection();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private async initializeSignalR() {
    try {
      // Check if user is authenticated
      if (!this.authService.isAuthenticated) {
        console.error('❌ User is not authenticated. Cannot connect to SignalR.');
        this.redirectToLogin();
        return;
      }

      // Check if token is valid and not expired
      if (!this.authService.isTokenValid()) {
        console.error('❌ Authentication token is invalid or expired.');
        const expirationDate = this.authService.getTokenExpirationDate();
        console.log('Token expiration date:', expirationDate);
        console.log('Current time:', new Date());
        
        // Token is expired, redirect to login
        this.redirectToLogin();
        return;
      }

      const token = localStorage.getItem('token') || '';
      console.log('✅ Token is valid, attempting SignalR connection...');
      console.log('Token expiration:', this.authService.getTokenExpirationDate());
      
      if (!token) {
        console.error('❌ No authentication token found. User might not be logged in.');
        this.redirectToLogin();
        return;
      }
      
      await this.signalRService.startConnection(token);
    } catch (error) {
      console.error('❌ Failed to connect to SignalR:', error);
      // If authentication fails, user might need to re-login
      const errorString = error instanceof Error ? error.message : String(error);
      if (errorString.includes('401') || errorString.includes('Unauthorized')) {
        console.warn('🔐 Authentication failed. Token might be expired. Redirecting to login...');
        this.redirectToLogin();
      }
    }
  }

  private redirectToLogin() {
    console.log('🔄 Redirecting to login due to authentication issues...');
    // Clear expired token
    this.authService.logout();
    
    // Show user-friendly message
    alert('Votre session a expiré. Vous allez être redirigé vers la page de connexion.');
    
    // Redirect to login page (adjust the route as needed)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private setupSignalRSubscriptions() {
    // Connection status
    this.subscriptions.push(
      this.signalRService.isConnected.subscribe(connected => {
        this.isConnected = connected;
      })
    );

    // New messages
    this.subscriptions.push(
      this.signalRService.messageReceived.subscribe(message => {
        if (message) {
          this.handleNewMessage(message);
        }
      })
    );

    // User status changes
    this.subscriptions.push(
      this.signalRService.userStatusChanged.subscribe(status => {
        if (status) {
          this.handleUserStatusChange(status.userId, status.isOnline);
        }
      })
    );

    // Typing indicators
    this.subscriptions.push(
      this.signalRService.userTyping.subscribe(typing => {
        if (typing) {
          this.handleTypingIndicator(typing);
        }
      })
    );

    // Conversations updated
    this.subscriptions.push(
      this.signalRService.conversationsUpdated.subscribe(updated => {
        if (updated) {
          this.loadConversations();
        }
      })
    );

    // Messages read
    this.subscriptions.push(
      this.signalRService.messagesRead.subscribe(data => {
        if (data && this.selectedConversation && data.conversationId === this.selectedConversation.id) {
          this.updateMessageReadStatus(data.userId);
        }
      })
    );
  }

  private loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
      }
    });
  }

  private loadAvailableUsers() {
    this.chatService.getAvailableUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  selectConversation(conversation: Conversation) {
    if (this.selectedConversation) {
      this.signalRService.leaveConversation(this.selectedConversation.id);
    }

    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
    this.signalRService.joinConversation(conversation.id);
    this.markAsRead(conversation.id);
  }

  private loadMessages(conversationId: number) {
    this.loading = true;
    this.chatService.getMessages(conversationId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.shouldScrollToBottom = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.loading = false;
      }
    });
  }

  async sendMessage() {
    if (!this.currentMessage.trim() || !this.selectedConversation) return;

    const message = this.currentMessage.trim();
    this.currentMessage = '';

    try {
      await this.signalRService.sendMessage(
        this.selectedConversation.id,
        message,
        MessageType.Text
      );
    } catch (error) {
      console.error('Error sending message:', error);
      this.currentMessage = message; // Restore message on error
    }
  }

  onTyping() {
    if (!this.selectedConversation) return;

    this.signalRService.startTyping(this.selectedConversation.id);

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.signalRService.stopTyping(this.selectedConversation!.id);
    }, 2000);
  }

  async startDirectConversation(user: User) {
    try {
      const conversation = await this.chatService.createDirectConversation(user.id).toPromise();
      if (conversation) {
        this.conversations.unshift(conversation);
        this.selectConversation(conversation);
        this.showUserList = false;
      }
    } catch (error) {
      console.error('Error creating direct conversation:', error);
    }
  }

  private handleNewMessage(message: Message) {
    // Update conversations list
    const conversation = this.conversations.find(c => c.id === message.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = message.sentAt;
      
      if (!message.isOwnMessage) {
        conversation.unreadCount++;
      }

      // Move conversation to top
      this.conversations = [
        conversation,
        ...this.conversations.filter(c => c.id !== message.conversationId)
      ];
    }

    // Add to current messages if viewing this conversation
    if (this.selectedConversation && message.conversationId === this.selectedConversation.id) {
      this.messages.push(message);
      this.shouldScrollToBottom = true;
      
      if (!message.isOwnMessage) {
        this.markAsRead(message.conversationId);
      }
    }
  }

  private handleUserStatusChange(userId: number, isOnline: boolean) {
    // Update user status in conversations
    this.conversations.forEach(conversation => {
      const participant = conversation.participants.find(p => p.id === userId);
      if (participant) {
        participant.isOnline = isOnline;
      }
    });

    // Update in available users
    const user = this.availableUsers.find(u => u.id === userId);
    if (user) {
      user.isOnline = isOnline;
    }
  }

  private handleTypingIndicator(typing: TypingIndicator) {
    if (!this.typingUsers.has(typing.conversationId)) {
      this.typingUsers.set(typing.conversationId, new Set());
    }

    const conversationTyping = this.typingUsers.get(typing.conversationId)!;
    
    if (typing.isTyping) {
      conversationTyping.add(typing.userId);
    } else {
      conversationTyping.delete(typing.userId);
    }
  }

  private updateMessageReadStatus(userId: number) {
    this.messages.forEach(message => {
      if (!message.readByUserIds.includes(userId)) {
        message.readByUserIds.push(userId);
      }
    });
  }

  private markAsRead(conversationId: number) {
    this.chatService.markAsRead(conversationId).subscribe({
      next: () => {
        // Update unread count locally
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.unreadCount = 0;
        }
      },
      error: (error) => {
        console.error('Error marking as read:', error);
      }
    });
  }

  private scrollToBottom() {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private getCurrentUserId(): number {
    // This should come from your authentication service
    // For now, we'll try to get it from localStorage or token
    const userIdStr = localStorage.getItem('userId');
    return userIdStr ? parseInt(userIdStr) : 0;
  }

  getTypingText(conversationId: number): string {
    const typingUserIds = this.typingUsers.get(conversationId);
    if (!typingUserIds || typingUserIds.size === 0) return '';

    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) return '';

    const typingUserNames = Array.from(typingUserIds)
      .map(userId => {
        const user = conversation.participants.find(p => p.id === userId);
        return user ? user.prenom : 'Someone';
      })
      .filter(name => name !== 'Someone');

    if (typingUserNames.length === 0) return '';
    if (typingUserNames.length === 1) return `${typingUserNames[0]} is typing...`;
    if (typingUserNames.length === 2) return `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`;
    return `${typingUserNames[0]} and ${typingUserNames.length - 1} others are typing...`;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date: Date): string {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  shouldShowDateDivider(index: number): boolean {
    if (index === 0) return true;
    
    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];
    
    const currentDate = new Date(currentMessage.sentAt).toDateString();
    const previousDate = new Date(previousMessage.sentAt).toDateString();
    
    return currentDate !== previousDate;
  }

  getConversationTitle(conversation: Conversation): string {
    if (conversation.isGroup || conversation.title) {
      return conversation.title;
    }
    
    const otherParticipant = conversation.participants.find(p => p.id !== this.currentUserId);
    return otherParticipant ? `${otherParticipant.prenom} ${otherParticipant.nom}` : 'Conversation';
  }

  getConversationAvatar(conversation: Conversation): string {
    if (conversation.isGroup) {
      return 'assets/group-avatar.png';
    }
    
    const otherParticipant = conversation.participants.find(p => p.id !== this.currentUserId);
    return otherParticipant ? `https://ui-avatars.com/api/?name=${otherParticipant.prenom}+${otherParticipant.nom}&background=6366f1&color=ffffff` : 'assets/default-avatar.png';
  }

  getUserAvatar(user: User): string {
    return `https://ui-avatars.com/api/?name=${user.prenom}+${user.nom}&background=6366f1&color=ffffff`;
  }

  private async diagnosticAuthentication() {
    console.log('=== DIAGNOSTIC AUTHENTICATION ===');
    console.log('User authenticated:', this.authService.isAuthenticated);
    console.log('Token valid:', this.authService.isTokenValid());
    console.log('Token expiration:', this.authService.getTokenExpirationDate());
    console.log('Current user:', this.authService.currentUserValue);
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');
      
      // Test d'un appel API simple pour vérifier l'authentification
      try {
        const response = await fetch('http://localhost:5256/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('API test response status:', response.status);
        if (response.ok) {
          console.log('✅ Token is valid for API calls');
        } else {
          console.log('❌ Token failed API authentication:', response.statusText);
        }
      } catch (error) {
        console.log('❌ API test failed:', error);
      }
    } else {
      console.log('❌ No token found in localStorage');
    }
    console.log('=== END DIAGNOSTIC ===');
  }
}
