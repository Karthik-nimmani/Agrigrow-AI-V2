'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing AI-generated dynamic alerts and proactive advice
 * based on real-time local weather data, enabling farmers to anticipate risks like frost or optimize irrigation schedules.
 *
 * - aiWeatherBasedCropAdvice - A function that handles the weather-based crop advice process.
 * - AiWeatherBasedCropAdviceInput - The input type for the aiWeatherBasedCropAdvice function.
 * - AiWeatherBasedCropAdviceOutput - The return type for the aiWeatherBasedCropAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiWeatherBasedCropAdviceInputSchema = z.object({
  location: z.string().describe('The geographical location of the farm.'),
  cropType: z.string().describe('The type of crop being cultivated.'),
  currentConditions: z.object({
    temperature: z.number().describe('Current temperature in Celsius.'),
    humidity: z.number().describe('Current humidity percentage.'),
    soilMoisture: z
      .number()
      .describe('Current soil moisture percentage (0-100).'),
  }).describe('Current environmental conditions.'),
  weatherForecast: z.string().describe('A short-term weather forecast (e.g., next 24-48 hours).'),
  cropGrowthStage: z
    .string()
    .optional()
    .describe('Optional: The current growth stage of the crop (e.g., seedling, flowering).'),
});
export type AiWeatherBasedCropAdviceInput = z.infer<
  typeof AiWeatherBasedCropAdviceInputSchema
>;

const AiWeatherBasedCropAdviceOutputSchema = z.object({
  alert: z
    .string()
    .optional()
    .describe('A concise alert message if a risk is detected (e.g., "Frost Warning", "High Irrigation Need").'),
  advice: z.string().describe('Detailed agricultural advice based on weather and crop data.'),
  riskDetected: z
    .boolean()
    .describe('True if a specific risk (e.g., frost, drought) is detected, false otherwise.'),
});
export type AiWeatherBasedCropAdviceOutput = z.infer<
  typeof AiWeatherBasedCropAdviceOutputSchema
>;

export async function aiWeatherBasedCropAdvice(
  input: AiWeatherBasedCropAdviceInput
): Promise<AiWeatherBasedCropAdviceOutput> {
  return aiWeatherBasedCropAdviceFlow(input);
}

const aiWeatherBasedCropAdvicePrompt = ai.definePrompt({
  name: 'aiWeatherBasedCropAdvicePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: AiWeatherBasedCropAdviceInputSchema},
  output: {schema: AiWeatherBasedCropAdviceOutputSchema},
  prompt: `You are an expert agricultural advisor. Your task is to analyze local weather data and crop information to provide dynamic alerts and proactive advice to farmers.

Here is the current information:
Location: {{{location}}}
Crop Type: {{{cropType}}}
Current Temperature: {{{currentConditions.temperature}}}°C
Current Humidity: {{{currentConditions.humidity}}}%
Current Soil Moisture: {{{currentConditions.soilMoisture}}}%
Weather Forecast: {{{weatherForecast}}}
{{#if cropGrowthStage}}
Crop Growth Stage: {{{cropGrowthStage}}}
{{/if}}

Based on this information, identify any immediate risks to the crop, such as frost, excessive heat, drought, or heavy rainfall. Then, provide actionable advice.

If you detect a significant risk, populate the 'alert' field with a concise warning message. If there's no immediate critical risk but general advice is applicable, leave 'alert' empty.
Always provide detailed 'advice' regardless of whether an alert is issued.
Set 'riskDetected' to true if an alert is issued, otherwise set it to false.`,
});

const aiWeatherBasedCropAdviceFlow = ai.defineFlow(
  {
    name: 'aiWeatherBasedCropAdviceFlow',
    inputSchema: AiWeatherBasedCropAdviceInputSchema,
    outputSchema: AiWeatherBasedCropAdviceOutputSchema,
  },
  async (input) => {
    const {output} = await aiWeatherBasedCropAdvicePrompt(input);
    if (!output) {
      return { advice: "Conditions are stable. Continue regular monitoring.", riskDetected: false };
    }
    return output;
  }
);
