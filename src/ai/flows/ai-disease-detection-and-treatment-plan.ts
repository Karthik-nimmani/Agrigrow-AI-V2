'use server';
/**
 * @fileOverview Crop disease detection using Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CropPhotoInput = z.infer<typeof CropPhotoInputSchema>;

const DiseaseDetectionOutputSchema = z.object({
  diseaseDetected: z.boolean().describe('Whether a disease or pest was detected.'),
  diseaseName: z.string().describe('Name of the detected issue.'),
  description: z.string().describe('Symptom description.'),
  treatmentPlan: z.array(z.string()).length(3).describe('Three-part actionable treatment plan.'),
});
export type DiseaseDetectionOutput = z.infer<typeof DiseaseDetectionOutputSchema>;

export async function aiDiseaseDetectionAndTreatmentPlan(
  input: CropPhotoInput
): Promise<DiseaseDetectionOutput> {
  return aiDiseaseDetectionAndTreatmentPlanFlow(input);
}

const identifyDiseasePrompt = ai.definePrompt({
  name: 'identifyDiseasePrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: CropPhotoInputSchema},
  output: {schema: DiseaseDetectionOutputSchema},
  prompt: `You are an expert agricultural botanist. Analyze the provided image to identify pests or diseases with clinical precision.

Crop Photo: {{media url=photoDataUri}}

Provide the diagnosis and a 3-step actionable treatment plan.`,
});

const aiDiseaseDetectionAndTreatmentPlanFlow = ai.defineFlow(
  {
    name: 'aiDiseaseDetectionAndTreatmentPlanFlow',
    inputSchema: CropPhotoInputSchema,
    outputSchema: DiseaseDetectionOutputSchema,
  },
  async input => {
    const {output} = await identifyDiseasePrompt(input);
    if (!output) throw new Error('Disease detection failed');
    return output;
  }
);
