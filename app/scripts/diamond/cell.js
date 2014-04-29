'use strict';

function Cell( color ) {
	this.color = color;
	this.row = null;
	this.column = null;
	this.element = null;
}

Cell.prototype.isWildcard = function() {
	return ( this.color == null );
}

Cell.prototype.match = function( ocell ) {
	return ( this.isWildcard() || ocell.isWildcard() || ocell.color == this.color );
}

Cell.prototype.moveTo = function( row, column ) {
	this.row = row;
	this.column = column;
}

Cell.prototype.toString = function() {
	return this.color;
}

Cell.prototype.destroyed = function( game ) {
}


Bomb.prototype = new Cell( '!' );
Bomb.prototype.constructor = Bomb;
function Bomb( radius ) {
	this.radius = radius;
	this.row = null;
	this.column = null;
	this.element = null;
}
Bomb.prototype.isWildcard = function() {
	return true;
}
Bomb.prototype.match = function( ocell ) {
	return true;
}
Bomb.prototype.destroyed = function( game ) {
	var self = this;
	game.removeCellsWhere( function( row, column, cell ) {
		if ( row == self.row && column == self.column )
			return false;
		var dc = ( self.column - column ) * ( self.column - column );
		var dr = ( self.row - row ) * ( self.row - row );
		var dist = Math.sqrt( dc + dr );
		return dist <= self.radius;
	} );
}


ColorBomb.prototype = new Cell( 'A' );
ColorBomb.prototype.constructor = ColorBomb;
function ColorBomb( color ) {
	this.color = color.toUpperCase();
	this.row = null;
	this.column = null;
	this.element = null;
}
ColorBomb.prototype.destroyed = function( game ) {
	var self = this;
	game.removeCellsWhere( function( row, column, cell ) {
		return ( cell.color == self.color );
	} );
}


function CellFactory( colors ) {
	this.colors = colors;
}

CellFactory.prototype.build = function( row, column ) {
	return new Cell( this.colors[Math.floor(Math.random()*this.colors.length)] );
}


function TestFactoryWithGrid( grid ) {
	this.grid = grid;
	this.build = function( row, column ) {
		if ( this.grid[row].charAt(column) == '!' )
			return new Bomb( 3 );
		else {
			var color = this.grid[row].charAt(column);
			if ( color.search(/^[a-z]$/) == 0 ) {
				return new ColorBomb( color );
			} else {
				return new Cell( color );
			}
		}
	}
}

function TestFactoryWithSequence( columns, sequence ) {
	this.columns = columns;
	this.sequence = sequence;
	this.build = function( row, column ) {
		var offset = ( ( row * this.columns ) + column ) % this.sequence.length;
		return new Cell( this.sequence.charAt( offset ) );
	}
}

function TestFactoryWithRowSequence( sequence ) {
	this.sequence = sequence;
	this.build = function( row, column ) {
		var offset = row % this.sequence.length;
		return new Cell( this.sequence.charAt( offset ) );
	}
}
