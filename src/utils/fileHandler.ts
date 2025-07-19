import { MemoryItem, Entity, Relation } from '../types';

export class FileHandler {
  private memoryPath: string;

  constructor(memoryPath: string) {
    this.memoryPath = memoryPath;
  }

  async readMemory(): Promise<MemoryItem[]> {
    try {
      const response = await fetch('/api/read-memory');
      const data = await response.json();
      return data.memories || [];
    } catch (error) {
      console.error('Error reading memory:', error);
      return [];
    }
  }

  async writeMemory(memories: MemoryItem[]): Promise<boolean> {
    try {
      const response = await fetch('/api/write-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memories }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error writing memory:', error);
      return false;
    }
  }

  async addMemoryItem(item: MemoryItem): Promise<boolean> {
    const memories = await this.readMemory();
    
    // Check for duplicate relations
    if (item.type === 'relation') {
      const existingRelation = memories.find(memory => 
        memory.type === 'relation' &&
        memory.from === item.from &&
        memory.to === item.to &&
        memory.relationType === item.relationType
      );
      
      if (existingRelation) {
        // Relation already exists, don't add duplicate
        return true;
      }
    }
    
    memories.push(item);
    return await this.writeMemory(memories);
  }

  async updateMemoryItem(oldItem: MemoryItem, newItem: MemoryItem): Promise<boolean> {
    const memories = await this.readMemory();
    const index = memories.findIndex(item => {
      if (item.type === 'entity' && oldItem.type === 'entity') {
        return item.name === oldItem.name;
      } else if (item.type === 'relation' && oldItem.type === 'relation') {
        return item.from === oldItem.from && item.to === oldItem.to && item.relationType === oldItem.relationType;
      }
      return false;
    });

    if (index !== -1) {
      memories[index] = newItem;
      return await this.writeMemory(memories);
    }
    return false;
  }

  async deleteMemoryItem(item: MemoryItem): Promise<boolean> {
    const memories = await this.readMemory();
    const filteredMemories = memories.filter(memory => {
      if (memory.type === 'entity' && item.type === 'entity') {
        return memory.name !== item.name;
      } else if (memory.type === 'relation' && item.type === 'relation') {
        return !(memory.from === item.from && memory.to === item.to && memory.relationType === item.relationType);
      }
      return true;
    });

    if (filteredMemories.length < memories.length) {
      return await this.writeMemory(filteredMemories);
    }
    return false;
  }
}