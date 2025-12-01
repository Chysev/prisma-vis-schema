import "../utils/env"
const appConfig = {
    PORT: process.env.PORT,
    VERSION: process.env.VERSION,
    BASEROUTE: process.env.BASEROUTE,

    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,

    ENC_KEY_SECRET: process.env.ENC_KEY_SECRET,
    CIPHER_KEY_SECRET: process.env.CIPHER_KEY_SECRET,
    API_KEY_SECRET: process.env.API_KEY_SECRET,
    API_KEY: process.env.API_KEY,

    NODE_ENV: process.env.NODE_ENV,

    WHITELIST: process.env.WHITELIST
        ? process.env.WHITELIST.split(",").map((s) => s.trim())
        : []
}

export default appConfig