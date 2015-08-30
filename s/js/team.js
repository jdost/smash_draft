function team (color, players, container) {
  container.addClass(team.COLORS[color].normal.join(' '));
  var picks = [];
  var active = -1;

  if (GAME.rules.bans) {
    container.append("<h4>Bans</h4>");
    for (var i=0; i < GAME.rules.bans; i++) {
      var ban = team.generateBan(color);
      container.append(ban);
      picks.push(ban);
    }
    container.append("<div class=\"clearBans\"></div>");
  }

  for (var i=0; i < GAME.rules.bestOf; i++) {
    for (var j=0, l=players.length; j < l; j++) {
      var pick = team.generateLI(players[j], color);
      container.append(pick);
      picks.push(pick);
    }
  }

  return {
    pick: function (character) {
      picks[active].picked(character);
    },
    active: function () {
      picks[++active].current();
    },
    color: color,
    styles: team.COLORS[color].normal.join(' '),
    players: players
  };
};

team.COLORS = {
  "red": {
    "normal": ["red", "lighten-2"],
    "active": ["white", "red-text", "text-darken-3"]
  },
  "blue": {
    "normal": ["blue", "lighten-3"],
    "active": ["white", "blue-text"]
  },
  "green": {
    "normal": ["green", "lighten-3"],
    "active": ["white", "green-text", "text-darken-1"]
  },
  "yellow": {
    "normal": ["yellow", "lighten-2"],
    "active": ["white", "yellow-text", "text-darken-2"]
  }
};

team.generateLI = function (name, color) {
  var li = $("<li class=\"collection-item unset\">" +
    "<i></i>" + name +
    "</li>");

  var icon = li.find("i");

  li.current = function () {
    li.removeClass("unset")
      .addClass("current")
      .addClass(team.COLORS[color].active.join(' '));
  };
  li.picked = function (character) {
    li.removeClass("current")
      .removeClass(team.COLORS[color].active.join(' '))
      .addClass(character.alias + "_head");
  };

  return li;
};

team.generateBan = function (color) {
  var img = $("<img class=\"ban\">");

  img.current = function () {
    img.addClass(team.COLORS[color].normal.join(' '))
      .addClass("current");
  };

  img.picked = function (character) {
    img.removeClass("current")
      .removeClass(team.COLORS[color].normal.join(' '))
      .attr("src", "./s/img/icons/" + character.portrait);
  };

  return img;
};
