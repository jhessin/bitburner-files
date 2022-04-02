import { NS } from "Bitburner";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  if (args.help) {
    ns.tprint(`
      This will purchase the largest possible servers.

      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
    await ns.sleep(1000);
    ns.clearLog();
    ns.tail();
    const ram = await calculateRam(ns);
    const price = ns.getPurchasedServerCost(ram);
    const moneyAvailable = ns.getServerMoneyAvailable("home");
    if (moneyAvailable > price) {
      const serverName = `pserver-${Date.now()}`;
      ns.print(
        `Buying server ${serverName} for ${ns.nFormat(price, "$0.000a")}`
      );
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
  ns.clearLog();
  ns.print("All servers have been purchased! Working on upgrades.");
  while (getMinRam(ns) < ns.getPurchasedServerMaxRam()) {
    await ns.sleep(1000);
    ns.clearLog();
    ns.tail();
    const ram = await calculateRam(ns);
    const price = ns.getPurchasedServerCost(ram);
    const moneyAvailable = ns.getServerMoneyAvailable("home");
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
      ns.killall(serverName);
      ns.deleteServer(serverName);
      ns.purchaseServer(serverName, ram);
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
  ns.clearLog();
  ns.print("All servers have been Upgraded!");
}

async function calculateRam(ns: NS) {
  return getMinRam(ns) * 2;
}

export function getMinRam(ns: NS) {
  if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) return 32;
  const serverName = ns
    .getPurchasedServers()
    .sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b))[0];
  return ns.getServerMaxRam(serverName) || 32;
}
