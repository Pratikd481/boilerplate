export default () => ({
    port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    logLevel: process.env.LOG_LEVEL || 'info',
});