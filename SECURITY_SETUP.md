# Boltwish security setup

The admin password is no longer included in the frontend bundle. Admin sign-in now uses Firebase Authentication, and Firestore independently checks an `admins` record before accepting template changes.

## One-time Firebase setup

1. In Firebase Console, open **Authentication → Sign-in method** and enable both **Email/Password** and **Anonymous**. Email/password protects the admin area; anonymous authentication gives each wish creator a private owner identity without requiring an account.
2. Open **Authentication → Users**, create the admin user, and copy its **User UID**.
3. Open **Firestore Database → Data** and create a collection named `admins`.
4. Create a document inside `admins` whose document ID is the copied User UID. It can contain a harmless field such as `role: "admin"`.
5. Deploy `firestore.rules` from this project.
6. Remove any old `VITE_ADMIN_CODE` variable from local and Vercel environment settings. A variable prefixed with `VITE_` is public by design and must never hold a secret.

Only someone who both knows the Firebase account password and owns a UID listed in `admins` can change templates. Admin documents cannot be created, edited, deleted, or listed from the website.

Wish documents are owned by the Firebase UID that created them. Only that same browser identity can edit or delete the wish. Shared wishes are unlisted, open automatically on the entered event date, expire exactly seven days later, and cannot be enumerated through Firestore list queries. Firestore rules enforce the seven-day window so it cannot be bypassed with a modified browser request.

## Recommended production hardening

Create a Firebase App Check web app using reCAPTCHA v3, add its site key as `VITE_FIREBASE_APPCHECK_SITE_KEY`, and enable enforcement for Firestore after verifying valid traffic. App Check is not a replacement for the Firestore authorization rules; it adds abuse resistance for public wish creation.

Keep the Firebase project owner account protected with multi-factor authentication, use a unique admin password, and do not commit service-account keys or environment files.
