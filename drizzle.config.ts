import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

import fs from 'node:fs';
import path from 'node:path';

function getLocalD1DB() {
	try {
		const basePath = path.resolve('.wrangler');
		const dbFile = fs
			.readdirSync(basePath, { encoding: 'utf-8', recursive: true })
			.find((f) => f.endsWith('.sqlite'));

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
	...(process.env.NODE_ENV === 'production'
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
