import { NS } from "Bitburner";

const updateSeconds = 30;

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  if (args.help) {
    ns.tprint(
      "This script will enhance your HUD (Heads up Display) with custom statistics."
    );
    ns.tprint(`Usage: run ${ns.getScriptName()}`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()}`);
    return;
  }

  const doc = document; // This is expensive! (25GB RAM) Perhaps there's a way around it? ;)
  const hook0 = doc.getElementById("overview-extra-hook-0");
  const hook1 = doc.getElementById("overview-extra-hook-1");

  if (hook0 === null || hook1 === null) {
    ns.tprint("Could not get overview hooks. Is this being run in bitburner?");
    return;
  }
  while (true) {
    try {
      let headers: string[] = [];
      let values: string[] = [];
      // Add script income per second
      headers.push("Script Income");
      values.push(
        ns.getScriptIncome()[0].toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          currencyDisplay: "narrowSymbol",
          notation: "compact",
          maximumSignificantDigits: 3,
        }) + "/sec"
      );
      // Add script exp gain rate per second
      headers.push("Script XP");
      values.push(
        ns.getScriptExpGain().toLocaleString(undefined, {
          style: "decimal",
          maximumSignificantDigits: 3,
          notation: "compact",
        }) + "/sec"
      );
      // TODO: Add more neat stuff

      // Now drop it into the placeholder elements
      hook0.innerText = headers.join(" \n");
      hook1.innerText = values.join("\n");
    } catch (err) {
      // This might come in handy later
      ns.print("ERROR: Update Skipped: " + String(err));
    }
    await ns.sleep(updateSeconds * 1000);
  }
}
