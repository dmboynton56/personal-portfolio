# personal-portfolio

## Running the Website

To run the website, use the following commands:

```bash
npm install
npm run dev
```

# Project Structure and Design System Documentation

## Project Structure
```typescript
.
├── app/                    // Next.js app directory
│   ├── layout.tsx         // Root layout component
│   ├── page.tsx           // Home page
│   └── globals.css        // Global styles
├── components/            // Reusable UI components
│   ├── ui/               // Base UI components
│   ├── ProfileSection.tsx // Profile/Hero section
│   ├── WorkSection.tsx    // Projects showcase
│   ├── Header.tsx        // Navigation header
│   └── NavigationOverlay.tsx // Mobile navigation
├── hooks/                // Custom React hooks
├── lib/                  // Utility functions
├── public/              // Static assets
│   └── images/         // Project images
│       ├── projects/  // Project-specific images
│       └── general/   // General website images
```

## Tech Stack
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom configuration
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion

## Design System

### Colors
We use a warm, eye-friendly color scheme:
- `#F5F1EA`: Main background (warm beige)
- `#E8E2D7`: Secondary background (lighter beige)
- `#2C2C2C`: Primary text
- `#4A4A4A`: Secondary text
- `#111111`: Navigation background

### Components
1. **Layout Components**:
   - Header
   - Navigation Overlay
   - Profile Section
   - Work Section

2. **UI Components**:
   - Button
   - Image Display
   - Project Card

### Typography
- Use Inter font family
- Font sizes:
  - Headings: text-4xl/text-5xl
  - Subheadings: text-2xl/text-3xl
  - Body: text-base/text-lg

### Best Practices
1. Use semantic HTML
2. Implement responsive design
3. Optimize images
4. Follow accessibility guidelines
5. Maintain consistent spacing
6. Use proper color contrast
``` 