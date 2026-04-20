'use server';
/**
 * @fileOverview AI-generated dynamic alerts and proactive advice based on real-time local weather data.
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
  model: 'googleai/gemini-1.5-flash',
  input: {schema: AiWeatherBasedCropAdviceInputSchema},
  output: {schema: AiWeatherBasedCropAdviceOutputSchema},
  prompt: `You are an expert agricultural advisor. Analyze local weather data.
Location: {{{location}}}
Crop: {{{cropType}}}
Temp: {{{currentConditions.temperature}}}°C
Humidity: {{{currentConditions.humidity}}}%
Soil Moisture: {{{currentConditions.soilMoisture}}}%
Forecast: {{{weatherForecast}}}

Identify immediate risks (frost, heat, drought). Provide actionable advice.`,
});

const aiWeatherBasedCropAdviceFlow = ai.defineFlow(
  {
    name: 'aiWeatherBasedCropAdviceFlow',
    inputSchema: AiWeatherBasedCropAdviceInputSchema,
    outputSchema: AiWeatherBasedCropAdviceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output || { advice: "Conditions are stable. Continue regular monitoring.", riskDetected: false };
  }
);
