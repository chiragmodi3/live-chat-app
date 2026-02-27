## 🛠 Tech Stack

# Frontend

- Next.js 16
- TypeScript
- Tailwind CSS
- Lucide Icons

# Backend

- Convex (Real-time database & functions)

# Authentication

- Clerk

## ⚙️ Installation

1️⃣ Clone Repository
git clone https://github.com/chiragmodi3/live-chat-app.git
cd live-chat-app

2️⃣ Install Dependencies
npm install

3️⃣ Setup Environment Variables

Create a .env.local file:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CONVEX_DEPLOYMENT=https://live-chat-app-psi.vercel.app/
NEXT_PUBLIC_CONVEX_URL=your_convex_url

4️⃣ Start Convex
npx convex dev

5️⃣ Run Application
npm run dev

Open:
http://localhost:3000
