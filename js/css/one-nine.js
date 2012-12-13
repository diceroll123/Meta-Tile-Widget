$(document).ready(function() {

  $("a, .search-box").on("mouseenter", function() {

    if($(this)[0].localName == "a") {
      var index = $(this).parent().index();
    }

    if ($(".search-box").length) {
      if ($(this).attr("data-search") && $(this)[0].localName == "a") {
        if ($(this)[0].localName == "a") {
          $(".search-box").attr("placeholder", "Search " + $(this).attr("title"));
          $(".search-box").attr("data-search", $(this).attr("data-search"));
        }
        $("li").css("height", "-webkit-calc(100% / 3 - 10px)");

        if(index < 3) {
          $(".search-box").css("bottom", "");
          $(".search-box").css("top", "-2px");
          $("li:nth-child(-n+3)").css("top", "24px");
          $("li:nth-child(n+4):nth-child(-n+6)").css("top", "-webkit-calc(100% / 3 + 17px)");
        }

        if(index >= 3) {
          $(".search-box").css("top", "");
          $(".search-box").css("bottom", "-webkit-calc(100% / 3 - 9px)");
          $("li:nth-child(-n+3)").css("top", "0px");
          $("li:nth-child(n+4):nth-child(-n+6)").css("top", "-webkit-calc(100% / 3 - 7px)");
        }

        $(".search-box").show();
        $(".search-box").focus();
      }
    }
  });

  $("body").on("mouseleave", function() {
    $(".search-box").hide();

    $("li").css("height", "-webkit-calc(100% / 3 - 2px)");
    $("li:nth-child(-n+3)").css("top", "0px");
    $("li:nth-child(n+4):nth-child(-n+6)").css("top", "-webkit-calc(100% / 3 + 1px)");
  });

});
