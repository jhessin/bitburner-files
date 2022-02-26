export async function main(ns: any) {
  const testData: [string, number] = ["123", 6];

  ns.tprint(findMathExpression(testData));
}

export function findMathExpression(data: [string, number]) {
  // Javascript program to find all possible expression which
  // evaluate to target

  // Utility recursive method to generate all possible
  // expressions
  function getExprUtil(
    res: string[],
    curExp: string,
    input: string,
    target: number,
    pos: number,
    curVal: number,
    last: number
  ) {
    // true if whole input is processed with some
    // operators
    // if current value is equal to target
    //then only add to final solution
    // if question is : all possible o/p then just
    //push_back without condition
    if (curVal == target) res.push(curExp);

    // loop to put operator at all positions
    for (let i = pos; i < input.length; i++) {
      // ignoring case which start with 0 as they
      // are useless for evaluation
      if (i != pos && input[pos] == "0") break;

      // take part of input from pos to i
      let part = input.substring(pos, i + 1 - pos);

      // take numeric value of part
      let cur = parseInt(part, 10);

      // if pos is 0 then just send numeric value
      // for next recursion
      if (pos == 0)
        getExprUtil(res, curExp + part, input, target, i + 1, cur, cur);
      // try all given binary operator for evaluation
      else {
        getExprUtil(
          res,
          curExp + "+" + part,
          input,
          target,
          i + 1,
          curVal + cur,
          cur
        );
        getExprUtil(
          res,
          curExp + "-" + part,
          input,
          target,
          i + 1,
          curVal - cur,
          -cur
        );
        getExprUtil(
          res,
          curExp + "*" + part,
          input,
          target,
          i + 1,
          curVal - last + last * cur,
          last * cur
        );
      }
    }
  }

  // Below method returns all possible expression
  // evaluating to target
  function getExprs(input: string, target: number) {
    let res = [];
    getExprUtil(res, "", input, target, 0, 0, 0);
    return res;
  }

  // let input = "123";
  // let target = 6;
  // let res = getExprs(input, target);

  // input = "125";
  // target = 7;
  // res = getExprs(input, target);

  // This code is contributed by decode2207.
  let resultArr = getExprs(data[0], data[1]);
  let result: string = "[";
  for (const c of resultArr) {
    result += c + ",";
  }
  result += "]";
  return getExprs(data[0], data[1]);
}
