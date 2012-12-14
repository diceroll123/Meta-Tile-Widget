function new_guid() {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function get_guid() {
  try {
    if ( window.location.hash ) {
      return JSON.parse( decodeURIComponent(window.location.hash).substring(1) ).id;
    } else {
      return "default";
    }
  } catch(e) {
    return "default";
  }
}

function MetaTileCtrl($scope) {
  $scope.tiles = [];
  var tiles_copy = [];
  $scope.update = function() {
    chrome.storage.sync.get(get_guid(), function(data) {
      if (data[get_guid()] === undefined) { // where presets are set
        data[get_guid()] = {};
        data[get_guid()].options = {};
        data[get_guid()].options.open_using = "normal";
        data[get_guid()].tiles = presets;
        chrome.storage.sync.set(data);
      }
      $scope.tiles = data[get_guid()].tiles;
      var tag = "meta-antp-20";
      $.each($scope.tiles, function(k, v) {
        if(v.url == "http://www.amazon.com/") {
          v.url += "?tag=" + tag;
          if(v.search == "http://www.amazon.com/?field-keywords=%s") {
            v.search += "&tag=" + tag;
          }
        }
        v.dataimage = v.image;
        if(v.image.substring(0, 1) == "{") {
          v.image = localStorage.getItem(v.image.substring(1, 33));
        }
        tiles_copy.push(v);
      });
      $scope.tiles = tiles_copy;

      switch($scope.tiles.length) { // makes the tiles the only thing in the object, removes grid size
        case 9:
          $scope.grid = "one-nine";
          break;
        case 4:
          $scope.grid = "one-four";
          break;
        case 2:
          if(data[get_guid()].options.vertical) {
            $scope.grid = "one-two-vertical";
          } else {
            $scope.grid = "one-two";
          }
          break;
        default:
          $scope.grid = "one-four";
      }
      $("link").attr("href", "/css/" + $scope.grid + ".css");
      if(data[get_guid()].options && data[get_guid()].options.disable_search != true) {
        $("#tilejs").attr("src", "/js/css/" + $scope.grid + ".js");
      }

      $scope.$apply();
      deadOrAlive();
    });
  };
  $scope.update();
}

function deadOrAlive() {
  var dead = JSON.parse( decodeURIComponent(window.location.hash).substring(1) ).dead;
  if(dead) {
    if($.type($("#background_transparent_preview", window.parent.document).attr("checked")) == "string") {
      $("body").css("background-color", "black");
    }
    $("#meta-tile").sortable();
    $("input").remove(); // so it doesn't show in options.

    $(document).on("click", "a", function(e) {
      e.preventDefault();
      var thislink = $(this);
      thislink.css("opacity", "1");
      $("a[class!='" + thislink.attr("class") + "']").css("opacity", "0.3");

      $("#presets", window.parent.document).val("");
      $(".guid", window.parent.document).html(thislink.attr("class"));
      $("a." + $(this)[0].sub_guid).parent().css("opacity", "1");
      $(".control-group", window.parent.document).fadeIn();
      $("#shortcut_name", window.parent.document).val(thislink.attr("title"));
      $("#url", window.parent.document).val(thislink.attr("href"));
      $("#image", window.parent.document).val(thislink.attr("data-image"));
      $("#search", window.parent.document).val(thislink.attr("data-search"));
      $("#colorSelector", window.parent.document).css("background-color", thislink.attr("data-color"));
      $("#background_transparent", window.parent.document).attr("checked", (thislink.attr("data-color") == "rgba(0, 0, 0, 0)"));
    });
  }

  if(!dead) { // if open in ANTP
    $("input").keypress(function(event) {
      if (event.which === 13 && $(this).val()) {
        var url = $(this).attr("data-search");
        url = url.replace(/%s/g, $(this).val());
        url = url.replace("{input}", $(this).val());
        $(this).val("");
        window.open(url);
      }
    });

    $(document).on("click", "a", function(e) { // new onclick method
      e.preventDefault();
      var url = $(this).attr("href");
      chrome.storage.sync.get(get_guid(), function(data) {

        var open_using = data[get_guid()].options.open_using;

        if (open_using !== "normal" && open_using !== "newtab" && open_using !== "pin" && open_using !== "newtab-inactive" && open_using !== "pin-inactive") {
          open_using = "normal";
          data[get_guid()].options.open_using = "normal";
          chrome.storage.sync.set(data);
        }

        chrome.extension.sendMessage({url: url, open_using: open_using});
      });
    });
  }
}

var presets = [ // for new 1/4 tiles
  {name: "Wikipedia", url: "http://www.wikipedia.com/", image: "/tile_images/wikipedia.png", color: "#000000", sub_guid: new_guid(), search: "http://en.wikipedia.org/wiki/%s"},
  {name: "reddit", url: "http://www.reddit.com/", image: "/tile_images/reddit.png", color: "#FF936B", sub_guid: new_guid(), search: "http://www.reddit.com/search?q=%s"},
  {name: "Pinterest", url: "http://www.pinterest.com/", image: "/tile_images/pinterest.png", color: "#CB2027", sub_guid: new_guid(), search: "http://pinterest.com/search/?q=%s"},
  {name: "New York Times", url: "http://www.nytimes.com/", image: "/tile_images/newyorktimes.png", color: "#444444", sub_guid: new_guid(), search: "http://query.nytimes.com/search/sitesearch/#/%s"}
];
