'use client';

import { Header } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

const mockApprovals = {
    counsellors: [
        { id: 1, name: 'Dr. Samuel Green', status: 'Pending' },
        { id: 2, name: 'Dr. Olivia Chen', status: 'Approved' },
    ],
    volunteers: [
        { id: 1, name: 'Chris Evans', status: 'Pending' },
        { id: 2, name: 'Daisy Ridley', status: 'Rejected' },
    ]
};

const mockFeedback = [
    { student: 'John Doe', counsellor: 'Dr. Evelyn Reed', feedback: 'Very helpful session, felt understood.'},
    { student: 'Jane Smith', counsellor: 'Dr. Evelyn Reed', feedback: 'Could provide more actionable advice.'},
];

const mockStudents = [
    { name: 'John Doe', year: '2nd Year', email: 'john.d@example.edu'},
    { name: 'Jane Smith', year: '3rd Year', email: 'jane.s@example.edu'},
    { name: 'Mike Ross', year: '1st Year', email: 'mike.r@example.edu'},
]

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== 'Admin') {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        <h2 className="font-headline text-4xl mb-6">Admin Dashboard</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card className="md:col-span-2 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Counsellor Approvals</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockApprovals.counsellors.map(c => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.name}</TableCell>
                                <TableCell><Badge variant={c.status === 'Approved' ? 'default' : c.status === 'Pending' ? 'secondary' : 'destructive'}>{c.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><UserIcon className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-green-500"><Check className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500"><X className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Counsellor Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockFeedback.map((f, i) => (
                <div key={i} className="border p-3 rounded-lg">
                    <p className="text-sm font-medium">{f.feedback}</p>
                    <p className="text-xs text-muted-foreground mt-1">From: {f.student} | For: {f.counsellor}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Volunteer Approvals</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockApprovals.volunteers.map(v => (
                            <TableRow key={v.id}>
                                <TableCell className="font-medium">{v.name}</TableCell>
                                <TableCell><Badge variant={v.status === 'Approved' ? 'default' : v.status === 'Pending' ? 'secondary' : 'destructive'}>{v.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="text-green-500"><Check className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500"><X className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Student Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Email</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockStudents.map(s => (
                        <TableRow key={s.email}>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.year}</TableCell>
                            <TableCell>{s.email}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Resource Upload</CardTitle>
              <CardDescription>Add new articles, videos, or book recommendations to the HealMe section.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Enter resource links, descriptions, and categories..." />
            </CardContent>
            <CardFooter>
                <Button>Upload Resource</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
