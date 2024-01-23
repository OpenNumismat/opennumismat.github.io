var url = "/data/catalogues_list.json";

$(function() {
  $.getJSON( url, function( data ) {
    var i;
    var catalogues = data["catalogues"]
    for (catalog of catalogues) {
      file = catalog['file'];
      name = file.substr(0, file.length-3);
      url = 'https://github.com/OpenNumismat/catalogues/releases/download/' + name + '_' + catalog['date'] + '/' + name + '.db'
      row = '<li>';
      row += catalog['title'] + ': ';
      row += '<a href="' + url + '">download</a>, ';
      row += '<a href="catalogue.html?catalogue=' + name + '&date=' + catalog['date'] + '">preview</a> ';
      row += '(at ' + catalog['date'] + ', ';
      row += catalog['count'] + ' coins);';
      row += '</li>';
      $('#catalogues-list').append(row);
    }
  });
});
