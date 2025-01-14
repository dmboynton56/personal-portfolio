```
markdown:README.md

```
# personal-portfolio

## Running the Website


To run the website, use the following commands:

bash
npm install
npm run dev


This will start the development server at http://localhost:3000 (by default).

---

## Project Structure and Design System

### Project Structure
```
.
├── app/                    // Next.js app directory
│   ├── layout.tsx         // Root layout component
│   ├── page.tsx           // Home page
│   └── globals.css        // Global styles and Swiper/device frames customization
├── components/            // Reusable UI components
│   ├── ui/                // Base UI components
│   ├── ProfileSection.tsx // Profile/Hero section
│   ├── WorkSection.tsx    // Projects showcase with device frames (MacBook/iPhone)
│   ├── ProjectCarousel.tsx// 3D device frames & Swiper coverflow
│   ├── Header.tsx         // Navigation header
│   ├── NavigationOverlay.tsx // Mobile navigation
│   └── MacbookFrame.tsx   // Optional custom MacBook device frame
├── hooks/                 // Custom React hooks
├── lib/                   // Utility functions
├── public/
│   └── images/
│       └── projects/      // Project images
└── styles/
    └── device-frames.css  // Custom styles for device frames
```

### Tech Stack
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS  
- **Device Frames**: react-device-frameset (iPhone X, MacBook Pro, etc.)
- **Carousel**: Swiper with 3D coverflow effect and custom breakpoints
- **Animations**: Framer Motion (optional for fade/slide transitions)

### Design System

#### Colors
- `#F5F1EA`: Main background (warm beige)  
- `#E8E2D7`: Secondary background (lighter beige)  
- `#2C2C2C`: Primary text  
- `#4A4A4A`: Secondary text  
- `#111111`: Navigation background  

#### Components
1. **Layout Components**  
   - Header  
   - Navigation Overlay  
   - Profile Section  
   - Work Section  
   - Project Carousel (with 3D coverflow)  
2. **UI Components**  
   - Button  
   - Image Displays  
   - Project Cards  
   - Swiper Carousel with react-device-frameset

#### Typography
- Inter font family
- Font sizes:
  - Headings: text-4xl/text-5xl
  - Subheadings: text-2xl/text-3xl
  - Body: text-base/text-lg

#### Interactive Elements
1. **Project Carousel**  
   - 3D coverflow effect using Swiper  
   - Touch-enabled swipe gestures  
   - Navigation arrows and pagination  
   - Integrates react-device-frameset for iPhone/MacBook frames  
   - Responsive with scalable frames  
   - Infinite loop scrolling  
2. **Hover Effects**  
   - Subtle scale on images and frames for interactivity  

---

## Notes on Device Frames
We’ve introduced “react-device-frameset” for consistent desktop (MacBook) and mobile (iPhone) mockups in the WorkSection and ProjectCarousel components. This replaces or complements any manually-coded frames and simplifies responsive design.

---

© 2025 – personal-portfolio
```
