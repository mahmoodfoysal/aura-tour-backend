# Aura-Tour - Backend for aura tourism frontend

## Live Demo

- Live URL: [https://aura-tour.netlify.app/](https://aura-tour.netlify.app/)

## Repository

- GitHub Client: [https://github.com/mahmoodfoysal/tourism-next-frontend](https://github.com/mahmoodfoysal/tourism-next-frontend)
-
- GitHub Backend: [https://github.com/mahmoodfoysal/aura-tour-backend](https://github.com/mahmoodfoysal/aura-tour-backend)

## Technologies Used

- Node.js
- Express.js
- MongoDB
- gemini api

## Key Features

- All API have separate collection
- Admin collection for admin control
- Token validation by middleware
- gemini ai for user chat
- gemini ai for package description generation
- Coupon code verification.

## Setup and Installation

### 1) Clone the repository

```terminal
git clone https://github.com/mahmoodfoysal/aura-tour-backend.git
cd aura-tour-backend
```

### 2) Install dependencies

```terminal
npm install
```

### 3) Configure environment variables

Create a `.env` file in the root directory and add:

```env

DB_USER=user_name
DB_PASS=your_pass
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret

```

Do not commit `.env` to version control.

### 4) Run the development server

```terminal
node index.js or nodemon index.js
```

Open [http://localhost:5000](http://localhost:5000).

### 5) Build for production

```terminal
Deploy on server
```
