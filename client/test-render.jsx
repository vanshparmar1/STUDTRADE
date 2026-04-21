import { renderToString } from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import App from './src/App.jsx';

try {
  renderToString(
    <StaticRouter location="/">
      <App />
    </StaticRouter>
  );
  console.log("Render successful");
} catch (e) {
  console.error("Render failed: ", e.message, e.stack);
}
