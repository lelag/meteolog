/* 
 *  RaphaelJS Layer for OpenLayer
 *  Inspired by heatmap-openlayers by Patrick Wied.
 */ 

OpenLayers.Layer.Raphael = OpenLayers.Class(OpenLayers.Layer, {
	isBaseLayer: false,
	rapahel: null,
	mapLayer: null,
	// we store the lon lat data, because we have to redraw with new positions on zoomend|moveend
	tmpData: {},
        initialize: function(name, map, mLayer, hmoptions, options){
            var heatdiv = document.createElement("div"),
                handler;

            OpenLayers.Layer.prototype.initialize.apply(this, [name, options]);

	    this.rdiv.style.cssText = "position:absolute;width:"+map.size.w+"px;height:"+map.size.h+"px;";
	    // this will be the heatmaps element
	    this.div.appendChild(this.rdiv);
	    // add to our heatmap.js config
	    roptions.container = this.rdiv;
            roptions.width = map.size.w;
            roptions.height = map.size.h;

	    this.mapLayer = mLayer;
	    this.map = map;
            // create the raphael canvas
	    this.paper = Raphael(roptions);

            handler = function(){ 
                if(this.tmpData.max){
                    this.updateLayer(); 
                }
            };
	    // on zoomend and moveend we have to move the canvas element and redraw the datapoints with new positions
	    map.events.register("zoomend", this, handler);
	    map.events.register("moveend", this, handler);
        },
	updateLayer: function(){
                var pixelOffset = this.getPixelOffset(),
                    el = this.rdiv;
                // if the pixeloffset e.g. for x was positive move the canvas element to the left by setting left:-offset.y px 
                // otherwise move it the right by setting it a positive value. same for top
                el.style.top = ((pixelOffset.y > 0)?('-'+pixelOffset.y):(Math.abs(pixelOffset.y)))+'px';
                el.style.left = ((pixelOffset.x > 0)?('-'+pixelOffset.x):(Math.abs(pixelOffset.x)))+'px';
		
                this.setDataSet(this.tmpData);
	},
        getPixelOffset: function () {
            var o = this.mapLayer.map.layerContainerOrigin,
                o_lonlat = new OpenLayers.LonLat(o.lon, o.lat),
                o_pixel = this.mapLayer.getViewPortPxFromLonLat(o_lonlat),
                c = this.mapLayer.map.center,
                c_lonlat = new OpenLayers.LonLat(c.lon, c.lat),
                c_pixel = this.mapLayer.getViewPortPxFromLonLat(c_lonlat);

            return { 
                x: o_pixel.x - c_pixel.x,
                y: o_pixel.y - c_pixel.y 
            };

        },
	setDataSet: function(obj){
	    var set = {},
		dataset = obj.data,
		dlen = dataset.length,
                entry, lonlat, pixel;

		set.max = obj.max;
		set.data = [];
		// get the pixels for all the lonlat entries
            while(dlen--){
                entry = dataset[dlen],
                lonlat = entry.lonlat.clone().transform(this.projection, this.map.getProjectionObject()),
                pixel = this.roundPixels(this.getViewPortPxFromLonLat(lonlat));
                    
                if(pixel){
                    set.data.push({x: pixel.x, y: pixel.y, path: entry.path});
                }
            }
	    this.tmpData = obj;
	    //this.heatmap.store.setDataSet(set);
	},
	// we don't want to have decimal numbers such as xxx.9813212 since they slow canvas performance down + don't look nice
	roundPixels: function(p){
	    if(p.x < 0 || p.y < 0){
	        return false;
            }
		
            p.x = (p.x >> 0);
	    p.y = (p.y >> 0);
	
            return p;
	},
	// same procedure as setDataSet
	addDataPoint: function(lonlat){
	    var pixel = this.roundPixels(this.mapLayer.getViewPortPxFromLonLat(lonlat)),
                entry = {lonlat: lonlat};
                args;

            if(arguments.length == 2){
                entry.path= arguments[1];
            }

            this.tmpData.data.push(entry);
            
            if(pixel){
                args = [pixel.x, pixel.y];

		if(arguments.length == 2){
		    args.push(arguments[1]);
		}
		//this.heatmap.store.addDataPoint.apply(this.heatmap.store, args);
	    }

	},
	toggle: function(){
		this.heatmap.toggleDisplay();
	},
	destroy: function() {
        // for now, nothing special to do here. 
        OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);  
    },
	CLASS_NAME: "OpenLayers.Layer.Raphael"
});

