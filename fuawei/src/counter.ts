import * as vscode from 'vscode';

export function LineCount(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand('fuawei.countLines', () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('No file is open');
      return;
    }

    let empty = 0;
    let comments = 0;
    let code = 0;

    const language = editor.document.languageId;
    const lines = editor.document.getText().split('\n');

    for (const line of lines) {
      const t = line.trim();

      if (t === '') {
        empty++;
      } else if (
          t.startsWith('//') || (language === 'python' && t.startsWith('#'))) {
        comments++;
      } else {
        code++;
      }
    }

    const total = empty + comments + code;

    const panel = vscode.window.createWebviewPanel(
        'lineStats', 'Line Statistics', vscode.ViewColumn.Beside, {});

    panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #1e1e1e;
                        color: white;
                        padding: 20px;
                    }

                    h2 {
                        text-align: center;
                        color: #4fc3f7;
                    }

                    .card {
                        padding: 15px;
                        margin: 12px 0;
                        border-radius: 10px;
                        font-size: 20px;
                        font-weight: bold;
                    }

                    .code {
                        background-color: #2e7d32;
                    }

                    .comment {
                        background-color: #ef6c00;
                    }

                    .empty {
                        background-color: #616161;
                    }

                    .total {
                        background-color: #1565c0;
                    }
                </style>
            </head>

            <body>

                <h2>📊 Line Statistics</h2>

                <div class="card code">
                    💻 Code lines: ${code}
                </div>

                <div class="card comment">
                    💬 Comment lines: ${comments}
                </div>

                <div class="card empty">
                    📄 Empty lines: ${empty}
                </div>

                <div class="card total">
                    📈 Total lines: ${total}
                </div>

            </body>
            </html>
            `;
  });

  context.subscriptions.push(cmd);
}