import { NS } from "Bitburner";
import { iAugmentation } from "consts";

const pollingInterval = 600; // time in ms to wait between polling
const setupScript = "/utils/updateStorage.js";
const nukeScript = "/hacking/nukeAll.js";
const cheapHack = "/hacking/cheapHack.js";
const crimeScript = "/crime/start.js";
const repScript = "/rep/grind.js";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName());
  if (args.help) {
    ns.tprint(
      `This is the main conductor script for running all your automation:
      hacks, nukes, contracts, crimes, etc. It should be run from your home computer and should always be running.`
    );
    ns.tprint("It requires no arguments so just run it!");
    ns.tprint(`It currently uses ${ns.nFormat(ram, "0.000b")} of RAM.`);
    ns.tprint(`USAGE: run ${ns.getScriptName()}`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()}`);
    return;
  }
  while (true) {
    await ns.sleep(pollingInterval);
    ns.clearLog();
    // Determine size of home PC.
    // Determine what scripts can run.
    // Run Appropriate scripts.

    // Always start by running cheapHack.js
    ns.run(setupScript);
    ns.run(nukeScript);
    if (!ns.scriptRunning(cheapHack, "home")) ns.run(cheapHack);

    // Next check if we have outstanding faction invitations.
    for (const faction of ns.checkFactionInvitations()) {
      ns.joinFaction(faction);
    }

    // Now for augmentations that improve hacking.
    await GetAugmentations(ns, (aug) => {
      let stats = ns.getAugmentationStats(aug.name);
      return (
        !!stats.hacking_mult ||
        !!stats.hacking_exp_mult ||
        !!stats.hacking_money_mult ||
        !!stats.hacking_speed_mult ||
        !!stats.hacking_grow_mult ||
        !!stats.hacking_chance_mult
      );
    });

    ns.print("Purchased all hacking augmentations!");

    // Now we get the augmentations that make crime pay!
    // A good source of income.
    await GetAugmentations(
      ns,
      (aug) =>
        !!ns.getAugmentationStats(aug.name).crime_money_mult ||
        !!ns.getAugmentationStats(aug.name).crime_success_mult
    );

    ns.print("Purchased all crime augmentations!");
  }
}

async function GetAugmentations(
  ns: NS,
  filter: (aug: iAugmentation) => boolean
) {
  while (true) {
    await ns.sleep(pollingInterval);
    ns.clearLog();
    // determine if we are part of any factions with uninstalled
    // augmentations.
    const { factions } = ns.getPlayer();
    if (factions.length === 0) {
      // We aren't in any factions!
      return;
    }
    const ownedAugs = ns.getOwnedAugmentations(true);

    const neededAugs: iAugmentation[] = factions.flatMap((faction) => {
      let augmentations: string[] = [];
      for (const aug of ns.getAugmentationsFromFaction(faction)) {
        if (ownedAugs.includes(aug) || aug.startsWith("NeuroFlux")) continue;
        augmentations.push(aug);
      }
      return augmentations.map((name): iAugmentation => {
        const price = ns.getAugmentationPrice(name);
        const rep = ns.getAugmentationRepReq(name);
        const preReqs = ns
          .getAugmentationPrereq(name)
          .filter((aug) => !ownedAugs.includes(aug));

        return {
          name,
          price,
          faction,
          rep,
          preReqs,
        };
      });
    });

    if (neededAugs.length === 0) {
      // We don't need anything our factions have to offer!
      return;
    }

    // find the most expensive augmentation and work to earn it.
    let targetAug: iAugmentation = {
      name: "",
      price: 0,
      faction: "",
      rep: 0,
      preReqs: [],
    };

    for (let aug of neededAugs) {
      if (
        aug.price > targetAug.price &&
        aug.preReqs.length === 0 &&
        filter(aug)
      ) {
        targetAug = aug;
      }
    }

    if (targetAug.price > ns.getServerMoneyAvailable("home")) {
      // get enough money for augmentation.
      ns.tail();
      ns.print(`
        Commiting crimes to be able to afford ${targetAug.name} from ${targetAug.faction}.
        `);
      if (!ns.scriptRunning(crimeScript, "home"))
        ns.run(crimeScript, 1, `--goal=${targetAug.price}`);
      continue;
    } else if (targetAug.rep > ns.getFactionRep(targetAug.faction)) {
      ns.tail();
      ns.print(`
        Working for ${targetAug.faction} until we have ${ns.nFormat(
        targetAug.rep,
        "0.00a"
      )} so we can buy ${targetAug.name}
        `);
      if (!ns.scriptRunning(repScript, "home")) {
        ns.run(repScript, 1, `--goal=${targetAug.rep}`, targetAug.faction);
      }
      continue;
    } else if (targetAug.name !== "") {
      ns.tail();
      ns.print(`
        Purchasing ${targetAug.name} from ${targetAug.faction} for ${ns.nFormat(
        targetAug.price,
        "$0.00a"
      )}
        `);
      ns.enableLog("purchaseAugmentation");
      ns.purchaseAugmentation(targetAug.faction, targetAug.name);
      continue;
    } else {
      break;
    }
  }
}
