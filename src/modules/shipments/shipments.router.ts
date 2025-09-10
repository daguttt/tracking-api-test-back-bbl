import { Hono } from 'hono';

export const router = new Hono<{ Bindings: CloudflareBindings }>();

router.get('/shipments', (c) => c.json({ message: 'OK' }));

router.get('/tracking/:id', (c) => c.json({ message: 'OK' }));

router.post('/checkpoints', (c) => c.json({ message: 'OK' }));
