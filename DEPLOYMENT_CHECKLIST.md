# VoltaRentals Deployment Checklist 🚀🇹🇿

## Pre-Deployment (Code Quality)
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes
- [ ] No `console.log` statements in production components
- [ ] All TypeScript `any` types removed where possible

## Environment (Vercel/Hosting)
- [ ] `.env.local` configured (Local)
- [ ] Vercel Environment Variables set:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `PESAPAL_CONSUMER_KEY` (For payments)
  - `PESAPAL_CONSUMER_SECRET`
- [ ] `authorized_domains` updated in Firebase Console (Include Vercel URL)

## Content Registry
- [ ] Replace `+255 700 000 000` with real operations number
- [ ] Replace `info@voltarentals.co.tz` with real support email
- [ ] Replace placeholder favicon and OG images
- [ ] Seed real fleet inventory to Firestore

## Firebase Protocols
- [ ] Firestore Security Rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Firestore Indexes deployed (`FIRESTORE_INDEXES.md` followed)
- [ ] Firebase Auth: Google and Email providers enabled
- [ ] Analytics enabled for TZ market tracking

## Final User Acceptance
- [ ] Test Google Login on mobile browser
- [ ] Test Booking Flow -> Payment -> Admin Confirmation
- [ ] Test PWA Install Prompt (requires 2+ visits)
- [ ] Test Dark/Light mode persistent sync

---
**Status: Ready for Deployment Node 1.0**
