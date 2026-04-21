
'use server';
/**
 * @fileOverview Actionable crop recommendations using Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiActionableCropRecommendationsInputSchema = z.object({
  cropType: z.string(),
  soilPH: z.number().min(0).max(14),
  areaAcres: z.number().positive(),
  yieldForecast: z.string(),
  soilNutrients: z.string().optional(),
  weatherForecast: z.string().optional(),
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
  prompt: `You are a professional agricultural consultant. Provide 3 high-impact, actionable steps to maximize yield for this specific field.

Crop: {{{cropType}}}
Soil pH: {{{soilPH}}}
Area: {{{areaAcres}}} acres
Current Forecast Context: {{{yieldForecast}}}`,
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
      return { recommendations: ["Monitor soil moisture", "Apply NPK fertilizer", "Inspect for early signs of blight"] };
    }
    return output;
  },
);
