import { supabase } from '../../lib/supabase';
import {
  CONTENT_TYPE_JSON,
  DEFAULT_API_BASE_URL,
  HTTP_STATUS_NO_CONTENT,
  REQUEST_HEADER,
} from '../constants/api.constant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

interface RequestOptions {
  userId?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

async function buildHeaders(userId?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = { [REQUEST_HEADER.CONTENT_TYPE]: CONTENT_TYPE_JSON };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers[REQUEST_HEADER.AUTHORIZATION] = `Bearer ${session.access_token}`;
  }
  if (userId) {
    headers[REQUEST_HEADER.USER_ID] = userId;
  }
  return headers;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_BASE_URL}${path}`;
  if (!query) {
    return url;
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  }
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers: await buildHeaders(options.userId),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  if (response.status === HTTP_STATUS_NO_CONTENT) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>('POST', path, options),
  put: <T>(path: string, options?: RequestOptions) => request<T>('PUT', path, options),
  delete: <T = void>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
