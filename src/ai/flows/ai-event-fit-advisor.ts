
'use server';
/**
 * @fileOverview An AI Event-Fit Advisor for VoltaRentals.
 *
 * - recommendEventFit - A function that analyzes booking details to generate a required configuration.
 * - EventFitAdvisorInput - The input type for the recommendEventFit function.
 * - EventFitAdvisorOutput - The return type for the recommendEventFit function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EventFitAdvisorInputSchema = z.object({
  eventType: z.string().describe('The type of event (e.g., wedding, corporate event, birthday party).'),
  desiredDates: z.string().describe('The desired dates for the booking (e.g., "2026-10-26").'),
  phoneNumber: z.string().describe('The client contact number in Tanzania format (+255).'),
  specialRequirements: z.string().optional().describe('Any special requirements or preferences for the vehicle or service.'),
  availableEvs: z.array(z.object({
    model: z.string().describe('The model name of the EV.'),
    make: z.string().describe('The manufacturer of the EV.'),
    capacity: z.number().describe('The seating capacity of the EV.'),
    features: z.array(z.string()).describe('Key features of the EV.'),
    availableFrom: z.string().describe('The start date of availability for this EV (YYYY-MM-DD).'),
    availableUntil: z.string().describe('The end date of availability for this EV (YYYY-MM-DD).'),
  })).optional().describe('A list of currently available electric vehicles.'),
});

export type EventFitAdvisorInput = z.infer<typeof EventFitAdvisorInputSchema>;

const EventFitAdvisorOutputSchema = z.object({
  recommendedEvModels: z.array(z.string()).describe('A list of electric vehicle models required based on the event details and availability.'),
  optimalTimings: z.array(z.string()).describe('Mandatory logistical timings for the booking to ensure vehicle suitability and event success.'),
  rationale: z.string().describe('The authoritative justification for the required configuration provided.'),
});

export type EventFitAdvisorOutput = z.infer<typeof EventFitAdvisorOutputSchema>;

const eventFitAdvisorPrompt = ai.definePrompt({
  name: 'eventFitAdvisorPrompt',
  input: { schema: EventFitAdvisorInputSchema },
  output: { schema: EventFitAdvisorOutputSchema },
  prompt: `You are an AI Event Configuration Specialist for VoltaRentals. Your task is to analyze booking details and generate a MANDATORY configuration for the rental.

Booking Details:
- Event Type: {{{eventType}}}
- Desired Dates: {{{desiredDates}}}
- Contact Number: {{{phoneNumber}}}
{{#if specialRequirements}}
- Special Requirements: {{{specialRequirements}}}
{{/if}}

{{#if availableEvs}}
Currently Available Electric Vehicles:
{{#each availableEvs}}
- Model: {{this.model}}, Make: {{this.make}}, Capacity: {{this.capacity}} passengers. Features: {{#each this.features}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/each}}
{{/if}}

Based on the booking details, provide the REQUIRED EV models and MANDATORY logistical timings. Logistics will be coordinated via the provided phone number.`,
});

const eventFitAdvisorFlow = ai.defineFlow(
  {
    name: 'eventFitAdvisorFlow',
    inputSchema: EventFitAdvisorInputSchema,
    outputSchema: EventFitAdvisorOutputSchema,
  },
  async (input) => {
    const { output } = await eventFitAdvisorPrompt(input);
    return output!;
  }
);

export async function recommendEventFit(input: EventFitAdvisorInput): Promise<EventFitAdvisorOutput> {
  return eventFitAdvisorFlow(input);
}
