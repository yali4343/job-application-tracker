# 📊 Job Application Tracker

<p align="center"> <img src="https://komarev.com/ghpvc/?username=job-application-tracker&label=Repo%20views&color=0e75b6&style=flat"  /></p>

A modern full-stack application for tracking and managing job applications throughout your career search. Built with a focus on clarity, performance, and user experience.

Track applications, monitor their progress, and stay organized during your job search with an intuitive dashboard and powerful filtering capabilities.

## Live Demo

> The application is currently deployed and live at https://job-application-tracker-yali4343s-projects.vercel.app/

**Infrastructure:**

- **Frontend** – Hosted on [Vercel](https://vercel.com/)
- **Backend** – Hosted on [Render](https://render.com/)
- **Database** – Managed by [Neon](https://neon.tech/) (PostgreSQL)

## Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL database
- npm or yarn

### Setup (5 minutes)

**Backend:**

```bash
cd server
npm install
cp .env.example .env  # Configure DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run dev
```

**Frontend:**

```bash
cd client
npm install
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Features

- **User Authentication** - Secure registration and login with JWT tokens
- **Application Tracking** - Create, read, update, and delete job applications
- **Smart Filtering** - Search by company and position, filter by application status
- **Status Management** - Track application progress (Applied, Interview, Offer, Rejected)
- **Notes & Details** - Store interview dates, notes, and resume links
- **Professional UI** - Clean, modern interface with responsive design
- **Mobile-Ready** - Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

| Layer              | Technology                                       |
| ------------------ | ------------------------------------------------ |
| **Frontend**       | React 19, Vite, React Router, Axios, react-icons |
| **Backend**        | Express.js, Node.js                              |
| **Database**       | PostgreSQL with Prisma ORM v7                    |
| **Authentication** | JWT, bcrypt                                      |
| **Testing**        | Jest, Supertest                                  |

## Architecture & Project Structure

```
job-application-tracker/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.jsx           # Top navigation
│   │   │   ├── Footer.jsx           # Contact footer
│   │   │   ├── ApplicationList.jsx  # Applications display
│   │   │   ├── FilterBar.jsx        # Search & filter
│   │   │   └── ProtectedRoute.jsx   # Auth guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Landing page
│   │   │   ├── LoginPage.jsx        # Login form
│   │   │   ├── RegisterPage.jsx     # Registration form
│   │   │   ├── DashboardPage.jsx    # Main dashboard
│   │   │   ├── ApplicationFormPage.jsx  # Create/edit form
│   │   │   └── EditApplicationPage.jsx
│   │   ├── services/
│   │   │   ├── api.js               # Axios configuration
│   │   │   ├── authService.js       # Auth API calls
│   │   │   └── applicationService.js # Application API calls
│   │   └── design-system.css        # Global design tokens & styles
│   └── package.json
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.js
│   │   │   └── applicationController.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # JWT verification
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   └── index.js
│   │   ├── lib/
│   │   │   └── prisma.js            # Prisma client instance
│   │   ├── app.js                   # Express app configuration
│   │   └── server.js                # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── migrations/              # Database migration files
│   ├── tests/                       # Jest test suite
│   │   ├── applications.*.test.js   # Application CRUD tests
│   │   └── auth.middleware.test.js  # Authentication tests
│   └── package.json
│
├── docs/                            # Documentation
├── .github/skills/                  # Design system & guidelines
└── README.md
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login`    | Login user        |

### Job Applications (Protected)

| Method   | Endpoint                | Description                |
| -------- | ----------------------- | -------------------------- |
| `POST`   | `/api/applications`     | Create application         |
| `GET`    | `/api/applications`     | List all user applications |
| `GET`    | `/api/applications/:id` | Get specific application   |
| `PUT`    | `/api/applications/:id` | Update application         |
| `DELETE` | `/api/applications/:id` | Delete application         |

All application endpoints require JWT authentication header: `Authorization: Bearer <token>`

## Configuration

### Backend Environment Variables

Create a `.env` file in the `server/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/job_tracker?schema=public"
JWT_SECRET="your-secure-jwt-secret-key"
PORT=5000
NODE_ENV=development
```

## Testing

Run the test suite:

```bash
cd server
npm test                    # Run all tests
npm run test:auth          # Auth middleware tests
npm run test:applications  # Application CRUD tests
npm run test:watch         # Watch mode
```

The project includes comprehensive Jest + Supertest coverage for API endpoints and authentication middleware.

## Development

### Building for Production

**Frontend:**

```bash
cd client
npm run build      # Output: dist/
npm run preview    # Preview production build
```

**Backend:**

```bash
cd server
npm start          # Runs production server
```

### Common Tasks

**Database Migrations:**

```bash
cd server
npx prisma migrate dev        # Create & apply new migration
npx prisma migrate reset      # Reset database (dev only)
npx prisma studio           # Preview database data
```

**Linting & Code Quality:**

```bash
cd client
npm run lint                 # Run ESLint
```

## Database Schema

### User Model

- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Bcrypt-hashed password
- `createdAt` - Account creation timestamp
- `applications` - Relation to user's applications

### Application Model

- `id` - Primary key
- `company` - Company name
- `position` - Job position title
- `status` - Status: APPLIED, INTERVIEW, OFFER, or REJECTED
- `appliedDate` - Date application was submitted
- `notes` - Optional notes and details
- `resumeLink` - Optional resume URL
- `userId` - Foreign key to User
- `createdAt` - Created timestamp
- `updatedAt` - Last updated timestamp

## Design System

The frontend uses a comprehensive design system enforcing enterprise SaaS principles:

- **4px Grid System** - All spacing aligned to 4px baseline
- **Cool Professional Palette** - Slate-based colors for trustworthiness
- **Subtle Depth** - Single-layer shadows, no heavy layering
- **Responsive Typography** - Scales elegantly across devices
- **Accessibility First** - WCAG-compliant color contrasts and focus states

See [.github/skills/frontend-design.md](.github/skills/frontend-design.md) for detailed design guidelines.

## Features Status

### Completed

- User authentication (register/login with JWT)
- Full CRUD operations for job applications
- Application status tracking and filtering
- Dashboard with search and filtering
- Professional responsive UI
- Mobile-optimized interface
- Comprehensive test coverage
- Production-ready error handling

### Built-In Safeguards

- Protected routes require JWT authentication
- Password hashing with bcrypt (10 rounds)
- CORS enabled for frontend-backend communication
- Input validation on requests
- Comprehensive test suite (40+ tests)

## Deployment Considerations

> The application is configured for quick deployment to services like Render, Railway, or Heroku. Ensure you:
>
> - Set `NODE_ENV=production`
> - Configure a secure `JWT_SECRET`
> - Use a PostgreSQL database URL (managed or self-hosted)
> - Review CORS settings for your domain

## Learning & Contributing

This project demonstrates:

- Full-stack JavaScript development
- Clean code practices and separation of concerns
- RESTful API design
- React patterns and hooks
- Prisma ORM best practices
- Testing with Jest and Supertest
- Authentication & authorization
- Database design

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Guide](https://www.postgresql.org/docs/)
- [JWT Authentication](https://jwt.io/)

## Quick Links

- [API Reference](server/README.md)
- [Frontend Components Guide](COMPONENTS_GUIDE.md)
- [Design System](client/src/design-system.css)
- [Test Coverage](server/tests/)
