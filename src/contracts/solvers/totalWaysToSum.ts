// import { NS } from "Bitburner";

// export function main(ns: NS) {
//   let data = 60;
//   // data = ns.args[0] as number;
//   ns.tprint(totalWaysToSum(data));
//   ns.print(totalWaysToSum(data));
// }

// Total Ways to Sum
// You are attempting to solve a Coding Contract. You have 10 tries remaining,
// after which the contract will self-destruct.
//
// It is possible write four as a sum in exactly four different ways:

//     3 + 1
//     2 + 2
//     2 + 1 + 1
//     1 + 1 + 1 + 1
//
//  How many different ways can the given number be written as a sum of at least
//  two positive integers?
//
//  60 => 966466
export function totalWaysToSum(data: number) {
  let N = data;
  let K = data - 1;
  // Initialize a list
  let dp = Array.from({ length: N + 1 }, () => 0);

  // Update dp[0] to 1
  dp[0] = 1;

  // Iterate over the range [1, K + 1]
  for (let row = 1; row < K + 1; row++) {
    // Iterate over the range [1, N + 1]
    for (let col = 1; col < N + 1; col++) {
      // If col is greater
      // than or equal to row
      if (col >= row)
        // Update current
        // dp[col] state
        dp[col] = dp[col] + dp[col - row];
    }
  }

  // Return the total number of ways
  return dp[N];
}
