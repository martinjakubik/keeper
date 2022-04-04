// const fs = require('fs/promises');
import fs from 'fs/promises';
// const app = require('./app/app.js');
import app from './app/app.js';

window.addEventListener('DOMContentLoaded', () => {
    app.renderApp(fs);
});