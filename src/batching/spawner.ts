import { NS, Server } from "Bitburner";

const cnctScript = "cnct.js";
const bkdrScript = "bkdr.js";

// time constants
// const second = 1000;
// const seconds = second;
// const minute = 60 * seconds;
// const minutes = minute;

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

  let scriptName = `/batching/${cmd}.js`;
  let threadsLeft = threads;

  // calculate the memory.
  while (true) {
    // copy script to all servers (even those that have been purchased recently.)
    const tree = new ServerTree(ns);
    for (const host of tree.home.list()) {
      await ns.scp(scriptName, "home", host.hostname);
    }

    const threadsUsed = spawnScript(ns, scriptName, threads, target);
    ns.clearLog();
    if (threadsUsed === 0) {
      ns.print(`No host with enough ram to run ${scriptName}.`);
      await ns.sleep(1);
      continue;
    }
    threadsLeft -= threadsUsed;
    if (threadsLeft <= 0) {
      threadsLeft = threads;
      await ns.sleep(bufferTime);
    }
  }
}

// Spawns a given script on the server with the most free ram up to a maximum
// number of threads. Returns the number of threads that were spawned or 0 if
// none could be spawned.
function spawnScript(
  ns: NS,
  script: string,
  maxThreads: number,
  target: string
) {
  for (const host of getRunnableServers(ns)) {
    if (ns.getServerMaxRam("home") < 1000 && host.hostname === "home") continue;
    // calculate available ram
    const ramAvailable =
      host.maxRam - host.ramUsed - reservedRam(ns, host.hostname);
    // calculate threads to use
    const threads = Math.min(
      maxThreads,
      Math.floor(ramAvailable / ns.getScriptRam(script))
    );
    // run the script
    ns.print(`Launching ${script} on ${host.hostname} with target ${target}`);
    if (
      threads > 0 &&
      ns.exec(script, host.hostname, threads, target, Date.now())
    )
      // if successfully run return the number of threads used
      return threads;
  }
  return 0;
}

function reservedRam(ns: NS, host: string) {
  return host === "home"
    ? Math.max(ns.getScriptRam(cnctScript), ns.getScriptRam(bkdrScript))
    : 0;
}

export function getRunnableServers(ns: NS) {
  const tree = new ServerNode(ns);
  return tree
    .list()
    .filter((s) => s.hasAdminRights)
    .sort((a, b) => b.maxRam - b.ramUsed - (a.maxRam - a.ramUsed));
}

export class ServerNode {
  name: string;
  ns: NS;
  parent?: string;
  children: ServerNode[] = [];
  data: Server;

  // Constructs a server node and traverses the tree to create children nodes as
  // well.
  constructor(ns: NS, name: string = "home", parent?: string) {
    this.ns = ns;
    this.name = name;
    this.parent = parent;
    this.data = ns.getServer(name);

    const children = ns.scan(name);
    if (parent && children.includes(parent)) {
      const index = children.indexOf(parent);
      delete children[index];
    }
    this.children = children.map(
      (child: string) => new ServerNode(ns, child, name)
    );
  }

  // This finds a node with a given name and returns the path to it as an array
  // of strings.
  find(name: string, path: string[] = []): string[] {
    // check if we are found.
    if (this.name === name) {
      path.push(this.name);
      return path;
    }

    // shallow search first
    if (this.children.map((c) => c.name).includes(name)) {
      path.push(this.name);
      path.push(name);
      return path;
    }

    // now we go deeper
    for (const child of this.children) {
      if (!child) continue;
      let branch = child.find(name, path);
      if (branch.length > 0) {
        // we have found our server.
        return [this.name, ...branch];
      }
    }

    // if nothing is found we return an empty list.
    return [];
  }

  // This simply returns an array of all the servers.
  list(): Server[] {
    let result: Server[] = [this.data];

    // go through each child and add it and all it's children.
    for (const child of this.children) {
      if (!child) continue;
      if (!result.map((v) => v.hostname).includes(child.name))
        result.push(child.data);
      if (child.children.length > 0) {
        result = [...result, ...child.list()];
      } else result.push(child.data);
    }

    // uniquify the results.
    return [...new Set(result)];
  }

  filter(
    predicate: (value: Server, index: number, array: Server[]) => boolean
  ): Server[] {
    return this.list().filter(predicate);
  }
}

export class ServerTree {
  // The base of the server tree.
  home: ServerNode;

  // Initializes the server tree and saves it to local storage.
  constructor(ns: NS) {
    this.home = new ServerNode(ns);
  }
}
