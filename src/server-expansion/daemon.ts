import { NS } from "Bitburner";

const allowancePercentage = 0.01;

export async function main(ns: NS) {
  let ram = ns.args[0];
  if (typeof ram === "string") {
    ram = parseInt(ram);
  } else {
    ram = ns.getPurchasedServerMaxRam();
  }
  await purchaseServer(ns, ram);
}

async function purchaseServer(ns: NS, ram: number) {
  let numServers = ns.getPurchasedServers().length;

  while (numServers < ns.getPurchasedServerLimit()) {
    // Check if we have enough money to purchase a server
    // only use 1% of cash for purchases
    let cost = ns.getPurchasedServerCost(ram);
    if (ns.getServerMoneyAvailable("home") * allowancePercentage > cost) {
      // If we have enough money, then:
      //  1. Purchase the server
      //  2. Copy our hacking script onto the newly-purchased server
      //  3. Run our hacking script on the newly-purchased server with 3 threads
      //  4. Increment our iterator to indicate that we've bought a new server
      var hostname = ns.purchaseServer("pserv-" + numServers, ram);
      ns.tprint(
        `Purchased ${hostname} for ${cost.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          maximumSignificantDigits: 3,
          compactDisplay: "short",
        })}.`
      );
      numServers++;
    }
    await ns.sleep(1000);
  }
}
