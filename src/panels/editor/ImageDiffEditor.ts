import * as vscode from 'vscode';
import * as path from 'path';
import { ImageDiffDocument } from './ImageDiffDocument';
import { Disposable } from '../../utilities/disposable';
import { getNonce } from '../../utilities/getNonce';
import { getUri } from '../../utilities/getUri';
import { Command, Commands } from './commands';
import { openFileQuickPick } from '../../utilities/fileQuickPick';

export const SUPPORTED_EXTNAMES: string[] = ['.jpg','.jpe','.jpeg','.png','.bmp','.gif','.ico','.webp','.avif'];

export function registerImageDiffSupport(context: vscode.ExtensionContext): vscode.Disposable {

    // register the extensions the be used in the package json
    vscode.commands.executeCommand('setContext', 'imageDiff.supportedExtnames', SUPPORTED_EXTNAMES);

    vscode.commands.registerCommand('imageDiff.loadSecond', () => {

		const documentUri = (vscode.window.tabGroups.activeTabGroup.activeTab?.input as any).uri as vscode.Uri;
        const editor = ImageDiffEditorProvider.editors.get(documentUri.fsPath);

        if (editor === undefined) {
            vscode.window.showErrorMessage('Editor not found, please open an issue on github.com/paulheg/image-diff');
        }
        
        editor?.openSecondImage();
    });

    vscode.commands.registerCommand('imageDiff.current', async () => {

        const documentUri = (vscode.window.tabGroups.activeTabGroup.activeTab?.input as any).uri as vscode.Uri;

		if (documentUri === undefined) {
			vscode.window.showErrorMessage('No active file');
			return;
		}
        
        vscode.commands.executeCommand(
            'vscode.openWith', 
            documentUri, 
            ImageDiffEditorProvider.viewType
        );
	});

	const provider = new ImageDiffEditorProvider(context);

	return vscode.window.registerCustomEditorProvider(
        ImageDiffEditorProvider.viewType, 
        provider, 
        {
            webviewOptions: {
                retainContextWhenHidden: false,
		    },
            supportsMultipleEditorsPerDocument: false,
        });
}

export class ImageDiffEditor extends Disposable {

    constructor(
        private resource: ImageDiffDocument,
        private _webviewPanel: vscode.WebviewPanel,
        private _context: vscode.ExtensionContext
    ) {
        super();

        this._register(resource.onDidChangeSecondImage(topImage => {
            const webImage = _webviewPanel.webview.asWebviewUri(topImage).toString();
            this.postMessage(Commands.loadSecond, webImage);
        }));

        this._register(resource.onDidDispose(() => {
            this.dispose();
        }));

        this._register(_webviewPanel.webview.onDidReceiveMessage(async (command: Command) => {
            switch (command.command) {
                case Commands.openSecond:    
                    this.openSecondImage();
                    break;
                case Commands.webviewReady:
                    this.postMessage(
                        Commands.loadFirst, 
                        _webviewPanel.webview.asWebviewUri(resource.firstImage).toString());

                    if (resource.secondImage !== undefined) {
                        this.postMessage(
                            Commands.loadSecond,
                            _webviewPanel.webview.asWebviewUri(resource.secondImage).toString()
                        );
                    }
                    break;
                default:
                    break;
            }
        }));

        this.render();
    }

    public dispose() {
        super.dispose();
        ImageDiffEditorProvider.removeCustomEditor(this.resource.uri);
    }

    public async openSecondImage(): Promise<void> {
        const file = await this.openImageDialog();
        if (file !== undefined) {
            this.resource.updateSecondImage(file);
        }
    }

    private async openImageDialog(): Promise<vscode.Uri | undefined> {

        const globFilter = '*.{' + SUPPORTED_EXTNAMES.map(s => s.substring(1)).join() + '}';
        const fileName = this.resource.firstImage.path.split(path.sep).pop() ?? '';

        const filesWithSameName = (await vscode.workspace.findFiles(path.join('*', fileName)))
            .filter(f => f.fsPath !== this.resource.firstImage.fsPath);

        const file = await openFileQuickPick((term: string) => {
            return vscode.workspace.findFiles(
                path.join('**', term + globFilter),
                undefined,
                10);
        } ,{
            additional: filesWithSameName,
            title: 'Select image',
        });

        return file;
    }

    private postMessage(command: Commands, args: any): void {
        this._webviewPanel.webview.postMessage({
            command: command,
            arguments: args,
        });
    }

    render(): void {

        this._webviewPanel.webview.options = {
            enableScripts: true,
        };
        this._webviewPanel.webview.html = this.getHtml();
    }

    getHtml(): string {
        const webview = this._webviewPanel.webview;
        
        const cspSource = webview.cspSource;
        const nonce = getNonce();
        const extensionUri = this._context.extensionUri;

        // The CSS file from the React build output
        const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "static", "css", "main.css"]);
        
        // The JS files from the React build output
        const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build","static", "js", "main.js"]);

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!-- Disable pinch zooming -->
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: ${cspSource}; media-src ${cspSource}; script-src 'nonce-${nonce}'; style-src ${cspSource} 'nonce-${nonce}';">
            <meta name="theme-color" content="#000000">
            
            <link rel="stylesheet" type="text/css" href="${stylesUri}">
            <title>Image Diff</title>
        </head>
        <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
    
}


export class ImageDiffEditorProvider implements vscode.CustomReadonlyEditorProvider<ImageDiffDocument> {
    
    public static viewType = "imageDiff.diff";

    public static editors: Map<string, ImageDiffEditor> = new Map();

    public static removeCustomEditor(uri: vscode.Uri) {
        ImageDiffEditorProvider.editors.delete(uri.fsPath);
    }

    constructor(
        private _context: vscode.ExtensionContext,
    ) {}

    openCustomDocument(
        uri: vscode.Uri, 
        openContext: vscode.CustomDocumentOpenContext, 
        token: vscode.CancellationToken): ImageDiffDocument | Thenable<ImageDiffDocument> {

        return new ImageDiffDocument(uri);
    }
    
    resolveCustomEditor(
        document: ImageDiffDocument, 
        webviewPanel: vscode.WebviewPanel, 
        token: vscode.CancellationToken): void | Thenable<void> {

        if (!ImageDiffEditorProvider.editors.has(document.uri.fsPath)) {
            ImageDiffEditorProvider.editors.set(document.uri.fsPath, new ImageDiffEditor(document, webviewPanel, this._context))
        }
    }

    

}