

function creaConfigurazioneVuota(){
    return {
        "totaleDomande" : 0   // sconosciuto
    }
};

/**
 * Verifica la configurazione corrente e la ritorna. 
 * Se qualcosa va storto, ritorna la configurazione di default.
 */
function verificaConfigurazione(){
    try {
        if (typeof configurazione == 'undefined'){
            throw new Error("configurazione non dichiarata !");
        }

        if (!configurazione){
            throw new Error("Configurazione vuota !");            
        }
        if (!configurazione["totaleDomande"]){
            throw new Error("Non trovo totaleDomande !");            
        }
        return configurazione;
    } catch (err){
        console.error("Configurazione invalida, uso i default !", err);
        return creaConfigurazioneVuota();
    }
}


function storageAvailable(type) {
    var storage;
    try {        
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}


function creaDbVuoto(){
    return {
        'punteggio':0,
        'tentativiFalliti':0,
        'corrette' : [],    
    }
}

var Db = creaDbVuoto();

function resetDb(){
    Db = creaDbVuoto();
    saveDb();
    
}

function saveDb(){
    if (storageAvailable('localStorage')) {
        Object.keys(Db).forEach(function(key) {            
            localStorage.setItem(key, Db[key]);
            console.log(key, '=',localStorage.getItem(key));
        });
        console.log('Salvato localStorage.');
    } else {
        console.error("il localStorage non è supportato in questo browser! Non posso salvare il punteggio!");
    }  
    
}       


function loadDb(){
    if (storageAvailable('localStorage')) {
        var punteggio = parseInt(localStorage.getItem('punteggio'));
        var scheduleSave = false;
        if (punteggio){
            Db.punteggio = punteggio;
        } else {
            Db.punteggio = 0;
            scheduleSave = true;
        }
        var tentativiFalliti = parseInt(localStorage.getItem('tentativiFalliti'));
        if (tentativiFalliti){
            Db.tentativiFalliti = tentativiFalliti;
        } else {
            Db.tentativiFalliti = 0;
            scheduleSave = true;            
        }
        var corrette = localStorage.getItem('corrette');
        if ((typeof corrette === "string" && corrette.length >= 1 )){
            Db.corrette = corrette.split(',');
        } else {                
            Db.corrette = [];
            scheduleSave = true;
        }
        console.info("Db=", Db);
        if (scheduleSave){
            saveDb();
        }
        
      } else {
          console.error("il localStorage non è supportato in questo browser! Non posso salvare il punteggio!");
    }

}

/** Ritorna il codice della pagina (es con '3fxs-domanda.html' ritorna '3'),
 *  La pagina *DEVE* essere una domanda o risposta, altrimenti lancia un eccezione
*/
function prendiCodicePagina(){
    var pname = window.location.pathname;
    var start = pname.lastIndexOf('/');
    
    if (start === -1){
        throw new Error("Inizio nome pagina sbagliato! nome=",window.location.pathname);
    }
    
    var end = pname.indexOf('-domanda.html');    
    if (end === -1){
        end = pname.indexOf('-risposta.html');    
        if (end === -1){
            throw new Error("Fine nome pagina sbagliato ! nome=",window.location.pathname);
        }
    }
    return pname.substring(start+1, end);
}

/**
 * Ritorna un numero di pagina e *Non* lancia mai eccezioni :
 *    0: indice
 * >= 1: domanda o risposta
 *   -1: altra pagina
 */
function prendiNumeroPagina(){
    var pname = window.location.pathname;
    if (pname.lastIndexOf('/index.html') >= 0 || pname.endsWith('/')){
        return 0;
    };

    var start = pname.lastIndexOf('/');    
    if (start === -1){
        return -1;
    }
    var end = pname.indexOf('-domanda.html');    
    if (end === -1){
        end = pname.indexOf('-risposta.html');    
        if (end === -1){
            return -1;
        }
    }
    var ret = parseInt(pname.substring(start+1, end));
    if (!ret){
        return -1;
    }

    return ret;
}

/**
 * Ritorna un valore tra i seguenti: 
 *  "RISPOSTA" | "DOMANDA" | "INDICE" | "ALTRO"
 * 
 * *NON* lancia mai eccezioni.
 */
function prendiTipoPagina(){
    var pname = window.location.pathname;
    if (pname.lastIndexOf('-risposta.html') >= 0){
        return "RISPOSTA";
    } else if (pname.lastIndexOf('-domanda.html') >= 0){
        return "DOMANDA";
    } else if (pname.lastIndexOf('/index.html') >= 0 || pname.endsWith('/')){
        return "INDICE";
    } 
    return "ALTRO";
}


function mostraMappa(){
    var mappa = document.getElementById("mappa");

    if (!mappa) {
        console.info("non trovo il contenitore per la mappa");
    } else {
    
        try {
            
            lato_lat = 0.00066158892;
            lato_lon = 0.00108093023;
        
            try {            
                lat = parseFloat(mappa.dataset["lat"]);
                lon = parseFloat(mappa.dataset["lon"]);
                if (!lat){
                    throw Error("Non ho trovato attributo data-lat in mappa !");
                }
                if (!lon){
                    throw Error("Non ho trovato attributo data-lon in mappa !");
                }
        
            } catch (err){
                console.error("Coordinate invalide !\nlat = ", 
                                mappa.dataset["lat"], " \nlon = ", mappa.dataset["lon"], "\n", err);
                console.error("Assumo che il centro sia Sardagna ...");
                lat = 46.06590156942789;
                lon = 11.095413565635681;
            }
        
            // NOTA per il futuro: con html non iniettato e display:none, se si fa il show 
            // poi la mappa appare zoommata fuori https://help.openstreetmap.org/questions/52023/embedded-maps-not-working
        
            iframe = '<iframe frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://www.openstreetmap.org/export/embed.html?bbox=' + (lon - lato_lon) + '%2C' 
            + (lat - lato_lat) +   '%2C' + (lon + lato_lon) + '%2C' + (lat + lato_lat) 
            + '&amp;layer=mapnik&amp;marker=' + lat +'%2C' + lon + '" style="border: 1px solid black"></iframe><br/>'
            mappa.innerHTML = iframe;
        } catch (err) {
            console.error("Ci sono problemi con la mappa ...", err);
        }
    }    
}


function mostraStato(){
    var stato = document.getElementById('stato');
    if (!stato) {
        console.info("non trovo il contenitore per lo stato");
    } else {
        try {
            var i = prendiNumeroPagina();
            

            console.log('numero pagina = ', i);

            var html = '';

            if (!storageAvailable('localStorage')){
                throw new Error("localStorage non disponibile!");
            }       

            html += "Risposte corrette : " + Db.punteggio + '<br/>'
            + "Tentativi falliti: " + Db.tentativiFalliti;

            if (configurazione.totaleDomande){
                var restanti = configurazione.totaleDomande-Db.punteggio;                
                if (restanti){
                    if (restanti < 0){
                        console.error("Errore: sono state risposte più domande di quelle totali!");
                        console.error("Db.punteggio=", Db.punteggio);
                        console.error("configurazione=",configurazione);
                        console.error("Controllare la configurazione in admin/js/configurazione.js");
                        console.error("Db=",Db)
                    } else {
                        var restano = restanti === 1  ? "resta" : "restano";
                        var domande = restanti === 1  ? "domanda" : "domande";
                        html += '<p>Ti ' + restano + ' ancora ' + restanti + ' ' + domande + ' da trovare.</p>';
                    }
                } else {
                    html += '<p>Hai trovato tutte le domande !</p>';
                }
            } else {
                console.error("Configurazione invalida, non riesco a determinare quante domande rimangono.");
            }
            
             
            stato.innerHTML = html;
        } catch (err){
            console.error("Errore nel mostrare lo stato !", err);
        }
    } 
}


function mostraFooter(){
    var footer = document.getElementById('footer');
    if (footer){
        try {
            html = '';
            if (prendiTipoPagina() === 'INDICE') {
                // un po' hacky ma pazienza
                if (configurazione.totaleDomande){
                     html += '<p style="margin-top:-40px; margin-bottom:60px; ">Nel percorso ci sono ' + configurazione.totaleDomande +' domande da cercare.</p>'
                } else {
                    console.error("Configurazione invalida! Non riesco a mostrare il totaleDomande");
                }
            }
            html += '<a href="https://www.coderdolomiti.it/iw2"> <img src="img/loghi/footer.png"></a>';
            footer.innerHTML = html;
        } catch (err){
            console.error("Errore nel settare il footer !", err);
        }
    } else {
        console.error("Non trovo il contenitore per il footer");
    }
}


setTimeout(function () {
    // al momento non lo usiamo sul serio ..
    Fingerprint2.get(function (components) {
        // console.log(components) // an array of components: {key: ..., value: ...}
        var values = components.map(function (component) { return component.value })
        user_hash = Fingerprint2.x64hash128(values.join(''), 31)
        console.log("user_hash=" + user_hash);
        utente = document.getElementById("utente");
        if (utente){
            utente.value = user_hash;
        }
        
    })  
}, 500);

configurazione = verificaConfigurazione();
console.info("La configurazione è ", configurazione);
loadDb();
mostraStato();
mostraMappa();
mostraFooter();



