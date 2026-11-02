"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode3 = __toESM(require("vscode"));

// src/compile.ts
var import_child_process = require("child_process");
var path = __toESM(require("path"));
var vscode = __toESM(require("vscode"));
function Compile(context) {
  const comando = vscode.commands.registerCommand(
    "miextension.compile",
    (uri) => {
      const dir = path.dirname(uri.fsPath);
      const salida = path.join(dir, "a.exe");
      (0, import_child_process.exec)(
        `clang "${uri.fsPath}" -o "${salida}"`,
        { cwd: dir },
        (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(stderr || error.message);
            return;
          }
          vscode.window.showInformationMessage(`Creado: ${salida}`);
        }
      );
    }
  );
  context.subscriptions.push(comando);
}

// src/time.ts
var vscode2 = __toESM(require("vscode"));
function Timer(context) {
  const today = () => (/* @__PURE__ */ new Date()).toDateString();
  let seconds = 0;
  if (context.globalState.get("timerDate") === today()) {
    seconds = context.globalState.get("timerSeconds", 0);
  }
  const item = vscode2.window.createStatusBarItem(vscode2.StatusBarAlignment.Left, 100);
  item.command = "fuawei.resetTimer";
  item.tooltip = "Coding time today (click to reset)";
  const format = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor(s % 3600 / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };
  const render = () => {
    item.text = `$(clock) ${format(seconds)}`;
  };
  const save = () => {
    context.globalState.update("timerDate", today());
    context.globalState.update("timerSeconds", seconds);
  };
  const reset = vscode2.commands.registerCommand("fuawei.resetTimer", () => {
    seconds = 0;
    save();
    render();
  });
  render();
  item.show();
  const interval = setInterval(() => {
    if (context.globalState.get("timerDate") !== today() && seconds > 0) {
      seconds = 0;
    }
    seconds++;
    save();
    render();
  }, 1e3);
  context.subscriptions.push(item, reset, {
    dispose: () => clearInterval(interval)
  });
}

// src/extension.ts
function activate(context) {
  Compile(context);
  Timer(context);
  console.log('Congratulations, your extension "fuawei" is now active!');
  const disposable = vscode3.commands.registerCommand("fuawei.helloWorld", () => {
    vscode3.window.showInformationMessage("Hello World from FUAWEI!");
  });
  context.subscriptions.push(disposable);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
