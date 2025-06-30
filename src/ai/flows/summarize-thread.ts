'use server';

/**
 * @fileOverview AI flow for summarizing a conversation thread.
 *
 * - summarizeThread - A function that handles the thread summarization.
 * - SummarizeThreadInput - The input type for the summarizeThread function.
 * - SummarizeThreadOutput - The return type for the summarizeThread function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeThreadInputSchema = z.object({
  thread: z.string().describe('The conversation thread as a JSON string. Each message has a user and text.'),
});
export type SummarizeThreadInput = z.infer<typeof SummarizeThreadInputSchema>;

const SummarizeThreadOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the conversation, identifying key decisions, action items, and overall sentiment.'),
});
export type SummarizeThreadOutput = z.infer<typeof SummarizeThreadOutputSchema>;

export async function summarizeThread(input: SummarizeThreadInput): Promise<SummarizeThreadOutput> {
  return summarizeThreadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeThreadPrompt',
  input: {schema: SummarizeThreadInputSchema},
  output: {schema: SummarizeThreadOutputSchema},
  prompt: `You are an AI assistant expert at summarizing conversations.
  Analyze the following discussion thread and provide a concise summary.
  Highlight any decisions made, action items assigned, and the overall sentiment of the conversation.

  Conversation Thread (JSON):
  {{{thread}}}

  Your Summary:`,
});

const summarizeThreadFlow = ai.defineFlow(
  {
    name: 'summarizeThreadFlow',
    inputSchema: SummarizeThreadInputSchema,
    outputSchema: SummarizeThreadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
