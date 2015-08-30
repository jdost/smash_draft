var roster = function (rules) {
  var self = this;
  self.loadCharacters(rules.miis, function (fullPool) {
    self.roster = self.shuffle(fullPool).slice(0, self.calculateSize(rules));
  });
}

roster.ROSTER_ID = "roster";
roster.MIIS = ["miibrawler", "miigunner", "miiswords"];

roster.prototype.loadCharacters = function (useMiis, cb) {
  $.ajax("/data/characters.json", {
  }).done(function (chrs) {
    var characters = [];
    for (var chr in chrs) {
      if (!useMiis && roster.MIIS.indexOf(chr) !== -1)
        continue;

      var character = chrs[chr];
      character.alias = chr;
      characters.push(character);
    }
    cb(characters);
  });
};

roster.prototype.calculateSize = function (rules) {
  var roundSize = rules.teamSize * 2;
  return rules.bestOf * roundSize + rules.bans * 2 + rules.buffer;
};

roster.prototype.shuffle = function (roster) {
  var shuffled = roster.slice(0), i = roster.length, temp, index;
  while (i--) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
  }

  return shuffled;
};

roster.prototype.populate = function (callback) {
  var rosterArea = $("#" + roster.ROSTER_ID);

  for (var i=0, l=this.roster.length; i < l; i++) {
    var character = this.roster[i];

    var tileHTML = "<div class='" + character.alias + "_icon'>" +
      "<img src='/s/img/portrait/" + character.portrait + "'>" +
      "</div>";

    character.tile = $(tileHTML);
    (function (chr) {
      chr.tile.click(function (event) { callback(chr); });
    }(character));

    rosterArea.append(character.tile);
  }
};
