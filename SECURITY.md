# 🔐 Security Setup Guide

This document outlines the security measures implemented and the steps you need to complete externally.

## ✅ What's Already Implemented (In Code)

| Feature | Status | Description |
|---------|--------|-------------|
| **Environment Variables** | ✅ | Admin password moved from hardcoded to `NEXT_PUBLIC_ADMIN_PASSWORD` |
| **Rate Limiting** | ✅ | 5 attempts max, 15-minute lockout on failure |
| **Secure Session Token** | ✅ | Session cookies now use encoded tokens instead of plain text |
| **Strict Cookie Settings** | ✅ | `sameSite: strict`, `secure: true` in production |
| **Firestore Rules File** | ✅ | Created `firestore.rules` with access control |

---

## 🛠️ Steps YOU Need to Complete

### 1. Add Admin Password to Environment Variables

**Local Development:**
Add this line to your `.env.local` file:
```
NEXT_PUBLIC_ADMIN_PASSWORD=YourSecurePasswordHere123!
```

**Vercel (Production):**
1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables
2. Add a new variable:
   - **Name:** `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value:** Your secure password
   - **Environment:** Production, Preview, Development

---

### 2. Deploy Firestore Security Rules

**Option A: Firebase Console (Easiest)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` from your project
5. Paste and click **Publish**

**Option B: Firebase CLI**
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

### 3. (Optional) Enable Firebase Authentication

For maximum security, consider enabling Firebase Authentication:

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" or "Google" sign-in
3. Create an admin user
4. Update the app to use Firebase Auth instead of password-only protection

---

## 📋 Security Checklist

- [ ] Added `NEXT_PUBLIC_ADMIN_PASSWORD` to `.env.local`
- [ ] Added `NEXT_PUBLIC_ADMIN_PASSWORD` to Vercel environment variables
- [ ] Deployed Firestore security rules
- [ ] Changed the default password from `scadmin1234` to something secure
- [ ] Tested admin login with new password
- [ ] Verified rate limiting works (try 5 wrong passwords)

---

## ⚠️ Important Notes

1. **NEVER commit `.env.local`** to git (it's already in `.gitignore`)
2. **Use a strong password** - at least 12 characters with mixed case, numbers, and symbols
3. **Firestore rules are essential** - without them, anyone can write directly to your database
4. **Monitor your Firebase usage** - check for unusual activity in Firebase Console

---

## 🔮 Future Improvements (Recommended)

1. **Full Firebase Authentication** - Replace password-only with proper user accounts
2. **Server-Side Validation** - Use Next.js API routes for admin actions
3. **Audit Logging** - Log admin actions to a separate collection
4. **IP Whitelisting** - Restrict admin access to specific IPs
