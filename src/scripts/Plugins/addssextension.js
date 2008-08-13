/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();//TODO this one fails when importing a stencilset that is already loaded. Hoewver, since an asynchronous callback throws the error, the user doesn#t recognize it.ORYX.Plugins.SSExtensionLoader = {    /**     *	Constructor     *	@param {Object} Facade: The Facade of the Editor     */    construct: function(facade){        this.facade = facade;                this.facade.offer({            'name': "Add Stencil Set Extension",            'functionality': this.addSSExtension.bind(this),            'group': "StencilSet",            'icon': ORYX.PATH + "images/add.png",            'description': "Add a stencil set extension.",            'index': 1,            'minShape': 0,            'maxShape': 0        });    },        addSSExtension: function(facade){        this.facade.raiseEvent({            type: 'loading.enable',            text: "Loading Stencil Set Extension"        });                var url = ORYX.CONFIG.SS_EXTENSIONS_CONFIG;        //var url = "/oryx/build/stencilsets/extensions/extensions.json";        new Ajax.Request(url, {            method: 'GET',            asynchronous: false,            onSuccess: (function(transport){                            try {                    var jsonObject;                                        eval("jsonObject = " + transport.responseText);                    					var stencilsets = this.facade.getStencilSets();                                        var validExtensions = jsonObject.extensions.findAll(function(extension){                        var stencilset = stencilsets[extension["extends"]];												if(stencilset) {							return !stencilset.extensions()[extension.namespace];						} else {							return false;						}                    });        					if (validExtensions.size() == 0)						Ext.Msg.alert("Oryx", 						"There are no extensions available or all available extensions are already loaded.");					else                     	this._showPanel(validExtensions, this._loadExtensions.bind(this));                                    }                 catch (e) {                    Ext.Msg.alert("Oryx", "Loading stencil set extensions configuration failed. The response is not a valid configuration file.");				}                                this.facade.raiseEvent({                    type: 'loading.disable'                });                            }).bind(this),            onFailure: (function(transport){                Ext.Msg.alert("Oryx", "Loading stencil set extension configuration file failed. The request returned an error.");                this.facade.raiseEvent({                    type: 'loading.disable'                });            }).bind(this)        });    },		_loadExtensions: function(extensions) {		var stencilsets = this.facade.getStencilSets();				var atLeastOne = false;				extensions.each(function(extension) {			var stencilset = stencilsets[extension["extends"]];						if(stencilset) {				stencilset.addExtension(ORYX.CONFIG.SS_EXTENSIONS_FOLDER + extension.definition);				atLeastOne = true;			}		});				if (atLeastOne) {			this.facade.raiseEvent({				type: "stencilSetLoaded"			});			var selection = this.facade.getSelection();			this.facade.setSelection();			this.facade.setSelection(selection);		}	},        _showPanel: function(values, successCallback){            // Extract the data        var data = [];        values.each(function(value){            data.push([value.title, value.definition, value["extends"]])        });                // Create a new Selection Model        var sm = new Ext.grid.CheckboxSelectionModel();        // Create a new Grid with a selection box        var grid = new Ext.grid.GridPanel({            id: 'oryx_new_stencilset_extention_grid',            store: new Ext.data.SimpleStore({                data: data,                fields: ['title', 'definition', 'extends']            }),            cm: new Ext.grid.ColumnModel([sm, {                header: "StencilSet Extentions",                width: 200,                sortable: true,                dataIndex: 'title'            }, ]),            sm: sm,            frame: true,            width: 200,            height: 200,            iconCls: 'icon-grid'        });                // Create a new Panel        var panel = new Ext.Panel({            items: [{                xtype: 'label',                text: 'Select the stencil set extensions you want to load.',                style: 'margin:10px;display:block'            }, grid],            frame: true,            buttons: [{                text: "Import",                handler: function(){                    var selectionModel = Ext.getCmp('oryx_new_stencilset_extention_grid').getSelectionModel();                    var result = selectionModel.selections.items.collect(function(item){                        return item.data;                    })                    Ext.getCmp('oryx_new_stencilset_extention_window').close();                    successCallback(result);                }.bind(this)            }, {                text: "Cancel",                handler: function(){                    Ext.getCmp('oryx_new_stencilset_extention_window').close();                }.bind(this)            }]        })                // Create a new Window        var window = new Ext.Window({            id: 'oryx_new_stencilset_extention_window',            width: 227,            title: 'Oryx',            floating: true,            shim: true,            modal: true,            resizable: false,            autoHeight: true,            items: [panel]        })                // Show the window        window.show();            }};ORYX.Plugins.SSExtensionLoader = Clazz.extend(ORYX.Plugins.SSExtensionLoader);