# Required Firestore Composite Indexes

To ensure optimal performance and prevent runtime errors (e.g., "The query requires an index"), please create the following composite indexes in the [Firebase Console](https://console.firebase.google.com/).

## Collection: bookings

| Field Path | Order | Field Path | Order | Query Scope |
|------------|-------|------------|-------|-------------|
| createdAt | Descending | - | - | Collection |
| userId | Ascending | createdAt | Descending | Collection |
| status | Ascending | createdAt | Descending | Collection |
| paymentStatus | Ascending | createdAt | Ascending | Collection Group |

## Collection: notifications

| Field Path | Order | Field Path | Order | Query Scope |
|------------|-------|------------|-------|-------------|
| userId | Ascending | createdAt | Descending | Collection |

## Collection: payments

| Field Path | Order | Field Path | Order | Query Scope |
|------------|-------|------------|-------|-------------|
| status | Ascending | createdAt | Descending | Collection |

---
*Note: These indexes are critical for the administrative dashboard and real-time activity streams.*