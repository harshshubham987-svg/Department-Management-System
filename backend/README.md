# Backend – Department Management System

## 1. Backend Overview

The backend of the Department Management System is developed using Node.js and Express.js. It provides RESTful APIs to manage academic and administrative operations within the application.

The backend acts as the central processing layer between the React frontend and the PostgreSQL database.

It handles user authentication, role-based authorization, department and course management, student enrollments, grade management, and administrative monitoring.

### Key Responsibilities

- Handle user registration and login.
- Manage JWT access and refresh token authentication.
- Enforce role-based access for Admin, Teacher, and Student.
- Provide APIs for department and course management.
- Manage student enrollments and grade updates.
- Retrieve user profile information.
- Record API activity and response times.
- Provide administrative dashboard statistics.
- Manage API log retention and cleanup.

### Backend Architecture

The backend follows a modular architecture that separates API routes, controllers, services, middleware, database configuration, and business logic.

**Request Flow:**

Client Request → Express Routes → Middleware → Controllers → Services → PostgreSQL Database

The backend returns JSON responses to the frontend through RESTful API endpoints.

## 2. Technology Stack

The backend is built using the following technologies and libraries:

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime environment |
| Express.js | REST API development |
| PostgreSQL | Relational database management |
| pg | PostgreSQL database connectivity |
| JSON Web Token (JWT) | Access and refresh token authentication |
| bcrypt / bcryptjs | Password hashing |
| dotenv | Environment variable management |
| cors | Cross-origin resource sharing |
| Helmet | HTTP security headers |
| express-rate-limit | API request rate limiting |
| Nodemon | Automatic server restart during development |

These technologies provide the foundation for API development, database operations, authentication, authorization, and backend security.

## 3. Backend Features

The backend provides the following features:

### Authentication and Authorization
- User registration and login.
- JWT-based access and refresh token authentication.
- Password hashing using bcrypt.
- Role-based access control for Admin, Teacher, and Student.

### Department Management
- Retrieve all departments.
- Retrieve department details by ID.
- Create and update departments.

### Course Management
- Retrieve course information.
- Create new courses.
- Manage course-related data.

### Enrollment and Grade Management
- Enroll students in courses.
- Retrieve enrollments by student ID.
- Update student grades.
- Delete enrollment records.

### User Management
- Retrieve user profile information by user ID.

### Administrative Monitoring
- Retrieve dashboard statistics.
- View API logs and individual log details.
- Monitor API activity and response times.
- Automatically clean up old API logs to manage database storage.

## 4. Backend Folder Structure

The backend follows a modular folder structure to keep the application organized, maintainable, and scalable.

```text
backend/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── courseController.js
│   ├── departmentController.js
│   ├── enrollmentController.js
│   └── userController.js
│
├── database/
│   └── schema.sql
│
├── middlewares/
│   ├── apiLogger.js
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── departmentRoutes.js
│   ├── enrollmentRoutes.js
│   └── userRoutes.js
│
├── services/
│   ├── authService.js
│   ├── cleanupService.js
│   ├── courseService.js
│   ├── departmentService.js
│   ├── enrollmentService.js
│   └── userService.js
│
├── .env
├── .gitignore
├── nodemon.json
├── package.json
├── package-lock.json
└── server.js
```

### Folder Responsibilities

- **config/** – Database connection configuration.
- **controllers/** – Handle incoming requests and send API responses.
- **database/** – Contains the SQL database schema.
- **middlewares/** – Authentication, role authorization, and API logging.
- **routes/** – Define backend API endpoints.
- **services/** – Contain application business logic.
- **server.js** – Initializes and starts the

## 5. Installation & Setup

Follow these steps to run the backend locally.

### Prerequisites

Make sure the following software is installed:

- Node.js
- npm
- PostgreSQL
- Git

### Step 1: Clone the Repository

```bash
git clone <https://github.com/harshshubham987-svg/Department-Management-System>
```

### Step 2: Navigate to the Backend Directory

```bash
cd department-management-system/backend
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the backend directory and configure the required environment variables.

Refer to the Environment Variables section below.

### Step 5: Configure the Database

- Create a PostgreSQL database.
- Configure the database connection details in the `.env` file.
- Execute the SQL commands from `database/schema.sql` to create the required tables.

### Step 6: Start the Development Server

```bash
npm run dev
```

The backend server will start using the development configuration.

**Note:** The server port and API base URL depend on the values configured in the environment variables.

## 6. Environment Variables

The backend uses environment variables to manage server configuration, database connectivity, and JWT authentication.

Create a `.env` file inside the `backend/` directory.

### Configuration

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_username
DB_PASSWORD=your_database_password

# JWT Authentication
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRE=your_access_token_expiry
```

### Variable Description

| Variable | Description |
|---|---|
| PORT | Backend server port |
| NODE_ENV | Application environment |
| DB_HOST | PostgreSQL server hostname |
| DB_PORT | PostgreSQL server port |
| DB_NAME | PostgreSQL database name |
| DB_USER | PostgreSQL username |
| DB_PASSWORD | PostgreSQL password |
| JWT_SECRET | Secret used for access tokens |
| JWT_REFRESH_SECRET | Secret used for refresh tokens |
| JWT_EXPIRE | Access token expiration duration |

### Security Notes

- Never commit the `.env` file to GitHub.
- Use strong and unique JWT secrets.
- Keep production credentials separate from development credentials.
- Document variable names, not actual passwords or secrets.

## 7. Database Configuration

The application uses PostgreSQL as its relational database management system. The backend connects to PostgreSQL using the `pg` package.

### Database Connection

The database connection is configured in:

```text
config/db.js
```

Database credentials are loaded from environment variables using `dotenv`.

### Database Details

| Property | Value |
|---|---|
| Database System | PostgreSQL |
| Database Name | department_management_db |
| Database Host | localhost (development) |
| Default Port | 5432 |
| Node.js Driver | pg |

### Connection Setup

1. Ensure that PostgreSQL is installed and running.
2. Create the `department_management_db` database.
3. Configure the database credentials in the `.env` file.
4. Execute the SQL schema from `database/schema.sql`.
5. Start the backend server.

The backend uses the configured database connection to perform application operations and retrieve or update records.

## 8. Database Schema

The application database contains the following five main tables:

| Table | Purpose |
|---|---|
| `users` | Stores user account and role information. |
| `departments` | Stores department information. |
| `courses` | Stores course information associated with departments. |
| `enrollments` | Stores student course enrollment and academic information. |
| `api_logs` | Stores API request and response activity for administrative monitoring. |

### Database Schema File

The SQL schema is maintained in:

```text
database/schema.sql
```

This file contains the SQL definitions required to create the application's database tables and their relationships.

### Database Relationships

- Departments are associated with courses.
- Students are associated with courses through enrollments.
- API activity is recorded in the `api_logs` table for monitoring.

The database structure supports authentication, academic management, enrollment operations, and administrative monitoring.

## 9. Authentication & Authorization

The backend implements JWT-based authentication and role-based authorization to protect application resources.

### Authentication

- Users can register and log in through the authentication APIs.
- Passwords are hashed using bcrypt before being stored in the database.
- Successful login generates JWT access and refresh tokens.
- Protected routes require a valid access token.
- Refresh tokens are used to obtain new access tokens through the refresh-token endpoint.

### Authorization

The application supports three user roles:

| Role | Access |
|---|---|
| Admin | Administrative operations and system monitoring |
| Teacher | Academic and enrollment-related operations permitted to teachers |
| Student | Student-specific academic and enrollment information |

Role-based middleware checks user permissions before allowing access to protected routes.

### Authentication Middleware

The authentication and authorization logic is implemented in:

```text
middlewares/
├── authMiddleware.js
└── roleMiddleware.js
```

These middlewares help ensure that only authenticated users with the required permissions can access protected resources.

## 10. API Documentation

The backend exposes RESTful APIs for authentication, department management, course management, student enrollments, and administrative monitoring.

**Base URL (Local Development):**

```text
http://localhost:5000/api
```

### 10.1 Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/refresh-token` | Generate a new access token |

### 10.2 Department APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/departments` | Retrieve all departments |
| GET | `/departments/:dept_id` | Retrieve department details |
| POST | `/departments` | Create a department |
| PUT | `/departments/:dept_id` | Update a department |

### 10.3 Course APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/courses` | Retrieve courses |
| POST | `/courses` | Create a course |

### 10.4 Enrollment APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/enrollments` | Enroll a student in a course |
| GET | `/enrollments/student/:student_id` | Retrieve a student's enrollments |
| PUT | `/enrollments/:enrollment_id/grade` | Update an enrollment grade |
| DELETE | `/enrollments/:enrollment_id` | Delete an enrollment |

### 10.5 Admin APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/api-logs` | Retrieve API logs |
| GET | `/admin/api-logs/:log_id` | Retrieve individual API log details |
| GET | `/admin/dashboard-stats` | Retrieve administrative dashboard statistics |

### 10.6 User APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/:user_id` | Retrieve user information |

### API Notes

- Protected endpoints require valid authentication.
- Role-based authorization applies to restricted operations.
- Request and response data are exchanged in JSON format.
- Path parameters such as `:dept_id`, `:student_id`, and `:enrollment_id` must be replaced with actual IDs.
- API responses include appropriate HTTP status codes.

## 11. Middleware

Middleware functions are used to process incoming HTTP requests before they reach the route controllers.

The backend uses the following middleware modules:

### 11.1 Authentication Middleware

**File:** `middlewares/authMiddleware.js`

- Verifies JWT access tokens.
- Identifies authenticated users.
- Protects routes that require authentication.

### 11.2 Role-Based Authorization Middleware

**File:** `middlewares/roleMiddleware.js`

- Checks the role of the authenticated user.
- Restricts access to routes based on assigned permissions.
- Supports Admin, Teacher, and Student roles.

### 11.3 API Logging Middleware

**File:** `middlewares/apiLogger.js`

- Records incoming API requests.
- Captures relevant request and response information.
- Tracks API response times and status codes.
- Sanitizes sensitive information before logging.

These middleware components help maintain security, access control, and API activity monitoring throughout the application.

## 12. API Logging & Cleanup

The backend includes an API logging system to monitor application activity and maintain a record of incoming API requests.

### API Logging

The API logging functionality is implemented in:

```text
middlewares/apiLogger.js
```

It records relevant information such as:

- HTTP request method.
- Requested API endpoint.
- Response status code.
- Request and response timing.
- Relevant request metadata.

Sensitive information is sanitized before being stored in the logs.

### Log Retention and Cleanup

The backend includes a cleanup service to prevent unlimited growth of the API logs table.

**File:** `services/cleanupService.js`

The cleanup service:

- Maintains a maximum retention limit of 5,000 API log records.
- Removes older records when the limit is exceeded.
- Deletes records in batches to limit database load.
- Runs periodically through a scheduled cleanup process.

### Log Monitoring

Administrators can retrieve API logs through the admin APIs. Log retrieval supports pagination to avoid loading too many records in a single request.


## 13. Security Implementation

The backend implements multiple security measures to protect user accounts, API endpoints, and application data.

### Security Measures

- **Password Hashing:** Uses bcrypt to securely hash user passwords.
- **JWT Authentication:** Uses access and refresh tokens for authentication.
- **Role-Based Access Control:** Restricts protected operations based on user roles.
- **CORS:** Controls cross-origin requests from the frontend.
- **Helmet:** Adds HTTP security headers.
- **Rate Limiting:** Limits incoming API requests to reduce abuse.
- **Input Validation:** Validates incoming request data.
- **SQL Injection Protection:** Uses parameterized database queries.
- **Environment Variables:** Keeps sensitive configuration and credentials outside source code.
- **API Log Sanitization:** Prevents sensitive information from being stored in API logs.

## 14. Error Handling

The backend handles errors and returns structured JSON responses to the client.

### Error Handling Approach

- Validates incoming request data before processing.
- Handles invalid or missing request parameters.
- Handles authentication and authorization failures.
- Handles database operation errors.
- Returns appropriate HTTP status codes for different error conditions.
- Provides error messages in JSON format.

### Common HTTP Status Codes

| Status Code | Description |
|---|---|
| 200 | Request successful |
| 201 | Resource created successfully |
| 400 | Bad request |
| 401 | Authentication required or invalid credentials |
| 403 | Access forbidden |
| 404 | Resource not found |
| 409 | Resource conflict |
| 500 | Internal server error |

Error responses help the frontend identify failures and display appropriate feedback to users.

## 15. Testing with Postman

The backend REST APIs were tested using Postman to verify endpoint functionality, authentication, authorization, and database operations.

### Testing Coverage

The following areas were tested:

- **Authentication:** User registration, login, and token refresh.
- **Role-Based Access:** Access permissions for Admin, Teacher, and Student roles.
- **Department Management:** Department retrieval, creation, and updates.
- **Course Management:** Course retrieval and creation.
- **Enrollment Management:** Student enrollment, enrollment retrieval, grade updates, and deletion.
- **User Management:** User profile retrieval.
- **Admin APIs:** Dashboard statistics and API log retrieval.
- **Database Integration:** Verification of database operations through API requests.

### Testing Tool

**Postman** was used to send HTTP requests, inspect JSON responses, and verify API behavior.

All implemented API modules were tested during development.

## 16. Production Setup

The backend can be configured for production deployment by following these steps:

### Production Configuration

- Set `NODE_ENV` to `production`.
- Configure production database credentials using environment variables.
- Use strong, unique JWT secrets.
- Configure CORS to allow only the deployed frontend origin.
- Keep sensitive environment variables outside the source code.
- Ensure that the PostgreSQL database is accessible to the deployed backend.

### Starting the Production Server

Install dependencies:

```bash
npm install
```

Start the application using the production start script configured in `package.json`:

```bash
npm start
```

### Deployment Considerations

- Deploy the backend to a suitable hosting environment.
- Configure the production database connection.
- Verify API connectivity between frontend and backend.
- Test authentication and protected routes after deployment.
- Monitor application logs and database availability.