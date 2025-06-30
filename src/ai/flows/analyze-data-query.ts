
'use server';

/**
 * @fileOverview AI flow for analyzing sales data based on a user query.
 *
 * - analyzeDataQuery - A function that handles the data analysis process.
 * - AnalyzeDataQueryInput - The input type for the analyzeDataQuery function.
 * - AnalyzeDataQueryOutput - The return type for the analyzeDataQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDataQueryInputSchema = z.object({
  query: z.string().describe('The query related to the sales data.'),
  salesData: z.string().describe('Sales data in JSON format, including revenue, marketingSpend, and cac.'),
});
export type AnalyzeDataQueryInput = z.infer<typeof AnalyzeDataQueryInputSchema>;

const AnalyzeDataQueryOutputSchema = z.object({
  summary: z.string().describe('A summary or analysis of the sales data based on the query.'),
});
export type AnalyzeDataQueryOutput = z.infer<typeof AnalyzeDataQueryOutputSchema>;

export async function analyzeDataQuery(input: AnalyzeDataQueryInput): Promise<AnalyzeDataQueryOutput> {
  return analyzeDataQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDataQueryPrompt',
  input: {schema: AnalyzeDataQueryInputSchema},
  output: {schema: AnalyzeDataQueryOutputSchema},
  prompt: `You are an AI assistant for a powerful Work OS called 0str1ch. You are conducting an interactive product demo. Your responses should be helpful, concise, and act as if you are performing the requested actions on the user's canvas. When a user asks you to do something, respond as if you have already completed the action. For example, if asked to create a chart, say "I've added the chart to your canvas."

  The available data contains: product, region, month, revenue, marketingSpend, and cac (customer acquisition cost).

  Sales Data: {{{salesData}}}

  User's Request: {{{query}}}

  Your Response: `,
});

const analyzeDataQueryFlow = ai.defineFlow(
  {
    name: 'analyzeDataQueryFlow',
    inputSchema: AnalyzeDataQueryInputSchema,
    outputSchema: AnalyzeDataQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
