import React, { useEffect } from 'react';
import {
  X,
  Heart,
  Eye,
  ExternalLink,
  Download,
  Share2,
  Calendar,
  User as UserIcon,
  Layers,
  GraduationCap,
  Flag,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Video,
  Globe,
  Presentation,
  FileCode,
  Box,
  CheckCircle,
} from 'lucide-react';
import { Resource, MediaType } from '../types';
import { useAuth } from '../context/AuthContext';
import { recordResourceView } from '../services/resourceService';

interface ResourceDetailModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (resource: Resource) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onReport?: (resource: Resource) => void;
  onTogglePublished?: (resource: Resource) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
  onReport,
  onTogglePublished,
}) => {
  const { user, isModerator } = useAuth();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen && resource) {
      recordResourceView(resource.id);
    }
  }, [isOpen, resource?.id]);

  if (!isOpen || !resource) return null;

  const isAuthor = user && user.uid === resource.authorId;
  const canEdit = isAuthor || isModerator;
  const canDelete = isAuthor || isModerator;

  // Extract YouTube embed URL if applicable
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const youtubeEmbedUrl = resource.mediaType === 'video' ? getYouTubeEmbedUrl(resource.url) : null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-blue-100 text-blue-800">
              {resource.mediaType}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200/70 text-slate-700">
              {resource.category}
            </span>
            {!resource.isPublished && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <Lock className="w-3.5 h-3.5" /> ซ่อนจากสาธารณะ
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="แชร์ลิงก์สื่อนี้"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {resource.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">{resource.authorName}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(resource.createdAt)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{resource.viewsCount || 0} ครั้ง</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>{resource.favoritesCount || 0} คน</span>
              </span>
            </div>
          </div>

          {/* Video Player Embed (if YouTube or valid video embed) */}
          {youtubeEmbedUrl && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-black shadow-md border border-slate-200">
              <iframe
                src={youtubeEmbedUrl}
                title={resource.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              รายละเอียดเนื้อหา
            </h4>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {resource.description}
            </div>
          </div>

          {/* Attached File or External Link Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              แหล่งที่มาและไฟล์แนบ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-blue-950">เปิดเว็บไซต์ / แหล่งข้อมูลภายนอก</p>
                      <p className="text-[11px] text-blue-700 truncate">{resource.url}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {resource.attachmentUrl && (
                <a
                  href={resource.attachmentUrl}
                  download={resource.attachmentName || 'resource-attachment'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-emerald-950">ดาวน์โหลด / ดูเอกสารแนบ</p>
                      <p className="text-[11px] text-emerald-700 truncate">{resource.attachmentName || 'ไฟล์แนบ'}</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-600 shrink-0 ml-2 group-hover:translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                แท็กคำสำคัญ
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Moderator Actions Toolbar */}
          {isModerator && (
            <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-indigo-950">
                <span>การจัดการโดยผู้ดูแลระบบ (Moderator Panel)</span>
                <span className="text-indigo-600 font-mono text-[10px]">ID: {resource.id}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {onTogglePublished && (
                  <button
                    onClick={() => onTogglePublished(resource)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-800 rounded-xl hover:bg-indigo-100 font-medium"
                  >
                    {resource.isPublished ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span>ซ่อนสื่อนี้จากสาธารณะ</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>เผยแพร่สื่อสู่สาธารณะ</span>
                      </>
                    )}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(resource)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl hover:bg-rose-100 font-medium ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบสื่อนี้ถาวร</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(resource)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isFavorite
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              <span>{isFavorite ? 'อยู่ในรายการโปรดแล้ว' : 'บันทึกรายการโปรด'}</span>
            </button>

            {onReport && (
              <button
                onClick={() => onReport(resource)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs sm:text-sm font-medium transition-all"
              >
                <Flag className="w-4 h-4" />
                <span className="hidden sm:inline">รายงาน</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(resource)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-all"
              >
                <Edit2 className="w-4 h-4" />
                <span>แก้ไข</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-all"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
