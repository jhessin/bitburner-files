// Array jumping game solver
export function solveJump(data: number[]): 0 | 1 {
  // ns.tprint(JSON.stringify(data))
  for (let i = data[0] - 1; i > -1; i--) {
    if (i + 1 >= data.length) return 1;

    return solveJump(data.slice(i + 1));
  }

  return 0;
}
