import * as vscode from 'vscode';

export function Timer(context: vscode.ExtensionContext) {
  const item =
      vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  let seconds = 0;
  const format = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:%{sec}`;
  };
  item.text = `$(clock ${format(seconds)})`;
  item.tooltip = 'Programation time';
  item.show();
  const interval = setInterval(() => {
    seconds++;
    item.text = `$(clock) ${format(seconds)}`;
  }, 1000);

  context.subscriptions.push(item, {dispose: () => clearInterval(interval)});
}