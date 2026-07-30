module.exports = {
  apps: [
    {
      name: "oregon-swift-api",
      script: "./dist/index.js",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
