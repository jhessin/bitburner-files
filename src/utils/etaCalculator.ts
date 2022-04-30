import { NS } from "Bitburner";

export function etaCalculator(ns: NS, milliseconds: number) {
  const today = new Date();
  const timeCompleted = today.setUTCMilliseconds(
    today.getUTCMilliseconds() + milliseconds
  );
  const dateCompleted = new Date(timeCompleted);
  // return `${dateCompleted.getMonth() + 1}-${dateCompleted.getDate()} ${
  //   dateCompleted.getHours() % 12
  // }:${dateCompleted.getMinutes()}:${dateCompleted.getSeconds()} ${
  //   dateCompleted.getHours() < 12 ? "AM" : "PM"
  // }`;
  const month = dateCompleted.getMonth() + 1;
  const date = dateCompleted.getDate();
  const hours = dateCompleted.getHours() % 12 || 1;
  const minutes = dateCompleted.getMinutes();
  const seconds = dateCompleted.getSeconds();
  return `${month}-${date} ${ns.nFormat(hours, "00")}:${ns.nFormat(
    minutes,
    "00"
  )}:${ns.nFormat(seconds, "00")} ${
    dateCompleted.getHours() < 12 ? "AM" : "PM"
  }`;
}
