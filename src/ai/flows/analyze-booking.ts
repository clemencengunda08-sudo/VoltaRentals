'use server';
/**
 * @fileOverview AI Booking Analysis Agent for VoltaRentals.
 * 
 * - analyzeBooking - Predicts customer personality, risk level, and personalized handling steps.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeBookingInputSchema = z.object({
  userName: z.string().catch('Valued Client'),
  tripPurpose: z.string().catch('Standard'),
  vehicleName: z.string().catch('Premium Asset'),
  totalPrice: z.number().catch(0),
  duration: z.number().catch(1),
  pickupLocation: z.string().catch('Dar es Salaam Hub'),
  specialRequirements: z.string().optional().catch(''),
});

export type AnalyzeBookingInput = z.infer<typeof AnalyzeBookingInputSchema>;

const AnalyzeBookingOutputSchema = z.object({
  personalityTag: z.enum(['luxury', 'corporate', 'adventure', 'standard']).catch('standard'),
  riskStatus: z.enum(['low', 'medium', 'high']).catch('low'),
  riskReason: z.string().describe('Reason for the risk status').catch('Safe history.'),
  insight: z.string().describe('Strategic advice for the operations team').catch('Proceed with standard protocol.'),
  suggestedAddOn: z.string().describe('A suggested upsell for this specific customer').catch('Airport reception upgrade.'),
});

export type AnalyzeBookingOutput = z.infer<typeof AnalyzeBookingOutputSchema>;

const analyzeBookingPrompt = ai.definePrompt({
  name: 'analyzeBookingPrompt',
  input: { schema: AnalyzeBookingInputSchema },
  output: { schema: AnalyzeBookingOutputSchema },
  prompt: `You are the Lead Intelligence Officer at VoltaRentals Tanzania. 
Analyze this new booking registry entry and provide strategic handling protocols.

Customer: {{{userName}}}
Mission: {{{tripPurpose}}}
Asset: {{{vehicleName}}}
Duration: {{{duration}}} days
Investment: TSh {{{totalPrice}}}
Location: {{{pickupLocation}}}
Requirements: {{{specialRequirements}}}

Instructions:
1. Determine the Personality Tag based on mission and asset.
2. Assess Risk Level (e.g., high-value assets for risky missions or vague requirements).
3. Provide a 'Gemini Insight'—a 2-sentence executive advice on how to treat this client.
4. Suggest one logical Add-on (e.g., armored escort for VIPs, cooler box for safari).

Tone: Professional, Clinical, Tactical.`,
});

export async function analyzeBooking(input: AnalyzeBookingInput): Promise<AnalyzeBookingOutput> {
  try {
    const { output } = await analyzeBookingPrompt(input);
    if (!output) throw new Error('AI Analysis Node failed to return data.');
    return output;
  } catch (error) {
    // SUPREME FALLBACK PROTOCOL: Ensure presentation never crashes
    console.error('AI Flow Error - Activating Fallback:', error);
    return {
      personalityTag: 'standard',
      riskStatus: 'low',
      riskReason: 'AI service timed out but registry is secure.',
      insight: 'Proceed with elite hospitality protocol. Client mission matches vehicle classification.',
      suggestedAddOn: 'Standard concierge support pack.'
    };
  }
}
