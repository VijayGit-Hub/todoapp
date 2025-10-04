package com.todoapp.todo;

import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class TodoService {
    private final TodoRepository repository;

    public TodoService(TodoRepository repository) {
        this.repository = repository;
    }

    public List<Todo> listActive() {
        return repository.findAllByDeletedFalseOrderByCreatedAtDesc();
    }

    public Todo create(Todo todo) {
        todo.setId(null);
        todo.setDeleted(false);
        todo.setCreatedAt(OffsetDateTime.now());
        todo.setUpdatedAt(null);
        return repository.save(todo);
    }

    public Todo update(Long id, Todo incoming) {
        Todo todo = repository.findById(id).orElseThrow();
        if (incoming.getTitle() != null) {
            todo.setTitle(incoming.getTitle());
        }
        todo.setCompleted(incoming.isCompleted());
        todo.setUpdatedAt(OffsetDateTime.now());
        return repository.save(todo);
    }

    public void softDelete(Long id) {
        Todo todo = repository.findById(id).orElseThrow();
        todo.setDeleted(true);
        todo.setUpdatedAt(OffsetDateTime.now());
        repository.save(todo);
    }
}


