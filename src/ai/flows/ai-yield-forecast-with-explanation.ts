'use server';
/**
 * @fileOverview Yield forecasting using Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YieldForecastInputSchema = z.object({
  cropType: z.string(),
  fieldArea: z.number(),
  fieldAreaUnit: z.string(),
  soilpH: z.number(),
  yieldHistory: z.string(),
  recentRainfall: z.string(),
  fertilizerApplied: z.string(),
  temperatureHistory: z.string(),
  humidityHistory: z.string(),
  pestsDiseasesObserved: z.string(),
});
export type YieldForecastInput = z.infer<typeof YieldForecastInputSchema>;

const YieldForecastOutputSchema = z.object({
  predictedYieldValue: z.number(),
  predictedYieldUnit: z.string(),
  explanation: z.string(),
});
export type YieldForecastOutput = z.infer<typeof YieldForecastOutputSchema>;

export async function aiYieldForecastWithExplanation(
  input: YieldForecastInput
): Promise<YieldForecastOutput> {
  return yieldForecastFlow(input);
}

const yieldForecastPrompt = ai.definePrompt({
  name: 'yieldForecastPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: YieldForecastInputSchema},
  output: {schema: YieldForecastOutputSchema},
  prompt: `You are an expert agricultural AI. Predict yield and explain factors.

Crop: {{{cropType}}}
Area: {{{fieldArea}}} {{{fieldAreaUnit}}}
Soil pH: {{{soilpH}}}
History: {{{yieldHistory}}}`,
});

const yieldForecastFlow = ai.defineFlow(
  {
    name: 'yieldForecastFlow',
    inputSchema: YieldForecastInputSchema,
    outputSchema: YieldForecastOutputSchema,
  },
  async input => {
    const {output} = await yieldForecastPrompt(input);
    if (!output) throw new Error('Forecast failed');
    return output;
  }
);
