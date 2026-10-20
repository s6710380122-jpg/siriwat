import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs sm:text-sm text-slate-500 py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-x-auto whitespace-nowrap">
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium transition-colors"
      >
        <Home className="w-4 h-4 text-slate-400" />
        <span>หน้าหลัก</span>
      </button>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300 shrink-0" />
          {item.onClick && !item.active ? (
            <button
              onClick={item.onClick}
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={`truncate max-w-[200px] sm:max-w-xs ${item.active ? 'text-blue-800 font-semibold' : 'text-slate-500'}`}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
