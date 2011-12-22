MLGradientLegend = Ext.extend(Ext.Window, {
  layout:'fit',
  tip: new  Ext.Tip({
    title:'test' 
  }),
  width:200,
  height:100,
  closeAction:'close',
  modal:false,
  isInit: false,
  border: false,
  rect: null,
  lowValue: "0",
  lowValueEl: null,
  middleValue: "50",
  middleValueEl: null,
  highValue: "100",
  highValueEl: null,
  x:10,
  y:400,
  style:'opacity:0.7',
  gradientConfig: null,
  registerElement: function(el) {
    if(!this.registerStore)
      this.registerStore = {};
    if(el.ident && !this.registerStore[el.ident]) {
      this.registerStore[el.ident] = el;
    }
  },
  getReg: function(ident) {
    return this.registerStore[ident];
  },
  initComponent: function() {
    var me = this;
    Ext.applyIf(this, {
      items: [
        {
          xtype:'raphael',
          ident:'raphaelbox',
          listeners: {
            render: function(el) {
              me.registerElement(el);
              if(!this.isInit)
                me.initGradient();
            }
          }
        }
      ] 
    });
    MLGradientLegend.superclass.initComponent.call(this);
  },
  initGradient : function() {
    this.isInit = true;
    var r = this.getReg('raphaelbox');
    this.rect = r.paper.rect(5, 5, 180, 25).attr({stroke: '#000000'});
    var me = this;
    this.rect.mousemove(function(e, x, y){ 
      var x = e.layerX - 5;
      var v = x / 180 * me.highValue; 
      me.tip.setTitle(v.toPrecision(2));
      if(me.tip.hidden)
        me.tip.showAt([e.clientX, e.clientY]);
    });
    this.rect.mouseout(function() {
      me.tip.hide();
    });
    if(this.gradientConfig)
      this.setGradient(this.gradientConfig);
    r.paper.path("M5,35l180,0").attr({stroke:'#000000'});
    r.paper.path("M5,35l0,5").attr({stroke:'#000000'});
    r.paper.path("M95,35l0,5").attr({stroke:'#000000'});
    r.paper.path("M185,35l0,5").attr({stroke:'#000000'});
    this.lowValueEl = r.paper.text(5, 50, this.lowValue);
    this.middleValueEl = r.paper.text(95, 50, this.middleValue);
    this.highValueEl = r.paper.text(185, 50, this.highValue).attr({'text-anchor': 'end'});
  },
  setGradient : function(gradient) {
    var attr = this.buildGradientAttr(gradient);
    this.rect.attr(attr);
  },
  setLimit : function(low, high) {
    this.lowValue = low;
    this.middleValue = (high - low) / 2
    this.highValue = high;
    this.lowValueEl.attr({text: this.lowValue});
    this.middleValueEl.attr({text: this.middleValue});
    this.highValueEl.attr({text: this.highValue});
  },
  rgbToHex : function(rgb) {
    function decimalToHex (d, padding) {
        var hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

        while (hex.length < padding) {
            hex = "0" + hex;
        }

        return hex;
    }

    re = /rgba?\((\d{0,3}),(\d{0,3}),(\d{0,3})\)/
    m = re.exec(rgb);
    r = decimalToHex(m[1]);
    g = decimalToHex(m[2]);
    b = decimalToHex(m[3]);
    return '#'+r+g+b;
  },
  buildGradientAttr : function(gradient) {
    function keys(obj) {
        var keys = [];
        for(var key in obj) {
            keys.push(key);
        }
        return keys;
    }
    var k = keys(gradient);
    k.sort();
                        
    var s = "0";
    for(var i = 0; i < k.length; i++) {
      var c = this.rgbToHex(gradient[k[i]]);
      var t = k[i] * 100;
      s += "-"+c+":"+t;
    }
    return {'fill': s, 'opacity-opacity': 1};
  }


});
