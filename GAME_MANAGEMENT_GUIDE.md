# Game Management Guide

## Accessing Game Creation Pages

### For Regular Users (Players)
- **Cannot create games** - Only hosts, admins, and club managers can create games
- Can view and join games at `/games` (Find a Match page)

### For Hosts, Admins, and Club Managers
You can access game creation in several ways:

1. **Via "My Games" Page** (`/admin/games/my-games`)
   - Navigate to "My Events" in the bottom navigation
   - Click the "Create Game" button in the header (if you have permission)
   - Or click "Create Your First Game" if you have no games yet

2. **Direct URL**
   - Go to `/admin/games/create` directly
   - If you don't have permission, you'll see an error message

3. **Via Games Management Page** (`/admin/games/manage`)
   - Only accessible to admins and hosts
   - Shows all games you can manage
   - Includes edit and delete actions

## Setting Your Role to Admin

### Easiest Method: Use the Admin Page

1. Log in to your application
2. Navigate to `/admin/set-role` in your browser
3. Select "admin" from the dropdown
4. Click "Update Role"
5. The page will refresh automatically

### Alternative: Using Browser Console

1. Log in to your application
2. Open browser developer console (F12)
3. Copy and paste this code:

```javascript
(async () => {
  // Get Firebase user
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error('Not logged in');
    return;
  }
  
  const token = await user.getIdToken();
  
  // Update role to admin
  const response = await fetch('/api/admin/users/me/role', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ role: 'admin' })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('✅ Role updated to admin! Refresh the page.');
    window.location.reload();
  } else {
    console.error('❌ Error:', result.error);
  }
})();
```

### Alternative: Set Role to "host"

If you just want to create games (not full admin access), set role to "host":

```javascript
// Same code as above, but change 'admin' to 'host'
body: JSON.stringify({ role: 'host' })
```

### Using MongoDB Directly

If you have MongoDB access:

```javascript
// In MongoDB shell
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Available Roles

- **player** (default): Can view and join games, cannot create or manage
- **host**: Can create and manage their own games
- **admin**: Can create and manage all games, plus manage user roles

## Pages Overview

| Page | URL | Access |
|------|-----|--------|
| Find a Match | `/games` | All authenticated users |
| My Games | `/admin/games/my-games` | Hosts, Admins, Club Managers |
| Create Game | `/admin/games/create` | Hosts, Admins, Club Managers |
| Game Details | `/games/[id]` | All authenticated users |
| Manage Games | `/admin/games/manage` | Admins, Hosts |
| Admin Dashboard | `/admin` | Admins only |
| Set User Role | `/admin/set-role` | All users (for self) |
| Edit Game | `/games/[id]` (edit mode) | Game host, Admin, Club Manager |

## Accessing Admin Pages

After updating your role to admin in MongoDB:

1. **Refresh the page** (F5 or Cmd+R) or **log out and log back in**
   - This ensures your frontend gets the updated role from the API
   
2. **Navigate to admin pages:**
   - **Admin Dashboard**: `/admin` - Central hub with links to all admin features
   - **Manage Games**: `/admin/games/manage` - View and manage all games
   - **Set Role**: `/admin/set-role` - Update user roles
   - **Create Game**: `/admin/games/create` - Create new games

3. **Quick access**: Go directly to `/admin` to see all admin pages in one place

## Testing the Flow

1. **Set yourself as admin** using one of the methods above
2. **Refresh the page** to reload your user data
3. **Navigate to "My Events"** (`/admin/games/my-games`)
4. **Click "Create Game"** - you should now see the form
5. **Fill out the form** and create a game
6. **View your game** at `/games/[game-id]`
7. **Edit or delete** your game from the detail page

## Troubleshooting

**"You don't have permission to create games"**
- Your role is likely "player"
- Set your role to "host" or "admin" using the methods above
- Make sure to refresh the page after updating your role

**"Create Game" button not showing**
- Check your role: `/api/auth/me` should return `role: "admin"` or `role: "host"`
- If you're a club manager, you should also be able to create games
- Refresh the page after role changes

**Can't access `/admin/games/manage`**
- Only admins and hosts can access this page
- Regular players and club managers are redirected to `/admin/games/my-games`
