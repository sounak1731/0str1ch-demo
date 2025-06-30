// src/ai/flows/generate-sales-forecast.ts
'use server';

/**
 * @fileOverview AI-powered sales forecast generator.
 *
 * - generateSalesForecast - A function that generates a sales forecast.
 * - GenerateSalesForecastInput - The input type for the generateSalesForecast function.
 * - GenerateSalesForecastOutput - The return type for the generateSalesForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSalesForecastInputSchema = z.object({
  months: z.number().describe('The number of months to forecast.'),
  salesData: z.array(z.object({
    product: z.string(),
    region: z.string(),
    revenue: z.number(),
    month: z.string()
  })).describe('The existing sales data.')
});

export type GenerateSalesForecastInput = z.infer<typeof GenerateSalesForecastInputSchema>;

const GenerateSalesForecastOutputSchema = z.array(z.object({
  product: z.string(),
  region: z.string(),
  revenue: z.number(),
  month: z.string()
})).describe('The forecasted sales data for the specified number of months.');

export type GenerateSalesForecastOutput = z.infer<typeof GenerateSalesForecastOutputSchema>;

export async function generateSalesForecast(input: GenerateSalesForecastInput): Promise<GenerateSalesForecastOutput> {
  return generateSalesForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSalesForecastPrompt',
  input: {schema: GenerateSalesForecastInputSchema},
  output: {schema: GenerateSalesForecastOutputSchema},
  prompt: `You are an expert sales forecaster. Given the following sales data, forecast sales for the next {{months}} months.

Sales Data:
{{#each salesData}}
- Product: {{product}}, Region: {{region}}, Revenue: {{revenue}}, Month: {{month}}
{{/each}}

Forecasted Sales Data (in JSON format):
`,
});

const generateSalesForecastFlow = ai.defineFlow(
  {
    name: 'generateSalesForecastFlow',
    inputSchema: GenerateSalesForecastInputSchema,
    outputSchema: GenerateSalesForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
