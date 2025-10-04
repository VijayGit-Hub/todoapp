import type { Todo } from '../types';

export interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'manual';
  resolvedTodo?: Todo;
  requiresUserInput?: boolean;
  conflictDetails?: {
    serverVersion: Todo;
    clientVersion: Todo;
    conflictFields: string[];
  };
}

export class ConflictResolver {
  /**
   * Resolves conflicts between server and client versions of a todo
   */
  static resolveConflict(
    serverTodo: Todo | null,
    clientTodo: Todo,
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
  ): ConflictResolution {
    // If server todo doesn't exist but client is trying to update/delete
    if (!serverTodo && (operation === 'UPDATE' || operation === 'DELETE')) {
      return {
        strategy: 'client-wins',
        resolvedTodo: undefined // Don't perform the operation
      };
    }

    // If client is trying to create but server already has it
    if (serverTodo && operation === 'CREATE') {
      return {
        strategy: 'server-wins',
        resolvedTodo: serverTodo
      };
    }

    // If both exist, check for actual conflicts
    if (serverTodo && clientTodo) {
      const conflictFields = this.detectConflicts(serverTodo, clientTodo);
      
      if (conflictFields.length === 0) {
        // No conflicts, use client version
        return {
          strategy: 'client-wins',
          resolvedTodo: clientTodo
        };
      }

      // Conflicts detected - use merge strategy
      return {
        strategy: 'merge',
        resolvedTodo: this.mergeTodos(serverTodo, clientTodo),
        conflictDetails: {
          serverVersion: serverTodo,
          clientVersion: clientTodo,
          conflictFields
        }
      };
    }

    // Default: client wins
    return {
      strategy: 'client-wins',
      resolvedTodo: clientTodo
    };
  }

  /**
   * Detects which fields have conflicts between server and client versions
   */
  private static detectConflicts(serverTodo: Todo, clientTodo: Todo): string[] {
    const conflicts: string[] = [];
    
    // Check if both have been modified since the client's last sync
    const serverUpdated = new Date(serverTodo.updatedAt || serverTodo.createdAt);
    const clientUpdated = new Date(clientTodo.updatedAt || clientTodo.createdAt);
    
    // If server was updated after client's last known update, there might be conflicts
    if (serverUpdated > clientUpdated) {
      if (serverTodo.title !== clientTodo.title) {
        conflicts.push('title');
      }
      if (serverTodo.completed !== clientTodo.completed) {
        conflicts.push('completed');
      }
      if (serverTodo.deleted !== clientTodo.deleted) {
        conflicts.push('deleted');
      }
    }
    
    return conflicts;
  }

  /**
   * Merges server and client versions using intelligent strategies
   */
  static mergeTodos(serverTodo: Todo, clientTodo: Todo): Todo {
    const merged: Todo = { ...clientTodo };
    
    // For title conflicts, prefer the longer/more recent version
    if (serverTodo.title !== clientTodo.title) {
      const serverUpdated = new Date(serverTodo.updatedAt || serverTodo.createdAt);
      const clientUpdated = new Date(clientTodo.updatedAt || clientTodo.createdAt);
      
      if (serverUpdated > clientUpdated) {
        merged.title = serverTodo.title;
      }
    }
    
    // For completion status, if either is completed, mark as completed
    merged.completed = serverTodo.completed || clientTodo.completed;
    
    // For deletion, if either is deleted, mark as deleted
    merged.deleted = serverTodo.deleted || clientTodo.deleted;
    
    // Use the most recent timestamp
    const serverTime = new Date(serverTodo.updatedAt || serverTodo.createdAt);
    const clientTime = new Date(clientTodo.updatedAt || clientTodo.createdAt);
    merged.updatedAt = serverTime > clientTime ? serverTodo.updatedAt : clientTodo.updatedAt;
    
    return merged;
  }

  /**
   * Handles the case where a todo was deleted on one device but modified on another
   */
  static handleDeleteConflict(
    serverTodo: Todo | null,
    clientTodo: Todo,
    _operation: 'UPDATE' | 'DELETE'
  ): ConflictResolution {
    if (!serverTodo) {
      // Server doesn't have the todo, so client delete/update is invalid
      return {
        strategy: 'server-wins',
        resolvedTodo: undefined
      };
    }

    if (serverTodo.deleted && !clientTodo.deleted) {
      // Server has it deleted, client is trying to update
      return {
        strategy: 'manual',
        requiresUserInput: true,
        conflictDetails: {
          serverVersion: serverTodo,
          clientVersion: clientTodo,
          conflictFields: ['deleted']
        }
      };
    }

    if (!serverTodo.deleted && clientTodo.deleted) {
      // Client wants to delete, server has it active
      return {
        strategy: 'client-wins',
        resolvedTodo: { ...clientTodo, deleted: true }
      };
    }

    // Both have same deletion status
    return {
      strategy: 'client-wins',
      resolvedTodo: clientTodo
    };
  }
}
