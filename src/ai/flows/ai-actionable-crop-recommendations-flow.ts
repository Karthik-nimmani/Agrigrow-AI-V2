'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating actionable agricultural recommendations.
 *
 * - aiActionableCropRecommendations - A function that handles the generation of crop recommendations.
 * - AiActionableCropRecommendationsInput - The input type for the aiActionableCropRecommendations function.
 * - AiActionableCropRecommendationsOutput - The return type for the aiActionableCropRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiActionableCropRecommendationsInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown in the field (e.g., "Corn", "Wheat").'),
  soilPH: z.number().min(0).max(14).describe('The current pH level of the soil.'),
  areaAcres: z.number().positive().describe('The area of the field in acres.'),
  yieldForecast: z.string().describe('An AI-predicted yield forecast or analysis for the upcoming harvest.'),
  soilNutrients: z.string().optional().describe('Optional: Detailed report of soil nutrients (e.g., "Nitrogen: 100ppm, Phosphorus: 50ppm, Potassium: 120ppm").'),
  weatherForecast: z.string().optional().describe('Optional: Summary of the upcoming weather forecast (e.g., "Upcoming week: temperature 25C, rainfall 10mm").'),
});
export type AiActionableCropRecommendationsInput = z.infer<typeof AiActionableCropRecommendationsInputSchema>;

const AiActionableCropRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('An array of actionable agricultural recommendations, e.g., "Apply 50kg lime/acre".'),
});
export type AiActionableCropRecommendationsOutput = z.infer<typeof AiActionableCropRecommendationsOutputSchema>;

export async function aiActionableCropRecommendations(input: AiActionableCropRecommendationsInput): Promise<AiActionableCropRecommendationsOutput> {
  return aiActionableCropRecommendationsFlow(input);
}

const aiActionableCropRecommendationsPrompt = ai.definePrompt({
  name: 'aiActionableCropRecommendationsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: AiActionableCropRecommendationsInputSchema},
  output: {schema: AiActionableCropRecommendationsOutputSchema},
  prompt: `You are an expert agricultural advisor. Your task is to provide concise, actionable recommendations to a farmer to optimize their agricultural practices and improve yields. Based on the provided field data and yield forecast, generate specific, practical advice.

Field Data:
Crop Type: {{{cropType}}}
Soil pH: {{{soilPH}}}
Field Area: {{{areaAcres}}} acres
Yield Forecast: {{{yieldForecast}}}

{{#if soilNutrients}}
Soil Nutrient Report: {{{soilNutrients}}}
{{/if}}

{{#if weatherForecast}}
Weather Forecast: {{{weatherForecast}}}
{{/if}}

Provide only actionable recommendations, formatted as a JSON array of strings. Each recommendation should be direct, practical, and quantifiable if applicable. For example: ['Apply 50kg lime/acre', 'Adjust irrigation to 1 inch per week']. Focus on tangible steps the farmer can take.`,
});

const aiActionableCropRecommendationsFlow = ai.defineFlow(
  {
    name: 'aiActionableCropRecommendationsFlow',
    inputSchema: AiActionableCropRecommendationsInputSchema,
    outputSchema: AiActionableCropRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await aiActionableCropRecommendationsPrompt(input);
    if (!output) {
      // Return a safe default instead of throwing to prevent complete UI failure
      return { recommendations: ["Maintain current practices and monitor soil moisture."] };
    }
    return output;
  },
);
