'use strict';

/*jshint unused:false */
function GameboardBuilder( rows ) {
	var gb = new Gameboard( rows.length, rows[0].length );
	for( var r in rows ) {
		for( var c = 0; c < rows[r].length; c++ ) {
			var ch = rows[r].charAt( c );
			if ( ch === '-' ) {
				gb.set( parseInt( r ), c, null );
			} else if ( ch === '!') {
				gb.set( parseInt( r ), c, new Bomb( 5 ) );
			} else {
				var color = ch === '*' ? null : ch;
				var cell = new Cell( color );
				gb.set( parseInt( r ), c, cell );
			}
		}
	}
	return gb;
}

function TestFactoryWithGrid( grid ) {
	this.grid = grid;
	this.build = function( row, column ) {
		if ( this.grid[row].charAt(column) === '!' ) {
			return new Bomb( 3 );
		} else {
			var color = this.grid[row].charAt(column);
			if ( color.search(/^[a-z]$/) === 0 ) {
				return new ColorBomb( color );
			} else {
				return new Cell( color );
			}
		}
	};
}

function TestFactoryWithSequence( columns, sequence ) {
	this.columns = columns;
	this.sequence = sequence;
	this.build = function( row, column ) {
		var offset = ( ( row * this.columns ) + column ) % this.sequence.length;
		return new Cell( this.sequence.charAt( offset ) );
	};
}

function TestFactoryWithRowSequence( sequence ) {
	this.sequence = sequence;
	this.build = function( row, column ) {
		var offset = row % this.sequence.length;
		return new Cell( this.sequence.charAt( offset ) );
	};
}
