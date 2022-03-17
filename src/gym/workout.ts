import { NS } from "Bitburner";
import { GM } from "gameManager/earlyGM";

interface iGym {
  gym: string;
  server: string;
}

const gyms: iGym[] = [
  {
    gym: "Powerhouse Gym",
    server: "powerhouse-fitness",
  },
  {
    gym: "Iron Gym",
    server: "iron-gym",
  },
];

export async function main(ns: NS) {
  const args = ns.flags([
    ["help", false],
    ["goal", 0],
    ["stat", "str"],
    ["nodebt", false],
  ]);
  const {
    goal,
    stat,
    nodebt,
  }: { goal: number; stat: string; nodebt: boolean } = args;
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This scripts works out at the most efficient gym.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.

      Option            | Description
      ==========================
      --help              Displays this help message.

      --goal=value        Stops when your chosen stat reaches a certain value.

      --stat=value        The stat you wish to train (str|def|dex|agi).

      --nodebt            Stop working out when you run out of money.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  function statCheck(goal: number): boolean {
    if (stat.toLowerCase().startsWith("str"))
      return ns.getPlayer().strength < goal;
    if (stat.toLowerCase().startsWith("def"))
      return ns.getPlayer().defense < goal;
    if (stat.toLowerCase().startsWith("dex"))
      return ns.getPlayer().dexterity < goal;
    if (stat.toLowerCase().startsWith("agi"))
      return ns.getPlayer().agility < goal;
    return true;
  }

  const gm = new GM(ns);
  ns.disableLog("ALL");
  ns.stopAction();
  while (goal === 0 || statCheck(goal)) {
    await ns.sleep(300);
    ns.clearLog();
    if (nodebt && ns.getServerMoneyAvailable("home") <= 0) {
      ns.stopAction();
      return;
    }

    for (const g of gyms) {
      const { server, gym } = g;
      const serverData = ns.getServer(server);
      if (!serverData.backdoorInstalled) {
        // the backdoor is not installed.
        // determine if the backdoor can be installed.
        // first we nuke it.
        if (!gm.nuke(serverData.hostname)) {
          // gym is not nukable
          continue;
        }

        if (
          serverData.requiredHackingSkill > ns.getHackingLevel() ||
          !serverData.hasAdminRights
        ) {
          // if not - continue;
          continue;
        }
        // if so do it and work out in that gym.
        await gm.connect(serverData.hostname);
        await ns.installBackdoor();
        await gm.connect("home");

        // now work out here.
        if (goal > 0) {
          if (nodebt) {
            ns.print(
              `Working out at ${gym} until you run out of money or your ${stat} reaches ${goal}`
            );
          } else {
            ns.print(
              `Working out at ${gym} until your ${stat} reaches ${goal}`
            );
          }
        } else {
          ns.tail();
          ns.print(
            `Working out at ${gym} to train your ${stat} until you manually stop this script.`
          );
        }
        if (!ns.isBusy()) ns.gymWorkout(gym, stat, false);
      } else {
        // the backdoor is installed so work out at this gym.
        if (!ns.isBusy()) ns.gymWorkout(gym, stat, false);
      }
    }

    // check if we are busy.
    if (!ns.isBusy()) {
      // we couldn't find a gym we could backdoor.
      // we should workout at the last gym.
      const { gym } = gyms[gyms.length - 1];
      ns.gymWorkout(gym, stat, false);
    }
  }
}

export function autocomplete() {
  return [
    "--help",
    "--goal=",
    "--stat=str",
    "--stat=def",
    "--stat=dex",
    "--stat=agi",
    "--nodebt",
  ];
}
