import { commitCrime } from "actions/crime";
import { NS } from "Bitburner";
import { workForCompany } from "actions/companyWork";
import { etaCalculator } from "utils/etaCalculator";

// Interface to hold requirements to join a faction to be attached to the
// factionData object.
export interface iFactionRequirement {
  lockouts: string[];
  locations: string[];
  hackLevel?: number;
  strLevel?: number;
  defLevel?: number;
  dexLevel?: number;
  agiLevel?: number;
  chaLevel?: number;
  companyName?: string;
  companyRep?: number;
  backdoorServer?: string;
  hacknetLevels?: number;
  hacknetRAM?: number;
  hacknetCores?: number;
  karmaReq?: number;
  chiefOfCompanyReq?: boolean;
  peopleKilled?: number;
  augsReq?: number;
  cashReq?: number;
}

// This class is for each faction in the game. It should hold everything we
// need to join the faction along with a method to test if the faction is
// needed.
export class FactionData {
  ns: NS;
  name: string;
  requirements: iFactionRequirement;

  constructor(ns: NS, name: string, req: iFactionRequirement) {
    this.ns = ns;
    this.name = name;
    this.requirements = req;
  }

  get needed(): boolean {
    if (this.ns.getPlayer().factions.includes(this.name)) return false;
    if (
      this.ns.singularity
        .getAugmentationsFromFaction(this.name)
        .filter(
          (aug) =>
            !this.ns.singularity.getOwnedAugmentations(true).includes(aug)
        ).length === 0
    )
      return false;
    return true;
  }

  get augs(): string[] {
    return this.ns.singularity.getAugmentationsFromFaction(this.name);
  }

  get neededAugs(): string[] {
    return this.augs.filter(
      (aug) => !this.ns.singularity.getOwnedAugmentations(true).includes(aug)
    );
  }

  get canJoin(): boolean {
    const ns = this.ns;
    const req = this.requirements;
    const player = this.ns.getPlayer();
    if (req.hackLevel && req.hackLevel > player.hacking) return false;
    if (req.strLevel && req.strLevel > player.strength) return false;
    if (req.defLevel && req.defLevel > player.defense) return false;
    if (req.dexLevel && req.dexLevel > player.dexterity) return false;
    if (req.agiLevel && req.agiLevel > player.agility) return false;
    if (req.chaLevel && req.chaLevel > player.charisma) return false;
    if (req.cashReq && req.cashReq > ns.getServerMoneyAvailable("home"))
      return false;
    if (
      req.companyName &&
      req.companyRep &&
      req.companyRep > ns.singularity.getCompanyRep(req.companyName)
    )
      return false;
    if (
      req.backdoorServer &&
      !ns.getServer(req.backdoorServer).backdoorInstalled
    )
      return false;
    const hacknetStats = getHacknetStats(this.ns);
    if (req.hacknetLevels && req.hacknetLevels > hacknetStats.levels)
      return false;
    if (req.hacknetRAM && req.hacknetRAM > hacknetStats.ram) return false;
    if (req.hacknetCores && req.hacknetCores > hacknetStats.cores) return false;

    if (req.lockouts.length > 0) {
      for (const faction of player.factions) {
        if (req.lockouts.includes(faction)) return false;
      }
    }

    // TODO: figure out how to see karma?
    if (req.chiefOfCompanyReq) {
      // TODO: figure out how to check company positions.
    }

    if (req.peopleKilled && player.numPeopleKilled < req.peopleKilled)
      return false;

    if (
      req.augsReq &&
      req.augsReq > ns.singularity.getOwnedAugmentations(false).length
    )
      return false;

    // if nothing fails - success! - we can travel if we want.
    // TODO: also need to check Karma and the CEO/CFO/CSO positions
    return true;
  }

  async workToJoin(): Promise<boolean> {
    if (!this.needed) return false;
    // don't interupt programming
    if (
      this.ns.singularity.isBusy() &&
      this.ns.getPlayer().workType.includes("Program")
    )
      return false;

    this.ns.print(`Trying to join ${this.name}`);

    const req = this.requirements;
    if (this.canJoin && req.locations.length > 0) {
      if (req.locations.includes(this.ns.getPlayer().location)) {
        // check other requirements
        if (req.chiefOfCompanyReq) {
          await workForCompany(this.ns, "MegaCorp", "business");
          return true;
        } else {
          await commitCrime(this.ns);
          return true;
        }
      }
    }

    // CHECK EVERYTHING HERE.
    // not much can be done if we need augs
    if (
      req.augsReq &&
      req.augsReq > this.ns.singularity.getOwnedAugmentations(false).length
    )
      return false;
    const player = this.ns.getPlayer();
    const hacknetStats = getHacknetStats(this.ns);
    if (req.hacknetLevels && req.hacknetLevels > hacknetStats.levels) {
      for (let i = 0; i < this.ns.hacknet.numNodes(); i++) {
        if (
          this.ns.getServerMoneyAvailable("home") >=
          this.ns.hacknet.getLevelUpgradeCost(i, 1)
        )
          this.ns.hacknet.upgradeLevel(i, 1);
      }
      return false;
    }
    if (req.hacknetRAM && req.hacknetRAM > hacknetStats.ram) {
      for (let i = 0; i < this.ns.hacknet.numNodes(); i++) {
        if (
          this.ns.getServerMoneyAvailable("home") >=
          this.ns.hacknet.getRamUpgradeCost(i, 1)
        )
          this.ns.hacknet.upgradeRam(i, 1);
      }
      return false;
    }
    if (req.hacknetCores && req.hacknetCores > hacknetStats.cores) {
      for (let i = 0; i < this.ns.hacknet.numNodes(); i++) {
        if (
          this.ns.getServerMoneyAvailable("home") >=
          this.ns.hacknet.getCoreUpgradeCost(i, 1)
        )
          this.ns.hacknet.upgradeCore(i, 1);
      }
      return false;
    }
    if (req.strLevel && req.strLevel > player.strength)
      gym(this.ns, "strength");
    else if (req.defLevel && req.defLevel > player.defense)
      gym(this.ns, "defense");
    else if (req.dexLevel && req.dexLevel > player.dexterity)
      gym(this.ns, "dexterity");
    else if (req.agiLevel && req.agiLevel > player.agility)
      gym(this.ns, "agility");
    else if (req.chaLevel && req.chaLevel > player.charisma)
      university(this.ns, "charisma");
    else if (req.hackLevel && req.hackLevel > player.hacking)
      university(this.ns, "hacking");
    else if (
      req.companyName &&
      req.companyRep &&
      req.companyRep > this.ns.singularity.getCompanyRep(req.companyName)
    ) {
      if (
        this.ns.singularity.isBusy() &&
        player.workType.includes("Company") &&
        player.companyName === req.companyName
      ) {
        if (
          req.companyRep <=
          this.ns.singularity.getCompanyRep(req.companyName) +
            player.workRepGained *
              getCompanyRepMultiplier(this.ns, req.companyName)
        )
          this.ns.singularity.stopAction();
        else {
          const current =
            this.ns.singularity.getCompanyRep(req.companyName) +
            player.workRepGained *
              getCompanyRepMultiplier(this.ns, req.companyName);
          const gainRate =
            this.ns.getPlayer().workRepGainRate *
            getCompanyRepMultiplier(this.ns, req.companyName);
          const timeLeft = (req.companyRep - current) / gainRate;
          this.ns.print(`Need rep with ${req.companyName}`);
          this.ns.print(`ETA   : ${this.ns.tFormat(timeLeft)}`);
          this.ns.print(`ETA   : ${etaCalculator(this.ns, timeLeft)}`);
        }
      } else await workForCompany(this.ns, req.companyName);
    } else if (req.peopleKilled && req.peopleKilled > player.numPeopleKilled)
      await commitCrime(this.ns, "homicide");
    else if (
      req.cashReq &&
      req.cashReq > this.ns.getServerMoneyAvailable("home")
    )
      await commitCrime(this.ns);

    return true;
  }
}

function gym(ns: NS, stat: "strength" | "defense" | "dexterity" | "agility") {
  const statGains = {
    strength: ns.getPlayer().workStrExpGainRate,
    defense: ns.getPlayer().workDefExpGainRate,
    dexterity: ns.getPlayer().workDexExpGainRate,
    agility: ns.getPlayer().workAgiExpGainRate,
  };
  if (ns.singularity.isBusy() && statGains[stat] > 0) return;
  ns.singularity.gymWorkout("Powerhouse Gym", stat);
}

function university(ns: NS, stat: "hacking" | "charisma") {
  const statGains = {
    hacking: ns.getPlayer().workHackExpGainRate,
    charisma: ns.getPlayer().workChaExpGainRate,
  };
  if (ns.singularity.isBusy() && statGains[stat] > 0) return;
  ns.singularity.universityCourse(
    "Rothman University",
    stat === "hacking" ? "algorithms" : "leadership"
  );
}

function getAllFactions(ns: NS): FactionData[] {
  return [
    // Early Game
    new FactionData(ns, "CyberSec", {
      locations: [],
      lockouts: [],
      backdoorServer: "CSEC",
    }),
    new FactionData(ns, "Tian Di Hui", {
      locations: ["Chongqing", "New Tokyo", "Ishima"],
      lockouts: [],
      hackLevel: 50,
      cashReq: 1_000_000,
    }),
    new FactionData(ns, "Netburners", {
      locations: [],
      lockouts: [],
      hackLevel: 80,
      hacknetLevels: 100,
      hacknetRAM: 8,
      hacknetCores: 4,
    }),
    // City Factions
    new FactionData(ns, "Sector-12", {
      locations: ["Sector-12"],
      lockouts: ["Chongqing", "New Tokyo", "Ishima", "Volhaven"],
      cashReq: 15_000_000,
    }),
    new FactionData(ns, "Aevum", {
      locations: ["Aevum"],
      lockouts: ["Chongqing", "New Tokyo", "Ishima", "Volhaven"],
      cashReq: 40_000_000,
    }),
    new FactionData(ns, "Chongqing", {
      locations: ["Chongqing"],
      lockouts: ["Sector-12", "Aevum", "Volhaven"],
      cashReq: 20_000_000,
    }),
    new FactionData(ns, "New Tokyo", {
      locations: ["New Tokyo"],
      lockouts: ["Sector-12", "Aevum", "Volhaven"],
      cashReq: 20_000_000,
    }),
    new FactionData(ns, "Ishima", {
      locations: ["Ishima"],
      lockouts: ["Sector-12", "Aevum", "Volhaven"],
      cashReq: 30_000_000,
    }),
    new FactionData(ns, "Volhaven", {
      locations: ["Volhaven"],
      lockouts: ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima"],
      cashReq: 50_000_000,
    }),
    // Hacking Groups
    new FactionData(ns, "NiteSec", {
      locations: [],
      lockouts: [],
      backdoorServer: "avmnite-02h",
    }),
    new FactionData(ns, "The Black Hand", {
      locations: [],
      lockouts: [],
      backdoorServer: "I.I.I.I",
    }),
    new FactionData(ns, "BitRunners", {
      locations: [],
      lockouts: [],
      backdoorServer: "run4theh111z",
    }),
    // Corporations
    new FactionData(ns, "MegaCorp", {
      locations: [],
      lockouts: [],
      companyName: "MegaCorp",
      companyRep: 200_000,
    }),
    new FactionData(ns, "Four Sigma", {
      locations: [],
      lockouts: [],
      companyName: "Four Sigma",
      companyRep: 200_000,
    }),
    new FactionData(ns, "Blade Industries", {
      locations: [],
      lockouts: [],
      companyName: "Blade Industries",
      companyRep: 200_000,
    }),
    new FactionData(ns, "ECorp", {
      locations: [],
      lockouts: [],
      companyName: "ECorp",
      companyRep: 200_000,
    }),
    new FactionData(ns, "Bachman & Associates", {
      locations: [],
      lockouts: [],
      companyName: "Bachman & Associates",
      companyRep: 200_000,
    }),
    new FactionData(ns, "Clarke Incorporated", {
      locations: [],
      lockouts: [],
      companyName: "Clarke Incorporated",
      companyRep: 200_000,
    }),
    new FactionData(ns, "Fulcrum Secret Technologies", {
      locations: [],
      lockouts: [],
      companyName: "Fulcrum Technologies",
      companyRep: 250_000,
      backdoorServer: "fulcrumassets",
    }),
    new FactionData(ns, "KuaiGong International", {
      locations: [],
      lockouts: [],
      companyName: "KuaiGong International",
      companyRep: 200_000,
    }),
    new FactionData(ns, "NWO", {
      locations: [],
      lockouts: [],
      companyName: "NWO",
      companyRep: 200_000,
    }),
    new FactionData(ns, "OmniTek Incorporated", {
      locations: [],
      lockouts: [],
      companyName: "OmniTek Incorporated",
      companyRep: 200_000,
    }),
    // Criminal Organizations
    new FactionData(ns, "Slum Snakes", {
      locations: [],
      lockouts: [],
      cashReq: 1_000_000,
      karmaReq: -9,
      strLevel: 30,
      defLevel: 30,
      dexLevel: 30,
      agiLevel: 30,
    }),
    new FactionData(ns, "Tetrads", {
      locations: ["Chongqing", "New Tokyo", "Ishima"],
      lockouts: [],
      karmaReq: -18,
      strLevel: 75,
      defLevel: 75,
      dexLevel: 75,
      agiLevel: 75,
    }),
    new FactionData(ns, "Silhouette", {
      locations: [],
      lockouts: [],
      karmaReq: -22,
      cashReq: 15_000_000,
      chiefOfCompanyReq: true,
    }),
    new FactionData(ns, "Speakers for the Dead", {
      locations: [],
      lockouts: [],
      hackLevel: 100,
      strLevel: 300,
      defLevel: 300,
      dexLevel: 300,
      agiLevel: 300,
      peopleKilled: 30,
      karmaReq: -45,
    }),
    new FactionData(ns, "The Dark Army", {
      locations: ["Chongqing"],
      lockouts: [],
      hackLevel: 300,
      strLevel: 300,
      defLevel: 300,
      dexLevel: 300,
      agiLevel: 300,
      peopleKilled: 5,
      karmaReq: -45,
    }),
    new FactionData(ns, "The Syndicate", {
      locations: ["Aevum", "Sector-12"],
      lockouts: [],
      hackLevel: 200,
      strLevel: 200,
      defLevel: 200,
      dexLevel: 200,
      agiLevel: 200,
      cashReq: 10_000_000,
      karmaReq: -90,
    }),
    // Endgame Factions
    new FactionData(ns, "Daedalus", {
      locations: [],
      lockouts: [],
      augsReq: 30,
      cashReq: 100_000_000_000,
      hackLevel: 2500,
    }),
    new FactionData(ns, "The Covenant", {
      locations: [],
      lockouts: [],
      augsReq: 20,
      cashReq: 75_000_000_000,
      hackLevel: 850,
      strLevel: 850,
      defLevel: 850,
      dexLevel: 850,
      agiLevel: 850,
    }),
    new FactionData(ns, "Illuminati", {
      locations: [],
      lockouts: [],
      augsReq: 30,
      cashReq: 150_000_000_000,
      hackLevel: 1500,
      strLevel: 1200,
      defLevel: 1200,
      dexLevel: 1200,
      agiLevel: 1200,
    }),
  ];
}

export function getNeededFactions(ns: NS): FactionData[] {
  return getAllFactions(ns).filter((faction) => faction.needed);
}

function getAllAugs(ns: NS): string[] {
  const allAugs = getAllFactions(ns).flatMap((f) => f.augs);
  return Array.from(new Set(allAugs));
}

export function getUninstalledAugs(ns: NS): string[] {
  return getAllAugs(ns).filter(
    (aug) => !ns.singularity.getOwnedAugmentations(false).includes(aug)
  );
}
function getCompanyRepMultiplier(ns: NS, companyName: string) {
  try {
    if (ns.getServer(companyName).backdoorInstalled) return 0.75;
    else return 0.5;
  } catch (error) {
    return 0.5;
  }
}

function getHacknetStats(ns: NS): {
  levels: number;
  ram: number;
  cores: number;
} {
  let levels = 0;
  let ram = 0;
  let cores = 0;
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    const node = ns.hacknet.getNodeStats(i);
    levels += node.level;
    ram += node.ram;
    cores += node.cores;
  }
  return {
    levels,
    cores,
    ram,
  };
}
