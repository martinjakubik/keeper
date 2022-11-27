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

exports.createList = createList;
exports.createListItem = createListItem;