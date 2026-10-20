# Security Specification: EduHub Knowledge & Learning Media Hub

## 1. Data Invariants

1. **Role Integrity & Privilege Escalation Prevention**:
   - Only existing Admins (verified in `/admins/{uid}`) can change user roles (`role`) or account status (`status`).
   - Normal users cannot register as `admin` or `moderator` upon creation; role must be strictly `member` by default unless explicitly seeded or created by an admin.
   - Bootstrapped admin email `s6710380122@pkru.ac.th` has full administrative authority.

2. **Resource Authorship & Tampering Invariant**:
   - A resource cannot be created with an `authorId` different from `request.auth.uid`.
   - Normal members can only update or delete their own resources.
   - Admins/Moderators can update (`isPublished`) or delete any resource to remove harmful/copyrighted media.
   - Authors cannot modify their immutable `authorId`, `createdAt`.

3. **Favorite Integrity**:
   - A favorite document ID MUST follow `{userId}_{resourceId}` pattern or enforce `incoming().userId == request.auth.uid`.
   - Users cannot create or delete favorites on behalf of other users.

4. **Report System Invariant**:
   - Reports can be submitted by authenticated users, setting `reporterId == request.auth.uid`.
   - Only Admins and Moderators can view all reports, update report status (`pending` -> `reviewed` / `dismissed`), or delete reports.

5. **Site Settings & Moderation Logs**:
   - `settings/general` can only be updated by Admins. Public can read site settings.
   - `moderationLogs` are append-only by Admins/Moderators and can only be read by Admins.

---

## 2. The "Dirty Dozen" Payloads (Red Team Attack Scenarios)

1. **Payload 1 (Self-Role Elevation)**: User attempts `setDoc(/users/attackerUid, { role: "admin", status: "active", ... })`. Expected: `PERMISSION_DENIED`.
2. **Payload 2 (Ghost Field Injection)**: User updates their own profile with `isSuperAdmin: true`. Expected: `PERMISSION_DENIED`.
3. **Payload 3 (Resource Author Spoofing)**: Attacker attempts `setDoc(/resources/res1, { authorId: "victimUid", ... })`. Expected: `PERMISSION_DENIED`.
4. **Payload 4 (Resource Hijacking / Update Other's Media)**: User B attempts to edit User A's resource title or description. Expected: `PERMISSION_DENIED`.
5. **Payload 5 (Unauthenticated Resource Write)**: Anonymous / unauthenticated guest attempts to create a resource document. Expected: `PERMISSION_DENIED`.
6. **Payload 6 (Favorite Impersonation)**: Attacker attempts `setDoc(/favorites/victimUid_res1, { userId: "victimUid", resourceId: "res1" })`. Expected: `PERMISSION_DENIED`.
7. **Payload 7 (Report Modification by Non-Admin)**: Standard member attempts to update `/reports/rep1` status to `dismissed`. Expected: `PERMISSION_DENIED`.
8. **Payload 8 (PII User Scraping via Unrestricted List)**: Public guest attempts to list all users' private profile data. Expected: `PERMISSION_DENIED`.
9. **Payload 9 (Site Settings Defacement)**: Standard member attempts to alter `/settings/general` site title or categories. Expected: `PERMISSION_DENIED`.
10. **Payload 10 (Moderation Log Tampering)**: Standard user attempts to delete or alter a moderation log. Expected: `PERMISSION_DENIED`.
11. **Payload 11 (Denial of Wallet - Oversized String Injection)**: User attempts to save a resource with a 500,000 character title. Expected: `PERMISSION_DENIED`.
12. **Payload 12 (Direct Admin Document Creation)**: Non-admin attempts to write `/admins/attackerUid`. Expected: `PERMISSION_DENIED`.

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)
Validates that all unauthenticated and privilege-violating mutations return `PERMISSION_DENIED`.
