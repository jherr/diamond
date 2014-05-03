'use strict';

/*global diamond:false */

window.diamond = window.diamond || {};

diamond.Gameboard = function( rows, columns, eventListeners ) {
	diamond.Gameboard.prototype.constructor();

	this.rows = rows;
	this.columns = columns;
	this.nextCellId = 1;

	this.grid = [];
	for( var r = 0; r < this.rows; r++ ) {
		var row = [];
		for( var c = 0; c < this.columns; c++ ) {
			row.push( null );
		}
		this.grid.push( row );
	}

	this.setSubscribersFromObject(eventListeners);
};
diamond.Gameboard.prototype = new diamond.SimpleEventDispatcher();

diamond.Gameboard.prototype.get = function( row, column ) {
	return this.grid[ row ][ column ];
};

diamond.Gameboard.prototype.move = function( cell, row, column ) {
	if ( cell.row === null || cell.column === null ) {
		throw new Error('Invalid move - cell is not on board');
	}

	var originalPosition = { row:cell.row, column:cell.column };

	row = parseInt( row );
	column = parseInt( column );

	if ( this.grid[ row ][ column ] !== null ) {
		throw new Error('Invalid move - target cell not empty');
	}

	this.grid[ cell.row ][ cell.column ] = null;
	this.grid[ row ][ column ] = cell;

	cell.moveTo( row, column );

	this.fire('cellMoved',{from:originalPosition,cell:this.grid[ row ][ column ]});
};

diamond.Gameboard.prototype.set = function( row, column, cell ) {
	if ( cell && ( cell.row !== null || cell.column !== null ) ) {
		throw new Error('Invalid set - cell is already on board');
	}

	if ( cell && cell._id === undefined ) {
		cell._id = this.nextCellId++;
	}

	if ( cell === null ) {
		if ( this.grid[ row ][ column ] !== null ) {
			this.fire('cellRemoved',{cell:this.grid[ row ][ column ]});
		}
	}

	this.grid[ parseInt( row ) ][ column ] = cell;

	if ( cell !== null ) {
		cell.moveTo( parseInt( row ), column );
		this.fire('cellAdded',{cell:this.grid[ row ][ column ]});
	}
};

diamond.Gameboard.prototype.swap = function( cell1, cell2 ) {
	if ( cell1.row === null || cell1.column === null || cell2.row === null || cell2.column === null ) {
		throw new Error('Invalid swap - cells not on board');
	}

	var op1 = { row: cell1.row, column: cell1.column };
	var op2 = { row: cell2.row, column: cell2.column };

	this.grid[ op2.row ][ op2.column ] = cell1;
	cell1.moveTo( op2.row, op2.column );

	this.grid[ op1.row ][ op1.column ] = cell2;
	cell2.moveTo( op1.row, op1.column );

	this.fire('cellSwapped',{cell1:cell1,cell2:cell2});
	this.fire('cellMoved',{from:op1,cell:cell1});
	this.fire('cellMoved',{from:op2,cell:cell2});
};

diamond.Gameboard.prototype.row = function( row ) {
	return this.grid[ row ];
};

diamond.Gameboard.prototype.allRows = function() {
	return this.grid;
};

diamond.Gameboard.prototype.column = function( col ) {
	var cells = [];
	for( var r = 0; r < this.rows; r++ ) {
		cells.push( this.grid[ r ][ col ] );
	}
	return cells;
};

diamond.Gameboard.prototype.allColumns = function() {
	var out = [];
	for( var c = 0; c < this.columns; c++ ) {
		out.push( this.column( c ) );
	}
	return out;
};

diamond.Gameboard.prototype.removeCells = function( cells ) {
	for( var c in cells ) {
		if ( cells[ c ] ) {
			this.set( cells[c].row, cells[c].column, null );
		}
	}
};

diamond.Gameboard.prototype.removeGroups = function( groups ) {
	for( var g in groups ) {
		this.removeCells( groups[ g ] );
	}
};

diamond.Gameboard.prototype.findShapes = function( shape, callback ) {
	var count = 0;
	for( var r = 0; r < this.rows; r++ ) {
		for( var c = 0; c < this.columns; c++ ) {
			var found = [];
			for( var se = 0; se < shape.length; se++ ) {
				var nr = r + shape[se][0];
				var nc = c + shape[se][1];
				if ( nc >= 0 && nc < this.columns && nr >= 0 && nr < this.rows ) {
					found.push( this.grid[ nr ][ nc ] );
				}
			}
			if ( found.length === shape.length ) {
				if ( callback ) {
					callback( found );
				}
				count++;
			}
		}
	}
	return count;
};

diamond.Gameboard.prototype.collapseColumn = function( column ) {
	var shift = 0;
	for( var ci = column.length - 1; ci >= 0; ci-- ) {
		if ( column[ ci ] === null ) {
			shift += 1;
		} else {
			if ( shift > 0 ) {
				this.move( column[ci], column[ci].row + shift, column[ci].column );
			}
		}
	}
	return ( shift > 0 );
};

diamond.Gameboard.prototype.collapse = function() {
	var columns = this.allColumns();
	var found = false;
	for( var c in columns ) {
		if ( this.collapseColumn( columns[ c ] ) ) {
			found = true;
		}
	}
	return found;
};

diamond.Gameboard.prototype.fill = function( factory ) {
	var found = false;
	var columns = this.allColumns();
	for( var c in columns ) {
		for( var r = this.rows - 1; r >= 0; r-- ) {
			if ( columns[ c ][ r ] === null ) {
				var cell = factory.build( r, c );
				this.set( r, c, cell );
				found = true;
				break;
			}
		}
	}
	return found;
};
