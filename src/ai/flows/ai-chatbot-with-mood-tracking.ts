'use server';
/**
 * @fileOverview An AI chatbot that provides personalized support and encouragement based on the user's tracked mood levels.
 *
 * - aiChatbot - A function that handles the chatbot interaction.
 * - AIChatbotInput - The input type for the aiChatbot function.
 * - AIChatbotOutput - The return type for the aiChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatbotInputSchema = z.object({
  mood: z
    .string()
    .describe("The user's current mood (e.g., 'Sad', 'Happy', 'Neutral')."),
  message: z.string().describe('The user message to the chatbot.'),
});
export type AIChatbotInput = z.infer<typeof AIChatbotInputSchema>;

const AIChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response.'),
});
export type AIChatbotOutput = z.infer<typeof AIChatbotOutputSchema>;

export async function aiChatbot(input: AIChatbotInput): Promise<AIChatbotOutput> {
  return aiChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotPrompt',
  input: {schema: AIChatbotInputSchema},
  output: {schema: AIChatbotOutputSchema},
  prompt: `You are a mental health support chatbot designed to provide personalized support and encouragement to students.

You will consider the user's current mood and tailor your response accordingly.

If the user's mood is 'Sad', offer words of encouragement and suggest coping mechanisms.
If the user's mood is 'Happy', offer positive reinforcement and celebrate their well-being.
If the user's mood is 'Neutral', provide general support and ask how you can assist them further.

User Mood: {{{mood}}}
User Message: {{{message}}}

Chatbot Response:`, // Removed Handlebars from the Chatbot Response
});

const aiChatbotFlow = ai.defineFlow(
  {
    name: 'aiChatbotFlow',
    inputSchema: AIChatbotInputSchema,
    outputSchema: AIChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {response: output!.response};
  }
);
