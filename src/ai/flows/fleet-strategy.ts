'use server';
/**
 * @fileOverview AI Fleet Strategy Agent.
 * 
 * - generateFleetStrategy - Analyzes occupancy and revenue to suggest pricing adjustments.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FleetStrategyInputSchema = z.object({
  totalRevenue: z.number(),
  occupancyData: z.array(z.object({
    carName: z.string(),
    rate: z.number(),
    category: z.string(),
  })),
  month: z.string(),
});

const FleetStrategyOutputSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.object({
    asset: z.string(),
    action: z.string(),
    impact: z.string(),
  })),
  marketSentiment: z.string(),
});

export type FleetStrategyOutput = z.infer<typeof FleetStrategyOutputSchema>;

const strategyPrompt = ai.definePrompt({
  name: 'fleetStrategyPrompt',
  input: { schema: FleetStrategyInputSchema },
  output: { schema: FleetStrategyOutputSchema },
  prompt: `You are the AI Revenue Manager for VoltaRentals. 
Analyze the current fleet performance for {{{month}}} and generate a dynamic pricing strategy.

Current Stats:
- Total Verified Revenue: TSh {{{totalRevenue}}}
- Occupancy Matrix:
{{#each occupancyData}}
  * {{this.carName}} ({{this.category}}): {{this.rate}}% utilized
{{/each}}

Task:
1. Provide a 2-sentence market sentiment analysis for Tanzania (e.g., 'Safari demand rising in Arusha').
2. Identify 3 specific assets that need pricing changes. 
3. If occupancy is > 80%, recommend a price increase. If < 30%, recommend a targeted discount.

Output must be tactical and ready for execution.`,
});

export async function generateFleetStrategy(input: z.infer<typeof FleetStrategyInputSchema>): Promise<FleetStrategyOutput> {
  const { output } = await strategyPrompt(input);
  if (!output) throw new Error('Strategy Node Offline.');
  return output;
}
