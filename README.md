# TaskFlow

A Trello-inspired project management application built with the MERN stack. Organize work into boards, columns, and cards with real-time collaboration.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://task-flow-seven-vert.vercel.app |
| Backend API | https://taskflow-5g0v.onrender.com/api |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Zustand, CSS Modules |
| Backend | Node.js, Express.js, WebSocket (ws) |
| Database | MongoDB, Mongoose |
| Auth | JWT (localStorage) |
| File Upload | Multer, UploadThing |
| Testing | Jest, Supertest, mongodb-memory-server |

---

## Features

- Register / login with JWT authentication
- Create, edit, and delete boards with gradient or custom color backgrounds
- Invite team members to boards by email
- Columns with drag-and-drop reordering
- Cards with title, description, priority, due date, labels, and file attachments
- Real-time online presence and board updates via WebSocket
- Card search within a board
- User profile with avatar upload and bio
- Custom confirmation dialogs (no browser `confirm()`)

---

## Project Structure

```
TaskFlow/
├── backend/          # Express API + WebSocket server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── websocket/
│   ├── uploads/      # Uploaded files (served statically)
│   └── index.js
└── frontend/         # Next.js App Router
    ├── app/
    ├── components/
    ├── lib/
    └── store/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/DigitalEnginer/TaskFlow.git
cd TaskFlow
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `.env` in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev      # development (nodemon)
npm start        # production
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env.local` in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

For production, update the environment variables to point to your deployed services.

---

# TaskFlow (на русском)

Приложение для управления задачами в стиле Trello, построенное на стеке MERN. Организуйте работу через доски, колонки и карточки с совместной работой в реальном времени.

---

## Живое демо

| Сервис | URL |
|--------|-----|
| Фронтенд | https://task-flow-seven-vert.vercel.app |
| Backend API | https://taskflow-5g0v.onrender.com/api |

---

## Стек технологий

| Слой | Технология |
|------|-----------|
| Фронтенд | Next.js 16, React 19, Zustand, CSS Modules |
| Бэкенд | Node.js, Express.js, WebSocket (ws) |
| База данных | MongoDB, Mongoose |
| Авторизация | JWT (localStorage) |
| Загрузка файлов | Multer, UploadThing |
| Тестирование | Jest, Supertest, mongodb-memory-server |

---

## Функциональность

- Регистрация и вход через JWT
- Создание, редактирование и удаление досок с градиентным или пользовательским фоном
- Приглашение участников на доску по email
- Колонки с перетаскиванием (drag & drop)
- Карточки с заголовком, описанием, приоритетом, дедлайном, метками и вложениями
- Онлайн-присутствие и обновления в реальном времени через WebSocket
- Поиск карточек внутри доски
- Профиль пользователя с загрузкой аватара и биографией
- Кастомные диалоги подтверждения (без браузерного `confirm()`)

---

## Структура проекта

```
TaskFlow/
├── backend/          # Express API + WebSocket сервер
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── websocket/
│   ├── uploads/      # Загруженные файлы (статическая раздача)
│   └── index.js
└── frontend/         # Next.js App Router
    ├── app/
    ├── components/
    ├── lib/
    └── store/
```

---

## Запуск проекта

### Требования

- Node.js 18+
- MongoDB (локальный или Atlas)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/DigitalEnginer/TaskFlow.git
cd TaskFlow
```

### 2. Настройка бэкенда

```bash
cd backend
npm install
```

Создайте файл `.env` в папке `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=ваш_секретный_ключ
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Запустите бэкенд:

```bash
npm run dev      # разработка (nodemon)
npm start        # продакшн
```

### 3. Настройка фронтенда

```bash
cd frontend
npm install
```

Создайте файл `.env.local` в папке `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

Запустите фронтенд:

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## Запуск тестов

```bash
# Бэкенд
cd backend && npm test

# Фронтенд
cd frontend && npm test
```

---

## Деплой

| Сервис | Платформа |
|--------|-----------|
| Фронтенд | Vercel |
| Бэкенд | Render / Railway |
| База данных | MongoDB Atlas |

Для продакшна замените переменные окружения на адреса задеплоенных сервисов.
