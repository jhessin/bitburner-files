// import { NS } from "Bitburner";

// export function main(ns: NS) {
//   let data = ns.args
//     .join(" ")
//     .split(" ")
//     .map((s) => parseInt(s));
//   // data = [0, 5, 3, 10, 0, 3, 10, 0, 4, 6, 6, 0, 0, 7, 0, 1, 1];
//   ns.tprint(solveJump(data));
//   ns.print(solveJump(data));
// }
//
// Array Jumping Game
//
// You are attempting to solve a Coding Contract. You have 1 tries remaining, after which the contract will self-destruct.
//
// You are given the following array of integers:
//
// 0,5,3,10,0,3,10,0,4,6,6,0,0,7,0,1,1 => 0
// 7,1,3,0,0,4,1,5,0,4,6,8,0,0,7,6,0,2,5,4,0=> 1
//
// Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
//
// Assuming you are initially positioned at the start of the array, determine whether you are able to reach the last index.
//
// Your answer should be submitted as 1 or 0, representing true and false respectively
export function solveJump(data: number[]): 0 | 1 {
  if (data.length === 0) return 1;
  const maxJump = data[0];
  if (maxJump === 0) return 0;
  if (maxJump >= data.length) return 1;
  // find the best jump and solve it.
  let bestJump = [1, 1];
  for (let i = 1; i <= maxJump; i++) {
    const nextMax = data[i];
    const jumpValue = nextMax + i + 1;
    if (jumpValue >= data.length) return 1;
    if (jumpValue > bestJump[1]) bestJump = [i, jumpValue];
  }
  return solveJump(data.slice(bestJump[0]));
}
