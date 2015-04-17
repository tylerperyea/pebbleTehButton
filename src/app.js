/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */
var ajax = require('ajax');
var URL = 'http://peryea.duckdns.org:8080/';
var pollURL = URL+'history/10';
var UI = require('ui');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');
var cur={"payload":{"seconds_left":-1,"now_str":"0000000000"}, "last":0};
var skip=0;
var now="";
var last=[];
//{"payload":{"seconds_left":0,"now_str":"0000000000"}, "last":0};

var main = new UI.Card({
  title: 'TehButton',
  //icon: 'images/timer.png',
  subtitle: 'The Button',
  body: 'Don\'t press the button'
});

main.show();

main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var resultsCard = new UI.Card({
    title: 'CountDown',
    body: "loading"
  });
  resultsCard.show();
  // splashCard.hide();
  //Refresh timer
  /*
  setInterval(function(){
    var tt=(new Date()-cur["last"])/1000;
    var bod=Math.floor((cur.payload.seconds_left-1-tt)) + " : " + tt;
    var c=0;
    for(i=last.length-1;i>=0 && c<3;i--){
      bod+="\n" + last[i];
      c++;
    }
    
    resultsCard.body(bod);
    resultsCard.show();
    //splashCard.hide();
  
  },100);
  */
  
  
  //this is just to monitor, by polling every 20 seconds
  setInterval(function(){
    ajax({url: pollURL, type: 'json'},
        function(json) {
          resultsCard.body(JSON.stringify(json));
          /*
          if(cur.payload.now_str.localeCompare(json.payload.now_str)<=0){
            if(cur.payload.seconds_left<json.payload.seconds_left){
                //Vibe.vibrate('short');
              if(cur.payload.seconds_left>=0){
                last.push(cur.payload.seconds_left-1);
              }else if(cur.payload.seconds_left<=30){
                //Vibe.vibrate('long');
                last.push(cur.payload.seconds_left-1);
              }
            }
            cur=json;
            cur["last"]=(new Date())-1;
          }*/
        },
        function(error) {
          console.log('Ajax failed: ' + error);
        }
      );
  },1000);
  
  
  
});


main.on('click', 'down', function(e) {
  // Create a dynamic window
  var wind = new UI.Window();
  // Add a rect element
 // var rect = new UI.Rect({ size: new Vector2(20, 20) });
 // var vecAdd=new Vector2(1, 0) ;
 // wind.add(rect);
  wind.show();
  wind.on('click', 'down', function(e) {
    skip+=10;
    reload(wind);
  });
  wind.on('click', 'up', function(e) {
    skip-=10;
    if(skip<0){
      skip=0;
    }
    reload(wind);
  });
  wind.on('click', 'select', function(e) {
    reload(wind);
  });
  
   //this is just to monitor, by polling every 20 seconds
  setInterval(function(){
    reload(wind);
  },5000);
  reload(wind);
});

function reload(wind){
  var sk=skip;
    ajax({url: pollURL+"/" + sk, type: 'json'},
        function(json) {
          if(sk==0){
            now=json[0].now_str;
          }
          drawHistory(wind,json);
          
        },
        function(error) {
          console.log('Ajax failed: ' + error);
        }
      );
}
function drawHistory(wind, history){
  var rects=[];
  var texts=[];
  wind.each(function(element) {
    if(element.text===undefined){
      rects.push(element);
    }else{
      texts.push(element);
    }
    //console.log('Element: ' + JSON.stringify(element));
  });
    var th=144-20;
    var tw=144-20;
    var wpt=tw/60;  
    var hit=th/history.length;
    var tstamp = null;
    for(var i in history){
      var h=history[i];
      if(tstamp==null){
        tstamp=h.now_str;
      }
      var obj ={ position: new Vector2(20, i*(hit)+1),
                     size: new Vector2((60-h.seconds_left)*wpt,hit-1) };
      var tobj ={ position: new Vector2(1, i*(hit)-hit/2+2),
                     size: new Vector2(20,hit-1) };
      var rect=rects[i];
      var lab=texts[i];
      if(rect===undefined){
        rect=new UI.Rect(obj);
        wind.add(rect);
      }else{
        rect.animate(obj);
      }
      if(lab===undefined){
        lab=new UI.Text(tobj);
        lab.font("gothic-18-bold");
        wind.add(lab);
      }else{
        lab.animate(tobj);
      }
      var txt="00"+h.seconds_left+"";
      lab.text(txt.substring(txt.length-2,txt.length));
    }
    var tlab = texts[history.length];
    var tpos={ position: new Vector2(0, 144-hit),
              size: new Vector2(144,hit),textAlign:"center"};
    if(tlab===undefined){
      tlab=new UI.Text(tpos);
      tlab.font("gothic-14-bold");
      wind.add(tlab);
    }else{
      tlab.animate(tpos);
    }
    tlab.text(moment(getDateTS(tstamp)).fromNow());
    if(rects.length<=0){
      for(var i=0;i<60;i+=10){
        var obj ={ position: new Vector2(20+(60-i)*wpt, 0),
                       size: new Vector2(1,th) };
        var rect=new UI.Rect(obj);
        wind.add(rect);
      }
    }
  
  //wind.show();
  
}

function getDateTS(str){
  var dd=str.split("-");
  dd[1]--;
  return Date.UTC(dd[0]-0,dd[1]-0,dd[2]-0,dd[3]-0,dd[4]-0,dd[5]-0);
}
