import { NS } from "Bitburner";

export async function main(ns: NS) {
  await getAllServers(ns);
}

/** @param {NS} ns **/
export async function getAllServers(ns: NS) {
  let allServers: string[] = [];
  async function getServers(host: string | undefined = undefined) {
    let localServers = ns.scan(host);
    localServers = localServers.filter((s) => !allServers.includes(s));
    if (localServers.length === 0) return;
    for (let server of localServers) {
      allServers.push(server);
      await getServers(server);
    }
  }
  await getServers();

  // This lists all contracts.
  /*
    for (let server of allServers) {
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
  // ns.tprint(`${allServers.length} servers found!`);

  return allServers;
}
