# Hacking in Bitburner

## Phases

Scripts should be organized by when they can be run. Each bitnode we take down
involves several phases.

### Phase 1 has limited RAM and those scripts will be very small and simple.

Here we will start joining factions primarily to gain favor. Most of our money
will go toward expanding the server. Phase 2 begins once we have 1TB of RAM.

### Phase 2 has 1 TB of RAM and can do more advanced hacking and contracts.

Here is where we start batching and buying large servers to support said
batching. Once we buy our first large server we can start phase 3 where we can
batch multiple targets.

### Phase 3 has at least 1 large server.

Here is where we focus on augs that increase money earned and skill
growth. Once we have all those augs installed we can focus on growing the
server again. This will begin phase 4.

### Phase 4 max augs - max servers. (TODO)

Here we want to max out our server, both memory(2^30GB) and cores(8). Earn money any way we
can and expand the server.

We shouldn't be filtering augs here, just get everything.
We are going for the "It's time to install"
(40 augs queued at once.) achievement here.
At this point we could probably finish the node whenever we want.

## Common Scripts

- utils/\*.ts: These are not scripts but simple libraries with common functions
  that can be called by other scripts. None of them should use any serious
  memory. Each class or function should be small.

- cnct.ts/js: This script is a common script that we will use throughout to
  connect to servers. It will double as a library that finds the proper server
  for hacking, nuking, running scripts, etc.

- hacknet.ts/js: This script will automatically purchase and expand hacknet
  servers. This is an optionally script that must be manually started as it is
  not cost effective on some bitnodes.

- hack.ts: This is a script to hack a given server. Nothing fancy, but it can be
  run from any server easily.

- share.ts: This is a script to continuously share a computers resources.
