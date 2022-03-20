const oUtil = require('util');
const oChildProcess = require('child_process');
const oProcessExec = oUtil.promisify(oChildProcess.exec);

const sKeeperDirectory = '/Users/martin/.fakekeeper';

const STYLE_EXPAND_PARAGRAPH = 'expand';
const FILE_EXTENSION_ENCRYPTED = 'asc';

let oFileSystem;

const readFileContent = async function (sFilename) {
    let sContent = '';
    let sPassphrase = 'password';
    if (sFilename.endsWith(`.${FILE_EXTENSION_ENCRYPTED}`)) {
        const { stdout, stderr } = await oProcessExec(`gpg --batch --passphrase ${sPassphrase} -d ${sKeeperDirectory}/${sFilename}`);
        sContent = stdout;
    } else {
        sContent = await oFileSystem.readFile(`${sKeeperDirectory}/${sFilename}`);
    }
    return sContent;
};

const toggleFileContentParagraph  = async function (oContentParagraph, sFilename) {
    if (oContentParagraph.classList.contains(STYLE_EXPAND_PARAGRAPH)) {
        oContentParagraph.innerText = '';
        oContentParagraph.classList.remove(STYLE_EXPAND_PARAGRAPH);
    } else {
        const sContent = await readFileContent(sFilename);
        oContentParagraph.innerText = sContent;
        oContentParagraph.classList.add(STYLE_EXPAND_PARAGRAPH);
    }
};

const handleFileClick = async function (oEvent) {
    const oTarget = oEvent.target;
    const oFilenameParagraph = oTarget.parentElement;
    const sFilename = oFilenameParagraph.id.substring('filename'.length + 1);
    const oContentParagraph = document.getElementById(`content-${sFilename}`);
    toggleFileContentParagraph(oContentParagraph, sFilename);
};

const addListItem = (sSelector, sText) => {
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
                addListItem('fileList', sFilename);
            }
        });
    } catch (oError) {
        console.error(oError);
    }
};

exports.renderFiles = renderFiles;