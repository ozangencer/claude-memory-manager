import React, { useState } from 'react';
import { Edit2, Trash2, ArrowRight, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Entity, Relation } from '../types';

interface ResultItemProps {
  entity: Entity;
  relations: Relation[];
  onEdit: () => void;
  onDelete: () => void;
  onEntityClick?: (entityName: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  defaultExpanded?: boolean;
}

export const ResultItem: React.FC<ResultItemProps> = ({ entity, relations, onEdit, onDelete, onEntityClick, onBack, showBackButton, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const getEntityTypeClass = (type: string): string => {
    const normalizedType = type.toLowerCase();
    const typeClassMap: { [key: string]: string } = {
      'person': 'entity-type-person',
      'company': 'entity-type-company',
      'application': 'entity-type-application',
      'project': 'entity-type-project',
      'team': 'entity-type-team',
      'sports team': 'entity-type-team'
    };
    
    return typeClassMap[normalizedType] || 'entity-type-default';
  };
  
  return (
    <div className="result-item">
      <div className="entity-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="collapse-button"
            style={{
              transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
            }}
          >
            <ChevronDown size={20} />
          </button>
          <span className="entity-name">{entity.name}</span>
          <span className={`entity-type ${getEntityTypeClass(entity.entityType)}`}>
            {entity.entityType}
          </span>
        </div>
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={onEdit}>
            <Edit2 size={16} />
            Edit
          </button>
          <button className="btn btn-danger" onClick={onDelete}>
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <>
          {entity.observations.length > 0 && (
            <div className="observations">
              {entity.observations.map((obs, index) => (
                <div key={index} className="observation-item">
                  {obs}
                </div>
              ))}
            </div>
          )}
          
          {relations.length > 0 && (
            <div className="relations">
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: 500, 
            marginBottom: '0.5rem', 
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Relations:</span>
            {showBackButton && (
              <button 
                className="btn btn-secondary" 
                onClick={onBack}
                style={{ 
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <ArrowLeft size={14} />
                Geri
              </button>
            )}
          </div>
          {relations.map((rel, index) => (
            <div key={index} className="relation-item">
              {rel.from === entity.name ? (
                <>
                  <ArrowRight size={16} className="relation-arrow" />
                  <span 
                    style={{ 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      color: '#764ba2'
                    }}
                    onClick={() => onEntityClick && onEntityClick(rel.to)}
                  >
                    {rel.to}
                  </span>
                  <span style={{ color: '#999' }}>({rel.relationType})</span>
                </>
              ) : (
                <>
                  <span 
                    style={{ 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      color: '#764ba2'
                    }}
                    onClick={() => onEntityClick && onEntityClick(rel.from)}
                  >
                    {rel.from}
                  </span>
                  <ArrowRight size={16} className="relation-arrow" />
                  <span style={{ color: '#999' }}>({rel.relationType})</span>
                </>
              )}
            </div>
          ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};