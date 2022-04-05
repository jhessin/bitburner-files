import { NS } from "Bitburner";

export function copyCmd(ns: NS, cmd: string) {
  const terminalInput = document.getElementById(
    "terminal-input"
  ) as HTMLInputElement;
  if (!terminalInput) {
    ns.print("Couldn't get terminal-input field.");
    return;
  }
  terminalInput.value = cmd;

  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
}

export function runCmd(ns: NS, cmd: string) {
  copyCmd(ns, cmd);
  document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 13 }));
}
