import { NS } from "Bitburner";

const budgetPercent = 0.9;
let ramStopPoints = [64, 1024];

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ramStopPoints.push(ns.getPurchasedServerMaxRam());
  const args = ns.flags([["help", false]]);
  if (args.help) {
    ns.tprint(`
      This will purchase the largest possible servers.

      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
    ns.clearLog();
    ns.tail();
    await purchaseServers(ns);
  }
  while (getMinRam(ns) < ns.getPurchasedServerMaxRam()) {
    ns.clearLog();
    ns.tail();
    await upgradeServers(ns);
  }
  ns.clearLog();
  // serverStats(ns);
}

export async function upgradeServers(ns: NS) {
  if (ns.getPurchasedServers().length === 0) return;
  // serverStats(ns);
  const ram = calculateRam(ns);
  const price = ns.getPurchasedServerCost(ram);
  const moneyAvailable = ns.getServerMoneyAvailable("home") * budgetPercent;
  // find the server with the least amount of ram.
  const serverName = ns
    .getPurchasedServers()
    .sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b))[0];
  if (moneyAvailable > price) {
    ns.enableLog("deleteServer");
    ns.enableLog("purchaseServer");
    if (ns.ps(serverName).length === 0) {
      if (ns.deleteServer(serverName))
        ns.purchaseServer(`pserver-${Date.now()}`, ram);
    }
  } else {
    ns.print(
      `${ns.nFormat(price, "$0.0a")} needed to add ${ns.nFormat(
        (ram - getMinRam(ns)) * 1e9,
        "0.0b"
      )} RAM to servers.`
    );
  }
}

export async function purchaseServers(ns: NS) {
  // serverStats(ns);
  const ram = calculateRam(ns);
  const price = ns.getPurchasedServerCost(ram);
  const moneyAvailable = ns.getServerMoneyAvailable("home") * budgetPercent;
  if (moneyAvailable > price) {
    const serverName = `pserver-${Date.now()}`;
    ns.purchaseServer(serverName, ram);
  } else {
    ns.print(
      `${ns.nFormat(price, "$0.0a")} needed to add ${ns.nFormat(
        ram * 1e9,
        "0.0b"
      )} to servers`
    );
  }
}

export function calculateRam(ns: NS) {
  // get budget
  const budget = ns.getServerMoneyAvailable("home") * budgetPercent;
  for (const ram of Array.from(ramStopPoints).reverse())
    if (ns.getPurchasedServerCost(ram) <= budget && ram > getMinRam(ns))
      return ram;
  for (const ram of ramStopPoints) if (ram > getMinRam(ns)) return ram;
  return ns.getPurchasedServerMaxRam();
}

export function getMinRam(ns: NS) {
  if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
    return ramStopPoints[0] - 1;
  return Math.min(
    ...ns.getPurchasedServers().map((s) => ns.getServerMaxRam(s))
  );
}
