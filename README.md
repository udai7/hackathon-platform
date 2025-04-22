# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Hackathon Platform

A comprehensive platform for creating, managing, and participating in hackathons.

## Features

- Create and manage hackathons
- Register for hackathons
- Payment integration for registration fees
- User dashboard for managing hackathons and registrations

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- MongoDB for database
- Express.js for backend API
- Node.js

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository
   ```
   git clone [repository-url]
   cd hackathon-platform
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hackathon-platform
   JWT_SECRET=your-secret-key
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   ```

   If you're using MongoDB Atlas, your MONGODB_URI should look like:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/hackathon-platform?retryWrites=true&w=majority
   ```

## Running the Application

### Start the Backend Server

First, start the backend server:

```
npm run backend
```

This script will:
- Verify your environment setup
- Create a default .env file if one doesn't exist
- Start the server using ts-node

### Start the Frontend Development Server

In a separate terminal, start the frontend development server:

```
npm run dev
```

## Troubleshooting Common Issues

### "Network Error, Please Try Again" 

If you encounter network errors when creating, updating, or registering for hackathons:

1. **Check Backend Server**: Make sure the backend server is running
   ```
   npm run backend
   ```

2. **Check MongoDB Connection**: Verify your MongoDB connection string in the `.env` file

3. **MongoDB Running**: Ensure MongoDB is running if you're using a local installation

4. **Check Console for Errors**: Open browser developer tools (F12) and check the console for specific error messages

5. **Server Port**: Make sure the backend server is running on port 5000 (or the port specified in your .env file)

6. **CORS Issues**: If you see CORS errors in the console, check that the frontend is connecting to the correct backend URL

7. **Timeout or Large Images**: If uploading images times out, try using a smaller image or using a URL instead

### Backend Debugging

For more detailed backend logs:

```
npm run backend:debug
```

This will show all debug information, which can help identify the source of network problems.

## Development

To run both frontend and backend concurrently with a single command:

```
npm run dev:full
```

## API Endpoints

The backend API provides the following endpoints:

- `GET /api/hackathons` - Get all hackathons
- `GET /api/hackathons/featured` - Get featured hackathons
- `GET /api/hackathons/:id` - Get hackathon by ID
- `GET /api/hackathons/creator/:creatorId` - Get hackathons by creator
- `POST /api/hackathons` - Create a new hackathon
- `PUT /api/hackathons/:id` - Update a hackathon
- `DELETE /api/hackathons/:id` - Delete a hackathon
- `POST /api/hackathons/:id/participants` - Register for a hackathon

## MongoDB Schema

The application uses two main collections:

1. **Hackathons** - Stores hackathon information
2. **Users** - Stores user information

## Development

### Database Connection

The MongoDB connection is handled in the `src/db/connection.ts` file. The connection string can be configured in the `.env` file.

### Seeding Initial Data

The application will automatically seed initial hackathon data if the database is empty when the server starts.
