import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface TimelinePoint {
  year: string;
  period: string;
  description: string;
  image: string;
  position: number;
}

export interface TimelineData {
  timelinePoints: TimelinePoint[];
}

export interface ExploredObject {
  id: string;
  name: string;
  category: string;
  timelineData: TimelineData;
  exploredAt: string;
  userId: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  objects: ExploredObject[];
  createdAt: string;
  userId: string;
}

// Helper function to check if backend is available
let backendAvailable: boolean | null = null;

async function checkBackendHealth(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  
  try {
    console.log('Checking backend health at:', `https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/health`);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Backend health response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend health response:', data);
      backendAvailable = true;
      return true;
    } else {
      const errorText = await response.text();
      console.log('Backend health check failed with status:', response.status, 'Response:', errorText);
      backendAvailable = false;
      return false;
    }
  } catch (error) {
    console.log('Backend health check network error:', error);
    console.log('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    backendAvailable = false;
    return false;
  }
}

// Auth functions
export async function signUp(email: string, password: string, name: string) {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    throw new Error('Backend service is currently unavailable. Please try again later.');
  }

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Sign up failed');
    }
    
    return data;
  } catch (error) {
    console.log('Sign up error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error during sign up. Please check your connection.');
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('Attempting to sign in user:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Supabase auth error:', error);
      throw new Error(error.message);
    }

    console.log('Sign in successful:', data.user ? 'User authenticated' : 'No user data');
    return data;
  } catch (error) {
    console.log('Sign in error:', error);
    console.log('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error during sign in. Please check your connection.');
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.log('Sign out error:', error);
    // Don't throw for sign out errors, just log them
  }
}

export async function getCurrentSession() {
  try {
    console.log('Getting current session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.log('Session error:', error);
      console.log('Error details:', {
        name: error?.name,
        message: error?.message,
        status: error?.status
      });
      return null;
    }
    console.log('Session retrieved successfully:', session ? 'Session found' : 'No session');
    return session;
  } catch (error) {
    console.log('Get session network error:', error);
    console.log('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return null;
  }
}

// API functions with fallback handling
export async function saveExploredObject(objectName: string, timelineData: TimelineData, category: string = 'General') {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    console.log('Backend unavailable - object not saved:', objectName);
    return { message: 'Object explored (offline mode)', object: null };
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/objects/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ objectName, timelineData, category }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save object');
    }
    
    return data;
  } catch (error) {
    console.log('Save object error:', error);
    // Don't throw, just return a fallback response
    return { message: 'Object explored (offline mode)', object: null };
  }
}

export async function getExploredObjects(): Promise<ExploredObject[]> {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    console.log('Backend unavailable - returning empty objects list');
    return [];
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      return [];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/objects`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    if (!response.ok) {
      console.log('Get objects error:', data.error);
      return [];
    }
    
    return data.objects || [];
  } catch (error) {
    console.log('Get objects error:', error);
    return [];
  }
}

export async function deleteExploredObject(objectId: string) {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    throw new Error('Backend service is currently unavailable. Please try again later.');
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/objects/${objectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete object');
    }
    
    return data;
  } catch (error) {
    console.log('Delete object error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error deleting object. Please check your connection.');
  }
}

export async function createCollection(name: string, description: string = '', objects: ExploredObject[] = []) {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    throw new Error('Backend service is currently unavailable. Please try again later.');
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ name, description, objects }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create collection');
    }
    
    return data;
  } catch (error) {
    console.log('Create collection error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error creating collection. Please check your connection.');
  }
}

export async function getCollections(): Promise<Collection[]> {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    console.log('Backend unavailable - returning empty collections list');
    return [];
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      return [];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/collections`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      console.log('Get collections error:', data.error);
      return [];
    }
    
    return data.collections || [];
  } catch (error) {
    console.log('Get collections error:', error);
    return [];
  }
}

export async function getUserProfile() {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    throw new Error('Backend service is currently unavailable. Please try again later.');
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get profile');
    }
    
    return data.profile;
  } catch (error) {
    console.log('Get profile error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error getting profile. Please check your connection.');
  }
}

// Image upload and management functions

export interface UploadedImage {
  fileName: string;
  url: string;
  path: string;
}

export async function uploadImage(imageData: string): Promise<UploadedImage> {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    throw new Error('Backend service is currently unavailable. Please try again later.');
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Convert base64 data URL to ArrayBuffer
    const base64Data = imageData.split(',')[1];
    const binaryString = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds for image upload

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'image/jpeg',
      },
      body: arrayBuffer,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }
    
    return {
      fileName: data.fileName,
      url: data.url,
      path: data.path
    };
  } catch (error) {
    console.log('Upload image error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error uploading image. Please check your connection.');
  }
}

export async function uploadImageFile(file: File): Promise<UploadedImage> {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    throw new Error('Backend service is currently unavailable. Please try again later.');
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }

    if (file.size > 10485760) { // 10MB
      throw new Error('Image file is too large. Maximum size is 10MB');
    }

    const arrayBuffer = await file.arrayBuffer();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds for image upload

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'image/jpeg',
      },
      body: arrayBuffer,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }
    
    return {
      fileName: data.fileName,
      url: data.url,
      path: data.path
    };
  } catch (error) {
    console.log('Upload image file error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error uploading image. Please check your connection.');
  }
}

export async function getImageUrl(fileName: string): Promise<string> {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    throw new Error('Backend service is currently unavailable. Please try again later.');
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/images/${fileName}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get image URL');
    }
    
    return data.url;
  } catch (error) {
    console.log('Get image URL error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error getting image URL. Please check your connection.');
  }
}

// Enhanced saveExploredObject function to include user-uploaded images
export async function saveExploredObjectWithImage(
  objectName: string, 
  timelineData: TimelineData, 
  category: string = 'General',
  userImage?: UploadedImage
) {
  const isBackendAvailable = await checkBackendHealth();
  if (!isBackendAvailable) {
    console.log('Backend unavailable - object not saved:', objectName);
    return { message: 'Object explored (offline mode)', object: null };
  }

  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // If user uploaded an image, add it to the timeline data as the "current" point
    let enhancedTimelineData = { ...timelineData };
    if (userImage) {
      const currentPoint = {
        year: new Date().getFullYear().toString(),
        period: 'Present',
        description: `User captured image of ${objectName}`,
        image: userImage.url,
        position: timelineData.timelinePoints.length,
        userUploaded: true
      };
      
      enhancedTimelineData = {
        ...timelineData,
        timelinePoints: [...timelineData.timelinePoints, currentPoint]
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/objects/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ 
        objectName, 
        timelineData: enhancedTimelineData, 
        category,
        userImage: userImage ? {
          fileName: userImage.fileName,
          path: userImage.path
        } : undefined
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save object');
    }
    
    return data;
  } catch (error) {
    console.log('Save object with image error:', error);
    // Don't throw, just return a fallback response
    return { message: 'Object explored (offline mode)', object: null };
  }
}

// Reset backend availability check (useful for retry logic)
export function resetBackendCheck() {
  backendAvailable = null;
}

// Utility function for fetch with timeout
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}