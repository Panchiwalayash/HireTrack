import { DEFAULT_NEEDS_ATTENTION_LIMIT } from '../core/constants/ranking.constant';
import { httpClient } from '../core/utils/http-client.util';
import type { NeedsAttentionItem } from '../models';

export interface DashboardStats {
  totalJobs: number;
  appliedCount: number;
  interviewingCount: number;
  offersCount: number;
  totalTasks: number;
  completedTasks: number;
  overallCompletionRate: number;
}

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  return httpClient.get<DashboardStats>('/dashboard/stats', { userId });
}

export async function fetchAttentionItems(
  userId: string,
  limit: number = DEFAULT_NEEDS_ATTENTION_LIMIT,
): Promise<NeedsAttentionItem[]> {
  return httpClient.get<NeedsAttentionItem[]>('/dashboard/attention', { userId, query: { limit } });
}
