const sKeeperDirectory = '/Users/martin/.fakekeeper';

const STYLE_EXPAND_PARAGRAPH = 'expand';
let oFileSystem;

const readFileContent = async function (sFilename) {
    const sContent = await oFileSystem.readFile(`${sKeeperDirectory}/${sFilename}`);
    return sContent;
};

const toggleParagraphContent  = function (oContentParagraph, sContent) {
    if (oContentParagraph.classList.contains(STYLE_EXPAND_PARAGRAPH)) {
        oContentParagraph.innerText = '';
        oContentParagraph.classList.remove(STYLE_EXPAND_PARAGRAPH);
    } else {
        oContentParagraph.innerText = sContent;
        oContentParagraph.classList.add(STYLE_EXPAND_PARAGRAPH);
    }
};

const handleFileClick = async function (oEvent) {
    const oTarget = oEvent.target;
    const oFilenameParagraph = oTarget.parentElement;
    const sFilename = oFilenameParagraph.id.substring('filename'.length + 1);
    const oContentParagraph = document.getElementById(`content-${sFilename}`);
    const sContent = await readFileContent(sFilename);
    toggleParagraphContent(oContentParagraph, sContent);
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
    oFileSystem = oFS;
    try {
        oFileSystem.readdir(sKeeperDirectory).then(async (aFiles) => {
            for (const sFilename of aFiles) {
                const sContent = await readFileContent(sFilename);
                addListItem('fileList', sFilename, sContent);
            }
        });
    } catch (oError) {
        console.error(oError);
    }
};

exports.renderFiles = renderFiles;