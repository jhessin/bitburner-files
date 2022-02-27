import { NS } from "Bitburner";
import { getRunnableServers } from "lib/getall";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  if (args.help || args._.length < 2) {
    ns.tprint(
      "This script deploys another script on a server with maximum threads possible."
    );
    ns.tprint(`Usage: run ${ns.getScriptName()} HOST SCRIPT ARGUMENTS`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} n00dles basic_hack.js foodnstuff`);
    return;
  }

  const host = args._[0];
  const script = args._[1];
  const script_args = args._.slice(2);

  await deploy(ns, host, script, ...script_args);
}

/**
 * Deploys another script on a server with maximum threads possible.
 * @param {NS} ns - the netscript library.
 * @param {string} host - the host to run the script on.
 * @param {...(string | number | boolean)} script_args - the arguments to pass
 * to the script.
 */
export async function deploy(
  ns: NS,
  host: string,
  script: string,
  ...script_args: (string | number | boolean)[]
) {
  if (!ns.serverExists(host)) {
    ns.tprint(`Server '${host}' does not exist. Aborting.`);
    return;
  }
  if (!ns.ls(ns.getHostname()).find((f) => f === script)) {
    ns.tprint(`Script '${script}' does not exist. Aborting.`);
    return;
  }

  const threads = Math.floor(
    (ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) /
      ns.getScriptRam(script)
  );

  if (threads > 0) {
    ns.print(
      `Launching script '${script}' on server '${host}' with ${threads} threads and the following arguments: ${script_args}`
    );
    await ns.scp(script, ns.getHostname(), host);
    ns.exec(script, host, threads, ...script_args);
  }
}

/**
 * Deploys another script on a server with maximum threads possible.
 * @param {NS} ns - the netscript library.
 * @param {string} host - the host to run the script on.
 * @param {...(string | number | boolean)} script_args - the arguments to pass
 * to the script.
 */
export async function deployHalf(
  ns: NS,
  host: string,
  script: string,
  ...script_args: (string | number | boolean)[]
) {
  if (!ns.serverExists(host)) {
    ns.tprint(`Server '${host}' does not exist. Aborting.`);
    return;
  }
  if (!ns.ls(ns.getHostname()).find((f) => f === script)) {
    ns.tprint(`Script '${script}' does not exist. Aborting.`);
    return;
  }

  const threads = Math.floor(
    (ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) /
      (ns.getScriptRam(script) * 2)
  );

  if (threads > 0) {
    ns.tprint(
      `Launching script '${script}' on server '${host}' with ${threads} threads and the following arguments: ${script_args}`
    );
    await ns.scp(script, ns.getHostname(), host);
    ns.exec(script, host, threads, ...script_args);
  }
}
/**
 * @param {NS} ns - The netscript library.
 * @param {string} script - The name of the script to run.
 * @param {boolean} restart - Should the script be restarted if it is already
 * running? Defaults to false. If true this will kill all scripts on the server.
 * @param {...string | number | boolean} args - Any arguments to pass to the script.
 */
export async function deployToAll(
  ns: NS,
  script: string,
  restart: boolean = false,
  ...args: (string | number | boolean)[]
) {
  const servers = await getRunnableServers(ns);

  for (const s of servers) {
    // Don't hog home - so I can still run things like find...
    if (s === "home") {
      if (ns.scriptRunning(script, s)) continue;
      await deployHalf(ns, s, script, ...args);
      await ns.sleep(1);
      continue;
    }
    if (restart) ns.killall(s);
    if (ns.scriptRunning(script, s)) continue;
    await deploy(ns, s, script, ...args);
    await ns.sleep(1);
  }
}
