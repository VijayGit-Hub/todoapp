## TodoApp (React + Spring Boot + Postgres)

### Prerequisites
- Node 18+
- Java 17+
- Maven 3.9+
- Docker

### Start Postgres
```bash
docker compose up -d
```

### Backend
```bash
cd backend
mvn clean package
mvn spring-boot:run
```
App runs on `http://localhost:8080`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`.

### Environment
- Frontend uses `VITE_API_URL` (defaults to `http://localhost:8080`).
- Backend connects to Postgres at `localhost:5432` (db: `todoapp`, user: `todo`, password: `todo`).

### API
- `GET /api/todos` → list active todos (excludes soft-deleted)
- `POST /api/todos { title }` → create todo
- `PUT /api/todos/{id}` → update fields (`title`, `completed`)
- `DELETE /api/todos/{id}` → soft delete (UI shows strike-through)


