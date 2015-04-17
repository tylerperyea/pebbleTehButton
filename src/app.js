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



function reload(wind) {
    var sk = skip;
    ajax({
            url: pollURL + "/" + sk,
            type: 'json'
        },
        function(json) {
            lastHistory=json;
            drawHistory(wind, json);
        },
        function(error) {
            console.log('Ajax failed: ' + error);
        }
    );
}

function redraw(wind){
  if(lastHistory!=null){
    drawHistory(wind,lastHistory);
  }
}

function drawHistory(wind, history) {
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
        if (tstamp == null) {
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
    if (rects.length <= 0) {
        for (var i = 0; i < 60; i += 10) {
            var obj = {
                position: new Vector2(20 + (60 - i) * wpt, 0),
                size: new Vector2(1, th)
            };
            var rect = new UI.Rect(obj);
            wind.add(rect);
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
    skip += 10;
    reload(wind);
});
wind.on('click', 'up', function(e) {
    skip -= 10;
    if (skip < 0) {
        skip = 0;
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
    redraw(wind);
}, 1000);
reload(wind);