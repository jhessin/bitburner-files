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

export class GM {
  private _ns: NS;

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

  constructor(ns: NS) {
    this._ns = ns;
    this.updateStorage();
  }

  public get ns(): NS {
    return this._ns;
  }

  public get serverList(): Server[] {
    return getData(keys.serverList) || [];
  }

  private set serverList(data: Server[]) {
    setData(keys.serverList, data);
  }

  public get hackablePorts(): number {
    let count = 0;
    for (const p of this.HackPrograms.map((p) => p.filename)) {
      if (this.ns.fileExists(p)) count++;
    }
    return count;
  }

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

  public get isProgramming(): boolean {
    return getData(keys.isProgramming);
  }

  public set isProgramming(data: boolean) {
    setData(keys.isProgramming, data);
  }

  public updateStorage() {
    // This method will pull data from localStorage and update it if necessary.
    // The only data that should be stored are things that take some time to
    // calculate - or things that can't be calculated.
    //
    // Generate serverList if necessary.
    if (this.serverList.length === 0) {
      this.recursiveScan();
    }
  }

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

  public killEverything() {
    for (const { hostname } of this.serverList) {
      this.ns.killall(hostname);
    }
  }

  public killEverythingElse() {
    for (const { hostname } of this.serverList) {
      for (const ps of this.ns.ps(hostname)) {
        if (this.ns.getScriptName() === ps.filename) continue;
        this.ns.scriptKill(ps.filename, hostname);
      }
    }
  }

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

  recursiveScan(parent: string = "home", server: string = "home") {
    const children = this.ns.scan(server);
    if (!this.serverList.map((s) => s.hostname).includes(server))
      this.serverList.push(this.ns.getServer(server));
    for (const child of children) {
      if (parent == child) continue;
      this.recursiveScan(server, child);
    }
  }
}
