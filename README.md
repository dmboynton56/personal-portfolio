# Drew Boynton's Portfolio

A modern, responsive portfolio website built with Next.js and featuring a dynamic theme system.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Theme System:** Custom theme implementation with CSS variables
- **UI Components:** shadcn/ui
- **Animations:** 
  - Intersection Observer for scroll animations
  - Framer Motion for smooth transitions
- **Device Frames:** react-device-frameset
- **Image Carousel:** Swiper.js
- **Icons:** Lucide Icons

## 🎨 Theme System

The portfolio features a sophisticated theme system that includes:

- Light theme (warm beige/tan palette)
- Dark theme (deep gray palette)
- Theme-aware components using CSS variables
- Semantic color naming (background, foreground, muted, etc.)
- Special treatments for:
  - Alternating section backgrounds
  - Footer-specific colors
  - Emphasis areas
  - Component-specific styling

### Color Variables

The theme system uses CSS variables for consistent styling:

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

/* Footer colors */
--footer
--footer-foreground
```

## 📁 Project Structure

```
personal-portfolio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/            # Reusable UI components
│   ├── Header.tsx
│   ├── ProfileSection.tsx
│   ├── AboutSection.tsx
│   ├── WorkSection.tsx
│   ├── ContactSection.tsx
│   ├── NavigationOverlay.tsx
│   ├── ProjectCarousel.tsx
│   └── ThemeToggle.tsx
├── styles/
│   └── device-frames.css
├── lib/
│   └── utils.ts
├── public/
│   └── images/
└── tailwind.config.ts
```

## 🔥 Features

- Responsive design for all screen sizes
- Smooth scroll animations
- Interactive project showcases
- Device-specific project previews (mobile/desktop)
- Theme-aware color system
- Modern navigation overlay
- Optimized images with Next.js Image component
- Elegant transitions and hover effects
- Accessible UI components

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personal-portfolio.git
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Customization

### Themes

The theme system can be customized in `app/globals.css`. Each theme (light/dark) defines its own set of CSS variables that control the color scheme throughout the application.

### Components

All components are built with theme awareness in mind and can be customized through:
- Tailwind CSS classes
- CSS variables
- Component-specific props

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints for:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1280px

## 🌟 Performance

- Optimized image loading with Next.js Image component
- Lazy-loaded components
- Efficient theme switching without flash
- Smooth animations optimized for performance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contact

Drew Boynton
- Email: dmboynton6@gmail.com
- LinkedIn: [Drew Boynton](https://www.linkedin.com/in/drew-boynton-1bba16180/)
- GitHub: [dmboynton56](https://github.com/dmboynton56)
```
