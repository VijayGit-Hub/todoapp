import { useEffect, useCallback, useState } from 'react';
import { indexedDBService, type PendingAction } from '../services/indexedDB';
import { createTodo, updateTodo, deleteTodo, fetchTodos } from '../api';
import { ConflictResolver } from '../services/conflictResolver';
import type { Todo } from '../types';
import toast from 'react-hot-toast';

export function useSync(isOnline: boolean) {
  const [conflictDialog, setConflictDialog] = useState<{
    isOpen: boolean;
    conflict: any;
    action: PendingAction;
  }>({ isOpen: false, conflict: null, action: null as any });

  const syncPendingActions = useCallback(async () => {
    if (!isOnline) return;

    try {
      const pendingActions = await indexedDBService.getPendingActions();
      
      if (pendingActions.length === 0) return;

      toast.loading(`Syncing ${pendingActions.length} pending changes...`, { id: 'sync' });

      let successCount = 0;
      let errorCount = 0;
      let conflictCount = 0;

      // First, get current server state
      const serverTodos = await fetchTodos();
      const serverTodoMap = new Map(serverTodos.map(todo => [todo.id, todo]));

      for (const action of pendingActions) {
        try {
          const serverTodo = serverTodoMap.get((action.data as Todo).id);
          let resolution;

          // Check for conflicts
          if (action.type === 'DELETE') {
            resolution = ConflictResolver.handleDeleteConflict(
              serverTodo || null,
              action.data as Todo,
              'DELETE'
            );
          } else {
            resolution = ConflictResolver.resolveConflict(
              serverTodo || null,
              action.data as Todo,
              action.type
            );
          }

          if (resolution.requiresUserInput) {
            // Show conflict dialog
            setConflictDialog({
              isOpen: true,
              conflict: resolution.conflictDetails,
              action
            });
            conflictCount++;
            continue;
          }

          // Apply resolution
          let finalTodo = resolution.resolvedTodo;
          if (!finalTodo && action.type !== 'DELETE') {
            continue; // Skip this action
          }

          switch (action.type) {
            case 'CREATE':
              if (finalTodo) {
                await createTodo(finalTodo.title);
              }
              break;
            case 'UPDATE':
              if (finalTodo) {
                await updateTodo(finalTodo);
              }
              break;
            case 'DELETE':
              if (finalTodo?.deleted) {
                await deleteTodo(finalTodo.id);
              }
              break;
          }
          
          await indexedDBService.removePendingAction(action.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync action ${action.type}:`, error);
          errorCount++;
        }
      }

      // Refresh from server after successful syncs
      if (successCount > 0) {
        const updatedServerTodos = await fetchTodos();
        await indexedDBService.saveTodos(updatedServerTodos);
      }

      // Show appropriate toast based on results
      if (conflictCount > 0) {
        toast(`Found ${conflictCount} conflicts. Please resolve them.`, { 
          id: 'sync',
          icon: '⚠️',
          duration: 5000
        });
      } else if (errorCount === 0) {
        toast.success('All changes synced successfully!', { id: 'sync' });
      } else if (successCount > 0) {
        toast.success(`Synced ${successCount} changes. ${errorCount} failed.`, { id: 'sync' });
      } else {
        toast.error('Sync failed. Changes will be retried when online.', { id: 'sync' });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed. Changes will be retried when online.', { id: 'sync' });
    }
  }, [isOnline]);

  const resolveConflict = useCallback(async (resolution: 'server' | 'client' | 'merge') => {
    if (!conflictDialog.action) return;

    try {
      const { action, conflict } = conflictDialog;
      let finalTodo: Todo;

      switch (resolution) {
        case 'server':
          finalTodo = conflict.serverVersion;
          break;
        case 'client':
          finalTodo = conflict.clientVersion;
          break;
        case 'merge':
          finalTodo = ConflictResolver.mergeTodos(conflict.serverVersion, conflict.clientVersion);
          break;
      }

      // Apply the resolved action
      switch (action.type) {
        case 'CREATE':
          await createTodo(finalTodo.title);
          break;
        case 'UPDATE':
          await updateTodo(finalTodo);
          break;
        case 'DELETE':
          await deleteTodo(finalTodo.id);
          break;
      }

      await indexedDBService.removePendingAction(action.id);
      
      // Refresh todos
      const serverTodos = await fetchTodos();
      await indexedDBService.saveTodos(serverTodos);
      
      toast.success('Conflict resolved successfully!');
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      toast.error('Failed to resolve conflict');
    } finally {
      setConflictDialog({ isOpen: false, conflict: null, action: null as any });
    }
  }, [conflictDialog]);

  const addPendingAction = useCallback(async (action: Omit<PendingAction, 'id' | 'timestamp'>) => {
    const pendingAction: PendingAction = {
      ...action,
      id: `${action.type}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now()
    };
    
    await indexedDBService.addPendingAction(pendingAction);
  }, []);

  useEffect(() => {
    if (isOnline) {
      // Small delay to ensure the app is fully loaded
      const timeoutId = setTimeout(() => {
        syncPendingActions();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, syncPendingActions]);

  return { 
    addPendingAction, 
    syncPendingActions, 
    conflictDialog, 
    resolveConflict,
    closeConflictDialog: () => setConflictDialog({ isOpen: false, conflict: null, action: null as any })
  };
}
