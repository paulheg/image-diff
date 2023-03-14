export class Command {
    command: Commands;
    arguments: any;

    constructor(command: Commands) {
        this.command = command;
    }

}

export enum Commands {
    webviewReady = 'WEBVIEW_READY',
    openSecond = 'OPEN_SECOND_IMAGE',
    loadFirst = 'LOAD_FIRST_IMAGE',
    loadSecond = 'LOAD_SECOND_IMAGE',
    updateZoom = 'UPDATE_ZOOM',
}