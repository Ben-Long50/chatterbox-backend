<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Ben-Long50/chatterbox-backend.git">
    <img src="public/forum.svg" alt="Logo" width="80" height="80">
  </a>

<h1 align="center">Chatterbox API</h1>

  <p align="center">
    The backend API which powers the Chatterbox messenger website
    <br />
    <a href="https://github.com/Ben-Long50/chatterbox-backend.git"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://chatterbox-messenger.netlify.app/">View Demo</a>
    ·
    <a href="https://github.com/Ben-Long50/chatterbox-backend/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/Ben-Long50/chatterbox-backend/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#api-endpoints">API Endpoints</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

### Built With

<a href="https://nodejs.org">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" height="40" alt="Node.js">
</a>

<a href="https://expressjs.com">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" height="40" alt="Express">
</a>

<a href="https://www.mongodb.com/">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" height="40" alt="MongoDB">
</a>

<a href="https://mongoosejs.com/">
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logoColor=white" height="40" alt="Mongoose">
</a>

<a href="https://socket.io">
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" height="40" alt="Socket.IO">
</a>

### API Endpoints

#### Authentication Endpoints

| Method | Endpoint       | Description                                         |
| ------ | -------------- | --------------------------------------------------- |
| POST   | `/auth/signin` | Signs a user in locally an returns a JWT auth token |
| POST   | `/auth/signup` | Registers a new user locally                        |

#### User Endpoints

| Method | Endpoint                      | Description                                                  |
| ------ | ----------------------------- | ------------------------------------------------------------ |
| GET    | `/users`                      | Fetches a list of all users currently registered on the app  |
| GET    | `/users/:userId`              | Fetches the information associated with a specific user      |
| GET    | `/users/:userId/chats`        | Fetches the chat information associated with a specific user |
| GET    | `/users/:userId/friends`      | Fetches the friend list of a specific user                   |
| GET    | `/users/:userId/friends/best` | Fetches the best friend list of a specific user              |
| PUT    | `/users/:userId`              | Updates a specific user's information                        |
| PUT    | `/users/:userId/friends`      | Adds a friend to the friend list of a specific user          |
| DELETE | `/users/:userId`              | Deletes a specific user                                      |
| DELETE | `/users/:userId/friends`      | Removes a friend from the friend list of a specific user     |

#### Chat Endpoints

| Method | Endpoint                             | Description                                |
| ------ | ------------------------------------ | ------------------------------------------ |
| GET    | `/chats/global`                      | Fetches the global chat information        |
| GET    | `/chats/:chatId`                     | Fetches the information of a specific chat |
| POST   | `/chats`                             | Creates a new chat                         |
| POST   | `/chats/:chatId/messages`            | Creates a new message in a specific chat   |
| PUT    | `/chats/:chatId`                     | Adds a member to a specific chat           |
| PUT    | `/chats/:chatId/members`             | Removes a member from a specific chat      |
| DELETE | `/chats/:chatId`                     | Deletes a specific chat                    |
| DELETE | `/chats/:chatId/messages/:messageId` | Deletes a message from a specific chat     |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To access the live version of this project and explore all of it's features, use the official website link below. Otherwise, continue with the following instructions to run the project locally

<a href="https://chatterbox-messenger.netlify.app/">
  <strong>Chatterbox »</strong>
</a>

### Prerequisites

1. To use the Chatterbox API effectively, you will need to set up the GUI for local use. Please take a look at the instructions regarding the setup for the GUI in the following link:

   <a href="https://github.com/Ben-Long50/chatterbox-frontend.git"><strong>Chatterbox frontend repo »</strong></a>

2. You will need to have a MongoDB account in order to make a new development database for this project. You can sign up for one here:

   <a href="https://account.mongodb.com/account/login"><strong>MongoDB »</strong></a>

### Installation

1. **Clone the repository**

   Run the following command to clone the repository:

   ```sh
   git clone https://github.com/Ben-Long50/chatterbox-backend.git
   ```

2. **Navigate to the project directory and install dependencies**

   Move into the project directory and install the required npm packages:

   ```sh
   cd chatterbox-backend
   npm install
   ```

3. **Set up a new MongoDB development database for the project**

   Log in to your account on MongoDB and create a new project using a free tier database

   Find the connection string for the new project's database. It should be in the following format:

   ```sh
    mongodb+srv://<username>:<password>@<cluster-address>/<database>?<options>
   ```

4. **Set up environment variables**

   Create a .env file in the project’s base directory and add the following environment variables:  
    (The SECRET_KEY can be anything you choose)

   ```js
   CLIENT_URL = 'http://localhost:5173';
   DATABASE_URL = '<your_database_connection_string>';
   SESSION_KEY = '<your_session_key>';
   ```

5. **Avoid accidental pushes to the original repository**

   If you plan to make changes, update the Git remote to point to your own fork to prevent accidental pushes to the base repository:

   ```sh
   git remote set-url origin https://github.com/<your_github_username>/chatterbox-backend.git
   ```

   Confirm the change:

   ```sh
   git remote -v
   ```

   You should see:

   ```sh
   origin  https://github.com/<your_github_username>/chatterbox-backend.git (fetch)
   origin  https://github.com/<your_github_username>/chatterbox-backend.git (push)
   ```

6. **Start the Development Server**

   Run the following command to start the app:

   ```sh
   npm run serverstart
   ```

7. **Start the frontend dev server and access it in browser on port 5173**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Ben Long - [LinkedIn](https://www.linkedin.com/in/ben-long-4ba566129/)

Email - benjlong50@gmail.com

Project Link - [https://github.com/Ben-Long50/chatterbox-backend](https://github.com/Ben-Long50/chatterbox-backend)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
