import { NS } from "Bitburner";
import { Command, CommandType } from "utils/command";
import { ServerTree } from "utils/ServerTree";

const cnctScript = "cnct.js";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const cmd = args._[0] as string;
  const target = args._[1] as string;
  const threads = args._[2] as number;
  const bufferTime = args._[3] as number;
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (
    args.help ||
    !cmd ||
    !["hack", "grow", "weaken"].includes(cmd.toLowerCase()) ||
    !target ||
    !threads ||
    !bufferTime
  ) {
    ns.tprint(`
      Repeatedly spawns weakens on a server.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} HOST TARGET THREADS BUFFERTIME
      `);
    return;
  }
  function shouldKill(): boolean {
    const port = ns.getPortHandle(1);
    if (port.empty()) return false;
    const line = port.read();
    // numbers aren't for us.
    if (typeof line === "number") return false;
    const command = JSON.parse(line);
    if (command instanceof Command) {
      if (
        command.cmd === CommandType.KillSpawner &&
        command.args.includes(target) &&
        command.args.includes(cmd)
      )
        return true;
    }
    return false;
  }
  let spawnedScripts: number[] = [];
  const tree = new ServerTree(ns);

  let scriptName = `/batching/${cmd}.js`;

  for (const host of tree.home.list()) {
    await ns.scp(scriptName, host.hostname);
  }

  // calculate the memory.
  const memory = threads * ns.getScriptRam(scriptName);

  while (!shouldKill()) {
    const host = tree.home.filter((s) => {
      if (!s.hasAdminRights) return false;
      const { hostname } = s;
      return (
        ns.getServerMaxRam(hostname) -
          ns.getServerUsedRam(hostname) -
          ns.getScriptRam(cnctScript) >=
        memory
      );
    })[0];

    ns.clearLog();
    if (!host) {
      ns.print(
        `No host with enough ram to run ${scriptName} with ${threads} threads.`
      );
      await ns.sleep(bufferTime);
      continue;
    }
    ns.print(
      `Launching ${scriptName} on ${host.hostname} with target ${target}`
    );
    let pid = ns.exec(scriptName, host.hostname, threads, target, Date.now());
    if (pid) {
      spawnedScripts.push(pid);
      await ns.sleep(bufferTime * 3);
    } else {
      await ns.sleep(1);
    }
  }

  for (const script of spawnedScripts) {
    ns.kill(script);
  }
}
