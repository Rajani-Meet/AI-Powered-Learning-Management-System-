# Learning Management System (LMS)

A full-stack Learning Management Platform built with Next.js 15, TypeScript, PostgreSQL, and AI integration.

## Features

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Instructor, Student)
- Email/password authentication with NextAuth
- First-time password setup for invited users

### 👨‍💼 Admin Features
- User management (invite/create users)
- Course management and student allocation
- System analytics and reporting
- PDF/Excel report generation

### 🎓 Instructor Features
- Course creation and management
- Live lecture scheduling with Zoom integration
- Video upload and AI transcription
- Assignment and quiz creation
- Student grading interface

### 👨‍🎓 Student Features
- Course enrollment and progress tracking
- Video lectures with AI-powered features
- Assignment submission
- Quiz taking with auto-grading
- Progress reports

### 🤖 AI Integration
- OpenAI Whisper for video transcription
- AI-generated lecture summaries
- Smart transcript search
- AI chat for Q&A per lecture

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI**: OpenAI API (Whisper, GPT)
- **Email**: SMTP with Nodemailer
- **Charts**: Recharts
- **Reports**: PDFKit, SheetJS

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/lms"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   OPENAI_API_KEY="your-openai-api-key"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM="your-email@gmail.com"
   STORAGE_PATH="./storage"
   ```

5. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Default Users
- Admin: admin@example.com / admin123
- Instructor: instructor@example.com / instructor123
- Student: student@example.com / student123

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── instructor/        # Instructor pages
│   ├── student/           # Student pages
│   └── auth/              # Authentication pages
├── components/            # Reusable components
├── lib/                   # Utility functions
├── prisma/               # Database schema
├── storage/              # File storage
└── public/               # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/set-password` - Set password on first login

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/invite` - Invite new user
- `GET /api/admin/courses` - Get all courses
- `GET /api/admin/reports/pdf` - Generate PDF report
- `GET /api/admin/reports/excel` - Generate Excel report

### Courses
- `GET /api/courses/[id]` - Get course details
- `POST /api/courses/[id]/lectures` - Create lecture
- `POST /api/courses/[id]/assignments` - Create assignment
- `POST /api/courses/[id]/quizzes` - Create quiz

### Lectures
- `POST /api/lectures/[id]/upload` - Upload video
- `POST /api/lectures/[id]/transcribe` - Transcribe video
- `POST /api/lectures/[id]/chat` - AI chat
- `GET /api/lectures/[id]/search` - Search transcript

### Assignments
- `GET /api/assignments/[id]` - Get assignment
- `POST /api/assignments/[id]/submit` - Submit assignment
- `POST /api/assignments/[id]/grade` - Grade submission

### Quizzes
- `GET /api/quizzes/[id]` - Get quiz
- `POST /api/quizzes/[id]/start` - Start quiz attempt
- `POST /api/quizzes/[id]/submit` - Submit quiz

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set up production database and environment variables

3. Deploy to your preferred platform (Vercel, Railway, etc.)

## License

MIT License