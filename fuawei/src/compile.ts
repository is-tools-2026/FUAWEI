import {exec} from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

export function Compile(context: vscode.ExtensionContext) {
  const comando = vscode.commands.registerCommand(
      'miextension.compile', (uri: vscode.Uri) => {
        const dir = path.dirname(uri.fsPath);
        const salida = path.join(dir, 'a.exe');

        exec(
            `clang "${uri.fsPath}" -o "${salida}"`, {cwd: dir},
            (error, stdout, stderr) => {
              if (error) {
                vscode.window.showErrorMessage(stderr || error.message);
                return;
              }
              vscode.window.showInformationMessage(`Creado: ${salida}`);
            });
      });

  context.subscriptions.push(comando);
}