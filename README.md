# personal-portfolio

## Running the Website

To run the website, use the following commands:

bash

npm install

npm run dev

# Project Structure and Design System Documentation

## Project Structure
```typescript
.
├── app/                    // Next.js app directory (pages and routes)
├── components/            // Reusable UI components
├── hooks/                // Custom React hooks
├── lib/                  // Utility functions and shared logic
├── public/              // Static assets
│   ├── images/         // Project images and screenshots
│   │   ├── projects/  // Project-specific images
│   │   └── general/   // General website images
├── styles/              // Global styles and CSS modules
```

## Tech Stack
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom configuration
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **State Management**: React Hooks

## Design System

### Colors
We use HSL color variables for consistent theming:
- `--background`: Main background color
- `--foreground`: Main text color
- `--primary`: Primary brand color
- `--secondary`: Secondary brand color
- `--muted`: Subtle background color
- `--accent`: Accent color for highlights
- `--destructive`: Error and warning colors
- `--border`: Border colors
- `--ring`: Focus ring color

### Components
1. **Base Components** (from Radix UI):
   - Accordion
   - Alert Dialog
   - Avatar
   - Button
   - Checkbox
   - Dialog
   - Dropdown Menu
   - Navigation Menu
   - Tabs
   - Toast
   - Tooltip

2. **Form Components**:
   - Input
   - Select
   - Radio Group
   - Checkbox
   - Switch
   - Slider

3. **Layout Components**:
   - Aspect Ratio
   - Collapsible
   - Scroll Area
   - Separator

### Typography
- Use Tailwind's font size utilities:
  - `text-xs`: Extra small text
  - `text-sm`: Small text
  - `text-base`: Base text size
  - `text-lg`: Large text
  - `text-xl` and up: Headings

### Spacing
Follow Tailwind's spacing scale:
- `space-1` to `space-4`: Compact spacing
- `space-6` to `space-8`: Default spacing
- `space-10` and up: Large spacing

### Animations
- Use `tailwindcss-animate` utilities
- Custom animations available:
  - `accordion-down`
  - `accordion-up`

### Border Radius
Three main sizes:
- `rounded-sm`: Small radius
- `rounded-md`: Medium radius
- `rounded-lg`: Large radius

### Best Practices
1. Use Radix UI components for accessible interactive elements
2. Implement dark mode using the `next-themes` package
3. Use Tailwind's utility classes for styling
4. Implement responsive design using Tailwind breakpoints
5. Use Framer Motion for complex animations
6. Validate forms with Zod schemas
7. Follow TypeScript strict mode guidelines

## Development Guidelines
1. Keep components small and focused
2. Use TypeScript interfaces for prop definitions
3. Implement proper error boundaries
4. Follow accessibility best practices
5. Write clean, maintainable code
6. Use proper semantic HTML elements
7. Optimize images and assets
8. Implement proper loading states
``` 