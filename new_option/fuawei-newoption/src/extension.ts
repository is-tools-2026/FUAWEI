import {exec} from 'child_process';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const comando =
      vscode.commands.registerCommand('miextension.compile', (uri) => {
        exec(`clang "${uri.fsPath}"`, (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(stderr || error.message);
            return;
          }
          vscode.window.showInformationMessage('Successfully compilation');
        });
      });
  context.subscriptions.push(comando);
}


export function deactivate() {}
