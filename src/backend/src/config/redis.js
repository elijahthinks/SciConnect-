const redis = require('redis');
const config = require('../config')[process.env.NODE_ENV || 'development'];

let redisClient = null;

const createRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = redis.createClient({
      url: config.database.redis,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('Redis server refused connection');
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          console.error('Redis connection attempts exhausted');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis client connected');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis client ready');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis client error:', err);
    });

    redisClient.on('end', () => {
      console.log('🔌 Redis client disconnected');
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
};

const connectRedis = async () => {
  try {
    if (!redisClient) {
      redisClient = createRedisClient();
    }

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Test the connection
    await redisClient.ping();
    console.log('Redis connection successful');
    return redisClient;
  } catch (error) {
    console.error('Redis connection failed:', error);
    return null;
  }
};

const disconnectRedis = async () => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      redisClient = null;
      console.log('Redis disconnected successfully');
    }
  } catch (error) {
    console.error('Error disconnecting Redis:', error);
  }
};

// Cache utility functions
const cache = {
  // Get value from cache
  get: async (key) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return null;
      }
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Set value in cache with optional TTL (time to live)
  set: async (key, value, ttl = 3600) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return false;
      }
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redisClient.setEx(key, ttl, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Delete value from cache
  del: async (key) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return false;
      }
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return false;
      }
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  // Increment value
  incr: async (key) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return null;
      }
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Cache increment error:', error);
      return null;
    }
  },

  // Set expiration for key
  expire: async (key, ttl) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return false;
      }
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  },

  // Get multiple keys
  mget: async (keys) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return [];
      }
      const values = await redisClient.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return [];
    }
  },

  // Set multiple key-value pairs
  mset: async (keyValuePairs, ttl = 3600) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return false;
      }
      
      const serializedPairs = {};
      for (const [key, value] of Object.entries(keyValuePairs)) {
        serializedPairs[key] = JSON.stringify(value);
      }
      
      await redisClient.mSet(serializedPairs);
      
      // Set expiration for all keys if TTL is provided
      if (ttl) {
        const expirePromises = Object.keys(serializedPairs).map(key => 
          redisClient.expire(key, ttl)
        );
        await Promise.all(expirePromises);
      }
      
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  },

  // Flush all cache
  flushAll: async () => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return false;
      }
      await redisClient.flushAll();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }
};

// Session storage for express-session
const RedisStore = require('connect-redis').default;

const createSessionStore = () => {
  if (!redisClient) {
    console.warn('Redis client not available, falling back to memory store');
    return null;
  }
  
  return new RedisStore({
    client: redisClient,
    prefix: 'sciconnect:sess:'
  });
};

module.exports = {
  createRedisClient,
  connectRedis,
  disconnectRedis,
  cache,
  createSessionStore,
  getClient: () => redisClient
}; 