import React from 'react';
import {
  Folder,
  Layers,
  GraduationCap,
  BookOpen,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { Resource } from '../types';

interface SidebarCategoriesProps {
  resources: Resource[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedGradeLevel: string;
  onSelectGradeLevel: (grade: string) => void;
}

export const SidebarCategories: React.FC<SidebarCategoriesProps> = ({
  resources,
  selectedCategory,
  onSelectCategory,
  selectedGradeLevel,
  onSelectGradeLevel,
}) => {
  const { settings } = useSettings();

  // Compute counts for categories
  const categoryCounts = settings.categories.reduce((acc, cat) => {
    acc[cat] = resources.filter((r) => r.category === cat && r.isPublished).length;
    return acc;
  }, {} as Record<string, number>);

  const totalPublished = resources.filter((r) => r.isPublished).length;

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Category List Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>หมวดหมู่วิชา</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">{settings.categories.length} หมวด</span>
        </div>

        <div className="mt-3 space-y-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">ทุกหมวดหมู่วิชา</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {totalPublished}
            </span>
          </button>

          {settings.categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-2 truncate text-left">
                  <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{cat}</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Levels Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <GraduationCap className="w-4 h-4 text-sky-600" />
            <span>ระดับชั้นการศึกษา</span>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <button
            onClick={() => onSelectGradeLevel('all')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              selectedGradeLevel === 'all'
                ? 'bg-sky-50 text-sky-800 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            ทุกระดับชั้น
          </button>
          {settings.gradeLevels.map((grade) => {
            const isSelected = selectedGradeLevel === grade;
            return (
              <button
                key={grade}
                onClick={() => onSelectGradeLevel(grade)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all truncate ${
                  isSelected
                    ? 'bg-sky-50 text-sky-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {grade}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Community Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-100 p-5 text-slate-700 space-y-2.5">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>EduHub Community</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          ร่วมแบ่งปันสื่อการสอน ชีทสรุป หรือวิดีโอบทเรียนเพื่อสร้างสังคมแห่งการเรียนรู้ร่วมกัน
        </p>
        <div className="pt-2 border-t border-blue-200/50 flex items-center gap-2 text-[11px] text-blue-700 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>สื่อการเรียนรู้ใหม่ทุกวัน</span>
        </div>
      </div>
    </aside>
  );
};
