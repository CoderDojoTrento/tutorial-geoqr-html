
var genera = document.getElementById('genera');
var scarica = document.getElementById('scarica');
scarica.disabled = true;

var nomefile = null;

genera.onclick = function() {
    var text = document.getElementsByName('text')[0].value;
    var title = document.getElementsByName('title')[0].value;
    var subTitle = document.getElementsByName('subTitle')[0].value;
    var logo = document.getElementsByName('logo')[0].value;
    var width = parseInt(document.getElementsByName('width')[0].value);
    var quanti = parseInt(document.getElementsByName('quanti')[0].value);
    nomefile = document.getElementsByName('nomefile')[0].value;


    if (!quanti){
        quanti = 1;
    }
    
    qrcodes = document.getElementById("qrcodes");
    qrcodes.innerHTML = "";
    
    for (i = 1; i <= quanti; i++){
        params = {}
        if (!text){
            throw new Error("Non c'è la url !");
        }
        params['text'] = i + "-domanda.html";
        if (title){
            params['title'] = title.replace("{i}", i);
        }
        
        if (subTitle){
            params['subTitle'] = subTitle.replace("{i}", i);
          //  params['subTitleTop'] =  - 122;
            params['titleHeight'] = 70;
        }
        
        if (logo){
            params['logo'] = logo.replace("{i}", i);;
        }
        
        if (width){
            params['width'] = width;            
            params['height'] = width;            
        }
    
        idQrcode = "qrcode-" + i;
        var node = document.createElement("div");
        node.id = idQrcode;

        qrcodes.appendChild(node);
        var qrcode = new QRCode(document.getElementById(idQrcode), params);
        console.log(qrcode);    
    }
    
    scarica.disabled = false;
}






    
scarica.onclick = function() {

    
    var zip = new JSZip();
    
    children = document.getElementById('qrcodes').children;
    if (!children.length){
        throw new Error("Bisogna prima generare i codici !");
    }
    for (var i = 0; i < children.length; i++){
        qrnode = children[i];
        var prefix = "data:image/png;base64,";
        var img = qrnode.childNodes[1]
        codedImage = img.src.substring(prefix.length);
            
        zip.file(nomefile.replace("{i}",(i+1)), codedImage, {base64: true});
            
    };

    zip.generateAsync({type:"blob"}).then(function (blob) { // 1) generate the zip file
        saveAs(blob, "codici-qr.zip");                          // 2) trigger the download
    }, function (err) {
        console.error("Errore nel generare lo zip !", err);
    });


};



                
        


/*
{
text: "https://github.com/ushelp/EasyQRCodeJS",
width: 256,
height: 256,
colorDark : "#000000",
colorLight : "#ffffff",
correctLevel : QRCode.CorrectLevel.H,

// ==== Title
title: 'QR Title', // content 
titleFont: "bold 18px Arial", //font. default is "bold 16px Arial"
titleColor: "#004284", // color. default is "#000"
titleBgColor: "#fff", // background color. default is "#fff"
titleHeight: 70, // height, including subTitle. default is 50
titleTop: 25, // draws y coordinates. default is 30

// ==== SubTitle
subTitle: 'QR subTitle', // content
subTitleFont: "14px Arial", // font. default is "14px Arial"
subTitleColor: "#004284", // color. default is "gray"
subTitleTop: 40, // draws y coordinates. default is 50

// ==== Logo
logo:"../demo/logo.png", // Relative address, relative to `easy.qrcode.min.js`
//	logo:"http://127.0.0.1:8020/easy-qrcodejs/demo/logo.png", 
//	logoWidth:80, // widht. default is automatic width
//	logoHeight:80 // height. default is automatic height
//	logoBgColor:'#fffff', // Logo backgroud color, Invalid when `logBgTransparent` is true; default is '#ffffff'
//	logoBgTransparent:false, // Whether use transparent image, default is false	
*/
