import { httpClient } from '../core/utils/http-client.util';

export async function seedDemoData(userId: string): Promise<void> {
  await httpClient.post('/demo/seed', { userId });
}

export async function clearAllUserData(userId: string): Promise<void> {
  await httpClient.post('/demo/clear', { userId });
}
