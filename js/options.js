function OptionsCtrl($scope) {
  $scope.iframe_hash = encodeURI(JSON.stringify({ id: get_guid() , dead: true }));
}

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

function go2antp() {
  window.location = "chrome-extension://mgmiemnjjchgkmgbeljfocdjjnpjnmcg/ntp.html";
}

function instance_grid() {
  var new_instance = [];
  $.each($(document.getElementById("tile")).contents().find("a"), function(key, value) {
    value = $(value);
    var object = {name: value.attr("title"), url: value.attr("href"), image: value.attr("data-image"), color: value.attr("data-color"), sub_guid: value.attr("class"), search: value.attr("data-search")};
    new_instance.push(object);
  });
  return new_instance;
}

function getApps() {
  $("#chromeapps").html("");
  chrome.management.getAll(function(all) {
    var extensions = [];
    $.each(all, function(id, extension) {
      if ( extension.isApp === true && extension.enabled === true ) {
        extension.img = "chrome://extension-icon/" + extension.id + "/128/0";
        extensions.push(extension);
      }
    });
    extensions.sort(SortByName);

    $.each(extensions, function(id, extension) {
      $("#chromeapps").append($('<option>', {
        url: extension.appLaunchUrl,
        text : extension.name,
        image : extension.img,
        isApp: true,
        id: extension.id
      }));
    });
  });
}

function SortByName(a, b){
  var aName = a.name.toLowerCase();
  var bName = b.name.toLowerCase();
  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

$(document).ready(function() {

  getApps();

  $.each(presets, function(key, value) {
    $('#sites').append($('<option>', {
      value: value.name,
      text : value.name
    }));
  });

  $('#colorSelector').ColorPicker({
    color: '#0080ff',
    onShow: function (colpkr) {
      $(colpkr).fadeIn(500);
      return false;
    },
    onHide: function (colpkr) {
      $(colpkr).fadeOut(500);
      return false;
    },
    onChange: function (hsb, hex, rgb) {
      $('#colorSelector').css('backgroundColor', '#' + hex);
      new_instance = set_instance($(".guid").html(), "color", "#" + hex);
      $("#background_transparent").attr("checked", false);
    },
    onBeforeShow: function () {
      // RGB to HEX
      var rgbString = $('#colorSelector').css('backgroundColor');
      var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

      delete (parts[0]);
      for (var i = 1; i <= 3; ++i) {
          parts[i] = parseInt(parts[i]).toString(16);
          if (parts[i].length == 1) parts[i] = '0' + parts[i];
      }
      var hexString ='#'+parts.join('').toUpperCase();
      $(this).ColorPickerSetColor(hexString);
    }
  });

  $("form").submit(function(e) {
    chrome.storage.sync.get(get_guid(), function(data) {
      data[get_guid()].tiles = instance_grid();
      chrome.storage.sync.set(data);
    });
    e.preventDefault();
  });

  $("#shortcut_name").change(function() {
    new_instance = set_instance($(".guid").html(), "name", $(this).val());
  });

  $("#url").change(function() {
    new_instance = set_instance($(".guid").html(), "url", $(this).val());
  });

  $("#image").change(function() {
    new_instance = set_instance($(".guid").html(), "image", $(this).val());
  });

  $("#search").change(function() {
    new_instance = set_instance($(".guid").html(), "search", $(this).val());
  });

  $('#background_transparent').change(function() {
    if ($(this).is(':checked')) {
      new_instance = set_instance($(".guid").html(), "color", "transparent");
    } else {
      var color = $('#colorSelector').css('backgroundColor');
      if (color != "transparent" && color != "rgba(0, 0, 0, 0)") {
        new_instance = set_instance($(".guid").html(), "color", color);
      } else {
        $('#colorSelector').css('backgroundColor', "black");
        new_instance = set_instance($(".guid").html(), "color", "black");
      }
    }
  });

  $('#background_transparent_preview').change(function() {
    if ($(this).is(':checked')) {
      $(document.getElementById("tile")).contents().find("body").css("background-color", "#000000");
    } else {
      $(document.getElementById("tile")).contents().find("body").css("background-color", "transparent");
    }
  });

  $('#disable_search').change(function() {
    var element = $(this);
    chrome.storage.sync.get(get_guid(), function(data) {
      if(data[get_guid()].options === undefined) {
        data[get_guid()].options = {};
      }
      if (element.is(':checked')) {
        data[get_guid()].options.disable_search = true;
      } else {
        data[get_guid()].options.disable_search = false;
      }
      chrome.storage.sync.set(data);
    });
  });

  $('#open_using').change(function() {
    var element = $(this);
    chrome.storage.sync.get(get_guid(), function(data) {
      if(data[get_guid()].options === undefined) {
        data[get_guid()].options = {};
      }

      data[get_guid()].options.open_using = element.val();
      console.log(data[get_guid()].options);
      chrome.storage.sync.set(data);
    });
  });

  $("#antp").click(function(e) {
    go2antp();
    e.preventDefault();
  });

  $(".set").on("click", function(e) {
    e.preventDefault(); // prevents form from submitting
    if ($("#presets").val() !== "") {
      var guid = $(".guid").html();
      $("#presets").each(function() {
        var selected = $('option:selected', this);
        if (selected.attr("isapp") == "true") {
          $("#shortcut_name").val(selected.val()).trigger("change");

          $("#url").val(selected.attr("url"));
          new_instance = set_instance(guid, "url", selected.attr("url"));

          //$("#image").val(localStorage.getItem($(selected).attr("id"))).trigger("change");
          $("#image").val("{" + $(selected).attr("id") + "}").trigger("change");

          $("#search").val("").trigger("change");
          new_instance = set_instance(guid, "search", "");

          $('#background_transparent').attr("checked", true);
          $('#colorSelector').css("background-color", "transparent");
          new_instance = set_instance(guid, "color", "transparent");

        } else {
          $.each(presets, function(k,v) {
            if ($("#presets").val() == v['name']) {
              $("#shortcut_name").val(v['name']).trigger("change");

              $("#url").val(v['url']);
              new_instance = set_instance(guid, "url", v['url']);

              $("#image").val(v['image']).trigger("change");

              $("#search").val(v['search']).trigger("change");
              new_instance = set_instance(guid, "search", v['search']);

              $('#colorSelector').css("background-color", v['color']);
              new_instance = set_instance(guid, "color", v['color']);
              $('#background_transparent').attr("checked", false);
            }
          });
        }
      });
      $("#presets").val("");
    }
  });

  $(".setsize").on("click", function(e) {
    e.preventDefault(); // prevents form from submitting
    chrome.storage.sync.get(get_guid(), function(data) {
      var options = data[get_guid()].options;
      var selected_size = $("#sizes").val();
      if (selected_size !== "") {
        var new_instance = instance_grid();
        if (selected_size == "2v") { // vertical 2 tiles
          options.vertical = true;
          selected_size = 2;
        } else {
          options.vertical = false;
        }
        selected_size = parseInt(selected_size);
        if (selected_size > new_instance.length) {
          var amount_needed = selected_size - new_instance.length;
          var guids = []; // for some reason, in the loop, it has made doubles on more than one occasion... most likely because Math.random() is seeded by the current time, and it processes too quickly, thus using the same number. this fixes that.
          for (var i = 1; i<=20; i++ ) {
            guids.push(new_guid());
          }
          $.unique(guids); // just in case!
          presets_copy = presets.sort(function() { return 0.5 - Math.random();}); // randomize
          for (var i = 1; i<=amount_needed; i++ ) {
            var preset = presets_copy.pop(); // pad with random presets
            preset.sub_guid = guids.pop();
            new_instance.push(preset);
          }
        } else {
          while(new_instance.length > parseInt(selected_size)) {
            new_instance.pop();
          }
        }
        var store = {options: options, tiles: new_instance};
        data[get_guid()].tiles = new_instance;
        chrome.storage.sync.set(data);
        document.getElementById("tile").contentDocument.location.reload(true); // don't change to jQuery. Won't work. :|
      }
    });
  });

  // default values
  chrome.storage.sync.get(get_guid(), function(data) {
    if (data[get_guid()] && data[get_guid()].options && data[get_guid()].options.disable_search == true) {
      $("#disable_search").attr("checked", true);
    }

    if (data[get_guid()] && data[get_guid()].options && data[get_guid()].options.open_using) {
      $("#open_using").val(data[get_guid()].options.open_using);
    }
  });
});

var new_instance;

function set_instance(guid, key, value) {
  var new_instance = instance_grid();
  $.each(new_instance, function(k,v) {
    if (guid == v['sub_guid']) {
      if(key === "color") {
        $(document.getElementById("tile")).contents().find("." + guid).css("background-color", value);
        $(document.getElementById("tile")).contents().find("." + guid).attr("data-color", value);
      }
      if(key === "name") {
        $(document.getElementById("tile")).contents().find("." + guid).attr("title", value);
      }
      if(key === "url") {
        $(document.getElementById("tile")).contents().find("." + guid).attr("href", value);
      }
      if(key === "image") {
        var img = value;
        if(img.substring(0, 1) == "{") {
          img = localStorage.getItem(img.substring(1, 33));
        }
        $(document.getElementById("tile")).contents().find("." + guid).css("background-image", "url(" + img + ")");
        $(document.getElementById("tile")).contents().find("." + guid).attr("data-image", value);
      }
      if(key === "search") {
        $(document.getElementById("tile")).contents().find("." + guid).attr("data-search", value);
      }
    }
  });
  return new_instance;
}
