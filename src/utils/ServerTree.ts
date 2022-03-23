import { NS, Server } from "Bitburner";
import { getItem, setItem, keys } from "utils/localStorage.js";

export class ServerNode {
  name: string;
  ns: NS;
  parent?: string;
  children: ServerNode[] = [];
  data: Server;

  // Constructs a server node and traverses the tree to create children nodes as
  // well.
  constructor(ns: NS, name: string = "home", parent?: string) {
    this.ns = ns;
    this.name = name;
    this.parent = parent;
    this.data = ns.getServer(name);

    const children = ns.scan(name);
    if (parent && children.includes(parent)) {
      const index = children.indexOf(parent);
      delete children[index];
    }
    this.children = children.map(
      (child: string) => new ServerNode(ns, child, name)
    );
  }

  // This finds a node with a given name and returns the path to it as an array
  // of strings.
  find(name: string, path: string[] = []): string[] {
    // check if we are found.
    if (this.name === name) {
      path.push(this.name);
      return path;
    }

    // shallow search first
    if (this.children.map((c) => c.name).includes(name)) {
      path.push(this.name);
      path.push(name);
      return path;
    }

    // now we go deeper
    for (const child of this.children) {
      if (!child) continue;
      let branch = child.find(name, path);
      if (branch.length > 0) {
        // we have found our server.
        return branch;
      }
    }

    // if nothing is found we return an empty list.
    return [];
  }

  // This simply returns an array of all the servers.
  list(): Server[] {
    let result: Server[] = [this.data];

    // go through each child and add it and all it's children.
    for (const child of this.children) {
      if (!child) continue;
      if (!result.map((v) => v.hostname).includes(child.name))
        result.push(child.data);
      if (child.children.length > 0) {
        result = [...result, ...child.list()];
      } else result.push(child.data);
    }

    // uniquify the results.
    return [...new Set(result)];
  }

  filter(
    predicate: (value: Server, index: number, array: Server[]) => boolean
  ): Server[] {
    return this.list().filter(predicate);
  }
}

export class ServerTree {
  // The base of the server tree.
  home: ServerNode;

  // Initializes the server tree and saves it to local storage.
  constructor(ns: NS) {
    this.home = new ServerNode(ns);
    setItem(keys.serverNodes, this.home);
  }
}
