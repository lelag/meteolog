/*
 strftime for Javascript
 Copyright (c) 2008, Philip S Tellis <philip@bluesmoon.info>
 All rights reserved.
 
 This code is distributed under the terms of the BSD licence
 
 Redistribution and use of this software in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

   * Redistributions of source code must retain the above copyright notice, this list of conditions
     and the following disclaimer.
   * Redistributions in binary form must reproduce the above copyright notice, this list of
     conditions and the following disclaimer in the documentation and/or other materials provided
     with the distribution.
   * The names of the contributors to this file may not be used to endorse or promote products
     derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * \file strftime.js
 * \author Philip S Tellis \<philip@bluesmoon.info\>
 * \version 1.3
 * \date 2008/06
 * \brief Javascript implementation of strftime
 * 
 * Implements strftime for the Date object in javascript based on the PHP implementation described at
 * http://www.php.net/strftime  This is in turn based on the Open Group specification defined
 * at http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html This implementation does not
 * include modified conversion specifiers (i.e., Ex and Ox)
 *
 * The following format specifiers are supported:
 *
 * \copydoc formats
 *
 * \%a, \%A, \%b and \%B should be localised for non-English locales.
 *
 * \par Usage:
 * This library may be used as follows:
 * \code
 *     var d = new Date();
 *
 *     var ymd = d.strftime('%Y/%m/%d');
 *     var iso = d.strftime('%Y-%m-%dT%H:%M:%S%z');
 *
 * \endcode
 *
 * \sa \link Date.prototype.strftime Date.strftime \endlink for a description of each of the supported format specifiers
 * \sa Date.ext.locales for localisation information
 * \sa http://www.php.net/strftime for the PHP implementation which is the basis for this
 * \sa http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html for feedback
 */
//! Date extension object - all supporting objects go in here.
function isOldIE(){return Ext.IE6||Ext.isIE7||Ext.isIE8}Date.ext={},Date.ext.util={},Date.ext.util.xPad=function(a,b,c){typeof c=="undefined"&&(c=10);for(;parseInt(a,10)<c&&c>1;c/=10)a=b.toString()+a;return a.toString()},Date.prototype.locale="en-GB",document.getElementsByTagName("html")&&document.getElementsByTagName("html")[0].lang&&(Date.prototype.locale=document.getElementsByTagName("html")[0].lang),Date.ext.locales={},Date.ext.locales.en={a:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],A:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],b:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],B:["January","February","March","April","May","June","July","August","September","October","November","December"],c:"%a %d %b %Y %T %Z",p:["AM","PM"],P:["am","pm"],x:"%d/%m/%y",X:"%T"},Date.ext.locales["en-US"]=Date.ext.locales.en,Date.ext.locales["en-US"].c="%a %d %b %Y %r %Z",Date.ext.locales["en-US"].x="%D",Date.ext.locales["en-US"].X="%r",Date.ext.locales["en-GB"]=Date.ext.locales.en,Date.ext.locales["en-AU"]=Date.ext.locales["en-GB"],Date.ext.formats={a:function(a){return Date.ext.locales[a.locale].a[a.getDay()]},A:function(a){return Date.ext.locales[a.locale].A[a.getDay()]},b:function(a){return Date.ext.locales[a.locale].b[a.getMonth()]},B:function(a){return Date.ext.locales[a.locale].B[a.getMonth()]},c:"toLocaleString",C:function(a){return Date.ext.util.xPad(parseInt(a.getFullYear()/100,10),0)},d:["getDate","0"],e:["getDate"," "],g:function(a){return Date.ext.util.xPad(parseInt(Date.ext.util.G(a)/100,10),0)},G:function(a){var b=a.getFullYear(),c=parseInt(Date.ext.formats.V(a),10),d=parseInt(Date.ext.formats.W(a),10);return d>c?b++:d===0&&c>=52&&b--,b},H:["getHours","0"],I:function(a){var b=a.getHours()%12;return Date.ext.util.xPad(b===0?12:b,0)},j:function(a){var b=a-new Date(""+a.getFullYear()+"/1/1 GMT");b+=a.getTimezoneOffset()*6e4;var c=parseInt(b/6e4/60/24,10)+1;return Date.ext.util.xPad(c,0,100)},m:function(a){return Date.ext.util.xPad(a.getMonth()+1,0)},M:["getMinutes","0"],p:function(a){return Date.ext.locales[a.locale].p[a.getHours()>=12?1:0]},P:function(a){return Date.ext.locales[a.locale].P[a.getHours()>=12?1:0]},S:["getSeconds","0"],u:function(a){var b=a.getDay();return b===0?7:b},U:function(a){var b=parseInt(Date.ext.formats.j(a),10),c=6-a.getDay(),d=parseInt((b+c)/7,10);return Date.ext.util.xPad(d,0)},V:function(a){var b=parseInt(Date.ext.formats.W(a),10),c=(new Date(""+a.getFullYear()+"/1/1")).getDay(),d=b+(c>4||c<=1?0:1);return d==53&&(new Date(""+a.getFullYear()+"/12/31")).getDay()<4?d=1:d===0&&(d=Date.ext.formats.V(new Date(""+(a.getFullYear()-1)+"/12/31"))),Date.ext.util.xPad(d,0)},w:"getDay",W:function(a){var b=parseInt(Date.ext.formats.j(a),10),c=7-Date.ext.formats.u(a),d=parseInt((b+c)/7,10);return Date.ext.util.xPad(d,0,10)},y:function(a){return Date.ext.util.xPad(a.getFullYear()%100,0)},Y:"getFullYear",z:function(a){var b=a.getTimezoneOffset(),c=Date.ext.util.xPad(parseInt(Math.abs(b/60),10),0),d=Date.ext.util.xPad(b%60,0);return(b>0?"-":"+")+c+d},Z:function(a){return a.toString().replace(/^.*\(([^)]+)\)$/,"$1")},"%":function(a){return"%"}},Date.ext.aggregates={c:"locale",D:"%m/%d/%y",h:"%b",n:"\n",r:"%I:%M:%S %p",R:"%H:%M",t:"\t",T:"%H:%M:%S",x:"locale",X:"locale"},Date.ext.aggregates.z=Date.ext.formats.z(new Date),Date.ext.aggregates.Z=Date.ext.formats.Z(new Date),Date.ext.unsupported={},Date.prototype.strftime=function(a){this.locale in Date.ext.locales||(this.locale.replace(/-[a-zA-Z]+$/,"")in Date.ext.locales?this.locale=this.locale.replace(/-[a-zA-Z]+$/,""):this.locale="en-GB");var b=this;while(a.match(/%[cDhnrRtTxXzZ]/))a=a.replace(/%([cDhnrRtTxXzZ])/g,function(a,c){var e=Date.ext.aggregates[c];return e=="locale"?Date.ext.locales[b.locale][c]:e});var c=a.replace(/%([aAbBCdegGHIjmMpPSuUVwWyY%])/g,function(a,c){var e=Date.ext.formats[c];return typeof e=="string"?b[e]():typeof e=="function"?e.call(b,b):typeof e=="object"&&typeof e[0]=="string"?Date.ext.util.xPad(b[e[0]](),e[1]):c});return b=null,c},MeteoLogViewportUi=Ext.extend(Ext.Viewport,{layout:"border",firstLoad:!0,registerElement:function(a){this.registerStore||(this.registerStore={}),this.registerStore[a.ident]=a},getReg:function(a){return this.registerStore[a]},initComponent:function(){var a=this;Ext.applyIf(this,{items:[{xtype:"ml_map",region:"center",ident:"ml_map",listeners:{render:function(b){a.registerElement(b)},map_click:function(b,c){a.getReg("details").expand(),a.getReg("details").setStationNear(c)},new_map_data:function(b,c){a.getReg("ml_control").resetSlider(c),a.firstLoad&&(Ext.get("beta").shift({y:100,duration:1}),a.firstLoad=!1)}}},{xtype:"ml_control",region:"south",ident:"ml_control",listeners:{render:function(b){a.registerElement(b)},slider_change:function(b,c,d){a.getReg("ml_map").sliderChanged(b,c,d),a.getReg("details").sliderChanged(b,c,d)}}},{xtype:"panel",width:400,activeItem:0,layout:"accordion",collapsible:!0,title:"Options",collapsible:!0,region:"east",split:!0,items:[{xtype:"panel",border:!1,title:"Help",contentEl:"apropos-et-aide"},{xtype:"details_reader",border:!1,ident:"details",listeners:{render:function(b){a.registerElement(b)},station_selected:function(b,c){a.getReg("ml_map").setStationMarker(c)},rowclick:function(b,c,d){a.getReg("ml_control").setSlider(c)}}}]}]}),MeteoLogViewportUi.superclass.initComponent.call(this)}}),MeteoLogViewport=Ext.extend(MeteoLogViewportUi,{initComponent:function(){MeteoLogViewport.superclass.initComponent.call(this)}}),MLMapPanelUi=Ext.extend(GeoExt.MapPanel,{border:!1,title:"MeteoLog Weather Log",cls:"main_window",from_date:new Date(1323392457e3),to_date:new Date,currentLayer:"none",temperatureLayer:null,pressureLayer:null,mapData:null,mapDataRef:[],currentId:0,registerElement:function(a){this.registerStore||(this.registerStore={}),this.registerStore[a.ident]=a},getReg:function(a){return this.registerStore[a]},initComponent:function(){var a=this;Ext.applyIf(this,{tbar:{xtype:"toolbar",items:[{xtype:"label",text:"Start :"},{xtype:"spacer",width:20},{xtype:"datefield",ident:"from_datefield",vtype:"daterange_ml_map",endDateField:"to_datefield",format:"Y-m-d",width:100,listeners:{render:function(b){a.registerElement(b)},change:function(b,c,d){a.from_date=c}}},{xtype:"spacer",width:20},{xtype:"label",text:"End :"},{xtype:"spacer",width:20},{xtype:"datefield",ident:"to_datefield",startDateField:"from_datefield",vtype:"daterange_ml_map",format:"Y-m-d",width:100,listeners:{render:function(b){a.registerElement(b)},change:function(b,c,d){a.to_date=c}}},{xtype:"button",text:"Load Period",handler:function(){a.loadMapData()},scope:this},{xtype:"spacer",width:40},{text:"Switch Layer Type :",menu:{items:['<b class="menu-title">Choose a layer</b>',{text:"Temperature",layer_name:"temperature",handler:a.onLayerClick,scope:this},{text:"Atmospheric pressure",layer_name:"pressure",handler:a.onLayerClick,scope:this},{text:"Wind Speed",layer_name:"wind_strength",handler:a.onLayerClick,scope:this}]}},{xtype:"spacer",width:20},{xtype:"label",text:"Temperature",ident:"layer_name_label",listeners:{render:function(b){a.registerElement(b)}}}]}}),this.map=new OpenLayers.Map({eventListeners:{click:this.onMapClick.createDelegate(this)}}),this.markerLayer=new OpenLayers.Layer.Markers("Markers");try{this.layer=new OpenLayers.Layer.Google("Google Physical",{type:G_PHYSICAL_MAP})}catch(b){this.layer=new OpenLayers.Layer.MapServer("OpenLayers WMS","http://labs.metacarta.com/wms/vmap0",{layers:"basic"})}this.center=new OpenLayers.LonLat(2.084444,47.396389),this.zoom=6,this.map.addLayer(this.layer),this.map.addLayer(this.markerLayer),this.map.addControl(new OpenLayers.Control.LayerSwitcher),this.updateMapData=function(){this.map.setCenter(this.center)},this.roundPixels=function(a){return a.x<0||a.y<0?!1:(a.x=~~(a.x+.5),a.y=~~(a.y+.5),a)},this.initDateRangeVtype(),this.on("render",function(){}),this.on("afterrender",function(){this.getReg("from_datefield").setValue(this.from_date),this.getReg("to_datefield").setValue(this.to_date),setTimeout(function(){a.initLayer(),a.loadMapData(),a.setCurrentLayer("temperature")},1e3)}),MLMapPanelUi.superclass.initComponent.call(this),this.addEvents("map_click","new_map_data")},loadMapData:function(){var a=this;this.mapData=null,this.mapDataRef=[],this.el.mask("loading...","loadingMask"),Ext.Ajax.request({url:"/readings.json",method:"GET",success:function(b,c){var d=Ext.decode(b.responseText);a.processMapData(d),a.getEl().unmask()},failure:function(b,c){humane.error("server-side failure with status code "+b.status),a.getEl().unmask()},aheaders:{"my-header":"foo"},params:{from_date:this.from_date.strftime("%Y-%m-%d"),to_date:this.to_date.strftime("%Y-%m-%d")}})},processMapData:function(a){for(var b in a.temperature)this.mapDataRef.push(b);this.mapData=a,this.setLayerData(0),this.currentId=0,this.fireEvent("new_map_data",this,this.mapDataRef.length-1)},sliderChanged:function(a,b,c){this.setLayerData(b)},setLayerData:function(a){this.currentId=a;var b=this.getLayer(this.currentLayer),c=new Date(this.mapDataRef[a]*1e3);humane.info(c.strftime("%Y-%m-%d %H:%M")),b.setDataSet(this.mapData[this.currentLayer][this.mapDataRef[a]])},initLayer:function(){this.temperatureLayer=new OpenLayers.Layer.Heatmap("Temperature",this.map,this.layer,{visible:!0,radius:90,opacity:30,gradient:{.45:"rgb(0,0,255)",.01:"rgb(0,255,255)",.33:"rgb(0,255,0)",.66:"yellow",1:"rgb(255,0,0)"}},{isBaseLayer:!1,opacity:.3}),this.pressureLayer=new OpenLayers.Layer.Heatmap("Pressure",this.map,this.layer,{visible:!0,radius:110,opacity:30,gradient:{.45:"rgb(0,0,255)",.95:"rgb(0,255,255)",.97:"rgb(0,255,0)",.99:"yellow",1:"rgb(255,0,0)"}},{isBaseLayer:!1,opacity:.3}),this.windStrengthLayer=new OpenLayers.Layer.Heatmap("Wind Speed",this.map,this.layer,{visible:!0,radius:90,opacity:30,gradient:{.45:"rgb(0,0,255)",.01:"rgb(0,255,255)",.33:"rgb(0,255,0)",.66:"yellow",1:"rgb(255,0,0)"}},{isBaseLayer:!1,opacity:.3})},getLayer:function(a){switch(a){case"temperature":return this.temperatureLayer;case"pressure":return this.pressureLayer;case"wind_strength":return this.windStrengthLayer}},setCurrentLayer:function(a){if(a==this.currentLayer)return!0;var b=this.getLayer(this.currentLayer),c=this.getLayer(a);b!=null&&this.map.removeLayer(b),this.currentLayer=a,this.map.addLayer(c),this.mapData&&this.setLayerData(this.currentId)},onLayerClick:function(a,b){var c=a.text,d=a.layer_name;this.getReg("layer_name_label").setText(c),this.setCurrentLayer(d)},initDateRangeVtype:function(){var a=this;Ext.apply(Ext.form.VTypes,{daterange_ml_map:function(b,c){var d=c.parseDate(b);if(!d)return!1;if(c.startDateField){var e=a.getReg(c.startDateField);if(!e.maxValue||d.getTime()!=e.maxValue.getTime())e.setMaxValue(d),e.validate()}else if(c.endDateField){var f=a.getReg(c.endDateField);if(!f.minValue||d.getTime()!=f.minValue.getTime())f.setMinValue(d),f.validate()}return!0}})},setStationMarker:function(a){var b=new OpenLayers.Size(32,32),c=new OpenLayers.Pixel(-(b.w/2),-b.h),d=new OpenLayers.Icon("/assets/icons/flag_red.gif",b,c);this.markerLayer.clearMarkers(),this.markerLayer.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(a.lng,a.lat),d))},onMapClick:function(a){var b=this.map.getLonLatFromViewPortPx(a.xy);this.fireEvent("map_click",this,b)}}),MLMapPanel=Ext.extend(MLMapPanelUi,{initComponent:function(){MLMapPanel.superclass.initComponent.call(this)}}),Ext.reg("ml_map",MLMapPanel),MLControlPanelUi=Ext.extend(Ext.Panel,{height:40,layout:"hbox",layoutConfig:{align:"middle"},registerElement:function(a){this.registerStore||(this.registerStore={}),this.registerStore[a.ident]=a},getReg:function(a){return this.registerStore[a]},initComponent:function(){var a=this;Ext.applyIf(this,{frame:!0,items:[{xtype:"button",text:"Play",flex:1,handler:this.playBack,scope:this},{xtype:"slider",id:"slider",height:40,value:0,increment:1,minValue:0,maxValue:6,flex:10,ident:"slider",listeners:{render:function(b){a.registerElement(b)},change:function(b,c,d){a.fireEvent("slider_change",b,c,d)}}}]}),MLControlPanelUi.superclass.initComponent.call(this),this.addEvents("slider_change")},playBack:function(a){var b=a;b.disable();var c=this.getReg("slider"),d=1e3;for(var e=0,f=0;e<=c.maxValue;e++)setTimeout(function(){c.setValue(f),f++,f==e&&b.enable()},d),d+=500},setSlider:function(a){var b=this.getReg("slider");b.setValue(a)},resetSlider:function(a){var b=this.getReg("slider");b.setMinValue(0),b.setMaxValue(a),b.setValue(0)}}),MLControlPanel=Ext.extend(MLControlPanelUi,{initComponent:function(){MLControlPanel.superclass.initComponent.call(this)}}),Ext.reg("ml_control",MLControlPanel),MLDetailsReaderUi=Ext.extend(Ext.grid.GridPanel,{border:!1,title:"Station Details",store:MLStationReadingStore,registerElement:function(a){this.registerStore||(this.registerStore={}),this.registerStore[a.ident]=a},getReg:function(a){return this.registerStore[a]},initComponent:function(){var a=this;Ext.applyIf(this,{tbar:[{xtype:"label",text:"Station : "},"-",{xtype:"combo",store:MLStationStore,typeAhead:!1,ident:"combo_station",width:150,displayField:"name",valueField:"id",triggerAction:"all",listeners:{render:function(b){a.registerElement(b)},select:function(b,c,d){MLStationReadingStore.loadId(c.data.id),a.fireEvent("station_selected",a,c.data)}}}],columns:[{xtype:"gridcolumn",dataIndex:"read_at",header:"Date/Time",sortable:!0,width:140},{xtype:"numbercolumn",align:"right",dataIndex:"temperature",header:"Temperature",sortable:!0,width:65},{xtype:"numbercolumn",align:"right",dataIndex:"pressure",header:"Pressure",sortable:!0,width:70},{xtype:"numbercolumn",align:"right",dataIndex:"wind_strength",header:"Wind Speed",sortable:!0,width:75}]}),MLDetailsReaderUi.superclass.initComponent.call(this),this.addEvents("station_selected")},getDistanceBetween:function(a,b,c,d){var e=6371,f=(d-b)*Math.PI/180,g=(c-a)*Math.PI/180,b=b*Math.PI/180,d=d*Math.PI/180,h=Math.sin(f/2)*Math.sin(f/2)+Math.sin(g/2)*Math.sin(g/2)*Math.cos(b)*Math.cos(d),i=2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));return e*i},setStationNear:function(a){var b=a.lat,c=a.lon,d=this,e={data:null,dist:9999999};MLStationStore.each(function(a){var f=a.data.lat,g=a.data.lng,h=d.getDistanceBetween(c,b,g,f);h<e.dist&&(e.data=a.data,e.dist=h)}),e.data!=null&&(this.getReg("combo_station").setValue(e.data.id),MLStationReadingStore.loadId(e.data.id),this.fireEvent("station_selected",this,e.data))},sliderChanged:function(a,b,c){this.getView().focusRow(b),this.getSelectionModel().selectRow(b)}}),MLDetailsReader=Ext.extend(MLDetailsReaderUi,{initComponent:function(){MLDetailsReader.superclass.initComponent.call(this)}}),Ext.reg("details_reader",MLDetailsReader),SettingsFormUi=Ext.extend(Ext.form.FormPanel,{border:!1,title:"Settings (Not Implemented)",autoScroll:!0,initComponent:function(){Ext.applyIf(this,{tbar:{xtype:"toolbar",items:[{xtype:"button",text:"Remember Settings"}]},items:[{xtype:"fieldset",title:"Temperature Layer",items:[{xtype:"textfield",anchor:"100%",fieldLabel:"Color 1"},{xtype:"textfield",anchor:"100%",fieldLabel:"Color 2"},{xtype:"textfield",anchor:"100%",fieldLabel:"Color 3"},{xtype:"textfield",anchor:"100%",fieldLabel:"Color 4"},{xtype:"sliderfield",value:[20,40,60,100],anchor:"100%",fieldLabel:"Gradient Setting"},{xtype:"sliderfield",value:80,anchor:"100%",fieldLabel:"Radius"}]},{xtype:"fieldset",title:"Pressure Layer",items:[{xtype:"textfield",anchor:"100%",fieldLabel:"Color 1"},{xtype:"textfield",anchor:"100%",fieldLabel:"Color 2"},{xtype:"textfield",anchor:"100%",fieldLabel:"Color 3"},{xtype:"textfield",anchor:"100%",fieldLabel:"Color 4"},{xtype:"sliderfield",value:[20,40,60,100],anchor:"100%",fieldLabel:"Gradient Setting"},{xtype:"sliderfield",value:80,anchor:"100%",fieldLabel:"Radius"}]},{xtype:"fieldset",title:"Wind Speed Layer",items:[{xtype:"textfield",anchor:"100%",fieldLabel:"Color 1"},{xtype:"textfield",anchor:"100%",fieldLabel:"Color 2"},{xtype:"textfield",anchor:"100%",fieldLabel:"Color 3"},{xtype:"textfield",anchor:"100%",fieldLabel:"Color 4"},{xtype:"sliderfield",value:[20,40,60,100],anchor:"100%",fieldLabel:"Gradient Setting"},{xtype:"sliderfield",value:80,anchor:"100%",fieldLabel:"Radius"}]}]}),SettingsFormUi.superclass.initComponent.call(this)}}),SettingsForm=Ext.extend(SettingsFormUi,{initComponent:function(){SettingsForm.superclass.initComponent.call(this)}}),Ext.reg("settings_form",SettingsForm),StationReadingStore=Ext.extend(Ext.data.Store,{constructor:function(a){a=a||{},StationReadingStore.superclass.constructor.call(this,Ext.apply({storeId:"StationReadingStore",proxy:new Ext.data.HttpProxy({url:"/stations/1.json",method:"get"}),reader:new Ext.data.JsonReader({root:"rows",totalProperty:"totalCount",id:"id"},[{name:"id"},{name:"read_at"},{name:"temperature"},{name:"pressure"},{name:"weather"},{name:"wind_strength"},{name:"wind_direction"}])},a))},loadId:function(a,b){b||(b={}),this.proxy.url="/stations/"+a+".json",this.proxy.conn.url="/stations/"+a+".json",this.load(b)}}),MLStationReadingStore=new StationReadingStore,Ext.onReady(function(){if(!isOldIE()){Ext.QuickTips.init();var a=new MeteoLogViewport({renderTo:Ext.getBody(),listeners:{afterrender:function(){Ext.get("loading").remove(),Ext.get("loading-mask").fadeOut({remove:!0})}}});a.show()}else setTimeout(function(){Ext.get("loading").remove(),Ext.get("loading-mask").fadeOut({remove:!0});var a=new Ext.Window({layout:"fit",width:620,title:"Sorry ...",height:300,closeAction:"close",contentEl:"ie-oups",modal:!0,plain:!0,buttons:[{text:"Fermer",handler:function(){a.close()},scope:this}]});a.show()},1250);humane.timeout=0,humane.forceNew=!0})