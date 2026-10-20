import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  increment,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { FavoriteItem, MediaType, ReportItem, ReportReason, Resource } from '../types';

export const INITIAL_SEED_RESOURCES: Omit<Resource, 'id'>[] = [
  {
    title: 'คู่มือการเขียนโปรแกรม Python สำหรับผู้เริ่มต้นและวิทยาการคำนวณ',
    description: 'เอกสารสรุปไวยากรณ์ Python พื้นฐาน ตัวแปร ลูป ฟังก์ชัน และตัวอย่างการแก้โจทย์วิทยาการคำนวณระดับ ม.ต้น - ม.ปลาย',
    category: 'คอมพิวเตอร์และเทคโนโลยี',
    gradeLevel: 'มัธยมศึกษาตอนปลาย (ม.4 - ม.6)',
    mediaType: 'pdf',
    url: 'https://docs.python.org/3/tutorial/',
    attachmentName: 'python-beginner-guide.pdf',
    tags: ['Python', 'Coding', 'วิทยาการคำนวณ', 'เขียนโปรแกรม'],
    authorId: 'system-seed',
    authorName: 'อ. ธีรภัทร (EduHub)',
    authorEmail: 's6710380122@pkru.ac.th',
    isPublished: true,
    viewsCount: 245,
    favoritesCount: 42,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    title: 'รวมสูตรและสรุปฟิสิกส์ ม.ปลาย: การเคลื่อนที่และแรงนิวตัน',
    description: 'ชีทสรุปบทเรียนฟิสิกส์ ภาพประกอบชัดเจน สูตรลัด ตัวอย่างข้อสอบเข้ามหาวิทยาลัยพร้อมเฉลยละเอียด',
    category: 'วิทยาศาสตร์และดาราศาสตร์',
    gradeLevel: 'มัธยมศึกษาตอนปลาย (ม.4 - ม.6)',
    mediaType: 'document',
    url: 'https://www.scimath.org/',
    attachmentName: 'physics-mechanics-summary.pdf',
    tags: ['ฟิสิกส์', 'แรงและการเคลื่อนที่', 'เตรียมสอบ', 'วิทยาศาสตร์'],
    authorId: 'system-seed',
    authorName: 'ครูศศิธร วิทยาศาสตร์',
    authorEmail: 'teacher.sc@eduhub.th',
    isPublished: true,
    viewsCount: 189,
    favoritesCount: 38,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    title: 'วิดีโอสอนคณิตศาสตร์: แคลคูลัสเบื้องต้นและการประยุกต์หาอนุพันธ์',
    description: 'คลิปบรรยาย 45 นาทีเข้าใจง่าย อธิบายแนวคิดลิมิต อนุพันธ์ และการประยุกต์หาค่าสูงสุดต่ำสุดในชีวิตจริง',
    category: 'คณิตศาสตร์',
    gradeLevel: 'อุดมศึกษา / มหาวิทยาลัย',
    mediaType: 'video',
    url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
    attachmentName: '',
    tags: ['คณิตศาสตร์', 'แคลคูลัส', 'อนุพันธ์', 'มหาวิทยาลัย'],
    authorId: 'system-seed',
    authorName: 'ดร. อนุชา คณิตศาสตร์',
    authorEmail: 'anucha.math@eduhub.th',
    isPublished: true,
    viewsCount: 412,
    favoritesCount: 67,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    title: 'ไวยากรณ์ภาษาอังกฤษ 12 Tenses ฉบับจำง่าย พร้อมตัวอย่างประโยค',
    description: 'สไลด์นำเสนอสีสันสดใส สรุปโครงสร้าง 12 Tenses พร้อมหลักการจำและแบบฝึกหัดทบทวน เหมาะสำหรับผู้เรียนทุกระดับ',
    category: 'ภาษาและการสื่อสาร',
    gradeLevel: 'ทุกระดับชั้น',
    mediaType: 'slide',
    url: 'https://learnenglish.britishcouncil.org/grammar',
    attachmentName: '12-tenses-mastery.pptx',
    tags: ['English', 'Grammar', 'ภาษาอังกฤษ', 'Tenses'],
    authorId: 'system-seed',
    authorName: 'Teacher Jennifer',
    authorEmail: 'jennifer@eduhub.th',
    isPublished: true,
    viewsCount: 520,
    favoritesCount: 95,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    title: 'เว็บเครื่องมือจำลองการทดลองวิทยาศาสตร์เสมือนจริง (PhET Simulations)',
    description: 'แหล่งรวมแบบจำลองฟิสิกส์ เคมี ชีววิทยา แบบอินเทอร์แอคทีฟ สามารถทดลองผสมสาร จำลองวงจรไฟฟ้า และคลื่นแสงได้ฟรี',
    category: 'วิทยาศาสตร์และดาราศาสตร์',
    gradeLevel: 'ทุกระดับชั้น',
    mediaType: 'website',
    url: 'https://phet.colorado.edu/th/',
    tags: ['PhET', 'Interactive', 'ทดลองวิทยาศาสตร์', 'แล็บเสมือน'],
    authorId: 'system-seed',
    authorName: 'ทีมวิชาการ EduHub',
    authorEmail: 'support@eduhub.th',
    isPublished: true,
    viewsCount: 680,
    favoritesCount: 112,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    title: 'แผนภาพประวัติศาสตร์สุโขทัยและอยุธยา: สรุปเส้นเวลาเหตุการณ์สำคัญ',
    description: 'เอกสารไทม์ไลน์และแผนผังความเชื่อมโยงทางการเมือง เศรษฐกิจ และการค้าในสมัยอยุธยา ใช้เตรียมสอบ O-NET และ A-Level',
    category: 'สังคมศึกษา ประวัติศาสตร์ และวัฒนธรรม',
    gradeLevel: 'มัธยมศึกษาตอนต้น (ม.1 - ม.3)',
    mediaType: 'pdf',
    url: 'https://th.wikipedia.org/wiki/ประวัติศาสตร์ไทย',
    attachmentName: 'thai-history-timeline.pdf',
    tags: ['ประวัติศาสตร์', 'สังคมศึกษา', 'อยุธยา', 'เตรียมสอบ'],
    authorId: 'system-seed',
    authorName: 'ครูวิชัย สังคมศาสตร์',
    authorEmail: 'wichai.soc@eduhub.th',
    isPublished: true,
    viewsCount: 154,
    favoritesCount: 29,
    createdAt: new Date().toISOString(),
  },
];

// Seed initial content if collection is empty
export async function seedResourcesIfEmpty(): Promise<void> {
  try {
    const collRef = collection(db, 'resources');
    const snap = await getDocs(collRef);
    if (snap.empty) {
      for (const item of INITIAL_SEED_RESOURCES) {
        const docRef = doc(collRef);
        await setDoc(docRef, {
          ...item,
          id: docRef.id,
        });
      }
    }
  } catch (error) {
    console.warn('Initial seeding note:', error);
  }
}

// Subscribe to resources with fallback
export function subscribeToResources(
  callback: (resources: Resource[]) => void,
  onError?: (error: unknown) => void
) {
  const collRef = collection(db, 'resources');
  return onSnapshot(
    collRef,
    (snapshot) => {
      const list: Resource[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Resource, 'id'>),
      }));
      // Sort client-side by createdAt desc by default
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      console.error('Error fetching resources:', err);
      if (onError) onError(err);
    }
  );
}

// Create new resource
export async function createResource(
  data: Omit<Resource, 'id' | 'viewsCount' | 'favoritesCount' | 'createdAt'>
): Promise<string> {
  const collRef = collection(db, 'resources');
  const docRef = doc(collRef);
  const newResource: Resource = {
    ...data,
    id: docRef.id,
    viewsCount: 0,
    favoritesCount: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, newResource);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `resources/${docRef.id}`);
  }
}

// Update existing resource
export async function updateResource(
  id: string,
  updates: Partial<Resource>
): Promise<void> {
  const docRef = doc(db, 'resources', id);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `resources/${id}`);
  }
}

// Delete resource
export async function deleteResource(id: string): Promise<void> {
  const docRef = doc(db, 'resources', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `resources/${id}`);
  }
}

// Increment view count
export async function recordResourceView(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'resources', id);
    await updateDoc(docRef, {
      viewsCount: increment(1),
    });
  } catch (err) {
    // Non-blocking view increment
    console.debug('Failed to record view count:', err);
  }
}

// Subscribe to user favorites
export function subscribeToUserFavorites(
  userId: string,
  callback: (favoriteResourceIds: Set<string>) => void
) {
  const collRef = collection(db, 'favorites');
  const q = query(collRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const set = new Set<string>();
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as FavoriteItem;
        if (data.resourceId) {
          set.add(data.resourceId);
        }
      });
      callback(set);
    },
    (error) => {
      console.warn('Error subscribing to favorites:', error);
    }
  );
}

// Toggle favorite
export async function toggleResourceFavorite(
  userId: string,
  resourceId: string,
  isCurrentlyFavorite: boolean
): Promise<boolean> {
  const favoriteDocId = `${userId}_${resourceId}`;
  const favoriteDocRef = doc(db, 'favorites', favoriteDocId);
  const resourceDocRef = doc(db, 'resources', resourceId);

  try {
    if (isCurrentlyFavorite) {
      await deleteDoc(favoriteDocRef);
      try {
        await updateDoc(resourceDocRef, {
          favoritesCount: increment(-1),
        });
      } catch (e) {
        // Ignore secondary count error
      }
      return false;
    } else {
      const newFav: FavoriteItem = {
        id: favoriteDocId,
        userId,
        resourceId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(favoriteDocRef, newFav);
      try {
        await updateDoc(resourceDocRef, {
          favoritesCount: increment(1),
        });
      } catch (e) {
        // Ignore secondary count error
      }
      return true;
    }
  } catch (err) {
    handleFirestoreError(
      err,
      isCurrentlyFavorite ? OperationType.DELETE : OperationType.CREATE,
      `favorites/${favoriteDocId}`
    );
  }
}

// Submit a report
export async function submitContentReport(data: {
  resourceId: string;
  resourceTitle: string;
  reporterId: string;
  reporterEmail?: string;
  reason: ReportReason;
  details?: string;
}): Promise<void> {
  const collRef = collection(db, 'reports');
  const docRef = doc(collRef);
  const report: ReportItem = {
    ...data,
    id: docRef.id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, report);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `reports/${docRef.id}`);
  }
}
