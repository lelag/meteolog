
Ext.onReady(function() {
    Ext.QuickTips.init();
    var cmp1 = new MeteoLogViewport({
        renderTo: Ext.getBody(),
        listeners: {
          afterrender: function() {
            Ext.get('loading').remove();
            Ext.get('loading-mask').fadeOut({remove:true});
          }
        }
    });
    cmp1.show();

    if (Ext.isIE) {
        setTimeout(function() {
          var err_win = new Ext.Window({
                              layout:'fit',
                              width:620,
                              title:'Oups...',
                              height:230,
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
    
});
