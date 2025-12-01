# Esport Shield - Tournament Management Platform

A modern, professional esports tournament management platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Role-Based Access Control**: Support for Guest, Player, Team Manager, and Admin roles
- **Tournament Management**: Create, browse, and register for tournaments
- **Team System**: Create teams, manage members, and handle join requests
- **My Teams Dashboard**: See teams you manage or belong to; owners can set member roles (Player/Admin)
- **User Dashboard**: Role-specific dashboards with relevant information
- **Admin Panel**: Comprehensive admin tools for managing users, teams, and tournaments
- **Internal System**: Integrated internal admin dashboard available at `/internal/admin/*` (visible only when logged in)
- **Modern UI**: Dark theme with Esports-inspired design and responsive layout
- **Discord Login**: Built-in OAuth flow for one-click sign-in/linking (with email fallback prompts)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: React Context + SWR
- **Authentication**: JWT with localStorage

## Dev tips (avoid "old system" boot)

- Leave `NEXT_PUBLIC_API_URL` empty in `.env.local` to use the built-in Next.js API routes. This avoids CORS and
	prevents pointing at an older/different backend accidentally.
- If you really need to point to another backend, set `NEXT_PUBLIC_API_URL` to that URL and expect cross-origin
	behavior and possibly different data shapes.
- If the UI looks "old" (missing theme toggle or admin bits), clear the cache and restart:
	- Delete `.next/` then run `npm run dev` inside `RCD/`.
	- Ensure you are opening the port this app bound to (usually 3000, otherwise the log prints the used port).

## Dark/Light mode

- The app uses `next-themes` with the class strategy. The `ThemeProvider` is wired in `app/layout.tsx` and the toggle
	button lives in `components/navbar.tsx`.
- Tailwind v4 CSS variables are defined in `app/globals.css` for both light `:root` and `.dark`.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

npm install
# or
yarn install
 Create a `.env.local` file inside the `RCD/` directory (copy from `.env.example`):
# or
# Use the built-in mock API (no external backend required)
NEXT_PUBLIC_DATA_MODE=mock

# Or uncomment to use the real backend server
# NEXT_PUBLIC_DATA_MODE=real
# NEXT_PUBLIC_API_URL=http://localhost:3002
```
pnpm install
\`\`\`

3. Set up environment variables:
 ## API Integration

 The frontend supports two data modes controlled by `NEXT_PUBLIC_DATA_MODE`:

 - `mock`: Uses Next.js App Route handlers with in-memory data (fast iteration, no DB).
 - `real`: Calls the external `rcd-auth-server` at `NEXT_PUBLIC_API_URL`.

 Auth tokens are stored in `localStorage` (`rcd_token`) and sent via `Authorization: Bearer <token>`.
 - **Admin**: `/api/admin/*` (mock) or `/api/audit-logs` (real backend audit log endpoint)
Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

4. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── internal/          # Integrated Internal System (gated)
│   │   └── admin/         # Internal admin pages (dashboard, tournaments, matches, etc.)
│   ├── admin/             # Admin panel
│   ├── dashboard/         # User dashboard
│   ├── my-teams/          # Personal teams dashboard
│   ├── login/             # Login page
│   ├── profile/           # User profile
│   ├── register/          # Registration page
│   ├── teams/             # Teams pages
│   ├── tournaments/       # Tournaments pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation bar
│   ├── footer.tsx        # Footer
│   └── protected-route.tsx # Route protection
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API client
│   ├── auth-context.tsx  # Auth context provider
│   └── utils.ts          # Utility functions
└── public/               # Static assets
\`\`\`

## API Integration

The frontend is designed to work with the Esport Shield backend API. All API calls use relative URLs and include JWT authentication in the `Authorization` header.

### API Endpoints

- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **Tournaments**: `/api/tournaments`, `/api/tournaments/:id`
- **Teams**: `/api/teams`, `/api/teams/:id`
- **Users**: `/api/users/:id`
- **Admin**: `/api/admin/*`

## User Roles

### Guest (Not Logged In)
- View home page and tournaments
- Register/login

### Player
- Join tournaments
- Request to join teams
- View dashboard with personal stats

### Team Manager
- Create and manage teams
- Approve/decline join requests
- Register teams for tournaments
- Manage team members

### Admin
- Full access to all features
- User management (change roles, delete users)
- Team management
- Tournament CRUD operations
- View audit logs

## Test Credentials

When connecting to the backend, use these test accounts:

- **Admin**: `admin@example.com` / `Admin123!`
- **Team Manager**: `manager@example.com` / `Manager123!`
- **Player**: Register a new account

## Design System

The application uses a dark Esports-themed design with:

- **Primary Color**: Purple/Blue gradient
- **Accent Colors**: Neon blue, purple, pink
- **Typography**: Geist Sans for UI, Geist Mono for code
- **Components**: shadcn/ui with custom Esports styling

## Deployment

The application can be deployed to Vercel, Netlify, or any platform that supports Next.js:

\`\`\`bash
npm run build
npm run start
\`\`\`

## Contributing

This is a frontend-only project designed to integrate with the RCD backend. When contributing:

1. Follow the existing code style
2. Use TypeScript for type safety
3. Ensure responsive design works on mobile
4. Test with different user roles

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue on the repository.
 
## Production Deployment (Docker)

This project ships with a `docker-compose.yml` orchestrating:
- `web` (Next.js frontend → host port 8080)
- `auth` (auth API → host port 3002)
- `app` (core backend API → host port 3001)
- `mongo` (database, internal only)

Key production tweaks already applied:
- Removed external Mongo port; DB only reachable on internal `rcd-network`.
- Healthchecks for `web`, `auth`, `app` ensure container readiness.
- Frontend Dockerfile builds Next.js (`npm run build`) prior to `next start`.

### First Deployment
```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose
git clone <repo-url> /srv/seniorproject
cd /srv/seniorproject/RCD
cp .env.example .env.local   # add secrets / overrides
docker-compose build
docker-compose up -d
```

### Verification
```bash
docker-compose ps
curl -I http://localhost:8080
```

### Nginx Integration
Use `deploy/nginx/rcd-esports.conf` (edit domain + cert paths) then:
```bash
sudo ln -s /srv/seniorproject/RCD/deploy/nginx/rcd-esports.conf /etc/nginx/sites-available/rcd-esports.conf
sudo ln -s /etc/nginx/sites-available/rcd-esports.conf /etc/nginx/sites-enabled/rcd-esports.conf
sudo nginx -t && sudo systemctl reload nginx
```

#### Advanced Nginx Notes
- Frontend container listens on `8080`; auth API `3002`; core app API `3001`.
- Updated config defines upstream blocks and enforces HTTP→HTTPS redirect with ACME challenge passthrough.
- SSE endpoints (`/api/notifications/stream`, `/api/tournaments/:id/bracket/stream`) disable `proxy_buffering` for real-time updates.
- Static assets (`js, css, images, fonts`) get 30d immutable caching while still flowing through Next.js.
- Optional unified `/api` routing commented inside the config: uncomment and adjust patterns if you prefer a single ingress path.
- Security headers (CSP, Frame, XSS) are present—tune CSP if you introduce external analytics, fonts, or script CDNs.
- Rate limiting examples are commented (`limit_req_zone` + `limit_req`). Define the zone globally in `nginx.conf` before enabling.
- Health probe at `/healthz` returns a simple 200 for container orchestration.

#### Environment Variables Behind Nginx
For production behind the proxy:
```env
NEXT_PUBLIC_DATA_MODE=real
NEXT_PUBLIC_API_URL=https://esports.example.com/app/   # or /api/ if unified routing enabled
```
In mock mode keep `NEXT_PUBLIC_API_URL` empty and the frontend serves API routes directly.

#### TLS Setup (Let’s Encrypt quickstart)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d esports.example.com --agree-tos -m admin@esports.example.com --non-interactive
sudo systemctl reload nginx
```

#### Deployment Recap
1. Bring up stack: `docker-compose up -d`
2. Verify containers: `docker-compose ps`
3. Enable nginx site & test: `sudo nginx -t && sudo systemctl reload nginx`
4. Switch `NEXT_PUBLIC_DATA_MODE` to `real` only after auth/app APIs are healthy.
5. Monitor logs:
```bash
docker logs -f rcd-web
docker logs -f rcd-auth
docker logs -f rcd-app
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

### Updating
```bash
cd /srv/seniorproject
git pull
cd RCD
docker-compose build
docker-compose up -d
```

### Rollback
```bash
git log --oneline
git checkout <previous_good_commit>
docker-compose build
docker-compose up -d
git checkout master  # when ready to return
```

### Blue/Green (Optional)
Run second stack with different project name & ports (e.g. 8081) then switch nginx upstream after healthchecks pass.

### Backups
```bash
docker exec rcd-mongo mongodump --archive --gzip > /backups/$(date +%F).gz
```
Automate via cron; sync backups off-host.

### Security
- Firewall allow only 80/443/22
- Keep `auth`/`app` private unless external consumers require them
- Rotate secrets & rebuild images periodically
- Store secrets in `.env.local` (never commit)
\`\`\`

```json file="" isHidden

## OAuth Providers

- Discord SSO is enabled whenever the auth server exposes `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DISCORD_CALLBACK_URL`.
- Optional overrides:
  - `OAUTH_SUCCESS_REDIRECT` (defaults to `/auth/callback`)
  - `OAUTH_FAILURE_REDIRECT` (defaults to `/login`)
- The frontend proxies `/api/oauth/discord` to the auth service and finishes the flow via `/auth/callback`.
- Logged-in users can link/unlink Discord from **Profile → Linked Accounts**. If the provider does not send an email, the profile page shows a warning banner so players can add a valid address before joining tournaments.
