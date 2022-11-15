export const apps = [
  {
    name: 'popprika.app',
    script: './dist/api.worker.js',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    wait_ready: true,
    listen_timeout: 6000,
    kill_timeout: 4800,
    autorestart: true,
    watch: true,
    ignore_watch: ['logs'],
  },
];
