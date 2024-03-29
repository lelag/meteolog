

MLMapPanelUi = Ext.extend(GeoExt.MapPanel, {
    proj4326 : new OpenLayers.Projection("EPSG:4326"),
    projmerc : new OpenLayers.Projection("EPSG:900913"),
    id:'test_mapml',
    border: false,
    title: 'MeteoLog Weather Log',
    cls: 'main_window',
    from_date: isOldIE() ? false : new Date(Date.now() - (7*3600*24*1024)),
    to_date: new Date(),
    currentLayer: 'none',
    temperatureLayer: null,
    pressureLayer: null,
    mapData:null,
    mapDataRef: [],
    currentId: 0,
    gradientLegend: null,
    settingWindow:null,
    gradient: { 0.05: "rgb(0,0,255)", 0.40: "rgb(0,255,255)", 0.60: "rgb(0,255,0)", 0.80: "rgb(255,255,0)", 0.95: "rgb(255,0,0)"},
    gradientOpacity: 0.3,
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
                        minValue:new Date(1323392457 * 1000),
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
                        maxValue:new Date(),
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
                        text: 'Load Data',
                        iconCls: 'refresh-icon',
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
                    },'->',{
                      xtype:'button',
                      iconCls:'rainbow',
                      enableToggle:true,
                      ident:'rainbow_button',
                      handler: this.toggleLegend,
                      disabled:true,
                      scope:this,
                      listeners: {
                          render: function(e) {
                              me.registerElement(e);
                          }
                      }
                    },{
                      xtype:'button',
                      iconCls:'wrench',
                      enableToggle:true,
                      ident:'settings_button',
                      handler: this.toggleSettings,
                      scope:this,
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
              projection: this.projmerc,
              displayProjection: this.proj4326,
          
              eventListeners: {
                  "click": this.onMapClick.createDelegate(this)
              }
        });

        this.markerLayer = new OpenLayers.Layer.Markers( "Stations" );

        
        try {
          this.layer = new OpenLayers.Layer.Google("Google",
              {'sphericalMercator': true,
               'maxExtent': new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
                type: G_PHYSICAL_MAP
              });
          
        } catch(err) {
          this.layer = new OpenLayers.Layer.OSM("World Map");
        }


        this.center = new OpenLayers.LonLat(2.084444, 47.396389).transform(this.proj4326, this.projmerc); //center on Bourges
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

        this.gradientLegend = new MLGradientLegend({
          listeners:{
            show: function() {
              var b = me.getReg('rainbow_button');
              if(!b.pressed)
                b.toggle();
            },
            hide: function() {
              var b = me.getReg('rainbow_button');
              if(b.pressed)
                b.toggle();
            }
          }
        });

        this.settingWindow= new MLSettingWindow({
          listeners:{
            show: function() {
              var b = me.getReg('settings_button');
              if(!b.pressed)
                b.toggle();
            },
            hide: function() {
              var b = me.getReg('settings_button');
              if(b.pressed)
                b.toggle();
            },
            radius_change: function(s, n, o) {
              me.setGradientRadius(n);
            },
            gradient_opacity_change : function(s, n, o) {
              me.setGradientOpacity(n);
            },
            gradient_range_change: function(s, n, t) {
              me.setGradientRange(s.getValues());
            }
          }
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
      //process temperature
      for (var key in data.temperature.data) { 
            this.mapDataRef.push(key); //register day reference
            
            //transform coodinate to OpenLayers LonLat objects
            var datalen = data.temperature.data[key].data.length,  
                nudata = [];

            while(datalen--){
                    nudata.push({
                        lonlat: new OpenLayers.LonLat(data.temperature.data[key].data[datalen].lon, data.temperature.data[key].data[datalen].lat),
                        count: data.temperature.data[key].data[datalen].count
                    });
            }
            data.temperature.data[key].data = nudata;
      }

      //process pressure
      for (var key in data.pressure.data) {
            var datalen = data.pressure.data[key].data.length,  
                nudata = [];
            while(datalen--) {
                    nudata.push({
                        lonlat: new OpenLayers.LonLat(data.pressure.data[key].data[datalen].lon, data.pressure.data[key].data[datalen].lat),
                        count: data.pressure.data[key].data[datalen].count
                    });
            }
            data.pressure.data[key].data = nudata;
      }

      //process wind_strength
      for (var key in data.wind_strength.data) {
            var datalen = data.wind_strength.data[key].data.length,  
                nudata = [];
            while(datalen--) {
                    nudata.push({
                        lonlat: new OpenLayers.LonLat(data.wind_strength.data[key].data[datalen].lon, data.wind_strength.data[key].data[datalen].lat),
                        count: data.wind_strength.data[key].data[datalen].count
                    });
            }
            data.wind_strength.data[key].data = nudata;
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
      var mm = this.mapData[this.currentLayer].min_max;
      var unit = this.mapData[this.currentLayer].unit;
      if(mm) {
        var me = this;
        this.gradientLegend.show();
        this.getReg('rainbow_button').enable();
        setTimeout(function() {
          me.gradientLegend.setGradient(me.gradient); 
          me.gradientLegend.setLimit(mm.min, mm.max, unit ? unit : "");
        }, 500);
      } else {
        this.gradientLegend.hide();
        this.getReg('rainbow_button').disable();
      }
      currentLayer.setDataSet(this.mapData[this.currentLayer].data[this.mapDataRef[id]]);
    },
    initLayer : function() {
      this.temperatureLayer = new OpenLayers.Layer.Heatmap( "Temperature", this.map, this.layer, {visible: true, radius:60, opacity:30, gradient:this.gradient}, {isBaseLayer: false, opacity: 0.3,projection: new OpenLayers.Projection("EPSG:4326")});

      this.pressureLayer = new OpenLayers.Layer.Heatmap( "Pressure", this.map, this.layer, {visible: true, radius:60, opacity:30,
      gradient: this.gradient
      }, {isBaseLayer: false, opacity: 0.3, projection: new OpenLayers.Projection("EPSG:4326")});

      this.windStrengthLayer = new OpenLayers.Layer.Heatmap( "Wind Speed", this.map, this.layer, {visible: true, radius:60, opacity:30, gradient:this.gradient}, {isBaseLayer: false, opacity: 0.3, projection: new OpenLayers.Projection("EPSG:4326")});
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
          currentLayer.map = this.map; // workaround for zoom handler cb issue
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
        var icon = new OpenLayers.Icon('/app_assets/images/icons/flag_red.gif', size, offset);
        this.markerLayer.clearMarkers();
        var lonlat = new OpenLayers.LonLat(st_data.lng,st_data.lat);
        lonlat.transform(this.proj4326, this.projmerc);
        this.markerLayer.addMarker(new OpenLayers.Marker(lonlat ,icon));
    },
    onMapClick : function(e) {
        var lonlat = this.map.getLonLatFromViewPortPx(e.xy);
        lonlat.transform(this.projmerc, this.proj4326);
        this.fireEvent('map_click', this, lonlat);
    },
    toggleLegend : function(b) {
      if(!b) {
        var b = this.getReg('rainbow_button');
        b.toggle();
      }
      if(b.pressed) {
        this.gradientLegend.show();
      } else {
        this.gradientLegend.hide();
      }
    },
    toggleSettings : function(b) {
      if(!b) {
        var b = this.getReg('settings_button');
        b.toggle();
      }
      if(b.pressed) {
        var pos = b.getPosition();
        this.settingWindow.setPosition(pos[0], pos[1] + 50);
        this.settingWindow.show(b.getEl());
      } else {
        this.settingWindow.hide();
      }
    },
    setGradientRadius : function(rout) {
      var currentLayer = this.getLayer(this.currentLayer);
      rin = parseInt(rout/2, 10);
      currentLayer.heatmap.set('radiusIn', rin);
      currentLayer.heatmap.set('radiusOut', rout);
      currentLayer.setDataSet(this.mapData[this.currentLayer].data[this.mapDataRef[this.currentId]]);
    },
    setGradientOpacity : function(o) {
      var currentLayer = this.getLayer(this.currentLayer);
      var opacity = parseInt(255/(100/o), 10);
      currentLayer.heatmap.set('opacity', opacity);
      currentLayer.setDataSet(this.mapData[this.currentLayer].data[this.mapDataRef[this.currentId]]);
      this.gradientOpacity = o;
      this.gradientLegend.setGradient(this.gradient, o / 100);
    },
    setGradientRange : function(v) {
      var currentLayer = this.getLayer(this.currentLayer);
      function keys(obj) {
          var keys = [];
          for(var key in obj) {
              keys.push(key);
          }
          return keys;
      }
      var k = keys(this.gradient);
      k.sort();
      var g = {}, check = null;
      for(var i = 0; i < 5; i++)  {
        if(v[i] == check)
          return false;
        g[v[i]/100] = this.gradient[k[i]];
        check = v[i];
      }
      this.gradient = g;
      currentLayer.heatmap.set('gradient', g);
      currentLayer.heatmap.initColorPalette();
      currentLayer.setDataSet(this.mapData[this.currentLayer].data[this.mapDataRef[this.currentId]]);
      this.gradientLegend.setGradient(this.gradient, this.gradientOpacity / 100);
    }

});
