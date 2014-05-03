'use strict';

function Cell( color ) {
	this.color = color;
	this.row = null;
	this.column = null;
	this.element = null;
}

/*jshint unused:false */
Cell.prototype.isWildcard = function( firstCollapse ) {
	return ( this.color === null );
};

/*jshint unused:false */
Cell.prototype.match = function( ocell, firstCollapse ) {
	return ( this.isWildcard( firstCollapse ) || ocell.isWildcard( firstCollapse ) || ocell.color === this.color );
};

Cell.prototype.moveTo = function( row, column ) {
	this.row = row;
	this.column = column;
};

Cell.prototype.toString = function() {
	return this.color;
};

/*jshint unused:false */
Cell.prototype.renderInto = function( element ) {
};

/*jshint unused:false */
Cell.prototype.destroyed = function( game ) {
};


function Bomb( radius ) {
	this.radius = radius;
	this.row = null;
	this.column = null;
	this.element = null;
}

Bomb.prototype = new Cell( '!' );
Bomb.prototype.constructor = Bomb;

Bomb.prototype.isWildcard = function( firstCollapse ) {
	return firstCollapse;
};

Bomb.prototype.match = function( ocell, firstCollapse ) {
	return firstCollapse;
};

Bomb.prototype.destroyed = function( game ) {
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


function ColorBomb( color ) {
	this.color = color.toUpperCase();
	this.row = null;
	this.column = null;
	this.element = null;
}

ColorBomb.prototype = new Cell( 'A' );
ColorBomb.prototype.constructor = ColorBomb;

ColorBomb.prototype.destroyed = function( game ) {
	var self = this;
	game.removeCellsWhere( function( row, column, cell ) {
		return ( cell.color === self.color );
	} );
};


function CellFactory( colors ) {
	this.colors = colors;
}

CellFactory.prototype.build = function( row, column ) {
	return new Cell( this.colors[Math.floor(Math.random()*this.colors.length)] );
};

