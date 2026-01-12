# Setting Admin Role

There are several ways to set yourself as an admin:

## Option 1: Using the API Endpoint (Easiest)

1. Log in to your application
2. Open your browser's developer console (F12)
3. Run this JavaScript code:

```javascript
// Get your Firebase auth token
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Get your MongoDB user ID
const meResponse = await fetch('/api/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
});
const meData = await meResponse.json();
const userId = meData.user.id;

// Update your role to admin
const response = await fetch(`/api/admin/users/me/role`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ role: 'admin' })
});

const result = await response.json();
console.log('Role updated:', result);
```

## Option 2: Direct MongoDB Update

If you have access to your MongoDB database:

```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Option 3: Using MongoDB Compass or Studio 3T

1. Connect to your MongoDB database
2. Navigate to the `users` collection
3. Find your user document by email
4. Update the `role` field to `"admin"`
5. Save the document

## Option 4: Create a Temporary Script

Create a file `scripts/set-admin.ts` and run it with Node.js:

```typescript
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';

async function setAdmin(email: string) {
  await connectDB();
  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { new: true }
  );
  console.log('User updated:', user);
}

setAdmin('your-email@example.com');
```
