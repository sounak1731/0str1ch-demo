'use server';

/**
 * @fileOverview An AI flow for cleaning sales data.
 *
 * - cleanData - A function that handles the data cleaning process.
 * - CleanDataInput - The input type for the cleanData function.
 * - CleanDataOutput - The return type for the cleanData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SaleSchema = z.object({
  product: z.string(),
  region: z.string(),
  revenue: z.number(),
  month: z.string(),
});

const CleanDataInputSchema = z.object({
  salesData: z.array(SaleSchema).describe('The raw sales data to be cleaned.'),
});
export type CleanDataInput = z.infer<typeof CleanDataInputSchema>;

const CleanDataOutputSchema = z.object({
  cleanedData: z.array(SaleSchema).describe('The cleaned sales data.'),
  summary: z.string().describe('A summary of the changes made to the data.'),
});
export type CleanDataOutput = z.infer<typeof CleanDataOutputSchema>;

export async function cleanData(input: CleanDataInput): Promise<CleanDataOutput> {
  return cleanDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cleanDataPrompt',
  input: {schema: CleanDataInputSchema},
  output: {schema: CleanDataOutputSchema},
  prompt: `You are an expert data cleansing service. Your task is to clean the provided sales data according to the following rules:
1.  Standardize region names. The only valid regions are 'North', 'South', 'East', and 'West'. Correct any variations (e.g., 'north', 'S.', 'eastern').
2.  Ensure product names are properly capitalized. For example, 'gadget x' should become 'Gadget X'.
3.  Ensure month names are properly capitalized. For example, 'january' should become 'January'.
4.  There should be no empty or null values. You can make a reasonable inference if a value is missing, but state your assumption in the summary.

After cleaning the data, provide a brief, bulleted summary of the specific changes you made.

Here is the data to clean:
{{{json salesData}}}
`,
});

const cleanDataFlow = ai.defineFlow(
  {
    name: 'cleanDataFlow',
    inputSchema: CleanDataInputSchema,
    outputSchema: CleanDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
