'use strict';

function SimpleEventDispatcher() {
	this.subscribers = {};
}

SimpleEventDispatcher.prototype.setSubscribersFromObject = function( obj ) {
	if ( obj != null ) {
		for( var k in obj ) {
			this.on( k, obj[ k ] );
		}
	}
}

SimpleEventDispatcher.prototype.on = function( event, callback ) {
	if ( this.subscribers[ event ] == null )
		this.subscribers[ event ] = [];
	this.subscribers[ event ].push( callback );
}

SimpleEventDispatcher.prototype.fire = function( event, data ) {
	if ( this.subscribers[ event ] != null ) {
		for( var cb in this.subscribers[ event ] ) {
			this.subscribers[ event ][ cb ].call( this, data );
		}
	}
}

DiamondGame.prototype = new SimpleEventDispatcher();
function DiamondGame( gameboard, cellFactory, options ) {
	DiamondGame.prototype.constructor();

	this.gameboard = gameboard;
	this.cellFactory = cellFactory;
	this.firstPoint = null;
	this.pending = [];
	this.locked = false;
	this.gameStarted = false;
	this.afterPending = [];
	this.removalSession = {};
	this.debug = false;

	this.options = options;
	this.options.finder = this.options.finder || new RowColFinder();
	if( this.options.initialCollapse == null ) {
		this.options.initialCollapse = true;
	}
	if ( this.options.cascadeCollapses == null ) {
		this.options.cascadeCollapses = true;
	}

	this.setSubscribersFromObject( this.options.on );
}

DiamondGame.prototype.hasPending = function() {
	return ( this.locked || this.pending.length > 0 );
}

DiamondGame.prototype.servicePending = function() {
	if ( this.hasPending() && this.locked == false ) {
		var action = this.pending.shift();
		if ( action.call( this ) == false ) {
			this.pending.unshift( action );
		}
	}
	if ( this.hasPending() == false && this.afterPending.length > 0 ) {
		for( var ap in this.afterPending ) {
			this.afterPending[ ap ].call( this );
		}
		this.afterPending = [];
	}
	return this.hasPending();
}

DiamondGame.prototype.addPending = function( func ) {
	this.pending.push( func );
}

DiamondGame.prototype.addPendingDelay = function( delay ) {
	if( delay != null && delay > 0 ) {
		this.pending.push( function( game ) {
			game.locked = true;
			window.setTimeout( function() {
				game.locked = false;
			}, delay );
			return true;
		} );
	}
}

DiamondGame.prototype.click = function( row, column ) {
	if ( this.firstPoint == null ) {
		this.firstPoint = { row: row, column: column };
	} else {
		if( this.validMove( this.firstPoint, { row: row, column: column } ) ) {
			var cell1 = this.gameboard.get( this.firstPoint.row, this.firstPoint.column );
			var cell2 = this.gameboard.get( row, column );

			this.gameboard.swap( cell1, cell2 );

			var found = this.options.finder.find( this.gameboard );

			if ( found.length > 0 ) {
				this.collapse();
			} else {
				this.gameboard.swap( cell1, cell2 );
			}
		} else {
			this.fire('invalidMove',[this.firstPoint,{ row: row, column: column }]);
		}
		this.firstPoint = null;
	}
}

DiamondGame.prototype.validMove = function(pt1,pt2) {
	if ( pt1.row == pt2.row ) {
		if ( pt1.column == pt2.column - 1 || pt1.column == pt2.column + 1 )
			return true;
	} else if ( pt1.column == pt2.column ) {
		if ( pt1.row == pt2.row - 1 || pt1.row == pt2.row + 1 )
			return true;
	}
	return false;
}

DiamondGame.prototype.start = function() {
	this.initialSetup();
	if ( this.options.initialCollapse ) {
		this.collapse();
		while( this.servicePending() ) ;
	}
	this.afterPending.push( function() {
		this.gameStarted = true;
		this.fire('gameStarted',null);
	} )
}

DiamondGame.prototype.findCollapses = function( ) {
	return this.options.finder.find( this.gameboard );
}

DiamondGame.prototype.removeCells = function( cells ) {
	this.bulkRemoveCells( cells );
	this.gameboard.removeGroups( [ cells ] );
}

DiamondGame.prototype.removeCellsWhere = function( callback ) {
	var cells = [];
	for( var r = 0; r < this.gameboard.rows; r++ ) {
		for( var c = 0; c < this.gameboard.columns; c++ ) {
			var cell = this.gameboard.get( r, c );
			if ( cell && this.removalSession[ cell._id ] == null ) {
				if ( callback.call( this, r, c, cell ) ) {
					cells.push( cell );
				}
			}
		}
	}
	this.bulkRemoveCells( cells );
	this.gameboard.removeGroups( [ cells ] );
}

DiamondGame.prototype.removeGroups = function( groups ) {
	for( var gr in groups ) {
		this.bulkRemoveCells( groups[ gr ] );
	}
	this.gameboard.removeGroups( groups );
}

DiamondGame.prototype.bulkRemoveCells = function( cells ) {
	for( var ci in cells ) {
		var cell = cells[ ci ];
		if ( cell ) {
			if ( this.removalSession[ cell._id ] == null ) {
				this.destroyQueue.push( cell );
			 	this.removalSession[ cell._id ] = true;
			}
		}
	}
}

DiamondGame.prototype.collapse = function( ) {
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

			if ( this.debug )
			    dumpGameboard(this.gameboard);

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
}

DiamondGame.prototype.initialSetup = function() {
	this.fire( 'initialSetupStart', null );
	for( var r = 0; r < this.gameboard.rows; r++ ) {
		for( var c = 0; c < this.gameboard.columns; c++ ) {
			var cell = this.cellFactory.build( r, c );
			this.gameboard.set( r, c, cell );
		}
	}
	this.fire( 'initialSetupComplete', null );
}