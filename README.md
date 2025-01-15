# Drew Boynton's Portfolio

A modern, responsive portfolio website built with Next.js, featuring dynamic themes, device frames, and interactive project showcases.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** 
  - Tailwind CSS
  - CSS Variables for theming
  - Custom device frames
- **UI Components:** 
  - shadcn/ui components
  - Custom shine effects
  - Responsive layouts
- **Animations:** 
  - Intersection Observer for scroll animations
  - Framer Motion for navigation overlay
- **Device Frames:** 
  - react-device-frameset
  - Custom MacBook & iPhone frames
  - Responsive scaling
- **Image Carousel:** 
  - Swiper.js with 3D coverflow effect
  - Custom responsive breakpoints
  - Device-specific presentations
- **Icons:** Lucide Icons
- **Theme System:** next-themes with light/dark mode

## 🎨 Theme System

The portfolio features a sophisticated theme system that includes:

- Light theme (warm beige/tan palette)
- Dark theme (deep gray palette)
- Theme-aware components using CSS variables
- Semantic color naming
- Special treatments for:
  - Device frames
  - Project cards
  - Interactive elements
  - Shine effects

### Color Variables

```css
/* Base colors */
--background
--background-alt
--background-emphasis
--foreground

/* Component colors */
--card
--card-foreground
--popover
--popover-foreground

/* UI element colors */
--primary
--secondary
--muted
--accent

/* Container specific accent */
--accent-container

/* Footer colors */
--footer
--footer-foreground
```

## 📱 Device Frames

### iPhone Frame Features
- Dynamic notch design
- Realistic buttons and camera
- Proper screen scaling
- Touch-friendly interface

### MacBook Frame Features
- Midnight color scheme
- Camera and notch details
- Screen reflections
- Bottom bar design

## 🔥 Features

- Responsive design for all screen sizes
- Interactive project showcases with:
  - Device-specific frames (MacBook/iPhone)
  - 3D carousel navigation
  - Smooth transitions
  - Touch support
- Dynamic theme system
- Modern navigation overlay
- Optimized images
- Elegant transitions and hover effects
- Accessible UI components
- Shine effects on interactive elements

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/dmboynton56/personal-portfolio.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints for:
- Mobile: < 768px (single column, optimized frames)
- Tablet: 768px - 1024px (dual column, 1.5-2 slides)
- Desktop: > 1024px (dual column, 2-2.5 slides)
- Large Desktop: > 1280px (dual column, 2.5-3 slides)

## 🌟 Performance

- Optimized image loading with Next.js Image
- Lazy-loaded components
- Efficient theme switching
- Smooth animations
- Responsive image scaling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contact

Drew Boynton
- Email: dmboynton6@gmail.com
- LinkedIn: [Drew Boynton](https://www.linkedin.com/in/drew-boynton-1bba16180/)
- GitHub: [dmboynton56](https://github.com/dmboynton56)
```