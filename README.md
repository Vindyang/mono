# Mono - Project Management Platform

A modern, full-featured project management and task tracking platform built with Next.js 16, React 19, and TypeScript. Manage workspaces, projects, and tasks with team collaboration features.

## Features

### Workspace Management
- Create and manage multiple workspaces
- Role-based access control (Owner, Admin, Member, Viewer)
- Team member invitations with email
- Member status tracking (Active, Offline, Busy)

### Project Management
- Organize work into projects within workspaces
- Color-coded project identification
- Project status tracking (Active, Archived, Completed)
- Due date management
- Project-specific team assignments

### Task Management
- Create and manage tasks with rich descriptions
- Task status workflow (Todo, In Progress, Done)
- Priority levels (Low, Medium, High)
- Task assignments to multiple users
- Drag-and-drop task organization
- Task images and attachments
- Comments and discussions
- Activity logging

### Analytics
- Task completion statistics
- Team productivity insights
- Project progress tracking

### Calendar
- Visual task scheduling
- Due date management
- Project timelines

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Component primitives
- **date-fns** - Date utilities
- **Recharts** - Data visualization
- **dnd-kit** - Drag and drop functionality
- **Lucide React** - Icons
- **next-themes** - Dark mode support

### Backend
- **Next.js API Routes** - Backend API
- **Better Auth** - Authentication
- **Prisma 7** - Database ORM
- **PostgreSQL** - Database
- **Brevo** - Email service for invitations

### Development
- **Bun** - JavaScript runtime and package manager
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your machine
- PostgreSQL database
- Node.js 18+ (for compatibility)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mono
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mono"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Email (Brevo)
BREVO_API_KEY="your-brevo-api-key"

# Optional: OAuth providers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Set up the database:
```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate dev

# Seed the database (optional)
bun run db:seed
```

5. Start the development server:
```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run db:seed` - Seed the database with sample data

## Database Management

### Prisma Commands

```bash
# Generate Prisma client
bunx prisma generate

# Create a new migration
bunx prisma migrate dev --name migration_name

# Apply migrations
bunx prisma migrate deploy

# Open Prisma Studio (database GUI)
bunx prisma studio

# Reset database (warning: deletes all data)
bunx prisma migrate reset
```

## Project Structure

```
mono/
├── app/                      # Next.js App Router
│   ├── (authenticated)/      # Protected routes
│   │   ├── analytics/        # Analytics dashboard
│   │   ├── calendar/         # Calendar view
│   │   ├── dashboard/        # Main dashboard
│   │   ├── projects/         # Project management
│   │   ├── settings/         # User settings
│   │   ├── tasks/            # Task management
│   │   └── team/             # Team management
│   ├── (public)/             # Public routes (login, signup)
│   ├── api/                  # API routes
│   └── invite/               # Invitation handling
├── components/               # React components
│   ├── ui/                   # UI components (Radix UI)
│   ├── auth/                 # Authentication components
│   └── analytics/            # Analytics components
├── hooks/                    # Custom React hooks
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Migration files
│   └── seed.ts               # Database seeding
└── public/                   # Static assets
```

## Authentication

This project uses [Better Auth](https://better-auth.com) for authentication with support for:
- Email/Password authentication
- OAuth providers (GitHub, Google)
- Session management
- Email verification

## Database Schema

The application uses PostgreSQL with the following main entities:
- **User** - User accounts and authentication
- **Workspace** - Team workspaces
- **WorkspaceMember** - Workspace membership with roles
- **Project** - Projects within workspaces
- **Task** - Tasks with status, priority, and assignments
- **Invitation** - Email-based team invitations
- **Comment** - Task comments
- **ActivityLog** - Activity tracking

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Secret key for authentication | Yes |
| `BETTER_AUTH_URL` | Base URL of the application | Yes |
| `BREVO_API_KEY` | Brevo API key for emails | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, please contact the development team or open an issue in the repository.
