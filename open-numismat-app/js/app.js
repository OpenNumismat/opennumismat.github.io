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
        let lang = navigator.language || navigator.userLanguage;;

        for (const code of langcodes) {
            if (lang.substr(0,2) == code) {
                localStorage.lang = code;
                return code;
            }
        }
    }
    
    return 'en';
}

i18next.init({
  lng: detectLang(),
  resources: translations
});

jqueryI18next.init(i18next, $, {
  handleName: 'localize',
  selectorAttr: 'data-i18n'
});

$("body").localize();

var infoElm = document.getElementById('info');
var imagesElm = document.getElementById('images');
var dbFileElm = document.getElementById('dbfile');

var mainSqlSelect = "SELECT coins.id, images.image, title, status, subjectshort, value, unit, year, mintmark, series FROM coins LEFT OUTER JOIN images on images.id = coins.image";
var mainSqlFilter = "";
var mainSqlSort = "";
const defaultSqlSort = " ORDER BY sort_id";

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
        if (country !== 'all')
            filters.push("coins.country='" + country.replace("'", "''") + "'");
    }
    if ($('select#series').length) {
        var series = $('select#series').find('option:selected').val();
        if (series !== 'all')
            filters.push("coins.series='" + series.replace("'", "''") + "'");
    }
    if ($('select#type').length) {
        var type = $('select#type').find('option:selected').val();
        if (type !== 'all')
            filters.push("coins.type='" + type.replace("'", "''") + "'");
    }
    if ($('select#period').length) {
        var period = $('select#period').find('option:selected').val();
        if (period !== 'all')
            filters.push("coins.period='" + period.replace("'", "''") + "'");
    }
    if ($('select#mint').length) {
        var mint = $('select#mint').find('option:selected').val();
        if (mint !== 'all')
            filters.push("coins.mint='" + mint.replace("'", "''") + "'");
    }

    if (filters.length > 0)
        mainSqlFilter = " WHERE " + filters.join(" AND ");
    else
        mainSqlFilter = "";
    applyFilter(mainSqlSelect + mainSqlFilter + mainSqlSort + ";");
}

function sortChanged() {
    $("#reverse_sort").prop('checked', false).checkboxradio('refresh');

    var field = $('select#sort').find('option:selected').val();
    if (field !== 'none')
        mainSqlSort = " ORDER BY " + field;
    else
        mainSqlSort = defaultSqlSort;
    applyFilter(mainSqlSelect + mainSqlFilter + mainSqlSort + ";");
}

function reverseChanged() {
    let order = "";
    if ($('#reverse_sort').is(':checked'))
        order = " DESC";

    var field = $('select#sort').find('option:selected').val();
    if (field !== 'none')
        mainSqlSort = " ORDER BY " + field + order;
    else
        mainSqlSort = defaultSqlSort + order;
    applyFilter(mainSqlSelect + mainSqlFilter + mainSqlSort + ";");
}

function updateTable() {
    $('tr.row').unbind('click');
    $('tr.row').click(function() {
        showInfo($( this ).attr('data-id'));
    });
}

// Run a command in the database
function applyFilter(commands) {
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
	worker.postMessage({action:'exec', sql:commands});
    status(i18next.t('build_table'));
}

function checkVersion() {
	sql = "SELECT value FROM settings WHERE title='Version';";

	worker.onmessage = function(event) {
		var results = event.data.results;
		var version = Number(results[0].values[0][0]);

		status();
			
		if (version < 6)
			error(i18next.t('old_version'));
		else
			checkPassword();
	}

    status(i18next.t('exec_sql'));
	worker.postMessage({action:'exec', sql:sql});
}

function MD5(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

function checkPassword() {
	sql = "SELECT value FROM settings WHERE title='Password';";

	worker.onmessage = function(event) {
		var results = event.data.results;
		var hashed_password = results[0].values[0][0];

		status();

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

    status(i18next.t('exec_sql'));
	worker.postMessage({action:'exec', sql:sql});
}

function execute() {
	sql = mainSqlSelect + ";\
				SELECT DISTINCT status FROM coins;\
				SELECT DISTINCT country FROM coins;\
				SELECT DISTINCT series FROM coins;\
				SELECT DISTINCT type FROM coins;\
				SELECT DISTINCT period FROM coins;\
				SELECT DISTINCT mint FROM coins;";

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
        html += filterCreate('country', results[2].values);
        html += filterCreate('series', results[3].values);
        html += filterCreate('type', results[4].values);
        html += filterCreate('period', results[5].values);
        html += filterCreate('mint', results[6].values);
        html += "</table>";
        $('div#filters').append(html);
        $('select.filter').change(filterChanged);
        $('select.filter').selectmenu();

        $('div#table').empty();
        if (results.length > 0) {
            $('div#table').append(tableCreate(results[0].columns, results[0].values));
            updateTable();
        }

        status();
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

var tableCreate = function () {
  return function (columns, values){
    var rows = values.map(function(v) {
        var desc = [];
        if (v[4])
            desc.push(v[4]);
        if (v[5] || v[6])
            desc.push(v[5] + ' ' + v[6]);
        if (v[7]) {
            if (v[7] < 0)
                desc.push((-v[7]) + '&nbsp;' + i18next.t("BC"));
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
}();

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
    command = "SELECT coins.title, obverseimg.image, reverseimg.image, status, region, country, period, ruler, value, unit, type, series, subjectshort, issuedate, year, mintage, material, mint, mintmark, features, subject FROM coins\
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
    var title = '<h3>' + v[0] +'</h3>';
    var images = '';

    $('#info-page-title').text(v[0]);
    $('#images-page-title').text(v[0]);

    if (v[1])
        images += '<div class="coin-image"><img src="data:image/png;base64,' + arrayBufferToBase64(v[1]) + '"></div>';
    if (v[2])
        images += '<div class="coin-image"><img src="data:image/png;base64,' + arrayBufferToBase64(v[2]) + '"></div>';
    var fields = '<table class="info">';
    if (v[3])
        fields += '<tr><th>' + i18next.t('status') + ':</th><td><b>' + htmlStatusViewFull(v[3]) + '</b></td></tr>';
    if (v[4])
        fields += '<tr><th>' + i18next.t('region') + ':</th><td><b>' + v[4] + '</b></td></tr>';
    if (v[5])
        fields += '<tr><th>' + i18next.t('country') + ':</th><td><b>' + v[5] + '</b></td></tr>';
    if (v[6])
        fields += '<tr><th>' + i18next.t('period') + ':</th><td><b>' + v[6] + '</b></td></tr>';
    if (v[7])
        fields += '<tr><th>' + i18next.t('ruler') + ':</th><td><b>' + v[7] + '</b></td></tr>';
    if (v[8] || v[9])
        fields += '<tr><th>' + i18next.t('denomination') + ':</th><td><b>' + v[8] + ' ' + v[9] + '</b></td></tr>';
    if (v[10])
        fields += '<tr><th>' + i18next.t('type') + ':</th><td><b>' + v[10] + '</b></td></tr>';
    if (v[11])
        fields += '<tr><th>' + i18next.t('series') + ':</th><td><b>' + v[11] + '</b></td></tr>';
    if (v[12])
        fields += '<tr><th>' + i18next.t('subject') + ':</th><td><b>' + v[12] + '</b></td></tr>';
    if (v[13])
        fields += '<tr><th>' + i18next.t('date_issue') + ':</th><td><b>' + v[13] + '</b></td></tr>';
    else if (v[14]) {
        if (v[14] < 0)
            fields += '<tr><th>' + i18next.t('year') + ':</th><td><b>' + (-v[14]) + '&nbsp;' + i18next.t('BC') + '</b></td></tr>';
        else
            fields += '<tr><th>' + i18next.t('year') + ':</th><td><b>' + v[14] + '</b></td></tr>';
    }
    if (v[15])
        fields += '<tr><th>' + i18next.t('mintage') + ':</th><td><b>' + v[15] + '</b></td></tr>';
    if (v[16])
        fields += '<tr><th>' + i18next.t('material') + ':</th><td><b>' + v[16] + '</b></td></tr>';
    if (v[17] && v[18])
        fields += '<tr><th>' + i18next.t('mint') + ':</th><td><b>' + v[17] + ' (' + v[18] + ')</b></td></tr>';
    else if (v[17])
        fields += '<tr><th>' + i18next.t('mint') + ':</th><td><b>' + v[17] + '</b></td></tr>';
    else if (v[18])
        fields += '<tr><th>' + i18next.t('mint') + ':</th><td><b>' + v[18] + '</b></td></tr>';
    fields += '</table>';

    var info = '';
    if (v[19])
        info += '<div class="coin-info">' + v[19] + '</div>';
    if (v[20])
        info += '<div class="coin-info">' + v[20] + '</div>';

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

        $('#main-page-title').text(file.name);
        dbFileElm.value = '';

        var r = new FileReader();
        $('div#table').empty();
        $('div#filters').empty();
        mainSqlFilter = "";
        $('div#sort').empty();
        mainSqlSort = "";
        r.onload = function(e) {
            worker.onmessage = function () {
				checkVersion();
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

function langChanged() {
    let lang = $('select#lang').find('option:selected').val();
    localStorage.lang = lang;

    i18next.changeLanguage(lang);
    $("body").localize();
}

$('select.lang').val(detectLang());
$('select.lang').change(langChanged);
$('select.lang').selectmenu();

function htmlStatusIcon(status) {
    return "<img src='../img/" + status + ".png' class='status-icon' title='" + i18next.t(status) + "'>";
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
