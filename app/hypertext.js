const { createButton, createTextInput } = require('../lib/js/learnhypertext.js');

const createList = function (sId, oParent) {
    if (!oParent) {
        oParent = document.body;
    }
    const oList = document.createElement('ul');
    oList.id = sId;
    oParent.appendChild(oList);
    return oList;
};

const createListItem = (sParentList, sFilename) => {
    let oListElementObject = {};
    const oParentList = document.getElementById(sParentList);
    if (oParentList) {
        const oListElement = document.createElement('li');
        const oFilenameParagraph = document.createElement('p');
        oFilenameParagraph.id = `filename-${sFilename}`;
        const oAnchor = document.createElement('a');
        oListElement.appendChild(oFilenameParagraph);
        oFilenameParagraph.appendChild(oAnchor);
        oAnchor.innerText = sFilename;
        oParentList.appendChild(oListElement);
        oListElementObject.view = oListElement;
        oListElementObject.anchor = oAnchor;
    }
    return oListElementObject;
};

const createSearchInput = function (sLabel, oParent) {
    if (!oParent) {
        oParent = document.body;
    }

    const oSearchInputContainer = document.createElement('div');
    oSearchInputContainer.classList.add('searchInput');
    const oInput = createTextInput('searchInput', '', null, oSearchInputContainer);
    const oButton = createButton('btnClearSearch', sLabel, oSearchInputContainer);

    oParent.appendChild(oSearchInputContainer);

    return {
        view: oSearchInputContainer,
        input: oInput,
        button: oButton
    };
};

const createPopupObject = function (oParent, fnConfirmAction, fnCancelAction) {
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

    const oConfirmButton = createButton('btnOk', 'Ok', oPopup);
    if (!fnConfirmAction) {
        fnConfirmAction = fnHandleCloseActionDefault;
    }
    oConfirmButton.onclick = fnConfirmAction;

    const oCancelButton = createButton('btnCancel', 'Cancel', oPopup);
    if (!fnCancelAction) {
        fnCancelAction = fnHandleCloseActionDefault;
    }
    oCancelButton.onclick = fnCancelAction;

    const fnAddInput = function (sLabel, sType) {
        const oLabel = document.createElement('p');
        oLabel.innerText = sLabel;
        oPopup.insertBefore(oLabel, oContentParagraph);
        const oInput = document.createElement('input');
        if(sType) {
            oInput.type = sType;
        }
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

exports.createList = createList;
exports.createListItem = createListItem;
exports.createSearchInput = createSearchInput;
exports.createPopupObject = createPopupObject;