module.exports = {
  apps: [
    {
      name: 'my-app',         // A friendly name for your process
      script: 'dist/index.js', // The entry point of your compiled application
      interpreter: 'node',     // Explicitly use the node interpreter
      // Other PM2 options you might want:
      instances: 'max',       // Or a specific number of instances
      autorestart: true,      // Restart automatically on crash
      watch: false,           // Set to true if you want PM2 to watch for file changes (use with caution in production)
      max_memory_restart: '1G', // Restart if memory usage exceeds this limit
      env: {                  // Environment variables
        NODE_ENV: 'production' // Set the environment to production
      }
      // Add any other environment variables your application needs here
      // env_production: { // You can have environment variables specific to production
      //   NODE_ENV: 'production'
      // }
    }
  ]
};