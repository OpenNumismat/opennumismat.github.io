var outputElm = document.getElementById('output');
var infoElm = document.getElementById('info');
var imagesElm = document.getElementById('images');
var errorElm = document.getElementById('error');
var statusElm = document.getElementById('status-text');
var dbFileElm = document.getElementById('dbfile');

var scrollPos = 0;
var mainSqlSelect = "SELECT coins.id, images.image, title, status, subjectshort, value, unit, year, mintmark, series FROM coins INNER JOIN images on images.id = coins.image";

// Start the worker in which sql.js will run
var worker = new Worker("js/worker.sql.js");
worker.onerror = error;

// Open a database
worker.postMessage({action:'open'});

function error(e) {
  console.log(e);
	errorElm.style.height = '2em';
	errorElm.textContent = e.message;
}

function noerror() {
	errorElm.style.height = '0';
}

function status(text="") {
    if (text === "") {
        $("#status").hide();
    }
    else {
        statusElm.textContent = text;
        $("#status").show();
    }
}

function filterChanged() {
    filters = [];

    var status = $('select#status').find('option:selected').text();
    if (status !== 'All')
        filters.push("coins.status='" + status + "'");
    var country = $('select#country').find('option:selected').text();
    if (country !== 'All')
        filters.push("coins.country='" + country + "'");
    var series = $('select#series').find('option:selected').text();
    if (series !== 'All')
        filters.push("coins.series='" + series + "'");
    var type = $('select#type').find('option:selected').text();
    if (type !== 'All')
        filters.push("coins.type='" + type + "'");
    var period = $('select#period').find('option:selected').text();
    if (period !== 'All')
        filters.push("coins.period='" + period + "'");

    if (filters.length > 0)
        applyFilter(mainSqlSelect + " WHERE " + filters.join(" AND ") + ";");
    else
        applyFilter(mainSqlSelect + ";");
}

function updateTable() {
    $('tr.row').unbind('click');
    $('tr.row').click(function() {
        scrollPos = document.documentElement.scrollTop;
        showInfo($( this ).attr('data-id'));
    });
    
    $('select.filter').unbind('change');
    $('select.filter').change(filterChanged);
}

// Run a command in the database
function applyFilter(commands) {
	tic();
	worker.onmessage = function(event) {
		var results = event.data.results;
		toc("Executing SQL");

		tic();
        if (results.length > 0) {
            $('div#table').replaceWith(tableCreate(results[0].columns, results[0].values));
            updateTable();
        }

		toc("Displaying results");
        status();
	}
    status("Executing SQL");
	worker.postMessage({action:'exec', sql:commands});
    status("Fetching results");
}

function execute(commands) {
	tic();
	worker.onmessage = function(event) {
		var results = event.data.results;
		toc("Executing SQL");

		tic();

        $('div#filters').empty();
        html = "<table>";
        html += filterCreate('status', 'Status', results[1].values);
        html += filterCreate('country', 'Country', results[2].values);
        html += filterCreate('series', 'Series', results[3].values);
        html += filterCreate('type', 'Type', results[4].values);
        html += filterCreate('period', 'Period', results[5].values);
        html += "</table>";
        $('div#filters').append(html);

        if (results.length > 0) {
            $('div#table').replaceWith(tableCreate(results[0].columns, results[0].values));
            updateTable();
        }

		toc("Displaying results");
        status();
	}
    status("Executing SQL");
	worker.postMessage({action:'exec', sql:commands});
    status("Fetching results");
}

// Create an HTML table
var filterCreate = function () {
  return function (id, label, values){
    var rows = values.map(function(v){ return '<option>' + v[0] + '</option>'});
    var html = '<tr><td><label for="' + id + '">' + label + ':</label></td><td><select class="filter" id="' + id + '"><option>All</option>' + rows.join('') + '</select></td></tr>';
    return html;
  }
}();

var tableCreate = function () {
  return function (columns, values){
    var tbl  = document.createElement('div');
    tbl.setAttribute("id", "table");
    var rows = values.map(function(v) {
        var desc = [];
        if (v[4])
            desc.push(v[4]);
        if (v[5] || v[6])
            desc.push(v[5] + ' ' + v[6]);
        if (v[7])
            desc.push(v[7]);
        if (v[8])
            desc.push(v[8]);
        if (v[9])
            desc.push(v[9]);
        return '<tr class="row" data-id="' + v[0] + '"><td class="image"><img src="data:image/png;base64,' + arrayBufferToBase64(v[1]) + '"></td>\
            <td class="data"><div class="title">' + v[2] + '&nbsp;</div><div class="description">' + desc.join(', ') + '&nbsp;</div></td><td class="status">' + v[3] + '</td></tr>';
    });
    var html = '<table class="table">' + rows.join('') + '</table>';
    tbl.innerHTML = html;
    return tbl;
  }
}();

function showInfo(id) {
	tic();
	worker.onmessage = function(event) {
		var results = event.data.results;
		toc("Executing SQL");

		tic();
		infoElm.appendChild(infoCreate(results[0].values));

        $('div.coin-image').click(function() {
            showImages(id);
        });

		toc("Displaying results");
        status();
	}
    location.hash = "info";
	infoElm.innerHTML = "";
    command = "SELECT coins.title, obverseimg.image, reverseimg.image, status, region, country, period, ruler, value, unit, type, series, subjectshort, issuedate, year, mintage, material, mint, mintmark FROM coins\
        LEFT JOIN photos AS obverseimg ON coins.obverseimg = obverseimg.id\
        LEFT JOIN photos AS reverseimg ON coins.reverseimg = reverseimg.id\
        WHERE coins.id=" + id + ";";
    status("Executing SQL");
	worker.postMessage({action:'exec', sql:command});
    status("Fetching results");
}

var infoCreate = function () {
  return function (values){
    v = values[0];
    var tbl  = document.createElement('div');
    var title = '<h3>' + v[0] +'</h3>';
    var images = '';
    if (v[1])
        images += '<div class="coin-image"><img src="data:image/png;base64,' + arrayBufferToBase64(v[1]) + '"></div>';
    if (v[2])
        images += '<div class="coin-image"><img src="data:image/png;base64,' + arrayBufferToBase64(v[2]) + '"></div>';
    var fields = '<table class="info">';
    if (v[3])
        fields += '<tr><td class="min">Status:</td><td><b>' + v[3] + '</b></td></tr>';
    if (v[4])
        fields += '<tr><td class="min">Region:</td><td><b>' + v[4] + '</b></td></tr>';
    if (v[5])
        fields += '<tr><td class="min">Country:</td><td><b>' + v[5] + '</b></td></tr>';
    if (v[6])
        fields += '<tr><td class="min">Period:</td><td><b>' + v[6] + '</b></td></tr>';
    if (v[7])
        fields += '<tr><td class="min">Ruler:</td><td><b>' + v[7] + '</b></td></tr>';
    if (v[8] || v[9])
        fields += '<tr><td class="min">Denomination:</td><td><b>' + v[8] + ' ' + v[9] + '</b></td></tr>';
    if (v[10])
        fields += '<tr><td class="min">Type:</td><td><b>' + v[10] + '</b></td></tr>';
    if (v[11])
        fields += '<tr><td class="min">Series:</td><td><b>' + v[11] + '</b></td></tr>';
    if (v[12])
        fields += '<tr><td class="min">Subject:</td><td><b>' + v[12] + '</b></td></tr>';
    if (v[13])
        fields += '<tr><td class="min">Date of issue:</td><td><b>' + v[13] + '</b></td></tr>';
    else if (v[14])
        fields += '<tr><td class="min">Year:</td><td><b>' + v[14] + '</b></td></tr>';
    if (v[15])
        fields += '<tr><td class="min">Mintage:</td><td><b>' + v[15] + '</b></td></tr>';
    if (v[16])
        fields += '<tr><td class="min">Material:</td><td><b>' + v[16] + '</b></td></tr>';
    if (v[17])
        fields += '<tr><td class="min">Mint:</td><td><b>' + v[17] + '</b></td></tr>';
    else if (v[18])
        fields += '<tr><td class="min">Mint:</td><td><b>' + v[18] + '</b></td></tr>';
    fields += '</table>';
    var html = title + images + fields;
    tbl.innerHTML = html;
    return tbl;
  }
}();

function showImages(id) {
	tic();
	worker.onmessage = function(event) {
		var results = event.data.results;
		toc("Executing SQL");

		tic();
		for (var i=0; i<results.length; i++) {
			imagesElm.appendChild(imagesCreate(results[i].values));
		}

		toc("Displaying results");
        status();
	}
    location.hash = "images";
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
    status("Executing SQL");
	worker.postMessage({action:'exec', sql:command});
    status("Fetching results");
}

var imagesCreate = function () {
  return function (values){
    v = values[0];
    var tbl  = document.createElement('div');
    var images = '';
    for (var i=0; i<=6; i++) {
        if (v[i])
            images += '<div class="coin-images"><img src="data:image/png;base64,' + arrayBufferToBase64(v[i]) + '"></div>';
    }
    var html = images;
    tbl.innerHTML = html;
    return tbl;
  }
}();

$(window).on('hashchange', function() {
    if (location.hash === "#info") {
        outputElm.style.display = "none";
        imagesElm.style.display = "none";
        infoElm.style.display = "";
    }
    else if (location.hash === "#images") {
        outputElm.style.display = "none";
        infoElm.style.display = "none";
        imagesElm.style.display = "";
    }
    else {
        infoElm.style.display = "none";
        imagesElm.style.display = "none";
        outputElm.style.display = "";
        document.documentElement.scrollTop = scrollPos;
    }
});

// Performance measurement functions
var tictime;
if (!window.performance || !performance.now) {window.performance = {now:Date.now}}
function tic () {tictime = performance.now()}
function toc(msg) {
	var dt = performance.now()-tictime;
	console.log((msg||'toc') + ": " + dt + "ms");
}

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
	var f = dbFileElm.files[0];
	var r = new FileReader();
    location.hash = "";
    $('div#table').empty();
	r.onload = function() {
		worker.onmessage = function () {
			toc("Loading database from file");
            noerror()
            execute (mainSqlSelect + ";\
                SELECT DISTINCT status FROM coins;\
                SELECT DISTINCT country FROM coins;\
                SELECT DISTINCT series FROM coins;\
                SELECT DISTINCT type FROM coins;\
                SELECT DISTINCT period FROM coins;");
		};
		tic();
		try {
			worker.postMessage({action:'open',buffer:r.result}, [r.result]);
		}
		catch(exception) {
			worker.postMessage({action:'open',buffer:r.result});
		}
	}
    status("Loading database from file");
	r.readAsArrayBuffer(f);
}
