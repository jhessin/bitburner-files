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
  ns.print("All servers have been purchased! Working on upgrades.");
  while (getMinRam(ns) < ns.getPurchasedServerMaxRam()) {
    ns.clearLog();
    ns.tail();
    await upgradeServers(ns);
  }
  ns.clearLog();
  serverStats(ns);
  ns.print("All servers have been Upgraded!");
}

export async function upgradeServers(ns: NS) {
  await ns.sleep(1);
  serverStats(ns);
  const ram = await calculateRam(ns);
  const price = ns.getPurchasedServerCost(ram);
  const moneyAvailable = ns.getServerMoneyAvailable("home") * budgetPercent;
  const serverName = ns
    .getPurchasedServers()
    .sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b))[0];
  if (moneyAvailable > price) {
    // find the server with the least amount of ram.
    ns.print(
      `Upgrading server ${serverName} from ${ns.nFormat(
        ns.getServerMaxRam(serverName) * 1e9,
        "0.000b"
      )} to ${ns.nFormat(ram * 1e9, "0.000b")} of RAM for ${ns.nFormat(
        price,
        "$0.000a"
      )}`
    );
    ns.enableLog("deleteServer");
    ns.enableLog("purchaseServer");
    if (ns.ps(serverName).length === 0) {
      if (ns.deleteServer(serverName))
        ns.purchaseServer(`pserver-${Date.now()}`, ram);
    } else {
      // TODO: find a way to migrate processes to another server.
    }
  } else {
    ns.print(
      `You need ${ns.nFormat(
        price,
        "$0.000a"
      )} to upgrade ${serverName} from ${ns.nFormat(
        ns.getServerMaxRam(serverName) * 1e9,
        "0.000b"
      )} to ${ns.nFormat(ram * 1e9, "0.000b")} of RAM`
    );
  }
}

export async function purchaseServers(ns: NS) {
  await ns.sleep(1);
  serverStats(ns);
  const ram = await calculateRam(ns);
  const price = ns.getPurchasedServerCost(ram);
  const moneyAvailable = ns.getServerMoneyAvailable("home") * budgetPercent;
  if (moneyAvailable > price) {
    const serverName = `pserver-${Date.now()}`;
    ns.print(`Buying server ${serverName} for ${ns.nFormat(price, "$0.000a")}`);
    ns.purchaseServer(`pserver-${Date.now()}`, ram);
  } else {
    ns.print(
      `You need ${ns.nFormat(
        price,
        "$0.000a"
      )} to purchase a server with ${ns.nFormat(ram * 1e9, "0.000b")} of RAM`
    );
  }
}

async function calculateRam(ns: NS) {
  // get budget
  // return ns.getPurchasedServerMaxRam();
  const budget = ns.getServerMoneyAvailable("home") * budgetPercent;
  for (const ram of ramStopPoints.reverse())
    if (ns.getPurchasedServerCost(ram) <= budget && ram > getMinRam(ns))
      return ram;
  for (const ram of ramStopPoints) if (ram > getMinRam(ns)) return ram;
  return ns.getPurchasedServerMaxRam();
}

export function getMinRam(ns: NS) {
  if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) return 32;
  const serverName = ns
    .getPurchasedServers()
    .sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b))[0];
  return ns.getServerMaxRam(serverName) || 32;
}

function serverStats(ns: NS) {
  ns.print(`Current Server Stats:`);
  ns.print(`=====================`);
  for (const host of ns
    .getPurchasedServers()
    .sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b))) {
    ns.print(`${host}:
      RAM     : ${ns.nFormat(ns.getServerMaxRam(host) * 1e9, "0.0b")}`);
  }
  ns.print(
    `Max RAM: ${ns.nFormat(ns.getPurchasedServerMaxRam() * 1e9, "0.0b")}`
  );
  ns.print(
    `${
      ns.getPurchasedServers().length
    } of ${ns.getPurchasedServerLimit()} servers purchased.`
  );
  ns.print(`=====================`);
}
