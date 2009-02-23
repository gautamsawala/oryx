/**
 * Copyright (c) 2009
 * Jan-Felix Schwarz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/


MOVI.namespace("util");

(function() {
	
	var _SELECT_RECT_CLASS_NAME = "movi-select-rect",
		_HIGHLIGHT_RECT_CLASS_NAME = "movi-highlight-rect";
		
	var Marker 	= MOVI.util.Marker,
		Event 	= YAHOO.util.Event; 
	
	/**
     * Enbable shape selection for the specified model viewer
     * @namespace MOVI.util
     * @class MOVI.util.ShapeSelect
     * @constructor
	 * @param {ModelViewer} modelviewer The ModelViewer for that shape selection is enabled
	 * @param {Shape*} shapes (optional) The subset of shapes that are selectable. If not specified 
	 * all shapes are selectable.
	 * @param {Boolean} multiselect (optional) If set to true, multiple shapes can be selected (default is false).
     */
    MOVI.util.ShapeSelect = function(modelviewer, shapes, multiselect) {
	
		if(!modelviewer) {
			MOVI.log("No model viewer specified for shape select.", "error", "shapeselect.js");
			return false;
		}
		
		if(!YAHOO.lang.isArray(shapes)) {
			shapes = modelviewer.canvas.getNodes(); // only nodes supported atm
			if(shapes==true) multiselect = true;
		}
		
		this._allowMultiselect = multiselect;
		
		for(key in shapes) {
			var shape = modelviewer.canvas.shapes[key];
			
			if(shape.parentShape!=null) {
				shape.addListener("mouseover", this._onMouseOver, shape, this, true);
				shape.addListener("mouseout", this._onMouseOut, shape, this, true);
				shape.addListener("click", this._onClick, shape, this, true);
				this._selectableShapes[shape.resourceId] = shape;
			}
			
		}
		
		this._selectionMarker = new Marker();
		this._selectionMarker.setRectClassName(_SELECT_RECT_CLASS_NAME);
		this._selectionMarker.show();
		this._init();
	};
	
	MOVI.util.ShapeSelect.prototype = {
		
		_selectableShapes: {},
		
		_selectedShapes: {},
		
		_highlightMarkers: {},
		
		_selectionMarker: null,
		
		_selectionChangedCallback: function() {},
		
		_allowMultiselect: false,
		
		_init: function() {
			// create highlighting markers
			for(key in this._selectableShapes) {
				var s = this._selectableShapes[key];
				var marker = new Marker(s);
				marker.setRectClassName(_HIGHLIGHT_RECT_CLASS_NAME);
				marker.hide();
				this._highlightMarkers[s.resourceId] = marker;
			}
		},
		
		_onMouseOver: function(ev, shape) {
			Event.stopPropagation(ev);
			
			if(!this._selectedShapes[shape.resourceId])
				this.highlight(shape);
		},
		
		_onMouseOut: function(ev, shape) {
			Event.stopPropagation(ev);
			
			if(!this._selectedShapes[shape.resourceId])
				this.unhighlight(shape);
		},
		
		_onClick: function(ev, shape) {
			Event.stopPropagation(ev);
			
			if(this._selectedShapes[shape.resourceId]) {
				this.deselect(shape);
			} else {
				if(!this._allowMultiselect)
					this._reset();
				this.select(shape);	
			}
				
		},
		
		_reset: function() {
			this._selectedShapes = {};
		},
		
		/**
		 * Add the specified shapes to the current selection
		 * @method select
		 * @param {[Shape] | Shape} shapes The shapes to add to the selection
		 */
		select: function(shapes) {
			if(!YAHOO.lang.isArray(shapes)) shapes = [shapes];
			
			for(key in shapes) {
				var s = shapes[key];
				
				this.unhighlight(s);
			
				if(!this._selectableShapes[s.resourceId]) {
					MOVI.log("Specified shape with resource id " + s.resourceId + 
							 " is not selectable.", "warn", "shapeselect.js");
					continue;
				}
		
				this._selectedShapes[s.resourceId] = s;
				this._selectionMarker.addShape(s);
				
			}
			
			this._selectionChangedCallback(this.getSelectedShapes(), this._selectionMarker);
		}, 
		
		/**
		 * Remove the specified shapes from the current selection
		 * @method deselect
		 * @param {[Shape] | Shape} shapes The shapes to remove from the selection
		 */
		deselect: function(shapes) {
			if(!YAHOO.lang.isArray(shapes)) shapes = [shapes];
			
			for(key in shapes) {
				var s = shapes[key];
				delete this._selectedShapes[s.resourceId];
				this._selectionMarker.removeShape(s);
			}
			
			this._selectionChangedCallback(this.getSelectedShapes(), this._selectionMarkers);
		},
		
		/**
		 * Highlight the specified shape by showing the highlighting marker
		 * @method highlight
		 * @param {Shape} shape The shape to be highlighted
		 */
		highlight: function(shape) {
			this._highlightMarkers[shape.resourceId].show();
		},
		
		/**
		 * Unhighlight the specified shape by hiding the highlighting marker
		 * @method unhighlight
		 * @param {Shape} shape The shape to be unhighlighted
		 */
		unhighlight: function(shape) {
			this._highlightMarkers[shape.resourceId].hide();
		},
		
		/**
		 * Reset the current selection
		 * @method reset
		 */
		reset: function() {
			this._reset();
			this._selectionChangedCallback(this.getSelectedShapes(), this._selectionMarkers);
		},
		
		/**
		 * Returns the currently selected shapes
		 * @method getSelectShapes
		 * @returns {[Shape]} An array of selected Shape objects
		 */
		getSelectedShapes: function() {
			var selected = new Array();
			for(key in this._selectedShapes)
				selected.push(this._selectedShapes[key]);
			return selected;
		},
		
		/**
		 * Enables the specificatio of a callback to be executed when the selection
		 * changes (shapes are added to or removed from the current selection)
		 * @method getSelectShapes
		 * @returns {[Shape]} An array of selected Shape objects
		 */
		onSelectionChanged: function(callback) {
			// TODO add params for execution scope etc.
			this._selectionChangedCallback = callback;
		}
		
	}
	
	
})();