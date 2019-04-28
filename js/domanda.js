
mostraMappa();

try {    

    var formRisposte = document.forms['formRisposte']
    if (!formRisposte){
        throw new Error('Manca il form delle risposte! (dovrebbe avere id="formRisposte") !');
    }

    var risposte = formRisposte.elements['risposta'];
    if (!risposte){
        throw new Error('Mancano input con name="risposta"!');
    }

    for (var i=0, len=risposte.length; i<len; i++) {
        risposte[i].checked = false;
        
        risposte[i].onclick =  function() {
            
            // reset
            for (var j=0, len=risposte.length; j<len; j++) {
                risposte[j].parentNode.style['color'] = 'black'
                risposte[j].parentNode.style['font-weight'] = 'normal'
                
            }
                             
            var corretta = null;
            if (this.dataset["corretta"]){                 
                color = "black";                                
                html = 'RISPOSTA CORRETTA!';
                corretta = true;
                this.parentNode.style["font-weight"] = "bold";
            } else {            
                color = 'red';
                html = 'RISPOSTA SBAGLIATA, RIPROVA!';  
                corretta = false;
                this.parentNode.style['color'] = 'red'                
            } 
            
            try {
                messaggio = document.getElementById('messaggio')
                if (!messaggio){        
                    throw new Error('Manca il contenitore del messaggio (dovrebbe avere id="messaggio") !');
                }
            
                messaggio.style["color"] = color;
                messaggio.innerHTML = html;  
            } catch (err){
                console.error("Ci sono problemi con il messaggio !", err);
            }                        
            
            try { // punteggio

                // document.getElementById("rispostaForm").submit();                        

                if (!storageAvailable('localStorage')){
                    throw new Error("localStorage non disponibile!");
                }
                
                if (corretta){                    
                    
                    codicePagina = prendiCodicePagina();
                    if (!Db.corrette.includes(codicePagina)){                        
                        Db.punteggio += 1;
                        Db.corrette.push(codicePagina);
                        saveDb();
                    }
                    
                    setTimeout(function () {              
                        window.location = prendiCodicePagina() + '-risposta.html';
                    }, 1000);

                } else {
                    Db.tentativiFalliti += 1;
                    saveDb();
                }                
            
            } catch (err){
                console.error("Non riesco a salvare il punteggio", err);
            }


        
        }
        
        
    }
    
    
} catch (err){
    console.error("Ci sono problemi nelle risposte !", err);
}


