import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

import * as fs from 'node:fs';
import * as path from 'node:path';

function getLocalD1DB() {
	try {
		console.log();
		console.info('[drizzle.config.ts] Getting local D1 DB (SQLite)');
		const basePath = path.resolve('.wrangler');
		const dotWranglerFiles = fs.readdirSync(basePath, {
			encoding: 'utf-8',
			recursive: true,
		});
		const sqliteFiles = dotWranglerFiles.filter((f) => f.endsWith('.sqlite'));
		const dbFile = sqliteFiles[sqliteFiles.length - 1];

		console.log(`[drizzle.config.ts] DB file: .wrangler/${dbFile}`);
		console.log();

		if (!dbFile) {
			throw new Error(`.sqlite file not found in ${basePath}`);
		}

		const url = path.resolve(basePath, dbFile);
		return url;
	} catch (err) {
		console.log(`Error  ${err}`);
	}
}

export default defineConfig({
	out: './src/db/migrations',
	schema: './src/db/schema.ts',
	dialect: 'sqlite',
	// `DRIZZLE_ENVIRONMENT` is injected before running a `drizzle-kit` command (e.g. `pnpm db:studio:dev`)
	...(process.env.DRIZZLE_ENVIRONMENT === 'production'
		? {
				driver: 'd1-http',
				dbCredentials: {
					accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
					databaseId: process.env.CLOUDFLARE_DATABASE_ID,
					token: process.env.CLOUDFLARE_D1_TOKEN,
				},
			}
		: {
				dbCredentials: {
					url: getLocalD1DB(),
				},
			}),
});
