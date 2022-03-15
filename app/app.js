const handleFileClick = function (oEvent) {
    const oParagraph = oEvent.target;
    oParagraph.classList.toggle('expand');
};

const addListItem = (sSelector, sText) => {
    const oElement = document.getElementById(sSelector);
    if (oElement) {
        const oListElement = document.createElement('li');
        const oParagraph = document.createElement('p');
        const oAnchor = document.createElement('a');
        oListElement.appendChild(oParagraph);
        oParagraph.appendChild(oAnchor);
        oAnchor.innerText = sText;
        oAnchor.onclick = handleFileClick;
        oElement.appendChild(oListElement);
    }
};

const renderFiles = function (oFS) {
    try {
        oFS.readdir('/Users/martin/.fakekeeper').then((aFiles) => {
            for (const sFile of aFiles) {
                addListItem('fileList', sFile);
            }
        });
    } catch (oError) {
        console.error(oError);
    }
};

exports.renderFiles = renderFiles;