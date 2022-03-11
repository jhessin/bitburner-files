import { NS, AutocompleteData } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const server = ns.args[0].toString();
  if (args.help || !server) {
    ns.tprint("This script does a more detailed analysis of a server.");
    ns.tprint(`Usage: run ${ns.getScriptName()} SERVER`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }
  analyzeServer(ns, server);
}

export const getServerFreeRam = (ns: NS, host: string) =>
  ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

export function analyzeServer(
  ns: NS,
  server: string,
  printToTerminal: boolean = true
) {
  // const ram = ns.getServerRam(server);
  const ram = [ns.getServerMaxRam(server), ns.getServerUsedRam(server)];
  const money = ns.getServerMoneyAvailable(server);
  const maxMoney = ns.getServerMaxMoney(server);
  const minSec = ns.getServerMinSecurityLevel(server);
  const sec = ns.getServerSecurityLevel(server);
  const print = printToTerminal ? ns.tprint : ns.print;
  print(`
${server}:
    RAM        : ${ram[1]} / ${ram[0]} (${(ram[1] / ram[0]) * 100}%)
    $          : ${ns.nFormat(money, "$0.000a")} / ${ns.nFormat(
    maxMoney,
    "$0.000a"
  )} (${((money / maxMoney) * 100).toFixed(2)}%)
    security   : ${minSec.toFixed(2)} / ${sec.toFixed(2)}
    growth     : ${ns.getServerGrowth(server)}
    hack time  : ${ns.tFormat(ns.getHackTime(server))}
    grow time  : ${ns.tFormat(ns.getGrowTime(server))}
    weaken time: ${ns.tFormat(ns.getWeakenTime(server))}
    grow x2    : ${ns.growthAnalyze(server, 2).toFixed(2)} threads
    grow x3    : ${ns.growthAnalyze(server, 3).toFixed(2)} threads
    grow x4    : ${ns.growthAnalyze(server, 4).toFixed(2)} threads
    hack 10%   : ${(0.1 / ns.hackAnalyze(server)).toFixed(2)} threads
    hack 25%   : ${(0.25 / ns.hackAnalyze(server)).toFixed(2)} threads
    hack 50%   : ${(0.5 / ns.hackAnalyze(server)).toFixed(2)} threads
    hackChance : ${(ns.hackAnalyzeChance(server) * 100).toFixed(2)}%
`);
}

export function hackThreads(ns: NS, server: string) {
  return Math.ceil(0.75 / ns.hackAnalyze(server));
}

export function hackTime(ns: NS, host: string) {
  return ns.getHackTime(host);
}

export function growThreads(ns: NS, s: string) {
  // get the percentage of the server that is full
  return ns.growthAnalyze(s, 10);
}

export function growTime(ns: NS, host: string) {
  return ns.getGrowTime(host);
}

export function weakenThreads(ns: NS, server: string) {
  return Math.max(
    Math.ceil(
      (ns.getServerSecurityLevel(server) -
        ns.getServerMinSecurityLevel(server)) /
        ns.weakenAnalyze(1)
    ),
    1
  );
}

export function weakenTime(ns: NS, host: string) {
  return ns.getWeakenTime(host);
}

export function getMemForHack(ns: NS, host: string) {
  const hackMem = ns.getScriptRam("/basic/hack.js");
  const hackCount = hackThreads(ns, host);
  return hackMem * hackCount;
}

export function getMemForGrow(ns: NS, host: string) {
  const growMem = ns.getScriptRam("/basic/grow.js");
  const growCount = growThreads(ns, host);
  return growMem * growCount;
}

export function getMemForWeaken(ns: NS, host: string) {
  const weakenMem = ns.getScriptRam("/basic/weaken.js");
  const weakenCount = weakenThreads(ns, host);
  return weakenMem * weakenCount;
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
