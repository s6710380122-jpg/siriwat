import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  FileText,
  Video,
  Globe,
  Presentation,
  FileCode,
  Box,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { MediaType } from '../types';

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedGradeLevel: string;
  selectedMediaType: MediaType | 'all';
  sortBy: 'newest' | 'views' | 'favorites' | 'title';
}

interface HeroSearchProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const { settings } = useSettings();

  const mediaTypeOptions: { id: MediaType | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'ทั้งหมด', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'pdf', label: 'PDF', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'video', label: 'วิดีโอ', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'website', label: 'เว็บไซต์/แอป', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'slide', label: 'สไลด์/PPT', icon: <Presentation className="w-3.5 h-3.5" /> },
    { id: 'document', label: 'ใบงาน/ชีท', icon: <FileCode className="w-3.5 h-3.5" /> },
  ];

  const hasActiveFilters =
    filters.searchQuery ||
    filters.selectedCategory !== 'all' ||
    filters.selectedGradeLevel !== 'all' ||
    filters.selectedMediaType !== 'all' ||
    filters.sortBy !== 'newest';

  return (
    <div className="relative bg-gradient-to-b from-blue-900 via-blue-800 to-sky-900 text-white pt-8 pb-10 sm:pt-12 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-inner overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/4 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-4">
        {/* Subtitle pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-sky-200 text-xs sm:text-sm font-medium backdrop-blur-xs">
          <Sparkles className="w-4 h-4 text-sky-300" />
          <span>ระบบคลังสื่อดิจิทัลและแหล่งเรียนรู้เปิดเพื่อทุกคน</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          ค้นหาและแบ่งปัน <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-blue-200">สื่อการเรียนรู้คุณภาพ</span>
        </h1>
        <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto font-normal">
          {settings.siteDescription || 'แหล่งรวมบทเรียน เอกสารสรุป สไลด์ และเครื่องมือการเรียนรู้ทุกระดับชั้น'}
        </p>

        {/* Large Search Box */}
        <div className="pt-2 max-w-2xl mx-auto">
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-blue-950/20 border-2 border-white/80 focus-within:border-sky-400 transition-all p-1.5 sm:p-2">
            <div className="pl-3 pr-2 text-blue-600">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="ค้นหาชื่อเรื่อง คำสำคัญ แท็ก หรือชื่อผู้สอน..."
              className="w-full py-2.5 sm:py-3 pr-8 text-slate-800 text-sm sm:text-base placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors mr-1"
                title="ล้างข้อความค้นหา"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {}}
              className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-600/30 shrink-0"
            >
              <span>ค้นหา</span>
            </button>
          </div>
        </div>

        {/* Quick Media Type Pills */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {mediaTypeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onFilterChange({ selectedMediaType: opt.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                filters.selectedMediaType === opt.id
                  ? 'bg-white text-blue-900 shadow-md font-semibold scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Sorting Controls Bar */}
      <div className="relative max-w-5xl mx-auto mt-6 pt-5 border-t border-white/15">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-white/80 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-300" />
              <span>หมวดหมู่วิชา</span>
            </label>
            <select
              value={filters.selectedCategory}
              onChange={(e) => onFilterChange({ selectedCategory: e.target.value })}
              className="w-full bg-blue-950/70 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-300 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">ทุกหมวดหมู่วิชา</option>
              {settings.categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Level Dropdown */}
          <div className="space-y-1">
            <label className="text-white/80 font-medium flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-sky-300" />
              <span>ระดับชั้น</span>
            </label>
            <select
              value={filters.selectedGradeLevel}
              onChange={(e) => onFilterChange({ selectedGradeLevel: e.target.value })}
              className="w-full bg-blue-950/70 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-300 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">ทุกระดับชั้น</option>
              {settings.gradeLevels.map((grade) => (
                <option key={grade} value={grade} className="bg-slate-900 text-white">
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-1">
            <label className="text-white/80 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-300" />
              <span>จัดเรียงตาม</span>
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as 'newest' | 'views' | 'favorites' | 'title',
                })
              }
              className="w-full bg-blue-950/70 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-300 appearance-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-white">เผยแพร่ล่าสุด</option>
              <option value="views" className="bg-slate-900 text-white">ยอดเข้าชมมากที่สุด</option>
              <option value="favorites" className="bg-slate-900 text-white">รายการโปรดมากที่สุด</option>
              <option value="title" className="bg-slate-900 text-white">ชื่อสื่อการสอน (ก - ฮ)</option>
            </select>
          </div>

          {/* Results Count & Clear Button */}
          <div className="flex items-end justify-between sm:justify-end gap-2 pt-2 sm:pt-0">
            {hasActiveFilters ? (
              <button
                onClick={onResetFilters}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-medium transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>ล้างตัวกรอง</span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-center px-3 py-2 bg-white/5 border border-white/10 text-white/80 rounded-xl text-xs">
                <span>พบ {totalResults} รายการ</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
