export interface Entity {
  type: 'entity';
  name: string;
  entityType: string;
  observations: string[];
}

export interface Relation {
  type: 'relation';
  from: string;
  to: string;
  relationType: string;
}

export type MemoryItem = Entity | Relation;

export interface SearchResult {
  item: MemoryItem;
  relations?: Relation[];
  score?: number;
}