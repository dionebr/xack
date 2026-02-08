module.exports = {
    apps: [{
        name: 'xack-backend',
        script: './server.js',
        instances: 1,
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'production',
            PORT: 3001,
            DB_HOST: 'localhost',
            DB_USER: 'xack_user',
            DB_PASSWORD: 'XackUser2026!@#',
            DB_NAME: 'xack_platform',
            JWT_SECRET: 'xack_jwt_secret_vanguard_2026'
        }
    }]
};
