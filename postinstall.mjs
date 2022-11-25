import * as oFs from 'fs/promises';

const sLibPath = './lib/js';

const oMkDirOptions = {
    recursive: true
};

oFs.mkdir(sLibPath, oMkDirOptions).then((oResult) => {
    console.log(oResult);

    oFs.copyFile(
        './node_modules/learnhypertext/dist/index.js', `${sLibPath}/learnhypertext.js`
    ).then((oResult) => {
        console.log(oResult);
    }).catch((oError) => {
        console.log(oError);
    });

}).catch((oError) => {
    console.log(oError);
});

