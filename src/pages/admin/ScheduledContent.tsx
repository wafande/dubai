import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock as PendingIcon
} from 'lucide-react';
import { schedulingService } from '../../services/schedulingService';
import { ScheduledContent, ScheduleContentRequest } from '../../types';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { debounce } from '../../utils/performance';

interface ScheduleFormData extends Omit<ScheduleContentRequest, 'publish_date' | 'unpublish_date'> {
  publish_date: Date;
  unpublish_date?: Date;
}

export function ScheduledContent() {
  const [items, setItems] = useState<ScheduledContent[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    published: 0,
    failed: 0,
    upcoming: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    content_type: 'tour',
    content_id: 0,
    publish_date: new Date(),
    metadata: {
      visibility: 'public',
      priority: 'medium',
      tags: [],
    }
  });
  const [selectedType, setSelectedType] = useState<ScheduledContent['content_type'] | 'all'>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: addDays(new Date(), 30)
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContent();
    loadStats();
  }, [selectedType, dateRange]);

  const loadContent = async () => {
    try {
      setLoading(true);
      let content: ScheduledContent[];
      
      if (selectedType !== 'all') {
        content = await schedulingService.getScheduledContentByType(selectedType);
      } else if (dateRange.start && dateRange.end) {
        content = await schedulingService.getScheduledContentByDateRange(
          format(dateRange.start, 'yyyy-MM-dd'),
          format(dateRange.end, 'yyyy-MM-dd')
        );
      } else {
        content = await schedulingService.getScheduledContent();
      }

      if (searchQuery) {
        content = content.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setItems(content);
      setError(null);
    } catch (err) {
      setError('Failed to load scheduled content');
      console.error('Scheduling error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await schedulingService.getScheduledContentStats();
      setStats(stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: ScheduleContentRequest = {
        ...formData,
        publish_date: format(formData.publish_date, 'yyyy-MM-dd HH:mm:ss'),
        unpublish_date: formData.unpublish_date 
          ? format(formData.unpublish_date, 'yyyy-MM-dd HH:mm:ss')
          : undefined
      };

      await schedulingService.scheduleContent(data);
      setShowForm(false);
      loadContent();
      loadStats();
    } catch (err) {
      setError('Failed to schedule content');
      console.error('Scheduling error:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this scheduled content?')) {
      return;
    }

    try {
      await schedulingService.deleteScheduledContent(id);
      loadContent();
      loadStats();
    } catch (err) {
      setError('Failed to delete scheduled content');
      console.error('Delete error:', err);
    }
  };

  const handlePublishNow = async (id: number) => {
    try {
      await schedulingService.publishNow(id);
      loadContent();
      loadStats();
    } catch (err) {
      setError('Failed to publish content');
      console.error('Publish error:', err);
    }
  };

  const handleUnpublishNow = async (id: number) => {
    try {
      await schedulingService.unpublishNow(id);
      loadContent();
      loadStats();
    } catch (err) {
      setError('Failed to unpublish content');
      console.error('Unpublish error:', err);
    }
  };

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
    loadContent();
  }, 300);

  const getStatusIcon = (status: ScheduledContent['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <PendingIcon className="w-5 h-5 text-amber-500" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-amber-500 bg-amber-50';
      case 'low':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Scheduled Content</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center space-x-2"
          aria-label="Schedule new content"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 capitalize">{key}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search content..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 border rounded-lg"
            aria-label="Filter by content type"
          >
            <option value="all">All Types</option>
            <option value="tour">Tours</option>
            <option value="post">Posts</option>
            <option value="promotion">Promotions</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={format(dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                start: parseISO(e.target.value)
              }))}
              className="px-3 py-2 border rounded-lg"
            />
            <span>to</span>
            <input
              type="date"
              value={format(dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                end: parseISO(e.target.value)
              }))}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={loadContent}
            className="p-2 text-gray-600 hover:text-amber-600"
            aria-label="Refresh content"
            title="Refresh content"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Publish Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  {item.metadata?.visibility && (
                    <div className="text-xs text-gray-500 capitalize">
                      {item.metadata.visibility}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                    {item.content_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(item.status)}
                    <span className="ml-2 text-sm text-gray-500 capitalize">
                      {item.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(parseISO(item.publish_date), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getPriorityColor(item.metadata?.priority)
                  } capitalize`}>
                    {item.metadata?.priority || 'normal'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {item.status === 'scheduled' && (
                      <button
                        onClick={() => handlePublishNow(item.id)}
                        className="text-green-600 hover:text-green-900"
                        aria-label={`Publish ${item.title} now`}
                        title={`Publish ${item.title} now`}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    {item.status === 'published' && (
                      <button
                        onClick={() => handleUnpublishNow(item.id)}
                        className="text-amber-600 hover:text-amber-900"
                        aria-label={`Unpublish ${item.title}`}
                        title={`Unpublish ${item.title}`}
                      >
                        <EyeOff className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label={`Delete ${item.title}`}
                      title={`Delete ${item.title}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No scheduled content found</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        )}
      </div>

      {/* Schedule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Content</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content Type</label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    content_type: e.target.value as ScheduledContent['content_type']
                  }))}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="tour">Tour</option>
                  <option value="post">Post</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content ID</label>
                <input
                  type="number"
                  value={formData.content_id}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    content_id: parseInt(e.target.value) 
                  }))}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Publish Date</label>
                <input
                  type="datetime-local"
                  value={format(formData.publish_date, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    publish_date: parseISO(e.target.value)
                  }))}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Unpublish Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.unpublish_date ? format(formData.unpublish_date, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    unpublish_date: e.target.value ? parseISO(e.target.value) : undefined
                  }))}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Visibility</label>
                <select
                  value={formData.metadata?.visibility}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    metadata: { 
                      ...prev.metadata, 
                      visibility: e.target.value as 'public' | 'private' | 'draft' 
                    }
                  }))}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.metadata?.priority}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    metadata: { 
                      ...prev.metadata, 
                      priority: e.target.value as 'high' | 'medium' | 'low' 
                    }
                  }))}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
} 