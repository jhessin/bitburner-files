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
  return `${
    dateCompleted.getMonth() + 1
  }-${dateCompleted.getDate()} ${ns.nFormat(
    dateCompleted.getHours() % 13,
    "00"
  )}:${ns.nFormat(dateCompleted.getMinutes(), "00")}:${ns.nFormat(
    dateCompleted.getSeconds(),
    "00"
  )} ${dateCompleted.getHours() < 12 ? "AM" : "PM"}`;
}
