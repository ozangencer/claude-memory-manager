import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Database, Edit3, ArrowLeft } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { ResultItem } from './components/ResultItem';
import { MemoryModal } from './components/MemoryModal';
import { MemoryManager } from './utils/memoryManager';
import { Entity, SearchResult } from './types';
import './styles.css';

const memoryManager = new MemoryManager('/Users/ozangencer/Documents/Memory/memory.jsonl');

export const App: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');
  const [navigationHistory, setNavigationHistory] = useState<{entityType: string, searchQuery: string, results: SearchResult[]}[]>([]);
  const [isViewingRelation, setIsViewingRelation] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    await memoryManager.init();
    const types = memoryManager.getEntityTypes();
    setEntityTypes(types);
    
    // Show all entities initially
    showFilteredResults('all', '');
    setLoading(false);
  };

  const showFilteredResults = (entityType: string, searchText: string) => {
    let results: SearchResult[] = [];
    
    // First, get entities based on type filter
    let entities: Entity[] = [];
    if (entityType === 'all') {
      entities = memoryManager.getAllEntities();
    } else {
      const allEntities = memoryManager.getAllEntities();
      entities = allEntities.filter(e => e.entityType === entityType);
    }
    
    // Then, filter by search text if provided
    if (searchText.trim()) {
      entities = entities.filter(entity => {
        const nameMatch = entity.name.toLowerCase().includes(searchText.toLowerCase());
        const typeMatch = entity.entityType.toLowerCase().includes(searchText.toLowerCase());
        const observationMatch = entity.observations.some(obs => 
          obs.toLowerCase().includes(searchText.toLowerCase())
        );
        return nameMatch || typeMatch || observationMatch;
      });
    }
    
    // Map to search results with relations
    results = entities.map(entity => ({
      item: entity,
      relations: memoryManager.getAllRelations().filter(
        rel => rel.from === entity.name || rel.to === entity.name
      )
    }));
    
    setSearchResults(results);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setNavigationHistory([]); // Clear history when searching
    setIsViewingRelation(false); // Exit relation view when searching
    showFilteredResults(selectedEntityType, query);
  }, [selectedEntityType]);

  const handleEntityTypeClick = (entityType: string) => {
    setSelectedEntityType(entityType);
    setNavigationHistory([]); // Clear history when changing filter
    setIsViewingRelation(false); // Exit relation view when changing filter
    showFilteredResults(entityType, searchQuery);
  };

  const handleEntityNameClick = (entityName: string) => {
    // Save current state to history before navigating
    setNavigationHistory(prev => [...prev, {
      entityType: selectedEntityType,
      searchQuery: searchQuery,
      results: searchResults
    }]);
    
    // Find the entity and show it
    const entity = memoryManager.getAllEntities().find(e => e.name === entityName);
    if (entity) {
      const relations = memoryManager.getAllRelations().filter(
        rel => rel.from === entity.name || rel.to === entity.name
      );
      
      setSearchQuery('');
      setSelectedEntityType('all');
      setSearchResults([{ item: entity, relations }]);
      setIsViewingRelation(true); // Mark that we're viewing a relation
    }
  };

  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const previousState = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      
      // Restore previous state
      setSelectedEntityType(previousState.entityType);
      setSearchQuery(previousState.searchQuery);
      setSearchResults(previousState.results);
      
      // If no more history, we're back to normal view
      if (navigationHistory.length === 1) {
        setIsViewingRelation(false);
      }
    }
  };

  const handleAddNew = () => {
    setEditingEntity(null);
    setIsModalOpen(true);
  };

  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity);
    setIsModalOpen(true);
  };

  const handleDelete = async (entity: Entity) => {
    if (window.confirm(`Are you sure you want to delete "${entity.name}"?`)) {
      await memoryManager.deleteEntity(entity);
      await memoryManager.init();
      const types = memoryManager.getEntityTypes();
      setEntityTypes(types);
      showFilteredResults(selectedEntityType, searchQuery);
    }
  };

  const handleSaveMemory = async (items: (Entity | any)[]) => {
    for (const item of items) {
      if (item.type === 'entity') {
        if (editingEntity) {
          await memoryManager.updateEntity(editingEntity, item);
        } else {
          await memoryManager.createEntity(item.name, item.entityType, item.observations);
        }
      } else if (item.type === 'relation') {
        await memoryManager.createRelation(item.from, item.to, item.relationType);
      }
    }
    await memoryManager.init();
    const types = memoryManager.getEntityTypes();
    setEntityTypes(types);
    showFilteredResults(selectedEntityType, searchQuery);
  };

  const generateEditingMarkdown = (): string => {
    if (!editingEntity) return '';
    
    let markdown = `## ${editingEntity.name} [${editingEntity.entityType}]\n\n`;
    
    editingEntity.observations.forEach(obs => {
      markdown += `- ${obs}\n`;
    });
    
    // Add existing relations
    const relations = memoryManager.getAllRelations().filter(
      rel => rel.from === editingEntity.name
    );
    
    if (relations.length > 0) {
      markdown += '\n';
      relations.forEach(rel => {
        markdown += `-> ${rel.to}: ${rel.relationType}\n`;
      });
    }
    
    return markdown;
  };

  const handleRenameEntityType = async (oldType: string) => {
    const newType = prompt(`"${oldType}" türünün yeni adını girin:`, oldType);
    if (newType && newType !== oldType) {
      const success = await memoryManager.renameEntityType(oldType, newType);
      if (success) {
        await memoryManager.init();
        const types = memoryManager.getEntityTypes();
        setEntityTypes(types);
        
        // If we were filtering by the renamed type, update to the new name
        if (selectedEntityType === oldType) {
          setSelectedEntityType(newType);
          showFilteredResults(newType, searchQuery);
        } else {
          showFilteredResults(selectedEntityType, searchQuery);
        }
        
        alert(`"${oldType}" başarıyla "${newType}" olarak değiştirildi.`);
      } else {
        alert('Tür adı değiştirilemedi.');
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Ozan's Memory</h1>
      </header>
      
      <main className="main-content">
        <aside className="sidebar">
          <button className="btn btn-primary" onClick={handleAddNew} style={{ width: '100%' }}>
            <Plus size={18} />
            Add Memory
          </button>
          
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>
              Entity Types
            </h3>
            <div 
              className={`filter-chip ${selectedEntityType === 'all' ? 'active' : ''}`}
              style={{ 
                marginBottom: '0.5rem', 
                display: 'block', 
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => handleEntityTypeClick('all')}
            >
              All
            </div>
            {entityTypes.map(type => {
              const getEntityTypeGradient = (entityType: string): string => {
                const normalizedType = entityType.toLowerCase();
                const gradientMap: { [key: string]: string } = {
                  'person': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'company': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'application': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  'project': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  'team': 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
                  'sports team': 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)'
                };
                return gradientMap[normalizedType] || 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
              };
              
              return (
              <div 
                key={type} 
                className={`filter-chip`}
                style={{ 
                  marginBottom: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: selectedEntityType === type ? getEntityTypeGradient(type) : '#ecf0f1',
                  color: selectedEntityType === type ? 'white' : '#333',
                  border: selectedEntityType === type ? 'none' : '1px solid #bdc3c7'
                }}
              >
                <span onClick={() => handleEntityTypeClick(type)} style={{ flex: 1 }}>
                  {type}
                </span>
                <Edit3 
                  size={14} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameEntityType(type);
                  }}
                  style={{ 
                    marginLeft: '0.5rem',
                    opacity: 0.6,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                />
              </div>
            );
            })}
          </div>
        </aside>
        
        <div className="content">
          <SearchBar onSearch={handleSearch} value={searchQuery} disabled={isViewingRelation} />
          
          <div className="results-section">
            {loading ? (
              <div className="empty-state">
                <Database className="empty-state-icon" />
                <div className="empty-state-text">Loading memories...</div>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, index) => {
                if (result.item.type === 'entity') {
                  return (
                    <ResultItem
                      key={index}
                      entity={result.item as Entity}
                      relations={result.relations || []}
                      onEdit={() => handleEdit(result.item as Entity)}
                      onDelete={() => handleDelete(result.item as Entity)}
                      onEntityClick={handleEntityNameClick}
                      onBack={handleBack}
                      showBackButton={navigationHistory.length > 0}
                      defaultExpanded={searchResults.length === 1}
                    />
                  );
                }
                return null;
              })
            ) : (
              <div className="empty-state">
                <Database className="empty-state-icon" />
                <div className="empty-state-text">No memories found</div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <MemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMemory}
        initialMarkdown={editingEntity ? generateEditingMarkdown() : ''}
        title={editingEntity ? 'Edit Memory' : 'Add New Memory'}
      />
    </div>
  );
};