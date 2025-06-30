import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { SignalRService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Conversation, Message, User, MessageType } from '../../models/chat.models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // Component state
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  availableUsers: User[] = [];
  currentUser: User | null = null;
  
  // UI state
  isSidebarOpen = true;
  isLoading = false;
  isConnected = false;
  isTyping = false;
  typingUsers: Set<number> = new Set();
  showUserList = false;
  showCreateGroupModal = false;
  
  // Form inputs
  messageText = '';
  newConversationTitle = '';
  selectedUserIds: number[] = [];
  searchUserText = '';
  
  // Typing indicator
  private typingSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Message pagination
  private currentPage = 1;
  private pageSize = 50;
  private hasMoreMessages = true;

  get hasMoreMessagesPublic() {
    return this.hasMoreMessages;
  }

  constructor(
    private chatService: ChatService,
    private signalRService: SignalRService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeChat();
    this.setupTypingIndicator();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalRService.stopConnection();
  }

  ngAfterViewChecked(): void {
    // Only auto-scroll to bottom on initial load (when page is 1 and messages exist)
    if (this.currentPage === 2 && this.messages.length > 0 && this.selectedConversation) {
      this.scrollToBottom();
    }
  }

  private async initializeChat(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Get current user
      this.currentUser = this.authService.currentUserValue;
      if (!this.currentUser) {
        console.error('No current user found');
        return;
      }

      // Initialize SignalR connection
      const token = this.authService.tokenValue;
      if (token) {
        await this.signalRService.startConnection(token);
        this.setupSignalREventHandlers();
      }
      
      // Load conversations and users
      await Promise.all([
        this.loadConversations(),
        this.loadAvailableUsers()
      ]);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private setupSignalREventHandlers(): void {
    // Connection status
    this.signalRService.isConnected
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected: boolean) => {
        this.isConnected = connected;
      });

    // New messages
    this.signalRService.messageReceived
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message) {
          this.handleNewMessage(message);
        }
      });

    // User status changes
    this.signalRService.userStatusChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        if (status) {
          this.handleUserStatusChange(status);
        }
      });

    // Typing indicators
    this.signalRService.userTyping
      .pipe(takeUntil(this.destroy$))
      .subscribe(typing => {
        if (typing) {
          this.handleTypingIndicator(typing);
        }
      });

    // Messages read
    this.signalRService.messagesRead
      .pipe(takeUntil(this.destroy$))
      .subscribe(read => {
        if (read) {
          this.handleMessagesRead(read);
        }
      });

    // Conversation updates
    this.signalRService.conversationsUpdated
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadConversations();
      });
  }

  private setupTypingIndicator(): void {
    this.typingSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(text => {
        if (this.selectedConversation) {
          if (text.length > 0 && !this.isTyping) {
            this.isTyping = true;
            this.signalRService.startTyping(this.selectedConversation.id);
          } else if (text.length === 0 && this.isTyping) {
            this.isTyping = false;
            this.signalRService.stopTyping(this.selectedConversation.id);
          }
        }
      });

    // Stop typing after 3 seconds of inactivity
    this.typingSubject
      .pipe(
        debounceTime(3000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.isTyping && this.selectedConversation) {
          this.isTyping = false;
          this.signalRService.stopTyping(this.selectedConversation.id);
        }
      });
  }

  private async loadConversations(): Promise<void> {
    try {
      this.conversations = await this.chatService.getConversations().toPromise() || [];
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  private async loadAvailableUsers(): Promise<void> {
    try {
      this.availableUsers = await this.chatService.getAvailableUsers().toPromise() || [];
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async selectConversation(conversation: Conversation): Promise<void> {
    if (this.selectedConversation?.id === conversation.id) return;
    
    // Leave previous conversation
    if (this.selectedConversation) {
      await this.signalRService.leaveConversation(this.selectedConversation.id);
    }
    
    this.selectedConversation = conversation;
    this.messages = [];
    this.currentPage = 1;
    this.hasMoreMessages = true;
    
    // Join new conversation and load messages
    await this.signalRService.joinConversation(conversation.id);
    await this.loadMessages();
    
    // Mark messages as read
    this.chatService.markAsRead(conversation.id).subscribe();
    conversation.unreadCount = 0;
  }

  private async loadMessages(): Promise<void> {
    if (!this.selectedConversation || !this.hasMoreMessages) return;
    
    try {
      // Store current scroll position for maintaining scroll when loading older messages
      const container = this.messagesContainer?.nativeElement;
      const scrollHeight = container?.scrollHeight || 0;
      
      const newMessages = await this.chatService.getMessages(
        this.selectedConversation.id,
        this.currentPage,
        this.pageSize
      ).toPromise() || [];
      
      if (newMessages.length < this.pageSize) {
        this.hasMoreMessages = false;
      }
      
      // Prepend older messages to the beginning (older messages appear at top)
      // Ensure isOwnMessage is correctly set for loaded messages
      const messagesWithCorrectOwnership = newMessages.map(msg => ({
        ...msg,
        isOwnMessage: this.currentUser ? msg.senderId === this.currentUser.id : false
      }));
      
      this.messages = [...messagesWithCorrectOwnership, ...this.messages];
      this.currentPage++;
      
      // Maintain scroll position when loading older messages (only for page > 1)
      if (this.currentPage > 2 && container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight - scrollHeight;
        }, 0);
      }
      
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async sendMessage(): Promise<void> {
    if (!this.messageText.trim() || !this.selectedConversation) return;
    
    try {
      await this.signalRService.sendMessage(
        this.selectedConversation.id,
        this.messageText.trim(),
        MessageType.Text
      );
      
      this.messageText = '';
      this.isTyping = false;
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  onMessageInput(): void {
    this.typingSubject.next(this.messageText);
  }

  async createDirectConversation(user: User): Promise<void> {
    try {
      const conversation = await this.chatService.createDirectConversation(user.id).toPromise();
      if (conversation) {
        this.conversations.unshift(conversation);
        await this.selectConversation(conversation);
        this.showUserList = false;
      }
    } catch (error) {
      console.error('Error creating direct conversation:', error);
    }
  }

  async createGroupConversation(): Promise<void> {
    if (!this.newConversationTitle.trim() || this.selectedUserIds.length === 0) return;
    
    try {
      const conversation = await this.chatService.createConversation({
        title: this.newConversationTitle,
        participantIds: this.selectedUserIds,
        isGroup: true
      }).toPromise();
      
      if (conversation) {
        this.conversations.unshift(conversation);
        await this.selectConversation(conversation);
        this.closeCreateGroupModal();
      }
    } catch (error) {
      console.error('Error creating group conversation:', error);
    }
  }

  toggleUserSelection(userId: number): void {
    const index = this.selectedUserIds.indexOf(userId);
    if (index > -1) {
      this.selectedUserIds.splice(index, 1);
    } else {
      this.selectedUserIds.push(userId);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserIds.includes(userId);
  }

  getFilteredUsers(): User[] {
    if (!this.searchUserText.trim()) return this.availableUsers;
    
    const search = this.searchUserText.toLowerCase();
    return this.availableUsers.filter(user =>
      user.nom.toLowerCase().includes(search) ||
      user.prenom.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  }

  openCreateGroupModal(): void {
    this.showCreateGroupModal = true;
    this.newConversationTitle = '';
    this.selectedUserIds = [];
  }

  closeCreateGroupModal(): void {
    this.showCreateGroupModal = false;
    this.newConversationTitle = '';
    this.selectedUserIds = [];
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleUserList(): void {
    this.showUserList = !this.showUserList;
  }

  private handleNewMessage(message: Message): void {
    // Correctly set isOwnMessage based on current user
    if (this.currentUser) {
      message.isOwnMessage = message.senderId === this.currentUser.id;
    }
    
    // Add message to current conversation if it matches
    if (this.selectedConversation && message.conversationId === this.selectedConversation.id) {
      this.messages.push(message);
      // Scroll to bottom for new messages
      setTimeout(() => this.scrollToBottom(), 0);
    }
    
    // Update conversation list
    const conversation = this.conversations.find(c => c.id === message.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = message.sentAt;
      
      // Increment unread count if not current conversation
      if (!this.selectedConversation || this.selectedConversation.id !== message.conversationId) {
        conversation.unreadCount++;
      }
      
      // Move conversation to top
      this.conversations = [conversation, ...this.conversations.filter(c => c.id !== conversation.id)];
    }
  }

  private handleUserStatusChange(status: { userId: number; isOnline: boolean }): void {
    // Update user status in conversations and available users
    this.conversations.forEach(conv => {
      const participant = conv.participants.find(p => p.id === status.userId);
      if (participant) {
        participant.isOnline = status.isOnline;
      }
    });
    
    const user = this.availableUsers.find(u => u.id === status.userId);
    if (user) {
      user.isOnline = status.isOnline;
    }
  }

  private handleTypingIndicator(typing: { conversationId: number; userId: number; isTyping: boolean }): void {
    if (!this.selectedConversation || this.selectedConversation.id !== typing.conversationId) {
      return;
    }
    
    if (typing.isTyping) {
      this.typingUsers.add(typing.userId);
    } else {
      this.typingUsers.delete(typing.userId);
    }
  }

  private handleMessagesRead(read: { conversationId: number; userId: number }): void {
    // Update read status for messages in current conversation
    if (this.selectedConversation && this.selectedConversation.id === read.conversationId) {
      this.messages.forEach(message => {
        if (!message.readByUserIds.includes(read.userId)) {
          message.readByUserIds.push(read.userId);
        }
      });
    }
  }

  getTypingUsersText(): string {
    if (this.typingUsers.size === 0) return '';
    
    const typingUserNames = Array.from(this.typingUsers)
      .map(userId => {
        const user = this.selectedConversation?.participants.find(p => p.id === userId);
        return user ? `${user.prenom} ${user.nom}` : 'Someone';
      });
    
    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing...`;
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`;
    } else {
      return `${typingUserNames.length} people are typing...`;
    }
  }

  formatMessageTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatConversationTime(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  getConversationTitle(conversation: Conversation): string {
    if (conversation.isGroup || conversation.title) {
      return conversation.title;
    }
    
    // For direct conversations, show the other participant's name
    const otherParticipant = conversation.participants.find(p => p.id !== this.currentUser?.id);
    return otherParticipant ? `${otherParticipant.prenom} ${otherParticipant.nom}` : 'Unknown';
  }

  getConversationAvatar(conversation: Conversation): string {
    if (conversation.isGroup) {
      return conversation.title.substring(0, 2).toUpperCase();
    }
    
    const otherParticipant = conversation.participants.find(p => p.id !== this.currentUser?.id);
    if (otherParticipant) {
      return `${otherParticipant.prenom.charAt(0)}${otherParticipant.nom.charAt(0)}`.toUpperCase();
    }
    
    return 'U';
  }

  getUserAvatar(user: User): string {
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async loadMoreMessages(): Promise<void> {
    if (this.hasMoreMessages && !this.isLoading) {
      this.isLoading = true;
      await this.loadMessages();
      this.isLoading = false;
    }
  }

  getTotalUnreadCount(): number {
    return this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }
}
