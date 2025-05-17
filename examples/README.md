# Pinterest Integration Examples

This directory contains examples of how to integrate with the Pinterest API service using our SDK.

## Examples

1. **React Example** (`react-example.jsx`): Shows how to integrate the Pinterest SDK in a React application.
2. **Vanilla JavaScript Example** (`vanilla-js-example.html`): Shows how to integrate the Pinterest SDK in a vanilla JavaScript application.

## Running the Examples

### React Example

1. Create a new React application:
   ```bash
   npx create-react-app pinterest-integration-example
   cd pinterest-integration-example
   ```

2. Install the Pinterest SDK:
   ```bash
   npm install pinterest-integration-sdk
   ```

3. Copy the `react-example.jsx` file to your project's `src` directory.

4. Update your `App.js` to use the PinterestIntegration component:
   ```jsx
   import React from 'react';
   import './App.css';
   import PinterestIntegration from './react-example';

   function App() {
     return (
       <div className="App">
         <header className="App-header">
           <h1>Pinterest Integration Example</h1>
         </header>
         <main>
           <PinterestIntegration />
         </main>
       </div>
     );
   }

   export default App;
   ```

5. Start the development server:
   ```bash
   npm start
   ```

### Vanilla JavaScript Example

1. Create a new directory for your project:
   ```bash
   mkdir pinterest-vanilla-example
   cd pinterest-vanilla-example
   ```

2. Copy the `vanilla-js-example.html` file to your project directory.

3. Open the HTML file in your browser:
   ```bash
   open vanilla-js-example.html
   ```

## Notes

- Make sure to update the `apiBaseUrl` in the examples to point to your actual Pinterest API service URL.
- You need to register your domain with our service to enable CORS.
- The examples assume that you have already set up the Pinterest API service and have the necessary environment variables configured.
