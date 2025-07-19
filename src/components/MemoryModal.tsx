import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Entity, Relation } from '../types';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: (Entity | Relation)[]) => void;
  initialMarkdown?: string;
  title: string;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialMarkdown = '', 
  title 
}) => {
  const [markdown, setMarkdown] = useState(initialMarkdown);

  useEffect(() => {
    setMarkdown(initialMarkdown);
  }, [initialMarkdown]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Parse markdown to memory items
    const items = parseMarkdown(markdown);
    onSave(items);
    onClose();
  };

  const parseMarkdown = (md: string): (Entity | Relation)[] => {
    const items: (Entity | Relation)[] = [];
    const lines = md.split('\n');
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
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="form-group">
          <label className="form-label">Memory (Markdown Format)</label>
          <textarea
            className="form-textarea"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={`## Entity Name [Entity Type]\n\n- Observation 1\n- Observation 2\n\n-> Related Entity: Relation Type`}
          />
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            <strong>Format:</strong><br />
            • Entity: ## Name [Type]<br />
            • Observations: - observation text<br />
            • Relations: → target: relation type
          </div>
        </div>
        
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};