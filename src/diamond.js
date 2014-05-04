'use strict';

/*global diamond:false */

window.diamond = window.diamond || {};

diamond.Cell = function( color ) {
	this.color = color;
	this.row = null;
	this.column = null;
	this.element = null;
};

/*jshint unused:false */
diamond.Cell.prototype.isWildcard = function( firstCollapse ) {
	return ( this.color === null );
};

/*jshint unused:false */
diamond.Cell.prototype.match = function( ocell, firstCollapse ) {
	return ( this.isWildcard( firstCollapse ) || ocell.isWildcard( firstCollapse ) || ocell.color === this.color );
};

diamond.Cell.prototype.moveTo = function( row, column ) {
	this.row = row;
	this.column = column;
};

diamond.Cell.prototype.toString = function() {
	return this.color;
};

/*jshint unused:false */
diamond.Cell.prototype.renderInto = function( element ) {
};

/*jshint unused:false */
diamond.Cell.prototype.destroyed = function( game ) {
};


diamond.Bomb = function( radius ) {
	this.radius = radius;
	this.row = null;
	this.column = null;
	this.element = null;
};

diamond.Bomb.prototype = new diamond.Cell( '!' );
diamond.Bomb.prototype.constructor = diamond.Bomb;

diamond.Bomb.prototype.isWildcard = function( firstCollapse ) {
	return firstCollapse;
};

diamond.Bomb.prototype.match = function( ocell, firstCollapse ) {
	return firstCollapse;
};

diamond.Bomb.prototype.destroyed = function( game ) {
	var self = this;
	game.removeCellsWhere( function( row, column, cell ) {
		if ( row === self.row && column === self.column ) {
			return false;
		}
		var dc = ( self.column - column ) * ( self.column - column );
		var dr = ( self.row - row ) * ( self.row - row );
		var dist = Math.sqrt( dc + dr );
		return dist <= self.radius;
	} );
};


diamond.ColorBomb = function( color ) {
	this.color = color.toUpperCase();
	this.row = null;
	this.column = null;
	this.element = null;
};

diamond.ColorBomb.prototype = new diamond.Cell( 'A' );
diamond.ColorBomb.prototype.constructor = diamond.ColorBomb;

diamond.ColorBomb.prototype.destroyed = function( game ) {
	var self = this;
	game.removeCellsWhere( function( row, column, cell ) {
		return ( cell.color === self.color );
	} );
};

diamond.CellFactory = function( colors ) {
	this.colors = colors;
};

diamond.CellFactory.prototype.build = function( row, column ) {
	return new diamond.Cell( this.colors[Math.floor(Math.random()*this.colors.length)] );
};
;'use strict';

/*global diamond:false */

window.diamond = window.diamond || {};

diamond.HTMLDriver = function() {
	this.board = null;
	this.game = null;
};
diamond.HTMLDriver.prototype.setGame = function( game ) {
	this.game = game;
};
diamond.HTMLDriver.prototype.setBoard = function( board ) {
	this.board = board;
	var self = this;
	this.board.on('cellAdded', function( data ) { self.onCellAdded( data.cell ); } );
	this.board.on('cellMoved', function( data ) { self.onCellMoved( data.cell, data.from ); } );
	this.board.on('cellRemoved', function( data ) { self.onCellRemoved( data.cell ); } );
};
/*jshint unused:false */
diamond.HTMLDriver.prototype.onCellAdded = function( cell ) { };
/*jshint unused:false */
diamond.HTMLDriver.prototype.onCellMoved = function( cell, from ) { };
/*jshint unused:false */
diamond.HTMLDriver.prototype.onCellRemoved = function( cell ) { };
;'use strict';

/*global diamond:false */

window.diamond = window.diamond || {};

diamond.StrictFinder = function( cutoff ) {
	this.cutoff = cutoff || 3;
};

diamond.StrictFinder.prototype.find = function( board, centroids ) {
	var groups = [];

	for( var c in centroids ) {
		this.findInSeries( board.row( centroids[c].row ), centroids[c].column, groups );
		this.findInSeries( board.column( centroids[c].column ), centroids[c].row, groups );
	}

	var uniqs = {};
	for( var o in groups ) {
		for ( var i in groups[o] ) {
			uniqs[ groups[o][i]._id ] = groups[o][i];
		}
	}
	var out = [];
	for( var k in uniqs ) {
		out.push( uniqs[ k ] );
	}
	return out.length > 0 ? [ out ] : [];
};

diamond.StrictFinder.prototype.findInSeries = function( series, origin, out ) {
	var ocell = series[ origin ];
	if ( ocell.isWildcard( true ) ) {
		return;
	} else {
		var add = [ ocell ];
		for( var c = origin - 1; c >=0; c-- ) {
			if ( ocell.match( series[ c ], true ) ) {
				add.push( series[ c ] );
			} else {
				break;
			}
		}
		for( c = origin + 1; c < series.length; c++ ) {
			if ( ocell.match( series[ c ], true ) ) {
				add.push( series[ c ] );
			} else {
				break;
			}
		}
		if ( add.length >= this.cutoff ) {
			out.push( add );
			return true;
		} else {
			return false;
		}
	}
};


diamond.RowColFinder = function( cutoff ) {
	this.cutoff = cutoff || 3;
};

diamond.RowColFinder.prototype.find = function( board ) {
	var out = [];

	var found = this.findSequences( board.allRows() );
	for( var f in found ) { out.push( found[f] ); }

	found = this.findSequences( board.allColumns() );
	for( f in found ) { out.push( found[f] ); }

	return out;
};

diamond.RowColFinder.prototype.findSequences = function( rows ) {
	var out = [];

	for( var r in rows ) {
		var row = rows[r];
		var seq = [];
		var nonWild = null;

		for( var i in row ) {
			var cell = row[ i ];
			if ( cell === null ) {
				if ( seq.length >= this.cutoff ) {
					out.push( seq );
				}
				seq = [];
				nonWild = null;
			} else {
				if ( cell.isWildcard( false ) ) {
					seq.push( cell );
				} else {
					if ( nonWild === null ) {
						nonWild = cell;
					}
					if( nonWild.match( cell, false ) ) {
						seq.push( cell );
					} else {
						if ( seq.length >= this.cutoff ) {
							out.push( seq );
						}
						if ( seq.length > 0 ) {
							var last = seq[ seq.length - 1 ];
							seq = last.isWildcard( false ) ? [ last, cell ] : [ cell ];
						} else {
							seq = [ cell ];
						}
						nonWild = cell;
					}
				}
			}
		}

		if ( seq.length >= this.cutoff ) {
			out.push( seq );
		}
	}

	return out;
};
;'use strict';

/*global diamond:false */

window.diamond = window.diamond || {};

diamond.SimpleEventDispatcher = function() {
	this.subscribers = {};
};

diamond.SimpleEventDispatcher.prototype.setSubscribersFromObject = function( obj ) {
	if ( obj !== undefined ) {
		for( var k in obj ) {
			this.on( k, obj[ k ] );
		}
	}
};

diamond.SimpleEventDispatcher.prototype.on = function( event, callback ) {
	if ( this.subscribers[ event ] === undefined ) {
		this.subscribers[ event ] = [];
	}
	this.subscribers[ event ].push( callback );
};

diamond.SimpleEventDispatcher.prototype.fire = function( event, data ) {
	if ( this.subscribers[ event ] !== undefined ) {
		for( var cb in this.subscribers[ event ] ) {
			this.subscribers[ event ][ cb ].call( this, data );
		}
	}
};

diamond.Game = function( gameboard, cellFactory, options ) {
	diamond.Game.prototype.constructor();

	this.gameboard = gameboard;
	this.cellFactory = cellFactory;
	this.firstPoint = null;
	this.pending = [];
	this.locked = false;
	this.gameStarted = false;
	this.afterPending = [];
	this.removalSession = {};
	this.debug = false;
	this.centroidsForFinder = [];

	this.options = options;
	this.options.finder = this.options.finder || new diamond.RowColFinder();
	this.options.firstFinder = this.options.firstFinder || new diamond.StrictFinder();
	if( this.options.initialCollapse === undefined ) {
		this.options.initialCollapse = true;
	}
	if ( this.options.cascadeCollapses === undefined ) {
		this.options.cascadeCollapses = true;
	}

	if ( this.options.htmlDriver ) {
		this.options.htmlDriver.setGame( this );
		this.options.htmlDriver.setBoard( this.gameboard );
	}

	this.setSubscribersFromObject( this.options.on );
};

diamond.Game.prototype = new diamond.SimpleEventDispatcher();

diamond.Game.prototype.inFirstCollapse = function() {
	return ( this.centroidsForFinder.length > 0 );
};

diamond.Game.prototype.hasPending = function() {
	return ( this.locked || this.pending.length > 0 );
};

diamond.Game.prototype.servicePending = function() {
	if ( this.hasPending() && this.locked === false ) {
		var action = this.pending.shift();
		if ( action.call( this ) === false ) {
			this.pending.unshift( action );
		}
	}
	if ( this.hasPending() === false && this.afterPending.length > 0 ) {
		for( var ap in this.afterPending ) {
			this.afterPending[ ap ].call( this );
		}
		this.afterPending = [];
	}
	return this.hasPending();
};

diamond.Game.prototype.addPending = function( func ) {
	this.pending.push( func );
};

diamond.Game.prototype.addPendingDelay = function( delay ) {
	if( delay !== undefined && delay > 0 ) {
		this.pending.push( function( game ) {
			game.locked = true;
			window.setTimeout( function() {
				game.locked = false;
			}, delay );
			return true;
		} );
	}
};

diamond.Game.prototype.clickCell = function( cell ) {
	this.click( parseInt( cell.row ), parseInt( cell.column ) );
};

diamond.Game.prototype.click = function( row, column ) {
	if ( this.firstPoint === null ) {
		this.firstPoint = { row: row, column: column };
	} else {
		if( this.validMove( this.firstPoint, { row: row, column: column } ) ) {
			var cell1 = this.gameboard.get( this.firstPoint.row, this.firstPoint.column );
			var cell2 = this.gameboard.get( row, column );

			this.gameboard.swap( cell1, cell2 );

			var centroids = [
				this.firstPoint,
				{ row: row, column: column }
			];
			var found = this.options.firstFinder.find( this.gameboard, centroids );

			if ( found.length > 0 ) {
				this.centroidsForFinder = centroids;
				this.collapse();
			} else {
				this.gameboard.swap( cell1, cell2 );
			}
		} else {
			this.fire('invalidMove',[this.firstPoint,{ row: row, column: column }]);
		}
		this.firstPoint = null;
	}
};

diamond.Game.prototype.validMove = function(pt1,pt2) {
	if ( pt1.row === pt2.row ) {
		if ( pt1.column === pt2.column - 1 || pt1.column === pt2.column + 1 ) {
			return true;
		}
	} else if ( pt1.column === pt2.column ) {
		if ( pt1.row === pt2.row - 1 || pt1.row === pt2.row + 1 ) {
			return true;
		}
	}
	return false;
};

diamond.Game.prototype.start = function() {
	this.initialSetup();
	if ( this.options.initialCollapse ) {
		this.collapse();
		while( this.servicePending() ) { }
	}
	this.afterPending.push( function() {
		this.gameStarted = true;
		this.fire('gameStarted',null);
	} );
};

diamond.Game.prototype.findCollapses = function( ) {
	if ( this.centroidsForFinder.length > 0 ) {
		var found = this.options.firstFinder.find( this.gameboard, this.centroidsForFinder );
		this.centroidsForFinder = [];
		return found;
	} else {
		return this.options.finder.find( this.gameboard, this.centroidsForFinder );
	}
};

diamond.Game.prototype.removeCells = function( cells ) {
	this.bulkRemoveCells( cells );
	this.gameboard.removeGroups( [ cells ] );
};

diamond.Game.prototype.removeCellsWhere = function( callback ) {
	var cells = [];
	for( var r = 0; r < this.gameboard.rows; r++ ) {
		for( var c = 0; c < this.gameboard.columns; c++ ) {
			var cell = this.gameboard.get( r, c );
			if ( cell && this.removalSession[ cell._id ] === undefined ) {
				this.fire('score',1);
				if ( callback.call( this, r, c, cell ) ) {
					cells.push( cell );
				}
			}
		}
	}
	this.bulkRemoveCells( cells );
	this.gameboard.removeGroups( [ cells ] );
};

diamond.Game.prototype.removeGroups = function( groups ) {
	for( var gr in groups ) {
		this.bulkRemoveCells( groups[ gr ] );
	}
	this.gameboard.removeGroups( groups );
};

diamond.Game.prototype.bulkRemoveCells = function( cells ) {
	for( var ci in cells ) {
		var cell = cells[ ci ];
		if ( cell ) {
			if ( this.removalSession[ cell._id ] === undefined ) {
				this.destroyQueue.push( cell );
				this.removalSession[ cell._id ] = true;
				this.fire('score',1);
			}
		}
	}
};

diamond.Game.prototype.collapse = function( ) {
	var found = this.findCollapses();
	if ( found.length > 0 ) {
		this.addPending( function() {
			this.fire('removingGroups',found);

			this.removalSession = {};
			this.destroyQueue = [];
			this.removeGroups( found );
			while( this.destroyQueue.length > 0 ) {
				var cell = this.destroyQueue.pop();
				cell.destroyed( this );
			}
			this.removalSession = {};

			return true;
		} );

		this.addPendingDelay( this.options.removeGroupDelay );

		this.addPending( function() {
			this.fire('collapsing',null);
			this.gameboard.collapse();
			return true;
		} );

		this.addPendingDelay( this.options.collapseDelay );

		this.addPending( function() {
			this.fire('filling',null);
			return ! this.gameboard.fill( this.cellFactory );
		} );

		this.addPendingDelay( this.options.fillDelay );

		if ( this.options.cascadeCollapses ) {
			this.addPending( function() {
				this.collapse();
				return true;
			} );
		}
	}

	return ( found.length > 0 );
};

diamond.Game.prototype.initialSetup = function() {
	this.fire( 'initialSetupStart', null );
	for( var r = 0; r < this.gameboard.rows; r++ ) {
		for( var c = 0; c < this.gameboard.columns; c++ ) {
			var cell = this.cellFactory.build( r, c );
			this.gameboard.set( r, c, cell );
		}
	}
	this.fire( 'initialSetupComplete', null );
};;'use strict';

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
