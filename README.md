# Volta Rentals

Elite Mobility for the Modern Executive.

This Next.js 15 application manages the entire fleet protocol, customer booking registry, identity verification (NIDA), and backend admin intelligence for Volta Rentals Tanzania.

## 🚀 Production Refinements Completed

- **Finance Dashboard Integrity**: Demo payments are properly tracked and written to the `payments` Firestore database. Revenue and finance operations display accurate data.
- **Printing Protocol**: Validated and styled the receipt printing utility. Clicking "Print Receipt" generates a perfectly optimized white-background document without sidebars or navigations.
- **Security Dynamic Pin**: The Super Admin node uses a dynamic passkey stored in Firestore, eliminating hardcoded passwords. This passkey can be adjusted at any time via the Super Admin Settings page.
- **Operational Registry**: Outdated orders with passed end dates are automatically flagged as expired in the dashboard.
- **Dispatch Registry**: Fleet dispatchers can provision drivers straight into the database without needing full Google credentials.
- **Unified Sharing**: UI for vehicle sharing is simplified into a singular, highly legible modal that adapts perfectly to dark/light themes.

## ⚠️ Demo Modes & "Deal Closing" Fixes

Certain features have been intentionally mocked or simulated during this demonstration phase. Once a deal is finalized and production resources are provided, the following modules must be replaced with their live counterparts:

1. **Pesapal Integration (`PesapalPayButton.tsx`)**
   - *Current State:* Uses a simulated 3-second delay that automatically registers the payment as successful to demonstrate the UX.
   - *Final Fix:* Connect the actual Pesapal SDK/OAuth tokens using the dynamic keys set in the Super Admin Settings panel. Remove the `setTimeout` simulation.

2. **Domain Integration & Cloudflare**
   - *Current State:* Deployed on Vercel preview URLs.
   - *Final Fix:* Connect the official custom domain (e.g., `voltarentals.co.tz`) through Cloudflare, map the DNS to Vercel, and configure SSL.

3. **NIDA Verification (`dashboard/page.tsx`)**
   - *Current State:* The dashboard simulates a NIDA lookup with a 2-second delay.
   - *Final Fix:* Hook up the official Tanzanian NIDA API to validate the actual citizen database.

4. **WhatsApp Dispatch Messaging (`sharing.ts`)**
   - *Current State:* Uses web-based WhatsApp API `wa.me/` URLs to open the app on the user's device.
   - *Final Fix:* Consider connecting a Twilio or WhatsApp Business API backend for automated, invisible dispatch messages to drivers and clients.

## 💡 Tips & Facts

- **Light/Dark Adapter**: The toggle switches between rich, tailored CSS variables (accessible in `lib/themes.ts`) rather than just raw Tailwind inversions. This allows completely custom branding profiles (like *Volta Red* or *Emerald Racing*).
- **Automation Engine**: `lib/automation.ts` handles all the email and system log broadcasts. It is highly extensible.
- **React Compiler**: This application leverages Next.js 15's React Compiler. Do not use `useMemo` or `useCallback` unless specifically required, as the compiler handles most memorization under the hood automatically.
- **Supreme Master Authorization**: In the `super-admin/layout.tsx`, there is a bypass list. If you are locked out, you can add your email to the `SUPREME_MASTERS` array to guarantee top-level access.

---
**Protocol Status**: ACTIVE. Ready for client demonstration.
