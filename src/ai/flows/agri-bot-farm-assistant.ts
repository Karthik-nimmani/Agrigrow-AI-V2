'use server';
/**
 * @fileOverview A multi-language AI chat assistant for agricultural queries.
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

const AgriBotOutputSchema = z.object({
  answer: z.string().describe('The AI assistant\'s real-time agricultural advice.'),
});

export async function agriBotFarmAssistant(
  input: z.infer<typeof AgriBotInputSchema>
): Promise<z.infer<typeof AgriBotOutputSchema>> {
  return agriBotFarmAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'agriBotPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: AgriBotInputSchema},
  output: {schema: AgriBotOutputSchema},
  prompt: `You are Agri-Bot, an expert multi-language AI agricultural assistant.
Always be helpful, clear, and concise.

The farmer's question is: {{{question}}}
Please provide the answer in {{{language}}}.`,
});

const agriBotFarmAssistantFlow = ai.defineFlow(
  {
    name: 'agriBotFarmAssistantFlow',
    inputSchema: AgriBotInputSchema,
    outputSchema: AgriBotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate response from Agri-Bot.');
    }
    return output;
  }
);
