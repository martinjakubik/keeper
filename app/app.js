const addListItem = (sSelector, sText) => {
    const oElement = document.getElementById(sSelector);
    if (oElement) {
        const oListElement = document.createElement('li');
        oListElement.innerHTML = sText;
        oElement.appendChild(oListElement);
    }
}

const renderFiles = function (oFS) {
    
    try {
        oFS.readdir('/Users/martin/.fakekeeper').then((aFiles) => {
            for (const sFile of aFiles) {
                addListItem('fileList', sFile)
            }
        });
    } catch (oError) {
        console.error(oError);
    }
}

exports.renderFiles = renderFiles;