/*
 * File: xds_index.js
 * Date: Fri Dec 16 2011 23:42:50 GMT+0100 (CET)
 *
 * This file was generated by Ext Designer version 1.2.2.
 * http://www.sencha.com/products/designer/
 *
 * This file will be auto-generated each and everytime you export.
 *
 * Do NOT hand edit this file.
 */

Ext.onReady(function() {
    Ext.QuickTips.init();
    var cmp1 = new MeteoLogViewport({
        renderTo: Ext.getBody()
    });
    cmp1.show();

   setTimeout(function(){
    Ext.get('loading').remove();
    Ext.get('loading-mask').fadeOut({remove:true});
    }, 1000);
    
});
