function slugify(text) {
  var from = "ãàáäâāẽèéëêìíïîõòóöôồøùúüûçđłñşřÃÀÁÄÂĀẼÈÉËÊÌÍÏÎÕÒÓÖÔỒØÙÚÜÛÑÇĐŁŞŘʻ";
  var to = "aaaaaaeeeeeiiiiooooooouuuucdlnsrAAAAAAEEEEEIIIIOOOOOOOUUUUNCDLSR'";
  for (var i = 0, len = from.length; i < len; i++)
    text = text.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  return text;
}

function replace_nonlatin() {
  if ($("#replace-nonlatin").is(":hidden"))
    return;

  if ($("#replace-nonlatin").is(":checked")) {
    for (el of $.find(".data-country")) {
      text = $(el).data("value");
      $(el).next().next().text(slugify(text));
    }
    for (el of $.find(".data-unit")) {
      text = $(el).data("value");
      $(el).next().text(slugify(text));
    }
  } else {
    for (el of $.find(".data-country")) {
      text = $(el).data("value");
      $(el).next().next().text(text);
    }
    for (el of $.find(".data-unit")) {
      text = $(el).data("value");
      $(el).next().text(text);
    }
  }
}

function reload_regions() {
  var lang = $("#language").val();
  var region_source = $("#region-source").val();
  var url = `https://raw.githubusercontent.com/OpenNumismat/references/main/data/${region_source}_${lang}.json`
  var mint_names = $("#mint-names").val();

  $.getJSON(url, function (data) {
    row = '<ul id="regions-tree">';

    if (!("regions" in data)) {
      data["regions"] = [{"name": "All", "countries": data["countries"]}];
    }

    for (region of data["regions"]) {
      row += '<li class="caret">';
      row += `<label><input type="checkbox" id="${region['name']}" class="data-region" data-value="${region['name']}" checked>${region['name']}</label>`;

      row += '<ul class="nested">';
      counties = region["countries"].sort(function (a, b) {
        return a["name"].localeCompare(b["name"]);
      });
      for (country of counties) {
        county_state_class = '';
        if ('unrecognized' in country)
          county_state_class += ' data-country-unrecognized'
        if ('dependent' in country)
          county_state_class += ' data-country-dependent'
        if ('disappeared' in country)
          county_state_class += ' data-country-disappeared'

        row += '<li class="caret">';
        row += `<label><input type="checkbox" id="${country['key']}" class="data-country${county_state_class}" data-value="${country['name']}" checked>`;
        row += '<img class="img-flagicon">';
        row += `<span>${country['name']}</span>`;
        row += '</label>';

        row += '<ul class="nested">';
        for (unit of country["units"]) {
          row += '<li>';
          row += `<label><input type="checkbox" id="${unit}" class="data-unit" data-value="${unit}" checked>`;
          row += `<span>${unit}</span>`;
          row += '</label>';
          row += '</li>';
        }
        if ("contemporary_units" in country) {
          for (unit of country["contemporary_units"]) {
            row += '<li>';
            row += `<label><input type="checkbox" id="${unit}" class="data-unit data-unit-contemporary" data-value="${unit}" checked>`;
            row += `<span>${unit}</span>`;
            row += '</label>';
            row += '</li>';
          }
        }

        if ("mints" in country) {
          actual_mints = [];
          for (mint of country["mints"]) {
            if (!('to_year' in mint))
              actual_mints.push(mint);
          }
          if (actual_mints.length > 0) {
            row += '<br>';
            for (mint of actual_mints) {
              row += '<li>';
              if ('local_name' in mint)
                local_name = mint['local_name'];
              else
                local_name = mint['name'];
              row += `<label><input type="checkbox" id="${mint[mint_names]}" class="data-mint" data-value="${mint[mint_names]}" data-name="${mint['name']}" data-local_name="${local_name}" data-location="${mint['location']}" checked>`;
              row += `<span>${mint[mint_names]}</span>`;
              row += '</label>';
              row += '</li>';
            }
          }
        }
        row += '</ul>';

        row += '</li>';
      }
      row += '</ul>';

      row += '</li>';
    }
    row += '</ul>';
    $('#countries-references').append(row);
    init_tree($('#regions-tree'));

    update_flags();
    update_unrecognized();
    update_dependent();
    update_contemporary_era();
    update_mints();
    replace_nonlatin();
  });
}

function init_tree(tree) {
  $(tree).find('.caret').click(function (e) {
    if (e.target !== this)
      return;

    // Based on https://www.w3schools.com/howto/howto_js_treeview.asp
    $(this).find('.nested').first().toggleClass('expand');
    $(this).toggleClass("caret-down");
  });

  $(tree).find('input:checkbox').click(function () {
    if ($(this).is(':checked')) {
      children = $(this).parent().parent().find('ul').find('input:checkbox');
      for (child of children) {
        $(child).prop('checked', true);
      }
    } else {
      children = $(this).parent().parent().find('ul').find('input:checkbox');
      for (child of children) {
        $(child).prop('checked', false);
      }
    }
  });

  $(tree).find('input:checkbox').click(function () {
    parent = $(this).parent().parent().parent().parent('li')
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
      } else {
        $(parent_input).prop('indeterminate', false);
        $(parent_input).prop('checked', checked);
      }
    }
  });
}

function reload_other_references() {
  const lang = $("#language").val();
  const url = `https://raw.githubusercontent.com/OpenNumismat/references/master/data/reference_${lang}.json`

  $.getJSON(url, function (data) {
    let row = '<ul id="other-references-tree">';
    for (reference of data) {
      row += '<li class="caret">';
      row += `<label><input type="checkbox" id="${reference['name']}" class="data-references" data-value="${reference['name']}" checked>${reference['title']}</label>`;

      row += '<ul class="nested">';
      for (key in reference['values']) {
        var val = reference['values'][key]
        row += '<li>';
        row += `<label><input type="checkbox" id="${reference['name']}_${key}" class="data-references-value" data-value="${key}" checked>`;
        if (reference['has_icons'])
          row += '<img class="img-icon">';
        row += val;
        row += '</label></li>';
      }
      row += '</ul>';

      row += '</li>';
    }
    row += '</ul>';

    $('#other-references').append(row);
    init_tree($('#other-references-tree'));

    update_other_images();
  });
}

function update_dependent() {
  var include_dependent = $("#include-dependent").is(":checked");
  if (include_dependent)
    $('.data-country-dependent').parent().parent().show();
  else
    $('.data-country-dependent').parent().parent().hide();
}

function update_unrecognized() {
  var include_unrecognized = $("#include-unrecognized").is(":checked");
  if (include_unrecognized)
    $('.data-country-unrecognized').parent().parent().show();
  else
    $('.data-country-unrecognized').parent().parent().hide();
}

function update_mints() {
  var mint_names = $("#mint-names").val();
  mints = $('#regions-tree').find('.data-mint');
  for (mint of mints) {
    if (mint_names !== 'none') {
      name = $(mint).data(mint_names);
      $(mint).next().text(name);
      $(mint).data('value', name);
      $(mint).parent().parent().show();
    } else {
      $(mint).data('value', '');
      $(mint).parent().parent().hide();
    }
  }
}

function update_contemporary_era() {
  var include_contemporary = $("#era-contemporary").is(":checked");
  if (include_contemporary) {
    $('.data-unit-contemporary').parent().parent().show();
    $('.data-country-disappeared').parent().parent().show();
  }
  else {
    $('.data-unit-contemporary').parent().parent().hide();
    $('.data-country-disappeared').parent().parent().hide();
  }
}

var flag_images = {};
var other_images = {};

async function url2blob(url, code) {
  const response = await fetch(url);
  var blob = undefined;
  if (response.ok)
    blob = await response.blob();

  return blob;
}

function update_flag(img, url, code) {
  url2blob(url, code).then(function (blob) {
    if (blob !== undefined) {
      var base64Reader = new FileReader();
      base64Reader.onload = function () {
        var base64data = base64Reader.result;
        $(img).attr("src", base64data);
      };
      base64Reader.readAsDataURL(blob);

      var bytesReader = new FileReader();
      bytesReader.onload = function (event) {
        arrayBuffer = bytesReader.result;
        byteArray = new Uint8Array(arrayBuffer);
        Array.from(byteArray);
        flag_images[code] = Array.from(byteArray);
      };
      bytesReader.readAsArrayBuffer(blob);
    }
    else {
      if (!url.includes('Wikipedia')) {
        url = code2img_url('Wikipedia', code);
        update_flag(img, url, code);
      }
    }
  });
}

function update_flags() {
  flag_images = {};

  const flag_source = $("#flag-source option:selected").text();
  const imgs = $('#countries-references').find('img');
  for (const img of imgs) {
    $(img).attr("src", "");
    if (flag_source !== "None") {
      const code = $(img).prev().attr('id');
      if (code) {
        url = code2img_url(flag_source, code);
        update_flag(img, url, code);
      }
    }
  }
}

function update_other_image(img, url, code) {
  url2blob(url, code).then(function (blob) {
    var base64Reader = new FileReader();
    base64Reader.onload = function () {
      var base64data = base64Reader.result;
      $(img).attr("src", base64data);
    };
    base64Reader.readAsDataURL(blob);

    var bytesReader = new FileReader();
    bytesReader.onload = function (event) {
      arrayBuffer = bytesReader.result;
      byteArray = new Uint8Array(arrayBuffer);
      Array.from(byteArray);
      other_images[code] = Array.from(byteArray);
    };
    bytesReader.readAsArrayBuffer(blob);
  });
}

function update_other_images() {
  other_images = {};

  imgs = $('#other-references').find('img');
  for (img of imgs) {
    value = $(img).prev().data('value');
    reference = $(img).parent().parent().parent().prev().children().data('value');
    url = other_reference2img_url(reference, value);
    update_other_image(img, url, `${reference}_${value}`);
  }
}

function code2img_url(flag_source, code) {
  if (flag_source === 'famfamfam')
    return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/flags/famfamfam/${code.toLowerCase()}.png`;
  else if (flag_source === 'Flagpedia')
    return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/flags/Flagpedia/${code.toLowerCase()}.png`;
  else if (flag_source === 'GoSquared')
    return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/flags/GoSquared/${code.toLowerCase()}.png`;
  else if (flag_source === 'StefanGabos')
    return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/flags/StefanGabos/${code.toLowerCase()}.png`;
  else if (flag_source === 'Wikipedia')
    return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/flags/Wikipedia/${code.toLowerCase()}.png`;
}

function other_reference2img_url(reference, value) {
  return `https://raw.githubusercontent.com/OpenNumismat/references/main/data/icons/${reference}/${value}.png`;
}

$(function () {
  const langcodes = ["de", "pl", "pt", "ru", "uk", "it", "fr", "el", "ca", "nl", "es", "bg", "tr", "sv"];
  const path = window.location.pathname;
  for (lang of langcodes) {
    if (path.includes(`/${lang}/`)) {
      $("#language").val(lang);
      $("#replace-nonlatin").parent().hide();
    }
  }

  $("#language").change(function () {
    var lang = $("#language").val();
    if (lang === 'en') {
      $("#replace-nonlatin").parent().show();
    } else {
      $("#replace-nonlatin").parent().hide();
    }

    $("#regions-tree").remove();
    reload_regions();

    $("#other-references-tree").remove();
    reload_other_references();
  });

  $("#replace-nonlatin").change(function () {
    replace_nonlatin();
  });

  reload_regions();
  reload_other_references();

  $("#region-source").change(function () {
    $("#regions-tree").remove();
    reload_regions();
  });

  $("#flag-source").change(function () {
    update_flags();
  });

  $('#include-unrecognized').change(function () {
    update_unrecognized();
  });

  $('#include-dependent').change(function () {
    update_dependent();
  });

  $('#mint-names').change(function () {
    update_mints();
  });

  $('#era-contemporary').change(function () {
    update_contemporary_era();
  });

  $('.collapse-button').click(function () {
    $(this).parent().parent().find('.nested').removeClass('expand');
    $(this).parent().parent().find('.caret').removeClass('caret-down');
  });
  $('.expand-button').click(function () {
    $(this).parent().parent().find('.nested').addClass('expand');
    $(this).parent().parent().find('.caret').addClass('caret-down');
  });
  $('.select-button').click(function () {
    $(this).parent().parent().find('input:checkbox').prop('checked', true);
    $(this).parent().parent().find('input:checkbox').prop('indeterminate', false);
  });
  $('.clear-button').click(function () {
    $(this).parent().parent().find('input:checkbox').prop('checked', false);
    $(this).parent().parent().find('input:checkbox').prop('indeterminate', false);
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
CREATE TABLE ref (title CHAR NOT NULL UNIQUE, value CHAR);
INSERT INTO ref VALUES ("version", "1");

DROP TABLE IF EXISTS ref_category;
CREATE TABLE ref_category (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_color;
CREATE TABLE ref_color (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_composition;
CREATE TABLE ref_composition (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_condition;
CREATE TABLE ref_condition (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_country;
CREATE TABLE ref_country (id INTEGER PRIMARY KEY, parentid INTEGER, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_defect;
CREATE TABLE ref_defect ( id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_edge;
CREATE TABLE ref_edge (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_emitent;
CREATE TABLE ref_emitent (id INTEGER PRIMARY KEY, parentid INTEGER, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_format;
CREATE TABLE ref_format (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_grade;
CREATE TABLE ref_grade (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_grader;
CREATE TABLE ref_grader (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_material;
CREATE TABLE ref_material (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_mint;
CREATE TABLE ref_mint (id INTEGER PRIMARY KEY, parentid INTEGER, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_modification;
CREATE TABLE ref_modification (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_obvrev;
CREATE TABLE ref_obvrev (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_period;
CREATE TABLE ref_period (id INTEGER PRIMARY KEY, parentid INTEGER, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_place;
CREATE TABLE ref_place (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_quality;
CREATE TABLE ref_quality (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_rarity;
CREATE TABLE ref_rarity (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_region;
CREATE TABLE ref_region (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_ruler;
CREATE TABLE ref_ruler (id INTEGER PRIMARY KEY, parentid INTEGER, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_series;
CREATE TABLE ref_series (id INTEGER PRIMARY KEY, parentid INTEGER, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_shape;
CREATE TABLE ref_shape (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_storage;
CREATE TABLE ref_storage (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_technique;
CREATE TABLE ref_technique (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_type;
CREATE TABLE ref_type (id INTEGER PRIMARY KEY, value TEXT, icon BLOB);

DROP TABLE IF EXISTS ref_unit;
CREATE TABLE ref_unit (id INTEGER PRIMARY KEY, parentid INTEGER, value TEXT, icon BLOB);
    `);
}

function createdb(db) {
  create_tables(db);

  var replace_nonlatin = $("#replace-nonlatin").is(":checked") && $("#replace-nonlatin").is(":visible");
  var include_unrecognized = $("#include-unrecognized").is(":checked");
  var include_dependent = $("#include-dependent").is(":checked");
  var include_contemporary = $("#era-contemporary").is(":checked");
  var region_id = 0;
  var insert_regions_sql = "";
  var country_id = 0;
  var insert_countries_sql = "";
  var unit_id = 0;
  var mint_id = 0;
  var insert_units_sql = "";
  regions = $('#countries-references').find('.data-region');
  for (region of regions) {
    if ($(region).is(':checked') || $(region).prop('indeterminate')) {
      region_id++;
      insert_regions_sql += `INSERT INTO ref_region (id, value)
                VALUES (${region_id}, "${$(region).data('value')}");`

      countries = $(region).parent().parent().find('.data-country');
      for (country of countries) {
        if (!include_unrecognized && $(country).hasClass('data-country-unrecognized'))
          continue;
        if (!include_dependent && $(country).hasClass('data-country-dependent'))
          continue;

        if ($(country).is(':checked') || $(country).prop('indeterminate')) {
          img_bytes = flag_images[$(country).attr('id')];

          country_id++;
          text = $(country).data('value');
          if (replace_nonlatin)
            text = slugify(text);
          insert_countries_sql = `INSERT INTO ref_country (id, value, parentid, icon)
                        VALUES (${country_id}, "${text}", ${region_id}, ?);`

          if (img_bytes !== undefined)
            db.run(insert_countries_sql, [img_bytes,]);
          else
            db.run(insert_countries_sql);

          units = $(country).parent().parent().find('.data-unit');
          for (unit of units) {
            if (!include_contemporary && $(unit).hasClass('data-unit-contemporary'))
              continue;

            if ($(unit).is(':checked') || $(unit).prop('indeterminate')) {
              unit_id++;
              text = $(unit).data('value');
              if (replace_nonlatin)
                text = slugify(text);
              insert_units_sql += `INSERT INTO ref_unit (id, value, parentid)
                                VALUES (${unit_id}, "${text}", ${country_id});`
            }
          }

          mints = $(country).parent().parent().find('.data-mint');
          for (mint of mints) {
            if ($(mint).is(':checked') || $(mint).prop('indeterminate')) {
              mint_id++;
              text = $(mint).data('value');
              if (text) {
                insert_units_sql += `INSERT INTO ref_mint (id, value, parentid)
                                    VALUES (${mint_id}, "${text}", ${country_id});`
              }
            }
          }
        }
      }
    }
  }

  db.run(insert_regions_sql);
  //db.run(insert_countries_sql);
  db.run(insert_units_sql);

  insert_references_sql = "";
  references = $('#other-references').find('.data-references');
  for (reference of references) {
    if ($(reference).is(':checked') || $(reference).prop('indeterminate')) {
      var reference_name = $(reference).data('value');
      values = $(reference).parent().parent().find('.data-references-value');
      for (value of values) {
        if ($(value).is(':checked') || $(value).prop('indeterminate')) {
          img_bytes = other_images[$(value).attr('id')];

          insert_references_sql = `INSERT INTO ref_${reference_name} (value, icon)
                        VALUES ("${$(value).parent().text()}", ?);`

          if (img_bytes !== undefined)
            db.run(insert_references_sql, [img_bytes,]);
          else
            db.run(insert_references_sql);
        }
      }
    }
  }
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

$('#savedb').click(function () {
  const config = {locateFile: file => "/javascripts/sql-wasm.wasm"};
  initSqlJs(config).then(function (SQL) {
    // Create the database
    const db = new SQL.Database();

    createdb(db);
    savedb(db, "reference.ref");
  });
});
