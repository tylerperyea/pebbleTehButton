/**
 * TehButton monitor for pebble
 *
 * Simple ajaxing tool for keeping track of the button
 */
var ajax = require('ajax');
var URL = 'http://peryea.duckdns.org:8080/';
var pollURL = URL + 'history/10';
var UI = require('ui');
var Vector2 = require('vector2');
var skip = 0;
var lastHistory = null;
var setStyle="history";
var style = "history";
var lasttick=null;
function reload(wind) {
    if(setStyle=="history"){
    var sk = skip;
    ajax({
            url: pollURL + "/" + sk,
            type: 'json'
        },
        function(json) {
            lastHistory=json;
           if(setStyle=="history"){
            drawHistory(wind, json);
           }
        },
        function(error) {
            console.log('Ajax failed: ' + error);
        }
    );
    }
}

function redrawTimer(wind){
  if(setStyle=="timer"){
    ajax({
              url: URL,
              type: 'json'
          },
          function(json) {
              if(setStyle=="timer"){
                lasttick=json;
                drawTimer(wind, json);
                
              }
          },
          function(error) {
            if(lasttick!=null){
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
function drawTimer(wind,json){
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
    var tlab = texts[0];
   var timelab = texts[1];
     
   var tpos = {
        position: new Vector2(0, (json.payload.seconds_left*120)/60),
        size: new Vector2(144, 40),
        textAlign: "center"
    };
  
   var tposStatus = {
        position: new Vector2(0, 0),
        size: new Vector2(144, 30),
        textAlign: "center"
    };
  
    if (tlab === undefined) {
        tlab = new UI.Text(tpos);
        tlab.font("gothic-28-bold");
        wind.add(tlab);
    } else {
        tlab.animate(tpos);
    }
    tlab.text(json.payload.seconds_left);  
  
    if (timelab === undefined) {
        timelab = new UI.Text(tposStatus);
        timelab.font("gothic-24-bold");
        timelab.add(tlab);
    } else {
        timelab.animate(tposStatus);
    }
    timelab.text(moment(getDateTS(json.payload.now_str)).fromNow());
    //timelab.text(json.payload.seconds_left);  
  var obj = {
        position: new Vector2(0, (json.payload.seconds_left*120)/60+20),
        size: new Vector2(144, 144)
    };
   var trect = rects[0];
  if(trect===undefined){
    trect = new UI.Rect(obj);
            wind.add(trect);
  }else{
    trect.animate(obj);
  }
  
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
    for (var i in history) {
        var h = history[i];
        if (tstamp === null) {
            tstamp = h.now_str;
        }
        var obj = {
            position: new Vector2(20, i * (hit) + 1),
            size: new Vector2((60 - h.seconds_left) * wpt, hit - 1)
        };
        var tobj = {
            position: new Vector2(1, i * (hit) - hit / 2 + 2),
            size: new Vector2(20, hit - 1)
        };
        var rect = rects[i];
        var lab = texts[i];
        if (rect === undefined) {
            rect = new UI.Rect(obj);
            wind.add(rect);
        } else {
            rect.animate(obj);
        }
        if (lab === undefined) {
            lab = new UI.Text(tobj);
            lab.font("gothic-18-bold");
            wind.add(lab);
        } else {
            lab.animate(tobj);
        }
        var txt = "00" + h.seconds_left + "";
        lab.text(txt.substring(txt.length - 2, txt.length));
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