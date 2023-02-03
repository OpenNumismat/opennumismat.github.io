if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}

function detectLang() {
    if (localStorage.lang !== undefined) {
        return localStorage.lang;
    }
    else {
        let langcodes = ["de", "pl", "pt", "ru", "uk", "it", "fr", "el", "ca", "nl", "es", "bg", "fa", "tr"];
        let lang = navigator.language || navigator.userLanguage;

        for (const code of langcodes) {
            if (lang.substr(0,2) == code) {
                localStorage.lang = code;
                return code;
            }
        }
    }
    
    return 'en';
}

lang = detectLang();

translations = {
    'en': {'translation': {}},
    'de': {'translation': {}},
    'pl': {'translation': {}},
    'pt': {'translation': {}},
    'ru': {'translation': {}},
    'uk': {'translation': {}},
    'it': {'translation': {}},
    'fr': {'translation': {}},
    'el': {'translation': {}},
    'ca': {'translation': {}},
    'nl': {'translation': {}},
    'es': {'translation': {}},
    'bg': {'translation': {}},
    'fa': {'translation': {}},
    'tr': {'translation': {}}
};

function loadTranslation(lang, func) {
    $.getJSON('i18n/web_i18n_' + lang + '.json', function(data) {
        translations[lang]['translation'] = data;

        func();
    });
}

loadTranslation(lang, function() {
    i18next.init({
      lng: lang,
      resources: translations
    });

    jqueryI18next.init(i18next, $, {
      handleName: 'localize',
      selectorAttr: 'data-i18n'
    });

    $("body").localize();
});

function langChanged() {
    lang = $('select#lang').find('option:selected').val();
    localStorage.lang = lang;

    loadTranslation(lang, function() {
        i18next.changeLanguage(lang);
        $("body").localize();
    });
}

var infoElm = document.getElementById('info');
var imagesElm = document.getElementById('images');
var dbFileElm = document.getElementById('dbfile');

var mainSqlSelect = "SELECT coins.id, images.image, title, status, subjectshort, value, unit, year, mintmark, series, country FROM coins LEFT OUTER JOIN images on images.id = coins.image";
var mainSqlFilter = "";
var mainSqlSort = "";
var mainSqlSearch = "";
const defaultSqlSort = "ORDER BY sort_id";

// Start the worker in which sql.js will run
var worker = new Worker("js/worker.sql-wasm.js");
worker.onerror = errorSql;

// Open a database
worker.postMessage({action:'open'});

function errorSql(e) {
    console.log(e);
    error(e.message);
}

function error(msg) {
    console.log(msg);
    $.mobile.loading( "hide" );
    $("#error p").text(msg);
    $("#error").popup("open");
}

$(document).bind('pageinit', function() {
    $("#error").popup();
});

function status(text="") {
    if (text === "") {
        setTimeout(function() {
            $.mobile.loading( "hide" );
        }, 1);
    }
    else {
        setTimeout(function() {
            $.mobile.loading("show", {
                    text: text,
                    textVisible: true
            });
        }, 1);
    }
}

function filterChanged() {
    var filters = [];

    if ($('select#status').length) {
        var status = $('select#status').find('option:selected').val();
        if (status !== 'all')
            filters.push("coins.status='" + status.replace("'", "''") + "'");
    }
    if ($('select#country').length) {
        var country = $('select#country').find('option:selected').val();
        if (series == '')
            filters.push("ifnull(coins.country,'')=''");
        else if (country !== 'all')
            filters.push("coins.country='" + country.replace("'", "''") + "'");
    }
    if ($('select#series').length) {
        var series = $('select#series').find('option:selected').val();
        if (series == '')
            filters.push("ifnull(coins.series,'')=''");
        else if (series !== 'all')
            filters.push("coins.series='" + series.replace("'", "''") + "'");
    }
    if ($('select#type').length) {
        var type = $('select#type').find('option:selected').val();
        if (series == '')
            filters.push("ifnull(coins.type,'')=''");
        else if (type !== 'all')
            filters.push("coins.type='" + type.replace("'", "''") + "'");
    }
    if ($('select#period').length) {
        var period = $('select#period').find('option:selected').val();
        if (series == '')
            filters.push("ifnull(coins.period,'')=''");
        else if (period !== 'all')
            filters.push("coins.period='" + period.replace("'", "''") + "'");
    }
    if ($('select#mint').length) {
        var mint = $('select#mint').find('option:selected').val();
        if (series == '')
            filters.push("ifnull(coins.mint,'')=''");
        else if (mint !== 'all')
            filters.push("coins.mint='" + mint.replace("'", "''") + "'");
    }

    mainSqlFilter = filters.join(" AND ");
    applyFilter(mainSqlFilter, mainSqlSearch, mainSqlSort);
}

function sortChanged() {
    $("#reverse_sort").prop('checked', false).checkboxradio('refresh');

    var field = $('select#sort').find('option:selected').val();
    if (field !== 'none')
        mainSqlSort = "ORDER BY " + field;
    else
        mainSqlSort = defaultSqlSort;
    applyFilter(mainSqlFilter, mainSqlSearch, mainSqlSort);
}

function reverseChanged() {
    let order = "";
    if ($('#reverse_sort').is(':checked'))
        order = " DESC";

    var field = $('select#sort').find('option:selected').val();
    if (field !== 'none')
        mainSqlSort = "ORDER BY " + field + order;
    else
        mainSqlSort = defaultSqlSort + order;
    applyFilter(mainSqlFilter, mainSqlSearch, mainSqlSort);
}

function searchChanged() {
    var search = $('#search-basic').val().trim();
    console.log(search)
    if (search == '')
        mainSqlSearch = "";
    else
        mainSqlSearch = "title LIKE '%" + search + "%'";
    
    applyFilter(mainSqlFilter, mainSqlSearch, mainSqlSort);
}

function updateTable() {
    $('tr.row').unbind('click');
    $('tr.row').click(function() {
        showInfo($( this ).attr('data-id'));
    });
}

// Run a command in the database
function applyFilter(filter, search, sort) {
    command = mainSqlSelect;
    if (filter != "")
        command += " WHERE " + filter;
    if (search != "")
        if (filter != "")
            command += " AND " + search;
        else
            command += " WHERE " + search;
    command += " " + sort + ";";
    
    console.log(command)
	worker.onmessage = function(event) {
		var results = event.data.results;

        $('div#table').empty();
        if (results.length > 0) {
            $('div#table').append(tableCreate(results[0].columns, results[0].values));
        }
        updateTable();

        status();
	}
    status(i18next.t('exec_sql'));
	worker.postMessage({action:'exec', sql:command});
    status(i18next.t('build_table'));
}

function convertFraction(value) {
    if (collectionSettings.convert_fraction) {
        if (value == 0.04)
            return '1/24';
        else if (value == 0.06)
            return '1/16';
        else if (value == 0.08)
            return '1/12';
        else if (value == 0.1)
            return '⅒';
        else if (value == 0.12)
            return '⅛';
        else if (value == 0.16)
            return '⅙';
        else if (value == 0.2)
            return '⅕';
        else if (value == 0.25)
            return '¼';
        else if (value == 0.33)
            return '⅓';
        else if (value == 0.5)
            return '½';
        else if (value == 0.66)
            return '⅔';
        else if (value == 0.75)
            return '¾';
        else if (value == 1.25)
            return '1¼';
        else if (value == 1.5)
            return '1½';
        else if (value == 2.5)
            return '2½';
        else if (value == 7.5)
            return '7½';
        else if (value == 12.5)
            return '12½';
    }

    return value;
}

var collectionSettings = {};

function initSettings() {
    collectionSettings.version = 0;
    collectionSettings.password = '';
    collectionSettings.type = '';
    collectionSettings.convert_fraction = true;
    collectionSettings.enable_bc = true;
}

function readSettings() {
    initSettings();

	sql = "SELECT * FROM settings;";

	worker.onmessage = function(event) {
		var results = event.data.results;
        
        v = results[0].values;
        v.forEach(function(elem) {
            if (elem[0] === 'Version')
                collectionSettings.version = Number(elem[1]);
            else if (elem[0] === 'Password')
                collectionSettings.password = elem[1];
            else if (elem[0] === 'Type')
                collectionSettings.type = elem[1];
            else if (elem[0] === 'convert_fraction')
                collectionSettings.convert_fraction = Boolean(elem[1]);
            else if (elem[0] === 'enable_bc')
                collectionSettings.enable_bc = Boolean(elem[1]);
        })
        
		status();
        
        if (checkVersion())
            checkPassword()
	}

    status(i18next.t('exec_sql'));
	worker.postMessage({action:'exec', sql:sql});
}

function checkVersion() {
    if (collectionSettings.type != 'OpenNumismat') {
        error(i18next.t('wrong_version'));
        return false;
    }

    if (collectionSettings.version < 6) {
        error(i18next.t('old_version'));
        return false;
    }
    else if (collectionSettings.version > 8) {
        error(i18next.t('newest_version'));
    }

    return true;
}

function MD5(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()}function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

function checkPassword() {
    var hashed_password = collectionSettings.password;

    if (MD5('') == hashed_password) {
        execute();
    }
    else {
        $("#popupPassword").on({
            popupafterclose: function(event, ui) {
                var password = $("#pw").val();
                $("#pw").val('');
                if (MD5(password) == hashed_password) {
                    execute();
                }
                else {
                    error(i18next.t('wrong_password'));
                }
            }
        });
        $("#popupPassword").popup().popup("open");
    }
}

function materialFilter(vals) {
    filters = []
    vals.forEach(function(val) {
        filters.push("'" + val.toUpperCase() + "'");
        filters.push("'" + val.toLowerCase() + "'");
        filters.push("'" + val.charAt(0).toUpperCase() + val.slice(1) + "'");
    });
    return "material IN (" + filters.join(",") + ")";
}

function fillSummary() {
    const gold_filter = materialFilter(['Gold', i18next.t('Gold'), 'Au']);
    const silver_filter = materialFilter(['Silver', i18next.t('Silver'), 'Ag']);
	const sql = "SELECT count(*) FROM coins;" +
          "SELECT count(*) FROM coins WHERE status IN ('owned', 'ordered', 'sale', 'duplicate');" +
          "SELECT count(*) FROM coins WHERE status='wish';" +
          "SELECT count(*) FROM coins WHERE status='sold';" +
          "SELECT count(*) FROM coins WHERE status='bidding';" +
          "SELECT count(*) FROM coins WHERE status='missing';" +
          "SELECT SUM(totalpayprice) FROM coins WHERE status IN ('owned', 'ordered', 'sale', 'sold', 'missing', 'duplicate') AND totalpayprice<>'' AND totalpayprice IS NOT NULL;" +
          "SELECT SUM(payprice) FROM coins WHERE status IN ('owned', 'ordered', 'sale', 'sold', 'missing', 'duplicate') AND payprice<>'' AND payprice IS NOT NULL;" +
          "SELECT paydate FROM coins WHERE status IN ('owned', 'ordered', 'sale', 'sold', 'missing', 'duplicate') AND paydate<>'' AND paydate IS NOT NULL ORDER BY paydate LIMIT 1;" +
          "SELECT count(*) FROM coins WHERE status IN ('owned', 'ordered', 'sale', 'duplicate') AND " + gold_filter + ";" +
          "SELECT count(*) FROM coins WHERE status IN ('owned', 'ordered', 'sale', 'duplicate') AND " + silver_filter + ";";

	worker.onmessage = function(event) {
		var results = event.data.results;

        v = results[0].values[0];
        html = i18next.t('total_count') + ': ' + v + '<br>';
        count_owned = results[1].values[0];
        if (count_owned > 0)
            html += i18next.t('count_owned') + ': ' + count_owned + '<br>';
        v = results[9].values[0];
        if (v > 0)
            html += i18next.t('gold_coins') + ': ' + v + '<br>';
        v = results[10].values[0];
        if (v > 0)
            html += i18next.t('silver_coins') + ': ' + v + '<br>';
        v = results[2].values[0];
        if (v > 0)
            html += i18next.t('count_wish') + ': ' + v + '<br>';
        v = results[3].values[0];
        if (v > 0)
            html += i18next.t('count_sold') + ': ' + v + '<br>';
        v = results[4].values[0];
        if (v > 0)
            html += i18next.t('count_bidding') + ': ' + v + '<br>';
        v = results[5].values[0];
        if (v > 0)
            html += i18next.t('count_missing') + ': ' + v + '<br>';
        paid = results[6].values[0];
        if (paid > 0) {
            commission = '';
            paid_without_commission = results[7].values[0];
            if (paid_without_commission > 0)
                commission = ' (' + i18next.t('commission') + ': ' + Math.round((paid - paid_without_commission) / paid_without_commission * 100) + '%)';

            html += i18next.t('paid') + ': ' + paid.toLocaleString(undefined, {maximumFractionDigits: 2}) + commission + '<br>';
            
            if (count_owned > 0)
                html += i18next.t('average_paid') + ': ' + (paid/count_owned).toLocaleString(undefined, {maximumFractionDigits: 2}) + '<br>';
        }
        if (results[8].values.length > 1) {
            date = new Date(results[8].values[0]);
            html += i18next.t('first_purchase') + ': ' + date.toLocaleDateString() + '<br>';
        }

        $('div#summary').append(html);
        
		status();
	}

    status(i18next.t('exec_sql'));
	worker.postMessage({action:'exec', sql:sql});
    status(i18next.t('build_table'));
}

$('#summary-page').on('pagebeforeshow',function(event, ui) {
  $('div#summary').empty();
});

$('#summary-page').on('pageshow',function(event, ui) {
  fillSummary();
});

function execute() {
	sql = mainSqlSelect + " " + mainSqlSort + ";\
				SELECT DISTINCT status FROM coins;\
				SELECT DISTINCT IFNULL(country,'') FROM coins;\
				SELECT DISTINCT IFNULL(series,'') FROM coins;\
				SELECT DISTINCT IFNULL(type,'') FROM coins;\
				SELECT DISTINCT IFNULL(period,'') FROM coins;\
				SELECT DISTINCT IFNULL(mint,'') FROM coins;";

	worker.onmessage = function(event) {
		var results = event.data.results;

        $('div#sort').empty();
        html = '<table><tr><td><label for="sort">' + i18next.t('sort_by') + ':</label></td><td><select data-mini="true" data-inline="true" class="sort" id="sort">';
        html += '<option value="none">' + i18next.t('None') + '</option>';
        html += '<option value="title">' + i18next.t('Title') + '</option>';
        if (results[1].values.length > 1)
            html += '<option value="status">' + i18next.t('status') + '</option>';
        if (results[2].values.length > 1)
            html += '<option value="country">' + i18next.t('country') + '</option>';
        html += '<option value="year">' + i18next.t('year') + '</option>';
        if (results[3].values.length > 1)
            html += '<option value="series">' + i18next.t('series') + '</option>';
        if (results[4].values.length > 1)
            html += '<option value="type">' + i18next.t('type') + '</option>';
        if (results[5].values.length > 1)
            html += '<option value="period">' + i18next.t('period') + '</option>';
        html += '</select></td></tr></table><div><label><input data-mini="true" type="checkbox" id="reverse_sort">' + i18next.t('reverse') + '</label></div>';
        $('div#sort').append(html);
        $('select.sort').change(sortChanged);
        $('select.sort').selectmenu();
        $('#reverse_sort').change(reverseChanged);
        $('#reverse_sort').checkboxradio();

        $('div#filters').empty();
        html = "<table>";
        html += i18nFilterCreate('status', results[1].values);
        results[2].values.sort();
        html += filterCreate('country', results[2].values);
        results[3].values.sort();
        html += filterCreate('series', results[3].values);
        html += filterCreate('type', results[4].values);
        results[5].values.sort();
        html += filterCreate('period', results[5].values);
        results[6].values.sort();
        html += filterCreate('mint', results[6].values);
        html += "</table>";
        $('div#filters').append(html);
        $('select.filter').change(filterChanged);
        $('select.filter').selectmenu();

        $('div#search').empty();
        html = "<input type='search' name='search' id='search-basic' data-mini='true' value='' />";
        $('div#search').append(html);
        $('#search-basic').change(searchChanged);
        $('#search-basic').textinput();

        $('div#table').empty();
        if (results.length > 0) {
            $('div#table').append(tableCreate(results[0].columns, results[0].values));
            updateTable();
        }

        status();
        
        $('.summary-button').css("display", "block");
	}
    status(i18next.t('exec_sql'));
	worker.postMessage({action:'exec', sql:sql});
    status(i18next.t('build_table'));
}

// Create an HTML table
var filterCreate = function () {
  return function (id, values){
    if (values.length > 1) {
      var label = i18next.t(id);
      var rows = values.map(function(v){ return '<option>' + v[0] + '</option>'});
      return '<tr><td><label for="' + id + '">' + label + ':</label></td><td><select data-mini="true" data-inline="true" class="filter" id="' + id + '"><option value="all">' + i18next.t('All') + '</option>' + rows.join('') + '</select></td></tr>';
    }
    return '';
  }
}();

var i18nFilterCreate = function () {
  return function (id, values){
    if (values.length > 1) {
      var label = i18next.t(id);
      var rows = values.map(function(v){ return '<option value="' + v[0] + '">' + i18next.t(v[0]) + '</option>'});
      return '<tr><td><label for="' + id + '">' + label + ':</label></td><td><select data-mini="true" data-inline="true" class="filter" id="' + id + '"><option value="all">' + i18next.t('All') + '</option>' + rows.join('') + '</select></td></tr>';
    }
    return '';
  }
}();

var tableCreate = function (columns, values) {
    var rows = values.map(function(v) {
        var desc = [];
        if (v[4])
            desc.push(v[4]);
        if (v[5] || v[6])
            desc.push(convertFraction(v[5]) + ' ' + v[6]);
        if (v[10])
            desc.push(v[10]);
        if (v[7]) {
            if (v[7] < 0 && collectionSettings.enable_bc)
                desc.push((-v[7]) + '&nbsp;' + i18next.t('BC'));
            else
                desc.push(v[7]);
        }
        if (v[8])
            desc.push(v[8]);
        if (v[9])
            desc.push(v[9]);
        return '<tr class="row" data-id="' + v[0] + '"><td class="image"><img src="data:image/png;base64,' + arrayBufferToBase64(v[1]) + '"></td>\
            <td class="data"><div class="title">' + v[2] + '&nbsp;</div><div class="description">' + desc.join(', ') + '&nbsp;</div></td><td class="status-' + getStatusView() + '">' + htmlStatusView(v[3]) + '</td></tr>';
    });
    var html = '<table class="table">' + rows.join('') + '</table>';
    return html;
}

const infoFields = ['coins.title', 'obverseimg.image', 'reverseimg.image',
    'status', 'region', 'country', 'period', 'ruler', 'value', 'unit', 'type',
    'series', 'subjectshort', 'issuedate', 'year', 'mintage', 'material',
    'mint', 'mintmark', 'features', 'subject'];
function infoFieldIndex(field) {
    return infoFields.findIndex(element => element === field);
}
const infoFieldsToSql = infoFields.join(',');

function showInfo(id) {
	worker.onmessage = function(event) {
		var results = event.data.results;

		infoElm.appendChild(infoCreate(results[0].values));

        $('div.coin-image').click(function() {
            showImages(id);
        });

        status();
	}
    $.mobile.navigate("#info-page");
	infoElm.innerHTML = "";
    command = "SELECT " + infoFieldsToSql + " FROM coins\
        LEFT JOIN photos AS obverseimg ON coins.obverseimg = obverseimg.id\
        LEFT JOIN photos AS reverseimg ON coins.reverseimg = reverseimg.id\
        WHERE coins.id=" + id + ";";
    status(i18next.t('exec_sql'));
	worker.postMessage({action:'exec', sql:command});
    status(i18next.t('build_table'));
}

var infoCreate = function () {
  return function (values){
    v = values[0];
    var tbl  = document.createElement('div');
    var title = '<h3>' + v[infoFieldIndex('coins.title')] +'</h3>';
    var images = '';

    $('#info-page-title').text(v[infoFieldIndex('coins.title')]);
    $('#images-page-title').text(v[infoFieldIndex('coins.title')]);

    if (v[infoFieldIndex('obverseimg.image')])
        images += '<div class="coin-image"><img src="data:image/png;base64,' + arrayBufferToBase64(v[infoFieldIndex('obverseimg.image')]) + '"></div>';
    if (v[infoFieldIndex('reverseimg.image')])
        images += '<div class="coin-image"><img src="data:image/png;base64,' + arrayBufferToBase64(v[infoFieldIndex('reverseimg.image')]) + '"></div>';
    var fields = '<table class="info">';
    if (v[infoFieldIndex('status')])
        fields += '<tr><th>' + i18next.t('status') + ':</th><td><b>' + htmlStatusViewFull(v[infoFieldIndex('status')]) + '</b></td></tr>';
    if (v[infoFieldIndex('region')])
        fields += '<tr><th>' + i18next.t('region') + ':</th><td><b>' + v[infoFieldIndex('region')] + '</b></td></tr>';
    if (v[infoFieldIndex('country')])
        fields += '<tr><th>' + i18next.t('country') + ':</th><td><b>' + v[infoFieldIndex('country')] + '</b></td></tr>';
    if (v[infoFieldIndex('period')])
        fields += '<tr><th>' + i18next.t('period') + ':</th><td><b>' + v[infoFieldIndex('period')] + '</b></td></tr>';
    if (v[infoFieldIndex('ruler')])
        fields += '<tr><th>' + i18next.t('ruler') + ':</th><td><b>' + v[infoFieldIndex('ruler')] + '</b></td></tr>';
    if (v[infoFieldIndex('value')] || v[infoFieldIndex('unit')])
        fields += '<tr><th>' + i18next.t('denomination') + ':</th><td><b>' + convertFraction(v[infoFieldIndex('value')]) + '&nbsp;' + v[infoFieldIndex('unit')] + '</b></td></tr>';
    if (v[infoFieldIndex('type')])
        fields += '<tr><th>' + i18next.t('type') + ':</th><td><b>' + v[infoFieldIndex('type')] + '</b></td></tr>';
    if (v[infoFieldIndex('series')])
        fields += '<tr><th>' + i18next.t('series') + ':</th><td><b>' + v[infoFieldIndex('series')] + '</b></td></tr>';
    if (v[infoFieldIndex('subjectshort')])
        fields += '<tr><th>' + i18next.t('subject') + ':</th><td><b>' + v[infoFieldIndex('subjectshort')] + '</b></td></tr>';
    if (v[infoFieldIndex('issuedate')]) {
        date = new Date(v[infoFieldIndex('issuedate')]);
        fields += '<tr><th>' + i18next.t('date_issue') + ':</th><td><b>' + date.toLocaleDateString() + '</b></td></tr>';
    }
    else if (v[infoFieldIndex('year')]) {
        if (v[infoFieldIndex('year')] < 0 && collectionSettings.enable_bc)
            fields += '<tr><th>' + i18next.t('year') + ':</th><td><b>' + (-v[infoFieldIndex('year')]) + '&nbsp;' + i18next.t('BC') + '</b></td></tr>';
        else
            fields += '<tr><th>' + i18next.t('year') + ':</th><td><b>' + v[infoFieldIndex('year')] + '</b></td></tr>';
    }
    if (v[infoFieldIndex('mintage')])
        fields += '<tr><th>' + i18next.t('mintage') + ':</th><td><b>' + v[infoFieldIndex('mintage')].toLocaleString() + '</b></td></tr>';
    if (v[infoFieldIndex('material')])
        fields += '<tr><th>' + i18next.t('material') + ':</th><td><b>' + v[infoFieldIndex('material')] + '</b></td></tr>';
    if (v[infoFieldIndex('mint')] && v[infoFieldIndex('mintmark')])
        fields += '<tr><th>' + i18next.t('mint') + ':</th><td><b>' + v[infoFieldIndex('mint')] + ' (' + v[infoFieldIndex('mintmark')] + ')</b></td></tr>';
    else if (v[infoFieldIndex('mint')])
        fields += '<tr><th>' + i18next.t('mint') + ':</th><td><b>' + v[infoFieldIndex('mint')] + '</b></td></tr>';
    else if (v[infoFieldIndex('mintmark')])
        fields += '<tr><th>' + i18next.t('mint') + ':</th><td><b>' + v[infoFieldIndex('mintmark')] + '</b></td></tr>';
    fields += '</table>';

    var info = '';
    if (v[infoFieldIndex('features')])
        info += '<div class="coin-info">' + v[infoFieldIndex('features')] + '</div>';
    if (v[infoFieldIndex('subject')])
        info += '<div class="coin-info">' + v[infoFieldIndex('subject')] + '</div>';

    var html = title + images + fields + info;
    tbl.innerHTML = html;
    return tbl;
  }
}();

function showImages(id) {
	worker.onmessage = function(event) {
		var results = event.data.results;

		for (var i=0; i<results.length; i++) {
			imagesElm.appendChild(imagesCreate(results[i].values));
		}

        status();
	}
    $.mobile.navigate("#images-page");
    imagesElm.innerHTML = "";
    command = "SELECT obverseimg.image, reverseimg.image, edgeimg.image, photo1.image, photo2.image, photo3.image, photo4.image FROM coins\
        LEFT JOIN photos AS obverseimg ON coins.obverseimg = obverseimg.id\
        LEFT JOIN photos AS reverseimg ON coins.reverseimg = reverseimg.id\
        LEFT JOIN photos AS edgeimg ON coins.edgeimg = edgeimg.id\
        LEFT JOIN photos AS photo1 ON coins.photo1 = photo1.id\
        LEFT JOIN photos AS photo2 ON coins.photo2 = photo2.id\
        LEFT JOIN photos AS photo3 ON coins.photo3 = photo3.id\
        LEFT JOIN photos AS photo4 ON coins.photo4 = photo4.id\
        WHERE coins.id=" + id + ";";
    status(i18next.t('exec_sql'));
	worker.postMessage({action:'exec', sql:command});
    status(i18next.t('build_table'));
}

function newTabImage(img) {
    var image = new Image();
    image.src = img;

    var w = window.open("",'_blank');
    w.document.write(image.outerHTML);
    w.document.close();
}

var imagesCreate = function () {
  return function (values){
    v = values[0];
    var tbl  = document.createElement('div');
    var images = '';
    for (var i=0; i<=6; i++) {
        if (v[i])
            images += '<div class="coin-images"><img onclick="newTabImage(this.src)" src="data:image/png;base64,' + arrayBufferToBase64(v[i]) + '"></div>';
    }
    var html = images;
    tbl.innerHTML = html;
    return tbl;
  }
}();

function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

// Load a db from a file
dbFileElm.onchange = function() {
    file = dbFileElm.files[0];
    if (file !== undefined) {
        $.mobile.navigate("#main-page");

        $('.summary-button').css("display", "none");
        $('#main-page-title').text(file.name);
        dbFileElm.value = '';

        var r = new FileReader();
        $('div#table').empty();
        $('div#filters').empty();
        mainSqlFilter = "";
        $('div#sort').empty();
        mainSqlSort = defaultSqlSort;
        $('div#search').empty();
        mainSqlSearch = "";
        r.onload = function(e) {
            worker.onmessage = function () {
				readSettings();
            };
            try {
                worker.postMessage({action:'open',buffer:r.result}, [r.result]);
            }
            catch(exception) {
                worker.postMessage({action:'open',buffer:r.result});
            }
        };
        r.onerror = function() {
            error(i18next.t('failed_read_file') + " " + file.name + "<br>" + r.error);
        };
        status(i18next.t('load_db'));
        r.readAsArrayBuffer(file);
    }
}

function showDensity() {
    if (window.devicePixelRatio < 1.5)
        density = "MDPI";
    else if (window.devicePixelRatio < 2)
        density = "HDPI";
    else if (window.devicePixelRatio < 2.5)
        density = "XHDPI";
    else if (window.devicePixelRatio < 3.5)
        density = "XXHDPI";
    else
        density = "XXXHDPI";
    $("#density").text(i18next.t('density') + density);
}

showDensity();

$('select.lang').val(lang);
$('select.lang').change(langChanged);
$('select.lang').selectmenu();

function htmlStatusIcon(status) {
    return "<img src='img/" + status + ".png' class='status-icon' title='" + i18next.t(status) + "'>";
}

function htmlStatusViewFull(status) {
    return htmlStatusIcon(status) + i18next.t(status);
}

function htmlStatusView(status) {
    const status_view = getStatusView();
    if (status_view == 'full')
        return htmlStatusViewFull(status);
    else if (status_view == 'icon')
        return htmlStatusIcon(status);
    return i18next.t(status);
}

function getStatusView() {
    if (localStorage.status_view !== undefined) {
        return localStorage.status_view;
    }
    
    return 'text';
}

function changedStatusView() {
    let status_view = $('#status_view :checked').val();
    localStorage.status_view = status_view;
}

let status_view = getStatusView();
if (status_view == 'full')
    $("#status_view_full").attr("checked", true);
else if (status_view == 'icon')
    $("#status_view_icon").attr("checked", true);
else
    $("#status_view_text").attr("checked", true);

$('#status_view').checkboxradio();
$('#status_view').change(changedStatusView);

$('.summary-button').css("display", "none");
