# Online/Offline Status Feature

## Overview

The online/offline status feature provides real-time user presence tracking across the SciConnect platform. Users can see who is currently online and when others were last active.

## Features

- ✅ **Real-time Online Status**: Green dot indicator for online users
- ✅ **Last Seen Tracking**: Shows when users were last active
- ✅ **Redis-based Storage**: Fast and scalable status tracking
- ✅ **Automatic Cleanup**: Removes stale online entries
- ✅ **Heartbeat System**: Keeps users online while active
- ✅ **Multiple User Status**: Batch status checking for efficiency

## Architecture

### Backend Components

#### 1. Online Status Service (`utils/onlineStatus.js`)
- **Redis Integration**: Uses Redis for fast status storage
- **Automatic Cleanup**: Removes stale entries every 5 minutes
- **Database Sync**: Updates `lastActive` field in User model
- **Heartbeat Support**: Keeps users online with periodic updates

#### 2. Socket Middleware Integration (`middleware/socket.js`)
- **Connection Tracking**: Marks users online when they connect
- **Heartbeat System**: Updates last seen every minute
- **Disconnection Handling**: Marks users offline when they disconnect

#### 3. API Endpoints (`routes/onlineStatus.js`)
- `GET /api/online-status/user/:userId` - Get specific user status
- `POST /api/online-status/users` - Get multiple users status
- `GET /api/online-status/online` - Get all online users
- `GET /api/online-status/me` - Get current user status

### Frontend Components

#### 1. Online Status Store (`frontend/src/store/onlineStatus.js`)
- **Zustand Store**: Manages online status state
- **Batch Operations**: Efficiently fetches multiple user statuses
- **Real-time Updates**: Updates status when users come online/offline
- **Formatted Display**: Provides human-readable last seen times

#### 2. UserAvatar Component Updates
- **Online Indicator**: Shows green dot for online users
- **Automatic Fetching**: Fetches status when `showOnlineStatus` is true
- **Fallback Handling**: Gracefully handles missing status data

#### 3. Integration Points
- **Chat Windows**: Shows online status in conversation headers
- **Profile Pages**: Displays online status for profile owners
- **Post Cards**: Shows online status for post authors
- **Messages Page**: Shows online status in conversation lists

## Usage

### Backend Usage

```javascript
const onlineStatusService = require('./utils/onlineStatus');

// Mark user as online
await onlineStatusService.setUserOnline(userId);

// Check if user is online
const isOnline = await onlineStatusService.isUserOnline(userId);

// Get multiple users status
const statuses = await onlineStatusService.getUsersOnlineStatus([1, 2, 3]);

// Update last seen (heartbeat)
await onlineStatusService.updateLastSeen(userId);

// Mark user as offline
await onlineStatusService.setUserOffline(userId);
```

### Frontend Usage

```javascript
import useOnlineStatusStore from '../store/onlineStatus';

const { 
  fetchUserStatus, 
  isUserOnline, 
  getFormattedLastActive 
} = useOnlineStatusStore();

// Fetch user status
await fetchUserStatus(userId);

// Check if user is online
const online = isUserOnline(userId);

// Get formatted last active time
const lastActive = getFormattedLastActive(userId);
```

### Component Usage

```jsx
import UserAvatar from '../components/UserAvatar';

// Show online status
<UserAvatar 
  user={user} 
  size="md" 
  showOnlineStatus={true} 
/>
```

## Configuration

### Redis Configuration
The feature requires Redis to be configured in `config/redis.js`. The service uses:
- `sciconnect:online_users` - Set of online user IDs
- `sciconnect:user_last_seen:{userId}` - Last seen timestamp for each user
- 5-minute timeout for online status

### Environment Variables
```bash
# Redis connection (required)
REDIS_URL=redis://localhost:6379

# Online status timeout (optional, default: 300 seconds)
ONLINE_STATUS_TIMEOUT=300
```

## API Endpoints

### Get User Status
```http
GET /api/online-status/user/:userId
Authorization: Bearer <token>

Response:
{
  "userId": 123,
  "isOnline": true,
  "lastActive": "2024-01-15T10:30:00.000Z"
}
```

### Get Multiple Users Status
```http
POST /api/online-status/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": [1, 2, 3]
}

Response:
[
  {
    "userId": 1,
    "isOnline": true,
    "lastActive": "2024-01-15T10:30:00.000Z"
  },
  {
    "userId": 2,
    "isOnline": false,
    "lastActive": "2024-01-15T09:15:00.000Z"
  }
]
```

### Get All Online Users
```http
GET /api/online-status/online
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "avatar": "https://...",
    "lastActive": "2024-01-15T10:30:00.000Z"
  }
]
```

## Database Schema

The feature uses the existing `lastActive` field in the User model:

```javascript
// models/User.js
lastActive: {
  type: DataTypes.DATE,
  allowNull: true,
}
```

## Performance Considerations

### Redis Optimization
- Uses Redis Sets for efficient online user tracking
- Implements TTL for automatic cleanup
- Batch operations for multiple user status checks

### Frontend Optimization
- Caches user statuses in Zustand store
- Batch API calls for multiple users
- Debounced status updates

### Scalability
- Redis-based storage for high-performance
- Automatic cleanup prevents memory leaks
- Heartbeat system reduces false offline statuses

## Testing

Run the test script to verify functionality:

```bash
node test-online-status.js
```

## Troubleshooting

### Common Issues

1. **Users showing as offline when online**
   - Check Redis connection
   - Verify heartbeat intervals
   - Check socket connection status

2. **Stale online entries**
   - Automatic cleanup runs every 5 minutes
   - Manual cleanup available via `cleanupStaleEntries()`

3. **Performance issues**
   - Monitor Redis memory usage
   - Check for excessive API calls
   - Verify batch operations are working

### Debug Commands

```javascript
// Check Redis connection
const redis = require('./config/redis');
await redis.connectRedis();

// Manual cleanup
const onlineStatusService = require('./utils/onlineStatus');
await onlineStatusService.cleanupStaleEntries();

// Check online users
const onlineUsers = await onlineStatusService.getOnlineUsers();
console.log('Online users:', onlineUsers);
```

## Future Enhancements

- [ ] **Typing Indicators**: Show when users are typing
- [ ] **Status Messages**: Custom status messages (e.g., "In a meeting")
- [ ] **Privacy Settings**: Allow users to hide online status
- [ ] **Push Notifications**: Notify when specific users come online
- [ ] **Activity Tracking**: Track user activity patterns
- [ ] **Group Status**: Show online status in group chats

## Security Considerations

- All endpoints require authentication
- User IDs are validated before status checks
- Redis keys are namespaced to prevent conflicts
- No sensitive data stored in status information 