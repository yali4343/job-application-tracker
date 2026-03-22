Constraints

## 1. Build fast

This is a fast-moving portfolio project.
Always prefer the simplest professional solution.

## 2. Use MVP-first thinking

The core working app matters more than advanced features.

## 3. Avoid over-engineering

Do NOT introduce unless explicitly asked:

- Docker
- Redis
- WebSockets
- Microservices
- CQRS
- event-driven architecture
- Kubernetes
- advanced testing frameworks
- state management libraries unless truly needed

## 4. Clean code matters

All code should be:

- readable
- modular
- reasonably documented
- consistent
- interview-friendly

## 5. Explain before large changes

Before generating multiple files or large code blocks, first explain:

- what we are building
- which files will be created/updated
- why this structure is chosen

Then generate the code.

## 6. Always preserve project consistency

Do not invent a second architecture halfway through.
Use the same naming conventions and folder structure consistently.

---

# Project Architecture

## High-Level Structure

job-application-tracker/
client/
server/

## Backend structure

server/
prisma/
schema.prisma
src/
config/
controllers/
middleware/
routes/
services/
utils/
app.js
server.js
.env
package.json
prisma.config.ts

## Frontend structure

client/
src/
components/
context/
pages/
services/
App.jsx
main.jsx
package.json

---

# Core Features

## Authentication

- Register
- Login
- Logout
- Store JWT
- Protect authenticated routes

## Job Applications CRUD

Each authenticated user can:

- create application
- view own applications
- update own applications
- delete own applications

## Application Fields

Each application contains:

- company
- position
- status
- appliedDate
- notes

## Application Status Enum

Allowed values:

- APPLIED
- INTERVIEW
- OFFER
- REJECTED

## Bonus Features

Only after MVP works:

- search
- status filter
- sorting
- dashboard counters
- UI improvements
- better validation
- empty states
- error states

---

# Prisma and Database Rules

## Prisma Version Context

This project uses Prisma 7-style configuration.

Important:

- Do NOT put `url = env("DATABASE_URL")` inside `schema.prisma`
- The datasource URL must be configured in `prisma.config.ts`

## schema.prisma expected shape

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
}

enum ApplicationStatus {
APPLIED
INTERVIEW
OFFER
REJECTED
}

model User {
id Int @id @default(autoincrement())
name String
email String @unique
password String
createdAt DateTime @default(now())
applications Application[]
}

model Application {
id Int @id @default(autoincrement())
company String
position String
status ApplicationStatus @default(APPLIED)
appliedDate DateTime
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
userId Int
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

---

## prisma.config.ts expected shape

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
schema: "./prisma/schema.prisma",
datasource: {
url: env("DATABASE_URL"),
},
});

---

# Backend Implementation Requirements

## Auth Routes

POST /auth/register
POST /auth/login

## Application Routes

POST /applications
GET /applications
GET /applications/:id
PUT /applications/:id
DELETE /applications/:id

All routes must require authentication.

---

# Authentication Rules

- JWT must be stored and sent in Authorization header
- Format: Bearer <token>
- Middleware must validate token and attach user to request
- Passwords must be hashed with bcrypt

---

# Frontend Requirements

## Pages

- LoginPage
- RegisterPage
- DashboardPage

## Components

- Navbar
- ApplicationForm
- ApplicationList
- FilterBar

## Behavior

- Store token in localStorage
- Protect dashboard route
- Connect to backend via Axios

---

# Build Order

## Phase 1

- setup backend
- setup frontend
- configure Prisma
- run migration

## Phase 2

- register
- login
- JWT middleware

## Phase 3

- applications CRUD
- test with Postman

## Phase 4

- React auth
- dashboard
- CRUD UI

## Phase 5

- polish
- README
- GitHub

---

# Coding Rules

- use async/await
- keep functions small
- clear naming
- no over-engineering
- readable > clever

---

# Important Notes

- always run Prisma commands inside server folder
- do not mix frontend and backend dependencies
- keep architecture consistent
- build MVP first, improve later
