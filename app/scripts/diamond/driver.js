'use strict';

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
