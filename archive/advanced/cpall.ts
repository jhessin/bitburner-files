import { NS } from "Bitburner";
import { getAllServers } from "lib/getall";

export async function main(ns: NS) {
  // The files to copy to each server node
  const files = [
    "/basic/hack.js",
    "/basic/grow.js",
    "/basic/weaken.js",
    "/basic/share.js",
  ];
  for (const host of await getAllServers(ns)) await ns.scp(files, "home", host);
}
