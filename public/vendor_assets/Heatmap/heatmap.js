/* 
 * heatmap.js 1.0 -    JavaScript Heatmap Library
 *
 * Copyright (c) 2011, Patrick Wied (http://www.patrick-wied.at)
 * Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
 */ 

(function(w){
    // the heatmapFactory creates heatmap instances
    var heatmapFactory = (function(){
    
    // store object constructor
    // a heatmap contains a store
    // the store has to know about the heatmap in order to trigger heatmap updates when datapoints get added
    function store(hmap){

        var _ = {
            // data is a two dimensional array 
            // a datapoint gets saved as data[point-x-value][point-y-value]
            // the value at [point-x-value][point-y-value] is the occurrence of the datapoint
            data: [],
            // tight coupling of the heatmap object
            heatmap: hmap
        };
        // the max occurrence - the heatmaps radial gradient alpha transition is based on it
        this.max = 1;
        
        this.get = function(key){
            return _[key];
        },
        this.set = function(key, value){
            _[key] = value;
        };
    };
    
    store.prototype = {
        // function for adding datapoints to the store
        // datapoints are usually defined by x and y but could also contain a third parameter which represents the occurrence
        addDataPoint: function(x, y){
            if(x < 0 || y < 0)
                return;
                
            var me = this,
                heatmap = me.get("heatmap"),
                data = me.get("data");
            
            if(!data[x]) 
                data[x] = [];
                
            if(!data[x][y]) 
                data[x][y] = 0;
                
            // if count parameter is set increment by count otherwise by 1
            data[x][y]+=(arguments.length<3)?1:arguments[2];
            
            me.set("data", data);
            // do we have a new maximum?
            if(me.max < data[x][y]){
            
                me.max = data[x][y];
                // max changed, we need to redraw all existing(lower) datapoints
                heatmap.get("actx").clearRect(0,0,heatmap.get("width"),heatmap.get("height"));
                heatmap.get("tactx").clearRect(0,0,heatmap.get("width"),heatmap.get("height"));
                heatmap.get("cactx").clearRect(0,0,heatmap.get("width"),heatmap.get("height"));
                for(var one in data)                    
                    for(var two in data[one])
                        heatmap.drawAlpha(one, two, data[one][two]);
                
                // @TODO
                // implement feature
                // heatmap.drawLegend(); ? 
                return;
            }
            heatmap.drawAlpha(x, y, data[x][y]);
        },
        setDataSet: function(obj){

            var me = this,
                heatmap = me.get("heatmap"),
                data = [],
                d = obj.data,
                dlen = d.length;
            // clear the heatmap before the data set gets drawn
            heatmap.clear();
            this.max = obj.max;

            while(dlen--){
                var point = d[dlen];
                heatmap.drawAlpha(point.x, point.y, point.count);
                if(!data[point.x]) 
                    data[point.x] = [];
                    
                if(!data[point.x][point.y]) 
                    data[point.x][point.y] = 0;
                    
                data[point.x][point.y]=point.count
            }
            this.set("data", data);
        },
        exportDataSet: function(){
            var me = this,
                data = me.get("data"),
                exportData = [];
                
            for(var one in data){
                // jump over undefined indexes
                if(one === undefined)
                    continue;
                for(var two in data[one]){
                    if(two === undefined)
                        continue;
                    // if both indexes are defined, push the values into the array
                    exportData.push({x: parseInt(one, 10), y: parseInt(two, 10), count: data[one][two]});
                }
            }
                    
            return { max: me.max, data: exportData };
        },
        generateRandomDataSet: function(points){
            var heatmap = this.get("heatmap"),
            w = heatmap.get("width"),
            h = heatmap.get("height");
            var randomset = {},
            max = Math.floor(Math.random()*1000+1);
            randomset.max = max;
            var data = [];
            while(points--){
                data.push({x: Math.floor(Math.random()*w+1), y: Math.floor(Math.random()*h+1), count: Math.floor(Math.random()*max+1)});
            }
            randomset.data = data;
            this.setDataSet(randomset);
        }
    };
    
    
    // heatmap object constructor
    function heatmap(config){
        // private variables
        var _ = {
            radiusIn : 20,
            radiusOut : 40,
            element : {},
            canvas : {},
            acanvas: {},
            ctx : {},
            actx : {},
            visible : true,
            width : 0,
            height : 0,
            max : false,
            gradient : false,
            opacity: 180,
            debug: false
        };
        // heatmap store containing the datapoints and information about the maximum
        // accessible via instance.store
        this.store = new store(this);
        
        this.get = function(key){
            return _[key];
        },
        this.set = function(key, value){
            _[key] = value;
        };
        // configure the heatmap when an instance gets created
        this.configure(config);
        // and initialize it
        this.init();
    };
    
    // public functions
    heatmap.prototype = {
        configure: function(config){
                var me = this;
                if(config.radius){
                    var rout = config.radius,
                    rin = parseInt(rout/2, 10);                    
                }
                me.set("radiusIn", rin || 15),
                me.set("radiusOut", rout || 40),
                me.set("element", (config.element instanceof Object)?config.element:document.getElementById(config.element));
                me.set("visible", config.visible);
                me.set("max", config.max || false);
                me.set("gradient", config.gradient || { 0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)"});    // default is the common blue to red gradient
                me.set("opacity", parseInt(255/(100/config.opacity), 10) || 180);
                me.set("width", config.width || 0);
                me.set("height", config.height || 0);
                me.set("debug", config.debug);
        },
        init: function(){
                var me = this,
                    canvas = document.createElement("canvas"),
                    acanvas = document.createElement("canvas"),
                    tacanvas = document.createElement("canvas"),
                    cacanvas = document.createElement("canvas"),
                    element = me.get("element");
                    
                me.initColorPalette();

                me.set("canvas", canvas);
                me.set("acanvas", acanvas);  // main alpha canvas
                me.set("tcanvas", tacanvas); // temporary alpha canvas
                me.set("ccanvas", cacanvas); // count / weight alpha canvas

                canvas.width = acanvas.width = tacanvas.width = cacanvas.width = element.style.width.replace(/px/,"")*2 || me.getWidth(element)*2;
                me.set("width", canvas.width);
                canvas.height = acanvas.height = tacanvas.height = cacanvas.height = element.style.height.replace(/px/,"")*2 || me.getHeight(element)*2;
                me.set("height", canvas.height);
                canvas.style.position = acanvas.style.position = "absolute";
                canvas.style.top = acanvas.style.top = "0";
                canvas.style.left = acanvas.style.left = "0";
                canvas.style.zIndex = 1000000;
                
                if(!me.get("visible"))
                    canvas.style.display = "none";

                me.get("element").appendChild(canvas);
                // debugging purposes only 
                if(me.get("debug"))
                    document.body.appendChild(acanvas);
                me.set("ctx", canvas.getContext("2d"));
                me.set("actx", acanvas.getContext("2d"));
                me.set("tactx", tacanvas.getContext("2d"));
                me.set("cactx", cacanvas.getContext("2d"));
        },
        initColorPalette: function(){
                
            var me = this,
                canvas = document.createElement("canvas");
            canvas.width = "1";
            canvas.height = "256";
            var ctx = canvas.getContext("2d"),
                grad = ctx.createLinearGradient(0,0,1,256),
            gradient = me.get("gradient");
            for(var x in gradient){
                grad.addColorStop(x, gradient[x]);
            }
            
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,1,256);
            
            me.set("gradient", ctx.getImageData(0,0,1,256).data);
            delete canvas;
            delete grad;
            delete ctx;
        },
        getWidth: function(element){
            var width = element.offsetWidth;
            if(element.style.paddingLeft)
                width+=element.style.paddingLeft;
            if(element.style.paddingRight)
                width+=element.style.paddingRight;
            
            return width;
        },
        getHeight: function(element){
            var height = element.offsetHeight;
            if(element.style.paddingTop)
                height+=element.style.paddingTop;
            if(element.style.paddingBottom)
                height+=element.style.paddingBottom;
            
            return height;
        },
        colorize: function(x, y){
                // get the private variables
                var me = this,
                    width = me.get("width"),
                    radiusOut = me.get("radiusOut"),
                    height = me.get("height"),
                    actx = me.get("actx"),
                    ctx = me.get("ctx");
                
                var x2 = radiusOut*2;
                
                if(x+x2>width)
                    x=width-x2;
                if(x<0)
                    x=0;
                if(y<0)
                    y=0;
                if(y+x2>height)
                    y=height-x2;
                // get the image data for the mouse movement area
                var image = actx.getImageData(x,y,x2,x2),
                // some performance tweaks
                    imageData = image.data,
                    length = imageData.length,
                    palette = me.get("gradient"),
                    opacity = me.get("opacity");
                // loop thru the area
                for(var i=3; i < length; i+=4){
                    
                    // [0] -> r, [1] -> g, [2] -> b, [3] -> alpha
                    var alpha = imageData[i],
                    offset = alpha*4;
                    
                    if(!offset)
                        continue;
    
                    // we ve started with i=3
                    // set the new r, g and b values
                    imageData[i-3]=palette[offset];
                    imageData[i-2]=palette[offset+1];
                    imageData[i-1]=palette[offset+2];
                    // we want the heatmap to have a gradient from transparent to the colors
                    // as long as alpha is lower than the defined opacity (maximum), we'll use the alpha value
                    imageData[i] = (alpha < opacity)?alpha:opacity;
                }
                // the rgb data manipulation didn't affect the ImageData object(defined on the top)
                // after the manipulation process we have to set the manipulated data to the ImageData object
                image.data = imageData;
                ctx.putImageData(image,x,y);    
        },
        drawAlpha: function(x, y, count){
                // storing the variables because they will be often used
                var me = this,
                    r1 = me.get("radiusIn"),
                    r2 = me.get("radiusOut"),
                    ctx = me.get("tactx"),
                    max = me.get("max"),

                    xb = x-r2, yb = y-r2, mul = 2*r2;

                
                ctx.beginPath();
                ctx.arc(x, y, r2, 0, 2 * Math.PI, false);
                ctx.fillStyle =  'rgba(50,0,0,'+((count)?(count/me.store.max):'0.1')+')';
                ctx.fill();

                me.averagePoint(ctx, xb, yb);
                me.get("tactx").clearRect(0,0,me.get("width"),me.get("height"));
                // finally colorize the area
                me.colorize(xb,yb);
        },
        averagePoint : function(tctx, x, y) {
                var me = this,
                    actx = me.get("actx"),
                    cctx = me.get("cactx"),
                    width = me.get("width"),
                    radiusOut = me.get("radiusOut"),
                    height = me.get("height");
                
                var x2 = radiusOut*2;
                if(x+x2>width)
                    x=width-x2;
                if(x<0)
                    x=0;
                if(y<0)
                    y=0;
                if(y+x2>height)
                    y=height-x2;

                var t_image = tctx.getImageData(x,y,x2,x2),
                    t_imageData = t_image.data;
                var c_image = cctx.getImageData(x,y,x2,x2),
                    c_imageData = c_image.data;
                var a_image = actx.getImageData(x,y,x2,x2),
                    a_imageData = a_image.data,
                    a_length = a_imageData.length;
                // loop thru the area
                for(var i=3; i < a_length; i+=4){
                    // [0] -> r, [1] -> g, [2] -> b, [3] -> alpha
                    var a_alpha = a_imageData[i];
                    if(a_alpha == null)
                        continue;
                    if(t_imageData[i-3] > 25) {
                      var c_alpha = c_imageData[i]++,
                          t_alpha = t_imageData[i];
                      if(c_alpha == 0)
                        a_imageData[i] = t_imageData[i];
                      else
                        a_imageData[i] = ((t_alpha + (a_alpha * c_alpha)) / (c_alpha + 1)) >> 0;
                    } 
                }
                //saving main grandient alpha map
                a_image.data = a_imageData;
                actx.putImageData(a_image,x,y);  

                //saving count map
                c_image.data = c_imageData;
                cctx.putImageData(c_image,x,y);  
        },
        toggleDisplay: function(){
                var me = this,
                    visible = me.get("visible"),
                canvas = me.get("canvas");
                
                if(!visible)
                    canvas.style.display = "block";
                else
                    canvas.style.display = "none";
                    
                me.set("visible", !visible);
        },
        // dataURL export
        getImageData: function(){
                return this.get("canvas").toDataURL();
        },
        clear: function(){
            var me = this,
                w = me.get("width"),
                h = me.get("height");
                
            me.store.set("data",[]);
            // @TODO: reset stores max to 1 
            //me.store.max = 1;
            me.get("ctx").clearRect(0,0,w,h);
            me.get("actx").clearRect(0,0,w,h);
            me.get("tactx").clearRect(0,0,w,h);
            me.get("cactx").clearRect(0,0,w,h);
        },
        cleanup: function(){
            var me = this;
            me.get("element").removeChild(me.get("canvas"));
            delete me;
        }
    };
        
    return {
            create: function(config){
                return new heatmap(config);
            },
            util: {
                mousePosition: function(ev){
                    // this doesn't work right
                    // rather use 
                    /*
                        // this = element to observe
                        var x = ev.pageX - this.offsetLeft;
                        var y = ev.pageY - this.offsetTop;
                        
                    */
                    var x, y;
                    
                    if (ev.layerX) { // Firefox
                        x = ev.layerX;
                        y = ev.layerY;
                    } else if (ev.offsetX) { // Opera
                        x = ev.offsetX;
                        y = ev.offsetY;
                    }
                    if(typeof(x)=='undefined')
                        return;
                    
                    return [x,y];
                }
            }
        };
    })();
    w.h337 = w.heatmapFactory = heatmapFactory;
})(window);
