import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthScreens } from './components/AuthScreens';
import { HomeScreen } from './components/HomeScreen';
import { TimelineViewer } from './components/TimelineViewer';
import { LibraryScreen } from './components/LibraryScreen';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import { User, LogOut, AlertTriangle, ArrowLeft, WifiOff, RefreshCw, Sparkles } from 'lucide-react';
import { 
  getCurrentSession, 
  signOut, 
  saveExploredObject, 
  saveExploredObjectWithImage,
  getExploredObjects, 
  getCollections,
  ExploredObject,
  Collection,
  UploadedImage,
  resetBackendCheck
} from './utils/supabase/client';
import { mockTimelineData, getObjectCategory, TimelineData } from './utils/timelineData';
import { FAST_IMAGE_CONFIG, optimizeImageUrl, getFallbackImage } from './utils/imageOptimization';

type Screen = 'auth' | 'home' | 'timeline' | 'library' | 'diagnostics';

interface RecentItem {
  id: string;
  name: string;
  image: string;
  lastExplored: string;
}

interface SavedObject {
  id: string;
  name: string;
  image: string;
  category: string;
  exploredAt: string;
  timesPeriods: string[];
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exploredObjects, setExploredObjects] = useState<ExploredObject[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [screenTransition, setScreenTransition] = useState(false);

  const maxRetryAttempts = 3;

  // Enhanced recent items with ultra-fast loading and fallbacks
  const recentItems: RecentItem[] = useMemo(() => {
    if ((isAuthenticated || isGuestMode) && exploredObjects.length > 0) {
      return exploredObjects.slice(0, 6).map(obj => {
        const midPoint = Math.floor(obj.timelineData.timelinePoints.length / 2);
        const primaryImage = obj.timelineData.timelinePoints?.[midPoint]?.image;
        const fallbackImage = getFallbackImage(obj.category);
        
        return {
          id: obj.id,
          name: obj.name,
          image: optimizeImageUrl(primaryImage || fallbackImage, FAST_IMAGE_CONFIG),
          lastExplored: new Date(obj.exploredAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })
        };
      });
    }
    
    // Ultra-fast loading fallback recent items with optimized images
    return [
      {
        id: '1',
        name: 'Smartphone Evolution',
        image: 'https://images.unsplash.com/photo-1571763806648-5d022a3d1a29?w=400&q=75&auto=format&fit=crop',
        lastExplored: '2h ago'
      },
      {
        id: '2',
        name: 'Music Evolution',
        image: 'https://images.unsplash.com/photo-1722110351621-f1a54d062b4d?w=400&q=75&auto=format&fit=crop',
        lastExplored: '1d ago'
      },
      {
        id: '3',
        name: 'Photography Evolution',
        image: 'https://images.unsplash.com/photo-1696713219412-0b08a5afe31c?w=400&q=75&auto=format&fit=crop',
        lastExplored: '3d ago'
      }
    ];
  }, [isAuthenticated, isGuestMode, exploredObjects]);

  const savedObjects: SavedObject[] = useMemo(() => {
    return exploredObjects.map(obj => {
      const midPoint = Math.floor(obj.timelineData.timelinePoints.length / 2);
      const primaryImage = obj.timelineData.timelinePoints?.[midPoint]?.image;
      const fallbackImage = getFallbackImage(obj.category);
      
      return {
        id: obj.id,
        name: obj.name,
        image: optimizeImageUrl(primaryImage || fallbackImage, FAST_IMAGE_CONFIG),
        category: obj.category,
        exploredAt: new Date(obj.exploredAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        timesPeriods: obj.timelineData.timelinePoints?.map(tp => tp.year) || []
      };
    });
  }, [exploredObjects]);

  // Enhanced screen transition handler
  const transitionToScreen = useCallback((screen: Screen) => {
    setScreenTransition(true);
    setTimeout(() => {
      setCurrentScreen(screen);
      setScreenTransition(false);
    }, 150);
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isGuestMode) {
      loadUserData();
    }
  }, [isAuthenticated, isGuestMode]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const session = await getCurrentSession();
      if (session) {
        setIsAuthenticated(true);
        setCurrentScreen('home');
      }
    } catch (error) {
      console.log('Auth check error:', error);
      setOfflineMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const [objectsData, collectionsData] = await Promise.all([
        getExploredObjects(),
        getCollections()
      ]);
      setExploredObjects(objectsData);
      setCollections(collectionsData);
      setOfflineMode(false);
      setRetryAttempts(0);
    } catch (error) {
      console.log('Error loading user data:', error);
      setOfflineMode(true);
    }
  }, []);

  const handleAuthenticated = useCallback(async () => {
    setIsAuthenticated(true);
    setIsGuestMode(false);
    transitionToScreen('home');
    await loadUserData();
  }, [loadUserData, transitionToScreen]);

  const handleGuestMode = useCallback(() => {
    setIsGuestMode(true);
    setIsAuthenticated(false);
    transitionToScreen('home');
    setExploredObjects([]);
    setCollections([]);
    setOfflineMode(true);
  }, [transitionToScreen]);

  const handleSignOut = useCallback(async () => {
    try {
      if (!isGuestMode) {
        await signOut();
      }
      setIsAuthenticated(false);
      setIsGuestMode(false);
      transitionToScreen('auth');
      setExploredObjects([]);
      setCollections([]);
      setOfflineMode(false);
      setRetryAttempts(0);
    } catch (error) {
      console.log('Sign out error:', error);
      // Force sign out even if server call fails
      setIsAuthenticated(false);
      setIsGuestMode(false);
      transitionToScreen('auth');
      setExploredObjects([]);
      setCollections([]);
    }
  }, [isGuestMode, transitionToScreen]);

  const handleSelectObject = useCallback(async (objectName: string, userImage?: UploadedImage) => {
    console.log('Selected object:', objectName, userImage ? 'with user image' : 'without user image');
    setSelectedObject(objectName);
    transitionToScreen('timeline');

    // Validate object exists in timeline data
    if (!mockTimelineData[objectName]) {
      console.warn(`Object "${objectName}" not found in timeline data`);
      return;
    }

    // In guest mode, just add to local mock data
    if (isGuestMode && mockTimelineData[objectName]) {
      const newObject: ExploredObject = {
        id: `guest-${Date.now()}`,
        name: objectName,
        category: getObjectCategory(objectName),
        timelineData: mockTimelineData[objectName],
        exploredAt: new Date().toISOString(),
        userId: 'guest'
      };
      setExploredObjects(prev => [newObject, ...prev.slice(0, 9)]); // Keep only 10 most recent
    } else if (isAuthenticated && !isGuestMode && mockTimelineData[objectName]) {
      try {
        if (userImage) {
          // Use the enhanced save function when user image is provided
          await saveExploredObjectWithImage(
            objectName, 
            mockTimelineData[objectName], 
            getObjectCategory(objectName),
            userImage
          );
        } else {
          // Use regular save function when no user image
          await saveExploredObject(objectName, mockTimelineData[objectName], getObjectCategory(objectName));
        }
        await loadUserData();
      } catch (error) {
        console.log('Error saving explored object:', error);
      }
    }
  }, [isGuestMode, isAuthenticated, loadUserData, transitionToScreen]);

  const handleBackToHome = useCallback(() => {
    transitionToScreen('home');
  }, [transitionToScreen]);

  const handleShowLibrary = useCallback(() => {
    transitionToScreen('library');
  }, [transitionToScreen]);

  const handleRetryConnection = useCallback(async () => {
    if (retryAttempts >= maxRetryAttempts || isRetrying) {
      console.log('Max retry attempts reached or already retrying');
      return;
    }

    setIsRetrying(true);
    setRetryAttempts(prev => prev + 1);
    resetBackendCheck();
    
    try {
      if (isAuthenticated && !isGuestMode) {
        await loadUserData();
      } else {
        await checkAuthStatus();
      }
      setOfflineMode(false);
    } catch (error) {
      console.log('Retry connection failed:', error);
      setOfflineMode(true);
    } finally {
      setIsRetrying(false);
    }
  }, [retryAttempts, isAuthenticated, isGuestMode, loadUserData, checkAuthStatus, isRetrying]);

  // Enhanced offline banner with warm styling
  const OfflineBanner = React.memo(() => {
    if (!offlineMode && !isGuestMode) return null;
    
    return (
      <div className="fixed top-0 left-0 right-0 z-50 glass-warm backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-sm drop-shadow-md ${
                isGuestMode 
                  ? 'bg-orange-500/20 border border-orange-500/30' 
                  : 'bg-red-500/20 border border-red-500/30'
              }`}>
                {isGuestMode ? (
                  <User className="w-4 h-4 text-orange-700 drop-shadow-sm" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-700 drop-shadow-sm" />
                )}
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium drop-shadow-lg ${
                    isGuestMode ? 'text-orange-800' : 'text-red-800'
                  }`}>
                    {isGuestMode ? 'Guest Mode' : 'Offline Mode'}
                  </span>
                  {!isGuestMode && retryAttempts > 0 && (
                    <span className="text-xs text-orange-800 bg-white/80 px-2 py-0.5 rounded-md font-mono backdrop-blur-sm border border-orange-200 drop-shadow-sm">
                      {retryAttempts}/{maxRetryAttempts}
                    </span>
                  )}
                </div>
                <p className="text-xs text-orange-700 drop-shadow-md">
                  {isGuestMode 
                    ? 'Limited features available • Data not saved' 
                    : 'Backend connection lost • Using local data'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isGuestMode && retryAttempts < maxRetryAttempts && (
                <Button 
                  onClick={handleRetryConnection}
                  variant="outline" 
                  size="sm"
                  disabled={isRetrying}
                  className="h-8 px-3 text-xs font-medium bg-white/90 hover:bg-white border-orange-200 text-orange-800 drop-shadow-md backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1.5" />
                      Retry
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                onClick={() => transitionToScreen('diagnostics')}
                variant="outline" 
                size="sm"
                className="h-8 px-3 text-xs font-medium bg-white/90 hover:bg-white border-orange-200 text-orange-800 drop-shadow-md backdrop-blur-sm transition-all duration-200"
              >
                Diagnose
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  // Enhanced loading screen with warm theme
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="relative w-24 h-24 mx-auto mb-10">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-2 border-orange-200"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-orange-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            
            {/* Inner pulsing circle */}
            <div className="absolute inset-4 rounded-full bg-orange-100 flex items-center justify-center">
              <div className="relative">
                <div className="w-4 h-4 bg-orange-300 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-orange-600 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
            
            {/* Sparkle effect */}
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-3xl text-orange-900 tracking-tight font-semibold">TimeLens</h3>
            <p className="text-orange-700 leading-relaxed">
              Initializing your temporal exploration experience...
            </p>
            
            {/* Loading progress indicators */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse [animation-delay:200ms]"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:400ms]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {/* Main gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-warm animate-gradient" />
      
      <OfflineBanner />
      
      {/* Enhanced screen transition wrapper */}
      <div className={`transition-all duration-300 ${screenTransition ? 'opacity-95 scale-[0.98]' : 'opacity-100 scale-100'}`}>
        {currentScreen === 'auth' && (
          <div className={offlineMode || isGuestMode ? 'pt-20' : ''}>
            <AuthScreens 
              onAuthenticated={handleAuthenticated}
              onGuestMode={handleGuestMode}
            />
          </div>
        )}

        {currentScreen === 'timeline' && (
          <div className={offlineMode || isGuestMode ? 'pt-20' : ''}>
            {mockTimelineData[selectedObject] ? (
              <TimelineViewer
                objectName={selectedObject}
                timelineData={mockTimelineData[selectedObject]}
                onBack={handleBackToHome}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mb-8">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-3xl text-orange-900 mb-4 font-semibold">Object Not Found</h2>
                  <p className="text-orange-700 mb-8 leading-relaxed text-lg">
                    The object "{selectedObject}" could not be found in our timeline database.
                  </p>
                  <Button 
                    onClick={handleBackToHome} 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentScreen === 'library' && (
          <div className={offlineMode || isGuestMode ? 'pt-20' : ''}>
            <LibraryScreen
              onBack={handleBackToHome}
              onSelectObject={handleSelectObject}
              savedObjects={savedObjects}
              collections={collections}
            />
          </div>
        )}

        {currentScreen === 'diagnostics' && (
          <div className={`min-h-screen flex items-center justify-center p-6 ${offlineMode || isGuestMode ? 'pt-26' : ''}`}>
            <div className="w-full max-w-4xl">
              <div className="mb-6 text-center">
                <Button 
                  onClick={handleBackToHome}
                  variant="outline"
                  className="mb-4 bg-white/90 border-orange-200 text-orange-800 hover:bg-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
              <DiagnosticsPanel />
            </div>
          </div>
        )}

        {currentScreen === 'home' && (
          <div className={`relative ${offlineMode || isGuestMode ? 'pt-20' : ''}`}>
            <HomeScreen 
              onSelectObject={handleSelectObject}
              recentItems={recentItems}
            />
            
            {/* Enhanced floating navigation with warm theme */}
            <div className="fixed top-8 right-8 z-40" style={{ top: offlineMode || isGuestMode ? '104px' : '32px' }}>
              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleShowLibrary}
                  size="icon"
                  className="w-14 h-14 rounded-2xl bg-white/90 hover:bg-white border border-orange-200 text-orange-800 shadow-warm-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:border-orange-300 group"
                  aria-label="Open your exploration library"
                >
                  <User className="w-6 h-6 transition-all duration-200 group-hover:scale-110" />
                </Button>
                
                {(isAuthenticated || isGuestMode) && (
                  <Button
                    onClick={handleSignOut}
                    size="icon"
                    className="w-14 h-14 rounded-2xl bg-white/90 hover:bg-white border border-orange-200 text-orange-800 shadow-warm-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:border-orange-300 group"
                    aria-label={isGuestMode ? "Exit guest mode" : "Sign out of your account"}
                  >
                    <LogOut className="w-6 h-6 transition-all duration-200 group-hover:scale-110" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}