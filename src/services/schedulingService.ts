import { api } from './api';
import { ScheduledContent, ScheduleContentRequest } from '../types';

class SchedulingService {
  async getScheduledContent(): Promise<ScheduledContent[]> {
    const response = await api.read('/api/scheduling');
    return response;
  }

  async scheduleContent(data: ScheduleContentRequest): Promise<ScheduledContent> {
    const response = await api.create('/api/scheduling', data);
    return response;
  }

  async updateScheduledContent(id: number, data: Partial<ScheduleContentRequest>): Promise<ScheduledContent> {
    const response = await api.update(`/api/scheduling/${id}`, data);
    return response;
  }

  async deleteScheduledContent(id: number): Promise<void> {
    await api.delete(`/api/scheduling/${id}`);
  }

  async publishNow(id: number): Promise<ScheduledContent> {
    const response = await api.update(`/api/scheduling/${id}/publish`);
    return response;
  }

  async unpublishNow(id: number): Promise<ScheduledContent> {
    const response = await api.update(`/api/scheduling/${id}/unpublish`);
    return response;
  }

  async getScheduledContentByType(type: ScheduledContent['content_type']): Promise<ScheduledContent[]> {
    const response = await api.read('/api/scheduling', {
      params: { type }
    });
    return response;
  }

  async getScheduledContentByDateRange(startDate: string, endDate: string): Promise<ScheduledContent[]> {
    const response = await api.read('/api/scheduling', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response;
  }

  async getScheduledContentStats(): Promise<{
    total: number;
    scheduled: number;
    published: number;
    failed: number;
    upcoming: number;
  }> {
    const response = await api.read('/api/scheduling/stats');
    return response;
  }

  async scheduleRecurring(data: ScheduleContentRequest & {
    recurrence: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval?: number;
      daysOfWeek?: number[];
      daysOfMonth?: number[];
      endDate?: string;
      maxOccurrences?: number;
    };
  }): Promise<ScheduledContent> {
    const response = await api.create('/api/scheduling/recurring', data);
    return response;
  }

  async updateRecurrence(id: number, recurrence: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval?: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    endDate?: string;
    maxOccurrences?: number;
  }): Promise<ScheduledContent> {
    const response = await api.update(`/api/scheduling/${id}/recurrence`, recurrence);
    return response;
  }

  async getRecurrenceInstances(id: number, startDate: string, endDate: string): Promise<ScheduledContent[]> {
    const response = await api.read(`/api/scheduling/${id}/instances`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response;
  }

  async scheduleWithApproval(data: ScheduleContentRequest & {
    approvers: string[];
    requiredApprovals?: number;
  }): Promise<ScheduledContent> {
    const response = await api.create('/api/scheduling/with-approval', data);
    return response;
  }

  async approveContent(id: number, approverComment?: string): Promise<ScheduledContent> {
    const response = await api.update(`/api/scheduling/${id}/approve`, {
      comment: approverComment
    });
    return response;
  }

  async rejectContent(id: number, reason: string): Promise<ScheduledContent> {
    const response = await api.update(`/api/scheduling/${id}/reject`, {
      reason
    });
    return response;
  }

  async getApprovalHistory(id: number): Promise<Array<{
    approver: string;
    action: 'approved' | 'rejected';
    comment?: string;
    timestamp: string;
  }>> {
    const response = await api.read(`/api/scheduling/${id}/approval-history`);
    return response;
  }

  async scheduleWithDependencies(data: ScheduleContentRequest & {
    dependencies: Array<{
      contentId: number;
      type: 'publish' | 'unpublish';
      delay?: number;
    }>;
  }): Promise<ScheduledContent> {
    const response = await api.create('/api/scheduling/with-dependencies', data);
    return response;
  }

  async getDependencyGraph(id: number): Promise<{
    nodes: Array<{ id: number; title: string; status: string }>;
    edges: Array<{ from: number; to: number; type: string }>;
  }> {
    const response = await api.read(`/api/scheduling/${id}/dependency-graph`);
    return response;
  }

  async scheduleWithVersioning(data: ScheduleContentRequest & {
    version: string;
    rollbackVersion?: string;
  }): Promise<ScheduledContent> {
    const response = await api.create('/api/scheduling/with-versioning', data);
    return response;
  }

  async getVersionHistory(id: number): Promise<Array<{
    version: string;
    publishedAt: string;
    publishedBy: string;
    changes: string[];
  }>> {
    const response = await api.read(`/api/scheduling/${id}/version-history`);
    return response;
  }

  async rollbackVersion(id: number, version: string): Promise<ScheduledContent> {
    const response = await api.update(`/api/scheduling/${id}/rollback`, {
      version
    });
    return response;
  }
}

export const schedulingService = new SchedulingService(); 