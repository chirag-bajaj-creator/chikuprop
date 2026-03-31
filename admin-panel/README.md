# ChikuProp Admin Panel

Separate admin dashboard for ChikuProp real estate platform.

## Setup

```bash
cd admin-panel
npm install
npm run dev
```

Admin panel runs on `http://localhost:3001`

## Structure

```
admin-panel/
├── src/
│   ├── pages/          # Admin pages (Dashboard, Users, Properties, etc.)
│   ├── components/     # Admin components (Layout, Tables, Forms)
│   ├── context/        # Auth and Toast context (shared)
│   ├── services/       # API services (shared)
│   ├── utils/          # Utilities (shared)
│   ├── App.jsx         # Main app component (admin-only routes)
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Features

- **Dashboard**: Overview of platform metrics
- **User Management**: View, suspend, ban users
- **Property Moderation**: Approve/reject property listings
- **Grievances**: Handle user complaints
- **Appointments**: View scheduled appointments

## Running

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
```

## API Integration

All API calls use the shared services from `src/services/`. Admin endpoints are at `/api/admin/*` on the backend.

## Authentication

Admin login requires:
- Email
- Password
- Secret key (for server verification)

Sessions are managed via `AuthContext`.
