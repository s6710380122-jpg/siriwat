import React from 'react';
import { BookOpen, SearchX, PlusCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  type?: 'search' | 'favorites' | 'my-resources' | 'default';
  onAction?: () => void;
  actionLabel?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  onAction,
  actionLabel,
  onReset,
}) => {
  const getDetails = () => {
    switch (type) {
      case 'search':
        return {
          icon: <SearchX className="w-12 h-12 text-blue-500" />,
          title: 'ไม่พบสื่อการเรียนรู้ที่ตรงกับคำค้นหาหรือตัวกรอง',
          description: 'ลองเปลี่ยนคำค้นหา ปรับหมวดหมู่วิชา หรือรีเซ็ตตัวกรองเพื่อดูสื่อการเรียนรู้อื่นๆ',
        };
      case 'favorites':
        return {
          icon: <BookOpen className="w-12 h-12 text-rose-500" />,
          title: 'ยังไม่มีรายการโปรด',
          description: 'คุณสามารถกดรูปหัวใจที่การ์ดสื่อการเรียนรู้ที่สนใจ เพื่อบันทึกไว้อ่านหรือทบทวนได้ทุกเมื่อ',
        };
      case 'my-resources':
        return {
          icon: <PlusCircle className="w-12 h-12 text-sky-500" />,
          title: 'คุณยังไม่ได้เผยแพร่สื่อการเรียนรู้ใดๆ',
          description: 'ร่วมเป็นส่วนหนึ่งในการแบ่งปันความรู้ เอกสารสรุป หรือคลิปวิดีโอที่มีประโยชน์เพื่อการศึกษา',
        };
      default:
        return {
          icon: <BookOpen className="w-12 h-12 text-blue-500" />,
          title: 'ยังไม่มีข้อมูลสื่อการเรียนรู้ในหมวดนี้',
          description: 'สามารถเริ่มต้นโพสต์สื่อการเรียนรู้แรกเพื่อสร้างคลังความรู้แห่งนี้ได้เลย',
        };
    }
  };

  const details = getDetails();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto my-6 animate-in fade-in duration-200">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-4 shadow-inner">
        {details.icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">{details.title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {details.description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        )}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
