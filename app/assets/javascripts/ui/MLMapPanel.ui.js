

MLMapPanelUi = Ext.extend(GeoExt.MapPanel, {
    border: false,
    title: 'MeteoLog Weather Log',
    cls: 'main_window',
    //from_date: isOldIE() ? false : new Date(Date.now() - (7*3600*24*1024)),
    from_date: new Date(1323392457 * 1000),
    to_date: new Date(),
    currentLayer: 'none',
    temperatureLayer: null,
    pressureLayer: null,
    mapData:null,
    mapDataRef: [],
    currentId: 0,
    registerElement: function(el) {
      if(!this.registerStore)
        this.registerStore = {};
        this.registerStore[el.ident] = el;
    },
    getReg: function(ident) {
      return this.registerStore[ident];
    },

    initComponent: function() {
        var me = this;
        Ext.applyIf(this, {
            tbar: {
                xtype: 'toolbar',
                items: [
                    {
                        xtype: 'label',
                        text: 'Start :'
                    },
                    {
                        xtype: 'spacer',
                        width: 20
                    },
                    {
                        xtype: 'datefield',
                        ident: 'from_datefield',
                        vtype: 'daterange_ml_map',
                        endDateField: 'to_datefield',
                        format: 'Y-m-d',
                        width: 100,
                        listeners: {
                          render: function(combo) {
                              me.registerElement(combo);
                          },
                          change: function(f, n, o) {
                              me.from_date = n;
                          }
                        }
                    },
                    {
                        xtype: 'spacer',
                        width: 20
                    },
                    {
                        xtype: 'label',
                        text: 'End :'
                    },
                    {
                        xtype: 'spacer',
                        width: 20
                    },
                    {
                        xtype: 'datefield',
                        ident: 'to_datefield',
                        startDateField: 'from_datefield',
                        vtype: 'daterange_ml_map',
                        format: 'Y-m-d',
                        width: 100,
                        listeners: {
                          render: function(combo) {
                              me.registerElement(combo);
                          },
                          change: function(f, n, o) {
                              me.to_date = n;
                          }
                        }
                    },{
                        xtype: 'button',
                        text: 'Load Period',
                        handler: function() {
                          me.loadMapData();
                        },scope: this
                    },{
                        xtype: 'spacer',
                        width: 40
                    },
                    {
                        text: 'Switch Layer Type :',
                        menu: {      
                            items: [
                                '<b class="menu-title">Choose a layer</b>',
                                {
                                    text: 'Temperature',
                                    layer_name :'temperature',
                                    handler: me.onLayerClick,
                                    scope: this
                                }, {
                                    text: 'Atmospheric pressure',
                                    layer_name: 'pressure',
                                    handler: me.onLayerClick,
                                    scope: this
                                },{
                                    text: 'Wind Speed',
                                    layer_name: 'wind_strength',
                                    handler: me.onLayerClick,
                                    scope: this
                                }
                            ]
                        }
                    },{
                        xtype: 'spacer',
                        width: 20
                    },{
                      xtype: 'label',
                      text: 'Temperature',
                      ident:'layer_name_label',
                      listeners: {
                          render: function(e) {
                              me.registerElement(e);
                          }
                      }
                    }

                ]
            }
        });
        

        this.map = new OpenLayers.Map({
              eventListeners: {
                  "click": this.onMapClick.createDelegate(this)
              }
        });

        this.markerLayer = new OpenLayers.Layer.Markers( "Markers" );

        
        try {
          this.layer = new OpenLayers.Layer.Google(
                "Google Physical",
                {type: G_PHYSICAL_MAP}
            );
        } catch(err) {
          this.layer = new OpenLayers.Layer.MapServer( "OpenLayers WMS", // fallback in case of issues with gmaps.
          "http://labs.metacarta.com/wms/vmap0", {layers: 'basic'} );
        }


        this.center = new OpenLayers.LonLat(2.084444, 47.396389); //center on Bourges
        this.zoom = 6;

        this.map.addLayer(this.layer);
        this.map.addLayer(this.markerLayer);

        this.map.addControl(new OpenLayers.Control.LayerSwitcher());
        this.updateMapData = function() {
            this.map.setCenter(this.center);
        }

        this.roundPixels = function(p){
		if(p.x < 0 || p.y < 0)
			return false;
			
		// fast rounding - thanks to Seb Lee-Delisle for this neat hack
		p.x = ~~ (p.x+0.5);
		p.y = ~~ (p.y+0.5);
		return p;
	};

        this.initDateRangeVtype();

        this.on('render', function() {
        });

        this.on('afterrender', function() { 
          //set date 
          this.getReg('from_datefield').setValue(this.from_date);
          this.getReg('to_datefield').setValue(this.to_date);
          setTimeout(function() {
            me.initLayer();
            me.loadMapData(); 
            me.setCurrentLayer('temperature');
          }, 1000);
        });

        MLMapPanelUi.superclass.initComponent.call(this);
        this.addEvents('map_click', 'new_map_data');
    },
    loadMapData : function() {
      //get data
          var me = this;
          //reset current data
          this.mapData = null;
          this.mapDataRef = [];

          this.el.mask('loading...', 'loadingMask');
          Ext.Ajax.request({
            url: '/readings.json',
            method: 'GET',
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                me.processMapData(obj);
                me.getEl().unmask(); 
            },
            failure: function(response, opts) {
                humane.error('server-side failure with status code ' + response.status);
                me.getEl().unmask(); 
            },
            aheaders: {
                'my-header': 'foo'
            },
            params: {
                from_date: this.from_date.strftime("%Y-%m-%d"),
                to_date: this.to_date.strftime("%Y-%m-%d")
            }
          });


    },
    processMapData : function(data) {
      for (var key in data.temperature) {
            this.mapDataRef.push(key);
      }
      this.mapData = data; 
      this.setLayerData(0);
      this.currentId = 0;
      this.fireEvent('new_map_data', this, this.mapDataRef.length -1);
    },
    sliderChanged : function(slider, new_value, old_value) {
      this.setLayerData(new_value);
    },
    setLayerData : function(id) {
      this.currentId = id;
      var currentLayer = this.getLayer(this.currentLayer);
      var date = new Date(this.mapDataRef[id]*1000);
      humane.info(date.strftime("%Y-%m-%d %H:%M"));
      currentLayer.setDataSet(this.mapData[this.currentLayer][this.mapDataRef[id]]);
    },
    initLayer : function() {
      this.temperatureLayer = new OpenLayers.Layer.Heatmap( "Temperature", this.map, this.layer, {visible: true, radius:90, opacity:30,
      gradient:{ 0.45: "rgb(0,0,255)", 0.01: "rgb(0,255,255)", 0.33: "rgb(0,255,0)", 0.66: "yellow", 1.0: "rgb(255,0,0)"}
      }, {isBaseLayer: false, opacity: 0.3});

      this.pressureLayer = new OpenLayers.Layer.Heatmap( "Pressure", this.map, this.layer, {visible: true, radius:110, opacity:30,
      gradient:{ 0.45: "rgb(0,0,255)", 0.95: "rgb(0,255,255)", 0.97: "rgb(0,255,0)", 0.99: "yellow", 1.0: "rgb(255,0,0)"}
      }, {isBaseLayer: false, opacity: 0.3});

      this.windStrengthLayer = new OpenLayers.Layer.Heatmap( "Wind Speed", this.map, this.layer, {visible: true, radius:90, opacity:30,
      gradient:{ 0.45: "rgb(0,0,255)", 0.01: "rgb(0,255,255)", 0.33: "rgb(0,255,0)", 0.66: "yellow", 1.0: "rgb(255,0,0)"}
      }, {isBaseLayer: false, opacity: 0.3});
    },
    getLayer : function(layerName) {
        switch(layerName) {
          case 'temperature':
            return this.temperatureLayer; 
            break;
          case 'pressure':
            return this.pressureLayer; 
            break;
          case 'wind_strength':
            return this.windStrengthLayer;
            break;
        }
    },
    setCurrentLayer : function(layer) {
        if (layer == this.currentLayer) { 
          return true;
        }
        var currentLayer = this.getLayer(this.currentLayer);
        var new_layer = this.getLayer(layer);

        if(currentLayer != null) {
          this.map.removeLayer(currentLayer);
        }
        this.currentLayer = layer;
        this.map.addLayer(new_layer);
        if(this.mapData)
          this.setLayerData(this.currentId); // do not load on initial load
    },
    onLayerClick : function(b, e) {
        var text = b.text;
        var layer_name = b.layer_name;
        this.getReg('layer_name_label').setText(text);
        this.setCurrentLayer(layer_name);
    },
    /* setup the vtype for the main datefields */
    initDateRangeVtype : function() {
      var me = this;
      Ext.apply(Ext.form.VTypes, {
          daterange_ml_map : function(val, field) {
              var date = field.parseDate(val);

              if(!date){
                  return false;
              }
              if (field.startDateField) {
                  var start = me.getReg(field.startDateField);
                  if (!start.maxValue || (date.getTime() != start.maxValue.getTime())) {
                      start.setMaxValue(date);
                      start.validate();
                  }
              }
              else if (field.endDateField) {
                  var end = me.getReg(field.endDateField); 
                  if (!end.minValue || (date.getTime() != end.minValue.getTime())) {
                      end.setMinValue(date);
                      end.validate();
                  }
              }
              /*
              * Always return true since we're only using this vtype to set the
              * min/max allowed values (these are tested for after the vtype test)
              */
              return true;
          }
      });

    },
    setStationMarker : function(st_data) {
        var size = new OpenLayers.Size(32,32);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        var icon = new OpenLayers.Icon('/assets/icons/flag_red.gif', size, offset);
        this.markerLayer.clearMarkers();
        this.markerLayer.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(st_data.lng,st_data.lat),icon));
    },
    onMapClick : function(e) {
        var lonlat = this.map.getLonLatFromViewPortPx(e.xy);
        this.fireEvent('map_click', this, lonlat);
    }
});
