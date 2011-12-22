/*
 * File: StationStore.js
 */

StationStore = Ext.extend(Ext.data.Store, {
    constructor: function(cfg) {
        cfg = cfg || {};
        StationStore.superclass.constructor.call(this, Ext.apply({
            storeId: 'StationStore',
            proxy: new Ext.data.HttpProxy({
              url:'/stations.json',
              method:'get'
            }),
            reader: new Ext.data.JsonReader({
                root:'rows',
                totalProperty:'totalCount',
                id:'id'
            },[
                {
                    name: 'id'
                },
                {
                    name: 'name'
                },{
                    name: 'omm_code'
                },
                {
                    name: 'lat'
                },
                {
                    name: 'lng'
                }
            ])
        }, cfg));
    }
});

MLStationStore = new StationStore({autoLoad:true});
