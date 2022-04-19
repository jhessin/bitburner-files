import { NS } from "Bitburner";

export async function main(ns: NS) {
  let contracts = ns.ls(ns.getHostname(), ".cct");
  ns.tprint(`There are ${contracts.length} contracts on this server:`);
  for (const cct of contracts) {
    ns.tprint(displayContract(ns, cct));
  }
}

export function displayContract(
  ns: NS,
  cct: string,
  host: string = ns.getHostname()
) {
  return `
  ================
  ${cct} @ ${host}:
      remaining   : ${ns.codingcontract.getNumTriesRemaining(
        cct,
        host
      )} attempts
      type        : ${ns.codingcontract.getContractType(cct, host)}
      data        : ${JSON.stringify(ns.codingcontract.getData(cct, host))}
      description : ${ns.codingcontract.getDescription(cct, host)}
  ================
      `;
}
