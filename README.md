# Job Application Tracker

A full-stack application to help track and manage job applications with authentication and CRUD operations.

## Project Overview

This is a fast-moving portfolio project built with a focus on MVP (Minimum Viable Product) first thinking. The architecture emphasizes clean, readable code without over-engineering.

## Tech Stack

### Backend

- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma v7
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

### Frontend

- **Framework**: React + Vite
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Project Structure

```
job-application-tracker/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # React context
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── App.jsx
├── server/                 # Express backend
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── lib/            # Utilities (Prisma client)
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── .env                # Environment variables
│   ├── package.json        # Dependencies
│   └── prisma.config.ts    # Prisma configuration (v7)
```

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/job_tracker?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

4. Run Prisma migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register new user
  - Body: `{ name, email, password }`
  - Returns: `{ message, user: { id, name, email, createdAt } }`

- **POST** `/api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user: { id, name, email } }`

### Job Applications (Protected Routes - Require JWT Token)

- **POST** `/api/applications` - Create application
- **GET** `/api/applications` - Get all user's applications
- **GET** `/api/applications/:id` - Get specific application
- **PUT** `/api/applications/:id` - Update application
- **DELETE** `/api/applications/:id` - Delete application

## Database Schema

### User Model

- `id` - Auto-incremented primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `createdAt` - Account creation timestamp
- `applications` - Relation to user's applications

### Application Model

- `id` - Auto-incremented primary key
- `company` - Company name
- `position` - Job position title
- `status` - Application status (APPLIED, INTERVIEW, OFFER, REJECTED)
- `appliedDate` - Date application was submitted
- `notes` - Optional notes about the application
- `userId` - Foreign key to User
- `createdAt` - Record creation timestamp
- `updatedAt` - Last update timestamp

## Authentication

JWT tokens are used for API authentication:

- Token stored in `Authorization` header
- Format: `Bearer <token>`
- Expiration: 7 days

## Development Notes

### Key Technologies & Choices

1. **Prisma v7**: Uses PostgreSQL adapter and `prisma.config.ts` for configuration (not inline in schema)
2. **Express.js**: Simple, lightweight framework perfect for MVP
3. **JWT**: Stateless authentication without sessions
4. **bcrypt**: Industry-standard password hashing (10 salt rounds)

### Code Structure

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic (separated from controllers in future)
- **Routes**: Define API endpoints
- **Middleware**: Validate tokens, handle errors

### Running Prisma Commands

**Always run from server directory:**

```bash
cd server
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create and apply migrations
npx prisma studio       # Open Prisma Studio GUI
```

## Testing with Postman

1. Register a new user at `POST /api/auth/register`
2. Login at `POST /api/auth/login` (get JWT token)
3. Copy token and add to Authorization header: `Bearer <token>`
4. Test protected routes (applications CRUD)

## Build Order (Completed)

✅ Phase 1: Backend & Frontend setup, Prisma configuration  
✅ Phase 2: Authentication (register, login, JWT middleware)  
⏳ Phase 3: Applications CRUD endpoints (in progress)  
⏳ Phase 4: React auth UI & dashboard  
⏳ Phase 5: Polish, deploy, documentation

## Future Enhancements

- Search functionality
- Status filtering & sorting
- Dashboard with application counters
- Better form validation
- Application status timeline
- Email notifications
- File attachments for applications

## License

ISC
