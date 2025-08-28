# 🍔 MERN Food Delivery App

A full-stack **Food Delivery Web Application** built with the **MERN stack** (MongoDB, Express, React, Node.js).  
The app allows users to browse food items, add them to the cart, place orders, and make payments.  
An **Admin Panel** is also available for managing food items and orders.

---

> ⚠️ Backend APIs are hosted separately on Render free tier, so the **first request may take a few seconds to wake up the server**.

---

## ✨ Features

### Customer (Frontend)
- Browse food items by category  
- Add / remove items from the cart  
- Place orders with delivery details  
- Online payment integration (Razorpay / Stripe)  
- View total order price dynamically  

### Admin
- Add, update, or remove food items  
- Manage orders (view order list and update status)  
- Upload food images  

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Axios, React Router, Context API, Toastify  
- **Backend:** Node.js, Express.js, MongoDB, Mongoose  
- **Payments:** Razorpay integration  
- **Hosting:** Render (Frontend + Backend)  
- **Styling:** CSS  

---

## ⚙️ Installation (Local Setup)

Clone the repo and run both frontend and backend locally.

2. Setup Backend
cd backend
npm install
npm run dev


Backend runs on: http://localhost:4000

3. Setup Frontend
cd ../frontend
npm install
npm run dev


Frontend runs on: http://localhost:5173

4. Setup Admin
cd ../admin
npm install
npm run dev


Admin runs on: http://localhost:5174

📂 Project Structure
/admin      → Admin panel (React)
/backend    → Backend (Node.js, Express, MongoDB)
/frontend   → Frontend (React + Vite)


🙌 Acknowledgements
Render
 for free hosting

Razorpay
 for payment integration

Inspiration from food delivery platforms like Swiggy & Zomato
