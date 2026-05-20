# VoltaRentals Launch Checklist

## Before Going Live

### Firebase Console:
[ ] Enable Email/Password authentication
[ ] Enable Google authentication
[ ] Set up Firebase Hosting custom domain
[ ] Deploy Firestore security rules
[ ] Set Firebase Storage rules
[ ] Enable Firebase Analytics
[ ] Restrict API keys in Google Cloud Console

### Environment Variables:
[ ] All NEXT_PUBLIC_FIREBASE_ variables set
[ ] .env.local NOT committed to git
[ ] Production environment variables set in hosting

### Content:
[ ] Replace all "+255 700 000 000" with real numbers
[ ] Replace "info@voltarentals.co.tz" with real email
[ ] Add real team photos to About page
[ ] Add real office address
[ ] Replace placeholder OG image
[ ] Seed real car data (run seed function)
[ ] Upload real car images to Storage

### Testing:
[ ] Test registration flow end to end
[ ] Test login (email + Google)
[ ] Test booking flow end to end
[ ] Test payment submission
[ ] Test admin payment verification
[ ] Test admin booking management
[ ] Test notifications appear correctly
[ ] Test on mobile (iOS Safari + Android Chrome)
[ ] Test all admin pages
[ ] Test email links work

### Legal:
[ ] Update Terms & Conditions with real info
[ ] Update Privacy Policy with real info
[ ] Verify Tanzania business compliance

### Performance:
[ ] Run Lighthouse audit (target 90+ score)
[ ] Verify all images optimized
[ ] Verify no console errors

### Deploy:
[ ] Run: npm run build (no errors)
[ ] Run: firebase deploy
[ ] Test live URL
[ ] Share with test users
