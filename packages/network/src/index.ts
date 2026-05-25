import type { Move, BoardSize } from '@go-game/core';

export enum NetworkEventType {
  PlayerJoined = 'player_joined',
  PlayerLeft = 'player_left',
  MoveMade = 'move_made',
  GameStarted = 'game_started',
  GameEnded = 'game_ended',
  ChatMessage = 'chat_message',
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface Room {
  id: string;
  name: string;
  host: User;
  guest?: User;
  boardSize: BoardSize;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
}

export type NetworkEventHandler<T = unknown> = (data: T) => void;

export interface INetworkService {
  initialize(): Promise<void>;
  destroy(): void;
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string, username: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChange(callback: (user: User | null) => void): void;
  createRoom(name: string, boardSize: BoardSize): Promise<Room>;
  joinRoom(roomId: string): Promise<Room>;
  leaveRoom(roomId: string): Promise<void>;
  getAvailableRooms(): Promise<Room[]>;
  sendMove(roomId: string, move: Move): Promise<void>;
  sendResign(roomId: string): Promise<void>;
  sendPass(roomId: string): Promise<void>;
  sendChatMessage(roomId: string, message: string): Promise<void>;
  on<T>(event: NetworkEventType, handler: NetworkEventHandler<T>): void;
  off<T>(event: NetworkEventType, handler: NetworkEventHandler<T>): void;
}

export class MockNetworkService implements INetworkService {
  private rooms = new Map<string, Room>();
  private currentUser: User | null = null;
  private eventHandlers = new Map<string, Set<NetworkEventHandler>>();

  async initialize(): Promise<void> {}

  destroy(): void {
    this.rooms.clear();
    this.eventHandlers.clear();
  }

  async signIn(email: string, _password: string): Promise<User> {
    this.currentUser = { id: 'mock-1', email, username: email.split('@')[0] };
    return this.currentUser;
  }

  async signUp(email: string, _password: string, username: string): Promise<User> {
    this.currentUser = { id: 'mock-1', email, username };
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): void {
    callback(this.currentUser);
  }

  async createRoom(name: string, boardSize: BoardSize): Promise<Room> {
    const room: Room = {
      id: crypto.randomUUID(),
      name,
      host: this.currentUser!,
      boardSize,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    this.rooms.set(room.id, room);
    return room;
  }

  async joinRoom(roomId: string): Promise<Room> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    room.guest = this.currentUser!;
    room.status = 'playing';
    return room;
  }

  async leaveRoom(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
  }

  async getAvailableRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter((r) => r.status === 'waiting');
  }

  async sendMove(_roomId: string, _move: Move): Promise<void> {}

  async sendResign(_roomId: string): Promise<void> {}

  async sendPass(_roomId: string): Promise<void> {}

  async sendChatMessage(_roomId: string, _message: string): Promise<void> {}

  on<T>(event: NetworkEventType, handler: NetworkEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as NetworkEventHandler);
  }

  off<T>(event: NetworkEventType, handler: NetworkEventHandler<T>): void {
    this.eventHandlers.get(event)?.delete(handler as NetworkEventHandler);
  }
}