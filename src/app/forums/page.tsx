
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Send, User } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: Timestamp;
  type: 'peer-to-peer' | 'peer-to-professional';
  isBlocked: boolean;
  replyCount: number;
}

export default function ForumsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'peer-to-peer' | 'peer-to-professional'>('peer-to-peer');
  
  const [filter, setFilter] = useState<'all' | 'peer-to-peer' | 'peer-to-professional'>('all');


  useEffect(() => {
    let q = query(
      collection(db, 'posts'), 
      where('isBlocked', '==', false), 
      orderBy('createdAt', 'desc')
    );
    
    if (filter !== 'all') {
        q = query(
          collection(db, 'posts'), 
          where('isBlocked', '==', false), 
          where('type', '==', filter),
          orderBy('createdAt', 'desc')
        );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts: Post[] = [];
      snapshot.forEach(doc => {
        fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(fetchedPosts);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      toast({ title: "Error", description: "Could not fetch forum posts.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast, filter]);
  
  const handleCreatePost = async () => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to create a post.", variant: "destructive" });
      return;
    }
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({ title: "Incomplete Post", description: "Please provide a title and content for your post.", variant: "destructive" });
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        title: newPostTitle,
        content: newPostContent,
        type: newPostType,
        authorId: user.uid,
        authorName: user.name,
        authorRole: user.role,
        createdAt: serverTimestamp(),
        isBlocked: false,
        replyCount: 0,
      });
      toast({ title: "Success", description: "Your post has been created." });
      setNewPostTitle('');
      setNewPostContent('');
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Error", description: "Failed to create post.", variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container py-8">
        <h2 className="font-headline text-4xl mb-6">Community Forums</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All Discussions</Button>
                <Button variant={filter === 'peer-to-peer' ? 'default' : 'outline'} onClick={() => setFilter('peer-to-peer')}>Peer-to-Peer</Button>
                <Button variant={filter === 'peer-to-professional' ? 'default' : 'outline'} onClick={() => setFilter('peer-to-professional')}>Ask a Volunteer</Button>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin"/></div>
            ) : posts.length === 0 ? (
               <Card className="rounded-2xl shadow-lg">
                 <CardContent className="pt-6">
                   <p className="text-center text-muted-foreground">No discussions yet in this category. Be the first to start one!</p>
                 </CardContent>
               </Card>
            ) : (
              posts.map(post => (
                <Card key={post.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      <Link href={`/forums/${post.id}`} className="hover:underline">{post.title}</Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-xs pt-1">
                      <Badge variant={post.type === 'peer-to-peer' ? 'secondary' : 'default'}>
                        {post.type === 'peer-to-peer' ? 'Peer-to-Peer' : 'Peer-to-Volunteer'}
                      </Badge>
                      <span>Posted by {post.authorName} ({post.authorRole})</span>
                      <span>
                        {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : '...'}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm">{post.content}</p>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4"/> {post.replyCount || 0} Replies
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-6 lg:sticky top-28 h-fit">
            {user?.role === 'Student' && (
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle>Start a New Discussion</CardTitle>
                  <CardDescription>
                    Share your thoughts with the community.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    placeholder="Post Title..." 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    disabled={isPosting}
                  />
                  <Textarea 
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={isPosting}
                  />
                  <Select 
                    value={newPostType} 
                    onValueChange={(value: 'peer-to-peer' | 'peer-to-professional') => setNewPostType(value)}
                    disabled={isPosting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="peer-to-peer">Peer-to-Peer Discussion</SelectItem>
                      <SelectItem value="peer-to-professional">Ask a Volunteer/Counsellor</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleCreatePost} disabled={isPosting}>
                    {isPosting ? <Loader2 className="animate-spin"/> : 'Create Post'}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
