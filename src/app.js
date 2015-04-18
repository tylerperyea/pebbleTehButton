/**
 * TehButton monitor for pebble
 *
 * Simple ajaxing tool for keeping track of the button
 */
var Vibe = require('ui/vibe');
var Light = require('ui/light');

var ajax = require('ajax');
var URL = 'http://peryea.duckdns.org:8080/';
var pollURL = URL + 'full/10';
var fullURL = URL + 'full/2';
var UI = require('ui');
var Vector2 = require('vector2');
var skip = 0;
var lastHistory = null;
var setStyle="history";
var style = "history";
var lasttick=null;
var lastFull=null;
var best=null;

function reload(wind) {
    if(setStyle=="history"){
    var sk = skip;
    ajax({
            url: pollURL + "/" + sk,
            type: 'json'
        },
        function(json) {
           if(lastFull!==null && json.best.seconds_left < lastFull.best.seconds_left){
              Vibe.vibrate('long');
              Light.trigger();
           }
           lastFull=json;
           lastHistory=json.history;
           if(setStyle=="history"){
            drawHistory(wind, lastHistory);
           }
        },
        function(error) {
            if(lastHistory!=null){
              drawHistory(wind, lastHistory);
            }
            console.log('Ajax failed: ' + error);
        }
    );
    }
}

function redrawTimer(wind){
  if(setStyle=="timer"){
    ajax({
              url: fullURL,
              type: 'json'
          },
          function(json) {
            if(lastFull!==null && json.best.seconds_left < lastFull.best.seconds_left){
              Vibe.vibrate('long');
              Light.trigger();
           }
           lastFull=json;
              if(setStyle=="timer"){
                lasttick=json;
                drawTimer(wind, json);
                
              }
          },
          function(error) {
            if(lasttick!==null){
              drawTimer(wind,lasttick);
            }
              console.log('Ajax failed: ' + error);
          }
      );
  }
}
function clearWindow(wind){
  var tpos = {
        position: new Vector2(-100, -100),
        size: new Vector2(1, 1)
    };
  

  wind.each(function(element) {
      element.animate(tpos);
    });
}
function drawTimer(wind,jsonF){
    var json=jsonF.current;
    var best=jsonF.best;
    if(style=="history"){
      clearWindow(wind);
      style="timer";
    }
    var rects = [];
    var texts = [];
    wind.each(function(element) {
        if (element.text === undefined) {
            rects.push(element);
        } else {
            texts.push(element);
        }
    });
  
    var txtCount=json.payload.seconds_left+"";
    var tpos = {
        position: new Vector2(0, (json.payload.seconds_left*120)/60),
        size: new Vector2(144, 80),
        textAlign: "center",
        font: "gothic-24-bold",
        text: txtCount
    };
    var tposBack = {
      position: new Vector2(144/2-20, (json.payload.seconds_left*120)/60),
        size: new Vector2(40, 40),
              backgroundColor:"black"
    };
  
    var txtTime=moment(getDateTS(json.payload.now_str)).fromNow();
    var tposStatus = {
        position: new Vector2(0, 0),
        size: new Vector2(144, 30),
        textAlign: "center",
        text:txtTime,
        font: "gothic-18-bold"
    };
  
    
   
  
  for(var i=0;i<6;i++){
      makeOrAnimateRect(wind,rects[i],{
              position: getVerticalPos(i*10),
              size: new Vector2(144, 1)
          });
  }
  makeOrAnimateRect(wind,rects[6],{
              position: getVerticalPos(best.seconds_left),
              size: new Vector2(144, 2)
  });
  makeOrAnimateRect(wind,rects[7],{
              position: getVerticalPosTxt(best.seconds_left),
              size: new Vector2(144/4, 20),
              backgroundColor:"black"
  });
  makeOrAnimateRect(wind,rects[8],tposBack);
    makeOrAnimateRect(wind,rects[9],{
          position: getVerticalPos(json.payload.seconds_left),
          size: new Vector2(144, 144)
      });
   makeOrAnimate(wind,texts[0],tpos);
   makeOrAnimate(wind,texts[1],tposStatus);
    //timelab.text(json.payload.seconds_left);  
   makeOrAnimate(wind,texts[2],{
        position: getVerticalPosTxt(best.seconds_left),
        size: new Vector2(144/4, 30),
        textAlign: "center",
        text: "*"+best.seconds_left+"*",
        font: "gothic-18-bold"
    });
  
}
function getVerticalPos(t){
  return new Vector2(0, (t*120)/60+30);
}
function getVerticalPosTxt(t){
  return new Vector2(144/8, (t*120)/60+17);
}
function makeOrAnimate(wind, timelab, tpos){
  if (timelab === undefined) {
        timelab = new UI.Text(tpos);
        wind.add(timelab);
    } else {
        timelab.animate(tpos);
    }
    if(tpos.font!=null){
      timelab.font(tpos.font);
    }
    if(tpos.txt!=null){
      timelab.text(tpos.text);
    }
    return timelab;
}
function makeOrAnimateRect(wind, timelab, tpos){
    if (timelab === undefined) {
        timelab = new UI.Rect(tpos);
        wind.add(timelab);
    } else {
        timelab.animate(tpos);
    }
    if(tpos.backgroundColor!=null){
       timelab.backgroundColor(tpos.backgroundColor);
    }
    return timelab;
}

function drawHistory(wind, history) {
    if(style!="history"){
      clearWindow(wind);
    }
    style="history";
    var rects = [];
    var texts = [];
    wind.each(function(element) {
        if (element.text === undefined) {
            rects.push(element);
        } else {
            texts.push(element);
        }
        //console.log('Element: ' + JSON.stringify(element));
    });
    var th = 144 - 20;
    var tw = 144 - 20;
    var wpt = tw / 60;
    var hit = th / history.length;
    var tstamp = null;
    var tomaketxt=[];
    for (var i in history) {
        var h = history[i];
        if (tstamp === null) {
            tstamp = h.now_str;
        }
        var obj = {
            position: new Vector2(20, i * (hit) + 1),
            size: new Vector2((60 - h.seconds_left) * wpt, hit - 1),
                 backgroundColor:"white"
        };
        var txt = "00" + h.seconds_left + "";
        txt=txt.substring(txt.length - 2, txt.length);  
        var tobj = {
            position: new Vector2(1, i * (hit) - hit / 2 + 2),
            size: new Vector2(20, hit - 1),
            font:"gothic-18-bold",
            text:txt
        };
        var rect = rects[i];
        var lab = texts[i];
        tomaketxt.push({"lab":texts[i],"pos":tobj});
        
      
        if (rect === undefined) {
            rect = new UI.Rect(obj);
            wind.add(rect);
        } else {
            rect.animate(obj);
        }
    }
    for(var i in tomaketxt){
      var lab=tomaketxt[i].lab;
      var pos=tomaketxt[i].pos;
      makeOrAnimate(wind,lab,pos);
    }
    var tlab = texts[history.length];
    var tpos = {
        position: new Vector2(0, 144 - hit),
        size: new Vector2(144, hit),
        textAlign: "center"
    };
    if (tlab === undefined) {
        tlab = new UI.Text(tpos);
        tlab.font("gothic-14-bold");
        wind.add(tlab);
    } else {
        tlab.animate(tpos);
    }
    tlab.text(moment(getDateTS(tstamp)).fromNow());
        for (var i = 0; i < 6; i ++) {
            var obj = {
                position: new Vector2(20 + (60 - i*10) * wpt, 0),
                size: new Vector2(1, th)
            };
            var rect = rects[history.length+i];
            if(rect===undefined){
              rect = new UI.Rect(obj);
              wind.add(rect);
            }else{
              rect.animate(obj);
            }
        }
    

    //wind.show();

}

function getDateTS(str) {
    var dd = str.split("-");
    dd[1]--;
    return Date.UTC(dd[0] - 0, dd[1] - 0, dd[2] - 0, dd[3] - 0, dd[4] - 0, dd[5] - 0);
}

var wind = new UI.Window();
wind.show();
wind.on('click', 'down', function(e) {
    if(setStyle=="timer"){
      setStyle="history";
    }else{
      skip += 10;  
    }
    reload(wind);
});
wind.on('click', 'up', function(e) {
    skip -= 10;
    if (skip < 0) {
        skip = 0;
        setStyle="timer";
    }
    reload(wind);
});
wind.on('click', 'select', function(e) {
    reload(wind);
});

//this is just to monitor, by polling every 5 seconds
setInterval(function() {
    reload(wind);
}, 5000);
setInterval(function() {
    redrawTimer(wind);
}, 1000);
reload(wind);