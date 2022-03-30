//Find All Valid Math Expressions
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.

import { NS } from "Bitburner";

// You are given the following string which contains only digits between 0 and 9:

// 288074550300

// You are also given a target number of 99. Return all possible ways you can add the +(add), -(subtract), and *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)

// The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:

// ["288074550300", 99]

// NOTE: The order of evaluation expects script operator precedence NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression Examples:

// Input: digits = "123", target = 6
// Output: [1+2+3, 1*2*3]

// Input: digits = "105", target = 5
// Output: [1*0+5, 10-5]
//
// export async function main(ns: any) {
//   const testData: [string, number] = ["288074550300", 99];

//   ns.tprint(findMathExpression(testData));
// }
// TODO: Fix this as it freezes the ui.

export async function findMathExpression(ns: NS, data: [string, number]) {
  const digits = data[0].split("");
  const operators = ["+", "-", "*", ""];
  let expressions = [digits[0], "-" + digits[0]].flatMap((d) =>
    operators.map((op) => d + op)
  );
  for (let i = 1; i < digits.length - 1; i++) {
    await ns.sleep(30);
    expressions = expressions.flatMap((e) =>
      operators.map((op) => e + digits[i] + op)
    );
  }
  return expressions
    .map((e) => e + digits[digits.length - 1])
    .filter((e) => {
      try {
        return eval(e) === data[1];
      } catch (e) {
        return false;
      }
    });
}
