import { AugmentationStats } from "Bitburner";

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
