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

const clearList = function (sSelector) {
    const oListElement = document.getElementById(sSelector);
    if (oListElement) {
        while (oListElement.lastChild) {
            oListElement.removeChild(oListElement.lastChild);
        }
    }
};

const createListItem = (sParentList, sFilename, fnItemTapped) => {
    let oListElementObject = {};
    const oParentList = document.getElementById(sParentList);
    if (oParentList) {
        const oListElement = document.createElement('li');
        const oFilenameParagraph = document.createElement('p');
        oFilenameParagraph.id = `filename-${sFilename}`;
        const oAnchor = document.createElement('a');
        oAnchor.tabIndex = 0;
        oAnchor.onclick = fnItemTapped;
        oAnchor.onkeyup = oEvent => {
            if (oEvent.key === 'Enter') {
                fnItemTapped(oEvent);
            }
        };
        oListElement.appendChild(oFilenameParagraph);
        oFilenameParagraph.appendChild(oAnchor);
        oAnchor.innerText = sFilename;
        oParentList.appendChild(oListElement);
        oListElementObject.view = oListElement;
        oListElementObject.anchor = oAnchor;
    }
    return oListElementObject;
};

const createSearchInput = function (sLabel, fnOnInputChanged, fnOnClearButtonTapped, oParent) {
    if (!oParent) {
        oParent = document.body;
    }

    const oSearchInputContainer = document.createElement('div');
    oSearchInputContainer.classList.add('searchInput');
    const oInputFilterText = createTextInput('searchInput', '', null, oSearchInputContainer);
    const oBtnClear = createButton('btnClearSearch', sLabel, oSearchInputContainer);

    oInputFilterText.onkeyup = oEvent => {
        if (oEvent.key === 'Escape') {
            oInputFilterText.value = '';
            fnOnClearButtonTapped();
        }
    };

    oInputFilterText.oninput = fnOnInputChanged;

    oBtnClear.onclick = fnOnClearButtonTapped;

    oParent.appendChild(oSearchInputContainer);

    return {
        view: oSearchInputContainer,
        input: oInputFilterText,
        button: oBtnClear
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
        if (sType) {
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

const getFormattedCountdownPoint = function (aPoint, index, nNumberOfPoints, nScale = 20) {
    const nIncrement = Math.PI * (index * 2 / nNumberOfPoints - 0.5);
    const nCosine = Math.cos(nIncrement);
    const nSine = Math.sin(nIncrement);
    return Math.floor(aPoint[0] + nCosine * nScale) + 'px ' + Math.floor(aPoint[1] + nSine * nScale) + 'px';
};

const getCountdownShape = function (nTicks, nTotalTicks) {
    const nNumberOfPoints = 30;
    const aStartPoint = [80, 30];
    let aFormattedPoints = [];
    const nTicksByPoints = Math.floor(nTotalTicks / nNumberOfPoints);
    aFormattedPoints.push(getFormattedCountdownPoint(aStartPoint, 0, nNumberOfPoints));
    aFormattedPoints.push(Math.floor(aStartPoint[0]) + 'px ' + Math.floor(aStartPoint[1]) + 'px');
    if (nTicks > 0) {
        for (let nPoint = 1; nPoint < nNumberOfPoints; nPoint++) {
            if (nTicks < nPoint * nTicksByPoints) {
                aFormattedPoints.push(getFormattedCountdownPoint(aStartPoint, nPoint, nNumberOfPoints));
            }
        }
    }
    const sShapePoints = aFormattedPoints.join(',');
    return 'polygon(' + sShapePoints + ')';
};

exports.createList = createList;
exports.clearList = clearList;
exports.createListItem = createListItem;
exports.createSearchInput = createSearchInput;
exports.createPopupObject = createPopupObject;
exports.getCountdownShape = getCountdownShape;