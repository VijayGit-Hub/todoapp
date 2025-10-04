import { useState } from 'react';
import type { Todo } from '../types';

interface ConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolution: 'server' | 'client' | 'merge') => void;
  conflict: {
    serverVersion: Todo;
    clientVersion: Todo;
    conflictFields: string[];
  };
}

export function ConflictDialog({ isOpen, onClose, onResolve, conflict }: ConflictDialogProps) {
  const [selectedResolution, setSelectedResolution] = useState<'server' | 'client' | 'merge'>('merge');

  if (!isOpen) return null;

  const { serverVersion, clientVersion, conflictFields } = conflict;

  return (
    <div className="conflict-overlay">
      <div className="conflict-dialog">
        <h3>🔄 Conflict Detected</h3>
        <p>This todo was modified on another device. How would you like to resolve the conflict?</p>
        
        <div className="conflict-comparison">
          <div className="version-comparison">
            <h4>Server Version (Other Device)</h4>
            <div className="todo-preview">
              <span className={`todo-text ${serverVersion.completed ? 'completed' : ''} ${serverVersion.deleted ? 'deleted' : ''}`}>
                {serverVersion.title}
              </span>
              <div className="todo-meta">
                {serverVersion.completed && <span className="status-badge completed">Completed</span>}
                {serverVersion.deleted && <span className="status-badge deleted">Deleted</span>}
                <span className="timestamp">
                  {new Date(serverVersion.updatedAt || serverVersion.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="version-comparison">
            <h4>Your Version (This Device)</h4>
            <div className="todo-preview">
              <span className={`todo-text ${clientVersion.completed ? 'completed' : ''} ${clientVersion.deleted ? 'deleted' : ''}`}>
                {clientVersion.title}
              </span>
              <div className="todo-meta">
                {clientVersion.completed && <span className="status-badge completed">Completed</span>}
                {clientVersion.deleted && <span className="status-badge deleted">Deleted</span>}
                <span className="timestamp">
                  {new Date(clientVersion.updatedAt || clientVersion.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="conflict-fields">
          <h4>Conflicting Fields:</h4>
          <ul>
            {conflictFields.map(field => (
              <li key={field} className="conflict-field">
                {field === 'title' && 'Title'}
                {field === 'completed' && 'Completion Status'}
                {field === 'deleted' && 'Deletion Status'}
              </li>
            ))}
          </ul>
        </div>

        <div className="resolution-options">
          <h4>Choose Resolution:</h4>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="resolution"
                value="server"
                checked={selectedResolution === 'server'}
                onChange={(e) => setSelectedResolution(e.target.value as 'server')}
              />
              <span>Use Server Version (Other Device)</span>
            </label>
            
            <label className="radio-option">
              <input
                type="radio"
                name="resolution"
                value="client"
                checked={selectedResolution === 'client'}
                onChange={(e) => setSelectedResolution(e.target.value as 'client')}
              />
              <span>Use Your Version (This Device)</span>
            </label>
            
            <label className="radio-option">
              <input
                type="radio"
                name="resolution"
                value="merge"
                checked={selectedResolution === 'merge'}
                onChange={(e) => setSelectedResolution(e.target.value as 'merge')}
              />
              <span>Smart Merge (Recommended)</span>
            </label>
          </div>
        </div>

        <div className="conflict-actions">
          <button className="conflict-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="conflict-btn resolve" 
            onClick={() => onResolve(selectedResolution)}
          >
            Resolve Conflict
          </button>
        </div>
      </div>
    </div>
  );
}
