export async function main(ns: any) {
  const testData: [string, number] = ["123", 6];

  ns.tprint(findMathExpression(testData));
}

export function findMathExpression(data: [string, number]) {
  const digits = data[0].split("");
  const operators = ["+", "-", "*", ""];
  let expressions = [digits[0], "-" + digits[0]].flatMap((d) =>
    operators.map((op) => d + op)
  );
  for (let i = 1; i < digits.length - 1; i++) {
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
