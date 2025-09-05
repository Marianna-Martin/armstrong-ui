# Armstrong Number App Documentation

## Database Schema Design

The application uses a MySQL database (`armstrongdb`) with two tables:

- **users**:
  - `id`: `VARCHAR(36)` (UUID, primary key)
  - `email`: `VARCHAR(255)` (unique, not null)
  - `created_at`: `TIMESTAMP` (default: current timestamp)
- **armstrong_numbers**:
  - `id`: `INT` (auto-increment, primary key)
  - `user_id`: `VARCHAR(36)` (foreign key to `users.id`, not null)
  - `number`: `INT` (not null)
  - `created_at`: `TIMESTAMP` (default: current timestamp)
- **Design Choices**:
  - UUIDs for `users.id` ensure unique, non-sequential IDs.
  - Unique constraint on `email` prevents duplicates.
  - Foreign key with `ON DELETE CASCADE` ensures data integrity.

## API Endpoint Details

- **POST /users**
  - **Request**: `{ "email": "string" }`
  - **Response**: `201 { "id": "uuid", "email": "string" }` or `400/409 { "error": "string" }`
  - **Description**: Registers a user with a unique email.
- **GET /users/:id**
  - **Response**: `200 { "id": "uuid", "email": "string" }` or `404 { "error": "User not found" }`
  - **Description**: Retrieves user details by ID.
- **POST /users/:id/verify**
  - **Request**: `{ "number": integer }`
  - **Response**: `200 { "is_armstrong": boolean, "message": "string" }` or `400/404 { "error": "string" }`
  - **Description**: Verifies if a number is an Armstrong number and saves it if true.
- **GET /users/:id/armstrong**
  - **Response**: `200 [{ "id": integer, "user_id": "uuid", "number": integer, "created_at": "string" }]` or `404 { "error": "string" }`
  - **Description**: Retrieves all Armstrong numbers for a user.
- **GET /all-users?page=&limit=**
  - **Response**: `200 [{ "user": { "id": "uuid", "email": "string" }, "arms": [{ "id": integer, "user_id": "uuid", "number": integer, "created_at": "string" }] }]`
  - **Description**: Retrieves paginated users with their Armstrong numbers.

## Performance Optimization Approaches

- **Database**:
  - Indexes: Primary key on `users.id` and foreign key on `armstrong_numbers.user_id` for fast lookups.
  - Unique constraint on `users.email` prevents duplicate checks.
- **Backend**:
  - Efficient queries: Use `COUNT(*)` for existence checks and limit/offset for pagination.
  - Connection pooling: MySQL driver handles connections efficiently.
- **Frontend**:
  - Lazy loading: Fetch user Armstrong numbers only when a valid `userId` is provided.
  - Error handling: Robust checks prevent crashes (e.g., `Array.isArray`).

## Challenges Encountered and Solutions

- **Challenge**: “User not found” when verifying Armstrong numbers.
  - **Solution**: Added `.trim()` to user ID input, debug logs in backend/frontend, and advised verifying UUIDs against `users` table.
- **Challenge**: `TypeError: Cannot read properties of null (reading 'length')` in `Dashboard.js`.
  - **Solution**: Initialized `allUsers` as `[]`, added `Array.isArray` checks, and used error boundary.
- **Challenge**: Network error (“Failed to load users”).
  - **Solution**: Ensured backend runs on `localhost:8080`, verified CORS, and checked database connectivity.