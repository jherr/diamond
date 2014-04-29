'use strict';

function Gameboard( rows, columns ) {
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
}

Gameboard.prototype.get = function( row, column ) {
	return this.grid[ row ][ column ];
}

Gameboard.prototype.set = function( row, column, cell ) {
	if ( cell && cell._id == null ) {
		cell._id = this.nextCellId++;
	}

	this.grid[ row ][ column ] = cell;

	if ( cell != null ) {
		cell.moveTo( parseInt( row ), column );
	}
}

Gameboard.prototype.swap = function( cell1, cell2 ) {
	var ocr = cell1.row;
	var orc = cell1.column;
	this.set( cell2.row, cell2.column, cell1 );
	this.set( ocr, orc, cell2 );
}

Gameboard.prototype.row = function( row ) {
	return this.grid[ row ];
}

Gameboard.prototype.allRows = function() {
	return this.grid;
}

Gameboard.prototype.column = function( col ) {
	var cells = [];
	for( var r = 0; r < this.rows; r++ ) {
		cells.push( this.grid[ r ][ col ] );
	}
	return cells;
}

Gameboard.prototype.allColumns = function() {
	var out = [];
	for( var c = 0; c < this.columns; c++ ) {
		out.push( this.column( c ) );
	}
	return out;
}

Gameboard.prototype.removeCells = function( cells ) {
	for( var c in cells ) {
		if ( cells[ c ] ) {
			this.set( cells[c].row, cells[c].column, null );
		}
	}
}

Gameboard.prototype.removeGroups = function( groups ) {
	for( var g in groups ) {
		this.removeCells( groups[ g ] );
	}
}

Gameboard.prototype.findShapes = function( shape, callback ) {
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
			if ( found.length == shape.length ) {
				if ( callback )
					callback( found );
				count++;
			}
		}
	}
	return count;
}

Gameboard.prototype.collapseColumn = function( column ) {
	var shift = 0;
	for( var ci = column.length - 1; ci >= 0; ci-- ) {
		if ( column[ ci ] == null ) {
			shift += 1;
		} else {
			if ( shift > 0 ) {
				this.set( column[ci].row + shift, column[ci].column, column[ci] );
				this.set( ci, column[ci].column, null );
			}
		}
	}
	return ( shift > 0 );
}

Gameboard.prototype.collapse = function() {
	var columns = this.allColumns();
	var found = false;
	for( var c in columns ) {
		if ( this.collapseColumn( columns[ c ] ) ) {
			found = true;
		}
	}
	return found;
}

Gameboard.prototype.fill = function( factory ) {
	var found = false;
	var columns = this.allColumns();
	for( var c in columns ) {
		for( var r = this.rows - 1; r >= 0; r-- ) {
			if ( columns[ c ][ r ] == null ) {
				var cell = factory.build( r, c );
				this.set( r, c, cell );
				found = true;
				break;
			}
		}
	}
	return found;
}

function GameboardBuilder( rows ) {
	var gb = new Gameboard( rows.length, rows[0].length );
	for( var r in rows ) {
		for( var c = 0; c < rows[r].length; c++ ) {
			var ch = rows[r].charAt( c );
			if ( ch == '-' ) {
				gb.set( parseInt( r ), c, null );
			} else if ( ch == '!') {
				gb.set( parseInt( r ), c, new Bomb( 5 ) );
			} else {
				var color = ch == '*' ? null : ch;
				var cell = new Cell( color );
				gb.set( parseInt( r ), c, cell );
			}
		}
	}
	return gb;
}
