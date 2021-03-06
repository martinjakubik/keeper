const oOpenPgp = require('openpgp');
const { readFile } = require('fs/promises');
const { ipcRenderer } = require('electron');

const sDefaultKeeperDirectory = '/Users/martin/.fakekeeper';

const STYLE_EXPAND_PARAGRAPH = 'expand';
const FILE_EXTENSION_ENCRYPTED = 'asc';
const MAX_CONTENT_LENGTH = 1024;
const PASSWORD_POPUP_TIMEOUT_SECONDS = 600;
const MAX_FILE_FILTER_STRING_LENGTH = 30;

let oFileSystem;
let oFileFilterInput;
let oKeeperDirectoryInput;
let oAddEntryPopupObject = {};
let oPasswordPopupObject = {};
let nPasswordPopupCloseTimeoutId = -1;
let nPasswordPopupCloseCountdownIntervalId = -1;
let nPasswordPopupCloseCountdown = 0;

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
    let sKeeperDirectoryOrDefault = sKeeperDirectory ? sKeeperDirectory : sDefaultKeeperDirectory;
    if (sFilename.endsWith(`.${FILE_EXTENSION_ENCRYPTED}`)) {
        const sEncryptedFileContent = await readFile(`${sKeeperDirectoryOrDefault}/${sFilename}`, 'utf-8');
        const oEncryptedMessage = await oOpenPgp.readMessage({
            armoredMessage: sEncryptedFileContent
        });
        try {
            const { data: sDecrypted } = await oOpenPgp.decrypt({
                message: oEncryptedMessage,
                passwords: sPassword
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
    nPasswordPopupCloseTimeoutId = setTimeout(handlePasswordPopupTimeoutExpired, PASSWORD_POPUP_TIMEOUT_SECONDS * 1000);
    nPasswordPopupCloseCountdownIntervalId = setInterval(handlePasswordPopupCountdownInterval, 1000);
    const sShape = getShape(PASSWORD_POPUP_TIMEOUT_SECONDS, PASSWORD_POPUP_TIMEOUT_SECONDS);
    oPasswordPopupObject.countdownDiv.style.clipPath = sShape;
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

const addList = function (sId, oParent) {
    if (!oParent) {
        oParent = document.body;
    }
    const oList = document.createElement('ul');
    oList.id = sId;
    oParent.appendChild(oList);
    return oList;
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

    const oContentParagraph = document.createElement('p');
    oPopup.appendChild(oContentParagraph);

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

    const fnAddInput =  function (sLabel) {
        const oLabel = document.createElement('p');
        oLabel.innerText = sLabel;
        oPopup.insertBefore(oLabel, oContentParagraph);
        const oInput = document.createElement('input');
        oInput.type = 'password';
        oPopup.insertBefore(oInput, oContentParagraph);

        return oInput;
    };

    const fnAddButton = function (sLabel) {
        const oButton = document.createElement('button');
        oButton.innerText = sLabel;
        oPopup.insertBefore(oButton, oContentParagraph);
        return oButton;
    };

    oParent.appendChild(oPopup);
    return {
        view: oPopup,
        contentParagraph: oContentParagraph,
        confirmButton: oConfirmButton,
        cancelButton: oCancelButton,
        addInput: fnAddInput,
        addButton: fnAddButton
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
    nPasswordPopupCloseCountdown = 0;
    oPasswordPopupObject.passwordInput.value = '';
    oPasswordPopupObject.contentParagraph.innerText = '';
    oPasswordPopupObject.countdownDiv.style.backgroundColor = 'rgb(255, 255, 255)';
};

const getFormattedPoint = function (aPoint, index, nNumberOfPoints) {
    const nScale = 20;
    const nIncrement = index * 2 * Math.PI / nNumberOfPoints - Math.PI / 2;
    const nCosine = Math.cos(nIncrement);
    const nSine = Math.sin(nIncrement);
    return Math.floor(aPoint[0] + nCosine * nScale) + 'px ' + Math.floor(aPoint[1] + nSine * nScale) + 'px';
};

const getShape = function (nTicks, nTotalTicks) {
    const nNumberOfPoints = 30;
    const aStartPoint = [80, 30];
    let aFormattedPoints = [];
    const nTicksByPoints = Math.floor(nTotalTicks / nNumberOfPoints);
    aFormattedPoints.push(getFormattedPoint(aStartPoint, 0, nNumberOfPoints));
    aFormattedPoints.push(Math.floor(aStartPoint[0]) + 'px ' + Math.floor(aStartPoint[1]) + 'px');
    if (nTicks > 0) {
        for (let nPoint = 1; nPoint < nNumberOfPoints; nPoint++) {
            if (nTicks < nPoint * nTicksByPoints) {
                aFormattedPoints.push(getFormattedPoint(aStartPoint, nPoint, nNumberOfPoints));
            }
        }
    }
    const sShapePoints = aFormattedPoints.join(',');
    return 'polygon(' + sShapePoints + ')';
};

const updatePasswordPopupCountdown = function () {
    const sShape = getShape((PASSWORD_POPUP_TIMEOUT_SECONDS - nPasswordPopupCloseCountdown), PASSWORD_POPUP_TIMEOUT_SECONDS);
    oPasswordPopupObject.countdownDiv.style.clipPath = sShape;
};

const handlePasswordPopupCountdownInterval = function () {
    nPasswordPopupCloseCountdown--;
    updatePasswordPopupCountdown();
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
        updatePasswordPopupCountdown();
    }
};

const addPasswordPopup = function (oParent) {
    const oPopupObject = addPopupObject(oParent);

    oPopupObject.passwordInput = oPopupObject.addInput('password');
    const oShowContentButton = oPopupObject.addButton('show');
    oShowContentButton.onclick = usePasswordPopupToReadFile;
    oPopupObject.passwordInput.onkeyup = oEvent => {
        if (oEvent.key === 'Enter') {
            oShowContentButton.click();
        }
    };

    oPopupObject.confirmButton.onclick = handlePasswordPopupConfirmButtonPressed;
    oPopupObject.cancelButton.onclick = handlePasswordPopupCancelButtonPressed;

    oPopupObject.countdownDiv = document.createElement('div');
    oPopupObject.countdownDiv.classList.add('countdown');
    oPopupObject.view.appendChild(oPopupObject.countdownDiv);

    return oPopupObject;
};

const sanitizeFileFilterInput = function (sInput) {
    let sSanitizedInput = '';
    const sTruncatedInput = sInput.substring(0, MAX_FILE_FILTER_STRING_LENGTH - 1);
    const sLegalCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const nTruncatedLength = sTruncatedInput.length;
    for (let i = 0; i < nTruncatedLength; i++) {
        const c = sTruncatedInput.charAt(i);
        if (sLegalCharacters.indexOf(c) >= 0) {
            sSanitizedInput = sSanitizedInput + c;
        }
    }
    return sSanitizedInput;
};

const handleKeeperListChange = function () {
    const sFilter = sanitizeFileFilterInput(oFileFilterInput.value);
    const sKeeperDirectory = oKeeperDirectoryInput.value;
    renderFileList(sKeeperDirectory, sFilter);
};

const handleFileFilterInputChange = function () {
    handleKeeperListChange();
};

const handleKeeperDirectoryInputChange = function () {
    handleKeeperListChange();
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
    handleKeeperListChange();
});

const clearList = function (sSelector) {
    const oListElement = document.getElementById(sSelector);
    if (oListElement) {
        while (oListElement.lastChild) {
            oListElement.removeChild(oListElement.lastChild);
        }
    }
};

const isMatchForFilter = function (s, sFilter) {
    let bIsMatchForFilter = true;
    if (sFilter) {
        if (s.indexOf(sFilter) >= 0) {
            bIsMatchForFilter = true;
        } else {
            bIsMatchForFilter = false;
        }
    }
    return bIsMatchForFilter;
};

const renderFileList = function (sKeeperDirectory, sFilter) {
    if (!sKeeperDirectory || sKeeperDirectory.length < 1) {
        return;
    }
    try {
        clearList('fileList');
        oFileSystem.readdir(sKeeperDirectory).then(async (aFiles) => {
            for (const sFilename of aFiles) {
                if (isMatchForFilter(sFilename, sFilter)) {
                    addListItem('fileList', sFilename);
                }
            }
        });
    } catch (oError) {
        console.error(oError);
    }
};

const renderApp = function (oFS, sKeeperDirectory) {
    oFileSystem = oFS;
    let sKeeperDirectoryOrDefault = sKeeperDirectory ? sKeeperDirectory : sDefaultKeeperDirectory;
    oFileFilterInput = addInput();
    oFileFilterInput.oninput = handleFileFilterInputChange;
    addList('fileList');
    renderFileList(sKeeperDirectoryOrDefault);
    oKeeperDirectoryInput = addInput('choose directory');
    oKeeperDirectoryInput.value = sKeeperDirectoryOrDefault;
    oKeeperDirectoryInput.onchange = handleKeeperDirectoryInputChange;
    const oChooseKeeperDirectoryButton = addButton('Select...');
    oChooseKeeperDirectoryButton.onclick = handleChooseKeeperDirectoryButtonTapped;
    oAddEntryPopupObject = addAddEntryPopup();
    oPasswordPopupObject = addPasswordPopup();
};

exports.renderApp = renderApp;