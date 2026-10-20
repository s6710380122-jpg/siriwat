import React, { useState } from 'react';
import { X, Flag, AlertCircle, Loader2 } from 'lucide-react';
import { ReportReason, Resource } from '../types';

interface ReportModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => Promise<void>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  resource,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<ReportReason>('broken_link');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !resource) return null;

  const reasonOptions: { id: ReportReason; label: string; desc: string }[] = [
    { id: 'broken_link', label: 'ลิงก์เสีย / ไฟล์ดาวน์โหลดไม่ได้', desc: 'ไม่สามารถเข้าถึงเว็บไซต์หรือดาวน์โหลดไฟล์ได้' },
    { id: 'copyright', label: 'ละเมิดลิขสิทธิ์ / สิทธิทางปัญญา', desc: 'นำผลงานของผู้อื่นมาเผยแพร่โดยไม่ได้รับอนุญาต' },
    { id: 'inappropriate', label: 'เนื้อหาไม่เหมาะสม / หยาบคาย', desc: 'มีภาพ ข้อความ หรือภาษาที่ขัดต่อความสงบเรียบร้อย' },
    { id: 'inaccurate', label: 'เนื้อหาไม่ถูกต้อง / บิดเบือน', desc: 'ข้อมูลทางวิชาการผิดพลาดอย่างมีนัยสำคัญ' },
    { id: 'spam', label: 'โฆษณา / สแปม / หลอกลวง', desc: 'ไม่ใช่สื่อการเรียนรู้ หรือมีเจตนาโปรโมตเชิงพาณิชย์แอบแฝง' },
    { id: 'other', label: 'ปัญหาอื่นๆ', desc: 'โปรดระบุรายละเอียดเพิ่มเติม' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(reason, details.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งรายงาน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
            <Flag className="w-5 h-5 text-rose-600" />
            <span>รายงานเนื้อหาสื่อการสอน</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold text-slate-900 block truncate">ชื่อสื่อ: {resource.title}</span>
            <span className="text-slate-500 font-mono text-[11px]">ID: {resource.id}</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              สาเหตุที่รายงาน <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              {reasonOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    reason === opt.id
                      ? 'border-rose-400 bg-rose-50/50 text-rose-950'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt.id}
                    checked={reason === opt.id}
                    onChange={() => setReason(opt.id)}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[11px] text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              รายละเอียดเพิ่มเติม (ทางเลือก)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="ระบุจุดที่พบปัญหาหรือข้อมูลที่ช่วยให้ผู้ดูแลตรวจสอบได้รวดเร็วขึ้น..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-400 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-600/20 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>ส่งรายงาน</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
