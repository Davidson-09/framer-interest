# Pinterest Integration Examples

This directory contains examples of how to integrate with the Pinterest API service using our SDK.

## Examples

1. **React Examples**:
   - `react-example.jsx`: Shows how to integrate the Pinterest SDK in a React application.
   - `react-callback.jsx`: Shows how to handle the Pinterest authentication callback in a React application.

2. **Vanilla JavaScript Examples**:
   - `vanilla-js-example.html`: Shows how to integrate the Pinterest SDK in a vanilla JavaScript application.
   - `vanilla-js-callback.html`: Shows how to handle the Pinterest authentication callback in a vanilla JavaScript application.
   - `token-example.html`: Shows how to use the Pinterest SDK with an access token instead of cookies.

## Running the Examples

### React Examples

1. Create a new React application:
   ```bash
   npx create-react-app pinterest-integration-example
   cd pinterest-integration-example
   ```

2. Install the Pinterest SDK:
   ```bash
   npm install pinterest-integration-sdk
   ```

3. Copy the `react-example.jsx` and `react-callback.jsx` files to your project's `src` directory.

4. Set up routing in your application:
   ```bash
   npm install react-router-dom
   ```

5. Update your `App.js` to use the components with routing:
   ```jsx
   import React from 'react';
   import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
   import './App.css';
   import PinterestIntegration from './react-example';
   import PinterestCallback from './react-callback';

   function App() {
     return (
       <div className="App">
         <header className="App-header">
           <h1>Pinterest Integration Example</h1>
         </header>
         <main>
           <Router>
             <Routes>
               <Route path="/" element={<PinterestIntegration />} />
               <Route path="/callback" element={<PinterestCallback />} />
               <Route path="/dashboard" element={<div>Dashboard Page</div>} />
               <Route path="/login" element={<div>Login Page</div>} />
             </Routes>
           </Router>
         </main>
       </div>
     );
   }

   export default App;
   ```

6. Start the development server:
   ```bash
   npm start
   ```

### Vanilla JavaScript Examples

1. Create a new directory for your project:
   ```bash
   mkdir pinterest-vanilla-example
   cd pinterest-vanilla-example
   ```

2. Copy both `vanilla-js-example.html` and `vanilla-js-callback.html` files to your project directory.

3. Open the main HTML file in your browser:
   ```bash
   open vanilla-js-example.html
   ```

4. When you click the "Login with Pinterest" button, you'll be redirected to Pinterest for authentication. After authentication, you'll be redirected to the callback page, which will check for the Pinterest token cookie and redirect you back to the main page.

5. To try the token-based example, open the token example in your browser:
   ```bash
   open token-example.html
   ```

6. Enter your Pinterest access token in the input field and click "Verify Token" to verify the token, or "Fetch Pins" to fetch and display your pins.

## Notes

- Make sure to update the `apiBaseUrl` in the examples to point to your actual Pinterest API service URL.
- You need to register your domain with our service to enable CORS.
- The examples assume that you have already set up the Pinterest API service and have the necessary environment variables configured.
