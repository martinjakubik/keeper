const oUtil = require('util');
const oChildProcess = require('child_process');
const { on } = require('events');
const { get } = require('http');
const oProcessExec = oUtil.promisify(oChildProcess.exec);

const sDefaultKeeperDirectory = '/Users/martin/.fakekeeper';

const STYLE_EXPAND_PARAGRAPH = 'expand';
const FILE_EXTENSION_ENCRYPTED = 'asc';
const MAX_CONTENT_LENGTH = 1024;

let oFileSystem;
let oKeeperDirectoryInput;
let oAddEntryInput;
let oAddEntryPopupObject = {};
let oPasswordPopupObject = {};

const sDefaultPassword = 'password';

const validateContent = function (sContent) {
    let sValidatedContent = '';
    if (sContent.length < MAX_CONTENT_LENGTH) {
        sValidatedContent = sContent;
    }
    return sValidatedContent;
};

const readFileContent = async function (sFilename, sPassword, sKeeperDirectory) {
    let sContent = '';
    let sPlaintextFileContent = '';
    let sPasswordOrDefault = sPassword ? sPassword : sDefaultPassword;
    let sKeeperDirectoryOrDefault = sKeeperDirectory ? sKeeperDirectory : sDefaultKeeperDirectory;
    if (sFilename.endsWith(`.${FILE_EXTENSION_ENCRYPTED}`)) {
        const { stdout, stderr } = await oProcessExec(`gpg --batch --passphrase ${sPasswordOrDefault} -d ${sKeeperDirectoryOrDefault}/${sFilename}`);
        if (stderr && stderr.length > 0) {
            console.error(stderr);
        }
        sPlaintextFileContent = stdout;
    } else {
        sPlaintextFileContent = await oFileSystem.readFile(`${sKeeperDirectoryOrDefault}/${sFilename}`);
    }
    sContent = validateContent(sPlaintextFileContent);
    return sContent;
};

const writeFileContent = async function (sFilename, sContent, sKeeperDirectory) {
    const sValidatedContent = validateContent(sContent);
    await oFileSystem.writeFile(`${sKeeperDirectory}/${sFilename}`, sValidatedContent);
    return sContent;
};

const usePasswordPopupToReadFile = async function () {
    const sPassword = oPasswordPopupObject.passwordInput.value;
    const sKeeperDirectory = oKeeperDirectoryInput.value;
    handlePasswordPopupConfirmButtonClick();
    const sContent = await readFileContent(oPasswordPopupObject.filename, sPassword, sKeeperDirectory);
    const oContentParagraph = oPasswordPopupObject.contentParagraph;
    oContentParagraph.innerText = sContent;
    oContentParagraph.classList.add(STYLE_EXPAND_PARAGRAPH);
};

const toggleFileContentParagraph  = async function (oContentParagraph, sFilename) {
    if (oContentParagraph.classList.contains(STYLE_EXPAND_PARAGRAPH)) {
        oContentParagraph.innerText = '';
        oContentParagraph.classList.remove(STYLE_EXPAND_PARAGRAPH);
    } else {
        oPasswordPopupObject.confirmButton.onclick = usePasswordPopupToReadFile;
        showPasswordPopup(oContentParagraph, sFilename);
    }
};

const handleFileClick = async function (oEvent) {
    const oTarget = oEvent.target;
    const oFilenameParagraph = oTarget.parentElement;
    const sFilename = oFilenameParagraph.id.substring('filename'.length + 1);
    const oContentParagraph = document.getElementById(`content-${sFilename}`);
    toggleFileContentParagraph(oContentParagraph, sFilename);
};

const addListItem = (sSelector, sFilename, sContent) => {
    const oElement = document.getElementById(sSelector);
    if (oElement) {
        const oListElement = document.createElement('li');
        const oFilenameParagraph = document.createElement('p');
        oFilenameParagraph.id = `filename-${sFilename}`;
        const oContentParagraph = document.createElement('p');
        oContentParagraph.id = `content-${sFilename}`;
        oContentParagraph.classList.add('content');
        const oAnchor = document.createElement('a');
        oListElement.appendChild(oFilenameParagraph);
        oListElement.appendChild(oContentParagraph);
        oFilenameParagraph.appendChild(oAnchor);
        oContentParagraph.innerText = sContent;
        oAnchor.innerText = sFilename;
        oAnchor.onclick = handleFileClick;
        oElement.appendChild(oListElement);
    }
};

const handleAddEntryButton = function () {
    oAddEntryPopupObject.view.classList.toggle('show');
};

const handleNewEntry = function () {
    const sKeeperDirectory = oKeeperDirectoryInput.value;
    const sValue = oAddEntryInput.value;
    addListItem('fileList', sValue);
    writeFileContent(sValue, sValue, sKeeperDirectory);
    oAddEntryInput.value = '';
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

    if(sLabel) {
        const oLabel = document.createElement('p');
        oLabel.innerText = sLabel;
        oParent.appendChild(oLabel);
    }

    const oInput = document.createElement('input');
    oParent.appendChild(oInput);

    return oInput;
};

const addPasswordInput = function (sLabel, oParent) {
    const oInput = addInput(sLabel, oParent);
    oInput.type = 'password';

    return oInput;
};

const addPopup = function (oParent, fnConfirmAction, fnCancelAction) {
    const oPopup = document.createElement('div');
    if (!oParent) {
        oParent = document.body;
    }
    const fnHandleCancelActionDefault = function () {
        if (oPopup.classList.contains('show')) {
            oPopup.classList.remove('show');
        }
    };
    oPopup.classList.add('popup');

    const oConfirmButton = addButton('Ok', oPopup);
    if (!fnConfirmAction) {
        fnConfirmAction = fnHandleCancelActionDefault;
    }
    oConfirmButton.onclick = fnConfirmAction;

    const oCancelButton = addButton('Cancel', oPopup);
    if (!fnCancelAction) {
        fnCancelAction = fnHandleCancelActionDefault;
    }
    oCancelButton.onclick = fnCancelAction;

    oParent.appendChild(oPopup);
    return {
        view: oPopup,
        confirmButton: oConfirmButton,
        cancelButton: oCancelButton
    };
};

const addAddEntryPopup = function (oParent) {
    const oPopup = addPopup(oParent);

    oAddEntryPopupObject.entryNameInput = addInput('entry', oPopup.view);

    oAddEntryPopupObject.entryPasswordInput = addInput('password', oPopup.view);

    oAddEntryPopupObject.entryRepeatPasswordInput = addInput('repeatPassword', oPopup.view);

    return oPopup;
};

const handlePasswordPopupConfirmButtonClick = function () {
    if (oPasswordPopupObject.view.classList.contains('show')) {
        oPasswordPopupObject.view.classList.remove('show');
    }
    oPasswordPopupObject.passwordInput.value = '';
};

const showPasswordPopup = function (oContentParagraph, sFilename) {
    if (!oPasswordPopupObject.view.classList.contains('show')) {
        oPasswordPopupObject.view.classList.add('show');
        oPasswordPopupObject.contentParagraph = oContentParagraph;
        oPasswordPopupObject.filename = sFilename;
    }
};

const addPasswordPopup = function (oParent) {
    const oPopup = addPopup(oParent);

    oPopup.passwordInput = addPasswordInput('password', oPopup.view);
    oPopup.confirmButton.onclick = handlePasswordPopupConfirmButtonClick;

    return oPopup;
};

const handleKeeperDirectoryInputChange = function () {
    const sKeeperDirectory = oKeeperDirectoryInput.value;
    renderFileList(sKeeperDirectory);
};

const clearList = function (sSelector) {
    const oListElement = document.getElementById(sSelector);
    if (oListElement) {
        while (oListElement.lastChild) {
            oListElement.removeChild(oListElement.lastChild);
        }
    }
};

const renderFileList = function (sKeeperDirectory) {
    try {
        clearList('fileList');
        oFileSystem.readdir(sKeeperDirectory).then(async (aFiles) => {
            for (const sFilename of aFiles) {
                const sContent = await oFileSystem.readFile(`${sKeeperDirectory}/${sFilename}`);
                addListItem('fileList', sFilename, sContent);
            }
        });
    } catch (oError) {
        console.error(oError);
    }
};

const renderApp = function (oFS, sKeeperDirectory) {
    oFileSystem = oFS;
    let sKeeperDirectoryOrDefault = sKeeperDirectory ? sKeeperDirectory : sDefaultKeeperDirectory;
    renderFileList(sKeeperDirectoryOrDefault);
    oKeeperDirectoryInput = addInput('keeperDirectory');
    oKeeperDirectoryInput.onchange = handleKeeperDirectoryInputChange;
    const oAddEntryButton = addButton('Add');
    oAddEntryButton.onclick = handleAddEntryButton;
    oAddEntryPopupObject = addAddEntryPopup();
    oPasswordPopupObject = addPasswordPopup();
};

exports.renderApp = renderApp;