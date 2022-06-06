const oOpenPgp = require('openpgp');
const { readFile } = require('fs/promises');
const { ipcRenderer } = require('electron');

const sDefaultKeeperDirectory = '/Users/martin/.fakekeeper';

const STYLE_EXPAND_PARAGRAPH = 'expand';
const FILE_EXTENSION_ENCRYPTED = 'asc';
const MAX_CONTENT_LENGTH = 1024;
const PASSWORD_POPUP_TIMEOUT_SECONDS = 600;

let oFileSystem;
let oKeeperDirectoryInput;
let oAddEntryPopupObject = {};
let oPasswordPopupObject = {};
let nPasswordPopupCloseTimeoutId = -1;
let nPasswordPopupCloseCountdownIntervalId = -1;
let nPasswordPopupCloseCountdown = 0;

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

const startPasswordPopupCountdown = function () {
    nPasswordPopupCloseCountdown = PASSWORD_POPUP_TIMEOUT_SECONDS;
    nPasswordPopupCloseTimeoutId = setTimeout(handlePasswordPopupTimeoutExpired, PASSWORD_POPUP_TIMEOUT_SECONDS  * 1000);
    nPasswordPopupCloseCountdownIntervalId = setInterval(handlePasswordPopupCountdownInterval, 1000);
};

const usePasswordPopupToReadFile = async function () {
    const sPassword = oPasswordPopupObject.passwordInput.value;
    const sKeeperDirectory = oKeeperDirectoryInput.value;
    const sContent = await readFileContent(oPasswordPopupObject.filename, sPassword, sKeeperDirectory);
    startPasswordPopupCountdown();
    oPasswordPopupObject.contentParagraph.innerText = sContent;
    oPasswordPopupObject.contentParagraph.classList.add(STYLE_EXPAND_PARAGRAPH);
};

const handleFilePressed = function (oEvent) {
    const oTarget = oEvent.target;
    const nPageVerticalOffset = oEvent.pageY;
    const oFilenameParagraph = oTarget.parentElement;
    const sFilename = oFilenameParagraph.id.substring('filename'.length + 1);
    showPasswordPopup(sFilename, nPageVerticalOffset);
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
    const fnHandleCloseActionDefault = function () {
        if (oPopup.classList.contains('show')) {
            oPopup.classList.remove('show');
        }
    };
    oPopup.classList.add('popup');

    const oConfirmButton = addButton('Ok', oPopup);
    if (!fnConfirmAction) {
        fnConfirmAction = fnHandleCloseActionDefault;
    }
    oConfirmButton.onclick = fnConfirmAction;

    const oCancelButton = addButton('Cancel', oPopup);
    if (!fnCancelAction) {
        fnCancelAction = fnHandleCloseActionDefault;
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

const closePasswordPopup = function () {
    clearTimeout(nPasswordPopupCloseTimeoutId);
    clearInterval(nPasswordPopupCloseCountdownIntervalId);
    if (oPasswordPopupObject.view.classList.contains('show')) {
        oPasswordPopupObject.view.classList.remove('show');
    }
    oPasswordPopupObject.passwordInput.value = '';
    oPasswordPopupObject.contentParagraph.innerText = '';
    oPasswordPopupObject.countdownDiv.style.width = 0;
};

const handlePasswordPopupCountdownInterval = function () {
    nPasswordPopupCloseCountdown--;
    const nPercent = Math.floor(nPasswordPopupCloseCountdown * 100 / PASSWORD_POPUP_TIMEOUT_SECONDS);
    oPasswordPopupObject.countdownDiv.style.width = `${nPercent}%`;
};

const handlePasswordPopupTimeoutExpired = function () {
    closePasswordPopup();
};

const handlePasswordPopupConfirmButtonPressed = function () {
    closePasswordPopup();
};

const handlePasswordPopupCancelButtonPressed = function () {
    closePasswordPopup();
};

const showPasswordPopup = function (sFilename, nPageVerticalOffset) {
    if (!oPasswordPopupObject.view.classList.contains('show')) {
        oPasswordPopupObject.view.style.top = nPageVerticalOffset;
        oPasswordPopupObject.view.classList.add('show');
        oPasswordPopupObject.filename = sFilename;
    }
};

const addPasswordPopup = function (oParent) {
    const oPopupObject = addPopupObject(oParent);

    oPopupObject.passwordInput = addPasswordInput('password', oPopupObject.view);
    const oShowContentButton = addButton('show', oPopupObject.view);
    oShowContentButton.onclick = usePasswordPopupToReadFile;
    oPopupObject.passwordInput.onkeyup = oEvent => {
        if (oEvent.key === 'Enter') {
            oShowContentButton.click();
        }
    };

    oPopupObject.confirmButton.onclick = handlePasswordPopupConfirmButtonPressed;
    oPopupObject.cancelButton.onclick = handlePasswordPopupCancelButtonPressed;

    oPopupObject.contentParagraph = document.createElement('p');
    oPopupObject.view.appendChild(oPopupObject.contentParagraph);

    oPopupObject.countdownDiv = document.createElement('div');
    oPopupObject.countdownDiv.classList.add('countdown');
    oPopupObject.countdownDiv.style.width = 0;
    oPopupObject.view.appendChild(oPopupObject.countdownDiv);

    return oPopupObject;
};

const handleKeeperDirectoryChange = function () {
    const sKeeperDirectory = oKeeperDirectoryInput.value;
    renderFileList(sKeeperDirectory);
};

const handleKeeperDirectoryInputChange = function () {
    handleKeeperDirectoryChange();
};

const handleChooseKeeperDirectoryButtonTapped = async function () {
    ipcRenderer.send('showOpenDialog');
};

ipcRenderer.on('choose-keeper-directory-response', (oResponse, oArgument) => {
    const sSelectedDirectory = (oArgument && !oArgument.canceled) ? oArgument.selectedDirectory : null;
    if (sSelectedDirectory) {
        oKeeperDirectoryInput.value = sSelectedDirectory;
    } else {
        oKeeperDirectoryInput.value = '';
    }
    handleKeeperDirectoryChange();
});

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
    const oChooseKeeperDirectoryButton = addButton('Select...');
    oChooseKeeperDirectoryButton.onclick = handleChooseKeeperDirectoryButtonTapped;
    oAddEntryPopupObject = addAddEntryPopup();
    oPasswordPopupObject = addPasswordPopup();
};

exports.renderApp = renderApp;