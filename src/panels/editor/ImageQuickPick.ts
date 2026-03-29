import { Uri, window, workspace } from "vscode";
import { getFilename, isImage } from "../../utilities/uri";
import { QuickFilePickOptions, openFileQuickPick } from "../../utilities/fileQuickPick";
import * as path from "path";
import { GLOB_FILTER } from "./ImageDiffEditor";


function getImagesInTabs(): Uri[] {
    const images: Uri[] = [];

    window.tabGroups.all.forEach((tabGroup) => {
        tabGroup.tabs.forEach((tab) => {
            let uri: Uri | undefined;
            if (tab.input instanceof Uri) {
                uri = tab.input;
            } else if ('uri' in (tab.input as any)) {
                uri = (tab.input as any).uri;
            }

            if (uri !== undefined && isImage(uri)) {
                images.push(uri);
            }
        });
    });

    return images;
}


export async function openImageQuickPick(image: Uri): Promise<Uri | undefined> {
    const fileName = getFilename(image);

    const otherFilesWithName = (await workspace.findFiles(path.join('*', fileName)))
        .filter(f => f.fsPath !== image.fsPath);

    const options: QuickFilePickOptions = {
        additional: otherFilesWithName,
        title: 'Select image',
    };

    const searchFunc = async (term: string) => {

        const tab = getImagesInTabs();
        const pattern = path.join('**', term + GLOB_FILTER);

        const work = await workspace.findFiles(
            pattern,
            undefined,
            10);

        return tab.concat(work.filter((uri) => {
            return tab.indexOf(uri) === -1;
        }));

    };

    return openFileQuickPick(searchFunc, options);


}