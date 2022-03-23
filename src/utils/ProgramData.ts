import { NS } from "Bitburner";

export class ProgramData {
  programs: {
    filename: string;
    hackingLevel: number;
    execute: (host: string) => void;
    exists: boolean;
  }[];

  constructor(ns: NS) {
    this.programs = [
      {
        filename: "BruteSSH.exe",
        hackingLevel: 50,
        execute: ns.brutessh,
        get exists() {
          return ns.fileExists(this.filename);
        },
      },
      {
        filename: "FTPCrack.exe",
        hackingLevel: 100,
        execute: ns.ftpcrack,
        get exists() {
          return ns.fileExists(this.filename);
        },
      },
      {
        filename: "relaySMTP.exe",
        hackingLevel: 250,
        execute: ns.relaysmtp,
        get exists() {
          return ns.fileExists(this.filename);
        },
      },
      {
        filename: "HTTPWorm.exe",
        hackingLevel: 500,
        execute: ns.httpworm,
        get exists() {
          return ns.fileExists(this.filename);
        },
      },
      {
        filename: "SQLInject.exe",
        hackingLevel: 750,
        execute: ns.sqlinject,
        get exists() {
          return ns.fileExists(this.filename);
        },
      },
    ];
  }

  get hackablePorts(): number {
    let total = 0;
    for (const p of this.programs) {
      if (p.exists) total++;
    }
    return total;
  }
}
