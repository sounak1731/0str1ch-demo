
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
  query: z.string().describe('The current query related to the sales data.'),
  salesData: z.string().describe('Sales data in JSON format, including revenue, marketingSpend, and cac.'),
  history: z.array(z.object({
    sender: z.string(),
    text: z.string(),
  })).optional().describe('The conversation history to provide context.'),
});
export type AnalyzeDataQueryInput = z.infer<typeof AnalyzeDataQueryInputSchema>;

const AnalyzeDataQueryOutputSchema = z.object({
  summary: z.string().describe('A summary or analysis of the sales data based on the query.'),
});
export type AnalyzeDataQueryOutput = z.infer<typeof AnalyzeDataQueryOutputSchema>;


// This tool will be used by the AI to perform calculations.
const calculateTotalTool = ai.defineTool(
  {
    name: 'calculateTotal',
    description: 'Calculates the total sum of a specified numeric column in the provided sales data. Use this tool for any questions about totals, sums, or aggregations.',
    inputSchema: z.object({
      columnName: z.string().describe("The name of the numeric column to sum. Should be one of 'revenue', 'marketingSpend', or 'cac'."),
      salesData: z.string().describe("The sales data as a JSON string to perform the calculation on."),
    }),
    outputSchema: z.object({
      columnName: z.string(),
      total: z.number(),
    }),
  },
  async (input) => {
    const { columnName, salesData } = input;
    const data = JSON.parse(salesData) as { [key: string]: any }[];

    if (!['revenue', 'marketingSpend', 'cac'].includes(columnName)) {
        throw new Error(`Invalid column name: ${columnName}. Must be 'revenue', 'marketingSpend', or 'cac'.`);
    }

    const total = data.reduce((sum: number, row: any) => {
        const value = row[columnName];
        return typeof value === 'number' ? sum + value : sum;
    }, 0);

    return {
      columnName,
      total,
    };
  }
);

export async function analyzeDataQuery(input: AnalyzeDataQueryInput): Promise<AnalyzeDataQueryOutput> {
  return analyzeDataQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDataQueryPrompt',
  input: {schema: AnalyzeDataQueryInputSchema},
  output: {schema: AnalyzeDataQueryOutputSchema},
  tools: [calculateTotalTool], // Provide the tool to the AI
  prompt: `You are an AI assistant for a powerful Work OS called 0str1ch. You are conducting an interactive product demo. Your responses should be helpful, concise, and act as if you are performing the requested actions on the user's canvas. When a user asks you to do something, respond as if you have already completed the action. For example, if asked to create a chart, say "I've added the chart to your canvas."

  When asked to perform a calculation like a sum or total on the data, you MUST use the 'calculateTotal' tool. The sales data is provided in the input, and you must pass this data to the tool when you call it. After the tool returns a result, formulate a natural language response (e.g., "The total revenue is $...").

  The available data contains: product, region, month, revenue, marketingSpend, and cac (customer acquisition cost).

  Sales Data: {{{salesData}}}

  You have access to the conversation history to understand context from previous turns.

  Conversation History:
  {{#each history}}
  - {{this.sender}}: {{this.text}}
  {{/each}}

  User's Current Request: {{{query}}}

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
