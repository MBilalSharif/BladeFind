# ✂️ BladeFind — Barber Shop Discovery App

**BladeFind** is a MERN stack barber shop discovery app with a futuristic dark neon UI.

---

## 🎨 Design System

The UI is based on the BladeFind Lovable design:
- **Theme**: Dark background (`hsl(220 20% 6%)`) with neon cyan primary (`hsl(180 80% 55%)`)
- **Glass UI**: `.glass` and `.glass-strong` for frosted panels
- **Neon effects**: `.neon-glow`, `.neon-glow-sm`, `.neon-text`
- **3D cards**: `.card-3d` — perspective tilt on hover
- **Map**: Dark custom styled Google Map, floating neon circle markers
- **Fonts**: Space Grotesk (display) + Inter (body)

---

## 📁 Project Structure

```
Vibe Coding/
├── README.md
├── backend/
│   ├── server.js
│   ├── .env.example
│   └── src/
│       ├── config/db.js
│       ├── controllers/shopsController.js
│       ├── middlewares/errorHandler.js
│       ├── models/BarberShop.js
│       ├── routes/shopRoutes.js
│       └── services/placesService.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.ts
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css           ← All design tokens, glass, neon, grid-bg
        ├── api/shopsApi.js
        ├── hooks/useBarberShops.js
        ├── components/
        │   ├── Navbar.jsx      ← Fixed glass navbar, BLADEFIND logo
        │   ├── SearchBar.jsx   ← Hero + compact variants
        │   ├── ShopCard.jsx    ← 3D card, glass, neon open dot
        │   ├── MapView.jsx     ← Google Maps + dark style + markers
        │   └── ShopList.jsx
        └── pages/
            ├── Index.jsx       ← Hero section + featured shops
            ├── ShopListing.jsx ← Filter + grid view
            ├── MapView.jsx     ← Full-height map + sidebar
            └── NotFound.jsx
```

---

## ⚙️ Google Cloud Setup

Enable these APIs in your Google Cloud project:
1. **Maps JavaScript API** (frontend map rendering)
2. **Places API** (backend shop search)
3. **Geocoding API** (optional, for address resolution)

Restrict your **frontend key** to your domain. Keep the **backend key** server-side only.

---

## 🚀 Local Development

### 1. Backend

```bash
cd "Vibe Coding/backend"
npm install
cp .env.example .env
# Edit .env: set MONGO_URI and GOOGLE_MAPS_API_KEY
npm run dev
# → Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd "Vibe Coding/frontend"
npm install
cp .env.example .env
# Edit .env: set VITE_GOOGLE_MAPS_KEY
npm run dev
# → Runs on http://localhost:5173
```

### 3. Open in browser

```
http://localhost:5173
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/shops/nearby?lat=&lng=&radius=` | GPS-based shop search |
| GET | `/api/shops/search?query=&radius=` | Text-based shop search |
| GET | `/api/shops/photo?photoReference=&maxWidth=` | Proxied Google Place photo |

---

## 🔑 Security Notes

- `GOOGLE_MAPS_API_KEY` (backend `.env`) — server-side only, never exposed to browser
- `VITE_GOOGLE_MAPS_KEY` (frontend `.env`) — browser key, restrict to your domain in GCP Console
- Shop photos proxied through `/api/shops/photo` to keep backend key hidden
- MongoDB shop data cached for 12h to reduce Places API quota usage
