import { NS, Server } from "Bitburner";
import { iAugmentation, keys } from "consts";

const pollingInterval = 600; // time in ms to wait between polling
const host = "home";

interface iRequirements {
  hacking?: number;
  strength?: number;
  defense?: number;
  dexterity?: number;
  agility?: number;
  charisma?: number;
  rep?: number;
}

function getServers(): Server[] {
  let data = localStorage.getItem(keys.serverList);
  if (!data) return [];
  return JSON.parse(data);
}

const setupScripts: string[] = [
  "/utils/updateStorage.js",
  "/hacking/nukeAll.js",
];

const moneyScripts: {
  script: string;
  requires: iRequirements;
  args?: string[];
}[] = [
  {
    script: "/crime/start.js",
    requires: {
      strength: 10,
      defense: 10,
      agility: 10,
      dexterity: 10,
    },
  },
  {
    script: "/jobs/work.js",
    requires: {
      hacking: 250,
      charisma: 250,
    },
    args: [
      "--company=MegaCorp",
      "--position=Business",
      //
    ],
  },
  {
    script: "/jobs/work.js",
    requires: {
      hacking: 250,
    },
    args: [
      "--company=MegaCorp",
      "--position=IT",
      //
    ],
  },
  {
    script: "/jobs/work.js",
    requires: {
      hacking: 150,
    },
    args: [
      "--company=National Security Agency",
      "--position=IT",
      //
    ],
  },
  {
    script: "/jobs/work.js",
    requires: {},
    args: [
      "--company=Joe's Guns",
      "--position=part-time employee",
      //
    ],
  },
];

const lightScripts = [
  "/hacking/distributedHack.js",
  "/hacking/program.js",
  //
];

const allScripts = [
  ...lightScripts,
  "/contracts/start.js",
  "/story/backdoors.js",
  //
];

const repScript = "/rep/grind.js";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || ns.getHostname() !== "home") {
    ns.tprint(
      `This is the main conductor script for running all your automation:
      hacks, nukes, contracts, crimes, etc. It should be run from your home computer and should always be running on home.`
    );
    ns.tprint("It requires no arguments so just run it!");
    ns.tprint(`It currently uses ${ns.nFormat(ram, "0.000b")} of RAM.`);
    ns.tprint(`USAGE: run ${ns.getScriptName()}`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()}`);
    return;
  }
  const totalRam =
    (ns.getServerMaxRam(host) - ns.getScriptRam(ns.getScriptName())) * 1e9;
  ns.tprint(
    `You currently have ${ns.nFormat(
      totalRam,
      "0.00b"
    )} RAM available for scripts.`
  );

  // Start by killing everything else.
  killAll(ns);

  // calculate memory required for allScripts
  let memory = 0;
  for (const script of [
    ...setupScripts,
    ...moneyScripts.map((s) => s.script),
    ...allScripts,
    repScript,
  ]) {
    await ns.sleep(1);
    memory += ns.getScriptRam(script);
  }

  const allScriptMem = memory * 1e9;
  ns.tprint(
    `In order to run all scripts you need ${ns.nFormat(
      allScriptMem,
      "0.00b"
    )} of RAM.`
  );
  memory = 0;
  for (const script of [
    ...setupScripts,
    ...moneyScripts.map((s) => s.script),
    ...lightScripts,
    repScript,
  ]) {
    await ns.sleep(1);
    memory += ns.getScriptRam(script);
  }
  ns.tprint(
    `In order to run light scripts you need ${ns.nFormat(
      memory * 1e9,
      "0.00b"
    )} of RAM.`
  );

  while (true) {
    await ns.sleep(pollingInterval);
    ns.clearLog();
    // Determine size of home PC.
    // Determine what scripts can run.
    // Run Appropriate scripts.

    // Always start by running setupScripts.
    for (const script of setupScripts) {
      await ns.sleep(1);
      ns.print(`running ${script}`);
      if (!ns.scriptRunning(script, host)) ns.run(script);
      while (ns.scriptRunning(script, ns.getHostname())) await ns.sleep(1);
      ns.print("${script} completed!");
    }

    if (totalRam >= allScriptMem) {
      for (const script of allScripts) {
        ns.print(`running ${script}`);
        if (!ns.scriptRunning(script, host)) ns.run(script);
      }
    } else {
      for (const script of lightScripts) {
        ns.print(`running ${script}`);
        if (!ns.scriptRunning(script, host)) ns.run(script);
      }
    }

    // Next check if we have outstanding faction invitations.
    for (const faction of ns.checkFactionInvitations()) {
      await ns.sleep(1);
      ns.joinFaction(faction);
    }

    // Now we get the augmentations that make crime pay!
    // A good source of income.
    await GetAugmentations(
      ns,
      (aug) =>
        !!ns.getAugmentationStats(aug.name).crime_money_mult ||
        !!ns.getAugmentationStats(aug.name).crime_success_mult
    );

    ns.print("Purchased all crime augmentations!");

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
  }
}

async function GetAugmentations(
  ns: NS,
  filter: (aug: iAugmentation) => boolean
): Promise<void> {
  while (true) {
    await ns.sleep(pollingInterval);
    ns.clearLog();

    // only do this stuff if we are not busy programming.
    if (localStorage.getItem(keys.isProgramming) === "true") {
      ns.print(`Waiting for programming to finish before continuing.`);
      continue;
    }

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
      await ns.sleep(1);
      if (
        aug.price > targetAug.price &&
        aug.preReqs.length === 0 &&
        filter(aug)
      ) {
        targetAug = aug;
      }
    }

    if (targetAug.name === "") {
      return;
    }

    if (targetAug.price > ns.getServerMoneyAvailable(host)) {
      // get enough money for augmentation.
      ns.print(`
        Working to be able to afford ${targetAug.name} from ${targetAug.faction}.
        `);
      ns.enableLog("run");
      for (const ms of moneyScripts) {
        const { requires } = ms;
        const { hacking, strength, defense, dexterity, agility, charisma } =
          ns.getPlayer();
        if (
          (!requires.hacking || requires.hacking <= hacking) &&
          (!requires.strength || requires.strength <= strength) &&
          (!requires.defense || requires.defense <= defense) &&
          (!requires.dexterity || requires.dexterity <= dexterity) &&
          (!requires.agility || requires.agility <= agility) &&
          (!requires.charisma || requires.charisma <= charisma)
        ) {
          const script = ms.script;
          ns.tail();
          ns.print(`running ${script}`);
          if (!ns.scriptRunning(script, host))
            ns.run(script, 1, `--goal=${targetAug.price}`, ...(ms.args || []));
          break;
        }
      }
      continue;
    } else if (targetAug.rep > ns.getFactionRep(targetAug.faction)) {
      ns.tail();
      ns.print(`
        Working for ${targetAug.faction} until we have ${ns.nFormat(
        targetAug.rep,
        "0.00a"
      )} so we can buy ${targetAug.name}
        `);
      if (!ns.scriptRunning(repScript, host)) {
        ns.run(repScript, 1, `--goal=${targetAug.rep}`, targetAug.faction);
      }
      continue;
    } else if (targetAug.name !== "") {
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

function killAll(ns: NS) {
  ns.stopAction();
  for (const host of getServers()) {
    if (host.hostname === "home") {
      for (const ps of ns.ps(host.hostname)) {
        if (ps.filename === ns.getScriptName()) continue;
        ns.scriptKill(ps.filename, host.hostname);
      }
    } else {
      ns.killall(host.hostname);
    }
  }
}
