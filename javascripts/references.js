function reload() {
  var region_source = $("#region-source").val();
  var url = `https://raw.githubusercontent.com/OpenNumismat/references/main/data/${region_source}.json`

  $.getJSON( url, function( data ) {
    row = '<ul id="regions-tree">';
    for (region of data["regions"]) {
      row += '<li class="caret">';
      row += `<input type="checkbox" id="${region['name']}" class="data-region" data-value="${region['name']}" checked>${region['name']}`;

      row += '<ul class="nested">';
      for (country of region["countries"]) {
        var flag_source = $("#flag-source option:selected").text();

        row += '<li class="caret">';
        row += `<input type="checkbox" id="${country['alpha2']}" class="data-country" data-value="${country['name']}" checked>`;
        row += `<img>`;
        row += ` ${country['name']}`;

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

    update_flags();

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

    $('.collapse-button').click(function(){
      $(this).parent().parent().find('.nested').removeClass('expand');
      $(this).parent().parent().find('.caret').removeClass('caret-down');
    });
    $('.expand-button').click(function(){
      $(this).parent().parent().find('.nested').addClass('expand');
      $(this).parent().parent().find('.caret').addClass('caret-down');
    });
    $('.select-button').click(function(){
      $(this).parent().parent().find('input:checkbox').prop('checked', true);
      $(this).parent().parent().find('input:checkbox').prop('indeterminate', false);
    });
    $('.clear-button').click(function(){
      $(this).parent().parent().find('input:checkbox').prop('checked', false);
      $(this).parent().parent().find('input:checkbox').prop('indeterminate', false);
    });
  });
}

var flag_images = {};

async function url2blob(url, code) {
  const response = await fetch(url);
  const blob = await response.blob();

  return blob;
}

function update_flag(img, url, code) {
  url2blob(url, code).then(function(blob) {
    var base64Reader = new FileReader();
    base64Reader.onload = function() {
      var base64data = base64Reader.result;
      $(img).attr("src", base64data);
    };
    base64Reader.readAsDataURL(blob);

    var bytesReader = new FileReader();
    bytesReader.onload = function(event) {
      arrayBuffer = bytesReader.result;
      byteArray = new Uint8Array(arrayBuffer);
      Array.from(byteArray);
      flag_images[code] = Array.from(byteArray);
    };
    bytesReader.readAsArrayBuffer(blob);
  });
}

function update_flags() {
  flag_images = {};

  var flag_source = $("#flag-source option:selected").text();
  imgs = $('#references').find('img');
  for (img of imgs) {
    code = $(img).prev().attr('id');
    url = code2img_url(flag_source, code);
    update_flag(img, url, code);
  }
}

function code2img_url(flag_source, code) {
    if (flag_source === 'famfamfam')
        return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/flags/famfamfam/${code.toLowerCase()}.png`;
    else if (flag_source === 'Flagpedia')
        return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/flags/Flagpedia/${code.toLowerCase()}.png`;
    else if (flag_source === 'GoSquared')
        return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/flags/GoSquared/${code.toUpperCase()}.png`;
    else if (flag_source === 'StefanGabos')
        return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/flags/StefanGabos/${code.toLowerCase()}.png`;
}

$(function() {
    reload();

    $("#region-source").change(function() {
        $("#regions-tree").remove();
        reload();
    });

    $("#flag-source").change(function() {
      update_flags();
    });
});

function create_tables(db) {
    db.run(`
DROP TABLE IF EXISTS sections;
CREATE TABLE sections (
            id INTEGER PRIMARY KEY,
            name TEXT, icon BLOB,
            letter TEXT, parent TEXT,
            sort INTEGER);
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('1', 'category', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('2', 'region', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('3', 'country', 'C', 'region', '1');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('4', 'period', 'P', 'country', '1');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('5', 'emitent', '…', 'country', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('6', 'ruler', '…', 'country', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('7', 'unit', 'U', 'country', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('8', 'mint', '…', 'country', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('9', 'series', 'S', 'country', '1');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('10', 'grade', 'G', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('11', 'shape', 'F', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('12', 'quality', 'Q', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('13', 'rarity', 'R', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('14', 'obvrev', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('15', 'type', 'T', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('16', 'defect', 'D', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('17', 'format', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('18', 'condition', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('19', 'grader', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('20', 'storage', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('21', 'composition', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('22', 'technique', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('23', 'modification', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('24', 'place', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('25', 'color', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('26', 'edge', '…', '', '0');
INSERT INTO sections ("id", "name", "letter", "parent", "sort") VALUES ('27', 'material', 'M', '', '0');

DROP TABLE IF EXISTS ref;
CREATE TABLE ref (
            title CHAR NOT NULL UNIQUE,
            value CHAR);
INSERT INTO ref VALUES ("version", "1");

DROP TABLE IF EXISTS ref_region;
CREATE TABLE ref_region (
            id INTEGER PRIMARY KEY,
            value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_country;
CREATE TABLE ref_country (
            id INTEGER PRIMARY KEY,
            parentid INTEGER,
            value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_unit;
CREATE TABLE ref_unit (
            id INTEGER PRIMARY KEY,
            parentid INTEGER,
            value TEXT, icon BLOB);
    `);
}

async function createdb(db) {
    create_tables(db);

    var region_id = 0;
    var insert_regions_sql = "";
    var country_id = 0;
    var insert_countries_sql = "";
    var unit_id = 0;
    var insert_units_sql = "";
    regions = $('#references').find('.data-region');
    for (region of regions) {
        if ($(region).is(':checked') || $(region).prop('indeterminate')) {
            region_id ++;
            insert_regions_sql += `INSERT INTO ref_region (id, value)
                VALUES (${region_id}, "${$(region).data('value')}");`

            countries = $(region).parent().find('.data-country');
            for (country of countries) {
                if ($(country).is(':checked') || $(country).prop('indeterminate')) {
                    img_bytes = flag_images[$(country).attr('id')];

                    country_id ++;
                    insert_countries_sql = `INSERT INTO ref_country (id, value, parentid, icon)
                        VALUES (${country_id}, "${$(country).data('value')}", ${region_id}, ?);`

                    if (img_bytes !== undefined)
                        db.run(insert_countries_sql, [img_bytes,]);
                    else
                        db.run(insert_countries_sql);

                    units = $(country).parent().find('.data-unit');
                    for (unit of units) {
                        if ($(unit).is(':checked') || $(unit).prop('indeterminate')) {
                            unit_id ++;
                            insert_units_sql += `INSERT INTO ref_unit (id, value, parentid)
                                VALUES (${unit_id}, "${$(unit).data('value')}", ${country_id});`
                        }
                    }
                }
            }
        }
    }

    db.run(insert_regions_sql);
    //db.run(insert_countries_sql);
    db.run(insert_units_sql);
}

// Save the db to a file
function savedb(db, file_name) {
    const data = db.export();
    var arraybuff = data.buffer;
    var blob = new Blob([arraybuff]);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = window.URL.createObjectURL(blob);
    a.download = file_name;
    a.onclick = function () {
        setTimeout(function () {
            window.URL.revokeObjectURL(a.href);
        }, 1500);
    };
    a.click();
    a.remove();
}

$('#savedb').click(function() {
    const config = { locateFile: file => "/javascripts/sql-wasm.wasm" };
    initSqlJs(config).then(function(SQL){
        // Create the database
        const db = new SQL.Database();

        createdb(db).then(function() {
            savedb(db, "reference.ref");
        });
    });
});
