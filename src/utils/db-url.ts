export const getDBUrl = (url: string) => {
    try {
        const dbUrl = new URL(url);
        if (dbUrl.username || dbUrl.password) {
            dbUrl.username = '*****';
            dbUrl.password = '*****';
        }
        return dbUrl.toString();
    } catch {
        return url;
    }
}