# EduTech - Portfolio Project

A professional, portfolio-ready React frontend application for an Ed-Tech learning platform. This project demonstrates modern frontend development practices, clean architecture, and production-quality UI/UX.

## 🎯 Project Highlights

- **Production-Ready UI**: Polished interface with dark/light theme support
- **Role-Based Access Control**: Student and Admin dashboards with protected routes
- **Progress Tracking**: Real-time progress calculation and analytics
- **Empty States & Error Handling**: Thoughtful UX for all edge cases
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interview-Ready**: Clean code, explainable architecture, no over-engineering

## ✨ Key Features

### User Experience
- **Empty States**: Friendly messages when no data is available
- **Progress Indicators**: Visual progress bars and completion tracking
- **Error Handling**: Graceful error messages and fallbacks
- **Loading States**: Smooth transitions and visual feedback
- **Theme Toggle**: Dark/Light mode with persistent preference

### Technical Features
- **Protected Routes**: Authentication-based route protection
- **Context API**: Global state management (Auth, Learning, Theme)
- **LocalStorage Persistence**: Data persists across sessions
- **Role-Based Dashboards**: Different views for Students and Admins
- **Course Enrollment**: Students can enroll and track progress

## 🛠 Tech Stack

### Frontend Framework
- **React 19** with Hooks
- **React Router DOM 7** for navigation
- **Context API** for state management
- **Functional Components** only

### Styling & UI
- **Tailwind CSS** (utility-first)
- **Dark/Light Theme** support via CSS variables
- **Responsive Design** (mobile-first)
- **Smooth Transitions** & hover effects

### Development Tools
- **Vite** for fast development and building
- **ESLint** for code quality
- **PostCSS** & **Autoprefixer**

## 📁 Project Structure

```
src/
 ├─ layouts/          # Layout components (PublicLayout, ProtectedLayout)
 ├─ pages/            # Page components (Home, Login, Courses, Dashboards, etc.)
 ├─ components/        # Reusable components
 ├─ context/          # Context providers (AuthContext, LearningContext, ThemeContext)
 ├─ data/             # Dummy data (courses, lessons, users)
 ├─ utils/            # Utility functions
```

## 🚀 Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open your browser:**
The app will automatically open at `http://localhost:5173`

## 🔐 Demo Credentials

**Student Account:**
- Username: `student`
- Password: `student123`

**Admin Account:**
- Username: `admin`
- Password: `admin123`

## 📍 Routes

### Public Routes
- `/` - Home page with value proposition and tech stack
- `/login` - Login page
- `/signup` - Sign up page
- `/courses` - Browse all courses
- `/courses/:courseId` - Course details with lessons

### Protected Routes
- `/dashboard/student` - Student dashboard with progress tracking
- `/dashboard/admin` - Admin dashboard with course management
- `/lesson/:lessonId` - Lesson page with completion tracking

## 🎨 Design Decisions

### Architecture
- **No Backend**: Frontend-only for portfolio demonstration
- **LocalStorage**: Simulates data persistence
- **Context API**: Chosen over Redux for simplicity and interview clarity
- **Functional Components**: Modern React patterns only

### UX Improvements
- **Empty States**: Every list/collection has a friendly empty state
- **Progress Feedback**: Clear visual indicators for completion
- **Error Messages**: User-friendly error handling
- **CTAs**: Clear, action-oriented button text
- **Tech Stack Section**: Showcases technical skills on homepage

### Code Quality
- **Clean Code**: Readable, maintainable, interview-ready
- **No Over-Engineering**: Simple solutions for complex problems
- **Consistent Patterns**: Reusable components and utilities
- **Type Safety**: Ready for TypeScript migration

## 📊 Features Breakdown

### Authentication
- Login/Logout with role assignment
- Protected routes with automatic redirects
- Persistent sessions via localStorage
- Role-based dashboard routing

### Learning Management
- Course enrollment system
- Lesson completion tracking
- Progress calculation (per course & overall)
- Course and lesson navigation

### Admin Features
- Course management table
- Platform statistics
- Placeholder for future backend integration
- Clear indication of frontend-only limitations

## 🎯 Portfolio Readiness

This project is designed to be:
- **Explainable**: Every decision can be justified in an interview
- **Professional**: Production-quality UI and UX
- **Complete**: All edge cases handled with empty states
- **Modern**: Uses latest React patterns and best practices
- **Scalable**: Architecture supports easy backend integration

## 📝 Notes

- **Frontend-Only**: No backend or database required
- **Dummy Data**: All courses and lessons are hardcoded
- **LocalStorage**: Simulates data persistence
- **Theme Support**: Dark/Light mode with CSS variables
- **Responsive**: Works on all screen sizes

## 🔄 Future Enhancements (Not Implemented)

The following are intentionally not implemented to keep the project focused:
- Backend API integration
- Real user authentication
- Database persistence
- Payment processing
- Video streaming
- Real-time notifications

These can be discussed as "next steps" in interviews.

---

**Built with ❤️ for portfolio demonstration**
