# 🔐 Render Environment Variables - Quick Reference

Copy this checklist when setting up environment variables in Render dashboard.

## ✅ Auto-Configured (via render.yaml)
These are automatically set by Render:
- `NODE_ENV` → production
- `PORT` → 10000
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` → Auto-linked from database
- `JWT_SECRET` → Auto-generated
- `JWT_REFRESH_SECRET` → Auto-generated
- `JWT_EXPIRE` → 15m
- `JWT_REFRESH_EXPIRE` → 7d
- Rate limiting, logging, and other defaults

---

## ⚠️ MUST CONFIGURE MANUALLY

### 1. Redis (from Upstash)
```bash
REDIS_HOST=<your-upstash-host>.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=<your-upstash-password>
```

### 2. Email Configuration
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASSWORD=<your-gmail-app-password>
EMAIL_FROM=noreply@cellerhutlogistics.com
EMAIL_REPLY_TO=support@cellerhutlogistics.com
```

### 3. Frontend URLs (from Vercel)
```bash
FRONTEND_URL=https://your-vercel-app.vercel.app
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### 4. Support Email
```bash
SUPPORT_EMAIL=support@cellerhutlogistics.com
```

---

## 🔄 Optional (Can configure later)

### AWS S3 (if upgrading from local storage)
```bash
STORAGE_PROVIDER=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<your-key>
S3_SECRET_ACCESS_KEY=<your-secret>
```

### Alternative Email Providers

**SendGrid:**
```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=<your-key>
```

**Resend:**
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your-key>
```

---

## 📝 How to Add in Render

1. Go to your web service → **Environment** tab
2. Click **Add Environment Variable**
3. Enter **Key** and **Value**
4. Click **Save Changes**
5. Render will auto-redeploy

---

## ⚡ Pro Tips

- Use **Environment Groups** in Render to share variables across services
- Never commit `.env` files to git
- Use Render's **Secret Files** feature for complex configs if needed
- Test locally with `.env` file first

---

## 🔒 Security Notes

- ✅ JWT secrets are auto-generated securely by Render
- ✅ Database credentials are auto-managed
- ⚠️ Never share Redis password or email credentials
- ⚠️ Use App-Specific Passwords for Gmail (not your main password)
