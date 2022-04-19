const oOpenPgp = require('openpgp');
const { readFile } = require('fs/promises');

const sDefaultKeeperDirectory = '/Users/martin/.fakekeeper';

const STYLE_EXPAND_PARAGRAPH = 'expand';
const FILE_EXTENSION_ENCRYPTED = 'asc';
const MAX_CONTENT_LENGTH = 1024;

let oFileSystem;
let oKeeperDirectoryInput;
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
        const sEncryptedFileContent = await readFile(`${sKeeperDirectoryOrDefault}/${sFilename}`, 'utf-8');
        const oEncryptedMessage = await oOpenPgp.readMessage({
            armoredMessage: sEncryptedFileContent
        });
        try {
            const { data: sDecrypted } = await oOpenPgp.decrypt({
                message: oEncryptedMessage,
                passwords: sPasswordOrDefault
            });
            sPlaintextFileContent = sDecrypted;
        } catch (error) {
            sPlaintextFileContent = '';
        }
    } else {
        sPlaintextFileContent = await oFileSystem.readFile(`${sKeeperDirectoryOrDefault}/${sFilename}`);
    }
    sContent = validateContent(sPlaintextFileContent);
    return sContent;
};

const usePasswordPopupToReadFile = async function () {
    const sPassword = oPasswordPopupObject.passwordInput.value;
    const sKeeperDirectory = oKeeperDirectoryInput.value;
    const sContent = await readFileContent(oPasswordPopupObject.filename, sPassword, sKeeperDirectory);
    oPasswordPopupObject.contentParagraph.innerText = sContent;
    oPasswordPopupObject.contentParagraph.classList.add(STYLE_EXPAND_PARAGRAPH);
};

const handleFilePressed = function (oEvent) {
    const oTarget = oEvent.target;
    const oFilenameParagraph = oTarget.parentElement;
    const sFilename = oFilenameParagraph.id.substring('filename'.length + 1);
    showPasswordPopup(sFilename);
};

const addListItem = (sSelector, sFilename) => {
    const oElement = document.getElementById(sSelector);
    if (oElement) {
        const oListElement = document.createElement('li');
        const oFilenameParagraph = document.createElement('p');
        oFilenameParagraph.id = `filename-${sFilename}`;
        const oAnchor = document.createElement('a');
        oListElement.appendChild(oFilenameParagraph);
        oFilenameParagraph.appendChild(oAnchor);
        oAnchor.innerText = sFilename;
        oAnchor.onclick = handleFilePressed;
        oElement.appendChild(oListElement);
    }
};

const handleAddEntryButton = function () {
    oAddEntryPopupObject.view.classList.toggle('show');
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

const addPopupObject = function (oParent, fnConfirmAction, fnCancelAction) {
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
    const oPopupObject = addPopupObject(oParent);

    oAddEntryPopupObject.entryNameInput = addInput('entry', oPopupObject.view);

    oAddEntryPopupObject.entryPasswordInput = addInput('password', oPopupObject.view);

    oAddEntryPopupObject.entryRepeatPasswordInput = addInput('repeatPassword', oPopupObject.view);

    return oPopupObject;
};

const handlePasswordPopupConfirmButtonPressed = function () {
    if (oPasswordPopupObject.view.classList.contains('show')) {
        oPasswordPopupObject.view.classList.remove('show');
    }
    oPasswordPopupObject.passwordInput.value = '';
    oPasswordPopupObject.contentParagraph.innerText = '';
};

const showPasswordPopup = function (sFilename) {
    if (!oPasswordPopupObject.view.classList.contains('show')) {
        oPasswordPopupObject.view.classList.add('show');
        oPasswordPopupObject.filename = sFilename;
    }
};

const addPasswordPopup = function (oParent) {
    const oPopupObject = addPopupObject(oParent);

    oPopupObject.passwordInput = addPasswordInput('password', oPopupObject.view);
    const oShowContentButton = addButton('show', oPopupObject.view);
    oShowContentButton.onclick = usePasswordPopupToReadFile;

    oPopupObject.confirmButton.onclick = handlePasswordPopupConfirmButtonPressed;

    oPopupObject.contentParagraph = document.createElement('p');
    oPopupObject.view.appendChild(oPopupObject.contentParagraph);

    return oPopupObject;
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
                addListItem('fileList', sFilename);
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