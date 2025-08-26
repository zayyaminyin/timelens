import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { ArrowLeft, Play, Pause, Clock, ChevronLeft, ChevronRight, Maximize2, SkipBack, SkipForward, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TimelineData } from '../utils/timelineData';

interface TimelineViewerProps {
  objectName: string;
  timelineData: TimelineData;
  onBack: () => void;
}

export function TimelineViewer({ objectName, timelineData, onBack }: TimelineViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const currentPoint = useMemo(() => 
    timelineData.timelinePoints[currentIndex], 
    [timelineData.timelinePoints, currentIndex]
  );

  const totalPoints = useMemo(() => 
    timelineData.timelinePoints.length, 
    [timelineData.timelinePoints.length]
  );

  const progressPercentage = useMemo(() => 
    Math.round(((currentIndex + 1) / totalPoints) * 100),
    [currentIndex, totalPoints]
  );

  // Auto-play functionality with enhanced timing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= totalPoints - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2500); // Slightly faster for better engagement

    return () => clearInterval(interval);
  }, [isPlaying, totalPoints]);

  // Reset image states when index changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
    
    // Debug: Log the image URL for troubleshooting
    if (currentPoint?.image) {
      console.log(`Loading image for ${currentPoint.period}:`, currentPoint.image);
    }
  }, [currentIndex, currentPoint]);

  const handleSliderChange = useCallback((value: number[]) => {
    setCurrentIndex(value[0]);
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (currentIndex >= totalPoints - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  }, [currentIndex, totalPoints, isPlaying]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(false);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < totalPoints - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(false);
    }
  }, [currentIndex, totalPoints]);

  const goToFirst = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const goToLast = useCallback(() => {
    setCurrentIndex(totalPoints - 1);
    setIsPlaying(false);
  }, [totalPoints]);

  const selectTimelinePoint = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    console.log(`Image loaded successfully for ${currentPoint?.period}`);
    setImageLoading(false);
    setImageError(false);
  }, [currentPoint]);

  const handleImageError = useCallback(() => {
    console.log(`Image failed to load for ${currentPoint?.period}:`, currentPoint?.image);
    setImageLoading(false);
    setImageError(true);
  }, [currentPoint]);

  // Keyboard navigation with enhanced shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case ' ':
        case 'Space':
          event.preventDefault();
          togglePlayback();
          break;
        case 'Home':
          event.preventDefault();
          goToFirst();
          break;
        case 'End':
          event.preventDefault();
          goToLast();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          setShowFullscreen(!showFullscreen);
          break;
        case 'Escape':
          event.preventDefault();
          if (showFullscreen) {
            setShowFullscreen(false);
          } else {
            onBack();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, togglePlayback, goToFirst, goToLast, onBack, showFullscreen]);

  if (!currentPoint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl text-foreground mb-4">No timeline data available</h2>
          <Button onClick={onBack} className="bg-foreground hover:bg-foreground/90 text-background">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent rounded-full transition-all duration-200 hover:scale-105"
              aria-label="Go back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl text-foreground font-semibold">{objectName}</h1>
              <p className="text-sm text-muted-foreground font-medium" aria-live="polite">
                {totalPoints} timeline points • Point {currentIndex + 1} of {totalPoints} • {progressPercentage}% complete
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={goToFirst}
              disabled={currentIndex === 0}
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent disabled:opacity-50 rounded-full transition-all duration-200"
              aria-label="Go to first timeline point"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent disabled:opacity-50 rounded-full transition-all duration-200"
              aria-label="Previous timeline point"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={togglePlayback}
              className="bg-foreground hover:bg-foreground/90 text-background px-6 py-2.5 rounded-full font-medium transition-all duration-200 hover:scale-105"
              aria-label={isPlaying ? 'Pause timeline playback' : 'Play timeline automatically'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>

            <Button
              onClick={goToNext}
              disabled={currentIndex === totalPoints - 1}
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent disabled:opacity-50 rounded-full transition-all duration-200"
              aria-label="Next timeline point"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              onClick={goToLast}
              disabled={currentIndex === totalPoints - 1}
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent disabled:opacity-50 rounded-full transition-all duration-200"
              aria-label="Go to last timeline point"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Enhanced Image Section */}
          <div className="relative">
            <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-card shadow-xl relative">
              {/* Show loading state only while image is loading and hasn't errored */}
              {imageLoading && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                    <p className="text-xs text-muted-foreground font-medium">Loading image...</p>
                  </div>
                </div>
              )}
              
              {/* Show enhanced placeholder when image fails to load */}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <div className="flex flex-col items-center gap-4 text-muted-foreground p-6 text-center">
                    <div className="relative">
                      <ImageIcon className="w-16 h-16 opacity-40" />
                      <AlertCircle className="w-6 h-6 absolute -top-1 -right-1 text-destructive/60" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Image temporarily unavailable</p>
                      <p className="text-xs opacity-60">Continue exploring the timeline</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Image - always render but with opacity control */}
              <ImageWithFallback
                src={currentPoint.image}
                alt={`${currentPoint.period} - ${currentPoint.year}`}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  imageLoading ? 'opacity-0' : imageError ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                maxRetries={3}
              />
            </div>
            
            {/* Enhanced period indicator */}
            <div className="absolute top-6 left-6 bg-background/95 backdrop-blur-xl rounded-2xl px-5 py-3 border border-border shadow-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-foreground" />
                <time className="text-foreground font-medium text-lg" dateTime={currentPoint.year}>
                  {currentPoint.year}
                </time>
              </div>
            </div>

            {/* Fullscreen button */}
            <Button
              onClick={() => setShowFullscreen(!showFullscreen)}
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 bg-background/95 backdrop-blur-xl rounded-full border border-border shadow-lg text-foreground hover:bg-background transition-all duration-200"
              aria-label="Toggle fullscreen view"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>

            {/* Auto-play indicator */}
            {isPlaying && currentIndex < totalPoints - 1 && (
              <div className="absolute bottom-6 right-6 bg-background/95 backdrop-blur-xl rounded-2xl px-5 py-3 border border-border shadow-lg">
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
                  <span className="font-medium">Auto-playing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Information */}
          <section className="space-y-8" role="region" aria-label="Timeline point information">
            <div>
              <h2 className="text-4xl text-foreground mb-4 font-semibold leading-tight">
                {currentPoint.period}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {currentPoint.description}
              </p>
            </div>

            {/* Enhanced timeline position */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Timeline Progress</span>
                <span className="text-foreground font-semibold text-lg">
                  {progressPercentage}%
                </span>
              </div>
              <div className="bg-border rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-foreground h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Timeline progress: ${progressPercentage}% complete`}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Enhanced Timeline Slider */}
        <Card className="border border-border bg-card shadow-lg rounded-2xl">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl text-foreground font-semibold">Timeline Navigation</h3>
                <div className="text-sm text-muted-foreground font-medium">
                  <time dateTime={currentPoint.year}>{currentPoint.year}</time> • {currentPoint.period}
                </div>
              </div>

              <div className="space-y-6" role="region" aria-label="Timeline controls">
                <div className="px-3">
                  <Slider
                    value={[currentIndex]}
                    onValueChange={handleSliderChange}
                    max={totalPoints - 1}
                    step={1}
                    className="w-full"
                    aria-label={`Timeline slider - currently at point ${currentIndex + 1} of ${totalPoints}`}
                  />
                </div>

                {/* Enhanced timeline points */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {timelineData.timelinePoints.map((point, index) => (
                    <button
                      key={`${point.year}-${index}`}
                      onClick={() => selectTimelinePoint(index)}
                      className={`text-left p-4 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background hover:scale-105 ${
                        index === currentIndex
                          ? 'border-foreground bg-foreground text-background shadow-lg'
                          : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border/80'
                      }`}
                      aria-pressed={index === currentIndex}
                      aria-label={`Go to ${point.period} in ${point.year}`}
                    >
                      <div className="text-xs mb-2 font-semibold opacity-80">{point.year}</div>
                      <div className="text-xs line-clamp-2 font-medium">{point.period}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Navigation buttons */}
        <nav className="flex items-center justify-between mt-10" aria-label="Timeline navigation">
          <Button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
            aria-label="Go to previous era"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Era
          </Button>

          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2 font-medium">Timeline Progress</div>
            <div className="text-2xl text-foreground font-bold" aria-live="polite">
              {progressPercentage}%
            </div>
          </div>

          <Button
            onClick={goToNext}
            disabled={currentIndex === totalPoints - 1}
            variant="outline"
            className="border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
            aria-label="Go to next era"
          >
            Next Era
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </nav>

        {/* Enhanced Keyboard shortcuts hint */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use ← → arrow keys to navigate • Space to play/pause • Home/End for first/last • F for fullscreen • Escape to go back
          </p>
        </div>
      </main>
    </div>
  );
}