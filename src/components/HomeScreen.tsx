import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Camera, Upload, Clock, ArrowRight, X, AlertCircle, Sparkles, ChevronRight, Grid3X3, CloudUpload } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { exampleObjects, ExampleObject } from '../utils/exampleObjects';
import { uploadImage, uploadImageFile, UploadedImage } from '../utils/supabase/client';

interface RecentItem {
  id: string;
  name: string;
  image: string;
  lastExplored: string;
}

interface HomeScreenProps {
  onSelectObject: (objectName: string, userImage?: UploadedImage) => void;
  recentItems: RecentItem[];
}

interface Category {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  objects: ExampleObject[];
}

export function HomeScreen({ onSelectObject, recentItems }: HomeScreenProps) {
  const [showExamples, setShowExamples] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImageData, setUploadedImageData] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Organize objects by categories with warm orange theme
  const categories: Category[] = useMemo(() => {
    console.log('Building categories from exampleObjects:', exampleObjects.length);
    const categoryMap = new Map<string, ExampleObject[]>();
    
    exampleObjects.forEach(obj => {
      if (!categoryMap.has(obj.category)) {
        categoryMap.set(obj.category, []);
      }
      categoryMap.get(obj.category)?.push(obj);
    });

    const result = [
      {
        name: 'Technology',
        description: 'Digital innovation and technological advancement through the ages',
        icon: <Grid3X3 className="w-6 h-6" />,
        color: 'from-orange-500/20 to-amber-500/20',
        objects: categoryMap.get('Technology') || []
      },
      {
        name: 'Transportation', 
        description: 'Evolution of human mobility and movement across time and space',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l-5-5m5 5l-5 5m5-5H5" /></svg>,
        color: 'from-orange-400/20 to-orange-600/20', 
        objects: categoryMap.get('Transportation') || []
      },
      {
        name: 'Entertainment',
        description: 'Cultural expression, media, and leisure through human civilization',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H9m4.5-2h.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-.5M15 13a2 2 0 11-4 0 2 2 0 014 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        color: 'from-amber-500/20 to-orange-500/20',
        objects: categoryMap.get('Entertainment') || []
      },
      {
        name: 'Culture',
        description: 'Human society, architecture, and cultural development over millennia',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
        color: 'from-orange-600/20 to-amber-600/20',
        objects: categoryMap.get('Culture') || []
      },
      {
        name: 'Fashion',
        description: 'Clothing, style, and personal expression across cultures and time',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        color: 'from-amber-400/20 to-orange-400/20',
        objects: categoryMap.get('Fashion') || []
      }
    ].filter(category => category.objects.length > 0);
    
    console.log('Final categories:', result.map(c => ({ name: c.name, count: c.objects.length })));
    return result;
  }, []);

  // Camera capture logic
  const handleCameraCapture = useCallback(async () => {
    setCameraError(null);
    setIsProcessing(true);
    
    try {
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      let errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application.';
        }
      }
      
      setCameraError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    setUploadProgress('Capturing photo...');
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to get canvas context');
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      
      stopCamera();
      
      // Upload the captured image to Supabase
      setUploadProgress('Uploading to cloud storage...');
      setIsUploading(true);
      
      try {
        const uploadedImageData = await uploadImage(imageData);
        setUploadedImageData(uploadedImageData);
        setUploadProgress('Upload complete! Processing...');
        
        setTimeout(() => {
          onSelectObject('Photography Evolution', uploadedImageData);
        }, 1000);
      } catch (uploadError) {
        console.log('Upload error:', uploadError);
        setUploadProgress('Upload failed, continuing in offline mode...');
        
        // Continue without upload
        setTimeout(() => {
          onSelectObject('Photography Evolution');
        }, 1000);
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      setCameraError('Failed to capture photo. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
      setTimeout(() => setUploadProgress(''), 2000);
    }
  }, [onSelectObject]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
  }, []);

  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Please select a file smaller than 10MB.');
      return;
    }
    
    setIsProcessing(true);
    setUploadProgress('Processing image...');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imageData = e.target?.result as string;
        setUploadedImage(imageData);
        
        // Upload the file to Supabase
        setUploadProgress('Uploading to cloud storage...');
        setIsUploading(true);
        
        try {
          const uploadedImageData = await uploadImageFile(file);
          setUploadedImageData(uploadedImageData);
          setUploadProgress('Upload complete! Processing...');
          
          setTimeout(() => {
            onSelectObject('Photography Evolution', uploadedImageData);
          }, 1000);
        } catch (uploadError) {
          console.log('Upload error:', uploadError);
          setUploadProgress('Upload failed, continuing in offline mode...');
          
          // Continue without upload
          setTimeout(() => {
            onSelectObject('Photography Evolution');
          }, 1000);
        }
      } catch (error) {
        console.error('File reading error:', error);
        alert('Failed to process the uploaded image. Please try again.');
      } finally {
        setIsProcessing(false);
        setIsUploading(false);
        setTimeout(() => setUploadProgress(''), 2000);
      }
    };
    
    reader.onerror = () => {
      console.error('File reading error');
      alert('Failed to read the uploaded file. Please try again.');
      setIsProcessing(false);
      setUploadProgress('');
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
  }, [onSelectObject]);

  const toggleExamples = useCallback(() => {
    setShowExamples(prev => !prev);
    setSelectedCategory(null);
  }, []);

  const selectCategory = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
  }, []);

  const backToCategories = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const selectExampleObject = useCallback((objectName: string) => {
    onSelectObject(objectName);
  }, [onSelectObject]);

  // Clean up state when component unmounts or mode changes
  React.useEffect(() => {
    return () => {
      setCapturedImage(null);
      setUploadedImage(null);
      setUploadedImageData(null);
      setUploadProgress('');
    };
  }, [showExamples]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Camera capture interface
  if (cameraActive) {
    return (
      <div className="min-h-screen relative flex flex-col bg-gradient-warm">
        <div className="relative flex items-center justify-between p-6 bg-card backdrop-blur-sm border-b border-border z-10">
          <h2 className="text-xl text-foreground font-medium">Capture Your Object</h2>
          <Button 
            onClick={stopCamera} 
            variant="ghost" 
            size="icon" 
            className="text-foreground hover:bg-accent rounded-full transition-colors"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="relative flex-1 flex items-center justify-center p-6 z-10">
          <div className="relative max-w-4xl w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto rounded-2xl shadow-warm-lg border border-border"
              aria-label="Camera preview"
            />
            
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
              <Button
                onClick={capturePhoto}
                disabled={isProcessing}
                className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
                aria-label="Capture photo"
              >
                {isProcessing ? (
                  <div className="w-8 h-8 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Camera className="w-8 h-8" />
                )}
              </Button>
            </div>

            <div className="absolute top-8 left-8 right-8">
              <div className="glass-warm rounded-2xl px-6 py-4 border border-border shadow-warm">
                <p className="text-foreground text-center font-medium">
                  Point your camera at any object to explore its timeline through history
                </p>
              </div>
            </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </div>

        {cameraError && (
          <div className="fixed bottom-8 left-8 right-8 max-w-md mx-auto">
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 glass-warm">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <p className="text-destructive font-medium mb-1">Camera Error</p>
                  <p className="text-destructive/80 text-sm leading-relaxed">{cameraError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Captured image preview
  if (capturedImage || uploadedImage) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-gradient-warm">
        <div className="relative text-center max-w-2xl z-10">
          <div className="mb-12">
            <h2 className="text-4xl text-foreground mb-8 tracking-tight font-bold">Object Captured!</h2>
            <div className="relative">
              <img 
                src={capturedImage || uploadedImage || ''} 
                alt="Captured object" 
                className="w-full max-w-md mx-auto rounded-2xl shadow-warm-lg border border-border"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
          
          <div className="space-y-6">
            {isUploading ? (
              <>
                <p className="text-foreground/80 text-xl flex items-center justify-center gap-3 font-medium">
                  <CloudUpload className="w-6 h-6 animate-pulse" />
                  {uploadProgress || 'Uploading to cloud storage...'}
                </p>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-primary/60 rounded-full animate-pulse [animation-delay:200ms]"></div>
                  <div className="w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]"></div>
                </div>
              </>
            ) : (
              <>
                <p className="text-foreground/80 text-xl flex items-center justify-center gap-3 font-medium">
                  <Sparkles className="w-6 h-6" />
                  {uploadProgress || 'Analyzing temporal patterns and historical connections...'}
                </p>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-foreground rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-foreground/60 rounded-full animate-pulse [animation-delay:200ms]"></div>
                  <div className="w-3 h-3 bg-foreground/40 rounded-full animate-pulse [animation-delay:400ms]"></div>
                </div>
              </>
            )}
            
            {uploadedImageData && (
              <div className="mt-6 p-4 glass-warm rounded-xl border border-border shadow-warm">
                <p className="text-foreground/70 text-sm text-center">
                  ✅ Image uploaded to cloud storage successfully
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-warm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
        aria-hidden="true"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden z-10">
        <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl text-foreground mb-4 tracking-tighter font-bold">
              TimeLens
            </h1>

            <div className="space-y-4 mb-8">
              <h2 className="text-2xl md:text-3xl text-foreground leading-tight font-semibold">
                Explore the fascinating evolution of everyday objects through time
              </h2>
              <p className="text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                Discover the hidden stories behind the things around you. From ancient origins to future possibilities, 
                every object has an incredible journey waiting to be explored.
              </p>
            </div>

            {/* Action methods */}
            {!showExamples && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <Button
                    onClick={handleCameraCapture}
                    disabled={isProcessing}
                    className="w-full h-32 glass-warm border border-border text-foreground flex flex-col gap-3 transition-all duration-300 disabled:opacity-50 card-hover rounded-2xl group"
                    variant="outline"
                  >
                    <Camera className="w-8 h-8 transition-transform duration-200 group-hover:scale-110" />
                    <div className="text-center">
                      <div className="text-lg font-medium mb-1">Take Photo</div>
                      <div className="text-xs text-foreground/80 leading-relaxed">Capture any object</div>
                    </div>
                  </Button>

                  <Button
                    onClick={handleFileUpload}
                    disabled={isProcessing}
                    className="w-full h-32 glass-warm border border-border text-foreground flex flex-col gap-3 transition-all duration-300 disabled:opacity-50 card-hover rounded-2xl group"
                    variant="outline"
                  >
                    <Upload className="w-8 h-8 transition-transform duration-200 group-hover:scale-110" />
                    <div className="text-center">
                      <div className="text-lg font-medium mb-1">Upload Photo</div>
                      <div className="text-xs text-foreground/80 leading-relaxed">Select from device</div>
                    </div>
                  </Button>

                  <Button
                    onClick={toggleExamples}
                    className="w-full h-32 glass-warm border border-border text-foreground flex flex-col gap-3 transition-all duration-300 card-hover rounded-2xl group"
                    variant="outline"
                  >
                    <ArrowRight className="w-8 h-8 transition-transform duration-200 group-hover:scale-110 group-hover:translate-x-1" />
                    <div className="text-center">
                      <div className="text-lg font-medium mb-1">Browse Examples</div>
                      <div className="text-xs text-foreground/80 leading-relaxed">Explore timelines</div>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recently Explored Section */}
      {!showExamples && recentItems.length > 0 && (
        <section className="relative z-10 pb-8">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl text-foreground mb-4 font-semibold">Recently Explored</h2>
              <p className="text-foreground/80 text-lg">Continue your journey through time</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentItems.slice(0, 3).map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden card-hover cursor-pointer border border-border glass-warm rounded-2xl group"
                  onClick={() => onSelectObject(item.name)}
                >
                  <div className="relative aspect-video">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"></div>
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorized Examples Section */}
      {showExamples && (
        <section className="relative z-10" aria-label="Timeline categories and objects">
          <div className="max-w-5xl mx-auto px-6 pt-6 pb-16">
            <div className="text-center mb-8">
              {/* Navigation buttons */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <Button
                  onClick={toggleExamples}
                  variant="outline"
                  className="glass-warm border-border text-foreground px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-warm text-sm"
                >
                  ← Back
                </Button>
                
                {selectedCategory && (
                  <Button
                    onClick={backToCategories}
                    variant="outline"
                    className="glass-warm border-border text-foreground px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-warm text-sm"
                  >
                    ← Categories
                  </Button>
                )}
              </div>
              
              {/* Main heading and description */}
              <div className="space-y-3 mb-6">
                <h2 className="text-3xl md:text-4xl text-foreground font-semibold">
                  {selectedCategory ? `${selectedCategory} Evolution` : 'Curated Time Journeys'}
                </h2>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                  {selectedCategory 
                    ? `Explore ${selectedCategory.toLowerCase()} objects that shaped civilization`
                    : 'Choose a category to explore fascinating object evolutions'
                  }
                </p>
              </div>
            </div>

            {/* Show categories when no category is selected */}
            {!selectedCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {categories.length > 0 ? categories.map((category) => (
                  <Card
                    key={category.name}
                    className="overflow-hidden card-hover cursor-pointer border border-border glass-warm group rounded-2xl"
                    onClick={() => selectCategory(category.name)}
                  >
                    <div className={`relative aspect-[4/3] bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <div className="text-foreground/80 transition-transform duration-300 group-hover:scale-110">
                        {React.cloneElement(category.icon as React.ReactElement, { className: "w-16 h-16" })}
                      </div>
                      
                      <div className="absolute top-3 right-3 bg-card backdrop-blur-sm rounded-full px-2 py-1 text-foreground text-xs font-medium border border-border">
                        {category.objects.length}
                      </div>
                      
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="w-8 h-8 glass-warm rounded-full flex items-center justify-center text-foreground border border-border">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="text-lg text-foreground mb-2 group-hover:text-foreground/80 transition-colors font-medium leading-tight">
                        {category.name}
                      </h3>
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-foreground/60 text-lg">Loading categories...</p>
                  </div>
                )}
              </div>
            )}

            {/* Show objects when category is selected */}
            {selectedCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {categories
                  .find(cat => cat.name === selectedCategory)
                  ?.objects.map((obj) => (
                    <Card
                      key={obj.name}
                      className="overflow-hidden card-hover cursor-pointer border border-border glass-warm group rounded-2xl"
                      onClick={() => selectExampleObject(obj.name)}
                    >
                      <div className="relative aspect-square">
                        <ImageWithFallback
                          src={obj.image}
                          alt={obj.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-medium text-sm mb-1 leading-tight">{obj.name}</h3>
                          <p className="text-white/80 text-xs leading-relaxed line-clamp-2">{obj.description}</p>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-card/90 text-foreground border-border text-xs">
                          {obj.timelinePoints} points
                        </Badge>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}