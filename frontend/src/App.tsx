import { useEffect, useState } from 'react'
import './App.css'
import type { Todo } from './types'
import { createTodo, deleteTodo, fetchTodos, updateTodo } from './api'
import { TodoItem } from './components/TodoItem'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useSync } from './hooks/useSync'
import { indexedDBService } from './services/indexedDB'
import { ConflictDialog } from './components/ConflictDialog'
import toast, { Toaster } from 'react-hot-toast'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isOnline = useOnlineStatus()
  const { addPendingAction, conflictDialog, resolveConflict, closeConflictDialog } = useSync(isOnline)

  const load = async (showToast = false) => {
    try {
      setLoading(true)
      setError(null)
      
      if (isOnline) {
        // Load from server and sync with IndexedDB
        const serverTodos = await fetchTodos()
        setTodos(serverTodos)
        await indexedDBService.saveTodos(serverTodos)
        if (showToast) {
          toast.success('Synced with server')
        }
      } else {
        // Load from IndexedDB when offline
        const localTodos = await indexedDBService.getTodos()
        setTodos(localTodos)
        if (showToast) {
          toast('Working offline - changes will sync when online', { icon: '📱' })
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error loading todos')
      if (showToast) {
        toast.error(e.message || 'Error loading todos')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initialize IndexedDB
    indexedDBService.init().then(() => {
      load()
    }).catch((error) => {
      console.error('Failed to initialize IndexedDB:', error)
      setError('Failed to initialize local storage')
    })
  }, [])

  useEffect(() => {
    if (isOnline) {
      load(true) // Reload when coming back online and show toast
    }
  }, [isOnline])

  const onAdd = async () => {
    const title = newTitle.trim()
    if (!title) return

    const newTodo: Todo = {
      id: Date.now(), // Temporary ID for offline
      title,
      completed: false,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: null
    }

    if (isOnline) {
      try {
        const created = await createTodo(title)
        setTodos((prev) => [created, ...prev])
        await indexedDBService.addTodo(created)
        toast.success('Todo added')
      } catch (error) {
        // If online but server fails, save locally
        setTodos((prev) => [newTodo, ...prev])
        await indexedDBService.addTodo(newTodo)
        await addPendingAction({ type: 'CREATE', data: newTodo })
        toast.error('Server unavailable - saved locally')
      }
    } else {
      // Offline mode
      setTodos((prev) => [newTodo, ...prev])
      await indexedDBService.addTodo(newTodo)
      await addPendingAction({ type: 'CREATE', data: newTodo })
      toast('Todo saved locally - will sync when online', { icon: '💾' })
    }

    setNewTitle('')
  }

  const onSave = async (todo: Todo) => {
    const updatedTodo = { ...todo, updatedAt: new Date().toISOString() }
    
    if (isOnline) {
      try {
        const updated = await updateTodo({ id: todo.id, title: todo.title, completed: todo.completed })
        setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        await indexedDBService.updateTodo(updated)
        toast.success('Todo updated')
      } catch (error) {
        // If online but server fails, save locally
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? updatedTodo : t)))
        await indexedDBService.updateTodo(updatedTodo)
        await addPendingAction({ type: 'UPDATE', data: updatedTodo })
        toast.error('Server unavailable - saved locally')
      }
    } else {
      // Offline mode
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updatedTodo : t)))
      await indexedDBService.updateTodo(updatedTodo)
      await addPendingAction({ type: 'UPDATE', data: updatedTodo })
      toast('Changes saved locally', { icon: '💾' })
    }
  }

  const onToggle = async (todo: Todo) => {
    const updatedTodo = { 
      ...todo, 
      completed: !todo.completed, 
      updatedAt: new Date().toISOString() 
    }
    
    if (isOnline) {
      try {
        const updated = await updateTodo({ id: todo.id, completed: !todo.completed })
        setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        await indexedDBService.updateTodo(updated)
        toast.success('Todo updated')
      } catch (error) {
        // If online but server fails, save locally
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? updatedTodo : t)))
        await indexedDBService.updateTodo(updatedTodo)
        await addPendingAction({ type: 'UPDATE', data: updatedTodo })
        toast.error('Server unavailable - saved locally')
      }
    } else {
      // Offline mode
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updatedTodo : t)))
      await indexedDBService.updateTodo(updatedTodo)
      await addPendingAction({ type: 'UPDATE', data: updatedTodo })
      toast('Changes saved locally', { icon: '💾' })
    }
  }

  const onDelete = async (id: number) => {
    if (isOnline) {
      try {
        await deleteTodo(id)
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, deleted: true } : t)))
        await indexedDBService.deleteTodo(id)
        toast.success('Todo deleted')
      } catch (error) {
        // If online but server fails, save locally
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, deleted: true } : t)))
        await addPendingAction({ type: 'DELETE', data: { id } })
        toast.error('Server unavailable - saved locally')
      }
    } else {
      // Offline mode
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, deleted: true } : t)))
      await addPendingAction({ type: 'DELETE', data: { id } })
      toast('Todo deleted locally - will sync when online', { icon: '💾' })
    }
  }

  return (
    <div className="app-container">
      <Toaster position="top-center" />
      <header className="header">
        <h1>📝 Todo App</h1>
        <div className="online-status">
          <div className={`status-dot ${isOnline ? '' : 'offline'}`}></div>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </header>
      
      <div className="content">
        <div className="add-todo-form">
          <input
            className="add-todo-input"
            placeholder="Add a new todo..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAdd()}
          />
          <button className="add-todo-btn" onClick={onAdd}>
            Add Todo
          </button>
        </div>

        {loading && <div className="loading">Loading todos...</div>}
        
        {error && <div className="error">{error}</div>}

        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onSave={onSave} 
              onToggle={onToggle} 
              onDelete={onDelete} 
            />
          ))}
        </ul>

        {todos.length === 0 && !loading && (
          <div className="loading">
            {isOnline ? 'No todos yet. Add one above!' : 'No local todos. Add one above!'}
          </div>
        )}
      </div>

      <ConflictDialog
        isOpen={conflictDialog.isOpen}
        onClose={closeConflictDialog}
        onResolve={resolveConflict}
        conflict={conflictDialog.conflict}
      />
    </div>
  )
}

export default App
