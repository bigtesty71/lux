# Deployment Plan for blog.companain.life

The CompanionAI Life (Lux) platform is ready for production. Since your database is already hosted on Hostinger, the process is streamlined.

## 1. Hosting Architecture
*   **Frontend/API**: [Vercel](https://vercel.com) (Optimized for Next.js)
*   **Database**: Hostinger MySQL (Remote access enabled)
*   **Domain**: `blog.companain.life`

---

## 2. Infrastructure Setup

### Part A: Environment Configuration
Vercel needs the credentials currently in your `.env.local` to talk to Hostinger.
1.  **Push Code**: Commit your local changes and push them to a private GitHub repository.
2.  **Import to Vercel**: Connect your GitHub repo to Vercel.
3.  **Set Environment Variables**: In Vercel Project Settings > Environment Variables, copy the values from your `.env.local`:
    *   `DB_HOST`: (Your Hostinger DB Host)
    *   `DB_USER`: (Your Hostinger DB User)
    *   `DB_PASSWORD`: (Your Hostinger DB Password)
    *   `DB_NAME`: `companion_ai_life`
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `NEXTAUTH_SECRET`: (Generate a new secret for production)
    *   `NEXTAUTH_URL`: `https://blog.companain.life`

### Part B: Hostinger Remote Access
Next.js on Vercel is serverless, meaning its IP addresses can change. 
1.  **Whitelisting**: In your Hostinger hPanel, go to **Databases > Remote MySQL**.
2.  **IP Address**: Since Vercel uses a range of IPs, the most reliable way to ensure a connection is to add `%` (wildcard) to the allowed IP list temporarily to verify the connection, then restrict it if Hostinger provides a specific integration or if you use a static IP proxy.

---

## 3. Domain & SSL Setup
1.  **Vercel Domains**: In Vercel's "Settings > Domains" tab, add `blog.companain.life`.
2.  **DNS Records**: 
    Log into your domain provider (where `companain.life` is managed) and add:
    *   **Type**: `CNAME`
    *   **Name**: `blog`
    *   **Target**: `cname.vercel-dns.com`
    *   **TTL**: Auto/1 hour

---

## 4. Maintenance
*   **Archiving**: Lux is trained on your files in `/assets/blogs/`. If you add more, just run the ingest script pointed at your Hostinger DB.
*   **Imaging**: Ensure all images in `/public/blog-images/` are committed to Git so they deploy to the web.
