# College Management System — MERN Starter

A responsive College Management System dashboard inspired by the supplied reference image.

## Features
- Dashboard with income/expense chart, recent notices, quick actions and summary cards
- Students, Teachers, Classes, Subjects
- Attendance with circular percentage indicators (present/absent/leave)
- Fees & Finance, Homework, Timetable, Notice Board, Messages
- Exams & Results, Study Material, AI Assistant (UI placeholder)
- React + Vite frontend, Express backend, MongoDB + Mongoose
- Responsive sidebar, larger readable typography, colorful cards

## Requirements
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## Run backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

## Run frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
Open the URL printed by Vite (normally http://localhost:5173).

## Configure MongoDB
Set `MONGO_URI` in `server/.env`. The server starts in demo mode if MongoDB is not configured;
the dashboard UI still works using local sample data. API-backed student and attendance
routes become available after MongoDB is connected.

## Important
This is a starter project, not a production-ready student information system. Add
authentication/authorization, validation, audit logs, backups, and privacy controls before
using real student data.


## Enable the AI Assistant (Gemini)
1. Get a Gemini API key from Google AI Studio.
2. In the `server` folder, copy `.env.example` to `.env`.
3. Replace `your_gemini_api_key_here` with your actual key.
4. Keep the key only in `server/.env` — never put it in React/client files or share it publicly.
5. Restart the backend (`npm run dev`) after saving `.env`.
6. Open the AI Assistant item in the sidebar and send a message.

The AI Assistant uses the server route `POST /api/ai/chat`. The Gemini key is kept on
the backend. If the key is missing or invalid, the chat panel displays an error.


## CRUD management modules
Teachers, Classes, Subjects, Attendance, Fees & Finance, Homework, Timetable,
Notice Board, Messages, Exams & Results, and Study Material now have add/edit/delete/search
forms backed by MongoDB using the `/api/records/:module` endpoints.

Attendance has circular charts calculated from saved records. Study Material supports
resource URLs (direct file uploads are not included). Messages are stored records, not
email/SMS delivery. Fees track payment status but do not process real payments.

**MongoDB must be connected** for records to save. Create `server/.env` from
`.env.example`, set `MONGO_URI`, and run both server and client. This project does not
yet implement user login, permissions, or production security.

## Working management modules
Teachers, Classes, Subjects, Attendance, Fees, Homework, Timetable, Notices, Messages, Exams/Results and Study Materials support add, list, edit, delete via MongoDB (`/api/modules/...`). Attendance circular percentages calculate from saved attendance records. **Students is currently a local demo list**, not persistent. These routes have no authentication: use only for local demonstration, not real private college data. AI requires a Gemini API key. MongoDB must be running for record persistence.
