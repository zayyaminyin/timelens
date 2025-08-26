import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Camera, Upload, ArrowRight, Clock, Sparkles } from 'lucide-react';

interface OnboardingScreensProps {
  onComplete: () => void;
}

export function OnboardingScreens({ onComplete }: OnboardingScreensProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const nextScreen = () => {
    if (currentScreen < 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  if (currentScreen === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center max-w-md mx-auto">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center backdrop-blur-xl">
                <div className="relative">
                  <Clock className="w-10 h-10 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Title and subtitle */}
          <div className="mb-12">
            <h1 className="text-4xl font-medium text-white mb-4 tracking-wide">
              Step into Time
            </h1>
            <p className="text-xl text-white/70 leading-relaxed">
              Explore the past, present, and future of the world around you.
            </p>
          </div>

          {/* Illustration - Timeline with arrows */}
          <div className="mb-12">
            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
              <div className="flex items-center justify-center space-x-6">
                {/* Past */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-2 shadow-lg">
                    <ArrowRight className="w-6 h-6 text-white rotate-180" />
                  </div>
                  <span className="text-sm text-white/60">Past</span>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 rounded-full relative shadow-inner">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg animate-pulse"></div>
                </div>

                {/* Future */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-orange-500 flex items-center justify-center mb-2 shadow-lg">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-white/60">Future</span>
                </div>
              </div>
            </div>
          </div>

          {/* Get Started Button */}
          <Button 
            onClick={nextScreen}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  // Permissions screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-6">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-blue-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-16 h-16 bg-purple-400/30 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        <h2 className="text-3xl font-medium text-white mb-4">Enable Time Travel</h2>
        <p className="text-lg text-white/70 mb-8">
          Allow camera and gallery access to explore objects through time.
        </p>

        <div className="space-y-4 mb-8">
          {/* Camera Permission */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-white">Camera Access</h3>
                <p className="text-sm text-white/60">Take photos to explore in time</p>
              </div>
            </div>
          </Card>

          {/* Gallery Permission */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-white">Gallery Access</h3>
                <p className="text-sm text-white/60">Upload existing photos</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={nextScreen}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-2xl shadow-xl"
          >
            <Camera className="w-5 h-5 mr-2" />
            Allow Camera
          </Button>
          
          <Button 
            onClick={nextScreen}
            variant="outline"
            className="w-full py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 border-white/30 text-white rounded-2xl"
          >
            <Upload className="w-5 h-5 mr-2" />
            Allow Gallery
          </Button>
        </div>

        <p className="text-xs text-white/50 mt-6">
          Your privacy is protected. Photos are processed locally.
        </p>
      </div>
    </div>
  );
}