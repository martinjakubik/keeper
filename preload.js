const fs = require('fs/promises');
const app = require('./app/app.js');

window.addEventListener('DOMContentLoaded', () => {
    app.renderFiles(fs);
});