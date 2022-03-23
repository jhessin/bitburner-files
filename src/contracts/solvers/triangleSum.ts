// import { NS } from "Bitburner";

// export function main(ns: NS) {
//   const data = [
//     [9],
//     [3, 3],
//     [1, 5, 1],
//     [6, 9, 4, 1],
//     [8, 9, 1, 4, 3],
//     [6, 2, 5, 5, 8, 2],
//     [6, 3, 6, 2, 7, 5, 1],
//     [9, 8, 2, 4, 5, 2, 3, 7],
//   ];
//   ns.tprint(triangleSum(data));
//   ns.print(triangleSum(data));
// }

//
//Minimum Path Sum in a Triangle
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.

// Given a triangle, find the minimum path sum from top to bottom. In each step of the path, you may only move to adjacent numbers in the row below. The triangle is represented as a 2D array of numbers:

// [
//          [9],
//         [3,3],
//        [1,5,1],
//       [6,9,4,1],
//      [8,9,1,4,3],
//     [6,2,5,5,8,2],
//    [6,3,6,2,7,5,1],
//   [9,8,2,4,5,2,3,7]
// ] => 23

// Example: If you are given the following triangle:

// [
//      [2],
//     [3,4],
//    [6,5,7],
//   [4,1,8,3]
// ]

// The minimum path sum is 11 (2 -> 3 -> 5 -> 1).
//
//
export function triangleSum(arrayData: number[][]) {
  let triangle = arrayData;
  let nextArray: number[] = [];
  let previousArray = triangle[0];

  for (let i = 1; i < triangle.length; i++) {
    nextArray = [];
    for (let j = 0; j < triangle[i].length; j++) {
      if (j == 0) {
        nextArray.push(previousArray[j] + triangle[i][j]);
      } else if (j == triangle[i].length - 1) {
        nextArray.push(previousArray[j - 1] + triangle[i][j]);
      } else {
        nextArray.push(
          Math.min(previousArray[j], previousArray[j - 1]) + triangle[i][j]
        );
      }
    }

    previousArray = nextArray;
  }

  return Math.min.apply(null, nextArray);
}
