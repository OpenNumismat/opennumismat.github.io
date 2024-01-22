var url = "https://raw.githubusercontent.com/OpenNumismat/open-numismat/master/tools/ref/countries.json";

$(function() {
  $.getJSON( url, function( data ) {
    row = '<ul>';
    for (region of data["regions"]) {
      row += '<li class="caret">';
      row += `<input type="checkbox" id="${region['name']}" class="data-region" data-value="${region['name']}" checked>${region['name']}`;

      row += '<ul class="nested">';
      for (country of region["countries"]) {
        row += '<li class="caret">';
        row += `<input type="checkbox" id="${country['code']}" class="data-country" data-value="${country['name']}" checked>${country['name']}`;

        row += '<ul class="nested">';
        for (unit of country["units"]) {
          row += '<li>';
          row += `<input type="checkbox" id="${unit}" class="data-unit" data-value="${unit}" checked>${unit}`;
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
      if ($(this).is(':checked')){
        children = $(this).parent().find('ul').find('input:checkbox');
        for (child of children) {
          $(child).prop('checked', true);
        }
      }
      else {
        children = $(this).parent().find('ul').find('input:checkbox');
        for (child of children) {
          $(child).prop('checked', false);
        }
      }
    });

    $('input:checkbox').click(function(){
      parent = $(this).parent().parent().parent('li')
      if (parent.length) {
        parent_input = $(parent).find('input:checkbox')[0];

        children = $(parent).find('ul').find('input:checkbox');
        checked = false;
        unchecked = false;
        for (child of children) {
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

// Start the worker in which sql.js will run
var worker = new Worker("/javascripts/worker.sql-wasm.js");
worker.onerror = error;

// Open a database
worker.postMessage({ action: 'open' });

function error(e) {
	console.log(e);
}

// Run a command in the database
function execute(commands, onsuccess) {
	worker.onmessage = function (event) {
		var results = event.data.results;
		if (!results) {
			error({message: event.data.error});
			return;
		}

        if (onsuccess !== undefined)
            onsuccess();
	}
	worker.postMessage({ action: 'exec', sql: commands });
}

// Save the db to a file
function savedb() {
	worker.onmessage = function (event) {
		var arraybuff = event.data.buffer;
		var blob = new Blob([arraybuff]);
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.href = window.URL.createObjectURL(blob);
		a.download = "reference.ref";
		a.onclick = function () {
			setTimeout(function () {
				window.URL.revokeObjectURL(a.href);
			}, 1500);
		};
		a.click();
	};
	worker.postMessage({ action: 'export' });
}

function createdb() {
    var region_id = 0;
    var insert_regions_sql = "";
    var country_id = 0;
    var insert_countries_sql = "";
    regions = $('#references').find('.data-region');
    for (region of regions) {
        if ($(region).is(':checked') || $(region).prop('indeterminate')) {
            region_id ++;
            insert_regions_sql += `INSERT INTO ref_region (id, value)
                VALUES (${region_id}, "${$(region).data('value')}");`

            countries = $('#references').find('.data-country');
            for (country of countries) {
                if ($(country).is(':checked') || $(country).prop('indeterminate')) {
                    country_id ++;
                    insert_countries_sql += `INSERT INTO ref_country (id, value, parentid)
                        VALUES (${country_id}, "${$(country).data('value')}", ${region_id});`

                }
            }
        }
    }

    execute(`
DROP TABLE IF EXISTS ref;
CREATE TABLE ref (
            title CHAR NOT NULL UNIQUE,
            value CHAR);
INSERT INTO ref VALUES ("version", "1");

DROP TABLE IF EXISTS ref_region;
CREATE TABLE ref_region (
            id INTEGER PRIMARY KEY,
            value TEXT, icon BLOB);
${insert_regions_sql}

DROP TABLE IF EXISTS ref_country;
CREATE TABLE ref_country (
            id INTEGER PRIMARY KEY,
            parentid INTEGER,
            value TEXT, icon BLOB);
${insert_countries_sql}
    `, savedb);
}

$('#savedb').click(function(){
    createdb();
});
