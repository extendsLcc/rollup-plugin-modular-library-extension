import { name } from './package.json';

export default () => ({
    name,
    generateBundle(output, info) {

        const getLastFolder = (whichString) => {
            return whichString.substring(0, whichString.lastIndexOf('/') + 1);
        };

        const nonEntry = Object.entries(info)
            .filter(([key, value]) => !value.isEntry)
        nonEntry
            .forEach(([nonEntryKey, nonEntryValue]) => {

                const nonEntryFileName = nonEntryValue.fileName;

                let isRootUncommon = false;

                const entriesThatImportThis = Object.entries(info)
                    .filter(([entryKey, entryValue]) => entryValue.imports.includes(nonEntryKey))

                const pathInCommon = entriesThatImportThis
                    .reduce((commonPath, [entryKey, entryValue], index) => {

                        const {fileName} = entryValue;
                        const currentFileLastFolderPath = getLastFolder(fileName)

                        index === 0 && (commonPath = currentFileLastFolderPath);

                        if(currentFileLastFolderPath.indexOf(commonPath) === 0) {
                            return commonPath;
                        }

                        do {
                            commonPath = getLastFolder(commonPath.slice(0, -1));
                            isRootUncommon = true;
                        } while (fileName.indexOf(commonPath) !== 0 && commonPath.length > 0);

                        return commonPath;

                    }, '');

                const newFileName = info[nonEntryKey].fileName.substring(info[nonEntryKey].fileName.lastIndexOf('/') + 1);
                const newFileNameWithPath = pathInCommon + newFileName;
                info[nonEntryKey].fileName = newFileNameWithPath
                info[newFileNameWithPath] = info[nonEntryKey];
                delete info[nonEntryKey];

                entriesThatImportThis.forEach(([entryKey, entryValue]) => {

                    entryValue.imports[entryValue.imports.indexOf(nonEntryKey)] = newFileNameWithPath;
                    entryValue.importedBindings[newFileNameWithPath] = entryValue.importedBindings[nonEntryKey];
                    delete entryValue.importedBindings[nonEntryKey];

                    const entryFilePath = getLastFolder(entryValue.fileName)
                    const entryFileName = nonEntryKey;

                    if(entryFilePath === pathInCommon) {

                        entryValue.code = entryValue.code.replace(new RegExp(`'.+${ entryFileName }`, 'g'), `'./${newFileName}`);

                    } else {

                        let upperFolder = [];
                        let currentEntryFolder = entryFilePath;

                        do {

                            currentEntryFolder = getLastFolder(currentEntryFolder.slice(0, -1));
                            upperFolder.push('..');

                        } while (currentEntryFolder !== pathInCommon && currentEntryFolder.length > 0)

                        entryValue.code = entryValue.code.replace(new RegExp(`'.+${ entryFileName }`, 'g'), `'${upperFolder.join('/')}/${newFileName}`);

                    }

                });

            })
    }
});
