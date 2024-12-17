import React, { useState, useEffect, useCallback } from 'react';
import { 
  Folder, 
  Upload, 
  Search, 
  Grid, 
  List, 
  Trash2, 
  Move, 
  Edit2, 
  Plus,
  X,
  ChevronRight
} from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { MediaItem, MediaFolder, MediaLibraryState } from '../../types';
import { debounce } from '../../utils/performance';

const initialState: MediaLibraryState = {
  items: [],
  folders: [],
  loading: true,
  selectedItems: [],
};

export function MediaLibrary() {
  const [state, setState] = useState<MediaLibraryState>(initialState);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const loadMedia = useCallback(async (folderId?: number) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const [items, folders] = await Promise.all([
        mediaService.getMediaItems(folderId),
        mediaService.getFolders(),
      ]);
      setState(prev => ({
        ...prev,
        items,
        folders,
        currentFolder: folderId,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load media library',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const debouncedSearch = debounce(async (query: string) => {
    if (!query) {
      loadMedia(state.currentFolder);
      return;
    }
    try {
      const items = await mediaService.searchMedia(query);
      setState(prev => ({ ...prev, items }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Search failed',
      }));
    }
  }, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      setUploadProgress(0);
      const uploadPromises = Array.from(files).map(async file => {
        const response = await mediaService.uploadMedia(file, state.currentFolder);
        setUploadProgress(prev => prev !== null ? prev + (100 / files.length) : null);
        return response.media;
      });

      const newMedia = await Promise.all(uploadPromises);
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...newMedia],
      }));
      setUploadProgress(null);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Upload failed',
      }));
      setUploadProgress(null);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const folder = await mediaService.createFolder(newFolderName, state.currentFolder);
      setState(prev => ({
        ...prev,
        folders: [...prev.folders, folder],
      }));
      setIsCreatingFolder(false);
      setNewFolderName('');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to create folder',
      }));
    }
  };

  const handleDeleteSelected = async () => {
    if (!state.selectedItems.length) return;
    
    if (!window.confirm('Are you sure you want to delete the selected items?')) {
      return;
    }

    try {
      await mediaService.deleteMedia(state.selectedItems);
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => !state.selectedItems.includes(item.id)),
        selectedItems: [],
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to delete items',
      }));
    }
  };

  const toggleItemSelection = (id: number) => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(id)
        ? prev.selectedItems.filter(itemId => itemId !== id)
        : [...prev.selectedItems, id],
    }));
  };

  const renderBreadcrumb = () => {
    if (!state.currentFolder) {
      return <span className="text-gray-600">Media Library</span>;
    }

    const folder = state.folders.find(f => f.id === state.currentFolder);
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => loadMedia()}
          className="text-amber-600 hover:text-amber-700"
        >
          Media Library
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600">{folder?.name}</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-600 hover:text-amber-600"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List /> : <Grid />}
          </button>
          <label className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            <span>Upload</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,application/pdf"
            />
          </label>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          {renderBreadcrumb()}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
          </div>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-amber-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Folder
          </button>
          {state.selectedItems.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center px-3 py-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-amber-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Create Folder Dialog */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Create New Folder</h3>
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close dialog"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-4' : 'grid-cols-1'} gap-6`}>
        {/* Folders */}
        {state.folders
          .filter(folder => folder.parent_id === state.currentFolder)
          .map(folder => (
            <div
              key={folder.id}
              onClick={() => loadMedia(folder.id)}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer flex items-center space-x-3"
            >
              <Folder className="w-8 h-8 text-amber-600" />
              <span className="font-medium text-gray-900">{folder.name}</span>
            </div>
          ))}

        {/* Media Items */}
        {state.items.map(item => (
          <div
            key={item.id}
            className={`bg-white rounded-lg shadow-sm hover:shadow-md relative group ${
              state.selectedItems.includes(item.id) ? 'ring-2 ring-amber-600' : ''
            }`}
          >
            {/* Preview */}
            <div className="aspect-square relative">
              {item.file_type === 'image' ? (
                <img
                  src={item.file_url}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-lg">
                  {item.file_type === 'video' ? (
                    <video
                      src={item.file_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl text-gray-400">📄</div>
                  )}
                </div>
              )}
              
              {/* Selection Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity">
                <input
                  type="checkbox"
                  checked={state.selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="absolute top-2 right-2"
                  title={`Select ${item.title}`}
                  aria-label={`Select ${item.title}`}
                />
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!state.loading && state.items.length === 0 && state.folders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No media items found</p>
        </div>
      )}

      {/* Loading State */}
      {state.loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {state.error}
        </div>
      )}
    </div>
  );
} 