import { NS } from "Bitburner";
import { getHackableServers } from "cnct";
import { nukeAll } from "nuker";
import { batch } from "batching/batch";
// import { monitor } from "ui/monitor";
// import { expandServer } from "expandServer";
// import { createPrograms } from "programs";
// import { factionWatch } from "factionWatch";
// import { commitCrime } from "actions/crime";
// import { purchaseServers, upgradeServers } from "purchase";
// import { installBackdoors } from "backdoor";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const bestServer = ns.args[0] as string;
  await batch(ns, bestServer);

  while (getHackableServers(ns)[0].hostname === bestServer) {
    ns.clearLog();
    await nukeAll(ns);
    // await installBackdoors(ns);
    // expandServer(ns);
    // if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
    //   await purchaseServers(ns);
    // else await upgradeServers(ns);
    // factionWatch(ns);
    // monitor(ns, ns.getServer(bestServer));
    // await createPrograms(ns);
    // await commitCrime(ns);
  }
  ns.spawn("phase1/restart.js");
}
