import db from '../db';

export async function createApplication() {
    const app = await db.application.create({});

    return app;
}
