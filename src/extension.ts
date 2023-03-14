import { commands, ExtensionContext } from "vscode";
import { registerImageDiffSupport } from "./panels/editor/ImageDiffEditor";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(registerImageDiffSupport(context));
}
