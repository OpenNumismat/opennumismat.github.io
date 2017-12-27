var outputElm = document.getElementById('output');
var infoElm = document.getElementById('info');
var imagesElm = document.getElementById('images');
var errorElm = document.getElementById('error');
var statusElm = document.getElementById('status-text');
var dbFileElm = document.getElementById('dbfile');

var scrollPos = 0;
var mainSqlSelect = "SELECT coins.id, images.image, title, status, subjectshort, value, unit, year, mintmark, series FROM coins LEFT OUTER JOIN images on images.id = coins.image";

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

i18next.init({
  lng: $('#lang').text(),
  resources: {
    en: {
      translation: {
          status: "Status",
          country: "Country",
          series: "Series",
          type: "Type",
          period: "Period",
          All: "All",
          owned: "Owned",
          demo: "Demo",
          pass: "Pass",
          ordered: "Ordered",
          sold: "Sold",
          sale: "Sale",
          wish: "Wish",
          region: "Region",
          ruler: "Ruler",
          denomination: "Denomination",
          subject: "Subject",
          date_issue: "Date of issue",
          year: "Year",
          mintage: "Mintage",
          material: "Material",
          mint: "Mint",
      }
    },
    bg: {
      translation: {
          "status": "Статус",
          "country": "Държава",
          "series": "Серия",
          "type": "Type",
          "period": "Период",
          "All": "Всички",
          "owned": "В наличност",
          "demo": "Демонстрация",
          "pass": "Pass",
          "ordered": "Поръчана",
          "sold": "Продадена",
          "sale": "Продава се",
          "wish": "Желана",
          "region": "Region",
          "ruler": "Владетел",
          "denomination": "Denomination",
          "subject": "Тема",
          "date_issue": "Дата на издаване",
          "year": "Година",
          "mintage": "Тираж",
          "material": "Материал",
          "mint": "Монетен двор"
      }
    },
    ca: {
      translation: {
          "status": "Estatus",
          "country": "País",
          "series": "Sèrie",
          "type": "Tipus",
          "period": "Període",
          "All": "Tots",
          "owned": "Pròpies",
          "demo": "Demo",
          "pass": "Subhasta",
          "ordered": "Comprades",
          "sold": "Venudes",
          "sale": "Venda",
          "wish": "Desitjos",
          "region": "Region",
          "ruler": "Ruler",
          "denomination": "Denominació",
          "subject": "Subjecte",
          "date_issue": "Data d'emissió",
          "year": "Any",
          "mintage": "Encunyació",
          "material": "Material",
          "mint": "Seca"
        }
    },
    cs: {
      translation: {
          "status": "Stav",
          "country": "Země",
          "series": "Série",
          "type": "Typ",
          "period": "Období",
          "All": "All",
          "owned": "Vlastněno",
          "demo": "Ukázka",
          "pass": "Projít",
          "ordered": "Objednáno",
          "sold": "Prodáno",
          "sale": "Prodej",
          "wish": "Přání",
          "region": "Region",
          "ruler": "Ruler",
          "denomination": "Hodnota",
          "subject": "Předmět",
          "date_issue": "Datum vystavení",
          "year": "Rok",
          "mintage": "Mintage",
          "material": "Materiál",
          "mint": "Mincovna"
        }
    },
    de: {
      translation: {
          "status": "Status",
          "country": "Land",
          "series": "Serie",
          "type": "Typ",
          "period": "Periode",
          "All": "All",
          "owned": "Vorhanden",
          "demo": "Demo",
          "pass": "Beobachtet",
          "ordered": "Bestellt",
          "sold": "Verkauft",
          "sale": "Verkauf",
          "wish": "Gesucht",
          "region": "Region",
          "ruler": "Ruler",
          "denomination": "Denomination",
          "subject": "Betreff",
          "date_issue": "Ausgabedatum",
          "year": "Jahr",
          "mintage": "Auflage",
          "material": "Material",
          "mint": "Münzanstalt"
        }
    },
    el: {
      translation: {
          "status": "Κατάσταση",
          "country": "Χώρα",
          "series": "Σειρά",
          "type": "Τύπος",
          "period": "Περίοδος",
          "All": "Όλα",
          "owned": "Ιδιόκτητο",
          "demo": "Επίδειξης",
          "pass": "Προσωρινό",
          "ordered": "Παραγγέλθηκε",
          "sold": "Πωλείται",
          "sale": "Πώληση",
          "wish": "Επιθυμία",
          "region": "Περιοχή",
          "ruler": "Χάρακας",
          "denomination": "Ονομαστική αξία",
          "subject": "Θέμα",
          "date_issue": "Ημερ/νία έκδοσης",
          "year": "Έτος",
          "mintage": "Νομισματοκοπία",
          "material": "Υλικό",
          "mint": "Νομισματοκοπείο"
        }
    },
    es: {
      translation: {
          "status": "Estatus",
          "country": "País",
          "series": "Series",
          "type": "Tipo",
          "period": "Período",
          "All": "Todo",
          "owned": "Propia",
          "demo": "Demo",
          "pass": "Pasar",
          "ordered": "Pedida",
          "sold": "Vendida",
          "sale": "Vender",
          "wish": "Deseada",
          "region": "Región",
          "ruler": "Regla",
          "denomination": "Denominación",
          "subject": "Motivo",
          "date_issue": "Fecha de emisión",
          "year": "Año",
          "mintage": "Acuñación",
          "material": "Material",
          "mint": "Ceca"
        }
    },
    fr: {
      translation: {
          "status": "Statut",
          "country": "Pays",
          "series": "Séries",
          "type": "Type",
          "period": "Période",
          "All": "Tous",
          "owned": "Acquise",
          "demo": "Démonstration",
          "pass": "Pass",
          "ordered": "Commandé",
          "sold": "Vendu",
          "sale": "Vente",
          "wish": "Envie",
          "region": "Region",
          "ruler": "Ruler",
          "denomination": "Dénomination",
          "subject": "Sujet",
          "date_issue": "Date d'émission",
          "year": "Année",
          "mintage": "Mintage",
          "material": "Matériau",
          "mint": "Monnaie"
        }
    },
    hu: {
      translation: {
          "status": "Státusz",
          "country": "Ország",
          "series": "Sorozat",
          "type": "Típus",
          "period": "Koszak",
          "All": "All",
          "owned": "Tulajdonos",
          "demo": "Demó",
          "pass": "Átmeneti",
          "ordered": "Ordered",
          "sold": "Eladott",
          "sale": "Eladó",
          "wish": "Megszerzendő",
          "region": "Region",
          "ruler": "Ruler",
          "denomination": "Denomination",
          "subject": "Tárgy",
          "date_issue": "Kiadás éve",
          "year": "Év",
          "mintage": "Pénzverde",
          "material": "Anyag",
          "mint": "Pénzverde"
        }
    },
    it: {
      translation: {
          "status": "Condizione",
          "country": "Nazione",
          "series": "Serie",
          "type": "Tipo",
          "period": "Periodo",
          "All": "Tutto",
          "owned": "Posseduta",
          "demo": "Demo",
          "pass": "Scambio",
          "ordered": "Ordinata",
          "sold": "Venduta",
          "sale": "Vendita",
          "wish": "Desiderata",
          "region": "Region",
          "ruler": "Ruler",
          "denomination": "Denominazione",
          "subject": "Soggetto",
          "date_issue": "Data di emissione",
          "year": "Anno",
          "mintage": "Coniatura",
          "material": "Materiale",
          "mint": "Condizione"
        }
    },
    nl: {
      translation: {
          "status": "Status",
          "country": "Land",
          "series": "Uitvoering",
          "type": "Type",
          "period": "Periode",
          "All": "Alle",
          "owned": "Eigendom",
          "demo": "Demo",
          "pass": "Ophouden",
          "ordered": "Besteld",
          "sold": "Verkocht",
          "sale": "Verkoop",
          "wish": "Wens",
          "region": "Region",
          "ruler": "Ruler",
          "denomination": "Benaming",
          "subject": "Onderwerp",
          "date_issue": "datum van uitgifte",
          "year": "Jaar",
          "mintage": "Gemunt",
          "material": "Materiaal",
          "mint": "Munthuis"
        }
    },
    pl: {
      translation: {
          "status": "Status",
          "country": "Kraj",
          "series": "Seria",
          "type": "Typ",
          "period": "Okres",
          "All": "All",
          "owned": "Posiadane",
          "demo": "Demo",
          "pass": "Przekazano",
          "ordered": "Zamówione",
          "sold": "Sprzedane",
          "sale": "Sprzedaż",
          "wish": "Chcę",
          "region": "Region",
          "ruler": "Ruler",
          "denomination": "Denominacja",
          "subject": "Temat",
          "date_issue": "Data emisji",
          "year": "Rok",
          "mintage": "Nakład",
          "material": "Stop metali",
          "mint": "Mennica"
        }
    },
    pt: {
      translation: {
          "status": "Estado",
          "country": "País",
          "series": "Séries",
          "type": "Tipo",
          "period": "Período",
          "All": "Tudo",
          "owned": "Possuída",
          "demo": "Demonstração",
          "pass": "Troca",
          "ordered": "Encomendada",
          "sold": "Vendida",
          "sale": "Vendável",
          "wish": "Desejada",
          "region": "Região",
          "ruler": "Régua",
          "denomination": "Denominação",
          "subject": "Assunto",
          "date_issue": "Data de emissão",
          "year": "Ano",
          "mintage": "Cunhagem",
          "material": "Material",
          "mint": "Cunho"
        }
    },
    ru: {
      translation: {
          "status": "Статус",
          "country": "Страна",
          "series": "Серии",
          "type": "Тип",
          "period": "Период",
          "All": "Все",
          "owned": "Есть",
          "demo": "Демо",
          "pass": "Проход",
          "ordered": "Заказана",
          "sold": "Продана",
          "sale": "На продажу",
          "wish": "Нужна",
          "region": "Регион",
          "ruler": "Правитель",
          "denomination": "Номинал",
          "subject": "Тема",
          "date_issue": "Дата выпуска",
          "year": "Год",
          "mintage": "Тираж",
          "material": "Материал",
          "mint": "Двор"
        }
    },
    uk: {
      translation: {
          "status": "Статус",
          "country": "Країна",
          "series": "Серія",
          "type": "Тип",
          "period": "Перiод",
          "All": "Усе",
          "owned": "Є",
          "demo": "Демо",
          "pass": "Прохід",
          "ordered": "Замовлена",
          "sold": "Продана",
          "sale": "Продаж",
          "wish": "Потрібна",
          "region": "Region",
          "ruler": "Ruler",
          "denomination": "Номінал",
          "subject": "Тема",
          "date_issue": "Дата випуску",
          "year": "Рік",
          "mintage": "Тираж",
          "material": "Матеріал",
          "mint": "Літери"
        }
    },
  }
});

function filterChanged() {
    var filters = [];
    var def_filter = i18next.t('All');

    if ($('select#status').length) {
        var status = $('select#status').find('option:selected').text();
        if (status !== def_filter)
            filters.push("coins.status='" + status.replace("'", "''") + "'");
    }
    if ($('select#country').length) {
        var country = $('select#country').find('option:selected').text();
        if (country !== def_filter)
            filters.push("coins.country='" + country.replace("'", "''") + "'");
    }
    if ($('select#series').length) {
        var series = $('select#series').find('option:selected').text();
        if (series !== def_filter)
            filters.push("coins.series='" + series.replace("'", "''") + "'");
    }
    if ($('select#type').length) {
        var type = $('select#type').find('option:selected').text();
        if (type !== def_filter)
            filters.push("coins.type='" + type.replace("'", "''") + "'");
    }
    if ($('select#period').length) {
        var period = $('select#period').find('option:selected').text();
        if (period !== def_filter)
            filters.push("coins.period='" + period.replace("'", "''") + "'");
    }
    if ($('select#mint').length) {
        var mint = $('select#mint').find('option:selected').text();
        if (mint !== def_filter)
            filters.push("coins.mint='" + mint.replace("'", "''") + "'");
    }

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
	worker.onmessage = function(event) {
		var results = event.data.results;

        if (results.length > 0) {
            $('div#table').replaceWith(tableCreate(results[0].columns, results[0].values));
        }
        else {
            $('div#table').replaceWith('');
        }
        updateTable();

        status();
	}
    status("Executing SQL");
	worker.postMessage({action:'exec', sql:commands});
    status("Fetching results");
}

function execute(commands) {
	worker.onmessage = function(event) {
		var results = event.data.results;
        
        $('div#filters').empty();
        html = "<table>";
        html += filterCreate('status', results[1].values);
        html += filterCreate('country', results[2].values);
        html += filterCreate('series', results[3].values);
        html += filterCreate('type', results[4].values);
        html += filterCreate('period', results[5].values);
        html += filterCreate('mint', results[6].values);
        html += "</table>";
        $('div#filters').append(html);

        if (results.length > 0) {
            $('div#table').replaceWith(tableCreate(results[0].columns, results[0].values));
            updateTable();
        }

        status();
	}
    status("Executing SQL");
	worker.postMessage({action:'exec', sql:commands});
    status("Fetching results");
}

// Create an HTML table
var filterCreate = function () {
  return function (id, values){
    if (values.length > 1) {
      var label = i18next.t(id);
      var rows = values.map(function(v){ return '<option>' + v[0] + '</option>'});
      return '<tr><td><label for="' + id + '">' + label + ':</label></td><td><select class="filter" id="' + id + '"><option>' + i18next.t('All') + '</option>' + rows.join('') + '</select></td></tr>';
    }
    return '';
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
            <td class="data"><div class="title">' + v[2] + '&nbsp;</div><div class="description">' + desc.join(', ') + '&nbsp;</div></td><td class="status">' + i18next.t(v[3]) + '</td></tr>';
    });
    var html = '<table class="table">' + rows.join('') + '</table>';
    tbl.innerHTML = html;
    return tbl;
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
        fields += '<tr><td class="min">' + i18next.t('status') + ':</td><td><b>' + v[3] + '</b></td></tr>';
    if (v[4])
        fields += '<tr><td class="min">' + i18next.t('region') + ':</td><td><b>' + v[4] + '</b></td></tr>';
    if (v[5])
        fields += '<tr><td class="min">' + i18next.t('country') + ':</td><td><b>' + v[5] + '</b></td></tr>';
    if (v[6])
        fields += '<tr><td class="min">' + i18next.t('period') + ':</td><td><b>' + v[6] + '</b></td></tr>';
    if (v[7])
        fields += '<tr><td class="min">' + i18next.t('ruler') + ':</td><td><b>' + v[7] + '</b></td></tr>';
    if (v[8] || v[9])
        fields += '<tr><td class="min">' + i18next.t('denomination') + ':</td><td><b>' + v[8] + ' ' + v[9] + '</b></td></tr>';
    if (v[10])
        fields += '<tr><td class="min">' + i18next.t('type') + ':</td><td><b>' + v[10] + '</b></td></tr>';
    if (v[11])
        fields += '<tr><td class="min">' + i18next.t('series') + ':</td><td><b>' + v[11] + '</b></td></tr>';
    if (v[12])
        fields += '<tr><td class="min">' + i18next.t('subject') + ':</td><td><b>' + v[12] + '</b></td></tr>';
    if (v[13])
        fields += '<tr><td class="min">' + i18next.t('date_issue') + ':</td><td><b>' + v[13] + '</b></td></tr>';
    else if (v[14])
        fields += '<tr><td class="min">' + i18next.t('year') + ':</td><td><b>' + v[14] + '</b></td></tr>';
    if (v[15])
        fields += '<tr><td class="min">' + i18next.t('mintage') + ':</td><td><b>' + v[15] + '</b></td></tr>';
    if (v[16])
        fields += '<tr><td class="min">' + i18next.t('material') + ':</td><td><b>' + v[16] + '</b></td></tr>';
    if (v[17])
        fields += '<tr><td class="min">' + i18next.t('mint') + ':</td><td><b>' + v[17] + '</b></td></tr>';
    else if (v[18])
        fields += '<tr><td class="min">' + i18next.t('mint') + ':</td><td><b>' + v[18] + '</b></td></tr>';
    fields += '</table>';
    var html = title + images + fields;
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
    $('div#filters').empty();
	r.onload = function() {
		worker.onmessage = function () {
            noerror()
            execute (mainSqlSelect + ";\
                SELECT DISTINCT status FROM coins;\
                SELECT DISTINCT country FROM coins;\
                SELECT DISTINCT series FROM coins;\
                SELECT DISTINCT type FROM coins;\
                SELECT DISTINCT period FROM coins;\
                SELECT DISTINCT mint FROM coins;");
		};
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
