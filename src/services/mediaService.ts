import { api } from './api';
import { MediaItem, MediaFolder, MediaUploadResponse } from '../types';

class MediaService {
  async uploadMedia(file: File, folder?: number): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder_id', folder.toString());
    }

    const response = await api.create('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  }

  async getMediaItems(folder?: number): Promise<MediaItem[]> {
    const params = folder ? { folder_id: folder } : {};
    const response = await api.read('/api/media', { params });
    return response;
  }

  async getFolders(): Promise<MediaFolder[]> {
    const response = await api.read('/api/media/folders');
    return response;
  }

  async createFolder(name: string, parentId?: number): Promise<MediaFolder> {
    const response = await api.create('/api/media/folders', {
      name,
      parent_id: parentId,
    });
    return response;
  }

  async updateMedia(id: number, data: Partial<MediaItem>): Promise<MediaItem> {
    const response = await api.update(`/api/media/${id}`, data);
    return response;
  }

  async deleteMedia(ids: number[]): Promise<void> {
    await api.delete('/api/media', { data: { ids } });
  }

  async deleteFolder(id: number): Promise<void> {
    await api.delete(`/api/media/folders/${id}`);
  }

  async moveMedia(mediaIds: number[], targetFolderId?: number): Promise<void> {
    await api.update('/api/media/move', {
      media_ids: mediaIds,
      target_folder_id: targetFolderId,
    });
  }

  async searchMedia(query: string): Promise<MediaItem[]> {
    const response = await api.read('/api/media/search', {
      params: { q: query },
    });
    return response;
  }

  async optimizeMedia(id: number, options: {
    quality?: number;
    width?: number;
    height?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }): Promise<MediaItem> {
    const response = await api.update(`/api/media/${id}/optimize`, options);
    return response;
  }

  async generateThumbnail(id: number, options: {
    width: number;
    height: number;
    fit?: 'cover' | 'contain' | 'fill';
  }): Promise<MediaItem> {
    const response = await api.create(`/api/media/${id}/thumbnail`, options);
    return response;
  }

  async compressMedia(id: number, options: {
    quality: number;
    preserveMetadata?: boolean;
  }): Promise<MediaItem> {
    const response = await api.update(`/api/media/${id}/compress`, options);
    return response;
  }

  async convertFormat(id: number, format: 'jpeg' | 'png' | 'webp' | 'mp4' | 'webm'): Promise<MediaItem> {
    const response = await api.update(`/api/media/${id}/convert`, { format });
    return response;
  }

  async addWatermark(id: number, options: {
    text?: string;
    image?: string;
    position?: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    opacity?: number;
  }): Promise<MediaItem> {
    const response = await api.update(`/api/media/${id}/watermark`, options);
    return response;
  }

  async cropMedia(id: number, options: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): Promise<MediaItem> {
    const response = await api.update(`/api/media/${id}/crop`, options);
    return response;
  }

  async rotateMedia(id: number, degrees: number): Promise<MediaItem> {
    const response = await api.update(`/api/media/${id}/rotate`, { degrees });
    return response;
  }

  async analyzeMedia(id: number): Promise<{
    size: number;
    dimensions?: { width: number; height: number };
    format: string;
    metadata: Record<string, any>;
  }> {
    const response = await api.read(`/api/media/${id}/analyze`);
    return response;
  }

  async batchProcess(ids: number[], operations: Array<{
    type: 'optimize' | 'compress' | 'convert' | 'watermark';
    options: Record<string, any>;
  }>): Promise<MediaItem[]> {
    const response = await api.update('/api/media/batch', {
      ids,
      operations
    });
    return response;
  }
}

export const mediaService = new MediaService(); 