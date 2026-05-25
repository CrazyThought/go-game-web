import localforage from 'localforage';
import type { SavedGame } from '@go-game/core';

export class GameStorage {
  private static instance: GameStorage;
  private store: LocalForage;

  private constructor() {
    this.store = localforage.createInstance({
      name: 'GoGameDB',
      storeName: 'savedGames',
      version: 1.0,
    });
  }

  static getInstance(): GameStorage {
    if (!GameStorage.instance) {
      GameStorage.instance = new GameStorage();
    }
    return GameStorage.instance;
  }

  async getAllSavedGames(): Promise<SavedGame[]> {
    const games: SavedGame[] = [];
    await this.store.iterate<SavedGame, void>((value) => {
      games.push(value);
    });
    games.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return games;
  }

  async getSavedGames(
    page: number = 1,
    pageSize: number = 10,
    keyword?: string,
  ): Promise<{ games: SavedGame[]; total: number }> {
    let all = await this.getAllSavedGames();
    if (keyword) {
      const kw = keyword.toLowerCase();
      all = all.filter((g) => g.name.toLowerCase().includes(kw));
    }
    const total = all.length;
    const start = (page - 1) * pageSize;
    const games = all.slice(start, start + pageSize);
    return { games, total };
  }

  async getGameById(id: string): Promise<SavedGame | null> {
    return this.store.getItem<SavedGame>(id);
  }

  async saveGame(game: Omit<SavedGame, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedGame> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const saved: SavedGame = {
      ...game,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await this.store.setItem(id, saved);
    return saved;
  }

  async updateGame(
    id: string,
    updates: Partial<Pick<SavedGame, 'name' | 'note'>>,
  ): Promise<SavedGame | null> {
    const existing = await this.store.getItem<SavedGame>(id);
    if (!existing) return null;
    const updated: SavedGame = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.store.setItem(id, updated);
    return updated;
  }

  async deleteGame(id: string): Promise<void> {
    await this.store.removeItem(id);
  }

  async deleteGames(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.store.removeItem(id);
    }
  }

  async clearAllGames(): Promise<void> {
    await this.store.clear();
  }

  async searchGames(keyword: string): Promise<SavedGame[]> {
    const all = await this.getAllSavedGames();
    const kw = keyword.toLowerCase();
    return all.filter((g) => g.name.toLowerCase().includes(kw));
  }

  async getStorageSize(): Promise<number> {
    let size = 0;
    await this.store.iterate<string, void>((value) => {
      size += new Blob([value]).size;
    });
    return size;
  }
}