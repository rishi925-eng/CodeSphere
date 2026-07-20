# CodeSphere

Hey! This is CodeSphere, a real-time collaborative code editor I built. It lets you write and run code with others in real-time, and it even has built-in audio and video calling so you don't have to use Discord or Zoom while coding. 

It is great for pair programming, interviews, or just playing around with code with your friends.

---

### What it can do:
* **Write code together**: Multiple people can type in the editor at the same time, and it syncs instantly without breaking anyone's edits.
* **Audio & Video calls**: Talk face-to-face right inside the room.
* **Run code**: Supports running JS, Python, C++, Java, Go, and TypeScript.
* **Easy rooms**: Just enter your name, create a room, and share the Room ID with others to join.

---

### Tech Stack I Used:
* **Frontend**: React, TypeScript, Vite, Tailwind CSS, Socket.IO Client, Framer Motion.
* **Backend**: Node.js, Express, Socket.IO, MongoDB.

---

### How to run it locally:

#### 1. Setup the Backend
1. Open your terminal and go to the backend folder: `cd backend`
2. Install the node packages: `npm install`
3. Create a `.env` file inside the `backend` folder and add this:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/codesphere
   JWT_SECRET=supersecretkey
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the server: `npm run dev`

#### 2. Setup the Frontend
1. Open a new terminal window and go to the frontend folder: `cd frontend`
2. Install packages: `npm install`
3. Create a `.env` file inside the `frontend` folder and add:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the dev server: `npm run dev`

Now just open your browser and go to `http://localhost:5173`. You're good to go!

---

### How the real-time sync works under the hood:
To prevent people from overwriting each other's edits, I implemented a custom CRDT (Conflict-free Replicated Data Type) using a Replicated Growable Array (RGA).
Instead of just broadcasting the whole text file, each character has a unique ID (timestamp + client ID). When you insert or delete something, only that edit event is sent over Socket.IO. Everyone's editor inserts the characters at the exact same location mathematically, ensuring it converges to the same state even with network lag.

---

### Deployment

#### Using Docker
I wrote a Docker Compose file if you want to deploy it locally or on a VPS quickly:
```bash
docker compose up -d --build
```
* Frontend: `http://localhost:3000`
* Backend: `http://localhost:5000`

#### Deploying on Render (Cloud)
If you want to host it online, I added a `render.yaml` blueprint. You can just:
1. Push this project to your GitHub.
2. Set up a free MongoDB database on MongoDB Atlas (make sure to set network access to `0.0.0.0/0`).
3. Connect your GitHub repository to Render as a "Blueprint" project.
4. Input your `MONGODB_URI` and `JWT_SECRET` when Render asks.
5. Link the frontend to your backend URL using `VITE_API_URL`.

---

Let me know if you run into any bugs or have suggestions! Enjoy.


