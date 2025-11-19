# Next.js Todo App - Detailed Technical Specification

## 1. Project Overview

### 1.1 Application Description

A modern, JIRA-like task management application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. The application features a clean black and white UI theme with full CRUD operations for task management, user authentication, and real-time data synchronization.

### 1.2 Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React hooks and context
- **Form Validation**: Zod
- **Date Handling**: date-fns

## 2. Database Schema Design

### 2.1 Core Tables

#### Tasks Table

```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

#### Task Comments Table (Optional Enhancement)

```sql
CREATE TABLE task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own tasks
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own tasks
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own tasks
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

## 3. Application Architecture

### 3.1 Project Structure

```
todo-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── auth-callback/
│   │       └── route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── tasks/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── auth/
│   │       └── signout/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── form.tsx
│   │   ├── label.tsx
│   │   └── toast.tsx
│   ├── tasks/
│   │   ├── task-card.tsx
│   │   ├── task-form.tsx
│   │   ├── task-list.tsx
│   │   ├── task-filter.tsx
│   │   ├── task-status-badge.tsx
│   │   └── task-priority-badge.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── user-menu.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── types/
│   │   ├── database.ts
│   │   └── app.ts
│   ├── utils/
│   │   ├── date.ts
│   │   └── validation.ts
│   └── constants/
│       └── task.ts
├── hooks/
│   ├── use-tasks.ts
│   ├── use-auth.ts
│   └── use-toast.ts
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 3.2 Type Definitions

#### Database Types (lib/types/database.ts)

```typescript
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  completed_at: string | null;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}
```

#### Application Types (lib/types/app.ts)

```typescript
export interface TaskFormData {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
}

export interface TaskFilters {
  status?: "todo" | "in_progress" | "done" | "all";
  priority?: "low" | "medium" | "high" | "all";
  search?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
```

## 4. Core Features Specification

### 4.1 Authentication System

#### User Registration

- **Fields Required**: Email, Password (min 8 characters), Confirm Password
- **Validation**: Email format, password strength, password match
- **Flow**:
  1. User submits registration form
  2. Client-side validation
  3. Server-side validation
  4. Create Supabase user account
  5. Send confirmation email
  6. Redirect to login or dashboard

#### User Login

- **Fields Required**: Email, Password
- **Features**:
  - Remember me functionality
  - Password reset link
  - Error handling for invalid credentials
- **Session Management**: JWT tokens with Supabase Auth

#### Protected Routes

- **Implementation**: Next.js middleware for route protection
- **Behavior**: Redirect unauthenticated users to login page
- **User Context**: Global auth context for component access

### 4.2 Task Management

#### Task Creation

- **Required Fields**: Title, Status (default: 'todo')
- **Optional Fields**: Description, Priority, Due Date
- **Validation**:
  - Title: 1-200 characters
  - Description: 0-1000 characters
  - Due date must be in the future
- **UI**: Modal dialog with form validation
- **Optimistic Updates**: Immediate UI update with loading state

#### Task Editing

- **Inline Editing**: Quick edit for title and status
- **Full Editing**: Modal form with all fields
- **Validation**: Same as creation
- **Conflict Resolution**: Last-write-wins with timestamp checking

#### Task Deletion

- **Confirmation**: Modal confirmation dialog
- **Soft Delete**: Optional archive functionality
- **Cascade**: Delete related comments if implemented

#### Task Status Management

- **Status Options**: 'todo', 'in_progress', 'done'
- **Transitions**:
  - Any status to any status
  - Auto-set completed_at when status becomes 'done'
- **Bulk Operations**: Update multiple tasks at once

### 4.3 Task Filtering and Search

#### Filter Options

- **By Status**: Todo, In Progress, Done, All
- **By Priority**: Low, Medium, High, All
- **By Date**: Due today, This week, Overdue, All
- **Search**: Full-text search in title and description

#### Sorting Options

- **By Created Date**: Newest first, Oldest first
- **By Due Date**: Urgent first, Later first
- **By Priority**: High to Low, Low to High
- **By Title**: A-Z, Z-A

### 4.4 User Interface Components

#### Task Card Component

```typescript
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
}
```

**Features**:

- Title and description display
- Status badge with color coding
- Priority indicator
- Due date with overdue highlighting
- Action buttons (Edit, Delete, Status change)
- Hover effects and transitions

#### Task Form Component

```typescript
interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}
```

**Features**:

- Form validation with real-time feedback
- Auto-save draft functionality
- Rich text editor for description (optional)
- Date picker for due date
- Priority selector with visual indicators

#### Task List Component

```typescript
interface TaskListProps {
  tasks: Task[];
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  loading: boolean;
  error: string | null;
}
```

**Features**:

- Virtual scrolling for large lists
- Loading skeletons
- Empty state messaging
- Error state handling
- Responsive grid/list view toggle

## 5. API Design

### 5.1 RESTful Endpoints

#### Tasks API

```
GET    /api/tasks          - Get all tasks for authenticated user
POST   /api/tasks          - Create new task
GET    /api/tasks/[id]     - Get specific task
PUT    /api/tasks/[id]     - Update task
DELETE /api/tasks/[id]     - Delete task
```

#### Authentication API

```
POST   /api/auth/signup    - User registration
POST   /api/auth/login     - User login
POST   /api/auth/logout    - User logout
GET    /api/auth/session   - Get current session
```

### 5.2 Server Actions (Next.js 14)

```typescript
// app/actions/tasks.ts
"use server";

export async function createTask(data: TaskFormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return task;
}
```

## 6. UI/UX Design Specification

### 6.1 Design System

- **Color Palette**: Monochromatic (black, white, grays)
- **Typography**: System fonts with clear hierarchy
- **Spacing**: 8px grid system
- **Border Radius**: 4px for components, 8px for cards
- **Shadows**: Subtle elevation for depth

### 6.2 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### 6.3 Accessibility

- **WCAG 2.1 AA Compliance**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and roles
- **Color Contrast**: Minimum 4.5:1 ratio
- **Focus Indicators**: Visible focus states

### 6.4 User Flows

#### Task Creation Flow

1. User clicks "New Task" button
2. Modal opens with empty form
3. User fills required fields
4. Form validation occurs
5. User submits form
6. Loading state shows
7. Task appears in list
8. Success toast notification

#### Task Editing Flow

1. User clicks "Edit" on task card
2. Modal opens with pre-filled form
3. User makes changes
4. Form validation occurs
5. User submits form
6. Loading state shows
7. Task updates in list
8. Success toast notification

## 7. Performance Requirements

### 7.1 Loading Performance

- **Initial Load**: < 3 seconds on 3G
- **Task List Load**: < 1 second for 50 tasks
- **Form Submission**: < 500ms response time

### 7.2 Bundle Size

- **Initial Bundle**: < 200KB gzipped
- **Code Splitting**: Route-based and component-based
- **Lazy Loading**: For heavy components

### 7.3 Caching Strategy

- **Static Assets**: 1 year cache
- **API Responses**: 5 minute cache for lists
- **Images**: Optimized with Next.js Image component

## 8. Security Considerations

### 8.1 Authentication Security

- **Password Requirements**: Minimum 8 characters, complexity rules
- **Rate Limiting**: Login attempts limited to 5 per minute
- **Session Management**: Secure HTTP-only cookies
- **CSRF Protection**: Built into Supabase Auth

### 8.2 Data Security

- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: Protected by Supabase RLS and parameterized queries
- **XSS Prevention**: Input sanitization and output encoding
- **File Uploads**: Not implemented in MVP (future enhancement)

### 8.3 API Security

- **CORS**: Configured for specific origins
- **HTTPS**: Enforced for all communications
- **API Rate Limiting**: 100 requests per minute per user

## 9. Testing Strategy

### 9.1 Unit Testing

- **Components**: React Testing Library
- **Utilities**: Jest for pure functions
- **Custom Hooks**: React Hooks Testing Library
- **Coverage Target**: 80% minimum

### 9.2 Integration Testing

- **API Routes**: Next.js testing utilities
- **Database Operations**: Supabase test database
- **Authentication**: Mock auth flows
- **End-to-End**: Playwright for critical user flows

### 9.3 Performance Testing

- **Load Testing**: K6 for API endpoints
- **Bundle Analysis**: Webpack Bundle Analyzer
- **Lighthouse**: Performance audits

## 10. Deployment and DevOps

### 10.1 Environment Configuration

```typescript
// Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 10.2 Build Process

1. Type checking with TypeScript
2. ESLint and Prettier validation
3. Run unit tests
4. Build Next.js application
5. Generate sitemap and robots.txt
6. Optimize images

### 10.3 Deployment Platforms

- **Primary**: Vercel (recommended for Next.js)
- **Alternative**: Netlify, Railway, or DigitalOcean
- **Database**: Supabase (managed)
- **CDN**: Cloudflare (optional)

### 10.4 Monitoring and Analytics

- **Error Tracking**: Sentry integration
- **Performance**: Vercel Analytics or Google Analytics
- **Uptime**: UptimeRobot or Pingdom
- **Logs**: Vercel logs or custom logging service

## 11. Future Enhancements

### 11.1 Phase 2 Features

- Task categories and labels
- Task attachments and file uploads
- Task comments and activity feed
- Task assignments to multiple users
- Project/folder organization
- Advanced search with filters
- Task templates
- Recurring tasks
- Time tracking
- Task dependencies

### 11.2 Phase 3 Features

- Team collaboration features
- Real-time notifications
- Mobile app (React Native)
- Offline functionality
- Advanced reporting and analytics
- Integration with external tools (Slack, Email)
- API for third-party integrations
- Advanced user roles and permissions

## 12. Development Timeline

### 12.1 Week 1: Foundation

- Project setup and configuration
- Supabase setup and database schema
- Authentication implementation
- Basic layout and navigation

### 12.2 Week 2: Core Features

- Task CRUD operations
- Task list and filtering
- Basic UI components
- Form validation and error handling

### 12.3 Week 3: Polish and Testing

- UI/UX refinements
- Responsive design
- Performance optimization
- Unit and integration testing

### 12.4 Week 4: Deployment and Documentation

- Production deployment
- Documentation completion
- Bug fixes and final testing
- Performance monitoring setup

This detailed specification provides a comprehensive blueprint for building a production-ready Next.js todo application with modern best practices and scalability considerations.
