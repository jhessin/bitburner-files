export const keys = {
  serverNodes: "ServerNodes",
};

// localStorage Functions
export function setItem(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem(key: string): any {
  JSON.parse(localStorage.getItem(key) || JSON.stringify(undefined));
}
