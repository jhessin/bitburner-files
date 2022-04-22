import { NS } from "Bitburner";
const allowancePercentage = 0.01;

/** @param {NS} ns **/
export async function main(ns: NS) {
  while (true) {
    ns.disableLog("ALL");
    ns.clearLog();
    expandHacknet(ns);

    await ns.sleep(1);
  }
}

export function expandHacknet(ns: NS) {
  // buy our first node if needed.
  if (ns.hacknet.numNodes() === 0) ns.hacknet.purchaseNode();

  // Find the best hacknet purchase.
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    let gain = [0, 0, 0];
    let currentCash = ns.getServerMoneyAvailable("home");
    currentCash *= allowancePercentage;

    if (ns.hacknet.getPurchaseNodeCost() <= currentCash) {
      ns.hacknet.purchaseNode();
      continue;
    } else {
      // ns.print(
      //   `Cannot afford a new node with ${ns.nFormat(currentCash, "$0.00a")}`
      // );
    }

    const node = ns.hacknet.getNodeStats(i);

    if (node.level < 200) {
      gain[0] =
        ((node.level + 1) *
          1.6 *
          Math.pow(1.035, node.ram - 1) *
          ((node.cores + 5) / 6)) /
        ns.hacknet.getLevelUpgradeCost(i, 1);
    } else {
      gain[0] = 0;
    }

    if (node.ram < 64) {
      gain[1] =
        (node.level *
          1.6 *
          Math.pow(1.035, node.ram * 2 - 1) *
          ((node.cores + 5) / 6)) /
        ns.hacknet.getRamUpgradeCost(i, 1);
    } else {
      gain[1] = 0;
    }

    if (node.cores < 16) {
      gain[2] =
        (node.level *
          1.6 *
          Math.pow(1.035, node.ram - 1) *
          ((node.cores + 6) / 6)) /
        ns.hacknet.getCoreUpgradeCost(i, 1);
    } else {
      gain[2] = 0;
    }

    // ns.print(`Level Upgrade: ${gain[0]}`);
    // ns.print(`Ram Upgrade: ${gain[1]}`);
    // ns.print(`Core Upgrade: ${gain[2]}`);

    let topgain = 0;

    for (let g of gain) {
      if (g > topgain) {
        topgain = g;
      }
    }

    if (topgain === 0) {
      // ns.print(`All Gains maxed on Node ${i}`);
      continue;
    }

    if (
      topgain === gain[0] &&
      ns.hacknet.getLevelUpgradeCost(i, 1) < currentCash
    ) {
      ns.print(`Upgrading Level on Node ${i}`);
      ns.hacknet.upgradeLevel(i, 1);
    }
    if (
      topgain === gain[1] &&
      ns.hacknet.getRamUpgradeCost(i, 1) < currentCash
    ) {
      ns.print(`Upgrading Ram on Node ${i}`);
      ns.hacknet.upgradeRam(i, 1);
    }
    if (
      topgain === gain[2] &&
      ns.hacknet.getCoreUpgradeCost(i, 1) < currentCash
    ) {
      ns.print(`Upgrading Cores on Node ${i}`);
      ns.hacknet.upgradeCore(i, 1);
    } else {
      // ns.print(
      //   `Cannot afford to upgrade Node ${i} with ${ns.nFormat(
      //     currentCash,
      //     "$0.00a"
      //   )}`
      // );
    }
  }
}
