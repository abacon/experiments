macros.addPassage = {
  addPassage: function(title, tags, content) {
    var newPassage = document.createElement("div");
    newPassage.id = title;
    newPassage.setAttribute("tiddler",title);
    newPassage.setAttribute("tags",tags);
    newPassage.setAttribute("modifer","twee");
    newPassage.innerHTML = content;
    $("storeArea").appendChild(newPassage);

    console.log("adding a passage", title, tags, content, $(title));
    tale.passages[title] = new Passage(title, $(title), tale.passages.length + 1, null, null);
  },
  handler: function(place, macroName, params, parser) {
    var title   = params[0],
        tags    = params[1],
        content = params[2];

    if (!tale.passages[title])
      this.addPassage(title, tags, content);
  }
};
