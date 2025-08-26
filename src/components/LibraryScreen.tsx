import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ArrowLeft, Search, Clock, Filter } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SavedObject {
  id: string;
  name: string;
  image: string;
  category: string;
  exploredAt: string;
  timesPeriods: string[];
}

interface Collection {
  id: string;
  name: string;
  description: string;
  objects: SavedObject[];
  createdAt: string;
}

interface LibraryScreenProps {
  onBack: () => void;
  onSelectObject: (objectName: string) => void;
  savedObjects: SavedObject[];
  collections: Collection[];
}

export function LibraryScreen({ onBack, onSelectObject, savedObjects, collections }: LibraryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(savedObjects.map(obj => obj.category)))];
  
  const filteredObjects = savedObjects.filter(obj => {
    const matchesSearch = obj.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || obj.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="border-b border-border glass-warm backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-accent"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl text-foreground">Your Library</h1>
                <p className="text-sm text-muted-foreground">
                  {savedObjects.length} explored objects
                </p>
              </div>
            </div>
          </div>

          {/* Search and filters */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search your explored objects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-border focus:ring-primary bg-input"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className={selectedCategory === category 
                      ? "bg-primary text-primary-foreground" 
                      : "border-border text-foreground hover:bg-accent"
                    }
                  >
                    {category === 'all' ? 'All' : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Collections Section */}
        {collections.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl text-foreground mb-6">Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(collection => (
                <Card key={collection.id} className="border border-border glass-warm card-hover cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="text-lg text-foreground mb-2">{collection.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{collection.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {collection.objects.length} objects
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(collection.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Saved Objects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-foreground">Explored Objects</h2>
            <span className="text-sm text-muted-foreground">
              {filteredObjects.length} of {savedObjects.length} objects
            </span>
          </div>

          {filteredObjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg text-foreground mb-2">
                {searchQuery || selectedCategory !== 'all' ? 'No objects found' : 'No explored objects yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start exploring objects to build your timeline library'
                }
              </p>
              {(!searchQuery && selectedCategory === 'all') && (
                <Button 
                  onClick={onBack}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Explore Objects
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredObjects.map(object => (
                <Card 
                  key={object.id}
                  className="overflow-hidden card-hover cursor-pointer border border-border glass-warm group"
                  onClick={() => onSelectObject(object.name)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={object.image}
                      alt={object.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-card text-foreground border-border">
                        {object.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-lg text-foreground mb-2 group-hover:text-foreground/80 transition-colors line-clamp-1">
                      {object.name}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Explored {object.exploredAt}</span>
                      </div>
                      <span>{object.timesPeriods.length} eras</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}