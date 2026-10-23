const redis = require('../config/redis');
const User = require('../models/User');

// Redis key patterns
const ONLINE_USERS_KEY = 'sciconnect:online_users';
const USER_LAST_SEEN_KEY = 'sciconnect:user_last_seen:';
const ONLINE_TIMEOUT = 300; // 5 minutes in seconds

class OnlineStatusService {
  constructor() {
    this.redisClient = null;
    this.init();
  }

  async init() {
    this.redisClient = await redis.connectRedis();
  }

  // Mark user as online
  async setUserOnline(userId) {
    try {
      if (!this.redisClient) return false;

      const now = Date.now();
      const userData = {
        userId,
        lastSeen: now,
        status: 'online'
      };

      // Add to online users set
      await this.redisClient.sAdd(ONLINE_USERS_KEY, userId);
      
      // Set last seen timestamp
      await this.redisClient.setEx(
        `${USER_LAST_SEEN_KEY}${userId}`,
        ONLINE_TIMEOUT,
        now.toString()
      );

      // Update database lastActive field
      await User.update(
        { lastActive: new Date(now) },
        { where: { id: userId } }
      );

      return true;
    } catch (error) {
      console.error('Error setting user online:', error);
      return false;
    }
  }

  // Mark user as offline
  async setUserOffline(userId) {
    try {
      if (!this.redisClient) return false;

      // Remove from online users set
      await this.redisClient.sRem(ONLINE_USERS_KEY, userId);
      
      // Remove last seen timestamp
      await this.redisClient.del(`${USER_LAST_SEEN_KEY}${userId}`);

      // Update database lastActive field
      await User.update(
        { lastActive: new Date() },
        { where: { id: userId } }
      );

      return true;
    } catch (error) {
      console.error('Error setting user offline:', error);
      return false;
    }
  }

  // Check if user is online
  async isUserOnline(userId) {
    try {
      if (!this.redisClient) return false;

      // Check if user is in online set
      const isInOnlineSet = await this.redisClient.sIsMember(ONLINE_USERS_KEY, userId);
      
      if (!isInOnlineSet) return false;

      // Check if last seen timestamp is still valid
      const lastSeen = await this.redisClient.get(`${USER_LAST_SEEN_KEY}${userId}`);
      if (!lastSeen) {
        // Clean up stale entry
        await this.redisClient.sRem(ONLINE_USERS_KEY, userId);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking user online status:', error);
      return false;
    }
  }

  // Get online status for multiple users
  async getUsersOnlineStatus(userIds) {
    try {
      if (!this.redisClient) {
        return userIds.map(id => ({ userId: id, isOnline: false }));
      }

      const results = [];
      
      for (const userId of userIds) {
        const isOnline = await this.isUserOnline(userId);
        results.push({ userId, isOnline });
      }

      return results;
    } catch (error) {
      console.error('Error getting users online status:', error);
      return userIds.map(id => ({ userId: id, isOnline: false }));
    }
  }

  // Get all online users
  async getOnlineUsers() {
    try {
      if (!this.redisClient) return [];

      const onlineUserIds = await this.redisClient.sMembers(ONLINE_USERS_KEY);
      
      // Filter out stale entries
      const validOnlineUsers = [];
      for (const userId of onlineUserIds) {
        const isOnline = await this.isUserOnline(userId);
        if (isOnline) {
          validOnlineUsers.push(userId);
        }
      }

      return validOnlineUsers;
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }

  // Update user's last seen timestamp (heartbeat)
  async updateLastSeen(userId) {
    try {
      if (!this.redisClient) return false;

      const now = Date.now();
      
      // Update last seen timestamp
      await this.redisClient.setEx(
        `${USER_LAST_SEEN_KEY}${userId}`,
        ONLINE_TIMEOUT,
        now.toString()
      );

      // Update database lastActive field
      await User.update(
        { lastActive: new Date(now) },
        { where: { id: userId } }
      );

      return true;
    } catch (error) {
      console.error('Error updating last seen:', error);
      return false;
    }
  }

  // Clean up stale online entries
  async cleanupStaleEntries() {
    try {
      if (!this.redisClient) return;

      const onlineUserIds = await this.redisClient.sMembers(ONLINE_USERS_KEY);
      
      for (const userId of onlineUserIds) {
        const lastSeen = await this.redisClient.get(`${USER_LAST_SEEN_KEY}${userId}`);
        if (!lastSeen) {
          await this.redisClient.sRem(ONLINE_USERS_KEY, userId);
        }
      }
    } catch (error) {
      console.error('Error cleaning up stale entries:', error);
    }
  }

  // Get user's last active time
  async getUserLastActive(userId) {
    try {
      if (!this.redisClient) return null;

      const lastSeen = await this.redisClient.get(`${USER_LAST_SEEN_KEY}${userId}`);
      return lastSeen ? parseInt(lastSeen) : null;
    } catch (error) {
      console.error('Error getting user last active:', error);
      return null;
    }
  }
}

// Create singleton instance
const onlineStatusService = new OnlineStatusService();

// Clean up stale entries every 5 minutes
setInterval(() => {
  onlineStatusService.cleanupStaleEntries();
}, 5 * 60 * 1000);

module.exports = onlineStatusService; 