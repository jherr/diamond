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
