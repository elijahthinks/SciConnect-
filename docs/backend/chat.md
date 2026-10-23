# SciConnect Chat System

## Overview
The chat system provides real-time messaging capabilities between users with features like:
- Private conversations between two users
- Real-time message delivery using Socket.io
- Typing indicators
- Message read status
- Unread message counts
- Conversation management

## Architecture

### Backend Components

#### Models
- **Conversation**: Manages chat conversations between users
  - `conversationId`: Unique identifier for the conversation
  - `participant1Id`, `participant2Id`: The two users in the conversation
  - `lastMessageId`, `lastMessageAt`: Track the most recent message
  - `unreadCount1`, `unreadCount2`: Track unread messages for each participant

- **Message**: Individual messages within conversations
  - `conversationId`: Links to the conversation
  - `senderId`, `receiverId`: Message sender and recipient
  - `content`: Message text content
  - `messageType`: Type of message (text, image, video, file)
  - `mediaUrl`: URL for media attachments
  - `isRead`, `readAt`: Read status tracking

#### API Endpoints (`/api/chat`)
- `GET /conversations` - Get all conversations for authenticated user
- `POST /conversations` - Create or get existing conversation with another user
- `GET /conversations/:conversationId/messages` - Get messages for a conversation
- `POST /conversations/:conversationId/messages` - Send a new message
- `PUT /conversations/:conversationId/read` - Mark conversation as read

#### Socket.io Events
- `join` - User joins their personal room
- `send_message` - Send message to receiver
- `typing` - Send typing indicator
- `stop_typing` - Stop typing indicator
- `new_message` - Receive new message
- `user_typing` - Receive typing indicator
- `user_stop_typing` - Receive stop typing indicator

### Frontend Components

#### Chat Store (`useChatStore`)
Zustand store managing chat state:
- **State**: conversations, currentConversation, messages, socket connection
- **Actions**: 
  - `initializeSocket(userId)` - Connect to Socket.io
  - `fetchConversations()` - Load user's conversations
  - `selectConversation(conversation)` - Switch to a conversation
  - `sendMessage(content)` - Send a new message
  - `markAsRead(conversationId)` - Mark messages as read

#### ChatWindow Component
Main chat interface with:
- Conversations list sidebar
- Message display area
- Message input with typing indicators
- Real-time message updates
- Unread message badges

## Usage

### Starting a Conversation
1. Click the messages icon in the navbar
2. The chat window opens showing existing conversations
3. To start a new conversation, you need to implement a user search/selection feature

### Sending Messages
1. Select a conversation from the sidebar
2. Type your message in the input field
3. Press Enter or click the send button
4. Messages are delivered in real-time to the recipient

### Real-time Features
- **Typing Indicators**: Shows when someone is typing
- **Read Status**: Messages are marked as read when viewed
- **Unread Counts**: Badge shows number of unread messages
- **Online Status**: Shows connection status

## Database Schema

```sql
-- Conversations table
CREATE TABLE Conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversationId VARCHAR(255) UNIQUE NOT NULL,
  participant1Id INTEGER NOT NULL,
  participant2Id INTEGER NOT NULL,
  lastMessageId INTEGER,
  lastMessageAt DATETIME,
  unreadCount1 INTEGER DEFAULT 0,
  unreadCount2 INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE Messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversationId VARCHAR(255) NOT NULL,
  senderId INTEGER NOT NULL,
  receiverId INTEGER NOT NULL,
  content TEXT NOT NULL,
  messageType ENUM('text', 'image', 'video', 'file') DEFAULT 'text',
  mediaUrl VARCHAR(255),
  isRead BOOLEAN DEFAULT FALSE,
  readAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features
- Authentication required for all chat endpoints
- Users can only access conversations they're part of
- Messages are validated before saving
- Socket connections are tied to authenticated users

## Future Enhancements
- [ ] Group chat functionality
- [ ] Message reactions and emojis
- [ ] File and media sharing
- [ ] Message editing and deletion
- [ ] Voice and video messages
- [ ] Message encryption
- [ ] Chat search functionality
- [ ] Message backup and export
- [ ] Chat moderation tools

## Troubleshooting

### Common Issues
1. **Socket not connecting**: Check if user is authenticated
2. **Messages not sending**: Verify API endpoint is accessible
3. **Real-time updates not working**: Check Socket.io connection status

### Debug Information
- Socket connection status is shown in the chat header
- Console logs show connection events
- Network tab shows API requests and responses 