const createList = function (sId, oParent) {
    if (!oParent) {
        oParent = document.body;
    }
    const oList = document.createElement('ul');
    oList.id = sId;
    oParent.appendChild(oList);
    return oList;
};

exports.createList = createList;