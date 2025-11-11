'use client'

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  SiPython, SiTypescript, SiReact, SiNextdotjs, SiSwift, 
  SiPandas, SiNodedotjs, SiPostgresql, SiMongodb 
} from 'react-icons/si';

const technologies = [
  { name: 'Python', icon: SiPython, color: '#3776AB' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { name: 'React', icon: SiReact, color: '#61DAFB' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#000000' },
  { name: 'Swift', icon: SiSwift, color: '#FA7343' },
  { name: 'Pandas', icon: SiPandas, color: '#150458' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
  { name: 'PostgreSQL', icon: SiPostgresql, color: '#336791' },
  { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
];

export function TechCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % technologies.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getVisibleTechs = () => {
    const visible = [];
    for (let i = 0; i < 5; i++) {
      const index = (currentIndex + i) % technologies.length;
      visible.push({
        ...technologies[index],
        position: i,
      });
    }
    return visible;
  };

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      <div 
        className="relative h-28 overflow-hidden rounded-2xl backdrop-blur-sm bg-background/50"
        style={{
          border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(99, 102, 241, 0.7)'}`,
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(139, 92, 246, 0.25)'
            : '0 25px 50px -12px rgba(99, 102, 241, 0.20)'
        }}
      >
        <div className="flex items-center justify-center h-full px-8">
          <div className="flex items-center gap-12 relative">
            {getVisibleTechs().map((tech, idx) => {
              const Icon = tech.icon;
              const isCenter = tech.position === 2;
              const opacity = isCenter ? 1 : tech.position === 1 || tech.position === 3 ? 0.6 : 0.3;
              const scale = isCenter ? 1.1 : tech.position === 1 || tech.position === 3 ? 0.9 : 0.7;
              const blur = isCenter ? 0 : tech.position === 1 || tech.position === 3 ? 0.5 : 1.5;
              
              return (
                <div
                  key={`${tech.name}-${idx}`}
                  className="relative transition-all duration-1000 ease-out"
                  style={{
                    opacity,
                    transform: `scale(${scale})`,
                    filter: `blur(${blur}px)`,
                  }}
                >
                  <div className="relative group flex flex-col items-center">
                    {/* Enhanced quadruple-layered glow effects */}
                    {isCenter && (
                      <>
                        <div
                          className="absolute inset-0 rounded-full blur-3xl opacity-25 animate-pulse"
                          style={{
                            background: `radial-gradient(circle, ${tech.color}80, ${tech.color}40 30%, transparent 60%)`,
                            transform: 'scale(5)',
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse"
                          style={{
                            background: `radial-gradient(circle, ${tech.color}90, ${tech.color}50 40%, transparent 70%)`,
                            transform: 'scale(4)',
                            animationDelay: '0.3s'
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse"
                          style={{
                            background: `radial-gradient(circle, ${tech.color}95, ${tech.color}60 50%, transparent 70%)`,
                            transform: 'scale(3)',
                            animationDelay: '0.6s'
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-full blur-lg opacity-80"
                          style={{
                            background: `radial-gradient(circle, ${tech.color}, transparent 60%)`,
                            transform: 'scale(2.5)',
                          }}
                        />
                      </>
                    )}
                    
                    {/* Icon with enhanced styling */}
                    <div className="relative z-10 mb-2">
                      <Icon
                        className={`w-10 h-10 transition-all duration-1000 ${
                          isCenter ? 'drop-shadow-2xl' : ''
                        }`}
                        style={{ 
                          color: isCenter ? tech.color : `${tech.color}CC`,
                          filter: isCenter ? `drop-shadow(0 0 16px ${tech.color}) brightness(1.1)` : 'none'
                        }}
                      />
                    </div>
                    
                    {/* Tech name positioned closer to icon */}
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                      <span 
                        className={`text-xs font-medium transition-all duration-1000 ${
                          isCenter ? 'text-foreground' : 'text-muted-foreground/60'
                        }`}
                        style={{
                          textShadow: isCenter ? `0 0 12px ${tech.color}60` : 'none'
                        }}
                      >
                        {tech.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Theme-aware inner border glow */}
        <div 
          className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none"
          style={{
            border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.4)'}`,
          }}
        />
      </div>
    </div>
  );
} 