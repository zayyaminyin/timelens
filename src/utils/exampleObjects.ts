import { Smartphone, Car, Tv, Music, PenTool, Plane, Shirt, Lightbulb, Building, Camera, CircleDollarSign, Gamepad2, Train, MessageCircle, ChefHat, Clock, Zap } from 'lucide-react';

export interface ExampleObject {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  category: string;
  timeSpan: string;
  featured?: boolean;
  priority?: boolean;
}

export const exampleObjects: ExampleObject[] = [
  // Technology Category - Most Popular
  {
    id: 'smartphone',
    name: 'Smartphone Evolution',
    displayName: 'Smartphone',
    description: 'Journey from Alexander Graham Bell\'s telephone to neural interfaces of tomorrow',
    icon: <Smartphone className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1571763806648-5d022a3d1a29?w=400&q=75&auto=format&fit=crop',
    category: 'Technology',
    timeSpan: '1876 → 2080s',
    featured: true,
    priority: true
  },
  {
    id: 'photography',
    name: 'Photography Evolution',
    displayName: 'Photography',
    description: 'From cave paintings to neural memory integration - capturing life through millennia',
    icon: <Camera className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1696713219412-0b08a5afe31c?w=400&q=75&auto=format&fit=crop',
    category: 'Technology',
    timeSpan: '40,000 BCE → 2100s',
    featured: true,
    priority: true
  },
  {
    id: 'lighting',
    name: 'Lighting Evolution',
    displayName: 'Lighting',
    description: 'Illumination\'s journey from fire control to quantum photon manipulation',
    icon: <Lightbulb className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1752391702044-b3c75fde78bd?w=400&q=75&auto=format&fit=crop',
    category: 'Technology',
    timeSpan: '400,000 BCE → 2100s'
  },
  {
    id: 'currency',
    name: 'Currency Evolution',
    displayName: 'Currency',
    description: 'Trade and value exchange from primitive barter systems to quantum-secured digital currencies',
    icon: <CircleDollarSign className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1731536782762-076739de99b6?w=400&q=75&auto=format&fit=crop',
    category: 'Technology',
    timeSpan: '9000 BCE → 2080s'
  },
  {
    id: 'communication',
    name: 'Communication Evolution',
    displayName: 'Communication',
    description: 'Human connection across distance from smoke signals to quantum entangled messaging',
    icon: <MessageCircle className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1604869515882-4d10fa4b0492?w=400&q=75&auto=format&fit=crop',
    category: 'Technology',
    timeSpan: '100,000 BCE → 2100s'
  },
  {
    id: 'timekeeping',
    name: 'Timekeeping Evolution',
    displayName: 'Timekeeping',
    description: 'Humanity\'s quest to measure time from shadow observations to quantum atomic precision',
    icon: <Clock className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1745256375848-1d599594635d?w=400&q=75&auto=format&fit=crop',
    category: 'Technology',
    timeSpan: '3500 BCE → 2100s'
  },
  {
    id: 'energy',
    name: 'Energy Evolution',
    displayName: 'Energy',
    description: 'Power generation and usage from fire mastery to controlled fusion and beyond',
    icon: <Zap className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1755585129999-7b29cf3baebe?w=400&q=75&auto=format&fit=crop',
    category: 'Technology',
    timeSpan: '400,000 BCE → 2100s'
  },

  // Transportation Category
  {
    id: 'automobile',
    name: 'Automobile Evolution',
    displayName: 'Automobile',
    description: 'Witness the transformation from horse carriages to autonomous flying vehicles',
    icon: <Car className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1642099414765-5ed38e3b3437?w=400&q=75&auto=format&fit=crop',
    category: 'Transportation',
    timeSpan: '1885 → 2080s',
    featured: true
  },
  {
    id: 'flight',
    name: 'Flight Evolution',
    displayName: 'Flight',
    description: 'Humanity\'s dream of flight from ancient bird observation to interstellar travel',
    icon: <Plane className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1692184020140-07637f817013?w=400&q=75&auto=format&fit=crop',
    category: 'Transportation',
    timeSpan: '400,000 BCE → 2150s'
  },
  {
    id: 'public-transport',
    name: 'Public Transportation Evolution',
    displayName: 'Public Transport',
    description: 'Mass mobility solutions from walking paths to hyperloop networks',
    icon: <Train className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1750252762597-7bc265b73054?w=400&q=75&auto=format&fit=crop',
    category: 'Transportation',
    timeSpan: '300,000 BCE → 2080s'
  },

  // Entertainment Category
  {
    id: 'television',
    name: 'Television Evolution',
    displayName: 'Television',
    description: 'Explore entertainment\'s evolution from radio waves to neural streaming',
    icon: <Tv className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1705951439619-28c0fbbd0ab0?w=400&q=75&auto=format&fit=crop',
    category: 'Entertainment',
    timeSpan: '1920s → 2080s',
    featured: true
  },
  {
    id: 'music',
    name: 'Music Evolution',
    displayName: 'Music',
    description: 'From primitive drums to neural harmony - sound\'s journey through human civilization',
    icon: <Music className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1722110351621-f1a54d062b4d?w=400&q=75&auto=format&fit=crop',
    category: 'Entertainment',
    timeSpan: '50,000 BCE → 2080s'
  },
  {
    id: 'gaming',
    name: 'Gaming Evolution',
    displayName: 'Gaming',
    description: 'Human play and competition from ancient board games to neural reality experiences',
    icon: <Gamepad2 className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1655976796204-308e6f3deaa8?w=400&q=75&auto=format&fit=crop',
    category: 'Entertainment',
    timeSpan: '5000 BCE → 2100s'
  },

  // Culture Category
  {
    id: 'writing',
    name: 'Writing Evolution',
    displayName: 'Writing',
    description: 'Trace humanity\'s greatest invention from clay tablets to AI-assisted thought transcription',
    icon: <PenTool className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1596539363080-b678f4c02d6e?w=400&q=75&auto=format&fit=crop',
    category: 'Culture',
    timeSpan: '3200 BCE → 2100s'
  },
  {
    id: 'architecture',
    name: 'Architectural Evolution',
    displayName: 'Architecture',
    description: 'Built environments from cave dwellings to consciousness-powered living structures',
    icon: <Building className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1676577496420-98add687c469?w=400&q=75&auto=format&fit=crop',
    category: 'Culture',
    timeSpan: '100,000 BCE → 2100s'
  },
  {
    id: 'kitchen',
    name: 'Kitchen Evolution',
    displayName: 'Kitchen',
    description: 'Food preparation spaces from primitive fire pits to AI-assisted molecular gastronomy labs',
    icon: <ChefHat className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1623059265421-2dc2a04f10f6?w=400&q=75&auto=format&fit=crop',
    category: 'Culture',
    timeSpan: '400,000 BCE → 2080s'
  },

  // Fashion Category
  {
    id: 'clothing',
    name: 'Clothing Evolution',
    displayName: 'Clothing',
    description: 'Fashion\'s transformation from animal hide protection to biologically integrated smart fabrics',
    icon: <Shirt className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=400&q=75&auto=format&fit=crop',
    category: 'Fashion',
    timeSpan: '170,000 BCE → 2100s'
  },
  {
    id: 'footwear',
    name: 'Footwear Evolution',
    displayName: 'Footwear',
    description: 'The journey of human feet protection from animal hide wrappings to smart adaptive shoes',
    icon: <Shirt className="w-6 h-6" />,
    image: 'https://images.unsplash.com/photo-1577655197898-da78ff8bed68?w=400&q=75&auto=format&fit=crop',
    category: 'Fashion',
    timeSpan: '40,000 BCE → 2080s'
  }
];

// Helper functions for better object organization
export const getFeaturedObjects = () => exampleObjects.filter(obj => obj.featured);
export const getObjectsByCategory = (category: string) => exampleObjects.filter(obj => obj.category === category);
export const getObjectById = (id: string) => exampleObjects.find(obj => obj.id === id);

// Category metadata for enhanced UI
export const categoryMetadata = {
  'Technology': {
    color: 'from-blue-500/20 to-cyan-500/20',
    description: 'Digital innovation and technological advancement through the ages',
    objectCount: getObjectsByCategory('Technology').length
  },
  'Transportation': {
    color: 'from-green-500/20 to-emerald-500/20',
    description: 'Evolution of human mobility and movement across time and space',
    objectCount: getObjectsByCategory('Transportation').length
  },
  'Entertainment': {
    color: 'from-purple-500/20 to-pink-500/20',
    description: 'Cultural expression, media, and leisure through human civilization',
    objectCount: getObjectsByCategory('Entertainment').length
  },
  'Culture': {
    color: 'from-orange-500/20 to-red-500/20',
    description: 'Human society, architecture, and cultural development over millennia',
    objectCount: getObjectsByCategory('Culture').length
  },
  'Fashion': {
    color: 'from-pink-500/20 to-rose-500/20',
    description: 'Clothing, style, and personal expression across cultures and time',
    objectCount: getObjectsByCategory('Fashion').length
  }
};

// Enhanced search and filtering capabilities
export const searchObjects = (query: string): ExampleObject[] => {
  const lowercaseQuery = query.toLowerCase();
  return exampleObjects.filter(obj => 
    obj.displayName.toLowerCase().includes(lowercaseQuery) ||
    obj.description.toLowerCase().includes(lowercaseQuery) ||
    obj.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const getTimelineSpan = (objectName: string): { start: string; end: string } | null => {
  const obj = exampleObjects.find(o => o.name === objectName);
  if (!obj) return null;
  
  const [start, end] = obj.timeSpan.split(' → ');
  return { start: start.trim(), end: end.trim() };
};