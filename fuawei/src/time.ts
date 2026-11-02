import * as vscode from 'vscode';

export function Timer(context: vscode.ExtensionContext) {
  const today = () => new Date().toDateString();

  let seconds = 0;
  if (context.globalState.get<string>('timerDate') === today()) {
    seconds = context.globalState.get<number>('timerSeconds', 0);
  }

  const item =
      vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  item.command = 'fuawei.resetTimer';
  item.tooltip = 'Tiempo de programación hoy (clic para reiniciar)';

  const format = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const render = () => {
    item.text = `$(clock) ${format(seconds)}`;
  };

  const save = () => {
    context.globalState.update('timerDate', today());
    context.globalState.update('timerSeconds', seconds);
  };

  const reset = vscode.commands.registerCommand('fuawei.resetTimer', () => {
    seconds = 0;
    save();
    render();
  });

  render();
  item.show();

  const interval = setInterval(() => {
    if (context.globalState.get<string>('timerDate') !== today() &&
        seconds > 0) {
      seconds = 0;  // cambió el día
    }
    seconds++;
    save();
    render();
  }, 1000);

  context.subscriptions.push(item, reset, {
    dispose: () => clearInterval(interval),
  });
}