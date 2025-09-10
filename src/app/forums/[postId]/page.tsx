
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, updateDoc, deleteDoc, where, getDocs } from 'firebase/firestore';
import type { Post } from '../page'; // Re-using Post interface
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, ShieldOff, Trash2, MessageSquareReply } from 'lucide-react';
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
  authorName: string; // Will store anonymousId
  authorRole: string;
  createdAt: Timestamp;
  parentId: string | null;
  replies?: Reply[];
}

const ReplyCard = ({ reply, onReply, canModerate, onDelete, level = 0 }: { reply: Reply; onReply: (parentId: string, content: string) => Promise<void>; canModerate: boolean; onDelete: (replyId: string) => void; level?: number }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const { user } = useAuth();
    
    const canReplyToComment = user && (
        reply.authorRole !== 'Student' || 
        user.role === 'Counsellor' || user.role === 'Admin' || user.role === 'Volunteer' || user.role === 'Student'
    );


    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        setIsReplying(true);
        await onReply(reply.id, replyContent);
        setIsReplying(false);
        setReplyContent('');
        setShowReplyForm(false);
    }

    return (
        <div style={{ marginLeft: `${level * 1.5}rem` }} className="mt-4">
            <Card className="rounded-xl">
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
                                    <AlertDialogAction onClick={() => onDelete(reply.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <p className="mt-1 text-sm">{reply.content}</p>
                    {canReplyToComment && (
                        <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={() => setShowReplyForm(!showReplyForm)}>
                            <MessageSquareReply className="mr-2 h-4 w-4"/>
                            Reply
                        </Button>
                    )}
                    {showReplyForm && (
                        <div className="mt-2 space-y-2">
                            <Textarea 
                                placeholder={`Replying to ${reply.authorName}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                disabled={isReplying}
                                className="text-sm"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleReplySubmit} disabled={isReplying || !replyContent.trim()}>
                                    {isReplying ? <Loader2 className="animate-spin h-4 w-4"/> : 'Submit'}
                                </Button>
                            </div>
                        </div>
                    )}
                  </div>
                </CardContent>
            </Card>
            {reply.replies && reply.replies.map(childReply => (
                <ReplyCard key={childReply.id} reply={childReply} onReply={onReply} canModerate={canModerate} onDelete={onDelete} level={level + 1} />
            ))}
        </div>
    )
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
      
      const repliesById: { [id: string]: Reply & { replies: Reply[] } } = {};
      fetchedReplies.forEach(reply => {
          repliesById[reply.id] = { ...reply, replies: [] };
      });

      const threadedReplies: Reply[] = [];
      fetchedReplies.forEach(reply => {
          if (reply.parentId && repliesById[reply.parentId]) {
              repliesById[reply.parentId].replies.push(repliesById[reply.id]);
          } else {
              threadedReplies.push(repliesById[reply.id]);
          }
      });

      setReplies(threadedReplies);
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
  
  const handlePostReply = async (parentId: string | null, content: string) => {
    if (!user || !content.trim()) return;

    const topLevelReply = parentId === null;
    if (topLevelReply) {
        setIsReplying(true);
    }
    
    try {
      const postDocRef = doc(db, 'posts', postId);
      const repliesCollectionRef = collection(postDocRef, 'replies');

      await addDoc(repliesCollectionRef, {
        content: content,
        authorId: user.uid,
        authorName: user.anonymousId, // Use anonymousId for replies
        authorRole: user.role,
        createdAt: serverTimestamp(),
        parentId: parentId,
      });
      
      // Update reply count on post
      const allRepliesSnapshot = await getDocs(query(collection(postDocRef, 'replies')));
      await updateDoc(postDocRef, {
          replyCount: allRepliesSnapshot.size
      });

      if (topLevelReply) {
        setNewReply('');
      }
      toast({ title: "Success", description: "Your reply has been posted." });

    } catch (error) {
      console.error("Error posting reply:", error);
      toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
    } finally {
      if (topLevelReply) {
        setIsReplying(false);
      }
    }
  };
  
  const canReplyToPost = user && (
    post?.type === 'peer-to-peer' || 
    (user.role === 'Counsellor' || user.role === 'Volunteer' || user.role === 'Admin')
  );

  const canModerate = user && (user.role === 'Counsellor' || user.role === 'Admin' || user.role === 'Volunteer');
  
  const handleDeletePost = async () => {
    if (!canModerate) return;
    try {
        await deleteDoc(doc(db, 'posts', postId));
        toast({ title: "Post Deleted", description: "The post has been removed successfully." });
        router.push('/forums');
    } catch(error) {
        console.error("Error deleting post:", error);
        toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
    }
  }

  const handleBlockPost = async () => {
    if (!canModerate) return;
    try {
        const postDocRef = doc(db, 'posts', postId);
        await updateDoc(postDocRef, { isBlocked: true });
        toast({ title: "Post Blocked", description: "The post has been blocked and removed from public view."});
        router.push('/forums');
    } catch (error) {
        console.error("Error blocking post:", error);
        toast({ title: "Error", description: "Failed to block the post.", variant: "destructive" });
    }
  };
  
  const handleDeleteReply = async (replyId: string) => {
    if (!canModerate) return;
    try {
        const postDocRef = doc(db, 'posts', postId);
        
        // This is a naive implementation for deleting replies.
        // A better approach would be a cloud function to recursively delete children.
        const repliesToDelete = [replyId];
        const allRepliesSnapshot = await getDocs(query(collection(postDocRef, 'replies')));
        const allReplies = allRepliesSnapshot.docs.map(d => ({id: d.id, ...d.data()}));

        let i = 0;
        while(i < repliesToDelete.length){
            const parentId = repliesToDelete[i];
            const children = allReplies.filter(r => r.parentId === parentId).map(r => r.id);
            repliesToDelete.push(...children);
            i++;
        }
        
        for (const id of repliesToDelete) {
            await deleteDoc(doc(postDocRef, 'replies', id));
        }

        const updatedRepliesSnapshot = await getDocs(query(collection(postDocRef, 'replies')));
        await updateDoc(postDocRef, {
            replyCount: updatedRepliesSnapshot.size
        });
        toast({ title: "Reply Deleted", description: "The reply and its thread have been removed." });
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
                    <AlertDialog>
                       <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={post.isBlocked}><ShieldOff className="mr-2 h-4 w-4"/> Block</Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Block this post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will hide the post from all public forum views. Are you sure?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBlockPost}>Block Post</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post and all its replies.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeletePost}>Delete Post</AlertDialogAction>
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
          <h3 className="font-headline text-2xl mb-4">Replies ({post.replyCount || 0})</h3>
          <div className="space-y-4">
            {isLoadingReplies ? (
              <div className="flex justify-center"><Loader2 className="animate-spin"/></div>
            ) : replies.map(reply => (
                <ReplyCard key={reply.id} reply={reply} onReply={handlePostReply} canModerate={!!canModerate} onDelete={handleDeleteReply} />
            ))}
             {replies.length === 0 && !isLoadingReplies && (
                <p className="text-center text-muted-foreground py-8">No replies yet. Be the first to share your thoughts!</p>
             )}
          </div>
        </section>

        {canReplyToPost && (
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
              <Button onClick={() => handlePostReply(null, newReply)} disabled={isReplying || !newReply.trim()}>
                {isReplying ? <Loader2 className="animate-spin"/> : <><Send className="mr-2 h-4 w-4"/> Post Reply</>}
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </>
  );
}
