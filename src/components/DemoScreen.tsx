import image_adef9cd01acff62d93683887e4a1421f8e9eb5ad from 'figma:asset/adef9cd01acff62d93683887e4a1421f8e9eb5ad.png';
import image_39f4f9d6b35eb4d7492b57525c197fc95743a082 from 'figma:asset/39f4f9d6b35eb4d7492b57525c197fc95743a082.png';
import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import exampleImage from 'figma:asset/83b50d96bb280a1120afb29cc3676390e8682b6d.png';
import phoneImage from 'figma:asset/adef9cd01acff62d93683887e4a1421f8e9eb5ad.png';

interface DemoScreenProps {
  onComplete: () => void;
}

export function DemoScreen({ onComplete }: DemoScreenProps) {
  const [showDemo, setShowDemo] = useState(true);

  const handleGetStarted = useCallback(() => {
    setShowDemo(false);
    setTimeout(onComplete, 400);
  }, [onComplete]);



  // Loading/exit animation
  if (!showDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Beautiful gradient background during loading */}
        <div className="absolute inset-0">
          <img 
            src={exampleImage} 
            alt="TimeLens background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/15" />
        </div>
        
        <div className="text-center animate-fade-in relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-border/30"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-foreground/60 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-foreground/5 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-foreground/40 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-foreground mb-2 font-semibold tracking-tight">TimeLens</h3>
          <p className="text-muted-foreground leading-relaxed">
            Preparing your temporal experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Beautiful blue-to-purple gradient background */}
      <div className="absolute inset-0">
        <img 
          src={exampleImage} 
          alt="TimeLens - Explore time through objects" 
          className="w-full h-full object-cover"
        />
        {/* Light overlay to enhance text readability while preserving gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/5" />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* App name */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-black mb-4 font-bold tracking-tight drop-shadow-2xl text-6xl not-italic">
              TimeLens
            </h1>
            
            {/* What it does */}
            <h2 className="text-black mb-4 font-medium leading-tight drop-shadow-lg max-w-3xl mx-auto text-2xl">
              Explore the fascinating evolution of everyday objects through time
            </h2>
            
            {/* Hook */}
            <p className="text-black leading-relaxed drop-shadow-md max-w-2xl mx-auto mb-8 text-[15px]">
              Discover the hidden stories behind the things around you. From ancient origins to future possibilities, every object has an incredible journey waiting to be explored.
            </p>
          </div>

          {/* Example object image */}
          <div className="animate-fade-in [animation-delay:300ms] mb-8">
            <div className="relative max-w-sm mx-auto">
              <img 
                src={image_adef9cd01acff62d93683887e4a1421f8e9eb5ad} 
                alt="Vintage rotary telephone - example of temporal evolution" 
                className="w-full h-auto drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur-xl opacity-60 -z-10"></div>
            </div>
          </div>

          {/* Call to action */}
          <div className="animate-fade-in [animation-delay:200ms]">
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-black via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 text-white px-12 py-6 text-lg font-medium rounded-2xl transition-all duration-500 hover:scale-105 shadow-2xl group relative overflow-hidden border-0"
            >
              <span className="relative flex items-center gap-3">
                Begin Your Journey
                <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Subtle floating particles for ambiance */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-white/30 rounded-full animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-white/20 rounded-full animate-pulse [animation-delay:3s]" />
      </div>
    </div>
  );
}