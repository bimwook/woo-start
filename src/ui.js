var com = {};
com.id = function(o){
  var ret=(typeof o=="string")?document.getElementById(o) : o;
  if(ret==null) return null;
  ret.html = function(value){
    if(value===undefined){
      return this.innerHTML;
    }
    this.innerHTML = value;
  };
  ret.text = function(value){
    if(value===undefined){
      return this.innerText;
    }
    this.innerText = value;
  };
  ret.append = function(o){
    this.appendChild(o);
  };
  return ret;
};
com.element = function(tag){
  return this.id(document.createElement(tag));
};

var Hash  = function(){
  this.items = {};
  this.get = function(k){
    if(typeof(k)=="string"){
      return this.items[k];
    }
    return null;
  }
  this.set = function(k, item){
    if(typeof(k)=="string"){
      this.items[k] = item;
    }
  }
  this.foreach = function(f){
    if(typeof(f)=="function"){
      for(var k in this.items){
        f(k, this.items[k]);
      }
    }
  }
}
var List = function(){
  this.items = [];
  this.push = function(item){
    this.items.push(item);
  }
  this.indexOf = function(o){
    for(var i=0; i<this.items.length; i++){
      if(o==this.items[i]) return i;
    }
    return -1;
  }
  this.foreach = function(f){
    if(typeof(f)=="function"){
      for(var i=0; i<this.items.length; i++){
        f(this.items[i]);
      }
    }
  }
}
var ui = {};
ui.service = window.location.protocol + "//" + window.location.host;
ui.local = window.localStorage || {
  data: {},
  setItem: function(key, value) {
    this.data[key] = value;
  },
  getItem: function(key) {
    return this.data[key]
  }
};
ui.evt = {};
ui.evt.timer = null;
ui.evt.drag = false;
ui.evt.dom = null;
ui.evt.target = null;
ui.evt.coords = {x:0, y:0};
ui.evt.start = {x:0, y:0};
ui.evt.down = function(o, e){
  var me = this;
  this.timer = window.setTimeout(function(){
    me.drag = true;
    me.coords.x = e.x;
    me.coords.y = e.y;
    me.start.x = o.offsetLeft;
    me.start.y = o.offsetTop;
    o.className = "drag";
    o.style.left = me.start.x + "px";
    o.style.top = me.start.y + "px";
    me.dom = o;
  },1000);
  //e.preventDefault();          
}
ui.evt.move = function(o, e){
  var me = this;
  if(this.dom == o) return;
  if(this.target == o) return;
  if(this.drag){
    if(me.target){
      me.target.className = "";
    }
    me.target = o;
    me.target.className = "target";
  }
}
ui.evt.out = function(o, e){
  var me = this;
  if(this.drag) {
    if(this.target == o){
      o.className = "";
      this.target = null;
    }
  }
}
ui.evt.up = function(o, e){
  var me  = this;
  if(!this.drag){
    window.open(o.data.url);
  }
}
ui.container = com.id("container");
ui.body = document.body;
ui.body.onmousemove = ui.body.ontouchstart = function(e){
  var evt = ui.evt;
  if(evt.drag){
    var delta = { x: e.x - evt.coords.x, y: e.y - evt.coords.y };
    evt.dom.style.left = (evt.start.x + delta.x) + "px";
    evt.dom.style.top = (evt.start.y + delta.y) + "px";
  }
}
ui.body.onmouseup = ui.body.ontouchend = function(e){
  var evt = ui.evt;
  if(evt.timer){
    window.clearTimeout(evt.timer);
    evt.timer = null;
  }
  
  if(evt.target && evt.dom){
    evt.target.className = "";
    ui.container.insertBefore(evt.dom, evt.target);
    ui.buildorder();
  }
  
  if(evt.dom){
    evt.dom.className = "";
    evt.dom.style.left = "auto";
    evt.dom.style.top = "auto";
  }
  
  evt.dom = null;
  evt.target = null;
  evt.drag = false;
}
ui.hostname = window.localStorage.getItem("ext.hostname") || "https://www.bimwook.com:11180";
ui.drawitem = function(item, fixed){
  var me = this;
  var data = {rowid: item.rowid||"0", name: item.name||"无题", url: item.url||"about:blank"};
  var li = com.element("li");
  var div = com.element("div");
  var label = com.element("div");
  div.className = "icon";
  //div.style.backgroundColor = "rgb(" + (200+Math.floor(Math.random()*50)) + "," + (200+Math.floor(Math.random()*50)) + "," + (200+Math.floor(Math.random()*50)) + ")";
  var mc = data.url.match(/(http[s]?:\/\/[^\/]*).*/);
  if(mc){
    var img = new Image();
    var url = mc[1] + "/favicon.ico";
    img.onload = function(){
      div.style.backgroundImage = "url(" + url + ")";          
    }
    img.onerror = function(){
      div.style.backgroundImage = "url(./img/web.png)";
    }
    img.src = url;
  }
  else{
    div.style.backgroundImage = "url(/favicon.ico)";
  }
  
  label.className = "label";
  label.html(data.name);
  li.append(div);
  li.append(label);
  li.timer = null;
  li.icon = div;
  li.data = data;
  li.editing = false;
  if(fixed){
    li.onclick = function(){
      window.open(data.url);
    }
  }
  else {        
    li.onmousedown = function(e){
      me.evt.down(this, e);
    }
    li.onmousemove = function(e){
      me.evt.move(this, e);
    }
   
    li.onmouseout = function(e){
      me.evt.out(this, e);
    }
    li.onmouseup = function(e){
      me.evt.up(this, e);
    }  
  }
  return li;
}
ui.items = [ {name: "八月远方", url: "https://www.bimwook.com"}, {name: "O-MUEN", url: "https://omuen.com"} ];
ui.items = [];
ui.sort = function(o, callback){
  var me = this;
  function run(list){
    var all = new Hash();
    var ret = new List();
    for(var i=0; i<o.items.length; i++){
      var item = o.items[i];
      if(item && item.rowid){
        all.set(item.rowid, item);             
      }
    }
    for(var i=0; i<list.length; i++){
      var rowid = list[i];
      ret.push(all.get(rowid));
    }
    all.foreach(function(k, item){
      if(ret.indexOf(item)==-1){
        ret.push(item);
      }
    })
    callback(ret);          
  }
  var data = this.local.getItem("start.indexed")||"";
  if(data==""){
    run([]);  
  }
  else{
    var list = data.split('\n');
    run(list);
  }
}
ui.buildorder = function(){
  var list =  this.container.getElementsByTagName("li");
  var rowids = [];
  for(var i=0; i<list.length; i++){
    var li = list[i];
    rowids.push(li.data.rowid);
  }
  this.local.setItem('start.indexed', rowids.join('\n'));
}
ui.soon = {};
ui.soon.load = function(o){
  ajax.get(ui.hostname + "/woo/bin/soon/recent.do?uid=" + o.id, function(data, err){
    var mc = (data||"").match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\|(.*)$/);
    if(mc){
      var umemo = com.id("umemo");
      umemo.text(mc[2]);
    }
  });
};

ui.showme = function(o){
  var me = this;
  var uname = com.id("uname");
  var avatar = com.id("avatar");
  if(o.id.length>0){
    var nick = window.decodeURIComponent(o.nick);
    uname.html(nick);
    avatar.alt = nick;
    avatar.src = this.hostname + "/woo/avatar/icon.png?uid=" + o.id;
    document.title = "起始页 - " + nick;
  }
};

ui.loadlocal = function(){
  var me = this;
  ajax.get('./data/list.txt', function(data, error){
    var o = JSON.parse(data);
    me.sort(o, function(list){
      list.foreach(function(item){
        if(!item) return;
        var mc = item.url.match(/(http[s]?:\/\/[^\/]*).*/);
        if(!mc){             
          item.url = me.hostname + item.url;
        }
        me.container.append(me.drawitem(item, false));               
      });
    });   
  });
};

ui.load = function(){
  var me = this;
  ajax.get(this.hostname + '/woo/bin/favorite/list.do', function(data, error){
    try{
      var o = JSON.parse(data);
      me.sort(o, function(list){
        list.foreach(function(item){
          if(!item) return;
          var mc = item.url.match(/(http[s]?:\/\/[^\/]*).*/);
          if(!mc){             
            item.url = me.hostname + item.url;
          }
          me.container.append(me.drawitem(item, false));               
        });
      })
    }
    catch(e){
      console.log("Load from local.");
      me.loadlocal();
    }
  });
  
  ajax.get(this.hostname + '/woo/i.do', function(data, error){
    var o = {id:""};
    var mcs = (data||"").match(/^([^:\r\n]*): "([^"]*)",$/gm)||[];
    for(var i=0; i<mcs.length; i++){
      var mc = mcs[i].match(/^([^:]*): "([^"]*)",$/);
      o[[mc[1]]]=mc[2];
    }
    if(o.id.length>0){
      me.showme(o);  
      me.soon.load(o);
    }
  });
  
  var mc = window.location.search.match(/ticket=(ST-\d{3}-\d{40}-SSO)/);
  if(mc){
    var ticket = mc[1];
    var service = window.encodeURIComponent(me.service);
    ajax.get(this.hostname + "/woo/sso/validation.do?service=" + service + "&ticket=" + ticket, function(data, error){
      console.log(data);
      window.history.pushState({},0, me.service);	
      //window.location.search = "";
    });
  }
  
}
ui.load();
