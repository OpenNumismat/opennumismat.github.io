function urlParam(name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  return results[1] || 0;
}

var col_name = urlParam("catalogue");
var col_date = urlParam("date");
var url = "https://cdn.rawgit.com/OpenNumismat/catalogues/" + col_name + "_" + col_date + "/" + col_name + "/" + col_name + ".json";

function setData(arr) {
  var i;
  for (i = 0; i < arr.length; i++) {
    row = '<tr>';
    obverse_url = "https://raw.githubusercontent.com/OpenNumismat/catalogues/" + col_name + "_" + col_date + "/" + col_name + "/" + col_name + "_images/"+arr[i]["obverseimg"];
    reverse_url = "https://raw.githubusercontent.com/OpenNumismat/catalogues/" + col_name + "_" + col_date + "/" + col_name + "/" + col_name + "_images/"+arr[i]["reverseimg"];
    row += '<td class="img"><a href="'+obverse_url+'"><img height="49px" src="/images/loader.gif" data-original="'+obverse_url+'"></a>';
    row +=     '<a href="'+reverse_url+'"><img height="49px" src="/images/loader.gif" data-original="'+reverse_url+'"></a></td>';
    row += '<td>'+ (arr[i]["title"] == undefined ? '' : arr[i]["title"]) +'</td>'
    row += '<td>'+ (arr[i]["value"] == undefined ? '' : arr[i]["value"]) +'</td>'
    row += '<td>'+ (arr[i]["unit"] == undefined ? '' : arr[i]["unit"]) +'</td>'
    row += '<td>'+ (arr[i]["mintmark"] == undefined ? '' : arr[i]["mintmark"]) +'</td>'
    row += '<td>'+ (arr[i]["country"] == undefined ? '' : arr[i]["country"]) +'</td>'
    row += '<td>'+ (arr[i]["year"] == undefined ? '' : arr[i]["year"]) +'</td>'
    row += '<td>'+ (arr[i]["series"] == undefined ? '' : arr[i]["series"]) +'</td>'
    row += '<td>'+ (arr[i]["subjectshort"] == undefined ? '' : arr[i]["subjectshort"]) +'</td>'
    row += '<td>'+ (arr[i]["mintage"] == undefined ? '' : arr[i]["mintage"]) +'</td>'
    row += '<td>'+ (arr[i]["material"] == undefined ? '' : arr[i]["material"]) +'</td>'
    row += '<td>'+ (arr[i]["fineness"] == undefined ? '' : arr[i]["fineness"]) +'</td>'
    row += '<td>'+ (arr[i]["quality"] == undefined ? '' : arr[i]["quality"]) +'</td>'
    row += '<td>'+ (arr[i]["catalognum1"] == undefined ? '' : arr[i]["catalognum1"]) +'</td>'
    row += '</tr>'
    $('#table > tbody:last').append(row);
  }
}

$(function() {
  $.getJSON( url, function( data ) {
    setData(data["coins"]);
    $("img").lazyload();
    document.title = data["description"]["title"];
  });
});
