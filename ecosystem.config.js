module.exports = {
  apps: [
    {
      name: 'my-app-dev', // A friendly name for your process
      script: 'npm',      // The command to execute
      args: 'run dev',    // The arguments for the command
      interpreter: '/bin/bash', // Optional: specify the shell if needed
      // Other PM2 options you might want:
      // instances: 1, // Number of instances (for development, usually 1 is fine)
      // autorestart: true, // Restart automatically on crash
      // watch: false, // Set to true if you want PM2 to watch for file changes
      // max_memory_restart: '1G', // Restart if memory usage exceeds this limit
      // env: { // Environment variables
      //   NODE_ENV: 'development'
      // }
    }
  ]
};