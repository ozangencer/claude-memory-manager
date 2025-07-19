import { MemoryItem, Entity, Relation, SearchResult } from '../types';

export class SearchEngine {
  private memories: MemoryItem[] = [];

  setMemories(memories: MemoryItem[]) {
    this.memories = memories;
  }

  searchByEntityType(entityType: string): SearchResult[] {
    const results: SearchResult[] = [];
    const entities = this.memories.filter(
      (item): item is Entity => item.type === 'entity' && item.entityType.toLowerCase().includes(entityType.toLowerCase())
    );

    for (const entity of entities) {
      const relations = this.getRelationsForEntity(entity.name);
      results.push({ item: entity, relations });
    }

    return results;
  }

  searchByName(name: string): SearchResult[] {
    const results: SearchResult[] = [];
    const entities = this.memories.filter(
      (item): item is Entity => item.type === 'entity' && item.name.toLowerCase().includes(name.toLowerCase())
    );

    for (const entity of entities) {
      const relations = this.getRelationsForEntity(entity.name);
      results.push({ item: entity, relations });
    }

    return results;
  }

  searchFreeText(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    const processedItems = new Set<string>();

    // Search in entities
    const entities = this.memories.filter((item): item is Entity => {
      if (item.type !== 'entity') return false;
      
      const nameMatch = item.name.toLowerCase().includes(lowerQuery);
      const typeMatch = item.entityType.toLowerCase().includes(lowerQuery);
      const observationMatch = item.observations.some(obs => obs.toLowerCase().includes(lowerQuery));
      
      return nameMatch || typeMatch || observationMatch;
    });

    for (const entity of entities) {
      if (!processedItems.has(entity.name)) {
        processedItems.add(entity.name);
        const relations = this.getRelationsForEntity(entity.name);
        
        // Calculate relevance score
        let score = 0;
        if (entity.name.toLowerCase().includes(lowerQuery)) score += 3;
        if (entity.entityType.toLowerCase().includes(lowerQuery)) score += 2;
        entity.observations.forEach(obs => {
          if (obs.toLowerCase().includes(lowerQuery)) score += 1;
        });
        
        results.push({ item: entity, relations, score });
      }
    }

    // Search in relations
    const relations = this.memories.filter((item): item is Relation => {
      if (item.type !== 'relation') return false;
      
      return item.from.toLowerCase().includes(lowerQuery) ||
             item.to.toLowerCase().includes(lowerQuery) ||
             item.relationType.toLowerCase().includes(lowerQuery);
    });

    // Add entities connected by matching relations
    for (const relation of relations) {
      // Add 'from' entity if not already added
      if (!processedItems.has(relation.from)) {
        const fromEntity = this.memories.find(
          (item): item is Entity => item.type === 'entity' && item.name === relation.from
        );
        if (fromEntity) {
          processedItems.add(relation.from);
          const entityRelations = this.getRelationsForEntity(relation.from);
          results.push({ item: fromEntity, relations: entityRelations, score: 1 });
        }
      }

      // Add 'to' entity if not already added
      if (!processedItems.has(relation.to)) {
        const toEntity = this.memories.find(
          (item): item is Entity => item.type === 'entity' && item.name === relation.to
        );
        if (toEntity) {
          processedItems.add(relation.to);
          const entityRelations = this.getRelationsForEntity(relation.to);
          results.push({ item: toEntity, relations: entityRelations, score: 1 });
        }
      }
    }

    // Sort by relevance score
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private getRelationsForEntity(entityName: string): Relation[] {
    return this.memories.filter((item): item is Relation => 
      item.type === 'relation' && (item.from === entityName || item.to === entityName)
    );
  }

  getAllEntities(): Entity[] {
    return this.memories.filter((item): item is Entity => item.type === 'entity');
  }

  getAllRelations(): Relation[] {
    return this.memories.filter((item): item is Relation => item.type === 'relation');
  }

  getEntityTypes(): string[] {
    const types = new Set<string>();
    this.memories.forEach(item => {
      if (item.type === 'entity') {
        types.add(item.entityType);
      }
    });
    return Array.from(types).sort();
  }
}