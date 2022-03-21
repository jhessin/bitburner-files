export function solveSum(data: number[]) {
  const arrLength = data.length;
  let maxSum = -Infinity;

  for (let i = 0; i < arrLength; i++) {
    const sub = data.slice(0, i + 1);
    for (let j = 0; j < sub.length; j++) {
      const sub2 = sub.slice(j, sub.length);
      // ns.tprint(`i ${i} j ${j} ${JSON.stringify(sub)} ${JSON.stringify(sub2)}`);
      const sum = sub2.reduce((prev: number, cur: number) => (prev += cur), 0);

      if (sum > maxSum) maxSum = sum;

      // ns.tprint(`${sum}: ${sub2}`);
    }
  }

  return maxSum;
}
