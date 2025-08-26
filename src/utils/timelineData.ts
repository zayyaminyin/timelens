import { technologyTimelines } from './timelineData/technologyTimelines';
import { transportationTimelines } from './timelineData/transportationTimelines';
import { entertainmentTimelines } from './timelineData/entertainmentTimelines';
import { cultureTimelines } from './timelineData/cultureTimelines';
import { fashionTimelines } from './timelineData/fashionTimelines';

export interface TimelinePoint {
  year: string;
  period: string;
  description: string;
  image: string;
  position: number; // 0 to 100 for slider position
}

export interface TimelineData {
  timelinePoints: TimelinePoint[];
}

// Category mapping for better organization
export const categoryMapping: Record<string, string> = {
  'Smartphone Evolution': 'Technology',
  'Automobile Evolution': 'Transportation', 
  'Television Evolution': 'Entertainment',
  'Photography Evolution': 'Technology',
  'Architectural Evolution': 'Culture',
  'Music Evolution': 'Entertainment',
  'Writing Evolution': 'Culture',
  'Flight Evolution': 'Transportation',
  'Clothing Evolution': 'Fashion',
  'Lighting Evolution': 'Technology',
  // NEW OBJECTS
  'Footwear Evolution': 'Fashion',
  'Currency Evolution': 'Technology',
  'Gaming Evolution': 'Entertainment',
  'Public Transportation Evolution': 'Transportation',
  'Communication Evolution': 'Technology',
  'Kitchen Evolution': 'Culture',
  'Timekeeping Evolution': 'Technology',
  'Energy Evolution': 'Technology'
};

export function getObjectCategory(objectName: string): string {
  return categoryMapping[objectName] || 'General';
}

// Validate timeline data structure
export function validateTimelineData(data: any): data is TimelineData {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.timelinePoints)) return false;
  
  return data.timelinePoints.every((point: any) => 
    typeof point.year === 'string' &&
    typeof point.period === 'string' &&
    typeof point.description === 'string' &&
    typeof point.image === 'string' &&
    typeof point.position === 'number'
  );
}

// Get timeline summary for object
export function getTimelineSummary(objectName: string): { start: string; end: string; totalPoints: number } | null {
  const timeline = mockTimelineData[objectName];
  if (!timeline || !timeline.timelinePoints.length) return null;
  
  const points = timeline.timelinePoints;
  return {
    start: points[0].year,
    end: points[points.length - 1].year,
    totalPoints: points.length
  };
}

// Combine all timeline data from different categories
export const mockTimelineData: Record<string, TimelineData> = {
  ...technologyTimelines,
  ...transportationTimelines,
  ...entertainmentTimelines,
  ...cultureTimelines,
  ...fashionTimelines
};