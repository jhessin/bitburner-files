import { NS } from "Bitburner";

// TODO: Sort and prioritize these.
const companyPositions = [
  "business",
  "business consultant",
  "software",
  "software consultant",
  "it",
  "agent",
  "security engineer",
  "security",
  "network engineer",
  "employee",
  "part-time employee",
  "waiter",
  "part-time waiter",
];

// This interface holds everything we need to know about a company we wish to
// work for including the rep we want with them and the city they are in. Also
// the faction name if different than the companyName.
interface iCompany {
  name: string;
  factionName?: string;
  repGoal: number;
  city: string;
}

const factionCompanies: iCompany[] = [
  {
    name: "MegaCorp",
    repGoal: 200_000,
    city: "Sector-12",
  },
  {
    name: "Four Sigma",
    repGoal: 200_000,
    city: "Sector-12",
  },
  {
    name: "Blade Industries",
    repGoal: 200_000,
    city: "Sector-12",
  },
  {
    name: "ECorp",
    repGoal: 200_000,
    city: "Aevum",
  },
  {
    name: "Bachman & Associates",
    repGoal: 200_000,
    city: "Aevum",
  },
  {
    name: "Clarke Incorporated",
    repGoal: 200_000,
    city: "Aevum",
  },
  {
    name: "Fulcrum Technologies",
    factionName: "Fulcrum Secret Technologies",
    repGoal: 250_000,
    city: "Aevum",
  },
  {
    name: "KuaiGong International",
    repGoal: 200_000,
    city: "Chongqing",
  },
  {
    name: "NWO",
    repGoal: 200_000,
    city: "Volhaven",
  },
  {
    name: "OmniTek Incorporated",
    repGoal: 200_000,
    city: "Volhaven",
  },
];

export async function main(ns: NS) {
  // work for faction companies if possible/needed.
  for (const company of factionCompanies) {
    // first check if we are already invited/joined the company/faction
    if (
      ns.singularity
        .checkFactionInvitations()
        .concat(ns.getPlayer().factions)
        .includes(company.factionName || company.name)
    )
      continue;

    // Now we know we need this faction invitation - check if we are already
    // working for it.
    if (
      ns.singularity.isBusy() &&
      ns.getPlayer().workType.toLowerCase().includes("company") &&
      ns.getPlayer().companyName === company.name
    ) {
      // we are working for the company should we finish?
      if (
        ns.singularity.getCompanyRep(company.name) +
          ns.getPlayer().workRepGained * 0.5 >=
        company.repGoal
      )
        ns.singularity.stopAction();
    } else if (await workForCompany(ns, company.name))
      ns.spawn("/phase1/prepare.js");
  }

  // if we still aren't busy start a life of crime
  if (!ns.singularity.isBusy()) ns.spawn("/phase1/actions/crime.js");
  else ns.spawn("/phase1/prepare.js");
}

// Starts working for a company if possible. Returns true if successful. Cancels
// any other action.
async function workForCompany(
  ns: NS,
  company: string,
  preferedPosition: string | undefined = undefined
): Promise<boolean> {
  // first check if we are already working for that company.
  if (
    ns.singularity.isBusy() &&
    ns.getPlayer().workType.toLowerCase().includes("company") &&
    ns.getPlayer().companyName.toLowerCase().includes(company.toLowerCase())
  )
    return true;

  // apply to the company
  if (preferedPosition) {
    ns.singularity.applyToCompany(company, preferedPosition);
  } else
    for (const position of companyPositions) {
      if (ns.singularity.applyToCompany(company, position)) break;
    }

  return ns.singularity.workForCompany(company);
}
