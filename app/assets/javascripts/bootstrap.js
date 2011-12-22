
Ext.onReady(function() {

    if(!isOldIE()) {
      Ext.QuickTips.init();
      var cmp1 = new MeteoLogViewport({
          renderTo: Ext.getBody(),
          listeners: {
            afterrender: function() {
              setTimeout(function() {
                Ext.get('loading').remove();
                Ext.get('loading-mask').fadeOut({remove:true});
              }, 1000);
            }
          }
      });
      cmp1.show();
    } else {
        setTimeout(function() {
          Ext.get('loading').remove();
          Ext.get('loading-mask').fadeOut({remove:true});
          var err_win = new Ext.Window({
                              layout:'fit',
                              width:620,
                              title:'Sorry ...',
                              height:300,
                              closeAction:'close',
                              contentEl:'ie-oups',
                              modal:true,
                              plain:true,
                              buttons: [{
                                    text:'Fermer',
                                    handler:function() {
                                        err_win.close();
                                  },
                                  scope:this
                              }]
                          });  
          err_win.show();
        }, 1250);
    }

   //humane.js options
   humane.timeout = 0;
   humane.forceNew = true;


   var w = new MLGradientLegend(); 

   setTimeout(function() {
      w.show();
  }, 2000);


    
});
