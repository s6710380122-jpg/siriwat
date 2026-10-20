export type UserRole = 'guest' | 'member' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'member' | 'moderator' | 'admin';
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type MediaType = 'pdf' | 'video' | 'website' | 'slide' | 'document' | 'other';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  gradeLevel: string;
  mediaType: MediaType;
  url?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  tags?: string[];
  authorId: string;
  authorName: string;
  authorEmail?: string;
  isPublished: boolean;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  resourceId: string;
  createdAt: string;
}

export type ReportReason =
  | 'broken_link'
  | 'copyright'
  | 'inappropriate'
  | 'inaccurate'
  | 'spam'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface ReportItem {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reporterId: string;
  reporterEmail?: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ModerationLogItem {
  id: string;
  action: string;
  targetType: 'resource' | 'user' | 'report' | 'settings';
  targetId: string;
  performedBy: string;
  performedByName: string;
  reason?: string;
  timestamp: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  announcement?: string;
  categories: string[];
  gradeLevels: string[];
  mediaTypes: string[];
  logoUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}
