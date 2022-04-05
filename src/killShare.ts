import { NS } from "Bitburner";
import { kill } from "utils/scriptKilling";

export async function main(ns: NS) {
  kill(ns, (ps) => ps.filename === "share.js");
}
