# IQM Employee Task System

Modern Task Management Dashboard for Leads and Employees.

## Features
- **Role-based Dashboards**: distinct views for Lead Managers and Employees.
- **Task Management**: Create, assign, and track modules.
- **Skill Matrix (SVM)**: Visual rating system for employee skills.
- **Documents Repository**: Upload and download project files.
- **Gamification**: Leaderboard to motivate performance.
- **Responsive Design**: Mobile-friendly layout (Sidebar toggles on mobile - *Coming Soon*, currently hidden).

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure
- `app/dashboard/lead`: Lead Dashboard Page
- `app/dashboard/employee`: Employee Dashboard Page
- `app/components`: Reusable UI components (Sidebar, Header, Tables, etc.)

## Design Assets
- **Logo**: IQM Branding (Deep Purple)
- **Theme**: Custom `iqm-purple` scheme defined in `globals.css`.
