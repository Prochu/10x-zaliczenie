# BetBuddy

A responsive web application designed for a closed group of friends to bet on UEFA Champions League matches. BetBuddy automates the process of tracking matches, user bets, and calculating scores with real-time updates and a live leaderboard.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

BetBuddy solves the problem of manually managing predictions and tracking scores for Champions League matches. The application provides a centralized, automated platform that:

- Fetches match data from the [api-football.com](https://www.api-football.com/) API
- Allows users to place and edit bets before match kickoff
- Automatically locks bets 5 minutes before kickoff
- Updates scores live during matches
- Calculates points using a mutually exclusive scoring system
- Displays real-time leaderboards
- Provides an admin panel for manual score corrections

The user interface follows Material Design principles with a light theme and blue primary color, ensuring a clean and intuitive experience on all modern web browsers.

### Key Features

- **User Management**: Third-party authentication (Google, Facebook, Apple) with unique nickname creation
- **Match Betting**: Submit and edit score predictions for upcoming Champions League matches
- **Automatic Locking**: Bets are locked 5 minutes before kickoff with countdown timers
- **Live Updates**: Real-time score updates and automatic leaderboard recalculation
- **Scoring System**:
  - 4 points for exact score prediction
  - 2 points for correct winner and goal difference (or draw)
  - 1 point for correct winner only
- **Admin Panel**: Manual score updates with automatic point recalculation
- **Match History**: View past matches with final scores, predictions, and points earned

## Tech Stack

### Frontend

- **[Astro](https://astro.build/)** v5 - Modern web framework for building fast, content-focused websites
- **[React](https://react.dev/)** v19 - UI library for building interactive components
- **[TypeScript](https://www.typescriptlang.org/)** v5 - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** v4 - Utility-first CSS framework

### Backend & Database

- **[Supabase](https://supabase.com/)** - Backend-as-a-Service providing authentication, database, and real-time capabilities

### CI/CD & Hosting

- **GitHub Actions** - Continuous Integration and Deployment
- **DigitalOcean** - Cloud hosting platform

## Getting Started Locally

### Prerequisites

- **Node.js** v22.14.0 (as specified in `.nvmrc`)
- **npm** (comes with Node.js)
- **Supabase account** - For database and authentication setup

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd 10x-zaliczenie
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory with your Supabase credentials:

   ```env
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:4321` (or the port shown in your terminal)

### Additional Setup

- Configure Supabase authentication providers (Google, Facebook, Apple) in your Supabase dashboard
- Set up the database schema according to the project requirements
- Configure the api-football.com API key for match data fetching
- **Set up Supabase Cron Jobs** for automated match synchronization - see [SUPABASE_CRON_SETUP.md](./SUPABASE_CRON_SETUP.md)

## Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint to check for code quality issues
- `npm run lint:fix` - Automatically fix ESLint issues where possible
- `npm run format` - Format code using Prettier

## Project Scope

### In Scope (MVP)

- Single, global group for all users
- Fixed scoring model as defined in the functional requirements
- Score prediction betting only
- Core features: user management, betting, live updates, and admin overrides
- Responsive web application for modern desktop and mobile browsers
- API request management (100 requests/day limit with 10-minute update intervals)

### Out of Scope (Post-MVP)

- Creation and management of private user groups
- Different or customizable scoring models
- Bonus points or alternative betting types (e.g., first goal scorer, number of corners)
- Push notifications or email alerts
- User analytics and performance tracking

## Project Status

🚧 **In Development** - This project is currently under active development.

### Current Status

The project is in the initial development phase. Core features are being implemented according to the Product Requirements Document (PRD).

### Success Metrics

- **Accuracy**: 100% accuracy in point calculation according to scoring rules
- **API Management**: Operating within the 100 requests/day limit
- **Reliability**: Minimal need for admin manual overrides
- **User Engagement**: High percentage of registered users actively placing bets
- **User Experience**: Simple, clear, and intuitive interface
- **Performance**: Maximum 10-minute latency for live match updates

## License

MIT

---

For detailed product requirements and user stories, refer to the [Product Requirements Document](./.ai/prd.md).
