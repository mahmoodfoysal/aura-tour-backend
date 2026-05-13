# Penguin - Backend for penguin frontend

## Live Demo

- Live URL: [https://penguin-shopping.web.app/home/](https://penguin-shopping.web.app/home/)

## Repository

- GitHub Client: [https://github.com/mahmoodfoysal/penguin-frontend](https://github.com/mahmoodfoysal/penguin-frontend)
-
- GitHub Backend: [https://github.com/mahmoodfoysal/penguin-backend](https://github.com/mahmoodfoysal/penguin-backend)

## Technologies Used

- Node.js
- Express.js
- MongoDB

## Key Features

- All API have separate collection
- Use mongoDB aggregation
- Admin collection for admin control
- Token validation by middleware

## Setup and Installation

### 1) Clone the repository

```terminal
git clone https://github.com/mahmoodfoysal/penguin-backend.git
cd penguin-backend
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
