module.exports = {
  apps: [
    {
      name: 'chydev_react_vite_boilerplate',
      namespace: 'client', // Change this namespace according to your project type
      script: 'yarn',
      args: 'preview',
      cwd: '/home/user/directory/chydev_react_vite_boilerplate', // Change this path according to your project location
      exec_mode: 'fork',
      node_args: '--max-old-space-size=1024',
      max_memory_restart: '850M',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
      },
    },
  ],
};
