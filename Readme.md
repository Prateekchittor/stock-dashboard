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

Frontend :
   -HTML5
   -CSS3
   -Vanilla JavaScript
   -Canvas API (for sparkline graphs)

Backend :
   -Node.js
   -Express.js
   -Socket.IO
   -MongoDB Atlas
   -Mongoose
   -Passport.js (Google OAuth)
   -JWT Authentication

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

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# Database
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
The application uses MongoDB Atlas as the primary database for storing user and subscription data.

   Database Usage
------------------------

1.Each authenticated user is stored as a document in MongoDB.

2.User records include:
       - Google account email
       - List of subscribed stock tickers
       - Metadata such as creation timestamp

3.No passwords are stored, as authentication is handled exclusively through Google OAuth.

Q ]  Why MongoDB ? 
------------------------
1.Flexible schema makes it easy to extend user data in the future.

2.Well-suited for user-centric, document-based data models.

3.Integrates seamlessly with Node.js using Mongoose.

4.Scales horizontally and works reliably with cloud deployments.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 # Deployment
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

1.This application is deployed using Render for the backend and web service hosting.

2.The Node.js server is hosted on Render as a web service.

3.Environment variables are securely managed through Render’s dashboard.

4.The application automatically redeploys on every push to the connected Git repository.

5.Google OAuth callback URLs are configured to match the Render deployment domain.

6.MongoDB Atlas is used as the managed database service.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# Security Notes
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

1.Authentication is handled by Google OAuth

2.JWT is used for API and WebSocket authentication

3.No passwords are stored in the database

4.WebSocket connections are authenticated

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Learning Objectives
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

This project demonstrates:
1.Real-time data streaming

2.WebSocket communication

3.OAuth-based authentication

4.Frontend state management

5.Data visualization without external libraries

6.Scalable backend design patterns
