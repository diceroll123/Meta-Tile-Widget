var info = {
  "poke": 3,
  "width": 1,
  "height": 1,
  "path": "meta-tile.html",
  "v2": {
    "resize": true,
    "min_width": 1,
    "max_width": 3,
    "min_height": 1,
    "max_height": 3
  },
  "v3": {
    "multi_placement": true
  }
};

chrome.extension.onMessageExternal.addListener(function (request, sender, sendResponse) {
  if (request === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-poke") {
    chrome.extension.sendMessage(
    sender.id, {
      head: "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-pokeback",
      body: info,
    });
  }
});

//icon cache

function getBase64Image(image) {
  var canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(image[0], 0, 0);
  var dataURL = canvas.toDataURL();
  return dataURL;
}

function getIcons() {
  chrome.management.getAll(function(all) {
    var extensions = [];
    $.each(all, function(id, extension) {
      if ( extension.isApp === true && extension.enabled === true ) {
        extension.img = "chrome://extension-icon/" + extension.id + "/128/0";
        //extensions.push(extension);
        $($("<img>", { src: extension.img, id: extension.id })).appendTo("body").on("load", function(e) {
          var base = getBase64Image($(this));
          localStorage.setItem(extension.id, base);
        });
      }
    });
  });
}

getIcons();

chrome.management.onInstalled.addListener(getIcons);
chrome.management.onUninstalled.addListener(getIcons);
