/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object();ORYX.Plugins.ShapeMenuPlugin = Clazz.extend({	construct: function(facade, ownPluginData) {		this.facade = facade;		this.myPluginData = ownPluginData;				this.alignGroups = new Hash();		this.myPluginData.properties.each((function(property) {			if(property.group && property.align != undefined) {				this.alignGroups[property.group] = property.align;			}		}).bind(this));						var containerNode = this.facade.getCanvas().getHTMLContainer();		this.shapeMenu = new ORYX.Plugins.ShapeMenu(containerNode);		this.currentShapes = [];		// Register on Dragging-Events for show/hide of ShapeMenu		this.facade.registerOnEvent('dragdrop.start', this.hideShapeMenu.bind(this));		this.facade.registerOnEvent('dragdrop.end',  this.showShapeMenu.bind(this));				// Enable DragZone		var DragZone = new Ext.dd.DragZone(containerNode.parentNode, {shadow: !Ext.isMac});		DragZone.afterDragDrop = this.afterDragging.bind(this, DragZone);		DragZone.beforeDragOver = this.beforeDragOver.bind(this, DragZone);						// Memory of created Buttons		this.createdButtons = {};						this.facade.registerOnEvent("stencilSetLoaded", (function(){ this.registryChanged() }).bind(this));	},	hideShapeMenu: function(event) {		this.shapeMenu.hide();	},	showShapeMenu: function(event) {		this.shapeMenu.show(this.currentShapes);	},	registryChanged: function(pluginsData) {				if(pluginsData) {			pluginsData = pluginsData.each(function(value) {value.group = value.group ? value.group : 'unknown'});			this.pluginsData = pluginsData.sortBy( function(value) {				return (value.group + "" + value.index);			});					}						this.shapeMenu.removeAllButtons();		this.createdButtons = {};				// Create for all Functionality Buttons		this.pluginsData.each((function(value) {			// If there is no group Button			if(!this.createdButtons[value.group]) {				// Create the Group Button				this.createdButtons[value.group] = new ORYX.Plugins.ShapeMenuButton({					callback: null,					align: (this.alignGroups[value.group] != undefined ? this.alignGroups[value.group] : ORYX.CONFIG.SHAPEMENU_BOTTOM)				});					// and add to the Shapemenu				this.shapeMenu.addButton(this.createdButtons[value.group]);			}						// Create the Button			this.createdButtons[value.group + value.name] = new ORYX.Plugins.ShapeMenuButton({callback: value.functionality, icon: value.icon, msg:value.name});							this.createdButtons[value.group].add(this.createdButtons[value.group + value.name]);					}).bind(this));		// Create Button for all Stencils in the current-Stencil-set		var stencilsets = this.facade.getStencilSets();		stencilsets.values().each((function(stencilSet){			// Create a group for each stencilset			var stencilButton = new ORYX.Plugins.ShapeMenuButton({callback: undefined, align: ORYX.CONFIG.SHAPEMENU_RIGHT});			this.shapeMenu.addButton(stencilButton);			this.createdButtons[stencilSet.namespace()] = stencilButton;						// For each each			var edges = stencilSet.edges();			edges.each((function(edge) {				// Create a Button for each Edge				var option = {type: edge.id(), namespace: edge.namespace()};				var edgeButton = new ORYX.Plugins.ShapeMenuButton({					callback: 	this.newShape.bind(this, option),					icon: 		edge.icon(),					msg:		edge.title(),					dragcallback: this.hideShapeMenu.bind(this)});				stencilButton.add(edgeButton); 								// Add to the created Button Array				this.createdButtons[edge.namespace() + edge.type() + edge.id()] = edgeButton;				// Drag'n'Drop will enable				Ext.dd.Registry.register(this.createdButtons[edge.namespace() + edge.type() + edge.id()].node.lastChild, option);							// For each Stencil from this Node				var targets = this.facade.getRules().targetStencils({canvas:this.facade.getCanvas(), edgeStencil:edge});				targets.each((function(stencil) {										// Create a Button					var option = {'type':stencil.id(), 'connectingType':edge.id(), namespace: stencil.namespace()};										var targetButton = new ORYX.Plugins.ShapeMenuButton({						//dragcallback: me.new_shape_drag.bind(me),						callback: 	this.newShape.bind(this, option),						icon: 		stencil.icon(),						msg:		stencil.title(),						dragcallback: this.hideShapeMenu.bind(this)});					edgeButton.add(targetButton);										// Add to the created Button Array					this.createdButtons[stencil.namespace() + edge.id() + stencil.type() + stencil.id()] = targetButton;										// Drag'n'Drop will enable					Ext.dd.Registry.register(this.createdButtons[stencil.namespace() + edge.id() + stencil.type() + stencil.id()].node.lastChild, option);																}).bind(this));						}).bind(this));				}).bind(this));					},	onSelectionChanged: function(event) {		var elements = event.elements;		this.shapeMenu.hide();				this.currentShapes = elements;		// Close all Buttons		this.shapeMenu.closeAllButtons();				// Show all normal Buttons		this.showButtons(elements)		// Show the Stencil Buttons		this.showStencilButtons(elements);		// Show the ShapeMenu		this.shapeMenu.show(elements);			},	showButtons: function(elements) {		// Show the normal Buttons		this.pluginsData.each((function(value){			// If there is less elements than minShapes			if(value.minShape != undefined && value.minShape > elements.length)				return;			// If there is more elements than minShapes			if(value.maxShape != undefined  && value.maxShape < elements.length)				return;					// If the plugin is not enabled				if(value.isEnabled && !value.isEnabled())				return					if(!this.createdButtons[value.group].isVisible) {				this.createdButtons[value.group].prepareToShow();			}			this.createdButtons[value.group + value.name].prepareToShow();					}).bind(this));	},	showStencilButtons: function(elements) {		if(elements.length != 1) {return};		//TODO temporaere nutzung des stencilsets		var sset = this.facade.getStencilSets()[elements[0].getStencil().namespace()];		this.createdButtons[sset.namespace()].prepareToShow();		// Get all available edges		var edges = this.facade.getRules().outgoingEdgeStencils({canvas:this.facade.getCanvas(), sourceShape:elements[0]});		// And for each Edge		edges.each((function(edge) {			this.createdButtons[edge.namespace() + edge.type() + edge.id()].prepareToShow()							// Target-Nodes will get			var targets = this.facade.getRules().targetStencils({canvas:this.facade.getCanvas(), sourceShape:elements[0], edgeStencil:edge});						this.createdButtons[edge.namespace() + edge.type() + edge.id()].setChildWidth(Math.ceil(targets.length / 5) * 25);			// And for each Target			targets.each((function(stencil) {				this.createdButtons[stencil.namespace() + edge.id() + stencil.type() + stencil.id()].prepareToShow();			}).bind(this));					}).bind(this));		// If there is no Edge, the first Button will delete		if(edges.length == 0)			this.createdButtons[sset.namespace()].prepareToHide();	},		beforeDragOver: function(dragZone, target, event){		var coord = this.facade.eventCoordinates(event.browserEvent);		var aShapes = this.facade.getCanvas().getAbstractShapesAtPosition(coord);		if(aShapes.length <= 0) {return false;}					var el = aShapes.last();				if(this._lastOverElement == el) {						return false;					} else {			// check containment rules			var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);			var stencilSet = this.facade.getStencilSets()[option.namespace];			var stencil = stencilSet.stencil(option.type);			var candidates = aShapes;			var candidate = candidates.reverse().find(function(candidate) {				return (candidate instanceof ORYX.Core.Canvas || candidate instanceof ORYX.Core.Node);			});							if(stencil.type() === "node") {					//check containment rule					var canContain = this.facade.getRules().canContain({containingShape:candidate, containedStencil:stencil})														this._currentReference = canContain ? candidate : undefined;				} else { //Edge				var canConnect = true;								if(!(candidate instanceof ORYX.Core.Canvas)) {			 		canConnect = this.facade.getRules().canConnect({											sourceShape:	this.currentShapes.first(), 											edgeStencil:		stencil, 											targetShape:	candidate											});					}														this._currentReference = canConnect ? candidate : undefined;											}				this.facade.raiseEvent({											type:		'highlight.showHighlight', 											highlightId:'shapeMenu',											elements:	[candidate],											color:		this._currentReference ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR										});															var pr = dragZone.getProxy();			pr.setStatus(this._currentReference ? pr.dropAllowed : pr.dropNotAllowed );			pr.sync();												}				this._lastOverElement = el;				return false;	},		afterDragging: function(dragZone, target, event) {				this._lastOverElement = undefined;				// Hide the highlighting		this.facade.raiseEvent({type: 'highlight.hideHighlight', highlightId:'shapeMenu'});				// Check if drop is allowed		var proxy = dragZone.getProxy()		if(proxy.dropStatus == proxy.dropNotAllowed) { return this.facade.updateSelection();}						// Check if there is a current Parent		if(!this._currentReference) { return }						var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);		option['parent'] = this._currentReference;		var xy = event.getXY();		var pos = {x: xy[0], y: xy[1]};		var a = this.facade.getCanvas().node.getScreenCTM();		// Correcting the UpperLeft-Offset		pos.x -= a.e; pos.y -= a.f;		// Correcting the Zoom-Faktor		pos.x /= a.a; pos.y /= a.d;		// Correting the ScrollOffset		pos.x -= document.documentElement.scrollLeft;		pos.y -= document.documentElement.scrollTop;		var parentAbs = this._currentReference.absoluteXY();		pos.x -= parentAbs.x;		pos.y -= parentAbs.y;				option['position'] = pos;		option['connectedShape'] = this.currentShapes[0];		var newShape = this.facade.createShape(option);				this._currentReference.update();				if(newShape instanceof ORYX.Core.Edge) {						if(!(this._currentReference instanceof ORYX.Core.Canvas)) {				newShape.dockers.last().setDockedShape(this._currentReference);				var upL = this._currentReference.absoluteXY();
				var refPos = {x:pos.x-upL.x, y:pos.y-upL.y};								newShape.dockers.last().setReferencePoint(pos);			} else {				newShape.dockers.last().bounds.centerMoveTo(pos);	
			}						newShape.dockers.last().update();		}				this.facade.updateSelection();				this._currentReference = undefined;			},	newShape: function(option, event) {		var stencilset = this.facade.getStencilSets()[option.namespace];		var containedStencil = stencilset.stencil(option.type);		if(this.facade.getRules().canContain({			containingShape:this.currentShapes.first().parent,			"containedStencil":containedStencil
		})) {			//var x = Event.pointerX(event);			//var y = Event.pointerY(event);			var pos = this.currentShapes[0].bounds.center();			pos.x += (this.currentShapes[0].bounds.width() / 2) + 100;				option['position'] = pos;			option['connectedShape'] = this.currentShapes[0];			option['parent'] = this.currentShapes.first().parent;				var newShape = this.facade.createShape(option);		}	}});ORYX.Plugins.ShapeMenu = Clazz.extend({	/***	 * Constructor.	 */	construct: function(parentNode) {		this.bounds = undefined;		this.shapes = undefined;		this.buttons = [];		this.isVisible = false;		this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", $(parentNode),			['div', {id: ORYX.Editor.provideId(), 'class':'Oryx_ShapeMenu'}]);	},	addButton: function(button) {		this.buttons.push(button);		this.node.appendChild(button.node);	},	deleteButton: function(button) {		this.buttons = this.buttons.without(button);		this.node.removeChild(button.node);	},	removeAllButtons: function() {		var me = this;		this.buttons.each(function(value){			me.node.removeChild(value.node);		});		this.buttons = [];	},	closeAllButtons: function() {		this.buttons.each(function(value){ value.prepareToHide() });		this.isVisible = false;	},		show: function(shapes) {		if(shapes.length <= 0 )			return		this.shapes = shapes;		var newBounds = undefined;		var tmpBounds = undefined;		this.shapes.each(function(value) {			var a = value.node.getScreenCTM();			var upL = value.absoluteXY();			a.e = a.a*upL.x;			a.f = a.d*upL.y;			tmpBounds = new ORYX.Core.Bounds(a.e, a.f, a.e+a.a*value.bounds.width(), a.f+a.d*value.bounds.height());			/*if(value instanceof ORYX.Core.Edge) {				tmpBounds.moveBy(value.bounds.upperLeft())			}*/			if(!newBounds)				newBounds = tmpBounds			else				newBounds.include(tmpBounds);		});		this.bounds = newBounds;		//this.bounds.moveBy({x:document.documentElement.scrollLeft, y:document.documentElement.scrollTop});		var bounds = this.bounds;		var a = this.bounds.upperLeft();		var left = 0;		var top = 0;		var bottom = 0;		var right = 0;		var size = 22;		this.getWillShownButtons().each(function(value){			if (value.buttonAlign == ORYX.CONFIG.SHAPEMENU_LEFT) {				value.setPosition(a.x-22, a.y+left*size);				left++; 			} else if (value.buttonAlign == ORYX.CONFIG.SHAPEMENU_TOP) {				value.setPosition(a.x+top*size, a.y-22);				top++; 			} else if (value.buttonAlign == ORYX.CONFIG.SHAPEMENU_BOTTOM) {				value.setPosition(a.x+bottom*size,  a.y+bounds.height() + 1);				bottom++;			} else {				value.setPosition(a.x+bounds.width() + 1, a.y+right*size);				right++;			}			value.show();		});		this.isVisible = true;	},	hide: function() {		this.buttons.each(function(value){			value.hide();		});		this.isVisible = false;		//this.bounds = undefined;		//this.shape = undefined;	},	isHover: function() {		return 	this.buttons.any(function(value){					return value.isHover();				});	},		getWillShownButtons: function() {		return this.buttons.findAll(function(value){return value.willShow});	}});ORYX.Plugins.ShapeMenuButton = Clazz.extend({	construct: function(option) {		if(option) {			this.option = option;			if(!this.option.arguments)				this.option.arguments = [];		} else {			//TODO error		}		this.parentId = this.option.id ? this.option.id : null;		this.shapeButtons = [];		// graft the button.		this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", $(this.parentId),			['div', {'class':'Oryx_button'}]);		this.childNode = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.node,			['div', {'class':'Oryx_childButton'}]);		// graft and update icon (not in grafting for ns reasons).		//TODO Enrich graft()-function to do this in one of the above steps.		if(this.option.icon)			ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.node,				['img', {src:this.option.icon}]);		if(this.option.msg){			this.node.setAttributeNS(null, "title", this.option.msg)		}		var onBubble = false;		this.node.addEventListener('mouseover', this.hover.bind(this), onBubble);		this.node.addEventListener('mouseout', this.reset.bind(this), onBubble);		this.node.addEventListener('mousedown', this.activate.bind(this), onBubble);		this.node.addEventListener('mouseup', this.hover.bind(this), onBubble);		this.node.addEventListener('click', this.trigger.bind(this), onBubble);		this.node.addEventListener('mousemove', this.move.bind(this), onBubble);		this.setAlignment(this.option.align ? this.option.align : ORYX.CONFIG.SHAPEMENU_RIGHT);		this.hide();		this.dragStart = false;		this.isVisible = false;		this.willShow = false;	},	setAlignment: function(align) {		this.node.removeClassName(ORYX.CONFIG.SHAPEMENU_RIGHT);		this.node.removeClassName(ORYX.CONFIG.SHAPEMENU_BOTTOM);		this.node.removeClassName(ORYX.CONFIG.SHAPEMENU_LEFT);		this.node.removeClassName(ORYX.CONFIG.SHAPEMENU_TOP);		this.node.addClassName(align);		this.buttonAlign = align;		this.shapeButtons.each(function(value){			value.setAlignment(align);		});	},	add: function(shapeButton) {		shapeButton.setAlignment(this.buttonAlign);		this.shapeButtons.push(shapeButton);		this.childNode.appendChild(shapeButton.node);	},	remove: function(shapeButton) {		this.childNode.removeChild(shapeButton.node);		this.shapeButtons = this.shapesButton.without(shapeButton);	},	hide: function() {		this.node.style.display = "none";		this.isVisible = false;	},	show: function() {		this.node.style.display = "";		this.isVisible = true;	},		prepareToShow: function() {		this.willShow = true;	},	prepareToHide: function() {		this.willShow = false;		this.hide()		this.shapeButtons.each(function(value) { value.prepareToHide() });	},	setPosition: function(x, y) {		this.node.style.left = x + "px";		this.node.style.top = y + "px";	},		setChildWidth: function(width) {		this.childNode.style.width = width + "px";	},		reset: function() {		if(this.node.hasClassName('Oryx_down'))			this.node.removeClassName('Oryx_down');		if(this.node.hasClassName('Oryx_hover'))			this.node.removeClassName('Oryx_hover');		this.shapeButtons.each(function(value) {			value.hide();		});	},	activate: function(evt) {		this.node.addClassName('Oryx_down');		//Event.stop(evt);		this.dragStart = true;	},	isHover: function() {		return this.node.hasClassName('Oryx_hover') ? true: false;	},	hover: function(evt) {		this.node.addClassName('Oryx_hover');		this.shapeButtons.each(function(value) {			if(value.willShow) {value.show();}		});		this.dragStart = false;	},	move: function(evt) {		if(this.dragStart && this.option.dragcallback) {			this.option.arguments.push(evt);			var state = this.option.dragcallback.apply(this, this.option.arguments);			this.option.arguments.remove(evt);		}	},	trigger: function(evt) {		if(this.option.callback) {			Event.stop(evt);			this.option.arguments.push(evt);			var state = this.option.callback.apply(this, this.option.arguments);			this.option.arguments.remove(evt);		}		this.dragStart = false;	},	toString: function() {		return "HTML-Button " + this.id;	}});