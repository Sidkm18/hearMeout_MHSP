'use client';

import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { featuredDiscussions, activeTopics } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Users, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ForumsPage() {
  return (
    <>
      <Header />
      <main className="container py-8">
        <h2 className="font-headline text-4xl mb-6">Community Forums</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Featured Discussions</CardTitle>
                <CardDescription>
                  Popular topics and conversations happening right now.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredDiscussions.map((discussion) => (
                  <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">{discussion.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit">{discussion.category}</Badge>
                    </CardHeader>
                    <CardFooter className="text-xs text-muted-foreground flex justify-between">
                      <span>by {discussion.author}</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {discussion.replies}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Active Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {activeTopics.map((topic, index) => (
                    <li key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                      <span className="text-sm font-medium">{topic}</span>
                       <Button variant="ghost" size="sm">Join</Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Suggest a New Topic</CardTitle>
                <CardDescription>
                  Have an idea for a discussion? Let us know!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex w-full items-center space-x-2">
                  <Input type="text" placeholder="Your topic suggestion..." />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
