import "./utils/env";
import index from ".";
import http from "http";
import { connectRedis } from "./db/redis";
import { connectPrisma, disconnectPrisma } from "./db/prisma";
import printAppInfo from "./utils/print-app-info";


const _index = new index();
const main = _index.app;
const server = http.createServer(main);

const createServer = (process: NodeJS.Process) => {
    return async () => {
        try {

            // await connectRedis();
            await connectPrisma();
            shutdown(server, process)

            server.listen(process.env.PORT, () => {
                printAppInfo(
                    `Server started on port ${process.env.PORT}`
                );
            });
        } catch (error) {

            process.exit(1);
        }
    };
};

const shutdown = (server: http.Server, proc: NodeJS.Process) => {
    const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
    let shuttingDown = false;

    const shutdown = async (reason: string) => {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log(`[shutdown] received ${reason}, starting shutdown…`);

        const forceExitTimer = setTimeout(() => {
            console.error("[shutdown] force exit after timeout");
            proc.exit(1);
        }, 10_000);
        (forceExitTimer as any).unref?.();

        server.close(async (closeErr) => {
            if (closeErr) {
                console.error("[shutdown] http server close error:", closeErr);
            } else {
                console.log("[shutdown] http server closed");
            }

            try {
                await disconnectPrisma()
                console.log("[shutdown] prisma disconnected");
            } catch (e) {
                console.error("[shutdown] prisma disconnect error:", e);
            }

            clearTimeout(forceExitTimer);
            console.log("[shutdown] complete, exiting");
            proc.exit(closeErr ? 1 : 0);
        });
    };

    signals.forEach((sig) =>
        proc.on(sig, () => shutdown(sig))
    );

    proc.on("uncaughtException", (err) => {
        console.error("[uncaughtException]", err);
        shutdown("uncaughtException");
    });
    proc.on("unhandledRejection", (reason) => {
        console.error("[unhandledRejection]", reason);
        shutdown("unhandledRejection");
    });
}

createServer(process)()