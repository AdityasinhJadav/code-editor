export const getBoilerplate = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
  
    switch (extension) {
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, World!</h1>
  <script src="script.js"></script>
</body>
</html>`;
      
      case 'css':
        return `body {
  font-family: sans-serif;
  margin: 2rem;
  background-color: #f0f0f0;
  color: #333;
}`;
  
      case 'js':
        return `console.log("Hello from script.js!");

// You can write your JavaScript code here
`;
  
      case 'jsx':
        return `import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  return <h1>Hello from React!</h1>;
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);`;

      case 'md':
          return `# New Document

Write something amazing...
`;
  
      default:
        return '';
    }
  };
