var global =
    {
        id: null,
        source: null,
        origin: null,
    };


    //iFrame Kommunikation
    $.receive_message = function(event)
    {
        try
        {
            var data = JSON.parse(event.data);
        }
        catch(error)
        {
            return;
        }

        //Event
        var origin = event.origin || event.originalEvent.origin;
        global.source = event.source;
        global.origin = origin;
        global.id = data.id;

        if(data.type == "size:init")
        {
            $wrapper = $("wrapper");
            var body = $("body");
            event.source.postMessage(JSON.stringify({"type": "size:set", "id": data.id, "width": $wrapper.width(), "height": body.height()}), origin);
        }
    }


    //iFrame Kommunikation
    $.send_message = function()
    {
        //iFrame Kommunikation zwecks Höhenänderung
        $wrapper = $("wrapper");
        var body = $("body");
        if(global.source !== null)
        {
            //console.log("send message: w " + $wrapper.width() + " h: " + body.height());
            global.source.postMessage(JSON.stringify({"type": "size:set", "id": global.id, "width": $wrapper.width(), "height": body.height()}), "*" );
        }
        else
        {
            setTimeout(function(){$.send_message();}, 2000);
        }
    }


    setTimeout(function(){$.send_message();}, 2000);





function drop_pixel()
{
    //SZM
    var szm = {"st": "zdf", "cp": "Startseite", "sv": "ke"};
    if(typeof(iom) !== 'undefined' && typeof iom.c === "function")
    {
        iom.c(szm, 1);
    }

    //ATInternet
    if(typeof(ATInternet) !== 'undefined')
    {
        var tag = new ATInternet.Tracker.Tag();
        tag.page.set({
            "level1":"zdf",
            "level2":"Startseite",
            "chapter1":"Startseite",
            "chapter2":"Infografik",
            "chapter3":"virtuelles-wasser/A080134",
            "name":"Startseite_Infografik_virtuelles-wasser",
            "customObject":
                {
                    "broadcast":"ZDF",
                    "domain":"zdf",
                    "chapter1":"Startseite",
                    "id":"Infografik_virtuelles-wasser_A080134"
                }});
        tag.customVars.set(
            {
                "site":
                    {
                        "chapter3":"virtuelles-wasser/A080134",
                        "chapter2":"Infografik",
                        "id":"Infografik_virtuelles-wasser_A080134"
                    }});
        tag.dispatch();
    }
}

//--- JSON laden ------------------------------------------------------------------------------------------- //

function loadJSON(file,callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', file, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == '200') {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}


//--- Zufallsfunktion  ------------------------------------------------------------------------------------- //

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}


//--- Tausender-Formatierung ------------------------------------------------------------------------------- //

function thousendPoints(zahl) {
    var i;
    var j=0;
    var ergebnis="";

    i=zahl.length-1;

    if(i>2){

    while (i >= 0) {
        ergebnis=zahl.substr(i,1)+ergebnis;
        j++;
        if (j==3) {
            ergebnis="."+ergebnis;
            j=0;
        }
        i--;
    } } else {
        ergebnis = zahl;
    }
    return ergebnis;
}

//--- Slider ------------------------------------------------------------------------------------------------   //

function svgSlider (_values, _images, _names){

    var values = _values;
    var images = _images;
    var names = _names;


    var slider = document.getElementById('myRange');
   
    slider.oninput = function() {

        var numDrops = values [slider.value - 1] / 10;
        var assetName = names [slider.value -1] ;
        var assetValue = values [slider.value -1];
        var assetImage = images[slider.value -1];


        if(slider.value == 0){
            generateStartLayer();
            renderSVG(1568);
        }
        else {
            generateAssetLayer(assetName, assetValue, assetImage);
            renderSVG (numDrops);
        }
    }


}

//--- Arrow-Buttons ------------------------------------------------------------------------------------------ //

function svgButtons (_values, _images, _names) {


    var event = 'click';

    if ('ontouchstart' in window) {
        event = 'touchstart';
    }

    var values = _values;
    var images = _images;
    var names = _names;

    var btnForward = document.getElementById('btn-forward'),
        btnBack = document.getElementById('btn-back');

    var i = -1;



    btnForward.addEventListener(event, function() {
        i = i+1;
        drop_pixel();

        if (i > 10 ) {
            generateStartLayer();
            renderSVG(1568);
            i = 0;
        }

        else
            {
        var numDrops = values [i] / 10;
        var assetName = names [i] ;
        var assetValue = values [i];
        var assetImage = images[i];
        var slide = i + 1;
        var allSlides = 11;

        renderSVG(numDrops);
        generateAssetLayer(assetName, assetValue, assetImage, slide, allSlides)  ;
        }

    },
        false);


    btnBack.addEventListener(event, function() {
        i = i-1;
        drop_pixel();

        if (i < 0 ) {
            generateStartLayer();
            renderSVG(1568);
            i = 0;
        }
        else {

            TweenMax.to(".ctn-asset", 1, {opacity:0}, 0.5);

        var numDrops = values [i] / 10;
        var assetName = names [i] ;
        var assetValue = values [i];
        var assetImage = images[i];
        var slide = i + 1;
        var allSlides = 11;

        renderSVG(numDrops) ;
        generateAssetLayer(assetName, assetValue, assetImage, slide, allSlides)  ;
        }
    },
        false);

}


//--- SVG generieren mit d3-----------------------------------------------------------------------------------   //



function rowDropsY(_rowID, _svgHeight, _dropY){

    var multiplier = _rowID - 1;
    var dY = (_dropY + _svgHeight * multiplier) - (_rowID * 20 - 20);
    return (dY);

}

function renderSVG(_numDrops){

    var dropX = 20;
    var dropY = 20;
    var rowID = 1;
    var svgHeight = 580;
    

    var svgCont = d3.select('#d3-content');
    svgCont.html('');

    var svg = svgCont.append('svg')
        .attr('viewBox', "0 0 1160 "+svgHeight)
        .attr('id', 'drops');
        svg.html('');


    var group = svg.append('g')
        .attr('id', 'smalldrops');


    for ( i=1; i<= _numDrops; i++ ) {

        dropX = rowID * 20;

        var dropYbig = svgHeight -(i * 20);
        dropY = rowDropsY(rowID, svgHeight, dropYbig);


        if (dropY < 30){
            rowID = rowID + 1;
        }

        var smalldrop = group.append('path')
            .attr('fill', '#9ad5ef')
            .attr('d', 'M20.6,17.2c-2.6,2.7-6.8,2.7-9.5,0.1s-2.3-6.6-0.2-9.5c1-1.4,4.8-4.6,4.8-4.6s3.5,2.9,4.6,4.4 C22.6,10.8,23.1,14.6,20.6,17.2z')
            .attr('class', 'drop')
            .attr('id', ('drop' + i))
            .attr('transform', 'translate('+ dropX+ ','+ dropY+')')
            .attr('opacity', 0);

    }

    var tl = new TimelineMax();

    $(".drop").each(function(i,el){

        var dRand = Math.random()*1;
        tl.to($(el), 0.2, {autoAlpha:1, ease:Sine.easeOut}, dRand);

    });
}


function generateAssets() {


    // Daten laden ---->

    loadJSON('json/assets.json', function (text) {
        var allItems = JSON.parse(text);

        var arrValues = [];
        var arrImages = [];
        var arrNames = [];

        for (var i = 0; i < allItems.assetList.length; i++) {
            var singleAsset = allItems.assetList[i];
            var AssetID = singleAsset.valueLitre;
            var AssetImage = singleAsset.pic;
            var AssetName = singleAsset.assetName;

            arrValues.push(AssetID);
            arrImages.push(AssetImage);
            arrNames.push(AssetName);

        }

       //svgSlider(arrValues, arrImages, arrNames);
       svgButtons(arrValues, arrImages, arrNames);

        
       /* $('.assetpics').on('click', '.thumb', function() {
            var numDrops = parseInt(this.id) / 10;
            renderSVG(numDrops) ;    */

        });


}

//--- Textlayer befüllen ------------------------------------------------------------------------------------ //

function generateAssetLayer( _assetName, _assetLitre, _imgSource, _slideNum, _allSlides ) {


    var layerTopPos = (document.getElementById("d3-content").offsetHeight / 2) -100;

    var assetName = _assetName;
    var assetLitre = thousendPoints(_assetLitre.toString());
    var imgSource = _imgSource;

    $('.ctn-asset').css({opacity:0});
    TweenMax.to(".ctn-asset", 0, {top:0}, 0);
    
    $('#img-asset').empty();
    $('#litre-asset').empty();
    $('#txt-asset').empty();
    $('#slide-num').empty();

    $('#img-asset').append('<img src="images/' + imgSource + ' "/></div>');
    $('#litre-asset').append(assetLitre + '<span style="font-size:0.4em"> Liter </span>');
    $('#txt-asset').append('Wasser werden für die Herstellung von <span style="font-family:HelveticaBold">' + assetName + '</span> benötigt.');
    $('#slide-num').append('(' + _slideNum + '/' + _allSlides + ')');

    TweenMax.to(".ctn-asset", 1, {top:layerTopPos, opacity:1, delay:1, ease:Back.easeOut}, 0.1);


}

function generateStartLayer() {


    var layerTopPos = (document.getElementById("d3-content").offsetHeight / 2) -100;


    TweenMax.to(".ctn-asset", 0.1, {top:0, opacity:0, ease:Back.easeOut}, 0.1);

    $('#img-asset').empty();
    $('#litre-asset').empty();
    $('#txt-asset').empty();
    $('#slide-num').empty();

    $('#txt-asset').append('Der Mensch verbraucht durchschnittlich 123 Liter Wasser am Tag. Doch wie viel Wasser wird eigentlich bei der Herstellung von verschiedenen Produkten verwendet? <br> <br> Schauen Sie selbst... ein Tropfen in der Grafik bedeutet zehn Liter. ');
    $('#litre-asset').append('<span style="font-size:0.5em; line-height:1.4em">Virtuelles Wasser</span>');



    TweenMax.to(".ctn-asset", 1, {top:layerTopPos, height: 200, opacity:1, delay:1, ease:Back.easeOut}, 0.1);
                                                                                                                                                                                                                                                     

}


//--- Document Ready ----------------------------------------------------------------------------------------   //

$(document).ready( function()  {

   drop_pixel();

    window.addEventListener ? window.addEventListener("message", $.receive_message) : window.attachEvent("onmessage", $.receive_message);

    renderSVG(1568);
    generateAssets();
    generateStartLayer();
    //svgSlider();




} );
    
  




    



