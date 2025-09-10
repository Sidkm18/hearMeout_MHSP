'use client';

import {
  Book,
  FileText,
  Headphones,
  Loader2,
  Mic,
  Search,
  Star,
  User,
  Video,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/layout/header';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'book' | 'article' | 'audio' | 'spotify';
  link: string;
  description: string;
  thumbnail: string;
  duration?: string;
  tags?: string;
  uploaderName?: string;
}

const ICONS: Record<Resource['type'], React.ElementType> = {
  video: Video,
  book: Book,
  article: FileText,
  audio: Mic,
  spotify: Headphones,
};

export default function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'resources'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedResources: Resource[] = [];
        snapshot.forEach((doc) => {
          fetchedResources.push({
            id: doc.id,
            ...(doc.data() as Omit<Resource, 'id'>),
          });
        });
        setResources(fetchedResources);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching resources: ', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    resources.forEach((resource) => {
      resource.tags?.split(',').forEach((tag) => {
        if (tag.trim()) {
          categories.add(tag.trim());
        }
      });
    });
    return ['all', ...Array.from(categories)];
  }, [resources]);
  
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === 'all' || resource.type === selectedType;
      const matchesCategory =
        selectedCategory === 'all' ||
        resource.tags?.split(',').some((tag) => tag.trim() === selectedCategory);
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [resources, searchTerm, selectedType, selectedCategory]);

  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const Icon = ICONS[resource.type];
    const tags = resource.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [];

    return (
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
        {resource.type === 'video' && resource.thumbnail ? (
          <div className="relative aspect-video">
             <Image
              src={resource.thumbnail || 'https://picsum.photos/600/400'}
              alt={resource.title}
              fill
              className="object-cover rounded-t-lg"
             />
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center bg-muted rounded-t-lg">
             <Icon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <CardHeader>
           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Icon className="w-4 h-4" />
            <span>{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</span>
           </div>
          <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm">{resource.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
             <div className="flex items-center gap-1">
                 <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 
                 <span>4.8</span>
             </div>
              {resource.duration && <span>{resource.duration}</span>}
          </div>
           {tags.length > 0 && (
             <div className="flex flex-wrap gap-2">
                {tags.map(tag => <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>)}
             </div>
           )}
        </CardContent>
        <div className="p-6 pt-0 flex items-center gap-2 text-sm">
            <Avatar className="h-6 w-6">
                 <AvatarFallback>{resource.uploaderName ? resource.uploaderName.charAt(0) : <User />}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">{resource.uploaderName || 'Anonymous'}</span>
        </div>
      </Card>
    );
  };


  return (
    <>
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-headline text-5xl mb-2">Resource Library</h1>
          <p className="text-lg text-muted-foreground">
            Discover helpful resources created by mental health professionals
            and peers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map(cat => (
                 <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="book">Book</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="spotify">Spotify Playlist</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* We will implement counsellor recommendations later */}

        <section>
          <h2 className="font-headline text-3xl mb-6">
            All Resources ({filteredResources.length})
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredResources.map((resource) => (
                <Link key={resource.id} href={resource.link} target="_blank" className="block">
                  <ResourceCard resource={resource} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
