import * as vscode from 'vscode';
import { Disposable } from '../../utilities/disposable';

export class ImageDiffDocument extends Disposable implements vscode.CustomDocument {
    
    private readonly _firstImage: vscode.Uri;

    private _secondImage: vscode.Uri | undefined;

    private _zoomLevel : number = 1;

    constructor(firstImage: vscode.Uri) {
        super();

        this._firstImage = firstImage;
    }


    private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>());
	/**
	 * Fired when the document is disposed of.
	 */
	public readonly onDidDispose = this._onDidDispose.event;

    private readonly _onDidChangeSecondImage = this._register(new vscode.EventEmitter<vscode.Uri>());

    public readonly onDidChangeSecondImage = this._onDidChangeSecondImage.event;

    public updateSecondImage(uri: vscode.Uri):void  {
        this._secondImage = uri;
        this._onDidChangeSecondImage.fire(this._secondImage);
    }

    public setZoomLevel(zoomLevel: number): void {
        this._zoomLevel = zoomLevel;
    }

    public get uri() {
        return this._firstImage;
    }

    public get firstImage() : vscode.Uri {
        return this._firstImage;
    }
    
    public get secondImage() : vscode.Uri | undefined {
        return this._secondImage;
    }

    public get zoomLevel() : number {
        return this._zoomLevel;
    }

    dispose(): void { 
        this._onDidDispose.fire();

        // disposes the registered events
        super.dispose();
    }

}