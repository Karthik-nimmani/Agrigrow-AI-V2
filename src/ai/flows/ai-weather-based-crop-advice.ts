'use server';
/**
 * @fileOverview Weather-based crop advice using Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiWeatherBasedCropAdviceInputSchema = z.object({
  location: z.string(),
  cropType: z.string(),
  currentConditions: z.object({
    temperature: z.number(),
    humidity: z.number(),
    soilMoisture: z.number(),
  }),
  weatherForecast: z.string(),
  cropGrowthStage: z.string().optional(),
});

const AiWeatherBasedCropAdviceOutputSchema = z.object({
  alert: z.string().optional(),
  advice: z.string(),
  riskDetected: z.boolean(),
});

export type AiWeatherBasedCropAdviceOutput = z.infer<typeof AiWeatherBasedCropAdviceOutputSchema>;

export async function aiWeatherBasedCropAdvice(
  input: z.infer<typeof AiWeatherBasedCropAdviceInputSchema>
): Promise<AiWeatherBasedCropAdviceOutput> {
  return aiWeatherBasedCropAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWeatherBasedCropAdvicePrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: AiWeatherBasedCropAdviceInputSchema},
  output: {schema: AiWeatherBasedCropAdviceOutputSchema},
  prompt: `You are an expert agricultural advisor. Analyze weather risks.
Location: {{{location}}}
Crop: {{{cropType}}}
Temp: {{{currentConditions.temperature}}}°C
Humidity: {{{currentConditions.humidity}}}%
Soil Moisture: {{{currentConditions.soilMoisture}}}%
Forecast: {{{weatherForecast}}}`,
});

const aiWeatherBasedCropAdviceFlow = ai.defineFlow(
  {
    name: 'aiWeatherBasedCropAdviceFlow',
    inputSchema: AiWeatherBasedCropAdviceInputSchema,
    outputSchema: AiWeatherBasedCropAdviceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      return { advice: "Conditions are stable. Continue regular monitoring.", riskDetected: false };
    }
    return output;
  }
);
