# Portfolio Project Architecture & Tech Stack Analysis

## Core Architecture: Next.js 14 App Router

The portfolio is built on **Next.js 14** using the modern App Router architecture. Here's how everything fits together:

### Tech Stack Foundation
- **Next.js 14**: React framework with App Router for routing, SSG, and performance
- **TypeScript**: Type safety across the entire codebase
- **Tailwind CSS**: Utility-first styling with custom design system
- **Radix UI**: Headless, accessible component primitives
- **Framer Motion**: Animation library
- **Supabase**: Backend-as-a-Service for database operations
- **Shadcn/ui**: Component library built on Radix + Tailwind

## Directory Structure & Relationships

### `/app` - Next.js App Router Core
```
app/
├── layout.tsx          # Root layout with theme provider
├── page.tsx           # Homepage with all sections
├── globals.css        # Global styles + CSS variables
├── api/
│   └── mancala-stats/ # API endpoint for game statistics
└── workout-logger/    # Empty directory (future feature?)
```

**Key insights:**
- Single-page application structure - everything renders on the main page
- API routes handle Supabase interactions
- Theme system using CSS custom properties

### `/components` - UI Component Architecture
```
components/
├── [Feature Components]     # Page sections (Header, ProfileSection, etc.)
├── [Interactive Components] # MancalaGame, ProjectCarousel, etc.
└── ui/                     # Shadcn/ui component library
```

**Component relationships:**
- **Page sections**: Header → ProfileSection → AboutSection → WorkSection → ContactSection
- **Reusable components**: ThemeToggle, ProjectCarousel, various interactive demos
- **UI primitives**: 40+ Radix-based components in `/ui` folder

### `/public` - Static Assets & Data
```
public/
├── images/           # Project screenshots, profile images, icons
├── data/            # JSON files for predictions/data
│   ├── daily_bias_predictions.json
│   └── nba_hof_predictions.json
└── [favicons]       # Various icon formats
```

**Data flow**: JSON files are consumed by components like `DailyBiasDisplay` and `NBAHofDisplay`

### `/models` - Machine Learning Models
Contains 12 pickle files (3 ETFs × 4 model types):
- Random Forest models for bias prediction
- Label encoders for data preprocessing
- Used by the Python script for daily predictions

### `/scripts` - Automation
- **`fetch-daily-bias.py`**: Loads ML models, fetches live market data, generates predictions
- **`generate-favicon.js`**: Icon generation utility

### `/lib` & `/hooks` - Utilities
- **`/lib/utils.ts`**: Single utility function for Tailwind class merging
- **`/hooks`**: React hooks for mobile detection and toast notifications

## Data Flow & Interactions

### 1. **Static Data Pipeline (WIP)**
```
GitHub Actions (daily 9:30 EST) 
→ Python script loads ML models 
→ Fetches live market data 
→ Generates predictions 
→ Updates JSON files 
→ Auto-commits to repo
```

### 2. **Interactive Game Data**
```
MancalaGame component 
→ API route (/api/mancala-stats) 
→ Supabase database 
→ Real-time game statistics
```

### 3. **Theme System**
```
ThemeProvider (next-themes) 
→ CSS custom properties 
→ Tailwind classes 
→ Dark/light mode switching
```

## Key Technologies & How They Interact

### **Styling Architecture**
- **Tailwind CSS**: Utility classes for rapid development
- **CSS Custom Properties**: Theme variables in `globals.css`
- **Component styling**: Shine borders, aurora backgrounds, custom animations
- **Responsive design**: Mobile-first approach

### **Component System**
- **Radix UI**: Accessible primitives (dialogs, tooltips, etc.)
- **Shadcn/ui**: Pre-built components using Radix + Tailwind
- **Custom components**: Built on top of the design system

### **Performance Optimizations**
- **Static generation**: Pre-built at build time
- **Image optimization**: Next.js Image component with unoptimized flag
- **Code splitting**: Automatic with Next.js App Router

## Safe Development Guidelines

### **What you can safely modify:**

1. **Content changes**: Update text, images, project data in components
2. **Styling tweaks**: Modify Tailwind classes, CSS custom properties
3. **Component additions**: Add new sections or interactive elements
4. **API endpoints**: Add new routes in `/app/api`

### **Be careful with:**

1. **`tailwind.config.ts`**: Changes affect the entire design system
2. **`globals.css`**: CSS variables control theming across the site
3. **Component dependencies**: Many components rely on shared utilities
4. **ML model files**: Don't modify unless you understand the prediction pipeline

### **Critical dependencies:**

- **Path aliases**: `@/*` maps to root directory
- **Theme system**: Components expect CSS custom properties to exist
- **Supabase config**: Environment variables required for database
- **Python dependencies**: Required for the daily prediction automation

## Project Overview

The project is well-architected with clear separation of concerns. The component structure is modular, making it easy to modify individual sections without breaking others. The automation pipeline is isolated from the UI, so you can safely work on the frontend without affecting the ML predictions.

This is a single-page portfolio application that showcases projects, skills, and includes interactive demonstrations of machine learning models and games. The architecture supports both static content and dynamic features while maintaining excellent performance and user experience.
