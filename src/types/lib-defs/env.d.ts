
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            VERSION: string;
            BASEROUTE: string
            REDIS_URL: string;
            ENC_KEY_SECRET: string;
            CIPHER_KEY_SECRET: string;
            API_KEY_SECRET: string;
            API_KEY: string;
            NODE_ENV: string;
            DATABASE_URL: string;
        }
    }
}

export { };