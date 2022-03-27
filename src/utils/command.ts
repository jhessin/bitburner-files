export enum CommandType {
  KillSpawner,
}

export class Command {
  cmd: CommandType;
  args: string[];
  constructor(cmd: CommandType, ...args: string[]) {
    this.cmd = cmd;
    this.args = args;
  }
}
