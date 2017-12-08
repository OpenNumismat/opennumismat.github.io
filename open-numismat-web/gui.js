var outputElm = document.getElementById('output');
var infoElm = document.getElementById('info');
var imagesElm = document.getElementById('images');
var errorElm = document.getElementById('error');
var dbFileElm = document.getElementById('dbfile');

var scrollPos = 0;

// Start the worker in which sql.js will run
var worker = new Worker("js/worker.sql.js");
worker.onerror = error;

// Open a database
worker.postMessage({action:'open'});

// Connect to the HTML element we 'print' to
function print(text) {
    outputElm.innerHTML = text.replace(/\n/g, '<br>');
}
function error(e) {
  console.log(e);
	errorElm.style.height = '2em';
	errorElm.textContent = e.message;
}

function noerror() {
		errorElm.style.height = '0';
}

// Run a command in the database
function execute(commands) {
	tic();
	worker.onmessage = function(event) {
		var results = event.data.results;
		toc("Executing SQL");

		tic();
		outputElm.innerHTML = "";
		for (var i=0; i<results.length; i++) {
			outputElm.appendChild(tableCreate(results[i].columns, results[i].values));
		}

        $('tr.row').click(function() {
            scrollPos = document.documentElement.scrollTop;
            showInfo($( this ).attr('data-id'));
        });

		toc("Displaying results");
	}
	worker.postMessage({action:'exec', sql:commands});
	outputElm.textContent = "Fetching results...";
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

// Create an HTML table
var tableCreate = function () {
  return function (columns, values){
    var tbl  = document.createElement('table');
    tbl.className = "table";
    var rows = values.map(function(v){ return '<tr class="row" data-id="' + v[0] + '"><td class="min"><img src="data:image/png;base64,' + arrayBufferToBase64(v[1]) + '"></td><td>' + v[2] + '</td><td class="min">' + v[3] + '</td></tr>'; });
    var html = '<tbody>' + rows.join('') + '</tbody>';
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
		infoElm.innerHTML = "";
		infoElm.appendChild(infoCreate(results[0].columns, results[0].values));

        $('div.coin-image').click(function() {
            showImages(id);
        });

		toc("Displaying results");
	}
    location.hash = "info";
    command = "SELECT coins.title, obverseimg.image, reverseimg.image, status, region, country, period, ruler, value, unit, type, series, subjectshort, issuedate, year, mintage, material, mint, mintmark FROM coins\
        LEFT JOIN photos AS obverseimg ON coins.obverseimg = obverseimg.id\
        LEFT JOIN photos AS reverseimg ON coins.reverseimg = reverseimg.id\
        WHERE coins.id=" + id + ";";
	worker.postMessage({action:'exec', sql:command});
	infoElm.textContent = "Fetching results...";
}

var infoCreate = function () {
  return function (columns, values){
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
    console.log(id);
	tic();
	worker.onmessage = function(event) {
		var results = event.data.results;
		toc("Executing SQL");

		tic();
		imagesElm.innerHTML = "";
		for (var i=0; i<results.length; i++) {
			imagesElm.appendChild(imagesCreate(results[i].columns, results[i].values));
		}

		toc("Displaying results");
	}
    location.hash = "images";
    command = "SELECT obverseimg.image, reverseimg.image, edgeimg.image, photo1.image, photo2.image, photo3.image, photo4.image FROM coins\
        LEFT JOIN photos AS obverseimg ON coins.obverseimg = obverseimg.id\
        LEFT JOIN photos AS reverseimg ON coins.reverseimg = reverseimg.id\
        LEFT JOIN photos AS edgeimg ON coins.edgeimg = edgeimg.id\
        LEFT JOIN photos AS photo1 ON coins.photo1 = photo1.id\
        LEFT JOIN photos AS photo2 ON coins.photo2 = photo2.id\
        LEFT JOIN photos AS photo3 ON coins.photo3 = photo3.id\
        LEFT JOIN photos AS photo4 ON coins.photo4 = photo4.id\
        WHERE coins.id=" + id + ";";
	worker.postMessage({action:'exec', sql:command});
	imagesElm.textContent = "Fetching results...";
}

var imagesCreate = function () {
  return function (columns, values){
    v = values[0];
    var tbl  = document.createElement('div');
    console.log(arrayBufferToBase64(v[3]));
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

// Load a db from a file
dbFileElm.onchange = function() {
	var f = dbFileElm.files[0];
	var r = new FileReader();
    location.hash = "";
	r.onload = function() {
		worker.onmessage = function () {
			toc("Loading database from file");
            noerror()
            execute ("SELECT coins.id, images.image, title, status FROM coins INNER JOIN images on images.id = coins.image;");
		};
		tic();
		try {
			worker.postMessage({action:'open',buffer:r.result}, [r.result]);
		}
		catch(exception) {
			worker.postMessage({action:'open',buffer:r.result});
		}
	}
	r.readAsArrayBuffer(f);
}
