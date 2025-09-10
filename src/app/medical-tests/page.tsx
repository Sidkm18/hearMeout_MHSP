
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { medicalTests, Test, Question, Result } from '@/lib/medical-tests';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { differenceInDays } from 'date-fns';

type TestId = keyof typeof medicalTests;

export default function MedicalTestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedTestId, setSelectedTestId] = useState<TestId | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState<Result | null>(null);
  const [lastTestDates, setLastTestDates] = useState<Record<string, Date | null>>({});
  const [isLoadingDates, setIsLoadingDates] = useState(true);

  const selectedTest = selectedTestId ? medicalTests[selectedTestId] : null;

  useEffect(() => {
    if (!user) return;
    
    setIsLoadingDates(true);
    const fetchLastTestDates = async () => {
      const dates: Record<string, Date | null> = {};
      for (const testId of Object.keys(medicalTests)) {
        const q = query(
          collection(db, 'testResults'),
          where('userId', '==', user.uid),
          where('testName', '==', medicalTests[testId as TestId].name),
          orderBy('date', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          dates[testId] = snapshot.docs[0].data().date.toDate();
        } else {
          dates[testId] = null;
        }
      }
      setLastTestDates(dates);
      setIsLoadingDates(false);
    };

    fetchLastTestDates();
  }, [user]);

  const handleStartTest = (testId: TestId) => {
    const lastDate = lastTestDates[testId];
    if (lastDate && differenceInDays(new Date(), lastDate) < 15) {
      toast({
        variant: 'destructive',
        title: "Test Unavailable",
        description: `You can retake this test in ${15 - differenceInDays(new Date(), lastDate)} days.`,
      });
      return;
    }

    setSelectedTestId(testId);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(medicalTests[testId].questions.length).fill(null));
    setFinalResult(null);
  };
  
  const handleAnswer = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (answers[currentQuestionIndex] === null) {
      toast({ variant: 'destructive', title: 'Please select an answer.' });
      return;
    }
    if (selectedTest && currentQuestionIndex < selectedTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTest || !user) return;

    setIsSubmitting(true);
    const totalScore = answers.reduce((sum, val) => sum + (val || 0), 0);
    const result = selectedTest.calculateResult(totalScore);

    try {
      await addDoc(collection(db, 'testResults'), {
        userId: user.uid,
        testName: selectedTest.name,
        score: totalScore,
        interpretation: result.interpretation,
        date: serverTimestamp(),
      });
      setFinalResult(result);
      toast({ title: 'Test Completed', description: 'Your results have been saved.' });
    } catch (error) {
      console.error("Error saving test result: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save your results.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTest = () => {
    setSelectedTestId(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setFinalResult(null);
  };

  if (isLoadingDates) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container py-8 flex justify-center">
        <Card className="w-full max-w-3xl rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              {(selectedTestId && !finalResult) && (
                <Button variant="ghost" size="icon" onClick={resetTest}>
                  <ArrowLeft />
                </Button>
              )}
              <CardTitle className="font-headline text-4xl">
                {selectedTest ? selectedTest.name : 'Medical Self-Assessments'}
              </CardTitle>
            </div>
            <CardDescription>
              {selectedTest ? selectedTest.description : 'Choose a test to understand your well-being. These are not diagnostic tools.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedTestId ? (
              <div className="space-y-4">
                {Object.keys(medicalTests).map(key => {
                  const testId = key as TestId;
                  const test = medicalTests[testId];
                  const lastTaken = lastTestDates[testId];
                  const canTake = !lastTaken || differenceInDays(new Date(), lastTaken) >= 15;
                  return (
                    <Card key={testId} className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                         {lastTaken && <p className="text-xs text-muted-foreground mt-1">Last taken: {lastTaken.toLocaleDateString()}</p>}
                      </div>
                      <Button onClick={() => handleStartTest(testId)} disabled={!canTake}>
                        {canTake ? 'Start Test' : `Available in ${15 - differenceInDays(new Date(), lastTaken)} days`}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            ) : finalResult ? (
                <div className="text-center space-y-6 flex flex-col items-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <h2 className="text-2xl font-semibold">Test Completed</h2>
                    <p className="text-muted-foreground">Your score is <span className="font-bold text-primary">{answers.reduce((sum, val) => sum + (val || 0), 0)}</span>.</p>
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>{finalResult.interpretation}</AlertTitle>
                        <AlertDescription>
                          <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: finalResult.details }} />
                        </AlertDescription>
                    </Alert>
                    <div className="space-x-4">
                        <Button variant="outline" onClick={resetTest}>Back to Tests</Button>
                        <Button onClick={() => router.push('/student')}>Go to Dashboard</Button>
                    </div>
                </div>
            ) : (
              <div className="space-y-6">
                <Progress value={((currentQuestionIndex + 1) / selectedTest.questions.length) * 100} />
                <p className="text-center text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {selectedTest.questions.length}
                </p>
                <div className="p-4 border rounded-lg bg-muted/30 min-h-[6rem] flex items-center justify-center">
                   <h3 className="text-lg font-medium text-center">{selectedTest.questions[currentQuestionIndex].text}</h3>
                </div>

                <RadioGroup
                  value={answers[currentQuestionIndex]?.toString()}
                  onValueChange={(value) => handleAnswer(currentQuestionIndex, parseInt(value))}
                  className="space-y-2"
                >
                  {selectedTest.options.map((option, index) => (
                    <Label 
                      key={index} 
                      className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-accent has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                    >
                      <RadioGroupItem value={index.toString()} id={`${currentQuestionIndex}-${index}`} />
                      <span>{option}</span>
                    </Label>
                  ))}
                </RadioGroup>

                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0}>
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : currentQuestionIndex === selectedTest.questions.length - 1 ? (
                      'Finish & See Results'
                    ) : (
                      'Next'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
