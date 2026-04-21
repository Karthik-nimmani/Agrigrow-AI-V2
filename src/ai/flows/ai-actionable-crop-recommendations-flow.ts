'use server';
/**
 * @fileOverview Actionable crop recommendations using Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiActionableCropRecommendationsInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown in the field.'),
  soilPH: z.number().min(0).max(14).describe('The current pH level of the soil.'),
  areaAcres: z.number().positive().describe('The area of the field in acres.'),
  yieldForecast: z.string().describe('An AI-predicted yield forecast or analysis.'),
  soilNutrients: z.string().optional().describe('Optional: Detailed report of soil nutrients.'),
  weatherForecast: z.string().optional().describe('Optional: Summary of the upcoming weather forecast.'),
});
export type AiActionableCropRecommendationsInput = z.infer<typeof AiActionableCropRecommendationsInputSchema>;

const AiActionableCropRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('An array of actionable agricultural recommendations.'),
});
export type AiActionableCropRecommendationsOutput = z.infer<typeof AiActionableCropRecommendationsOutputSchema>;

export async function aiActionableCropRecommendations(input: AiActionableCropRecommendationsInput): Promise<AiActionableCropRecommendationsOutput> {
  return aiActionableCropRecommendationsFlow(input);
}

const aiActionableCropRecommendationsPrompt = ai.definePrompt({
  name: 'aiActionableCropRecommendationsPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: AiActionableCropRecommendationsInputSchema},
  output: {schema: AiActionableCropRecommendationsOutputSchema},
  prompt: `You are an expert agricultural advisor. Provide 3 concise, practical, and quantifiable recommendations.

Field Data:
Crop Type: {{{cropType}}}
Soil pH: {{{soilPH}}}
Field Area: {{{areaAcres}}} acres
Yield Forecast: {{{yieldForecast}}}`,
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
      return { recommendations: ["Monitor soil moisture", "Check for pests", "Maintain current pH"] };
    }
    return output;
  },
);
