import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ModerationLogItem, ReportItem, ReportStatus, UserProfile, UserRole, UserStatus } from '../types';

// Subscribe to reports
export function subscribeToReports(callback: (reports: ReportItem[]) => void) {
  const collRef = collection(db, 'reports');
  return onSnapshot(
    collRef,
    (snapshot) => {
      const list: ReportItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ReportItem, 'id'>),
      }));
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      console.warn('Reports subscription error:', err);
    }
  );
}

// Update report status
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  adminUid: string
): Promise<void> {
  const docRef = doc(db, 'reports', reportId);
  try {
    await updateDoc(docRef, {
      status,
      resolvedAt: new Date().toISOString(),
      resolvedBy: adminUid,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
  }
}

// Subscribe to all users
export function subscribeToUsers(callback: (users: UserProfile[]) => void) {
  const collRef = collection(db, 'users');
  return onSnapshot(
    collRef,
    (snapshot) => {
      const list: UserProfile[] = snapshot.docs.map((docSnap) => ({
        uid: docSnap.id,
        ...(docSnap.data() as Omit<UserProfile, 'uid'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('Users subscription error:', err);
    }
  );
}

// Update user role or status
export async function updateUserAccount(
  targetUid: string,
  updates: { role?: 'member' | 'moderator' | 'admin'; status?: UserStatus },
  moderatorUid: string,
  moderatorName: string,
  reason?: string
): Promise<void> {
  const userDocRef = doc(db, 'users', targetUid);
  try {
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // If role changed to admin or removed, update admins collection
    if (updates.role === 'admin') {
      await setDoc(doc(db, 'admins', targetUid), {
        uid: targetUid,
        role: 'admin',
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } else if (updates.role) {
      try {
        await deleteDoc(doc(db, 'admins', targetUid));
      } catch (e) {
        // Safe to ignore if didn't exist
      }
    }

    // Add moderation audit log
    await addModerationLog({
      action: `ปรับปรุงบัญชีผู้ใช้: ${updates.role ? `เปลี่ยนสิทธิ์เป็น ${updates.role}` : ''} ${updates.status ? `สถานะเป็น ${updates.status}` : ''}`,
      targetType: 'user',
      targetId: targetUid,
      performedBy: moderatorUid,
      performedByName: moderatorName,
      reason: reason || 'การดำเนินการโดยผู้ดูแลระบบ',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

// Log moderation action
export async function addModerationLog(
  log: Omit<ModerationLogItem, 'id' | 'timestamp'>
): Promise<void> {
  const collRef = collection(db, 'moderationLogs');
  const docRef = doc(collRef);
  try {
    await setDoc(docRef, {
      ...log,
      id: docRef.id,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to record moderation log:', err);
  }
}

// Subscribe to moderation logs
export function subscribeToModerationLogs(callback: (logs: ModerationLogItem[]) => void) {
  const collRef = collection(db, 'moderationLogs');
  return onSnapshot(
    collRef,
    (snapshot) => {
      const list: ModerationLogItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ModerationLogItem, 'id'>),
      }));
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(list);
    },
    (err) => {
      console.warn('Logs subscription error:', err);
    }
  );
}
