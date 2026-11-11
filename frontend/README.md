# Frontend – Department Management System

## 1. Frontend Overview

The frontend of the Department Management System is developed using React.js and Vite. It provides an interactive user interface for managing academic and administrative operations.

The frontend communicates with the backend REST APIs to retrieve, display, and update application data.

The application provides role-specific interfaces for Admin, Teacher, and Student users.

### Key Responsibilities

- Provide user registration and login interfaces.
- Display role-based dashboards.
- Manage departments, courses, users, and enrollments.
- Provide student attendance and academic information interfaces.
- Display relevant data retrieved from backend APIs.
- Handle navigation and protected routes.
- Provide a responsive user experience across different screen sizes.

## 2. Technology Stack

The frontend is built using the following technologies and libraries:

| Technology | Purpose |
|---|---|
| React.js | Building interactive user interfaces |
| Vite | Frontend development server and build tool |
| JavaScript | Application logic and API interactions |
| HTML5 | Structuring application content |
| CSS3 | Styling and responsive layouts |
| React Router DOM | Client-side navigation and routing |
| Context API | Managing shared application state and authentication |
| Fetch API | Communicating with backend REST APIs |

These technologies provide a modular foundation for building and maintaining the application's user interface.

## 3. Frontend Features

The frontend provides role-based interfaces and modules for managing academic and administrative activities.

### Authentication
- User registration and login.
- Authentication state management.
- Protected routes for authenticated users.
- Role-based navigation.

### Admin Dashboard
- View administrative dashboard statistics.
- Manage users.
- Manage departments.
- Manage courses.
- Manage student enrollments.
- View API logs.

### Teacher Dashboard
- Access the teacher dashboard.
- View relevant academic information.
- Manage permitted academic activities.
- Access enrollment and grading functionality.

### Student Dashboard
- Access personal academic information.
- View enrolled courses.
- View grades and attendance information.

### Academic Management
- Department management.
- Course management.
- Student enrollment management.
- Grade management.
- Attendance tracking.

### User Interface
- Responsive layouts.
- Navigation between application modules.
- Integration with backend REST APIs.
- Display of API responses and operation feedback.

## 4. Frontend Folder Structure

The frontend follows a modular folder structure to organize reusable components, application pages, authentication, routing, API communication, and utility functions.

```text
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

### Folder Responsibilities

- **assets/** – Stores images, icons, and other static assets.
- **components/** – Contains reusable UI components.
- **context/** – Manages shared application state and authentication.
- **hooks/** – Contains reusable custom React hooks.
- **pages/** – Contains application pages and dashboards.
- **routes/** – Handles application routing and protected routes.
- **services/** – Manages communication with backend APIs.
- **utils/** – Contains reusable helper functions.
- **App.jsx** – Main application component.
- **App.css** – Application-level styling.
- **index.css** – Global styles.
- **main.jsx** – Frontend entry point.

## 5. Installation & Setup

Follow these steps to run the frontend locally.

### Prerequisites

Make sure the following software is installed:

- Node.js
- npm
- Git

### Step 1: Clone the Repository

```bash
git clone <your-github-repository-url>
```

### Step 2: Navigate to the Frontend Directory

```bash
cd department-management-system/frontend
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the frontend directory if the application uses environment variables.

Configure the backend API base URL according to your project setup.

### Step 5: Start the Development Server

```bash
npm run dev
```

Vite will start the frontend development server.

### Step 6: Open the Application

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

Make sure the backend server and PostgreSQL database are running for API-dependent features to work correctly.

## 6. API Base URL Configuration

The frontend communicates with the backend through a centralized API service.

### API Configuration

The API base URL is currently defined in:

```text
src/services/api.js
```

Current configuration:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### API Communication

- All frontend service modules use the centralized `apiCall()` function.
- The Fetch API is used to send HTTP requests.
- JSON is used for request and response data.
- The access token is retrieved from browser local storage.
- The access token is included in the Authorization header when available.
- API errors are handled and logged by the centralized API service.

### Production Configuration

For production deployment, update the API base URL in `src/services/api.js` to point to the deployed backend API.

## 7. Application Architecture

The frontend follows a component-based architecture using React.js.

The application separates UI components, pages, routing, shared state, and API communication into dedicated modules.

### Architecture Overview

```text
                 React Application
                        |
                     App.jsx
                        |
             Application Routing
                        |
          +-------------+-------------+
          |             |             |
       Admin         Teacher        Student
      Dashboard      Dashboard      Dashboard
          |             |             |
          +-------------+-------------+
                        |
                  React Context
                        |
                  Service Layer
                        |
                  apiCall() Function
                        |
                   Fetch API
                        |
                 Express Backend
                        |
                 PostgreSQL DB
```

### Architecture Components

- **App.jsx:** Main application component.
- **Routes:** Manage page navigation and protected routes.
- **Pages:** Render dashboards and management interfaces.
- **Components:** Provide reusable UI elements.
- **Context:** Manages shared application state.
- **Services:** Handle API requests and backend communication.
- **Hooks:** Provide reusable React functionality.
- **Utils:** Contain helper functions and utilities.

This architecture improves code organization, reusability, and maintainability.

## 7. Application Architecture

The frontend follows a component-based architecture using React.js.

The application separates UI components, pages, routing, shared state, and API communication into dedicated modules.

### Architecture Overview

```text
                 React Application
                        |
                     App.jsx
                        |
             Application Routing
                        |
          +-------------+-------------+
          |             |             |
       Admin         Teacher        Student
      Dashboard      Dashboard      Dashboard
          |             |             |
          +-------------+-------------+
                        |
                  React Context
                        |
                  Service Layer
                        |
                  apiCall() Function
                        |
                   Fetch API
                        |
                 Express Backend
                        |
                 PostgreSQL DB
```

### Architecture Components

- **App.jsx:** Main application component.
- **Routes:** Manage page navigation and protected routes.
- **Pages:** Render dashboards and management interfaces.
- **Components:** Provide reusable UI elements.
- **Context:** Manages shared application state.
- **Services:** Handle API requests and backend communication.
- **Hooks:** Provide reusable React functionality.
- **Utils:** Contain helper functions and utilities.

This architecture improves code organization, reusability, and maintainability.

## 8. Authentication & Protected Routes

The frontend implements authentication and route protection to control access to application pages.

### Authentication

- Users can log in through the login interface.
- New users can register through the registration interface.
- Authentication requests are handled through the authentication service.
- The access token is retrieved from browser local storage when making API requests.
- The token is included in the Authorization header as a Bearer token.

### Protected Routes

The application uses React Router DOM to manage navigation and protect restricted pages.

Protected routes help ensure that users must be authenticated before accessing authorized application sections.

### Authentication Architecture

```text
User Login
    |
Authentication Service
    |
Backend Authentication API
    |
Access Token
    |
Browser Local Storage
    |
Protected Routes
    |
Role-Based Dashboard
```

### Related Files

```text
src/
├── context/
├── routes/
└── services/
    ├── api.js
    └── authService.js
```

## 9. User Roles & Dashboards

The frontend provides separate dashboard interfaces for three types of users: Admin, Teacher, and Student.

### 9.1 Admin Dashboard

The Admin Dashboard provides administrative controls and system monitoring features.

- View dashboard statistics.
- Manage users.
- Manage departments.
- Manage courses.
- Manage student enrollments.
- View API activity logs.

### 9.2 Teacher Dashboard

The Teacher Dashboard provides access to academic management features.

- View assigned courses.
- View student enrollment information.
- Update student grades.
- Manage attendance information.

### 9.3 Student Dashboard

The Student Dashboard provides students with access to their academic information.

- View enrolled courses.
- Browse available courses.
- Enroll in courses.
- Drop enrolled courses.
- View academic grades.
- View attendance information.

Each dashboard provides a role-specific interface based on the user's access permissions.

## 10. API Integration

The frontend communicates with the backend through RESTful APIs using the JavaScript Fetch API.

### Centralized API Service

The API integration logic is implemented in:

```text
src/services/api.js
```

The centralized `apiCall()` function handles:

- Sending HTTP requests to the backend.
- Setting JSON request headers.
- Attaching the access token as a Bearer token when available.
- Processing JSON responses.
- Handling unsuccessful HTTP responses.
- Logging API errors.

### Service Modules

The frontend organizes API operations into separate service modules:

| Service File | Responsibility |
|---|---|
| `authService.js` | Login, registration, and token refresh |
| `adminService.js` | Dashboard statistics and API logs |
| `userService.js` | User information and dashboard statistics |
| `departmentService.js` | Department operations |
| `courseService.js` | Course operations |
| `enrollmentService.js` | Enrollment and grade operations |
| `studentService.js` | Student course and enrollment operations |
| `teacherService.js` | Teacher course, enrollment, grade, and attendance operations |

### API Request Flow

```text
React Component
      |
Service Module
      |
apiCall()
      |
Fetch API
      |
Backend REST API
      |
JSON Response
      |
Frontend Component
```

## 11. UI Components & Pages

The frontend is organized into reusable components and dedicated pages to provide a modular user interface.

### Components

The `src/components/` directory contains reusable UI elements shared across different application pages.

### Pages

The `src/pages/` directory contains the main application screens, including:

- Login and Registration pages.
- Admin Dashboard.
- Teacher Dashboard.
- Student Dashboard.
- Department Management.
- Course Management.
- User Management.
- Enrollment Management.
- Attendance Management.

### Shared Application Modules

| Directory | Responsibility |
|---|---|
| `components/` | Reusable interface elements |
| `pages/` | Application screens |
| `context/` | Shared application state |
| `routes/` | Navigation and route protection |
| `hooks/` | Reusable React hooks |
| `services/` | Backend API integration |
| `utils/` | Helper functions |

This modular approach helps maintain consistency and makes individual application modules easier to manage.

## 12. Responsive Design

The frontend is designed to provide a consistent user experience across different screen sizes and devices.

### Responsive UI Features

- Flexible layouts for different screen sizes.
- Responsive navigation and dashboard layouts.
- Adaptable tables and management interfaces.
- Consistent styling across application pages.
- Accessible interface elements and interactive controls.

The responsive design helps users access the Department Management System from desktop, tablet, and mobile devices.

## 13. Testing

The frontend was tested to verify its functionality, API integration, authentication, and user interface behavior.

### Testing Coverage

- **Authentication:** Tested login and registration workflows.
- **Protected Routes:** Verified access to authenticated application pages.
- **Role-Based Dashboards:** Tested Admin, Teacher, and Student interfaces.
- **Department Management:** Tested department-related operations.
- **Course Management:** Tested course-related operations.
- **Enrollment Management:** Tested enrollment workflows.
- **Grade Management:** Tested grade-related functionality.
- **Attendance Management:** Tested attendance-related functionality.
- **API Integration:** Verified communication with backend REST APIs.
- **User Interface:** Checked application navigation and page behavior.

Testing was performed during development to verify the frontend modules and their integration with the backend.

## 14. Screenshots

The following screenshots demonstrate the user interface and major features of the Department Management System.

### Authentication

- Login Page
- Registration Page

### Admin Dashboard

- Admin Dashboard
- User Management
- Department Management
- Course Management
- Enrollment Management

### Teacher Dashboard

- Teacher Dashboard
- Attendance Management

### Student Dashboard

- Student Dashboard

### Screenshot Directory

Frontend screenshots are maintained in:

```text
docs/screensshorts/
```

The screenshots provide a visual overview of the application's dashboards and management modules.

## 15. Deployment

The frontend application can be built for production using Vite.

### Production Build

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Generate the production build:

```bash
npm run build
```

Vite generates the optimized production files inside the `dist/` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

### Deployment Configuration

Before deploying:

- Update the backend API base URL in `src/services/api.js`.
- Ensure the deployed backend is accessible.
- Verify CORS configuration on the backend.
- Test authentication and API integration using the deployed URLs.

### Deployment Status

**Frontend Deployment URL:** To be updated after deployment.

**Backend API URL:** To be updated after deployment.