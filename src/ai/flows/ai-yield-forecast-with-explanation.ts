'use server';
/**
 * @fileOverview This file implements a Genkit flow for predicting crop yields and providing explanations for these predictions.
 *
 * - aiYieldForecastWithExplanation - A function that generates an AI-powered yield forecast with an explanation.
 * - YieldForecastInput - The input type for the aiYieldForecastWithexplanation function.
 * - YieldForecastOutput - The return type for the aiYieldForecastWithExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YieldForecastInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown (e.g., Corn, Wheat).'),
  fieldArea: z.number().describe('The area of the field in a specified unit (e.g., acres, hectares).'),
  fieldAreaUnit: z.string().describe('The unit of measurement for the field area (e.g., "acres", "hectares").'),
  soilpH: z.number().describe('The pH level of the soil.'),
  yieldHistory: z.string().describe('A summary of past yield data for the field.'),
  recentRainfall: z.string().describe('Information about recent rainfall.'),
  fertilizerApplied: z.string().describe('Details about fertilizer application.'),
  temperatureHistory: z.string().describe('A summary of recent temperature conditions.'),
  humidityHistory: z.string().describe('A summary of recent humidity conditions.'),
  pestsDiseasesObserved: z.string().describe('Details on any observed pests or diseases.'),
});
export type YieldForecastInput = z.infer<typeof YieldForecastInputSchema>;

const YieldForecastOutputSchema = z.object({
  predictedYieldValue: z.number().describe('The forecasted yield value.'),
  predictedYieldUnit: z.string().describe('The unit for the predicted yield.'),
  explanation: z
    .string()
    .describe('A clear, detailed explanation of the key factors influencing the prediction.'),
});
export type YieldForecastOutput = z.infer<typeof YieldForecastOutputSchema>;

export async function aiYieldForecastWithExplanation(
  input: YieldForecastInput
): Promise<YieldForecastOutput> {
  return yieldForecastFlow(input);
}

const yieldForecastPrompt = ai.definePrompt({
  name: 'yieldForecastPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: YieldForecastInputSchema},
  output: {schema: YieldForecastOutputSchema},
  prompt: `You are an expert agricultural AI assistant specialized in crop yield prediction and analysis. Your task is to provide a yield forecast for a farmer's field and explain the key factors influencing your prediction.

Based on the following field data, provide a precise numerical yield forecast along with the unit, and a comprehensive explanation.

Crop Type: {{{cropType}}}
Field Area: {{{fieldArea}}} {{{fieldAreaUnit}}}
Soil pH: {{{soilpH}}}
Yield History: {{{yieldHistory}}}
Recent Rainfall: {{{recentRainfall}}}
Fertilizer Applied: {{{fertilizerApplied}}}
Temperature History: {{{temperatureHistory}}}
Humidity History: {{{humidityHistory}}}
Pests/Diseases Observed: {{{pestsDiseasesObserved}}}

Consider all provided data points to make an accurate prediction. The explanation should be clear, concise, and highlight which factors had the most significant impact (positive or negative) on the forecast.`,
});

const yieldForecastFlow = ai.defineFlow(
  {
    name: 'yieldForecastFlow',
    inputSchema: YieldForecastInputSchema,
    outputSchema: YieldForecastOutputSchema,
  },
  async input => {
    const {output} = await yieldForecastPrompt(input);
    if (!output) {
      throw new Error('Failed to generate yield forecast or explanation.');
    }
    return output;
  }
);
