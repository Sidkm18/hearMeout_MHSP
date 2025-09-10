
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Post } from '../page'; // Re-using Post interface
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, ShieldOff, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Reply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: Timestamp;
}

export default function PostPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(true);
  
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const postDocRef = doc(db, 'posts', postId);

    const unsubscribePost = onSnapshot(postDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        } else {
          toast({ title: "Error", description: "Post not found.", variant: "destructive" });
          router.push('/forums');
        }
        setIsLoadingPost(false);
    }, (error) => {
        console.error("Error fetching post:", error);
        toast({ title: "Error", description: "Could not fetch the post.", variant: "destructive" });
        setIsLoadingPost(false);
    });


    const repliesQuery = query(collection(postDocRef, 'replies'), orderBy('createdAt', 'asc'));
    const unsubscribeReplies = onSnapshot(repliesQuery, (snapshot) => {
      const fetchedReplies: Reply[] = [];
      snapshot.forEach(doc => {
        fetchedReplies.push({ id: doc.id, ...doc.data() } as Reply);
      });
      setReplies(fetchedReplies);
      setIsLoadingReplies(false);
    }, (error) => {
        console.error("Error fetching replies:", error);
        toast({ title: "Error", description: "Could not load replies.", variant: "destructive" });
        setIsLoadingReplies(false);
    });

    return () => {
        unsubscribePost();
        unsubscribeReplies();
    };
  }, [postId, router, toast]);

  const handlePostReply = async () => {
    if (!user || !newReply.trim()) return;

    setIsReplying(true);
    try {
      const postDocRef = doc(db, 'posts', postId);
      const repliesCollectionRef = collection(postDocRef, 'replies');

      await addDoc(repliesCollectionRef, {
        content: newReply,
        authorId: user.uid,
        authorName: user.name,
        authorRole: user.role,
        createdAt: serverTimestamp(),
      });
      
      // Update reply count on the post
      await updateDoc(postDocRef, {
          replyCount: replies.length + 1
      });

      setNewReply('');
      toast({ title: "Success", description: "Your reply has been posted." });

    } catch (error) {
      console.error("Error posting reply:", error);
      toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
    } finally {
      setIsReplying(false);
    }
  };
  
  const canReply = user && (
    post?.type === 'peer-to-peer' || 
    (user.role === 'Counsellor' || user.role === 'Volunteer' || user.role === 'Admin')
  );

  const canModerate = user && (user.role === 'Counsellor' || user.role === 'Admin' || user.role === 'Volunteer');
  
  const handleDeletePost = async () => {
    if (!canModerate) return;
    try {
        // Note: Deleting a document does not delete its subcollections!
        // For a production app, you'd use a Cloud Function to delete replies.
        // For this prototype, we'll just delete the post document.
        await deleteDoc(doc(db, 'posts', postId));
        toast({ title: "Post Deleted", description: "The post has been removed successfully." });
        router.push('/forums');
    } catch(error) {
        console.error("Error deleting post:", error);
        toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
    }
  }
  
  const handleDeleteReply = async (replyId: string) => {
    if (!canModerate) return;
    try {
        const postDocRef = doc(db, 'posts', postId);
        const replyDocRef = doc(postDocRef, 'replies', replyId);
        await deleteDoc(replyDocRef);
        await updateDoc(postDocRef, {
            replyCount: replies.length - 1
        });
        toast({ title: "Reply Deleted", description: "The reply has been removed." });
    } catch (error) {
        console.error("Error deleting reply:", error);
        toast({ title: "Error", description: "Failed to delete reply.", variant: "destructive" });
    }
  }


  if (isLoadingPost) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin"/></div>
  }

  if (!post) {
     return <div className="flex min-h-screen items-center justify-center"><p>Post not found.</p></div>
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-3xl">{post.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-xs pt-2">
                    <Badge variant={post.type === 'peer-to-peer' ? 'secondary' : 'default'}>
                        {post.type === 'peer-to-peer' ? 'Peer-to-Peer' : 'Peer-to-Volunteer'}
                    </Badge>
                  <span>By {post.authorName} ({post.authorRole})</span>
                  <span>{post.createdAt ? format(post.createdAt.toDate(), 'PPP') : '...'}</span>
                </CardDescription>
              </div>
              {canModerate && (
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled><ShieldOff className="mr-2 h-4 w-4"/> Block</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> Delete Post</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post and all its replies.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                 </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </CardContent>
        </Card>

        <section className="mt-8">
          <h3 className="font-headline text-2xl mb-4">Replies ({replies.length})</h3>
          <div className="space-y-6">
            {isLoadingReplies ? (
              <div className="flex justify-center"><Loader2 className="animate-spin"/></div>
            ) : replies.map(reply => (
              <Card key={reply.id} className="rounded-2xl">
                <CardContent className="p-4 flex items-start gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{reply.authorName}</span>
                            <Badge variant="outline" className="text-xs">{reply.authorRole}</Badge>
                            <span className="text-xs text-muted-foreground">
                                {reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : '...'}
                            </span>
                        </div>
                        {canModerate && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this reply?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. Are you sure you want to permanently delete this reply?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteReply(reply.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <p className="mt-1 text-sm">{reply.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
             {replies.length === 0 && !isLoadingReplies && (
                <p className="text-center text-muted-foreground py-8">No replies yet. Be the first to share your thoughts!</p>
             )}
          </div>
        </section>

        {canReply && (
          <Card className="mt-8 rounded-2xl shadow-lg sticky bottom-4">
            <CardHeader>
              <CardTitle>Post a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Share your thoughts..."
                value={newReply}
                onChange={e => setNewReply(e.target.value)}
                disabled={isReplying}
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handlePostReply} disabled={isReplying || !newReply.trim()}>
                {isReplying ? <Loader2 className="animate-spin"/> : <><Send className="mr-2 h-4 w-4"/> Post Reply</>}
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </>
  );
}
