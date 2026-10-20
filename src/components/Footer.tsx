import React from 'react';
import { GraduationCap, Heart, Shield, Database, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC<{ onSelectCategory: (cat: string) => void }> = ({ onSelectCategory }) => {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Edu<span className="text-blue-500">Hub</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm text-xs sm:text-sm">
              {settings.siteDescription ||
                'ระบบคลังความรู้และสื่อการเรียนรู้ออนไลน์ เพื่อส่งเสริมการเข้าถึงสื่อการสอนคุณภาพอย่างเปิดกว้างและเท่าเทียม'}
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                <span>ขับเคลื่อนด้วย Cloud Firestore & Auth</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>ระบบรักษาความปลอดภัยระดับองค์กร</span>
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              หมวดหมู่วิชายอดนิยม
            </h4>
            <ul className="space-y-1.5">
              {settings.categories.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* System & Support info */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              ข้อมูลระบบและการติดต่อ
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <p>ผู้ดูแลระบบ: s6710380122@pkru.ac.th</p>
              <p>สถานะเซิร์ฟเวอร์: ออนไลน์ปกติ (Vite + React)</p>
              <p>สิทธิ์การใช้งาน: 3 ระดับ (บุคคลทั่วไป, สมาชิก, ผู้ดูแล)</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} EduHub - All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            <span>พัฒนาเพื่อการศึกษาไทย ด้วย</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            <span>และเทคโนโลยี Cloud ที่ทันสมัย</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
