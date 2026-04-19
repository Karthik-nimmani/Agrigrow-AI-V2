'use server';
/**
 * @fileOverview An AI agent for identifying crop diseases/pests from a photo and providing a 3-part treatment plan.
 *
 * - aiDiseaseDetectionAndTreatmentPlan - A function that handles the disease detection and treatment plan generation process.
 * - CropPhotoInput - The input type for the aiDiseaseDetectionAndTreatmentPlan function.
 * - DiseaseDetectionOutput - The return type for the aiDiseaseDetectionAndTreatmentPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CropPhotoInput = z.infer<typeof CropPhotoInputSchema>;

const DiseaseDetectionOutputSchema = z.object({
  diseaseDetected: z.boolean().describe('Whether a disease or pest was detected.'),
  diseaseName: z
    .string()
    .describe('The name of the detected disease or pest, or "None" if no disease/pest was detected.'),
  description: z
    .string()
    .describe('A brief description of the detected disease or pest, its symptoms, and common causes.'),
  treatmentPlan: z
    .array(z.string())
    .length(3)
    .describe('A three-part actionable treatment plan to address the detected issue. Each element is a distinct step.'),
});
export type DiseaseDetectionOutput = z.infer<typeof DiseaseDetectionOutputSchema>;

export async function aiDiseaseDetectionAndTreatmentPlan(
  input: CropPhotoInput
): Promise<DiseaseDetectionOutput> {
  return aiDiseaseDetectionAndTreatmentPlanFlow(input);
}

const identifyDiseasePrompt = ai.definePrompt({
  name: 'identifyDiseasePrompt',
  input: {schema: CropPhotoInputSchema},
  output: {schema: DiseaseDetectionOutputSchema},
  prompt: `You are an expert agricultural botanist specializing in crop disease and pest identification.

Analyze the provided image of a crop to identify any diseases or pests present. If no disease or pest is detected, set 'diseaseDetected' to false, 'diseaseName' to "None", and provide a general health description and a three-part general plant care plan. If a disease or pest is detected, identify it, describe it, and provide a concise, actionable three-part treatment plan to address it.

The 'treatmentPlan' array must contain exactly three distinct steps or recommendations.

Crop Photo: {{media url=photoDataUri}}`,
});

const aiDiseaseDetectionAndTreatmentPlanFlow = ai.defineFlow(
  {
    name: 'aiDiseaseDetectionAndTreatmentPlanFlow',
    inputSchema: CropPhotoInputSchema,
    outputSchema: DiseaseDetectionOutputSchema,
  },
  async input => {
    const {output} = await identifyDiseasePrompt(input);
    return output!;
  }
);
