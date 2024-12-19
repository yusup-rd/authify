# Authify

> Test Task Fullstack Application.

Authify is a user management system built using **Next.js** (frontend) and **NestJS** (backend). It features user registration, authentication, profile management, and secure password handling. The project uses **Tailwind CSS** for UI and **PostgreSQL** as the database.

## Features

- **User Registration**: Secure registration with validation and password hashing.
- **Authentication**: JWT-based authentication for secure user sessions.
- **Profile Management**: View and update user profiles with email uniqueness checks.
- **Password Management**: Change password functionality with password strength validation.
- **API Documentation**: Swagger API docs available at `/api-docs`.
- **Security Features**: Password hashing with bcrypt, HTTP headers, input validation.

## Setup Instructions

### Prerequisites
- Node.js >= 16.x
- PostgreSQL database
- npm or yarn package manager

### Backend
1. Navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
> - Copy the **backend/.env.example** file to **backend/.env**.
> - Replace placeholder values with your actual configuration.

4. Start the server:
```bash
npm run start:dev
```
> - The backend API will be available at http://localhost:8000.

5. Access API documentation at Swagger:
> - http://localhost:8000/api-docs

### Frontend
1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
> - Copy the **frontend/.env.example** file to **frontend/.env**.
> - Replace placeholder values with your actual configuration.

4. Start the development server:
```bash
npm run dev
```
> - The frontend will be available at http://localhost:3000.

## Testing
### Backend
Run unit and integration tests:
```bash
cd backend
npm test
```

### Frontend
Run unit tests:
```bash
cd frontend
npm test
```
## Contact
For any inquiries, please contact me at yusuprd@icloud.com.
