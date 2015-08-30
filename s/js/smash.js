(function () {
  var TEAMS = [];
  var state = (function (rules) {
    var STATES = {
      game_over: 0,
      ban: 1,
      game: 2,
      draft: 3,
    };

    var current = rules.bans ? STATES.ban : STATES.draft;
    var pick = 0, game = 0, results = [];

    var next_state = function () {
      if (current === STATES.game_over)
        return current

      if (current === STATES.game) {
        current = ++game >= rules.out_of ? STATES.game_over : STATES.draft;
      } else if (++pick >= (rules.team_size * 2)) {
        pick = 0;
        current = current === STATES.ban ? STATES.draft : STATES.game;
      }

      return current;
    };

    var next_pick = function () {
      if (game === 0)
        return pick % 2;

      var previousWinner = results.slice(-1).winner;
      return pick >= rules.team_size ? previousWinner : 1 - previousWinner;
    };

    return {
      states: STATES,
      next: next_state,
      currentPick: next_pick,
      currentState: current,
      isBan: function () { return current === STATES.ban; },
    };
  }(rules));

  function draft(character) {
    if (character.tile.hasClass("banned") || character.tile.hasClass("drafted"))
      return;

    character.tile.addClass(state.isBan() ? "banned" : "drafted");

    var s = state.next();

    updateTeams(character);
    if (s === state.states.game) {
      startGame();
    }
  };

  function updateTeams(pick) {
    if (pick) {
      $(".currentPick")
        .removeClass("currentPick")
        .addClass("picked", pick.characterName + "_head");
    }

    $("#" + ["a", "b"][state.currentPick()] + "_team")
      .find(":not(.picked):first")
      .addClass("currentPick");
  };

  function startGame() {
    console.log("PLAY BALL");
  }

  function buildTeams(values_) {
    var values = {};
    values_.forEach(function (input) {
      values[input.name] = input.value;
    });

    ["a", "b"].forEach(function (team_name) {
      var team = {
        "color": $("select#" + team_name + "_color").val(),
        "players": []
      };
      for (var i=0, l=rules.team_size; i < l; i++) {
        team.players.push(values[team_name + "_" + i]);
      }

      TEAMS.push(team);
      populateTeam(team_name, team);
      updateTeams();
    });

    populateRoster();
  };

  function populateTeam(name, team) {
    var column = $("#" + name + "_team");

    column.addClass(team.color);

    if (rules.bans) {
      for (var i=0, l=team.players.length; i < l; i++) {
        column.append("<li class='collection-item unset'>ban</li>");
      }
    }

    for (var i=0, l=rules.out_of; i < l; i++) {
      for (var j=0, m=team.players.length; j < m; j++) {
        var player = team.players[j];
        column.append("<li class='collection-item unset'><i class='unset-icon'></i>" + player + "</li>");
      }
    }
  };

  var rosterArea;
  function populateRoster() {
    rosterArea = $("#roster");
    for (var characterName in roster) {
      if (!roster.hasOwnProperty(characterName)) { continue; }

      var character = roster[characterName];
      character.tile = $("<div class='" + characterName + "_icon'><img src='/s/img/portrait/" + character.portrait + "'></div>");
      (function (chr) {
        chr.tile.click(function (event) { draft(chr); });
      })(character);

      rosterArea.append(character.tile);
    }
  }

  var STATES = {
    "setup": "Setup",
    "bans": "Bans",
    "draft": "Draft",
    "game": "Playing...",
  };
  var footer;
  function updateState(newState) {
    footer.text(STATES[newState]);
  }

  $(document).ready(function () {
    $("select").material_select();
    footer = $("footer div");

    $("#forms")
      .submit(function (event) {
        $("#forms").closeModal();
        buildTeams($(this).serializeArray());
        event.preventDefault();
      })
      .openModal();

    updateState("setup");
  });
})();
