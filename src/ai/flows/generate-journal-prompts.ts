'use server';
/**
 * @fileOverview An AI flow that generates personalized journal prompts.
 *
 * - generateJournalPrompts - A function that generates prompts based on mood and emotions.
 * - GenerateJournalPromptsInput - The input type for the function.
 * - GenerateJournalPromptsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJournalPromptsInputSchema = z.object({
  mood: z
    .number()
    .describe("The user's overall mood on a scale of 1 to 10."),
  emotions: z
    .array(z.string())
    .describe('A list of specific emotions the user is feeling.'),
});
export type GenerateJournalPromptsInput = z.infer<
  typeof GenerateJournalPromptsInputSchema
>;

const GenerateJournalPromptsOutputSchema = z.object({
  prompts: z
    .array(z.string())
    .describe('A list of 3-4 thoughtful journal prompts.'),
});
export type GenerateJournalPromptsOutput = z.infer<
  typeof GenerateJournalPromptsOutputSchema
>;

export async function generateJournalPrompts(
  input: GenerateJournalPromptsInput
): Promise<GenerateJournalPromptsOutput> {
  return generateJournalPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJournalPromptsPrompt',
  input: {schema: GenerateJournalPromptsInputSchema},
  output: {schema: GenerateJournalPromptsOutputSchema},
  prompt: `You are a compassionate and insightful assistant designed to help users reflect on their feelings through journaling.

Based on the user's current state, generate 3-4 thoughtful and open-ended journal prompts. The prompts should encourage self-exploration and deeper reflection.

- User's overall mood (1=very low, 10=excellent): {{{mood}}}
- Specific emotions they are feeling: {{#each emotions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Generate prompts that are relevant to these feelings. For example, if the mood is low and emotions are 'Sad', prompts could be about understanding the source of sadness or finding comfort. If the mood is high and emotions are 'Happy' and 'Motivated', prompts could be about capturing gratitude or planning future goals.
`,
});

const generateJournalPromptsFlow = ai.defineFlow(
  {
    name: 'generateJournalPromptsFlow',
    inputSchema: GenerateJournalPromptsInputSchema,
    outputSchema: GenerateJournalPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
