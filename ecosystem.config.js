module.exports = {
  apps: [{
    name: 'sciconnect-api',
    script: 'server.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Monitoring
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Memory and CPU limits
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    
    // Watch mode (for development)
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    
    // Health check
    health_check_grace_period: 3000,
    
    // Kill timeout
    kill_timeout: 5000,
    
    // Listen timeout
    listen_timeout: 8000,
    
    // PM2 specific
    pmx: true,
    merge_logs: true,
    
    // Environment variables
    env_file: '.env'
  }],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/sciconnect.git',
      path: '/var/www/sciconnect',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 