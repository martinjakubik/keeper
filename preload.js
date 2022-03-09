const fs = require('fs/promises');

window.addEventListener('DOMContentLoaded', () => {
    const addListItem = (sSelector, sText) => {
        const oElement = document.getElementById(sSelector);
        if (oElement) {
            const oListElement = document.createElement('li');
            oElement.appendChild(oListElement);
        }
    }

    try {
        fs.readdir('/Users/martin/.fakekeeper').then((aFiles) => {
            for (const sFile of aFiles) {
                addListItem('fileList', sFile)
            }
        });
    } catch (oError) {
        console.error(oError);
    }
});