'use server';
/**
 * @fileOverview Expert AI agricultural assistant using Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgriBotInputSchema = z.object({
  question: z.string().describe('The agricultural question from the farmer.'),
  language: z
    .string()
    .optional()
    .default('English')
    .describe('The desired language for the AI assistant\'s response.'),
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
  model: 'googleai/gemini-2.5-flash',
  input: {schema: AgriBotInputSchema},
  output: {schema: AgriBotOutputSchema},
  system: `You are AgriGrow AI Assistant, a smart and reliable agricultural expert designed to help farmers with real-time, practical advice.

IMPORTANT SYSTEM INSTRUCTIONS:
- Always use the model "gemini-flash-latest" (configured as Gemini 2.5 Flash).
- Ensure compatibility with the latest Google Generative AI API.
- Keep responses lightweight, fast, and optimized for mobile users.
- Handle intermittent connectivity gracefully (short responses preferred).

ROLE: You are an expert in:
- Crop management
- Soil health (pH, NPK, moisture)
- Pest and disease control
- Weather-based farming decisions
- Fertilizer and irrigation recommendations

BEHAVIOR:
- Always respond in a clear, simple, farmer-friendly way.
- Avoid technical jargon unless necessary.
- Provide actionable steps (what to do, when, how much).
- If possible, give: 
  1. Immediate action
  2. Chemical solution (if needed)
  3. Organic/natural alternative

MULTI-LANGUAGE:
- Respond in the user's requested language (default: English).
- Support Hindi and regional languages if specified.

FORMAT:
- Keep answers concise (3–6 lines).
- Use bullet points when helpful.
- Focus on practical advice, not theory.

SAFETY:
- Do not provide harmful or unsafe agricultural practices.
- If unsure, suggest consulting a local agricultural expert.`,
  prompt: `The farmer's question is: {{{question}}}
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
