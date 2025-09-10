import { createServerApp } from './server';

const app = createServerApp();

export default {
	fetch: app.fetch,
} satisfies ExportedHandler<CloudflareBindings>;
