import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { env } from '../config/env';

/**
 * Collaboration event types
 */
export interface CollaborationEvents {
  'note:join': (noteId: string) => void;
  'note:leave': (noteId: string) => void;
  'note:update': (data: NoteUpdateData) => void;
  'note:cursor': (data: CursorData) => void;
  'note:selection': (data: SelectionData) => void;
  'user:typing': (data: TypingData) => void;
  'user:active': (userId: string) => void;
}

/**
 * Note update data
 */
export interface NoteUpdateData {
  noteId: string;
  userId: string;
  content: string;
  timestamp: number;
  cursor?: number;
}

/**
 * Cursor position data
 */
export interface CursorData {
  noteId: string;
  userId: string;
  userName: string;
  position: number;
  color: string;
}

/**
 * Selection range data
 */
export interface SelectionData {
  noteId: string;
  userId: string;
  userName: string;
  start: number;
  end: number;
  color: string;
}

/**
 * Typing indicator data
 */
export interface TypingData {
  noteId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

/**
 * Connected user info
 */
export interface ConnectedUser {
  socketId: string;
  userId: string;
  userName: string;
  noteId?: string;
  color: string;
  lastActivity: number;
}

/**
 * WebSocket Service for Real-time Collaboration
 * Manages real-time features like collaborative editing, presence, and notifications
 */
export class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private noteRooms: Map<string, Set<string>> = new Map(); // noteId -> Set of socketIds
  private userColors: string[] = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];

  /**
   * Initialize WebSocket server
   * @param httpServer - HTTP server instance
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.SOCKET_CORS_ORIGIN || env.FRONTEND_URL,
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket server initialized');
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Authentication
      socket.on('authenticate', (data: { userId: string; userName: string }) => {
        this.handleAuthentication(socket, data);
      });

      // Note collaboration
      socket.on('note:join', (noteId: string) => {
        this.handleNoteJoin(socket, noteId);
      });

      socket.on('note:leave', (noteId: string) => {
        this.handleNoteLeave(socket, noteId);
      });

      socket.on('note:update', (data: NoteUpdateData) => {
        this.handleNoteUpdate(socket, data);
      });

      socket.on('note:cursor', (data: CursorData) => {
        this.handleCursorUpdate(socket, data);
      });

      socket.on('note:selection', (data: SelectionData) => {
        this.handleSelectionUpdate(socket, data);
      });

      // Typing indicators
      socket.on('user:typing', (data: TypingData) => {
        this.handleTypingIndicator(socket, data);
      });

      // Presence
      socket.on('user:active', () => {
        this.handleUserActivity(socket);
      });

      // Disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handle user authentication
   */
  private handleAuthentication(
    socket: Socket,
    data: { userId: string; userName: string }
  ): void {
    const color = this.assignUserColor();
    
    const user: ConnectedUser = {
      socketId: socket.id,
      userId: data.userId,
      userName: data.userName,
      color,
      lastActivity: Date.now()
    };

    this.connectedUsers.set(socket.id, user);
    
    socket.emit('authenticated', { color });
    console.log(`✅ User authenticated: ${data.userName} (${socket.id})`);
  }

  /**
   * Handle user joining a note
   */
  private handleNoteJoin(socket: Socket, noteId: string): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    // Join socket.io room
    socket.join(`note:${noteId}`);
    
    // Update user's current note
    user.noteId = noteId;
    user.lastActivity = Date.now();

    // Track room membership
    if (!this.noteRooms.has(noteId)) {
      this.noteRooms.set(noteId, new Set());
    }
    this.noteRooms.get(noteId)!.add(socket.id);

    // Notify others in the room
    const activeUsers = this.getActiveUsersInNote(noteId);
    
    socket.to(`note:${noteId}`).emit('user:joined', {
      userId: user.userId,
      userName: user.userName,
      color: user.color
    });

    // Send current active users to the joining user
    socket.emit('note:users', activeUsers);

    console.log(`📝 User ${user.userName} joined note: ${noteId}`);
  }

  /**
   * Handle user leaving a note
   */
  private handleNoteLeave(socket: Socket, noteId: string): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    socket.leave(`note:${noteId}`);
    user.noteId = undefined;

    // Remove from room tracking
    this.noteRooms.get(noteId)?.delete(socket.id);

    // Notify others
    socket.to(`note:${noteId}`).emit('user:left', {
      userId: user.userId,
      userName: user.userName
    });

    console.log(`📝 User ${user.userName} left note: ${noteId}`);
  }

  /**
   * Handle note content update
   */
  private handleNoteUpdate(socket: Socket, data: NoteUpdateData): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    user.lastActivity = Date.now();

    // Broadcast update to all users in the note except sender
    socket.to(`note:${data.noteId}`).emit('note:update', {
      ...data,
      userId: user.userId,
      userName: user.userName
    });
  }

  /**
   * Handle cursor position update
   */
  private handleCursorUpdate(socket: Socket, data: CursorData): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    socket.to(`note:${data.noteId}`).emit('note:cursor', {
      ...data,
      userId: user.userId,
      userName: user.userName,
      color: user.color
    });
  }

  /**
   * Handle selection range update
   */
  private handleSelectionUpdate(socket: Socket, data: SelectionData): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    socket.to(`note:${data.noteId}`).emit('note:selection', {
      ...data,
      userId: user.userId,
      userName: user.userName,
      color: user.color
    });
  }

  /**
   * Handle typing indicator
   */
  private handleTypingIndicator(socket: Socket, data: TypingData): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    socket.to(`note:${data.noteId}`).emit('user:typing', {
      ...data,
      userId: user.userId,
      userName: user.userName
    });
  }

  /**
   * Handle user activity ping
   */
  private handleUserActivity(socket: Socket): void {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      user.lastActivity = Date.now();
    }
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(socket: Socket): void {
    const user = this.connectedUsers.get(socket.id);
    
    if (user && user.noteId) {
      socket.to(`note:${user.noteId}`).emit('user:left', {
        userId: user.userId,
        userName: user.userName
      });

      this.noteRooms.get(user.noteId)?.delete(socket.id);
    }

    this.connectedUsers.delete(socket.id);
    console.log(`🔌 Client disconnected: ${socket.id}`);
  }

  /**
   * Get active users in a note
   */
  private getActiveUsersInNote(noteId: string): Array<{
    userId: string;
    userName: string;
    color: string;
  }> {
    const socketIds = this.noteRooms.get(noteId) || new Set();
    const users: Array<{ userId: string; userName: string; color: string }> = [];

    for (const socketId of socketIds) {
      const user = this.connectedUsers.get(socketId);
      if (user) {
        users.push({
          userId: user.userId,
          userName: user.userName,
          color: user.color
        });
      }
    }

    return users;
  }

  /**
   * Assign a color to a user
   */
  private assignUserColor(): string {
    return this.userColors[Math.floor(Math.random() * this.userColors.length)];
  }

  /**
   * Broadcast message to all clients in a note
   */
  broadcastToNote(noteId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`note:${noteId}`).emit(event, data);
    }
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;

    for (const [socketId, user] of this.connectedUsers.entries()) {
      if (user.userId === userId) {
        this.io.to(socketId).emit(event, data);
      }
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get users in a specific note
   */
  getUsersInNote(noteId: string): ConnectedUser[] {
    const socketIds = this.noteRooms.get(noteId) || new Set();
    return Array.from(socketIds)
      .map(socketId => this.connectedUsers.get(socketId))
      .filter((user): user is ConnectedUser => user !== undefined);
  }

  /**
   * Cleanup inactive connections
   */
  cleanupInactiveConnections(timeoutMs: number = 5 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [socketId, user] of this.connectedUsers.entries()) {
      if (now - user.lastActivity > timeoutMs) {
        console.log(`🧹 Cleaning up inactive connection: ${socketId}`);
        // The socket should already be disconnected, just clean up our tracking
        this.connectedUsers.delete(socketId);
        
        if (user.noteId) {
          this.noteRooms.get(user.noteId)?.delete(socketId);
        }
      }
    }
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
