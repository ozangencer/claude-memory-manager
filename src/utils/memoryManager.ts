import { FileHandler } from './fileHandler';
import { SearchEngine } from './search';
import { MemoryItem, Entity, Relation } from '../types';

export class MemoryManager {
  private fileHandler: FileHandler;
  private searchEngine: SearchEngine;

  constructor(memoryPath: string) {
    this.fileHandler = new FileHandler(memoryPath);
    this.searchEngine = new SearchEngine();
  }

  async init() {
    const memories = await this.fileHandler.readMemory();
    // Clean up duplicate relations
    const cleanedMemories = this.removeDuplicateRelations(memories);
    if (cleanedMemories.length < memories.length) {
      // If duplicates were removed, save the cleaned data
      await this.fileHandler.writeMemory(cleanedMemories);
    }
    this.searchEngine.setMemories(cleanedMemories);
  }

  private removeDuplicateRelations(memories: MemoryItem[]): MemoryItem[] {
    const seen = new Set<string>();
    return memories.filter(item => {
      if (item.type === 'relation') {
        const key = `${item.from}-${item.to}-${item.relationType}`;
        if (seen.has(key)) {
          return false; // Skip duplicate
        }
        seen.add(key);
      }
      return true;
    });
  }

  async refreshSearch() {
    const memories = await this.fileHandler.readMemory();
    this.searchEngine.setMemories(memories);
  }

  // Create operations
  async createEntity(name: string, entityType: string, observations: string[]): Promise<boolean> {
    const entity: Entity = {
      type: 'entity',
      name,
      entityType,
      observations
    };
    const success = await this.fileHandler.addMemoryItem(entity);
    if (success) await this.refreshSearch();
    return success;
  }

  async createRelation(from: string, to: string, relationType: string): Promise<boolean> {
    const relation: Relation = {
      type: 'relation',
      from,
      to,
      relationType
    };
    const success = await this.fileHandler.addMemoryItem(relation);
    if (success) await this.refreshSearch();
    return success;
  }

  // Update operations
  async updateEntity(oldEntity: Entity, newEntity: Entity): Promise<boolean> {
    const success = await this.fileHandler.updateMemoryItem(oldEntity, newEntity);
    if (success) await this.refreshSearch();
    return success;
  }

  async updateRelation(oldRelation: Relation, newRelation: Relation): Promise<boolean> {
    const success = await this.fileHandler.updateMemoryItem(oldRelation, newRelation);
    if (success) await this.refreshSearch();
    return success;
  }

  // Rename entity type
  async renameEntityType(oldType: string, newType: string): Promise<boolean> {
    const memories = await this.fileHandler.readMemory();
    let hasChanges = false;
    
    // Update all entities with the old type
    const updatedMemories = memories.map(item => {
      if (item.type === 'entity' && item.entityType === oldType) {
        hasChanges = true;
        return { ...item, entityType: newType };
      }
      return item;
    });
    
    if (hasChanges) {
      const success = await this.fileHandler.writeMemory(updatedMemories);
      if (success) await this.refreshSearch();
      return success;
    }
    
    return false;
  }

  // Delete operations
  async deleteEntity(entity: Entity): Promise<boolean> {
    // First, delete all relations involving this entity
    const memories = await this.fileHandler.readMemory();
    const relationsToDelete = memories.filter((item): item is Relation => 
      item.type === 'relation' && (item.from === entity.name || item.to === entity.name)
    );

    // Delete all related relations
    for (const relation of relationsToDelete) {
      await this.fileHandler.deleteMemoryItem(relation);
    }

    // Delete the entity itself
    const success = await this.fileHandler.deleteMemoryItem(entity);
    if (success) await this.refreshSearch();
    return success;
  }

  async deleteRelation(relation: Relation): Promise<boolean> {
    const success = await this.fileHandler.deleteMemoryItem(relation);
    if (success) await this.refreshSearch();
    return success;
  }

  // Markdown operations
  parseMarkdownToMemoryItems(markdown: string): MemoryItem[] {
    const items: MemoryItem[] = [];
    const lines = markdown.split('\n');
    let currentEntity: Entity | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Parse entity header (## EntityName [EntityType])
      const entityMatch = line.match(/^##\s+(.+?)\s*\[(.+?)\]$/);
      if (entityMatch) {
        if (currentEntity) {
          items.push(currentEntity);
        }
        currentEntity = {
          type: 'entity',
          name: entityMatch[1].trim(),
          entityType: entityMatch[2].trim(),
          observations: []
        };
        continue;
      }

      // Parse observations (- observation text)
      if (currentEntity && line.startsWith('- ')) {
        currentEntity.observations.push(line.substring(2).trim());
        continue;
      }

      // Parse relations (-> targetEntity: relationType)
      const relationMatch = line.match(/^->\s*(.+?):\s*(.+)$/);
      if (relationMatch && currentEntity) {
        const relation: Relation = {
          type: 'relation',
          from: currentEntity.name,
          to: relationMatch[1].trim(),
          relationType: relationMatch[2].trim()
        };
        items.push(relation);
        continue;
      }
    }

    // Add the last entity
    if (currentEntity) {
      items.push(currentEntity);
    }

    return items;
  }

  generateMarkdownFromMemoryItems(items: MemoryItem[]): string {
    const entities = items.filter((item): item is Entity => item.type === 'entity');
    const relations = items.filter((item): item is Relation => item.type === 'relation');
    
    let markdown = '';

    for (const entity of entities) {
      markdown += `## ${entity.name} [${entity.entityType}]\n\n`;
      
      // Add observations
      for (const observation of entity.observations) {
        markdown += `- ${observation}\n`;
      }
      
      // Add relations from this entity
      const entityRelations = relations.filter(r => r.from === entity.name);
      if (entityRelations.length > 0) {
        markdown += '\n';
        for (const relation of entityRelations) {
          markdown += `-> ${relation.to}: ${relation.relationType}\n`;
        }
      }
      
      markdown += '\n';
    }

    return markdown.trim();
  }

  // Search delegation
  searchByEntityType(entityType: string) {
    return this.searchEngine.searchByEntityType(entityType);
  }

  searchByName(name: string) {
    return this.searchEngine.searchByName(name);
  }

  searchFreeText(query: string) {
    return this.searchEngine.searchFreeText(query);
  }

  getAllEntities() {
    return this.searchEngine.getAllEntities();
  }

  getAllRelations() {
    return this.searchEngine.getAllRelations();
  }

  getEntityTypes() {
    return this.searchEngine.getEntityTypes();
  }
}