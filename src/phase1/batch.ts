import { NS } from "Bitburner";
import { getHackableServers } from "cnct";
import { nukeAll } from "nuker";
import { expandServer } from "expandServer";
import { factionWatch } from "factionWatch";
import { batch } from "batching/batch";
import { commitCrime } from "actions/crime";
import { purchaseServers, upgradeServers } from "purchase";
import { monitor } from "ui/monitor";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const bestServer = ns.args[0] as string;
  await batch(ns, bestServer);

  while (getHackableServers(ns)[0].hostname === bestServer) {
    ns.clearLog();
    await nukeAll(ns);
    expandServer(ns);
    if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
      await purchaseServers(ns);
    else await upgradeServers(ns);
    factionWatch(ns);
    monitor(ns, ns.getServer(bestServer));
    await commitCrime(ns);
  }
  ns.spawn("phase1/restart.js");
}
