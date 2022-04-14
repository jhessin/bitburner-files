import { NS, Server } from "Bitburner";
import { iAugmentation, keys } from "consts";

const pollingInterval = 6000; // time in ms to wait between polling
const host = "home";

interface iRequirements {
  hacking?: number;
  strength?: number;
  defense?: number;
  dexterity?: number;
  agility?: number;
  charisma?: number;
  rep?: number;
  company?: string;
}

interface iMoneyScript {
  script: string;
  requires: iRequirements;
  args?: string[];
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

// These are various money scripts in order of preference.
const crimeFocused: iMoneyScript[] = [
  {
    script: "/crime/start.js",
    requires: {
      strength: 150,
      defense: 150,
      agility: 150,
      dexterity: 150,
    },
  },
  {
    script: "/jobs/work.js",
    requires: {
      strength: 300,
      defense: 300,
      dexterity: 300,
      agility: 300,
      charisma: 250,
    },
    args: [
      "--company=MegaCorp",
      "--position=Security",
      //
    ],
  },
  {
    script: "/jobs/work.js",
    requires: {
      strength: 200,
      defense: 200,
      dexterity: 200,
      agility: 200,
      charisma: 150,
    },
    args: [
      "--company=National Security Agency",
      "--position=Security",
      //
    ],
  },
  {
    script: "/jobs/work.js",
    requires: {
      strength: 175,
      defense: 175,
      dexterity: 175,
      agility: 175,
      charisma: 175,
      rep: 8000,
      company: "Carmichael Security",
    },
    args: [
      "--company=Carmichael Security",
      "--position=Agent",
      //
    ],
  },
  {
    script: "/jobs/work.js",
    requires: {
      strength: 125,
      defense: 125,
      dexterity: 125,
      agility: 125,
      charisma: 75,
    },
    args: [
      "--company=Carmichael Security",
      "--position=Security",
      //
    ],
  },
  {
    script: "/gym/workout.js",
    requires: {
      strength: 125,
      defense: 125,
      dexterity: 125,
      charisma: 75,
    },
    args: ["--goal=125", "--stat=agi"],
  },
  {
    script: "/gym/workout.js",
    requires: {
      strength: 125,
      defense: 125,
      charisma: 75,
    },
    args: ["--goal=125", "--stat=dex"],
  },
  {
    script: "/gym/workout.js",
    requires: {
      strength: 125,
      charisma: 75,
    },
    args: ["--goal=125", "--stat=def"],
  },
  {
    script: "/gym/workout.js",
    requires: {
      charisma: 75,
    },
    args: ["--goal=125", "--stat=str"],
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

// These are the moneyScripts we will actually use.
const moneyScripts: iMoneyScript[] = crimeFocused;

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
const learningScript = "/hacking/school.js";

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
    // Determine size of home PC.
    // Determine what scripts can run.
    // Run Appropriate scripts.

    // Always start by running setupScripts.
    for (const script of setupScripts) {
      await ns.sleep(1);
      if (!ns.scriptRunning(script, host)) ns.run(script);
      while (ns.scriptRunning(script, ns.getHostname())) await ns.sleep(1);
    }

    if (totalRam >= allScriptMem) {
      for (const script of allScripts) {
        if (!ns.scriptRunning(script, host)) ns.run(script);
      }
    } else {
      for (const script of lightScripts) {
        if (!ns.scriptRunning(script, host)) ns.run(script);
      }
    }

    ns.clearLog();
    // Next check if we have outstanding faction invitations.
    for (const faction of ns.checkFactionInvitations()) {
      ns.print(`Joining ${faction}`);
      ns.joinFaction(faction);
    }
    ns.print("All factions joined!");

    // // Now we get the augmentations that make crime pay!
    // // A good source of income.
    // if (
    //   !(await GetAugmentations(
    //     ns,
    //     (aug) =>
    //       !!ns.getAugmentationStats(aug.name).crime_money_mult ||
    //       !!ns.getAugmentationStats(aug.name).crime_success_mult
    //   ))
    // )
    //   continue;

    // ns.print("Purchased all crime augmentations!");

    // // Now for augmentations that improve hacking.
    // if (
    //   !(await GetAugmentations(ns, (aug) => {
    //     let stats = ns.getAugmentationStats(aug.name);
    //     return (
    //       !!stats.hacking_mult ||
    //       !!stats.hacking_exp_mult ||
    //       !!stats.hacking_money_mult ||
    //       !!stats.hacking_speed_mult ||
    //       !!stats.hacking_grow_mult ||
    //       !!stats.hacking_chance_mult
    //     );
    //   }))
    // )
    //   continue;

    // ns.print("Purchased all hacking augmentations!");

    // Now go for broke and install everything else!
    if (!(await GetAugmentations(ns))) continue;

    ns.print("Purchased all available augmentations!");

    // check if we have augmentations to install
    if (
      ns.getOwnedAugmentations(true).length -
        ns.getOwnedAugmentations(false).length >
      0
    ) {
      ns.installAugmentations("/start.js");
    } else {
      //nothing to install so just focus on hacking
      if (!ns.scriptRunning(learningScript, host)) ns.run(learningScript);
    }
  }
}

async function GetAugmentations(
  ns: NS,
  filter: (aug: iAugmentation) => boolean = (_) => true
): Promise<boolean> {
  await ns.sleep(pollingInterval);

  // only do this stuff if we are not busy programming.
  if (localStorage.getItem(keys.isProgramming) === "true") {
    ns.print(`Waiting for programming to finish before continuing.`);
    return false;
  }

  // if we are taking a class stop
  if (ns.scriptRunning(learningScript, host)) {
    ns.scriptKill(learningScript, host);
    ns.stopAction();
  }

  // determine if we are part of any factions with uninstalled
  // augmentations.
  const { factions } = ns.getPlayer();
  if (factions.length === 0) {
    // We aren't in any factions!
    return true;
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
    return true;
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
    // none of the augmentations match our filter.
    return true;
  }

  if (targetAug.price > ns.getServerMoneyAvailable(host)) {
    // get enough money for augmentation.
    ns.print(`
        Working to be able to afford ${targetAug.name} from ${targetAug.faction}.
        `);
    ns.enableLog("run");
    for (const ms of moneyScripts) {
      const { requires } = ms;
      const { rep, company } = requires;
      const { hacking, strength, defense, dexterity, agility, charisma } =
        ns.getPlayer();
      if (company && rep) {
        const playerRep = ns.getCompanyRep(company);
        if (playerRep < rep) continue;
      }
      if (
        (!requires.hacking || requires.hacking <= hacking) &&
        (!requires.strength || requires.strength <= strength) &&
        (!requires.defense || requires.defense <= defense) &&
        (!requires.dexterity || requires.dexterity <= dexterity) &&
        (!requires.agility || requires.agility <= agility) &&
        (!requires.charisma || requires.charisma <= charisma)
      ) {
        ns.tail();
        // kill any other running moneyScripts
        // And stop their coresponding actions.
        for (const { script, args } of moneyScripts) {
          if (script === ms.script && args === ms.args) continue;
          if (
            ns.isRunning(
              script,
              host,
              `--goal=${targetAug.price}`,
              ...(args || [])
            )
          ) {
            ns.kill(script, host, `--goal=${targetAug.price}`, ...(args || []));
            ns.stopAction();
          }
        }

        // Also kill any repScript that may be running.
        if (ns.scriptRunning(repScript, host)) {
          ns.scriptKill(repScript, host);
          ns.stopAction();
        }
        const script = ms.script;
        if (!ns.scriptRunning(script, host))
          ns.run(script, 1, `--goal=${targetAug.price}`, ...(ms.args || []));
        break;
      }
    }
    return false;
  } else if (targetAug.rep > ns.getFactionRep(targetAug.faction)) {
    ns.tail();
    ns.print(`
        Working for ${targetAug.faction} until we have ${ns.nFormat(
      targetAug.rep,
      "0.00a"
    )} so we can buy ${targetAug.name}
        `);
    // kill any running moneyScripts
    // And stop their coresponding actions.
    for (const { script } of moneyScripts) {
      if (ns.scriptRunning(script, host)) {
        ns.scriptKill(script, host);
        ns.stopAction();
      }
    }
    if (!ns.scriptRunning(repScript, host)) {
      ns.run(repScript, 1, `--goal=${targetAug.rep}`, targetAug.faction);
    }
    return false;
  } else {
    ns.print(`
        Purchasing ${targetAug.name} from ${targetAug.faction} for ${ns.nFormat(
      targetAug.price,
      "$0.00a"
    )}
        `);
    ns.enableLog("purchaseAugmentation");
    ns.purchaseAugmentation(targetAug.faction, targetAug.name);
    return false;
  }
}

function killAll(ns: NS) {
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
