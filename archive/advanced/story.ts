import { NS } from "Bitburner";
import { getPlayerDetails } from "lib/getDetails";
import { home } from "advanced/cnct.js";

const storyFactions: {
  name: string;
  ports: number;
  hackingLevel: number;
  minCash: number;
  completed: boolean;
  server?: string;
}[] = [
  {
    name: "CyberSec",
    server: "CSEC",
    hackingLevel: 56,
    ports: 1,
    completed: false,
    minCash: 0,
  },
  {
    name: "NiteSec",
    server: "avmnite-02h",
    hackingLevel: 214,
    ports: 2,
    minCash: 0,
    completed: false,
  },
  {
    name: "The Black Hand",
    server: "I.I.I.I",
    hackingLevel: 362,
    ports: 3,
    minCash: 0,
    completed: false,
  },
  {
    name: "BitRunners",
    server: "run4theh111z",
    hackingLevel: 538,
    ports: 4,
    minCash: 0,
    completed: false,
  },
  {
    name: "Daedalus",
    hackingLevel: 2500,
    minCash: 100e9,
    ports: 0,
    completed: false,
  },
];

export async function main(ns: NS) {
  // A utility to kill everything that isn't this script.
  function killall() {
    for (const ps of ns.ps(ns.getHostname())) {
      if (ps.filename.includes(ns.getScriptName())) continue;
      ns.scriptKill(ps.filename, ns.getHostname());
    }
  }
  killall();
  ns.disableLog("ALL");
  // start initial scripts here.
  ns.run("/basic/cpall.js");
  ns.run("/contracts/daemon.js");
  if (ns.getServerMaxRam("home") > 500) {
    ns.run("/hackGrind.js");
  } else {
    ns.run("/advanced/starterCrime.js");
  }
  // Get the ownedAugs
  let ownedAugs = ns.getOwnedAugmentations(true);

  async function joinFactions() {
    const { factions } = ns.getPlayer();
    const { hackingLevel, portHacks } = getPlayerDetails(ns);
    for (const fd of storyFactions) {
      const faction = fd.name;
      // first determine if we have all the augmentations from a faction.
      let needAugs = false;
      for (const aug of ns.getAugmentationsFromFaction(faction)) {
        if (!ownedAugs.includes(aug)) {
          needAugs = true;
          break;
        }
      }
      if (!needAugs) continue;

      if (!factions.includes(faction)) {
        if (fd.server) {
          if (hackingLevel >= fd.hackingLevel && portHacks >= fd.ports) {
            killall();
            ns.run("/contracts/daemon.js");
            ns.run("/basic/nuke.js", 1, fd.server);
            while (ns.scriptRunning("/basic/nuke.js", ns.getHostname()))
              await ns.sleep(1);
            ns.run("/advanced/cnct.js", 1, fd.server);
            await ns.installBackdoor();
            await home(ns);
            for (const faction of ns.checkFactionInvitations()) {
              ns.joinFaction(faction);
            }
          } else if (ns.getPlayer().factions.length === 0) {
            ns.print(
              `waiting for hacking skills to be good enough for ${faction}`
            );
            killall();
            ns.run("/contracts/daemon.js");
            while (
              getPlayerDetails(ns).hackingLevel < fd.hackingLevel ||
              getPlayerDetails(ns).portHacks < fd.ports
            ) {
              if (!ns.scriptRunning("/hackGrind.js", ns.getHostname()))
                ns.run("/hackGrind.js");
              ns.clearLog();
              ns.print(
                `Grinding hacking levels the old fashioned way - please wait...`
              );
              ns.tail();
              await ns.sleep(30000);
            }
            ns.clearLog();
            continue;
          }
        }
      }
    }
  }

  function filterAugs(augs: string[]) {
    return augs.filter(
      (a) => !ownedAugs.includes(a) && !a.startsWith("NeuroFlux")
    );
  }

  function getMostExpensiveAug(faction: string) {
    const augs = filterAugs(ns.getAugmentationsFromFaction(faction));
    if (augs.length === 0) return "";
    let best: [string, number] = ["", 0];
    for (const aug of augs) {
      let havePreReqs = true;
      for (const preReq of ns.getAugmentationPrereq(aug)) {
        if (!ownedAugs.includes(preReq)) {
          havePreReqs = false;
          break;
        }
      }
      const price = ns.getAugmentationPrice(aug);
      if (price > best[1] && havePreReqs) best = [aug, price];
    }
    return best[0];
  }

  // main loop
  while (true) {
    ns.clearLog();
    ns.tail();
    ownedAugs = ns.getOwnedAugmentations(true);
    // This is required for stopping the script if doing crimes.
    ns.tail();
    const { factions } = ns.getPlayer();

    await joinFactions();

    for (const faction of factions) {
      // You have joined this faction - now get the augs.
      while (filterAugs(ns.getAugmentationsFromFaction(faction)).length > 0) {
        ns.tail();
        const augs = filterAugs(ns.getAugmentationsFromFaction(faction));
        if (augs.length === 1 && ns.purchaseAugmentation(faction, augs[0])) {
          ns.installAugmentations("/advanced/story.js");
        } else {
          const aug = getMostExpensiveAug(faction);
          const price = ns.getAugmentationPrice(aug);
          const repReq = ns.getAugmentationRepReq(aug);
          if (ns.getServerMoneyAvailable("home") < price) {
            if (!ns.scriptRunning("/advanced/crime.js", ns.getHostname()))
              ns.run("/advanced/crime.js");
            ns.print(
              `Commiting crimes to pay the ${ns.nFormat(
                price,
                "$0.000a"
              )} to ${faction} for ${aug}.`
            );
            while (ns.getServerMoneyAvailable("home") < price) {
              if (!ns.scriptRunning("/advanced/crime.js", ns.getHostname()))
                ns.run("/advanced/crime.js");
              await ns.sleep(30000);
            }
            ns.scriptKill("/advanced/crime.js", "home");
            ns.clearLog();
          }

          if (ns.getFactionRep(faction) < repReq) {
            // We've got the money do we have the rep?

            // in case we are commiting crimes.
            ns.scriptKill("/advanced/crime.js", "home");

            // work for the faction
            if (ns.isBusy()) ns.stopAction();
            ns.print(
              `Working for ${faction} go get ${ns.nFormat(
                repReq,
                "0.000a"
              )} reputation so we can purchase ${aug} for ${ns.nFormat(
                price,
                "$0.000a"
              )}`
            );
            while (true) {
              ns.tail();
              ns.workForFaction(faction, "hacking");
              killall();
              ns.run("/contracts/daemon.js");
              ns.run("/repGrind.js");
              if (
                ns.getPlayer().workRepGained + ns.getFactionRep(faction) >=
                repReq
              ) {
                ns.stopAction();
                ns.purchaseAugmentation(faction, aug);
                break;
              } else {
                while (
                  ns.isBusy() ||
                  ns.getPlayer().workRepGained + ns.getFactionRep(faction) <
                    repReq
                )
                  await ns.sleep(30000);
              }
            }
            ns.clearLog();
          } else {
            // we already have the money and the rep.
            ns.purchaseAugmentation(faction, aug);
          }
        }
        ns.installAugmentations("/advanced/story.js");
      }
    }

    await ns.sleep(1e20);
  }
}
