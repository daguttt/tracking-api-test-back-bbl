import { honoFactory } from '@/factory';
import { createCheckpointUseCaseToken } from '../application';

export const checkpointsHandlers = honoFactory.createHandlers((c) => {
  const createCheckpointUseCase = c.var.resolve(createCheckpointUseCaseToken);

  return c.json({ message: 'ok' });
});
