import React from 'react';
import {
  FileText,
  Video,
  Globe,
  Presentation,
  FileCode,
  Box,
  Heart,
  Eye,
  ExternalLink,
  MoreVertical,
  Flag,
  Edit2,
  Trash2,
  Lock,
  User as UserIcon,
} from 'lucide-react';
import { Resource, MediaType } from '../types';
import { useAuth } from '../context/AuthContext';

interface ResourceCardProps {
  resource: Resource;
  isFavorite: boolean;
  onToggleFavorite: (resource: Resource) => void;
  onOpenDetail: (resource: Resource) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onReport?: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
  onEdit,
  onDelete,
  onReport,
}) => {
  const { user, isModerator } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isAuthor = user && user.uid === resource.authorId;
  const canEdit = isAuthor || isModerator;
  const canDelete = isAuthor || isModerator;

  // Media icon & color helper
  const getMediaMeta = (type: MediaType) => {
    switch (type) {
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-rose-600" />,
          label: 'PDF',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'video':
        return {
          icon: <Video className="w-5 h-5 text-sky-600" />,
          label: 'วิดีโอ',
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'website':
        return {
          icon: <Globe className="w-5 h-5 text-emerald-600" />,
          label: 'เว็บไซต์/แอป',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'slide':
        return {
          icon: <Presentation className="w-5 h-5 text-amber-600" />,
          label: 'สไลด์/PPT',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'document':
        return {
          icon: <FileCode className="w-5 h-5 text-indigo-600" />,
          label: 'ใบงาน/ชีท',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      default:
        return {
          icon: <Box className="w-5 h-5 text-slate-600" />,
          label: 'สื่อทั่วไป',
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const mediaMeta = getMediaMeta(resource.mediaType);

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Banner & Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          {/* Media Type Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${mediaMeta.bg}`}
            >
              {mediaMeta.icon}
              <span>{mediaMeta.label}</span>
            </span>

            {!resource.isPublished && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>ซ่อนอยู่</span>
              </span>
            )}
          </div>

          {/* Quick Actions & Favorite Button */}
          <div className="flex items-center gap-1 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(resource);
              }}
              title={isFavorite ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
              className={`p-1.5 rounded-lg transition-all ${
                isFavorite
                  ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-rose-500 scale-110' : ''}`}
              />
            </button>

            {/* Overflow menu for reports & edits */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="ตัวเลือกเพิ่มเติม"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-40 py-1 text-xs divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95 duration-100">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onOpenDetail(resource);
                        }}
                        className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>ดูรายละเอียด</span>
                      </button>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>เปิดลิงก์ภายนอก</span>
                        </a>
                      )}
                    </div>

                    {(canEdit || canDelete) && (
                      <div className="py-1">
                        {canEdit && onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(false);
                              onEdit(resource);
                            }}
                            className="w-full text-left px-3 py-1.5 text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>แก้ไขสื่อ</span>
                          </button>
                        )}
                        {canDelete && onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(false);
                              onDelete(resource);
                            }}
                            className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบสื่อนี้</span>
                          </button>
                        )}
                      </div>
                    )}

                    {onReport && (
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            onReport(resource);
                          }}
                          className="w-full text-left px-3 py-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2"
                        >
                          <Flag className="w-3.5 h-3.5 text-slate-400" />
                          <span>รายงานความไม่เหมาะสม</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenDetail(resource)}
          className="font-bold text-slate-900 group-hover:text-blue-600 text-base leading-snug line-clamp-2 cursor-pointer transition-colors"
        >
          {resource.title}
        </h3>

        {/* Description snippet */}
        <p className="mt-2 text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Category & Grade chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {resource.category}
          </span>
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
            {resource.gradeLevel}
          </span>
        </div>
      </div>

      {/* Card Footer: Author & Stats */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 truncate max-w-[170px]">
          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
            {resource.authorName[0]?.toUpperCase() || 'U'}
          </div>
          <span className="truncate text-slate-700 font-medium">{resource.authorName}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-slate-500" title="ยอดเข้าชม">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{resource.viewsCount || 0}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-rose-500 font-medium" title="ถูกใจ">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>{resource.favoritesCount || 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
