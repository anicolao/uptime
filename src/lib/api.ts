import { auth } from '$lib/firebase';

type FunctionName = 'manualCheck' | 'version';

const productionPaths: Record<FunctionName, string> = {
  manualCheck: '/api/manual-check',
  version: '/api/version'
};

export async function callFunction<T>(name: FunctionName): Promise<T> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Authentication required');

  const token = await currentUser.getIdToken();
  const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL?.replace(/\/$/, '');
  const url = functionsBaseUrl ? `${functionsBaseUrl}/${name}` : productionPaths[name];
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `Function ${name} failed`);
  return body;
}
