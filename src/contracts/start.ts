import { NS, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";
import * as solvers from "contracts/solvers/index.js";

const minuteInterval = 2;

function getAllServers(ns: NS): Server[] {
  const tree = new ServerTree(ns);
  return tree.home.list();
}

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script will automatically complete contracts that it finds on the network.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.

      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }
  let failedContracts: {
    contract: string;
    server: string;
    type: string;
  }[] = [];
  let successfulContracts: {
    contract: string;
    server: string;
    type: string;
    reward: string | true;
  }[] = [];
  function refreshLog() {
    ns.clearLog();
    for (const cnt of failedContracts) {
      ns.print(`
      =========================
        server: ${cnt.server}
        filename: ${cnt.contract}
        type: ${cnt.type}
      =========================
        `);
    }
    for (const cnt of successfulContracts) {
      ns.print(`
      =========================
        server: ${cnt.server}
        filename: ${cnt.contract}
        type: ${cnt.type}
        reward: 
          ${cnt.reward}
      =========================
        `);
    }
    ns.print(`Contracts failed: ${failedContracts.length}`);
    ns.print(`Contracts Succeeded: ${successfulContracts.length}`);
  }
  while (true) {
    // await dfs(ns, null, "home", trySolveContracts, 0);
    const contracts = getAllServers(ns).flatMap((server) => {
      const onServer = ns.ls(server.hostname, ".cct").map((contract) => {
        const type = ns.codingcontract.getContractType(
          contract,
          server.hostname
        );
        const data = ns.codingcontract.getData(contract, server.hostname);
        return {
          type,
          data,
          server,
          contract,
        };
      });
      return onServer;
    });
    for (const { type, data, server, contract } of contracts) {
      const reward = await solve(type, data, server.hostname, contract, ns);
      if (!reward) {
        failedContracts.push({
          server: server.hostname,
          contract,
          type,
        });
        refreshLog();
      } else {
        successfulContracts.push({
          server: server.hostname,
          contract,
          type,
          reward,
        });
        refreshLog();
      }
    }
    await ns.sleep(1);
  }
}

async function solve(
  type: string,
  data: any,
  server: string,
  contract: string,
  ns: NS
) {
  let solution: any;
  ns.print(type);
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
    // case "Total Ways to Sum II":
    //   solution = solvers.totalWaysToSum2(data);
    //   break;
    case "Sanitize Parentheses in Expression":
      solution = solvers.sanitizeParentheses(data);
      break;
    case "Find All Valid Math Expressions":
      solution = await solvers.findMathExpression(ns, data);
      break;
    default:
      ns.print(`Unknown contract type: ${type}`);
      return "";
  }
  if (solution != undefined)
    ns.print(`Submitting solution: ${solution} to ${type} - ${contract}`);
  return solution != undefined
    ? ns.codingcontract.attempt(solution, contract, server, {
        returnReward: true,
      })
    : "";
}
