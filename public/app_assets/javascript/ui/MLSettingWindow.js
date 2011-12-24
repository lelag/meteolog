
MLSettingWindow = Ext.extend(Ext.Window, {
    height: 220,
    width: 320,
    title: 'Settings',
    resizable: false,
    cls: 'setting_window',
    closeAction:'hide',
    initComponent: function() {
        var me = this;
        Ext.applyIf(this, {
            items: [
                {
                    xtype: 'fieldset',
                    title: 'Main Layer',
                    items: [
                        {
                            xtype: 'slider',
                            name: 'radius',
                            value: 40,
                            maxValue: 150,
                            minValue: 10,
                            anchor: '100%',
                            fieldLabel: 'Radius',
                            ref: '../radiusSlider',
                            plugins: new Ext.slider.Tip(),
                            listeners: {
                              change: function(s, n, o) {
                                  me.fireEvent('radius_change', s, n, o);
                              }
                            }
                        },
                        {
                            xtype: 'slider',
                            name: 'gradient_range',
                            values: [5, 40, 60, 80, 95],
                            constrainThumbs: true,
                            anchor: '100%',
                            fieldLabel: 'Gradient Range',
                            ref:'../gradientRangeSlider',
                            plugins: new Ext.slider.Tip(),
                            listeners: {
                              change: function(s, n, o) {
                                  me.fireEvent('gradient_range_change', s, n, o);
                              }
                            }
                        },
                        {
                            xtype: 'slider',
                            name: 'gradient_opacity',
                            value: 30,
                            maxValue: 100,
                            minValue: 0,
                            anchor: '100%',
                            fieldLabel: 'Opacity',
                            ref:'../gradientOpacitySlider',
                            plugins: new Ext.slider.Tip(),
                            listeners: {
                              change: function(s, n, o) {
                                  me.fireEvent('gradient_opacity_change', s, n, o);
                              }
                            }
                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    title: 'Secondary Layer',
                    items: [
                        {
                            xtype: 'slider',
                            name: 'secondary_opacity',
                            value: 40,
                            anchor: '100%',
                            fieldLabel: 'Opacity',
                            ref:'../secondaryOpacitySlider',
                            plugins: new Ext.slider.Tip(),
                            listeners: {
                              change: function(s, n, o) {
                                  me.fireEvent('secondary_opacity_change', s, n, o);
                              }
                            }
                        }
                    ]
                }
            ]
        });

        MLSettingWindow.superclass.initComponent.call(this);
        this.addEvents('radius_change', 'gradient_range_change',
        'gradient_opacity_change', 'secondary_opacity_change');
    }
});

Ext.reg('setting_window', MLSettingWindow);
