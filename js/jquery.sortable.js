/*
 * HTML5 Sortable jQuery Plugin
 * http://farhadi.ir/projects/html5sortable
 *
 * Copyright 2012, Ali Farhadi
 * Released under the MIT license.
 *
 * Editted for the Meta Tile.
 */
(function($) {
var dragging, placeholders = $();
$.fn.sortable = function(options) {
  var method = String(options);
  options = $.extend({
    connectWith: false
  }, options);
  return this.each(function() {
    if (/^enable|disable|destroy$/.test(method)) {
      var items = $(this).children($(this).data('items')).attr('draggable', method == 'enable');
      if (method == 'destroy') {
        items.add(this).removeData('connectWith items')
          .off('dragstart.h5s dragend.h5s selectstart.h5s dragover.h5s dragenter.h5s drop.h5s');
      }
      return;
    }
    var index, items = $(this).children(options.items);
    var placeholder = $('<li class="sortable-placeholder">');
    $(this).data('items', options.items)
    placeholders = placeholders.add(placeholder);
    items.attr('draggable', 'true').on('dragstart.h5s', function(e) {
      var dt = e.originalEvent.dataTransfer;
      dt.effectAllowed = 'move';
      dt.setData('Text', 'dummy');
      index = (dragging = $(this)).addClass('sortable-dragging').index();
    }).on('dragend.h5s', function() {
      dragging.removeClass('sortable-dragging').show();
      placeholders.detach();
      if (index != dragging.index()) {
        items.parent().trigger('sortupdate', {item: dragging});
      }
      dragging = null;
    }).not('a[href], img').on('selectstart.h5s', function() {
      this.dragDrop && this.dragDrop();
      return false;
    }).end().add([this, placeholder]).on('dragover.h5s dragenter.h5s drop.h5s', function(e) {
      if (!items.is(dragging) && options.connectWith !== $(dragging).parent().data('connectWith')) {
        return true;
      }
      if (e.type == 'drop') {
        e.stopPropagation();
        placeholders.filter(':visible').after(dragging);
        return false;
      }
      e.preventDefault();
      e.originalEvent.dataTransfer.dropEffect = 'move';
      if (items.is(this)) {
        placeholder = $(dragging);
        dragging.hide();
        $(this)[placeholder.index() < $(this).index() ? 'after' : 'before'](placeholder);
        placeholders.not(placeholder).detach();
        if($("li").length < 2) {
          $("ul").append(this);
        }
      } else if (!placeholders.is(this) && !$(this).children(options.items).length) {
        placeholders.detach();
        $(this).append(placeholder);
      }
      return false;
    });
  });
};
})(jQuery);
