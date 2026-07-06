# Unified Inbox MVP — Facebook + Instagram Page Messages

This is a production-ready starter MVP for a unified inbox similar to LiveChat-style tools.

## Included

- 10+ Facebook/Instagram pages in one inbox
- Meta webhook verification and incoming message storage
- Reply from dashboard via Meta Send API
- Page filter, status filter, search
- 24-hour reply window badge
- Staff name on reply
- Staff performance report
- Optional Pusher realtime + 5-second polling fallback
- Page tokens encrypted in database
- Simple Basic Auth for internal use

## Setup

### 1) Install

```bash
npm install
```

### 2) Create `.env`

Copy `.env.example` to `.env.local` and fill values.

Required:

```env
DATABASE_URL="..."
META_VERIFY_TOKEN="your-random-token"
ENCRYPTION_KEY="long-random-secret"
ADMIN_USER="admin"
ADMIN_PASS="strong-password"
```

Optional realtime:

```env
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="ap2"
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"
```

### 3) Push DB schema

```bash
npx prisma generate
npx prisma db push
```

### 4) Run locally

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

### 5) Add pages

Go to:

```txt
/settings/pages
```

Add each page:

- Page name
- Page ID
- Channel: messenger or instagram
- Page Access Token

### 6) Meta webhook URL

After deploying to Vercel, webhook callback URL:

```txt
https://YOUR-DOMAIN.vercel.app/api/meta/webhook
```

Verify token:

```txt
same as META_VERIFY_TOKEN
```

Subscribe page webhook fields such as messages / messaging_postbacks depending on your Meta setup.

## Deploy to Vercel

1. Push this project to GitHub
2. Import project in Vercel
3. Add all env variables in Vercel Project Settings
4. Deploy
5. Run database migration/push
6. Configure Meta webhook callback

## Notes

- This MVP stores only text and attachment placeholder. Later you can add image/file attachment handling.
- Proper staff login can be added later. For MVP, staff enters their name before sending reply.
- WhatsApp can be added later as another channel.
