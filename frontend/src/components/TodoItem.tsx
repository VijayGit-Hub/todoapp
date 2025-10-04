import type { Todo } from '../types';
import { useState } from 'react';

interface Props {
  todo: Todo;
  onSave: (todo: Todo) => void;
  onToggle: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, onSave, onToggle, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const handleSave = () => {
    if (title.trim().length === 0) return;
    onSave({ ...todo, title: title.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setIsEditing(false);
  };

  return (
    <li className="todo-item">
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle({ ...todo, completed: !todo.completed })}
      />
      
      <div className="todo-content">
        {isEditing ? (
          <input
            className="todo-edit-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
          />
        ) : (
          <span
            className={`todo-text ${todo.completed ? 'completed' : ''} ${todo.deleted ? 'deleted' : ''}`}
          >
            {todo.title}
          </span>
        )}
      </div>

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button className="todo-btn save" onClick={handleSave}>
              Save
            </button>
            <button className="todo-btn edit" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button 
              className="todo-btn edit" 
              onClick={() => setIsEditing(true)}
              disabled={todo.deleted}
            >
              Edit
            </button>
            <button 
              className="todo-btn delete" 
              onClick={() => onDelete(todo.id)}
            >
              {todo.deleted ? 'Deleted' : 'Delete'}
            </button>
          </>
        )}
      </div>
    </li>
  );
}


