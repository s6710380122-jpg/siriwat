import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Paperclip,
  Tag,
} from 'lucide-react';
import { Resource, MediaType } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Resource>) => Promise<void>;
  initialData?: Resource | null;
}

export const ResourceFormModal: React.FC<ResourceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { settings } = useSettings();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('pdf');
  const [url, setUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || settings.categories[0] || 'คอมพิวเตอร์และเทคโนโลยี');
      setGradeLevel(initialData.gradeLevel || settings.gradeLevels[0] || 'ทุกระดับชั้น');
      setMediaType(initialData.mediaType || 'pdf');
      setUrl(initialData.url || '');
      setAttachmentName(initialData.attachmentName || '');
      setAttachmentUrl(initialData.attachmentUrl || '');
      setTags(initialData.tags || []);
      setIsPublished(initialData.isPublished !== undefined ? initialData.isPublished : true);
    } else {
      setTitle('');
      setDescription('');
      setCategory(settings.categories[0] || 'คอมพิวเตอร์และเทคโนโลยี');
      setGradeLevel(settings.gradeLevels[0] || 'ทุกระดับชั้น');
      setMediaType('pdf');
      setUrl('');
      setAttachmentName('');
      setAttachmentUrl('');
      setTags([]);
      setIsPublished(true);
    }
    setError(null);
  }, [initialData, isOpen, settings]);

  if (!isOpen) return null;

  // Handle file attachment via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError('ขนาดไฟล์ใหญ่เกินกำหนด (จำกัดไม่เกิน 4MB สำหรับการพรีวิวโดยตรง)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentUrl(reader.result as string);
      setAttachmentName(file.name);
      setError(null);
    };
    reader.onerror = () => {
      setError('เกิดข้อผิดพลาดในการอ่านไฟล์');
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean) && tags.length < 10) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (title.trim().length < 3) {
      setError('กรุณาระบุชื่อสื่อการเรียนรู้อย่างน้อย 3 ตัวอักษร');
      return;
    }
    if (description.trim().length < 10) {
      setError('กรุณากรอกคำอธิบายสื่อการเรียนรู้อย่างน้อย 10 ตัวอักษร เพื่อให้เข้าใจเนื้อหา');
      return;
    }
    if (!category) {
      setError('กรุณาเลือกหมวดหมู่วิชา');
      return;
    }
    if (!url.trim() && !attachmentUrl) {
      setError('กรุณาระบุลิงก์ภายนอก หรือแนบไฟล์เอกสารอย่างน้อย 1 รายการ');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        gradeLevel: gradeLevel || 'ทุกระดับชั้น',
        mediaType,
        url: url.trim() || undefined,
        attachmentUrl: attachmentUrl || undefined,
        attachmentName: attachmentName || undefined,
        tags,
        isPublished,
        authorId: user?.uid || 'guest',
        authorName: user?.displayName || user?.email?.split('@')[0] || 'ผู้ใช้งาน',
        authorEmail: user?.email || '',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-sky-50">
          <div>
            <h3 className="text-lg font-bold text-blue-950">
              {initialData ? 'แก้ไขสื่อการเรียนรู้' : 'โพสต์สื่อการเรียนรู้ใหม่'}
            </h3>
            <p className="text-xs text-slate-500">
              กรอกข้อมูลเพื่อแบ่งปันให้กับนักเรียน ครู และผู้สนใจทั่วไป
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2.5 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>ชื่อสื่อการเรียนรู้ / หัวข้อบทเรียน <span className="text-rose-500">*</span></span>
              <span className="text-slate-400 font-normal">{title.length}/200</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น รวมสรุปสูตรฟิสิกส์ ม.ปลาย, คลิปสอนแคลคูลัส 1..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 transition-all"
            />
          </div>

          {/* Category & Grade Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                หมวดหมู่วิชา <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white"
              >
                {settings.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                ระดับชั้นเป้าหมาย
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white"
              >
                {settings.gradeLevels.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Media Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ประเภทของสื่อ <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              {[
                { id: 'pdf', label: 'PDF' },
                { id: 'video', label: 'วิดีโอ' },
                { id: 'website', label: 'เว็บไซต์' },
                { id: 'slide', label: 'สไลด์' },
                { id: 'document', label: 'ใบงาน' },
                { id: 'other', label: 'อื่นๆ' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMediaType(m.id as MediaType)}
                  className={`py-2 px-1 rounded-xl font-semibold border transition-all text-center ${
                    mediaType === m.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* External URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>ลิงก์เว็บไซต์ / YouTube / แหล่งข้อมูลภายนอก</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/... หรือ https://docs.google.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 transition-all"
            />
          </div>

          {/* File Attachment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
              <span>แนบไฟล์เอกสาร / ชีทสรุป (ไม่เกิน 4MB)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>{attachmentName ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์จากเครื่อง'}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                  className="hidden"
                />
              </label>
              {attachmentName ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium truncate bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="truncate">{attachmentName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentName('');
                      setAttachmentUrl('');
                    }}
                    className="text-slate-400 hover:text-rose-500 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400">รองรับ PDF, Office, รูปภาพ</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>คำอธิบายเนื้อหาและคำแนะนำการเรียนรู้ <span className="text-rose-500">*</span></span>
              <span className="text-slate-400 font-normal">{description.length}/2000</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="สรุปสาระสำคัญของสื่อการสอนนี้ จุดเด่น หรือแนวทางการนำไปประยุกต์ใช้..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>แท็กคำสำคัญ (กด Enter เพื่อเพิ่มแท็ก)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="เช่น แคลคูลัส, สอบเข้า, กสพท"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 text-sm text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shrink-0"
              >
                เพิ่มแท็ก
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-400 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Publish Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800">สถานะการเผยแพร่</p>
              <p className="text-[11px] text-slate-500">
                หากปิดไว้ สื่อนี้จะแสดงเฉพาะในหน้า สื่อของฉัน เท่านั้น
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? 'บันทึกการแก้ไข' : 'เผยแพร่สื่อ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
