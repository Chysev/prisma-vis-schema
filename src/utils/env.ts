import { config } from "dotenv";

if (process.env.NODE_ENV === "development") {
    config({ path: ".env.dev" });
    console.log("Loaded Development Envornment Variables");
} else {
    config({ path: ".env" });
    console.log("Loaded Production Envornment Variables");
}

export = () => {
    const requiredVariables = [
        "PORT",
        "VERSION",
        "BASEROUTE",
        "REDIS_URL",
        "ENC_KEY_SECRET",
        "CIPHER_KEY_SECRET",
        "DATABASE_URL"
    ];

    const missingVariables = requiredVariables.filter(
        (variable) => !process.env[variable]
    );

    if (missingVariables.length > 0) {
        console.error(
            `Missing required environment variables: ${missingVariables.join(", ")}`
        );
        process.exit(1);
    }

    if (isNaN(Number(process.env.PORT))) {
        console.error("PORT must be a number");
        process.exit(1);
    }

    console.log("Environment variables are valid.");
};