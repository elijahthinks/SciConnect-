const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const Message = require('../models/Message');

// Store active connections
const activeConnections = new Map();

function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'https://sciconnect.com' 
        : 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Store the connection
    activeConnections.set(socket.userId, socket);

    // Handle message sending
    socket.on('send_message', async (message) => {
      try {
        // Update message status to sent
        await Message.update(
          { status: 'sent' },
          { where: { id: message.id } }
        );

        const receiverSocket = activeConnections.get(message.receiverId);
        
        if (receiverSocket) {
          // Emit message to receiver
          receiverSocket.emit('new_message', message);
          
          // Wait for delivery acknowledgment
          const delivered = await new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(false), 5000);
            
            receiverSocket.once(`message_received_${message.id}`, () => {
              clearTimeout(timeout);
              resolve(true);
            });
          });

          // Update message status based on delivery
          await Message.update(
            { status: delivered ? 'delivered' : 'sent' },
            { where: { id: message.id } }
          );

          // Notify sender of delivery status
          socket.emit('message_status', {
            messageId: message.id,
            status: delivered ? 'delivered' : 'sent'
          });
        }
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('message_error', {
          messageId: message.id,
          error: 'Failed to deliver message'
        });
      }
    });

    // Handle message received acknowledgment
    socket.on('message_received', async (messageId) => {
      try {
        await Message.update(
          { status: 'delivered' },
          { where: { id: messageId } }
        );

        // Notify sender
        const message = await Message.findByPk(messageId);
        if (message) {
          const senderSocket = activeConnections.get(message.senderId);
          if (senderSocket) {
            senderSocket.emit('message_status', {
              messageId,
              status: 'delivered'
            });
          }
        }
      } catch (error) {
        console.error('Error handling message received:', error);
      }
    });

    // Handle message read acknowledgment
    socket.on('message_read', async (messageId) => {
      try {
        await Message.update(
          { status: 'read', readAt: new Date() },
          { where: { id: messageId } }
        );

        // Notify sender
        const message = await Message.findByPk(messageId);
        if (message) {
          const senderSocket = activeConnections.get(message.senderId);
          if (senderSocket) {
            senderSocket.emit('message_status', {
              messageId,
              status: 'read'
            });
          }
        }
      } catch (error) {
        console.error('Error handling message read:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ receiverId, conversationId }) => {
      const receiverSocket = activeConnections.get(receiverId);
      if (receiverSocket) {
        receiverSocket.emit('user_typing', {
          senderId: socket.userId,
          conversationId
        });
      }
    });

    socket.on('stop_typing', ({ receiverId, conversationId }) => {
      const receiverSocket = activeConnections.get(receiverId);
      if (receiverSocket) {
        receiverSocket.emit('user_stop_typing', {
          senderId: socket.userId,
          conversationId
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      activeConnections.delete(socket.userId);
    });
  });

  return io;
}

// Function to send notification to a specific user
async function sendNotification(userId, notification) {
  const userSocket = activeConnections.get(userId);
  if (userSocket) {
    userSocket.emit('notification', notification);
  }
}

module.exports = {
  initializeSocket,
  sendNotification,
  activeConnections
}; 