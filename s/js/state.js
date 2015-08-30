var STATES = {
  setup: 0,
  ban: 1,
  draft: 2,
  game: 3,
  game_over: 4,
};

var state = function (rules) {
  var current = STATES.setup;
  var pick = 0;
  var results = [];
  var offset;

  var HOOKS = [
    [], [], [], [], [],
  ];

  var popOffset = function () {
    offset = Math.floor(Math.random() * 100) % 2;
  };

  var nextState = function (result) {
    switch (current) {
      case STATES.game_over: return current;
      case STATES.game:
        pick = 0;
        results.push(result);
        var needed = Math.ceil(rules.bestOf/2),
          rec = record();

        if (rec[0] >= needed || rec[1] >= needed)
          current = STATES.game_over;
        else
          current = STATES.draft;
        break;
      case STATES.ban:
        if (++pick < rules.bans)
          break;

        pick = 0;
        current = STATES.draft;
        popOffset();
        break;
      case STATES.draft:
        if (++pick < (2 * rules.teamSize))
          break;

        pick = 0;
        current = STATES.game;
        break;
      case STATES.setup:
        current = rules.bans ? STATES.ban : STATES.draft;
        popOffset();
    };

    callbacks(current);
    return current;
  };

  var callbacks = function (state) {
    for (var i=0, l=HOOKS[state].length; i < l; i++) {
      HOOKS[state][i]();
    }
  };

  var nextPick = function () {
    if (current !== STATES.ban && current !== STATES.draft)
      return -1;

    if (results.length === 0)
      return (pick + offset) % 2;

    var previousWinner = results.slice(-1)[0].winner;
    return pick >= 2 ? previousWinner : 1 - previousWinner;
  };

  var record = function () {
    var a = 0, b = 0;
    results.forEach(function (game) {
      if (game.winner === 0) { a++; }
      else { b++; }
    });

    return [a, b];
  };

  return {
    transition: nextState,
    pick: nextPick,
    current: function () { return current; },
    record: record,
    setHook: function (state, cb) { HOOKS[state].push(cb); },
    game: function () { return results.length + 1; },
    isBan: function () { return current === STATES.ban; },
  };
};
