import { NS } from "Bitburner";

export async function main(ns: NS) {
  // the target server
  const target = ns.args[0].toString();

  // The files to copy to each server node
  const files = [
    "/basic/hacknshare.js",
    "/basic/grownshare.js",
    "/basic/hack.js",
    "/basic/backdoor.js",
  ];

  await ns.scp(files, "home", target);
}
