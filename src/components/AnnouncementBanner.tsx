import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AnnouncementBanner: React.FC = () => {
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!settings.announcement || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white px-4 py-2.5 shadow-sm text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="shrink-0 p-1 bg-white/20 rounded-md">
            <Bell className="w-4 h-4 text-white animate-bounce" />
          </span>
          <p className="font-medium text-xs sm:text-sm truncate">
            <span className="font-bold underline decoration-sky-300 mr-2">ประกาศ:</span>
            {settings.announcement}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title="ปิดประกาศ"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
