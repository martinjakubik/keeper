const oUtil = require('util');
const oChildProcess = require('child_process');
const { on } = require('events');
const oProcessExec = oUtil.promisify(oChildProcess.exec);

const sKeeperDirectory = '/Users/martin/.fakekeeper';

const STYLE_EXPAND_PARAGRAPH = 'expand';
const FILE_EXTENSION_ENCRYPTED = 'asc';
const MAX_CONTENT_LENGTH = 1024;

let oFileSystem;
let oNewEntryInput;

const validateContent = function (sContent) {
    let sValidatedContent = '';
    if (sContent.length < MAX_CONTENT_LENGTH) {
        sValidatedContent = sContent;
    }
    return sValidatedContent;
};

const readFileContent = async function (sFilename) {
    let sContent = '';
    let sPlaintextFileContent = '';
    let sPassphrase = 'password';
    if (sFilename.endsWith(`.${FILE_EXTENSION_ENCRYPTED}`)) {
        const { stdout, stderr } = await oProcessExec(`gpg --batch --passphrase ${sPassphrase} -d ${sKeeperDirectory}/${sFilename}`);
        sPlaintextFileContent = stdout;
    } else {
        sPlaintextFileContent = await oFileSystem.readFile(`${sKeeperDirectory}/${sFilename}`);
    }
    sContent = validateContent(sPlaintextFileContent);
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

const newEntry = function () {
    const sValue = oNewEntryInput.value;
    addListItem('fileList', sValue);
    oNewEntryInput.value = '';
};

const addButton = function (sLabel, oParent) {
    if (!oParent) {
        oParent = document.body;
    }
    const oButton = document.createElement('button');
    oButton.innerText = sLabel;
    oParent.appendChild(oButton);
    return oButton;
};

const addInput = function (sLabel, oParent) {
    if (!oParent) {
        oParent = document.body;
    }
    const oInput = document.createElement('input');
    oParent.appendChild(oInput);
    return oInput;
};

const renderApp = function (oFS) {
    oFileSystem = oFS;
    try {
        oFileSystem.readdir(sKeeperDirectory).then(async (aFiles) => {
            for (const sFilename of aFiles) {
                addListItem('fileList', sFilename);
            }
        });
        oNewEntryInput = addInput();
        const oNewEntryButton = addButton('New');
        oNewEntryButton.onclick = newEntry;
    } catch (oError) {
        console.error(oError);
    }
};

exports.renderApp = renderApp;