import { httpClient } from '../core/utils/http-client.util';
import type { CustomCompanyFitRequest, CustomCompanyFitResult } from '../models';

export interface SitePreview {
  url: string;
  extractedSnippet: string;
  length: number;
}

export async function assessCompanyFit(
  payload: CustomCompanyFitRequest,
  userId?: string,
): Promise<CustomCompanyFitResult> {
  return httpClient.post<CustomCompanyFitResult>('/ai/company-fit', { userId, body: payload });
}

export async function previewSite(url: string, userId?: string): Promise<SitePreview> {
  return httpClient.post<SitePreview>('/ai/preview-site', { userId, body: { url } });
}
