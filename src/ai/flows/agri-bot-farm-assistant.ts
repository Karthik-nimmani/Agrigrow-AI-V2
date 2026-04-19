'use server';
/**
 * @fileOverview A multi-language AI chat assistant for agricultural queries.
 *
 * - agriBotFarmAssistant - A function that handles real-time agricultural questions.
 * - AgriBotInput - The input type for the agriBotFarmAssistant function.
 * - AgriBotOutput - The return type for the agriBotFarmAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgriBotInputSchema = z.object({
  question: z.string().describe('The agricultural question from the farmer.'),
  language: z
    .string()
    .optional()
    .default('English')
    .describe('The desired language for the AI assistant\'s response. Defaults to English.'),
});
export type AgriBotInput = z.infer<typeof AgriBotInputSchema>;

const AgriBotOutputSchema = z.object({
  answer: z.string().describe('The AI assistant\'s real-time agricultural advice.'),
});
export type AgriBotOutput = z.infer<typeof AgriBotOutputSchema>;

export async function agriBotFarmAssistant(
  input: AgriBotInput
): Promise<AgriBotOutput> {
  return agriBotFarmAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'agriBotPrompt',
  input: {schema: AgriBotInputSchema},
  output: {schema: AgriBotOutputSchema},
  prompt: `You are Agri-Bot, an expert multi-language AI agricultural assistant designed to provide real-time, relevant, and actionable advice to farmers.\nYour goal is to help farmers quickly resolve their queries and learn best practices for their farm.\nAlways be helpful, clear, and concise.\n\nThe farmer's question is: {{{question}}}\nPlease provide the answer in {{{language}}}.`,
});

const agriBotFarmAssistantFlow = ai.defineFlow(
  {
    name: 'agriBotFarmAssistantFlow',
    inputSchema: AgriBotInputSchema,
    outputSchema: AgriBotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
