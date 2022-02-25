import { NS } from "Bitburner";
import { getAllServers } from "lib/getall.js";
import * as solvers from "contracts/solvers/index.js";

const minuteInterval = 2;

export async function main(ns: NS) {
  while (true) {
    // await dfs(ns, null, "home", trySolveContracts, 0);
    const contracts = (await getAllServers(ns)).flatMap((server) => {
      const onServer = ns.ls(server, ".cct").map((contract) => {
        const type = ns.codingcontract.getContractType(contract, server);
        const data = ns.codingcontract.getData(contract, server);
        const didSolve = solve(type, data, server, contract, ns);
        return `${server} - ${contract} - ${type} - ${didSolve || "FAILED!"}`;
      });
      return onServer;
    });
    ns.tprint(`Found ${contracts.length} contracts`);
    // contracts.forEach((contract) => ns.tprint(contract));
    for (const contract of contracts) {
      ns.tprint(contract);
    }
    await ns.sleep(minuteInterval * 60 * 1000);
  }
}

function solve(
  type: string,
  data: any,
  server: string,
  contract: string,
  ns: NS
) {
  let solution: any;
  ns.tprint(type);
  switch (type) {
    case "Algorithmic Stock Trader I":
      solution = solvers.maxProfit([1, data]);
      break;
    case "Algorithmic Stock Trader II":
      solution = solvers.maxProfit([Math.ceil(data.length / 2), data]);
      break;
    case "Algorithmic Stock Trader III":
      solution = solvers.maxProfit([2, data]);
      break;
    case "Algorithmic Stock Trader IV":
      solution = solvers.maxProfit(data);
      break;
    case "Minimum Path Sum in a Triangle":
      solution = solvers.triangleSum(data);
      break;
    case "Unique Paths in a Grid I":
      solution = solvers.uniquePathsI(data);
      break;
    case "Unique Paths in a Grid II":
      solution = solvers.uniquePathsII(data);
      break;
    case "Generate IP Addresses":
      solution = solvers.generateIps(data);
      break;
    case "Find Largest Prime Factor":
      solution = solvers.factor(data);
      break;
    case "Spiralize Matrix":
      solution = solvers.spiral(data);
      break;
    case "Merge Overlapping Intervals":
      solution = solvers.mergeOverlap(data);
      break;
    case "Subarray with Maximum Sum":
      solution = solvers.solveSum(data);
      break;
    case "Array Jumping Game":
      solution = solvers.solveJump(data);
      break;
    case "Total Ways to Sum":
      solution = solvers.totalWaysToSum(data);
      break;
    default:
      ns.tprint(`Unknown contract type: ${type}`);
      return "";
  }
  if (solution != undefined)
    ns.tprint(`Submitting solution: ${solution} to ${type} - ${contract}`);
  return solution != undefined
    ? ns.codingcontract.attempt(solution, contract, server, {
        returnReward: true,
      })
    : "";
}
