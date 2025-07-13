import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { SignalRService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import {
  Conversation,
  Message,
  User,
  MessageType,
} from '../../models/chat.models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

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
  showScrollToBottomButton = false;

  // Form inputs
  messageText = '';
  newConversationTitle = '';
  selectedUserIds: number[] = [];
  searchUserText = '';

  // File attachment
  selectedFiles: File[] = [];
  isDragOver = false;
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel', // Another possible CSV type
  ];

  // Allowed file extensions (as fallback for CSV and other files)
  allowedFileExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.txt',
    '.csv',
  ];

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
    if (
      this.currentPage === 2 &&
      this.messages.length > 0 &&
      this.selectedConversation
    ) {
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
      await Promise.all([this.loadConversations(), this.loadAvailableUsers()]);
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
      .subscribe((message) => {
        if (message) {
          this.handleNewMessage(message);
        }
      });

    // User status changes
    this.signalRService.userStatusChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        if (status) {
          this.handleUserStatusChange(status);
        }
      });

    // Typing indicators
    this.signalRService.userTyping
      .pipe(takeUntil(this.destroy$))
      .subscribe((typing) => {
        if (typing) {
          this.handleTypingIndicator(typing);
        }
      });

    // Messages read
    this.signalRService.messagesRead
      .pipe(takeUntil(this.destroy$))
      .subscribe((read) => {
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
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((text) => {
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
      .pipe(debounceTime(3000), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isTyping && this.selectedConversation) {
          this.isTyping = false;
          this.signalRService.stopTyping(this.selectedConversation.id);
        }
      });
  }

  private async loadConversations(): Promise<void> {
    try {
      this.conversations =
        (await this.chatService.getConversations().toPromise()) || [];
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  private async loadAvailableUsers(): Promise<void> {
    try {
      this.availableUsers =
        (await this.chatService.getAvailableUsers().toPromise()) || [];
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

      const newMessages =
        (await this.chatService
          .getMessages(
            this.selectedConversation.id,
            this.currentPage,
            this.pageSize
          )
          .toPromise()) || [];

      if (newMessages.length < this.pageSize) {
        this.hasMoreMessages = false;
      }

      // Prepend older messages to the beginning (older messages appear at top)
      // Ensure isOwnMessage is correctly set for loaded messages
      const messagesWithCorrectOwnership = newMessages.map((msg) => ({
        ...msg,
        isOwnMessage: this.currentUser
          ? msg.senderId === this.currentUser.id
          : false,
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
    if (
      (!this.messageText.trim() && this.selectedFiles.length === 0) ||
      !this.selectedConversation
    )
      return;

    console.log(
      '💬 Send message called - Text:',
      this.messageText.trim(),
      'Files:',
      this.selectedFiles.length
    );

    try {
      // Send text message if there's text
      if (this.messageText.trim()) {
        console.log('📝 Sending text message...');
        await this.signalRService.sendMessage(
          this.selectedConversation.id,
          this.messageText.trim(),
          MessageType.Text
        );
      }

      // Send file attachments
      if (this.selectedFiles.length > 0) {
        console.log('📎 Sending', this.selectedFiles.length, 'file(s)...');
        for (const file of this.selectedFiles) {
          await this.sendFileMessage(file);
        }
      }

      this.messageText = '';
      this.selectedFiles = [];
      this.isTyping = false;

      // Scroll to bottom after sending message
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  async sendFileMessage(file: File): Promise<void> {
    try {
      console.log(
        '🔗 Starting file upload for:',
        file.name,
        'Size:',
        file.size,
        'Type:',
        file.type
      );

      // Check if conversation is selected
      if (!this.selectedConversation) {
        console.error('❌ No conversation selected');
        alert('Please select a conversation first');
        return;
      }

      // Check if SignalR is connected
      if (!this.isConnected) {
        console.error('❌ SignalR not connected');
        alert('Connection lost. Please refresh the page and try again.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Uploading file to server...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        conversationId: this.selectedConversation.id,
      });

      // Upload file via chat service
      try {
        const uploadResponse = await this.chatService
          .uploadFileMessage(formData)
          .toPromise();

        console.log('✅ File upload successful:', uploadResponse);

        if (uploadResponse?.fileUrl) {
          // Determine message type based on file type
          const messageType = file.type.startsWith('image/')
            ? MessageType.Image
            : MessageType.File;

          console.log('📨 Sending message via SignalR...', {
            conversationId: this.selectedConversation.id,
            messageType,
            fileUrl: uploadResponse.fileUrl,
            fileName: file.name,
            fileSize: file.size,
          });

          await this.signalRService.sendMessage(
            this.selectedConversation.id,
            file.name, // This will be the content/caption
            messageType,
            uploadResponse.fileUrl,
            file.name,
            file.size
          );

          console.log('✅ Message sent successfully via SignalR!');
        } else {
          console.error(
            '❌ No file URL received from upload response:',
            uploadResponse
          );
          throw new Error('Upload response missing fileUrl');
        }
      } catch (uploadError: any) {
        console.error('❌ File upload failed:', uploadError);

        // Provide more specific error messages
        let errorMessage = 'Unknown error';

        if (uploadError?.error) {
          if (typeof uploadError.error === 'string') {
            errorMessage = uploadError.error;
          } else if (uploadError.error.error) {
            errorMessage = uploadError.error.error;
          } else if (uploadError.error.message) {
            errorMessage = uploadError.error.message;
          }
        } else if (uploadError?.message) {
          errorMessage = uploadError.message;
        } else if (uploadError?.status) {
          switch (uploadError.status) {
            case 0:
              errorMessage =
                'Cannot connect to server. Please check if the backend is running.';
              break;
            case 401:
              errorMessage = 'Authentication failed. Please log in again.';
              break;
            case 413:
              errorMessage = 'File too large. Maximum size is 10MB.';
              break;
            case 415:
              errorMessage = 'File type not supported.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = `Server error (${uploadError.status}): ${
                uploadError.statusText || 'Unknown error'
              }`;
          }
        }

        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Error in sendFileMessage:', error);

      // Show user-friendly error message
      const userMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to send file: ${userMessage}`);
    }
  }

  onFileSelected(event: Event): void {
    console.log('📁 File input triggered');
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      console.log('❌ No files found in input');
      return;
    }

    console.log('📁 Files selected:', input.files.length);
    const filesArray = Array.from(input.files);

    console.log(
      '📎 Files to process:',
      filesArray.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }))
    );

    this.addFiles(filesArray);

    // Reset input to allow selecting the same file again
    input.value = '';
  }

  addFiles(files: File[]): void {
    console.log('📎 Adding files:', files.length);
    for (const file of files) {
      console.log(
        '🔍 Validating file:',
        file.name,
        'Type:',
        file.type,
        'Size:',
        file.size
      );
      if (this.validateFile(file)) {
        this.selectedFiles.push(file);
        console.log('✅ File added to selection:', file.name);
      } else {
        console.log('❌ File validation failed:', file.name);
      }
    }
    console.log('📎 Total selected files:', this.selectedFiles.length);
  }

  validateFile(file: File): boolean {
    console.log('🔍 Validating file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      maxAllowed: this.maxFileSize,
    });

    // Check file size
    if (file.size > this.maxFileSize) {
      const maxSizeMB = this.maxFileSize / (1024 * 1024);
      const fileSizeMB = file.size / (1024 * 1024);
      console.warn(
        `❌ File "${file.name}" is too large: ${fileSizeMB.toFixed(
          2
        )}MB. Maximum size is ${maxSizeMB}MB.`
      );
      alert(
        `File "${file.name}" is too large (${fileSizeMB.toFixed(
          2
        )}MB). Maximum size allowed is ${maxSizeMB}MB.`
      );
      return false;
    }

    // Get file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    console.log('📋 File extension:', fileExtension);

    // Check file type (MIME type OR extension)
    const isMimeTypeAllowed = this.allowedFileTypes.includes(file.type);
    const isExtensionAllowed =
      this.allowedFileExtensions.includes(fileExtension);

    console.log('🔍 Validation checks:', {
      mimeType: file.type,
      isMimeTypeAllowed,
      extension: fileExtension,
      isExtensionAllowed,
    });

    if (!isMimeTypeAllowed && !isExtensionAllowed) {
      console.warn(
        `❌ File type "${file.type}" and extension "${fileExtension}" are not allowed for file "${file.name}".`
      );
      console.log('📋 Allowed MIME types:', this.allowedFileTypes);
      console.log('📋 Allowed extensions:', this.allowedFileExtensions);
      alert(
        `File type "${file.type}" (${fileExtension}) is not allowed. Please select an image, PDF, document, or CSV file.`
      );
      return false;
    }

    // Check if file already selected
    if (
      this.selectedFiles.some(
        (f) => f.name === file.name && f.size === file.size
      )
    ) {
      console.warn(`⚠️ File "${file.name}" is already selected.`);
      return false;
    }

    console.log('✅ File validation passed for:', file.name);
    return true;
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  triggerFileInput(): void {
    console.log('🔗 Attachment button clicked');
    if (this.fileInput && this.fileInput.nativeElement) {
      console.log('📁 Triggering file input...');
      this.fileInput.nativeElement.click();
    } else {
      console.error('❌ File input element not found');
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(file: File): string {
    if (file.type.startsWith('image/')) {
      return 'fas fa-image';
    } else if (file.type === 'application/pdf') {
      return 'fas fa-file-pdf';
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return 'fas fa-file-word';
    } else if (
      file.type.includes('excel') ||
      file.type.includes('spreadsheet')
    ) {
      return 'fas fa-file-excel';
    } else if (file.type.startsWith('text/')) {
      return 'fas fa-file-alt';
    } else {
      return 'fas fa-file';
    }
  }

  getFullFileUrl(relativeUrl: string): string {
    return this.chatService.getFullFileUrl(relativeUrl);
  }

  getFileIconByType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'fas fa-image';
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fas fa-file-word';
      case 'xls':
      case 'xlsx':
        return 'fas fa-file-excel';
      case 'txt':
      case 'csv':
        return 'fas fa-file-alt';
      case 'zip':
      case 'rar':
        return 'fas fa-file-archive';
      default:
        return 'fas fa-file';
    }
  }

  openImageModal(imageUrl: string): void {
    // Simple image preview modal - can be enhanced with a proper modal component
    const modal = document.createElement('div');
    modal.className =
      'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer';
    modal.onclick = () => document.body.removeChild(modal);

    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'max-w-full max-h-full object-contain';

    modal.appendChild(img);
    document.body.appendChild(modal);
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  // Missing methods that are called in the component
  private scrollToBottom(smooth: boolean = true): void {
    if (this.messagesContainer?.nativeElement) {
      const element = this.messagesContainer.nativeElement;
      if (smooth) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        element.scrollTop = element.scrollHeight;
      }
    }
  }

  private isScrolledToBottom(): boolean {
    if (!this.messagesContainer?.nativeElement) return false;

    const element = this.messagesContainer.nativeElement;
    const threshold = 50; // Allow 50px threshold
    return (
      element.scrollHeight - element.clientHeight <=
      element.scrollTop + threshold
    );
  }

  onMessagesScroll(): void {
    this.showScrollToBottomButton = !this.isScrolledToBottom();
  }

  scrollToBottomManually(): void {
    this.scrollToBottom();
    this.showScrollToBottomButton = false;
  }

  private handleNewMessage(message: Message): void {
    if (message.conversationId === this.selectedConversation?.id) {
      const wasScrolledToBottom = this.isScrolledToBottom();

      // Ensure isOwnMessage is correctly set based on current user
      message.isOwnMessage = this.currentUser
        ? message.senderId === this.currentUser.id
        : false;

      this.messages.push(message);

      // Only auto-scroll if user was already at bottom or it's their own message
      if (wasScrolledToBottom || message.isOwnMessage) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    }
    // Update conversation list with new message
    this.loadConversations();
  }

  private handleUserStatusChange(status: {
    userId: number;
    isOnline: boolean;
  }): void {
    // Update user status in available users list
    const user = this.availableUsers.find((u) => u.id === status.userId);
    if (user) {
      user.isOnline = status.isOnline;
    }

    // Update status in conversation participants
    if (this.selectedConversation) {
      const participant = this.selectedConversation.participants.find(
        (p) => p.id === status.userId
      );
      if (participant) {
        participant.isOnline = status.isOnline;
      }
    }
  }

  private handleTypingIndicator(typing: any): void {
    if (typing.conversationId === this.selectedConversation?.id) {
      if (typing.isTyping) {
        this.typingUsers.add(typing.userId);
      } else {
        this.typingUsers.delete(typing.userId);
      }
    }
  }

  private handleMessagesRead(read: {
    conversationId: number;
    userId: number;
  }): void {
    if (read.conversationId === this.selectedConversation?.id) {
      // Update read status for messages
      this.messages.forEach((message) => {
        if (!message.readByUserIds.includes(read.userId)) {
          message.readByUserIds.push(read.userId);
        }
      });
    }
  }

  formatMessageTime(sentAt: Date): string {
    const date = new Date(sentAt);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  }

  getTotalUnreadCount(): number {
    return this.conversations.reduce(
      (total, conv) => total + conv.unreadCount,
      0
    );
  }

  getTypingUsersText(): string {
    const count = this.typingUsers.size;
    if (count === 1) {
      return 'typing...';
    } else if (count > 1) {
      return `${count} people typing...`;
    }
    return '';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleUserList(): void {
    this.showUserList = !this.showUserList;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Template helper methods
  getConversationAvatar(conversation: Conversation): string {
    if (conversation.isGroup) {
      return conversation.title.charAt(0).toUpperCase();
    } else {
      // For direct conversations, get the other participant's name
      const otherParticipant = conversation.participants.find(
        (p) => p.id !== this.currentUser?.id
      );
      return otherParticipant
        ? `${otherParticipant.prenom.charAt(0)}${otherParticipant.nom.charAt(
            0
          )}`.toUpperCase()
        : '?';
    }
  }

  getConversationTitle(conversation: Conversation): string {
    if (conversation.isGroup) {
      return conversation.title;
    } else {
      // For direct conversations, show the other participant's name
      const otherParticipant = conversation.participants.find(
        (p) => p.id !== this.currentUser?.id
      );
      return otherParticipant
        ? `${otherParticipant.prenom} ${otherParticipant.nom}`
        : 'Unknown User';
    }
  }

  formatConversationTime(date: Date): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours =
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else if (diffInHours < 168) {
      // Less than a week
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  loadMoreMessages(): void {
    this.loadMessages();
  }

  onMessageInput(): void {
    this.typingSubject.next(this.messageText);
  }

  // User list and group management methods
  openCreateGroupModal(): void {
    this.showCreateGroupModal = true;
    this.selectedUserIds = [];
    this.newConversationTitle = '';
  }

  closeCreateGroupModal(): void {
    this.showCreateGroupModal = false;
    this.selectedUserIds = [];
    this.newConversationTitle = '';
  }

  getFilteredUsers(): User[] {
    if (!this.searchUserText.trim()) {
      return this.availableUsers.filter(
        (user) => user.id !== this.currentUser?.id
      );
    }

    const searchTerm = this.searchUserText.toLowerCase();
    return this.availableUsers.filter(
      (user) =>
        user.id !== this.currentUser?.id &&
        (user.nom.toLowerCase().includes(searchTerm) ||
          user.prenom.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm))
    );
  }

  async createDirectConversation(user: User): Promise<void> {
    try {
      const conversation = await this.chatService
        .createDirectConversation(user.id)
        .toPromise();
      if (conversation) {
        this.conversations.unshift(conversation);
        await this.selectConversation(conversation);
        this.showUserList = false;
      }
    } catch (error) {
      console.error('Error creating direct conversation:', error);
    }
  }

  getUserAvatar(user: User): string {
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserIds.includes(userId);
  }

  toggleUserSelection(userId: number): void {
    const index = this.selectedUserIds.indexOf(userId);
    if (index > -1) {
      this.selectedUserIds.splice(index, 1);
    } else {
      this.selectedUserIds.push(userId);
    }
  }

  async createGroupConversation(): Promise<void> {
    if (
      this.selectedUserIds.length === 0 ||
      !this.newConversationTitle.trim()
    ) {
      return;
    }

    try {
      const createDto = {
        title: this.newConversationTitle.trim(),
        participantIds: this.selectedUserIds,
        isGroup: true,
      };

      const conversation = await this.chatService
        .createConversation(createDto)
        .toPromise();
      if (conversation) {
        this.conversations.unshift(conversation);
        await this.selectConversation(conversation);
        this.closeCreateGroupModal();
      }
    } catch (error) {
      console.error('Error creating group conversation:', error);
    }
  }

  // Performance optimization for message list
  trackMessage(index: number, message: Message): number {
    return message.id;
  }
}
