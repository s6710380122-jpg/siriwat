import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SiteSettings } from '../types';

export const DEFAULT_CATEGORIES = [
  'คอมพิวเตอร์และเทคโนโลยี',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และดาราศาสตร์',
  'ภาษาและการสื่อสาร',
  'สังคมศึกษา ประวัติศาสตร์ และวัฒนธรรม',
  'ศิลปะและการออกแบบ ดนตรี',
  'สุขศึกษาและพลศึกษา',
  'การงานอาชีพ ธุรกิจ และการเงิน',
  'ทักษะชีวิตและการพัฒนาตนเอง',
];

export const DEFAULT_GRADE_LEVELS = [
  'ทุกระดับชั้น',
  'ประถมศึกษา (ป.1 - ป.6)',
  'มัธยมศึกษาตอนต้น (ม.1 - ม.3)',
  'มัธยมศึกษาตอนปลาย (ม.4 - ม.6)',
  'อาชีวศึกษา / ปวช. - ปวส.',
  'อุดมศึกษา / มหาวิทยาลัย',
  'บุคคลทั่วไป / การเรียนรู้ตลอดชีวิต',
];

export const DEFAULT_MEDIA_TYPES = [
  { id: 'pdf', label: 'เอกสาร PDF', icon: 'FileText' },
  { id: 'video', label: 'วิดีโอการสอน / คอร์ส', icon: 'Video' },
  { id: 'website', label: 'เว็บไซต์ / แหล่งเรียนรู้ออนไลน์', icon: 'Globe' },
  { id: 'slide', label: 'สไลด์นำเสนอ / PowerPoint', icon: 'Presentation' },
  { id: 'document', label: 'ใบงาน / ชีทสรุป', icon: 'FileCode' },
  { id: 'other', label: 'เครื่องมือและแอปพลิเคชัน', icon: 'Box' },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'EduHub คลังความรู้และสื่อการเรียนรู้',
  siteDescription: 'ศูนย์รวมสื่อการสอน แหล่งเรียนรู้ออนไลน์ ใบงาน และคลังความรู้สำหรับนักเรียน ครู และผู้สนใจทั่วไป',
  announcement: 'ยินดีต้อนรับสู่ EduHub แหล่งแบ่งปันและค้นหาสื่อการเรียนการสอนคุณภาพเพื่อการศึกษาไทย',
  categories: DEFAULT_CATEGORIES,
  gradeLevels: DEFAULT_GRADE_LEVELS,
  mediaTypes: DEFAULT_MEDIA_TYPES.map((m) => m.id),
  logoUrl: '',
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>, updatedByUserId: string) => Promise<void>;
  addCategory: (categoryName: string, updatedByUserId: string) => Promise<void>;
  removeCategory: (categoryName: string, updatedByUserId: string) => Promise<void>;
  editCategory: (oldName: string, newName: string, updatedByUserId: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'general');

    const unsubscribe = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<SiteSettings>;
          setSettings({
            siteName: data.siteName || DEFAULT_SETTINGS.siteName,
            siteDescription: data.siteDescription || DEFAULT_SETTINGS.siteDescription,
            announcement: data.announcement !== undefined ? data.announcement : DEFAULT_SETTINGS.announcement,
            categories: data.categories && data.categories.length > 0 ? data.categories : DEFAULT_SETTINGS.categories,
            gradeLevels: data.gradeLevels && data.gradeLevels.length > 0 ? data.gradeLevels : DEFAULT_SETTINGS.gradeLevels,
            mediaTypes: data.mediaTypes && data.mediaTypes.length > 0 ? data.mediaTypes : DEFAULT_SETTINGS.mediaTypes,
            logoUrl: data.logoUrl || '',
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          });
        } else {
          // Document does not exist yet; use defaults and attempt background creation
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Error reading settings from Firestore, using default values:', error);
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>, updatedByUserId: string) => {
    const settingsDocRef = doc(db, 'settings', 'general');
    const merged: SiteSettings = {
      ...settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedByUserId,
    };
    try {
      await setDoc(settingsDocRef, merged, { merge: true });
      setSettings(merged);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
    }
  };

  const addCategory = async (categoryName: string, updatedByUserId: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed || settings.categories.includes(trimmed)) return;
    const newCats = [...settings.categories, trimmed];
    await updateSettings({ categories: newCats }, updatedByUserId);
  };

  const removeCategory = async (categoryName: string, updatedByUserId: string) => {
    const newCats = settings.categories.filter((c) => c !== categoryName);
    await updateSettings({ categories: newCats }, updatedByUserId);
  };

  const editCategory = async (oldName: string, newName: string, updatedByUserId: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const newCats = settings.categories.map((c) => (c === oldName ? trimmed : c));
    await updateSettings({ categories: newCats }, updatedByUserId);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        addCategory,
        removeCategory,
        editCategory,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
