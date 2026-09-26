import { STORAGE_KEY } from '../core/constants/storage.constant';
import type { CustomCompanyFitResult } from '../models';

export function loadCustomCompanies(): CustomCompanyFitResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY.CUSTOM_COMPANIES);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(companies: CustomCompanyFitResult[]): CustomCompanyFitResult[] {
  try {
    localStorage.setItem(STORAGE_KEY.CUSTOM_COMPANIES, JSON.stringify(companies));
  } catch {
    // Storage full or unavailable; the in-memory list stays usable for this session.
  }
  return companies;
}

export function saveCustomCompany(
  existing: CustomCompanyFitResult[],
  company: CustomCompanyFitResult,
): CustomCompanyFitResult[] {
  const deduped = existing.filter((c) => c.companyName.toLowerCase() !== company.companyName.toLowerCase());
  return persist([company, ...deduped]);
}

export function removeCustomCompany(
  existing: CustomCompanyFitResult[],
  companyName: string,
): CustomCompanyFitResult[] {
  return persist(existing.filter((c) => c.companyName.toLowerCase() !== companyName.toLowerCase()));
}

export function clearCustomCompanies(): CustomCompanyFitResult[] {
  return persist([]);
}
