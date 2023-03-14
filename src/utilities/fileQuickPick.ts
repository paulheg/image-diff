import * as vscode from 'vscode';
import * as path from 'path';

export class QuickFilePickOptions {

    // title of the quick pick
    title?: string;

    // additional items that will ne displayed at the top 
    additional?: vscode.Uri[];

}

export async function openFileQuickPick(getFiles: (searchTerm: string) => Thenable<vscode.Uri[]>, options?: QuickFilePickOptions): Promise<vscode.Uri | undefined> {
    const disposables: vscode.Disposable[] = [];
    try {
        return await new Promise(async (resolve, reject) => {
            const pick = vscode.window.createQuickPick<FileItem>();

            pick.title = options?.title ?? 'Select file';
            const additional = (options?.additional ?? []).map(i => new FileItem(i));

            const loadFiles = async (search: string) => {
                pick.busy = true;

                var combine: FileItem[] = [];
                if (additional.length > 0) {
                    combine = combine.concat(additional);
                    combine.push(new SplitItem());
                }
                combine = combine.concat((await getFiles(search)).map(i => new FileItem(i)));

                pick.items = combine;
                pick.busy = false;
            };

            disposables.push(pick.onDidChangeValue(async (search: string) => {
                loadFiles(search);
            }));

            disposables.push(pick.onDidChangeSelection((items : readonly FileItem[]) => {
                if (items.length > 0) {
                    const item = items[0];
                    resolve(item.uri);
                    pick.hide();
                }
            }));

            disposables.push(pick.onDidHide(() => {
                resolve(undefined);
                pick.dispose();
            }));

            pick.show();
            loadFiles('');
        });
    } finally {
        disposables.forEach(i => i.dispose());
    }
}

class FileItem implements vscode.QuickPickItem {

    uri: vscode.Uri;
    label: string;
    detail: string;

    description?: string | undefined;

    constructor(uri: vscode.Uri) {
        this.uri = uri;
        // this.description = 'File';
        this.detail = uri.fsPath;
        this.label = path.basename(uri.fsPath);
    }    
}

class SplitItem extends FileItem {
    
    constructor() {
        super(vscode.Uri.parse(''));
    }

    public get kind() : vscode.QuickPickItemKind {
        return vscode.QuickPickItemKind.Separator;
    }
}