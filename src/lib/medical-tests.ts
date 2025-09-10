
export interface Question {
  text: string;
}

export interface Result {
  interpretation: string;
  details: string;
}

export interface Test {
  name: string;
  description: string;
  questions: Question[];
  options: string[];
  calculateResult: (score: number) => Result;
}

const phq9Questions: Question[] = [
  { text: 'Little interest or pleasure in doing things' },
  { text: 'Feeling down, depressed, or hopeless' },
  { text: 'Trouble falling or staying asleep, or sleeping too much' },
  { text: 'Feeling tired or having little energy' },
  { text: 'Poor appetite or overeating' },
  { text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
  { text: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
  { text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual' },
  { text: 'Thoughts that you would be better off dead or of hurting yourself in some way' },
];

const gad7Questions: Question[] = [
  { text: "Feeling nervous, anxious, or on edge" },
  { text: "Not being able to stop or control worrying" },
  { text: "Worrying too much about different things" },
  { text: "Trouble relaxing" },
  { text: "Being so restless that it's hard to sit still" },
  { text: "Becoming easily annoyed or irritable" },
  { text: "Feeling afraid as if something awful might happen" },
];

const dass21Questions: Question[] = [
    // Depression
    { text: 'I couldn\'t seem to experience any positive feeling at all' },
    { text: 'I just couldn\'t seem to get going' },
    { text: 'I felt that I had nothing to look forward to' },
    { text: 'I felt down-hearted and blue' },
    { text: 'I was unable to become enthusiastic about anything' },
    { text: 'I felt I wasn\'t worth much as a person' },
    { text: 'I felt that life was meaningless' },
    // Anxiety
    { text: 'I was aware of dryness of my mouth' },
    { text: 'I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)' },
    { text: 'I experienced trembling (e.g., in the hands)' },
    { text: 'I was worried about situations in which I might panic and make a fool of myself' },
    { text: 'I felt I was close to panic' },
    { text: 'I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)' },
    { text: 'I felt scared without any good reason' },
    // Stress
    { text: 'I found it hard to wind down' },
    { text: 'I tended to over-react to situations' },
    { text: 'I felt that I was using a lot of nervous energy' },
    { text: 'I found myself getting agitated' },
    { text: 'I found it difficult to relax' },
    { text: 'I was intolerant of anything that kept me from getting on with what I was doing' },
    { text: 'I felt that I was rather touchy' },
];

const standardOptions = [
  'Not at all',
  'Several days',
  'More than half the days',
  'Nearly every day',
];

const dassOptions = [
    "Did not apply to me at all",
    "Applied to me to some degree, or some of the time",
    "Applied to me to a considerable degree, or a good part of the time",
    "Applied to me very much, or most of the time"
];

const phq9Result = (score: number): Result => {
  let interpretation = '';
  if (score <= 4) interpretation = 'Minimal Depression';
  else if (score <= 9) interpretation = 'Mild Depression';
  else if (score <= 14) interpretation = 'Moderate Depression';
  else if (score <= 19) interpretation = 'Moderately Severe Depression';
  else interpretation = 'Severe Depression';
  
  return {
    interpretation,
    details: `<p>Your score suggests you may be experiencing symptoms of ${interpretation.toLowerCase()}.</p><p>This is a screening tool, not a diagnosis. It can be helpful to discuss these results with a counsellor or healthcare provider to get a clearer picture of your mental health and explore potential support options.</p>`,
  };
};

const gad7Result = (score: number): Result => {
  let interpretation = '';
  if (score <= 4) interpretation = 'Minimal Anxiety';
  else if (score <= 9) interpretation = 'Mild Anxiety';
  else if (score <= 14) interpretation = 'Moderate Anxiety';
  else interpretation = 'Severe Anxiety';

  return {
    interpretation,
    details: `<p>Your score suggests you may be experiencing symptoms of ${interpretation.toLowerCase()}.</p><p>Remember, this quiz is a starting point for reflection, not a clinical diagnosis. Speaking with a mental health professional can provide clarity and guidance.</p>`,
  };
};

const dass21Result = (score: number): Result => {
    // Note: DASS-21 scoring is more complex. It has sub-scales. 
    // This simplified version just gives a general interpretation based on total score.
    // A proper implementation would calculate scores for Depression, Anxiety, and Stress separately.
  let interpretation = '';
  if (score <= 14) interpretation = 'Low Distress';
  else if (score <= 24) interpretation = 'Mild Distress';
  else if (score <= 34) interpretation = 'Moderate Distress';
  else if (score <= 44) interpretation = 'Severe Distress';
  else interpretation = 'Extremely Severe Distress';

  return {
    interpretation,
    details: `<p>Your total score suggests a level of <strong>${interpretation}</strong> across the combined areas of depression, anxiety, and stress.</p><p>To get a more detailed understanding, it's beneficial to look at the individual sub-scores. We recommend discussing these results with a counsellor to explore what might be contributing to these feelings.</p>`,
  };
};

export const medicalTests: { [key: string]: Test } = {
  phq9: {
    name: 'PHQ-9 (Depression)',
    description: 'A 9-item questionnaire to screen for depression severity over the last 2 weeks.',
    questions: phq9Questions,
    options: standardOptions,
    calculateResult: phq9Result,
  },
  gad7: {
    name: 'GAD-7 (Anxiety)',
    description: 'A 7-item tool to screen for and measure the severity of generalized anxiety disorder.',
    questions: gad7Questions,
    options: standardOptions,
    calculateResult: gad7Result,
  },
  dass21: {
      name: 'DASS-21 (Depression, Anxiety, Stress)',
      description: 'Measures the three related states of depression, anxiety, and stress.',
      questions: dass21Questions,
      options: dassOptions,
      calculateResult: dass21Result
  }
};
