# 🚀 Vercel Environment Variables Setup Guide

## 🔧 **Critical Environment Variables Required**

Your DevFlowHub deployment is failing because these environment variables are missing in Vercel production.

### **1. Database Configuration**
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```
- **Required**: PostgreSQL connection string
- **Get from**: Your database provider (Supabase, PlanetScale, Railway, etc.)

### **2. NextAuth Configuration**
```bash
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://your-domain.vercel.app"
```
- **NEXTAUTH_SECRET**: Generate with: `openssl rand -base64 32`
- **NEXTAUTH_URL**: Your production domain

### **3. Google OAuth (Optional but Recommended)**
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
- **Get from**: [Google Cloud Console](https://console.cloud.google.com/)

### **4. OpenAI API (For AI Features)**
```bash
OPENAI_API_KEY="sk-your-openai-api-key"
```
- **Get from**: [OpenAI Platform](https://platform.openai.com/)

### **5. PostHog Analytics (Optional)**
```bash
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```
- **Get from**: [PostHog](https://posthog.com/)

## 🛠️ **How to Set Environment Variables in Vercel**

### **Method 1: Vercel Dashboard (Recommended)**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your DevFlowHub project
3. Click **Settings** tab
4. Click **Environment Variables**
5. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your database connection string
   - **Environment**: Production, Preview, Development
6. Repeat for all variables
7. Click **Save**

### **Method 2: Vercel CLI**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add OPENAI_API_KEY

# Redeploy
vercel --prod
```

## 🗄️ **Database Setup Options**

### **Option 1: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Run migrations: `npx prisma db push`

### **Option 2: PlanetScale**
1. Go to [planetscale.com](https://planetscale.com)
2. Create new database
3. Get connection string from Connect tab
4. Run migrations: `npx prisma db push`

### **Option 3: Railway**
1. Go to [railway.app](https://railway.app)
2. Create new PostgreSQL service
3. Get connection string from Connect tab
4. Run migrations: `npx prisma db push`

## 🔍 **Testing Your Setup**

After setting environment variables:

1. **Redeploy**: `vercel --prod`
2. **Test Database**: Try creating a project
3. **Check Logs**: Monitor Vercel function logs
4. **Verify Auth**: Test login/signup functionality

## 🚨 **Common Issues & Solutions**

### **Issue: "Failed to create project"**
- **Cause**: Missing `DATABASE_URL`
- **Solution**: Set database connection string

### **Issue: "Unauthorized" errors**
- **Cause**: Missing `NEXTAUTH_SECRET`
- **Solution**: Generate and set secret key

### **Issue: PostHog 401 errors**
- **Cause**: Missing PostHog credentials
- **Solution**: Set PostHog environment variables or disable analytics

### **Issue: Google OAuth not working**
- **Cause**: Missing Google credentials
- **Solution**: Set Google OAuth environment variables

## 📋 **Quick Setup Checklist**

- [ ] Set `DATABASE_URL` in Vercel
- [ ] Set `NEXTAUTH_SECRET` in Vercel
- [ ] Set `NEXTAUTH_URL` in Vercel
- [ ] Set `GOOGLE_CLIENT_ID` in Vercel (optional)
- [ ] Set `GOOGLE_CLIENT_SECRET` in Vercel (optional)
- [ ] Set `OPENAI_API_KEY` in Vercel (optional)
- [ ] Redeploy with `vercel --prod`
- [ ] Test project creation
- [ ] Verify authentication works

## 🆘 **Need Help?**

If you're still having issues:
1. Check Vercel function logs
2. Verify database connection
3. Test environment variables locally
4. Check NextAuth configuration

---

**Remember**: Environment variables are case-sensitive and must be set exactly as shown above!
