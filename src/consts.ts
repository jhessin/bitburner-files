import { AugmentationStats, NS } from "Bitburner";

/**
 * This is a list of the keys for data that is stored in localStorage.
 */
export const keys = {
  // The complete list of servers with their data.
  serverList: "serverList",
  // The total number of ports the user can hack.
  hackablePorts: "hackablePorts",
  // The players current hacking level.
  hackingLevel: "hacking level",
  // The factions the player belongs to.
  factions: "factions",
  // The augmentations that the player has purchased ready for installation.
  augmentationsQueued: "augmentationsQueued",
  // The augmentations that the player has already installed.
  augmentationsInstalled: "augmentationsInstalled",
  // The sourceFiles the player has.
  sourceFiles: "source files",
  // Are we programming?
  isProgramming: "Is Programming",
};

export const PortHackPrograms = [
  "BruteSSH.exe",
  "FTPCrack.exe",
  "relaySMTP.exe",
  "HTTPWorm.exe",
  "SQLInject.exe",
];

export async function CreateHackPrograms(ns: NS) {
  const hackPrograms: {
    program: string;
    hackingLevel: number;
  }[] = [
    {
      program: "BruteSSH.exe",
      hackingLevel: 50,
    },
    {
      program: "FTPCrack.exe",
      hackingLevel: 100,
    },
    {
      program: "relaySMTP.exe",
      hackingLevel: 250,
    },
    {
      program: "HTTPWorm.exe",
      hackingLevel: 500,
    },
    {
      program: "SQLInject.exe",
      hackingLevel: 750,
    },
  ];

  const hackingLevel = ns.getHackingLevel();
  for (const program of hackPrograms) {
    if (ns.fileExists(program.program)) continue;
    if (hackingLevel >= program.hackingLevel) {
      localStorage.setItem(keys.isProgramming, "true");
      ns.createProgram(program.program);
      while (ns.isBusy()) await ns.sleep(300);
      localStorage.setItem(keys.isProgramming, "false");
    }
  }
}

export const crimes = [
  "Heist",
  "Assassination",
  "Kidnap",
  "Grand Theft Auto",
  "Homicide",
  "Traffick Arms",
  "Bond Forgery",
  "Deal Drugs",
  "Larceny",
  "Mug",
  "Rob Store",
  "Shoplift",
];

export interface iFaction {
  name: string;
  rep: number;
  favor: number;
  augs: AugmentationStats[];
}

export interface iCrime {
  name: string;
  profit: number;
  hackGrowth: number;
  strGrowth: number;
  defGrowth: number;
  dexGrowth: number;
  agiGrowth: number;
  chaGrowth: number;
  successChance: number;
}

export interface iAugmentation {
  name: string;
  price: number;
  faction: string;
  rep: number;
  preReqs: string[];
}
