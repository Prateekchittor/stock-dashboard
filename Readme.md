                                                                       Stock Broker Client Dashboard
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
A real-time stock dashboard web application that allows users to log in using Google OAuth, subscribe to stocks, and view live price updates with visual trend graphs.
This project demonstrates real-time systems, WebSockets, authentication, and frontend UI design using modern web technologies.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# Features
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

1.Google OAuth Authentication : Secure login using a real Google account with JWT-based session handling

2.Real-Time Stock Prices : Prices update every second without page refresh using Socket.IO

3.Stock Subscription System Subscribe and unsubscribe to supported stocks.Each user sees only their subscribed stocks

4.Live Trend Visualization : Sparkline graphs show price movement (increasing or decreasing).Trend color changes based on price direction

5.Modern User Interface : Clean card-based layout.Animated buttons and panels and responsive design.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# Tech Stack
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Frontend
-- HTML5
-- CSS3
-- Vanilla JavaScript
-- Canvas API (for sparkline graphs)

Backend
-- Node.js
-- Express.js
-- Socket.IO
-- MongoDB Atlas
-- Mongoose
-- Passport.js (Google OAuth)
-- JWT Authentication

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# File Structure 
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
stock-dashboard/
│
├── server/
│   ├── index.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── subscriptions.js
│   └── utils/
│       ├── jwt.js
│       └── priceGenerator.js
│
├── client/
│   ├── index.html
│   ├── dashboard.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
│
├── .env
├── package.json

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# Application Flow
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
1.User logs in using Google OAuth

2.Server creates or retrieves the user in MongoDB

3.JWT token is issued to the client

4.User subscribes to stocks

5.Server generates random stock prices every second

6.Socket.IO sends updates only to subscribed users

7.UI updates price, time, and trend graph in real time
