import { NS } from "Bitburner";
import { getAllServers } from "lib/getall";

export async function main(ns: NS) {
  // files to copy to each server
  const files = [
    "/basic/hack.js",
    "/basic/grow.js",
    "/basic/weaken.js",
    "/basic/early-hack.js",
  ];
  for (const server of await getAllServers(ns)) {
    await ns.scp(files, "home", server);
  }
}
