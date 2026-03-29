import * as path from "path";
import { Uri } from "vscode";
import { SUPPORTED_EXTNAMES } from "../panels/editor/ImageDiffEditor";

export function getFilename(uri: Uri): string {
    return uri.path.split(path.sep).pop() ?? '';
}

export function getFolder(uri: Uri): Uri {
    let elements = uri.path.split(path.sep);
    elements.pop();

    return Uri.parse(elements.join(path.sep));
}

export function isImage(uri: Uri): boolean {
    return SUPPORTED_EXTNAMES.indexOf(path.extname(uri.fsPath)) !== -1;
}