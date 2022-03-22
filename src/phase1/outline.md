This phase is immediately after entering a node. You have 32GB of RAM and a
single core. The folder contains all scripts that are specific to this phase of
the game.

# Goals

Your first goal should be to expand your RAM to 1TB. This gives you enough
room to work without running out of memory. An intermediate goal is purchasing
augmentations that will increase money earned.

# Needed Scripts

- test.js: This is a single run script that tests all the other scripts to
  ensure they can run on 32GB of RAM.

- ../cnct.js: This is a shortcut to connect to any server. It should also serve as
  a library to be able to find the right server for running scripts or hacking.
  TODO: find a workaround so it doesn't need Source File 4. This is a special
  file as it will be used in all phases, but should be tested by phase1.

- ../backdoor.js: This is a deamon that connects and installs the backdoor on
  servers that need it. It will also nuke any servers that need it as well. We
  can just backdoor everything as we unlock it. If we have Source File 4 this
  can backdoor servers automatically. Otherwise it should display a list of
  servers that can have the backdoor installed.

  - notes:
    `ns.getServer(hostname).backdoorInstalled` - returns if a backdoor is
    installed.

- programs.js: This is a deamon that will check if we can create a new hacking
  program. It should not create the program itself, but should call a script in
  the `actions/` directory if we have Source File 4, otherwise it will prompt
  the player to manually create the program.

- expandServer.js: This is a deamon that runs and expands your server memory
  whenever possible. Should it expand cores as well? It is the key to moving
  into phase2. If you do not have Source File 4 it should prompt the user to
  upgrade the RAM.

- basicHack.js: This is a basic hacking script to gain hacking XP and cash to
  start with. Nothing fancy - just hack, weaken, grow, weaken after preping the
  server.

- actions/: This is a directory with scripts that perform actions until given
  a cuttoff event. Sometimes this will be an amount of money, or XP. These
  scripts should all run `ns.tail()` to allow early termination. These will all
  require Source File 4.

- actions/programming.js: This is a script that creates the given program. It
  should automatically stop any action and start programming.

  - notes:
    `ns.getPlayer().workType.includes('Create a Program')` means that the player
    is programming.
