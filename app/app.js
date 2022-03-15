const sKeeperDirectory = '/Users/martin/.fakekeeper';

const handleFileClick = function (oEvent) {
    const oTarget = oEvent.target;
    const oFilenameParagraph = oTarget.parentElement;
    const sText = oFilenameParagraph.id.substring('filename'.length + 1);
    console.log(`content-${sText}`);
    const oContentParagraph = document.getElementById(`content-${sText}`);
    oContentParagraph.classList.toggle('expand');
};

const addListItem = (sSelector, sText, sContent) => {
    const oElement = document.getElementById(sSelector);
    if (oElement) {
        const oListElement = document.createElement('li');
        const oFilenameParagraph = document.createElement('p');
        oFilenameParagraph.id = `filename-${sText}`;
        const oContentParagraph = document.createElement('p');
        oContentParagraph.id = `content-${sText}`;
        oContentParagraph.classList.add('content');
        const oAnchor = document.createElement('a');
        oListElement.appendChild(oFilenameParagraph);
        oListElement.appendChild(oContentParagraph);
        oFilenameParagraph.appendChild(oAnchor);
        oContentParagraph.innerText = sContent;
        oAnchor.innerText = sText;
        oAnchor.onclick = handleFileClick;
        oElement.appendChild(oListElement);
    }
};

const renderFiles = function (oFS) {
    try {
        oFS.readdir(sKeeperDirectory).then(async (aFiles) => {
            for (const sFile of aFiles) {
                const sContent = await oFS.readFile(`${sKeeperDirectory}/${sFile}`);
                addListItem('fileList', sFile, sContent);
            }
        });
    } catch (oError) {
        console.error(oError);
    }
};

exports.renderFiles = renderFiles;