# Smash Draft

This is a client-side web app to help manage a random "draft" for a series of Smash 
4 games.  The idea is that a randomized pool of the available characters is 
generated and players take turns picking their fighter and playing.  The app is 
meant to remove the logistics of this and just let people play.

## Setup

This can be served with a regular web server (like nginx).  Everything is included,
you can add your own ruleset to customize the drafting system.

## Rulesets

Included is a default ruleset under the `data/rules/` directory.  You can modify
this one or add in another and specify the new ruleset in the query string of
the URL.

Options:

* `teamSize` - Number of players per side
* `bestOf` - Maximum number of matches per set
* `miis` - Flag whether the mii fighters should be included in the pool
* `bans` - Number of bans per team, bans happen before the first game's picks
* `buffer` - Extra fighters to add to roster, to add some choice for the final game

### Notes

The images included were taken from the [ssbwiki](http://www.ssbwiki.com/).  I claim
no copyright on them.
