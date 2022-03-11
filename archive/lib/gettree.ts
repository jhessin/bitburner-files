import { NS } from "Bitburner";

export async function main(ns: NS) {
  let tree = await getTree(ns);
  ns.tprint(JSON.stringify(tree, null, 2));
}

/**
 * Returns the path to a specified target - or prints the entire tree.
 */
export async function getTree(ns: NS) {
  /**
   * @typedef HashMap
   * @type {object}
   *
   * @type {HashMap}
   */
  let serverRoot = { home: {} };
  let allServers: string[] = ["home"];

  async function getServers(host = "home", parent = serverRoot.home) {
    let localServers = ns.scan(host);
    localServers = localServers.filter((s) => !allServers.includes(s));
    if (localServers.length === 0) return;
    for (let server of localServers) {
      allServers.push(server);
      parent[server] = {};
      await getServers(server, parent[server]);
    }
  }
  await getServers();

  // This lists all contracts.
  /*
    for (let server of serverRoot) {
        let files = ns.ls(server, 'cct');
        if (files.length === 0) return;
        ns.tprint("==================================");
        ns.tprint(`Files on ${server}:`);
        for (let file of files) {
            ns.tprint(`\t${file}`);
        }
        ns.tprint("==================================");
    }
    */
  // ns.tprint(`${serverRoot.length} servers found!`);

  return serverRoot;
}
