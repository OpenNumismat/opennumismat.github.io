var url = "https://raw.githubusercontent.com/OpenNumismat/open-numismat/master/tools/ref/countries.json";

$(function() {
  $.getJSON( url, function( data ) {
    row = '<ul>';
    for (region of data["regions"]) {
      row += '<li class="caret">';
      row += `<input type="checkbox" id="${region['name']}" checked>${region['name']}`;

      row += '<ul class="nested">';
      for (country of region["countries"]) {
        row += '<li class="caret">';
      row += `<input type="checkbox" id="${country['code']}" checked>${country['name']}`;

        row += '<ul class="nested">';
        for (unit of country["units"]) {
          row += '<li>';
          row += `<input type="checkbox" id="${unit}" checked>${unit}`;
          row += '</li>';
        }
        row += '</ul>';

        row += '</li>';
      }
      row += '</ul>';

      row += '</li>';
    }
    row += '</ul>';
    $('#references').append(row);

    $('.caret').click(function(e){
      if (e.target !== this)
        return;

      // Based on https://www.w3schools.com/howto/howto_js_treeview.asp
      $(this).find('.nested').first().toggleClass('expand');
      $(this).toggleClass("caret-down");
    });

    $('input:checkbox').click(function(){
        console.log(112);
      if ($(this).is(':checked')){
        childs = $(this).parent().find('ul').find('input:checkbox');
        for (child of childs) {
          $(child).prop('checked', true);
        }
      }
      else {
        childs = $(this).parent().find('ul').find('input:checkbox');
        for (child of childs) {
          $(child).prop('checked', false);
        }
      }
    });

    $('input:checkbox').click(function(){
      parent = $(this).parent().parent().parent('li')
      if (parent.length) {
        parent_input = $(parent).find('input:checkbox')[0];

        childs = $(parent).find('ul').find('input:checkbox');
        checked = false;
        unchecked = false;
        for (child of childs) {
          if ($(child).is(':checked'))
            checked = true;
          else
            unchecked = true;
        }
      
        if (checked && unchecked) {
          $(parent_input).prop('indeterminate', true);
        }
        else {
          $(parent_input).prop('indeterminate', false);
          $(parent_input).prop('checked', checked);
        }
      }
    });

  });
});
