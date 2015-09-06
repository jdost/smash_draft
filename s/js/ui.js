function updateTicker() {
  var ticker = $("footer div");
  $("footer button").hide();
  switch (GAME.state.current()) {
    case STATES.setup:
      ticker.html("Setup");
      break;
    case STATES.ban:
      ticker.html("Ban: " + GAME.teams[GAME.state.pick()].color);
      break;
    case STATES.draft:
      var currentPick = $("li.current").text();
      ticker.html("Draft: " + currentPick + "'s pick");
      $("footer button").show();
      break;
    case STATES.game:
      ticker.html("In Play: Game " + GAME.state.game());
      break;
    case STATES.game_over:
      var results = GAME.state.record();
      if (results[0] > results[1]) {
        ticker.html("Game Over: " + GAME.teams[0].color + " wins");
      } else {
        ticker.html("Game Over: " + GAME.teams[1].color + " wins");
      }
      break;
  };

  $("footer span").text(GAME.state.record().join("-"));
};

function setupForm(rules) {
  var form = $("#forms");

  if (rules.teamSize > 2) {
    var yellowOption = "<option value=\"yellow\">Yellow</option>";
    $("#a_color").appendChild(yellowOption);
    $("#b_color").appendChild(yellowOption);
  }

  if (rules.hidePicks) {
    form.find("#hidePicks").attr("checked", "checked");
  }

  for (var i=rules.teamSize; i < 4; i++) {
    for (var team = 0; team < 2; team++) {
      var input = ["a", "b"][team] + "_" + i;
      form.find("[name=" + input + "]").parent().remove();
    }
  }

  $("select").material_select();

  form.submit(function (event) {
    form.closeModal();
    GAME.roster.populate(draft);
    setupTeams($(this).serializeArray());
    GAME.state.transition();
    event.preventDefault();
  }).openModal();
};

function setupTeams(values_) {
  var values = {};
  values_.forEach(function (input) {
    values[input.name] = input.value;
  });

  ["a", "b"].forEach(function (team_name) {
    var color = $("select#" + team_name + "_color").val();
    var players = [];

    for (var i=0; i < GAME.rules.teamSize; i++) {
      players.push(values[team_name + "_" + i]);
    }

    GAME.teams.push(team(color, players, $("#" + team_name + "_team")));
  });

  if ($("#hidePicks:checked").length) {
    $(document.body).addClass("hide-picks");
  }

  GAME.state.setHook(STATES.ban, function () {
    GAME.teams[GAME.state.pick()].active();
  });
  GAME.state.setHook(STATES.draft, function () {
    GAME.teams[GAME.state.pick()].active();
  });

  GAME.state.setHook(STATES.game, updateTicker);
  GAME.state.setHook(STATES.ban, updateTicker);
  GAME.state.setHook(STATES.draft, updateTicker);
  GAME.state.setHook(STATES.game_over, updateTicker);
  $("footer button").click(function () { GAME.teams[GAME.state.pick()].swap(); });
};

function draft(character) {
  if (character.tile.hasClass("drafted"))
    return;

  character.tile.addClass("drafted");
  GAME.teams[GAME.state.pick()].pick(character);
  if (GAME.state.current() === STATES.draft)
    GAME.current.push({team: GAME.state.pick(), character: character});

  GAME.state.transition();
};

function gameOverlay() {
  var overlay = $("<div id=\"overlay\" class=\"row\">" +
      "<div id=\"a_players\" class=\"col offset-s1 s5 right-align\">" +
      "<button class=\"btn\">Wins</button>" +
      "</div>" +
      "<div id=\"b_players\" class=\"col s5 left-align\">" +
      "<button class=\"btn\">Wins</button>" +
      "</div>" +
    "</div>");

  GAME.current.forEach(function (pick) {
    var display = $("<img src='./s/img/portrait/" + pick.character.portrait + "'>")
      .addClass(GAME.teams[pick.team].styles);
    overlay.find(["#a_players", "#b_players"][pick.team]).prepend(display);
  });

  overlay.find("#a_players button")
    .click(function (event) {
      GAME.current = [];
      overlay.remove();
      GAME.state.transition({
        winner: 0,
      });
    });

  overlay.find("#b_players button")
    .click(function (event) {
      GAME.current = [];
      overlay.remove();
      GAME.state.transition({
        winner: 1,
      });
    });

  $("body").append(overlay);
};

function showAbout() {
  if ($("div.about").length) {
    $("div.about").openModal();
    return;
  }

  var display = function (message) {
    var aboutDiv = $("<div class='about row modal container'></div>");
    aboutDiv.html(message);
    $("main").append(aboutDiv);
    aboutDiv.openModal();
  };

  if (GAME.rules.customHelp) {
    var ruleset = location.search.replace("?", "") || "default";
    $.ajax("/data/about/" + ruleset, {
    }).done(function (response) {
      display(response);
    });
  } else {
    var msg = "<p>This is a tool for selecting characters from a randomized pool " +
      "from the whole character roster, ";
    msg += GAME.rules.miis ? "including" : "excluding" + " the mii fighters.  " +
      "Each character selected removes that from the pool, so if the set goes " +
      "the distance, the final character selected will be ";
    if (GAME.rules.buffer > 0) {
      msg += "from the final " + (GAME.rules.buffer+1) + " characters left.  ";
    } else {
      msg += "the last character left.  ";
    }
    if (GAME.rules.bans > 0) {
      msg += "Each team gets " + GAME.rules.bans + " bans to remove characters " +
        "the pool of choices.  ";
    }
    msg += "Teams then alternate picks for who they will play in the first game." +
      "  Players may 'swap' picks within their team with the swap button in the " +
      "bottom right.  After selecting the winning team of the match, the losing " +
      "team then gets to select all of their characters and then the other team." +
      "</p>";

      display(msg);
  }
};
