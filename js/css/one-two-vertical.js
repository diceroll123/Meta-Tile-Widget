$(document).ready(function() {

  $("a, .search-box").on("mouseenter", function() {
    if ($(".search-box").length) {
      if ($(this).attr("data-search") && $(this)[0].localName == "a") {
        if ($(this)[0].localName == "a") {
          $(".search-box").attr("placeholder", "Search " + $(this).attr("title"));
          $(".search-box").attr("data-search", $(this).attr("data-search"));
        }
        $("li").css({
          "height": "-webkit-calc(100% - 25px)",
          "top": "25px",
        });
        $(".search-box").show();
        $(".search-box").focus();
      }
    }
  });

  $("body").on("mouseleave", function() {
    $(".search-box").hide();
    $("li").css({
      "height": "100%",
      "top": "0"
    });
  });

});
