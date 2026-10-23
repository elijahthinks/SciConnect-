const express = require('express');
const router = express.Router();
const sequelize = require('../db');
const redis = require('../config/redis');

// Health check endpoint
router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown'
    }
  };

  try {
    // Check database connection
    await sequelize.authenticate();
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'error';
  }

  try {
    // Check Redis connection
    await redis.ping();
    health.checks.redis = 'ok';
  } catch (error) {
    health.checks.redis = 'error';
    health.status = 'error';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  health.checks.memory = 'ok';
  health.memory = memUsageMB;

  // Check if memory usage is too high
  if (memUsageMB.heapUsed > 500) { // 500MB threshold
    health.checks.memory = 'warning';
    if (health.status === 'ok') {
      health.status = 'warning';
    }
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const detailedHealth = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid
    },
    checks: {
      database: { status: 'unknown', details: {} },
      redis: { status: 'unknown', details: {} },
      memory: { status: 'unknown', details: {} },
      disk: { status: 'unknown', details: {} }
    }
  };

  try {
    // Database check
    const dbStart = Date.now();
    await sequelize.authenticate();
    const dbTime = Date.now() - dbStart;
    
    detailedHealth.checks.database = {
      status: 'ok',
      details: {
        responseTime: `${dbTime}ms`,
        dialect: sequelize.getDialect(),
        host: sequelize.config.host,
        database: sequelize.config.database
      }
    };
  } catch (error) {
    detailedHealth.checks.database = {
      status: 'error',
      details: {
        error: error.message
      }
    };
    detailedHealth.status = 'error';
  }

  try {
    // Redis check
    const redisStart = Date.now();
    await redis.ping();
    const redisTime = Date.now() - redisStart;
    
    detailedHealth.checks.redis = {
      status: 'ok',
      details: {
        responseTime: `${redisTime}ms`
      }
    };
  } catch (error) {
    detailedHealth.checks.redis = {
      status: 'error',
      details: {
        error: error.message
      }
    };
    detailedHealth.status = 'error';
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  detailedHealth.checks.memory = {
    status: 'ok',
    details: memUsageMB
  };

  if (memUsageMB.heapUsed > 500) {
    detailedHealth.checks.memory.status = 'warning';
    if (detailedHealth.status === 'ok') {
      detailedHealth.status = 'warning';
    }
  }

  // Disk space check (if available)
  try {
    const fs = require('fs');
    const path = require('path');
    const stats = fs.statSync(path.join(__dirname, '..'));
    const freeSpace = stats.blocks * stats.blksize;
    const freeSpaceMB = Math.round(freeSpace / 1024 / 1024);
    
    detailedHealth.checks.disk = {
      status: 'ok',
      details: {
        freeSpace: `${freeSpaceMB}MB`
      }
    };

    if (freeSpaceMB < 1000) { // Less than 1GB
      detailedHealth.checks.disk.status = 'warning';
      if (detailedHealth.status === 'ok') {
        detailedHealth.status = 'warning';
      }
    }
  } catch (error) {
    detailedHealth.checks.disk = {
      status: 'unknown',
      details: {
        error: 'Unable to check disk space'
      }
    };
  }

  const statusCode = detailedHealth.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(detailedHealth);
});

// Readiness check (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if application is ready to serve traffic
    await sequelize.authenticate();
    await redis.ping();
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Liveness check (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router; 