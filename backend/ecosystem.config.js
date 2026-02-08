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
            JWT_SECRET: '771d906997dfc1ce617b33a0d560e86085a395a645f29ae2b9bb9d09a54d8c1dd06d55eb58870d48f8b8c303738945d0977fecd6e3c3a6387a221a16af1ae9eda'
        }
    }]
};
