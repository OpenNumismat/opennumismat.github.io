var url = "/data/catalogues-list.json";

$(function() {
  $.getJSON( url, function( data ) {
    var i;
    var arr = data["catalogues"]
    for (i = 0; i < arr.length; i++) {
      file = arr[i]['file'];
      name = file.substr(0, file.length-3);
      url = 'https://github.com/OpenNumismat/catalogues/releases/download/' + name + '_' + arr[i]['date'] + '/' + name + '.db'
      row = '<li>';
      row += arr[i]['title'] + ': ';
      row += '<a href="' + url + '" rel="nofollow">download</a>, ';
      row += '<a href="catalogue.html?catalogue=' + name + '&date=' + arr[i]['date'] + '" rel="nofollow">preview</a> ';
      row += '(at ' + arr[i]['date'] + ', ';
      row += arr[i]['count'] + ' coins);';
      row += '</li>';
      $('#catalogues-list').append(row);
    }
  });
});
