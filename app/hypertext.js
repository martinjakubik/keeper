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


exports.createList = createList;
exports.createListItem = createListItem;
exports.createSearchInput = createSearchInput;