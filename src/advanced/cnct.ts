import { NS, AutocompleteData } from "Bitburner";
import { getTree } from "lib/gettree.js";

export async function main(ns: NS) {
  let target: string = ns.args[0].toString();
  let path = "";

  function iterate(obj: Object, stack: string = "") {
    for (let property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] === "object") {
          iterate(
            obj[property],
            (stack ? stack + "; connect " : stack) + property
          );
        }
      }
    }
    if (stack.includes(target)) {
      path = stack;
    }
  }

  iterate(await getTree(ns));

  const terminalInput: any = document.getElementById("terminal-input");
  if (!terminalInput) {
    ns.tprint("Couldn't get terminal-input field.");
    return;
  }
  terminalInput.value = path;

  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
