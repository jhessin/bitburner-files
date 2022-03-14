import { NS, Server } from "Bitburner";
import { keys } from "consts";

const maxServers = 50;
const remoteHackScript = "/remote/hackLoop.js";

function getServers(): Server[] {
  const data = localStorage.getItem(keys.serverList);
  if (!data) return [];
  return JSON.parse(data);
}

function getServerWithMemory(ns: NS, memory: number): Server | undefined {
  let servers = getServers().filter((s) => {
    // update host
    s = ns.getServer(s.hostname);
    // need admin rights on any server.
    if (!s.hasAdminRights) return false;
    // Don't hog the home pc
    if (s.hostname.includes("home")) return false;
    const total = s.maxRam;
    const used = s.ramUsed;
    const free = (total - used) * 1e9;
    return free >= memory;
  });
  return servers[0];
}

async function getRichestServers(ns: NS): Promise<Server[]> {
  let cutoff = 1;
  let servers = getServers().filter(
    (server) =>
      server.hasAdminRights &&
      server.requiredHackingSkill <= ns.getHackingLevel() &&
      server.moneyMax >= cutoff
  );
  while (servers.length > maxServers) {
    cutoff += 1e3;
    servers = servers.filter((server) => server.moneyMax >= cutoff);
    await ns.sleep(1);
  }
  return servers;
}

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const targets = await getRichestServers(ns);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || targets.length === 0) {
    ns.tprint(`
      This script will generate money by hacking the richest server possible.
      It automatically finds the richest server that the user can hack.
      If you are seeing this message and didn't use the --help flag then
      you either haven't run the /utils/updateServers.ts script since you installed augmentations
      or you haven't nuked any servers yet.

      This script currently uses ${ns.nFormat(ram, "0.000b")} of RAM.

      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }
  await distributedHack(ns, targets);
}

async function distributedHack(ns: NS, targets: Server[]) {
  while (true) {
    await ns.sleep(500);
    ns.clearLog();
    // if (!ns.isBusy()) {
    //   ns.universityCourse(
    //     "Rothman University",
    //     "Study Computer Science",
    //     false
    //   );
    // }
    for (const target of targets) {
      ns.print(`Hacking ${target.hostname}`);
      const memory = ns.getScriptRam(remoteHackScript) * 1e9;
      ns.print(`Requires ${ns.nFormat(memory, "0.00b")} of RAM`);

      const host = getServerWithMemory(ns, memory);
      if (host) {
        const updatedHost = ns.getServer(host.hostname);
        ns.print(`${host.hostname} found to hack ${target.hostname}`);
        await ns.scp(remoteHackScript, host.hostname);
        const threads = Math.floor(
          (updatedHost.maxRam - updatedHost.ramUsed) /
            ns.getScriptRam(remoteHackScript)
        );
        if (threads === 0) continue;
        ns.enableLog("exec");
        ns.exec(remoteHackScript, host.hostname, threads, target.hostname);
      } else {
        ns.print(`couldn't find a server to hack ${target.hostname}`);
      }
      await ns.sleep(3000);
    }
  }
}
