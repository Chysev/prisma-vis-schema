import kleur from "kleur";
import { getDBUrl } from "./db-url";
import appConfig from "@/config";

const printAppInfo = (
    customMessage: string = "",
) => {
    const serverSuccessMessage = kleur.green("Server is running successfully!");
    const label = (name: string) => kleur.bold(name) + ":";

    const env = appConfig.NODE_ENV || "development";
    const port = appConfig.PORT || "Not set";
    const redisUrl = appConfig.REDIS_URL || "Not set";
    const dbUrl = appConfig.DATABASE_URL || "Not set";

    console.log(`
    \r${kleur.yellow("-----------------------------------")}\n
    \r${serverSuccessMessage}\n
    \r${label("Env")} ${kleur.yellow(env)}\n
    \r${label("Port")} ${kleur.yellow(port)}\n
    \r${label("API Base Route")} ${kleur.yellow(
        `/${appConfig.BASEROUTE}/${appConfig.VERSION}`
    )}\n
    \r${label("REDIS URL")} ${kleur.yellow(redisUrl)}\n
    \r${label("DB URL")} ${kleur.yellow(getDBUrl(dbUrl))}\n
    \r${customMessage ? kleur.blue(customMessage) : ""}\n
    \r${kleur.yellow("-----------------------------------")}\n
`);
};

export default printAppInfo;