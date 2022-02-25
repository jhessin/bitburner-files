export function sanitizeParentheses(data: string) {
  var solution = Sanitize(data);
  if (solution == null) {
    return '[""]';
  } else {
    return "[" + solution.join(",") + "]";
  }
}

function Sanitize_removeOneParth(item: string) {
  var possibleAnswers: string[] = [];
  for (let i = 0; i < item.length; i++) {
    if (
      item[i].toLowerCase().indexOf("(") === -1 &&
      item[i].toLowerCase().indexOf(")") === -1
    ) {
      continue;
    }
    let possible = item.substring(0, i) + item.substring(i + 1);
    possibleAnswers.push(possible);
  }
  return possibleAnswers;
}

function Sanitize_isValid(item: string) {
  var unclosed = 0;
  for (var i = 0; i < item.length; i++) {
    if (item[i] == "(") {
      unclosed++;
    } else if (item[i] == ")") {
      unclosed--;
    }
    if (unclosed < 0) {
      return false;
    }
  }
  return unclosed == 0;
}

function Sanitize(data: string) {
  var currentPossible: string[] = [data];
  for (var i = 0; i < currentPossible.length; i++) {
    var newPossible: Set<string> | string[] = new Set();
    for (var j = 0; j < currentPossible.length; j++) {
      let newRemovedPossible = Sanitize_removeOneParth(currentPossible[j]);

      for (let item of newRemovedPossible) {
        newPossible.add(item);
      }
    }

    var validBoolList: boolean[] = [];

    for (const item of newPossible) {
      validBoolList.push(Sanitize_isValid(item));
    }
    if (validBoolList.includes(true)) {
      let finalList: string[] | Set<string> = [];
      newPossible = [...newPossible];

      for (var j = 0; j < validBoolList.length; j++) {
        if (validBoolList[j]) {
          finalList.push(newPossible[j]);
        }
      }

      finalList = new Set(finalList);

      return [...finalList];
    }
    currentPossible = [...newPossible];
  }

  return null;
}
