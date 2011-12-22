/*
 * File: MLControlPanel.ui.js
 * Date: Fri Dec 16 2011 23:42:50 GMT+0100 (CET)
 *
 * This file was generated by Ext Designer version 1.2.2.
 * http://www.sencha.com/products/designer/
 *
 * This file will be auto-generated each and everytime you export.
 *
 * Do NOT hand edit this file.
 */

MLControlPanelUi = Ext.extend(Ext.Panel, {
    height: 40,
    layout:'hbox',
    layoutConfig: {
        align:'middle'
    },

    registerElement: function(el) {
      if(!this.registerStore)
        this.registerStore = {};
        this.registerStore[el.ident] = el;
    },
    getReg: function(ident) {
      return this.registerStore[ident];
    },

    //width: 100,
    //style: "border-bottom: 100px;",

    initComponent: function() {
        var me = this;
        Ext.applyIf(this, {
            frame:true,
            items: [{
                  xtype:'button',
                  text:'Play',
                  flex:1,
                  handler: this.playBack,
                  scope: this
                },
                {
                    xtype: 'slider',
                    id:'slider',
                    height: 40,
                    value: 0,
                    increment: 1,
                    minValue: 0,
                    maxValue: 6,
                    flex: 10,
                    ident: 'slider',
                    listeners: {
                      render: function(e) {
                        me.registerElement(e);
                      },
                      change: function(s, n, o) {
                        me.fireEvent('slider_change', s, n, o);
                      }
                    }
                }
            ]
        });

        MLControlPanelUi.superclass.initComponent.call(this);
        this.addEvents('slider_change');
    },
    playBack : function(button) {
      var b = button;
      b.disable();
      var slider = this.getReg('slider');
      var delay = 1000;
      for(var i=0, j=0; i <= slider.maxValue; i++) {
        setTimeout(function() {
          slider.setValue(j);
          j++;
          if(j==i)
            b.enable();
        }, delay);
        delay = delay + 500;
      }
    },
    setSlider : function(i) {
      var slider = this.getReg('slider');
      slider.setValue(i);
    },
    resetSlider : function(max) {
      var slider = this.getReg('slider');
      slider.setMinValue(0);
      slider.setMaxValue(max);
      slider.setValue(0);
    }
});