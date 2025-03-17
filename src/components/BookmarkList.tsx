import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Share2, Check, Play } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store';
import { updateBookmark, markResponseAsRead, type Bookmark } from '../store/bookmarkSlice';
import { setSelectedBookmarkResponse } from '../store/responseSlice';

const BookmarkList: React.FC = () => {
  const bookmarks = useAppSelector(state => state.bookmarks.bookmarks);
  const dispatch = useAppDispatch();
  const [expandedBookmarks, setExpandedBookmarks] = useState<Set<string>>(new Set());
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  const toggleBookmark = (id: string) => {
    setExpandedBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark.id);
    setEditText(bookmark.prompt);
  };

  const handleSave = (id: string) => {
    dispatch(updateBookmark({ id, prompt: editText }));
    setEditingBookmark(null);
    setEditText('');
  };

  const handleShare = (bookmark: Bookmark) => {
    const shareData = {
      prompt: bookmark.prompt,
      responses: bookmark.responses.map(r => r.content)
    };
    
    const url = new URL(window.location.href);
    url.searchParams.set('shared', encodeURIComponent(JSON.stringify(shareData)));
    
    navigator.clipboard.writeText(url.toString());
    alert('Shareable link copied to clipboard!');
  };

  const handleResponseClick = (bookmarkId: string, responseId: string, content: string[]) => {
    dispatch(markResponseAsRead({ bookmarkId, responseId }));
    setSelectedResponse(responseId);
    dispatch(setSelectedBookmarkResponse(content));
  };

  const handlePlayResponse = (content: string[]) => {
    dispatch(setSelectedBookmarkResponse(content));
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8 bg-gray-800 rounded-lg">
        No bookmarks yet. Submit a prompt to create one.
      </div>
    );
  }

  const renderResponseContent = (response: Bookmark['responses'][0]) => {
    return (
      <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayResponse(response.content);
              }}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400">
              {new Date(response.createdAt).toLocaleString()}
            </span>
          </div>
          {response.read && (
            <span className="text-xs text-green-400 px-2 py-1 rounded-full bg-green-400/10">
              Read
            </span>
          )}
        </div>
        <div className="space-y-2">
          {response.content.map((text, idx) => (
            <p key={idx} className="text-gray-200 border-l-2 border-gray-700 pl-3">
              {text}
            </p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Saved Prompts & Responses</h2>
      {bookmarks.map(bookmark => (
        <div
          key={bookmark.id}
          className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
        >
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700"
            onClick={() => toggleBookmark(bookmark.id)}
          >
            <div className="flex items-center gap-2 flex-1">
              {expandedBookmarks.has(bookmark.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
              {editingBookmark === bookmark.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-2 py-1 bg-gray-700 text-gray-100 border border-gray-600 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 text-gray-100">{bookmark.prompt}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editingBookmark === bookmark.id ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(bookmark.id);
                  }}
                  className="p-2 text-green-400 hover:text-green-300"
                >
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(bookmark);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(bookmark);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-300"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          {expandedBookmarks.has(bookmark.id) && (
            <div className="border-t border-gray-700">
              {bookmark.responses.length > 0 ? (
                <div className="p-4 space-y-4">
                  {bookmark.responses.map(response => (
                    <div
                      key={response.id}
                      onClick={() => handleResponseClick(bookmark.id, response.id, response.content)}
                      className={`cursor-pointer transition-colors rounded-lg ${
                        selectedResponse === response.id
                          ? 'ring-2 ring-blue-500'
                          : 'hover:bg-gray-700'
                      }`}
                    >
                      {renderResponseContent(response)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No responses yet
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookmarkList;