import { NS, Server } from "Bitburner";

export interface iAugmentationList {
  queued: string[];
  installed: string[];
  includes(value: string): boolean;
}

function setData(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getData(key: string): any {
  JSON.parse(localStorage.getItem(key) || JSON.stringify(undefined));
}

// The keys for localStorage.
const keys = {
  // The complete list of servers with their data.
  serverList: "serverList",
  // Are we programming?
  isProgramming: "Is Programming",
};

export async function main(ns: NS) {
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  ns.tprint(`
      This file is not meant to be called. It holds the wrapper class for game managed functions.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      `);
}

/**
 * This is the main wrapper Game Manager class.
 * It holds all the data and functionality of common actions in the game.
 */
export class GM {
  private _ns: NS;

  /**
   * These are the HackPrograms used to open ports for hacking and executing
   * scripts.
   *
   * It is an array of simple objects holding:
   * filename: the name of the file.
   * execute: the ns fuction to use the program.
   * programmingLevel: the required programmingLevel to create the program.
   */
  public get HackPrograms(): {
    filename: string;
    execute(host: string): void;
    programmingLevel: number;
  }[] {
    return [
      {
        filename: "BruteSSH.exe",
        execute: this.ns.brutessh,
        programmingLevel: 50,
      },
      {
        filename: "FTPCrack.exe",
        execute: this.ns.ftpcrack,
        programmingLevel: 100,
      },
      {
        filename: "relaySMTP.exe",
        execute: this.ns.relaysmtp,
        programmingLevel: 250,
      },
      {
        filename: "HTTPWorm.exe",
        execute: this.ns.httpworm,
        programmingLevel: 500,
      },
      {
        filename: "SQLInject.exe",
        execute: this.ns.sqlinject,
        programmingLevel: 750,
      },
    ];
  }

  /**
   * This function creates hacking programs if it can. Does nothing if it can't
   * or if they are already created.
   */
  public async createPrograms() {
    // check if we have nothing to program.
    if (this.hackablePorts === this.HackPrograms.length) return;

    // otherwise create hack programs.
    for (const p of this.HackPrograms) {
      if (this.ns.fileExists(p.filename)) continue;
      if (p.programmingLevel > this.ns.getHackingLevel()) break;
      // here we know we have the programming chops and the file doesn't already
      // exist.
      this.isProgramming = true;
      while (!this.ns.fileExists(p.filename)) {
        if (!this.ns.isBusy()) this.ns.createProgram(p.filename);
        await this.ns.sleep(500);
      }
      this.isProgramming = false;
    }
  }

  /**
   * The primary constructor loads basic data for the gm.
   */
  constructor(ns: NS) {
    this._ns = ns;
    this.updateStorage();
  }

  /**
   * This is the Netscript instance used to create the Game Manager.
   */
  public get ns(): NS {
    return this._ns;
  }

  /**
   * The list of all available servers. Used for hacking purposes.
   */
  public get serverList(): Server[] {
    return getData(keys.serverList) || [];
  }

  private set serverList(data: Server[]) {
    setData(keys.serverList, data);
  }

  /**
   * This is simply the count of all our hacking programs.
   */
  public get hackablePorts(): number {
    let count = 0;
    for (const p of this.HackPrograms.map((p) => p.filename)) {
      if (this.ns.fileExists(p)) count++;
    }
    return count;
  }

  /**
   * The augmentations that we currently have. This is split into:
   * installed: those augmentations we have installed.
   * queued: those augmentations we have purchased and have not yet installed.
   *
   * There is also a helper method:
   * includes(aug) -> boolean
   * This tests if an augmentation is in either {installed} or {queued} lists.
   */
  public get augmentations(): iAugmentationList {
    let installed = this.ns.getOwnedAugmentations(false);
    let queued = this.ns
      .getOwnedAugmentations(true)
      .filter((a) => !installed.includes(a));
    return {
      installed,
      queued,
      includes(value: string): boolean {
        return this.installed.includes(value) || this.queued.includes(value);
      },
    };
  }

  /**
   * This is a flag to let other operations know if we are working on a program.
   */
  public get isProgramming(): boolean {
    return getData(keys.isProgramming);
  }

  private set isProgramming(data: boolean) {
    setData(keys.isProgramming, data);
  }

  /**
   * This updates the stored variables.
   * Currently it only updates the serverList.
   */
  public updateStorage() {
    // This method will pull data from localStorage and update it if necessary.
    // The only data that should be stored are things that take some time to
    // calculate - or things that can't be calculated.
    //
    // Generate serverList if necessary.
    this.recursiveScan();
  }

  /**
   * This will return true if the server is nuked.
   * If the server is not nuked but can be this will nuke it and return true.
   * If the server cannot be nuked this will return false.
   *
   * TLDR; true = you have root access. false = you can't get root access yet.
   */
  public nuke(host: string) {
    if (this.ns.hasRootAccess(host)) {
      // already nuked
      return true;
    }

    if (this.ns.getServerNumPortsRequired(host) > this.hackablePorts) {
      // cannot nuke
      return false;
    }

    for (const p of this.HackPrograms) {
      if (this.ns.fileExists(p.filename)) p.execute(host);
    }

    this.ns.nuke(host);
    return true;
  }

  /**
   * This will return true if a backdoor is installed.
   * If not and a backdoor can be installed this installs it and returns true.
   * If we can't backdoor the server yet this returns false.
   *
   * TLDR; true = this server has the backdoor installed. false = we can't
   * install the backdoor yet.
   */
  public async backdoor(host: string) {
    // check if the backdoor is already installed.
    if (this.ns.getServer(host).backdoorInstalled) return true;

    // check if we have/can get admin priviledges.
    if (!this.nuke(host)) return false;

    // We know we have admin priviledges now...
    if (this.ns.getServerRequiredHackingLevel(host) > this.ns.getHackingLevel())
      // We can't backdoor the server yet.
      return false;

    await this.connect(host);
    await this.ns.installBackdoor();
    await this.connect("home");
    return true;
  }

  /**
   * This kills every script on every host - including the script that calls it.
   */
  public killEverything() {
    for (const { hostname } of this.serverList) {
      this.ns.killall(hostname);
    }
  }

  /**
   * This kills every script on every host except the script that calls it.
   */
  public killEverythingElse() {
    for (const { hostname } of this.serverList) {
      for (const ps of this.ns.ps(hostname)) {
        if (
          this.ns.getScriptName() === ps.filename &&
          this.ns.getHostname() === hostname
        )
          continue;
        this.ns.scriptKill(ps.filename, hostname);
      }
    }
  }

  /**
   * This connects to any valid server regardless of path.
   */
  public async connect(target: string) {
    let route = [];
    if (!this.ns.serverExists(target)) return;
    if (!this.find(target, route)) {
      this.ns.print(`Could not find server ${target}`);
      return false;
    }

    for (const i of route) {
      if (this.ns.serverExists(i)) this.ns.connect(i);
      await this.ns.sleep(1);
    }
    return true;
  }

  /**
   * This is a helper method to find the path to a server.
   * Used by connect()
   */
  private find(
    target: string,
    route: string[] = [],
    parent: string = "",
    server: string = "home"
  ) {
    const children = this.ns.scan(server);
    for (let child of children) {
      if (parent == child) {
        continue;
      }
      if (child == target) {
        route.unshift(child);
        route.unshift(server);
        return true;
      }

      if (this.find(target, route, server, child)) {
        route.unshift(server);
        return true;
      }
    }
    return false;
  }

  /**
   * This is a helper method used to generate the exhaustive server list.
   */
  private recursiveScan(parent: string = "", server: string = "home") {
    const children = this.ns.scan(server);
    if (!this.serverList.map((s) => s.hostname).includes(server))
      this.serverList.push(this.ns.getServer(server));
    for (const child of children) {
      if (parent == child) continue;
      this.recursiveScan(server, child);
    }
  }
}
