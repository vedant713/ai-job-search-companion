# AI Job Assistant

A comprehensive AI-powered job application tracking and career management platform built with Next.js, TypeScript, Supabase, and Google Gemini AI.

## Features

### 🎯 Core Functionality
- **Job Application Tracking**: Manage applications with status tracking, notes, and filters
- **Skill Development**: Visualize skill gaps with radar charts and AI recommendations
- **Smart To-Do Management**: Context-aware tasks with priority levels and due dates
- **AI Career Assistant**: Chat interface powered by Google Gemini for personalized advice

### 🤖 AI Capabilities
- Resume enhancement and optimization
- Cover letter writing assistance
- Interview preparation and practice questions
- Job description analysis
- Skill gap identification
- Networking message templates
- Salary negotiation guidance

### 📊 Analytics & Visualization
- Application status dashboard with charts
- Skill progression tracking
- Weekly activity monitoring
- Response rate analytics

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for serverless functions
- **Supabase** for database and authentication
- **PostgreSQL** (via Supabase)

### AI Integration
- **Google Gemini API** for natural language processing
- **gemini-2.5-flash** model for fast and accurate responses
- Context-aware responses
- Personalized career advice

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase project
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-job-assistant
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# AI Integration
GEMINI_API_KEY="your-google-gemini-api-key"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

4. **Run the development server**
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
ai-job-assistant/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── applications/         # Job applications CRUD
│   │   ├── skills/              # Skills management
│   │   ├── tasks/               # Task management
│   │   └── ai/                  # AI chat integration
│   ├── dashboard/               # Main application pages
│   │   ├── applications/        # Applications management
│   │   ├── skills/             # Skill visualization
│   │   ├── todos/              # Task management
│   │   └── ai-assistant/       # AI chat interface
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing/login page
├── components/                  # Reusable components
│   ├── ui/                     # shadcn/ui components
│   ├── app-sidebar.tsx         # Navigation sidebar
│   ├── login-form.tsx          # Authentication form
│   └── auth-provider.tsx       # Authentication context
├── lib/                        # Utility libraries
│   ├── types.ts               # TypeScript interfaces
│   ├── auth.ts                # Authentication utilities
│   ├── gemini.ts              # AI integration
│   └── supabase.ts            # Supabase client
└── README.md
```

## Key Features Explained

### 1. Dashboard Overview
- Real-time application statistics
- Visual charts for status tracking
- Quick AI assistant access
- Upcoming task reminders

### 2. Application Management
- Full CRUD operations for job applications
- Status filtering and search functionality
- Notes and timeline tracking
- Export capabilities

### 3. Skill Development
- Interactive radar charts comparing current vs target skills
- AI-powered skill recommendations
- Learning resource suggestions
- Progress tracking over time

### 4. Smart Task Management
- Context-aware task creation
- Priority-based organization
- Due date tracking and reminders
- AI-suggested tasks based on applications

### 5. AI Assistant Integration
- Natural language processing with Google Gemini
- Context-aware responses
- Prompt suggestions for common scenarios
- Conversation history and analytics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Applications
- `GET /api/applications` - Fetch user applications
- `POST /api/applications` - Create new application
- `PUT /api/applications` - Update application
- `DELETE /api/applications` - Delete application

### Skills
- `GET /api/skills` - Fetch user skills
- `POST /api/skills` - Add new skill
- `PUT /api/skills` - Update skill proficiency

### Tasks
- `GET /api/tasks` - Fetch user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks` - Update task status

### AI Integration
- `POST /api/ai/chat` - Send message to AI assistant
- `GET /api/ai/suggestions` - Get AI-powered suggestions

## Database Schema

The application uses a Supabase (PostgreSQL) database. The schema is managed via Supabase but generally includes:
- `applications` - Job application tracking
- `skills` - User skills and proficiency levels
- `tasks` - To-do items with context and priorities
- `notifications` - System notifications

## Security Features

- Supabase Auth for user management
- Row Level Security (RLS) policies
- Environment variable protection
- Rate limiting on API endpoints

## Performance Optimizations

- Server-side rendering with Next.js
- Image optimization
- Code splitting and lazy loading
- Database indexing
- Caching strategies
- Optimized bundle size

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Set up production database
3. Configure environment variables
4. Deploy to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ section

## Roadmap

### Upcoming Features
- Mobile app development
- Advanced analytics dashboard
- Integration with job boards
- Team collaboration features
- Advanced AI coaching
- Resume parsing and optimization
- Interview scheduling integration
- Salary benchmarking tools

### Version History
- v1.0.0 - Initial release with core features
- v1.1.0 - Enhanced AI capabilities
- v1.2.0 - Mobile responsiveness improvements
- v2.0.0 - Advanced analytics and reporting
