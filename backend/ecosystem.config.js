/**
 * PM2 process manifest. Use for VPS / Plesk deployments without Docker:
 *   pm2 start ecosystem.config.js
 *   pm2 save && pm2 startup   # auto-start on reboot
 */
module.exports = {
  apps: [
    {
      name: "leadradius-api",
      script: "dist/index.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "512M",
      env_production: {
        NODE_ENV: "production",
      },
      out_file: "./logs/api-out.log",
      error_file: "./logs/api-err.log",
      time: true,
    },
    {
      name: "leadradius-worker",
      script: "dist/workers/index.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      env_production: {
        NODE_ENV: "production",
      },
      out_file: "./logs/worker-out.log",
      error_file: "./logs/worker-err.log",
      time: true,
    },
  ],
};
