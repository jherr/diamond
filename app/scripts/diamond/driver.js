'use strict';

function HTMLDriver() {
	this.board = null;
	this.game = null;
}
HTMLDriver.prototype.setGame = function( game ) {
	this.game = game;
};
HTMLDriver.prototype.setBoard = function( board ) {
	this.board = board;
	var self = this;
	this.board.on('cellAdded', function( data ) { self.onCellAdded( data.cell ); } );
	this.board.on('cellMoved', function( data ) { self.onCellMoved( data.cell, data.from ); } );
	this.board.on('cellRemoved', function( data ) { self.onCellRemoved( data.cell ); } );
};
/*jshint unused:false */
HTMLDriver.prototype.onCellAdded = function( cell ) { };
/*jshint unused:false */
HTMLDriver.prototype.onCellMoved = function( cell, from ) { };
/*jshint unused:false */
HTMLDriver.prototype.onCellRemoved = function( cell ) { };
