This phase is where we can start batching. We have 1TB of ram and can really
start hacking things up. The folder contains all scripts that are specific to
this phase of the game.

# Goals

Your first goal should be to restart all your hacking using batching.

# Needed Scripts

- backdoor.js: This is a deamon that connects and installs the backdoor on
  servers that need it. It will also nuke any servers that need it as well. We
  can just backdoor everything as we unlock it. If we have Source File 4 this
  can backdoor servers automatically. Otherwise it should display a list of
  servers that can have the backdoor installed.

  - notes:
    `ns.getServer(hostname).backdoorInstalled` - returns if a backdoor is
    installed.

- batchHack.js: This is your bread and butter batching script. It will calculate
  the richest server that can be effectively hacked with the memory you have
  available. Copy 'batch.js' to the source server and start a batch based
  attack on the target server.

- cnct.js: This is a shortcut to connect to any server. Should automatically run
  (currently doesn't for some reason)

- expandServer.js: This is a deamon that runs and expands your server memory
  whenever possible. Should it expand cores as well? It is the key to moving
  into phase3. Requires Source File 4 to work.

- programs.js: This is a deamon that will check if we can create a new hacking
  program. It should not create the program itself, but should call a script in
  the `actions/` directory if we have Source File 4, otherwise it will prompt
  the player to manually create the program.

- shareAll.js: This shares all available servers. It kills any hacking that the
  servers are doing.

- test.js: This is a single run script that tests all the other scripts to
  ensure they can run on 1TB of RAM.

- actions/: This is a directory with scripts that perform actions until given
  a cuttoff event. Sometimes this will be an amount of money, or XP. These
  scripts should all run `ns.tail()` to allow early termination. These will all
  require Source File 4.

- actions/programming.js: This is a script that creates the given program. It
  should automatically stop any action and start programming.

  - notes:
    `ns.getPlayer().workType.includes('Create a Program')` means that the player
    is programming.

- actions/crime.js: This is a script that commits crimes until a target is
  reached. Either an amount of money or a certain level.
