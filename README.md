# SocialHub Client (API connected)

React + Vite social-media client integrated with the SocialHub Express API using TanStack Query.

## Requirements
- Node.js 20.19+ (Node 22 recommended)
- SocialHub server running locally at `http://localhost:5000`
- PostgreSQL and server environment configured as described in `socialhub-server/README.md`

## Run the client
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and confirm `VITE_API_URL=http://localhost:5000/api`.
3. Start Vite: `npm run dev`

The frontend API uses `fetch` with `credentials: include` for the server's HttpOnly refresh-token cookie. Access tokens are kept in memory, not localStorage. The only remaining localStorage use is the user's theme preference.

## Connected features
- Login, registration and 6-digit email verification
- Protected routes: guests see login/register; successful login opens the social feed
- Session refresh through the backend refresh cookie
- Feed, post creation, delete, like/unlike, bookmark, share and comments
- Comment replies (requires the updated backend schema below)
- User profile, profile posts, follow/unfollow and profile updates
- Search, trending topics, notifications, conversations/messages, communities and events
- TanStack Query caching and invalidation for API-backed data

## Backend setup and comment replies
Use the updated `socialhub-server` folder shipped alongside this client. The Comment model now has an optional `parentId` to persist replies. After updating your server source, regenerate Prisma Client and apply the schema to your database. For a development database, from the server folder run:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

For production, create and deploy a proper Prisma migration instead of using `db push`.

## Important API notes
- The current server supports image attachments by URL and Cloudinary video posts. This client therefore accepts an image URL in the post composer; it does not pretend a local object URL is a permanent upload.
- The backend currently has no stories API or separate reels endpoint. Fake story/reel cards were removed; video posts appear in the main feed.
- Configure `CLIENT_URL` on the server to allow the frontend origin and credentials. For local development, the server should allow the Vite origin (usually `http://localhost:5173`).
