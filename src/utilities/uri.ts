import path = require("path");
import { Uri } from "vscode";

export function getFilename(uri: Uri): string {
    return uri.path.split(path.sep).pop() ?? '';
}

export function getFolder(uri: Uri): Uri {
    let elements = uri.path.split(path.sep);
    elements.pop();

    return Uri.parse(elements.join(path.sep));
}