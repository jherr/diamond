'use strict';

/*
Add hints
Add bombs
*/

function Board( host, options ) {
	this.options = options || {};
	this.options.scoreCallback = this.options.scoreCallback || function( cells ) {};
	this.host = host;
	this.cells = [];
	this.rows = options.rows || 15;
	this.cols = options.cols || 10;
	this.size = 25;
	this.gutter = 3;
	this.colors = [ 'red', 'green', 'blue', 'pink', 'purple' ];
	this.in_compression = false;
	this.startLoc = null;

	var self = this;

	var mkCallback = function( r, c ) {
		return function( event ) { self.cellClick( this, event, r, c ); }
	};

	for( var r = 0; r < this.rows; r++ ) {
		var row = [];
		for( var c = 0; c < this.cols; c++ ) {
			var color = this.colors[ Math.floor( Math.random() * this.colors.length ) ];
			var el = $('<div/>', {
				style:"width:"+this.size+"px;height:"+this.size+"px;top:"+((this.size+this.gutter)*r)+"px;left:"+((this.size+this.gutter)*c)+"px;",
				class: 'diamond '+color,
				click: mkCallback( r, c )
			} );
			this.host.append( el );
			row.push( { element: el, color: color, row: r, col: c } );
		}
		this.cells.push( row );
	}

	window.setTimeout( function() { self.findMatches(); }, 0 )

	return this;
}

Board.prototype.findCell = function( cell ) {
	for( var r = 0; r < this.rows; r++ ) {
		for( var c = 0; c < this.cols; c++ ) {
			if ( this.cells[ r ][ c ].element == cell )
				return { row: r, col: c };
		}
	}
	return null;
}

Board.prototype.cellClick = function( cell, event, row, column ) {
	if ( this.in_compression )
		return;

	var loc = { row: row, col: column };
	if ( this.startLoc == null ) {
		this.startLoc = loc;
	} else {
		if ( this.startLoc.row == loc.row && this.startLoc.col == loc.col ) {
			this.startLoc = null;
			return;
		}
		var valid = false;

		if ( this.startLoc.row + 1 == loc.row && this.startLoc.col == loc.col )
			valid = true;
		if ( this.startLoc.row - 1 == loc.row && this.startLoc.col == loc.col )
			valid = true;
		if ( this.startLoc.row == loc.row && this.startLoc.col + 1 == loc.col )
			valid = true;
		if ( this.startLoc.row == loc.row && this.startLoc.col - 1 == loc.col )
			valid = true;

		if ( valid ) {
			var c1 = this.cells[ this.startLoc.row ][ this.startLoc.col ];
			var c2 = this.cells[ loc.row ][ loc.col ];
			var s1 = c1.color;

			if ( this.hasMatches( this.startLoc.row, this.startLoc.col, c2.color ) ||
				 this.hasMatches( loc.row, loc.col, c1.color ) )
			{
				c1.element.removeClass( c1.color );
				c2.element.removeClass( c2.color );

				c1.color = c2.color;
				c2.color = s1;

				c1.element.addClass( c1.color );
				c2.element.addClass( c2.color );

				var self = this;
				window.setTimeout( function() { self.findMatches(); }, 0 )
			}
		}

		this.startLoc = null;
	}
}

Board.prototype.hasMatch = function( ncolor, r1, c1, r2, c2 ) {
	if ( r1 < 0 || r2 < 0 || c1 < 0 || c2 < 0 )
		return false;
	if ( r1 >= this.rows || r2 >= this.rows || c1 >= this.cols || c2 >= this.cols )
		return false;
	return ( this.cells[ r1 ][ c1 ].color == ncolor && this.cells[ r2 ][ c2 ].color == ncolor );
}

Board.prototype.hasMatches = function( orow, ocol, ncolor ) {
	var pgroups = [];
	if ( this.hasMatch( ncolor, orow - 2, ocol, orow - 1, ocol ) )
		return true;
	if ( this.hasMatch( ncolor, orow - 1, ocol, orow + 1, ocol ) )
		return true;
	if ( this.hasMatch( ncolor, orow + 1, ocol, orow + 2, ocol ) )
		return true;
	if ( this.hasMatch( ncolor, orow, ocol - 2, orow, ocol - 1 ) )
		return true;
	if ( this.hasMatch( ncolor, orow, ocol - 1, orow, ocol + 1 ) )
		return true;
	if ( this.hasMatch( ncolor, orow, ocol + 1, orow, ocol + 2 ) )
		return true;
	return false;
}

Board.prototype.eliminate = function( group ) {
	var oc = group[0].color;
	for( var g in group ) {
		group[g].element.removeClass( oc );
		group[g].color = 'white';
	}
	return true;
}

Board.prototype.findMatches = function() {
	var matches_found = false;

	// Look for across matches
	for( var r = 0; r < this.rows; r++ ) {
		var run = [ this.cells[ r ][ 0 ] ];
		for( var c = 1; c < this.cols; c++ ) {
			var cur = this.cells[ r ][ c ];
			if ( cur.color == run[0].color ) {
				run.push( cur );
			} else {
				if ( run.length > 2 ) {
					this.eliminate( run );
					this.score( run.length );
					matches_found = true;
				}
				run = [];
				run.push( cur );
			}
		}
		if ( run.length > 2 ) {
			this.eliminate( run );
			this.score( run.length );
			matches_found = true;
		}
	}

	// Look for down matches
	for( var c = 0; c < this.cols; c++ ) {
		var run = [ this.cells[ 0 ][ c ] ];
		for( var r = 1; r < this.rows; r++ ) {
			var cur = this.cells[ r ][ c ];
			if ( cur.color == run[0].color ) {
				run.push( cur );
			} else {
				if ( run.length > 2 ) {
					this.eliminate( run );
					this.score( run.length );
					matches_found = true;
				}
				run = [];
				run.push( cur );
			}
		}
		if ( run.length > 2 ) {
			this.eliminate( run );
			this.score( run.length );
			matches_found = true;
		}
	}

	if ( matches_found )
		this.compress();
	else
		this.in_compression = false;
}

Board.prototype.score = function( cells ) {
	this.options.scoreCallback( cells );
}

Board.prototype.compressColumn = function( col, point ) {
	for( var r = point; r > 0; r-- ) {
		var c1 = this.cells[ r ][ col ];
		var c2 = this.cells[ r - 1 ][ col ];
		c1.element.removeClass( c1.color );
		c1.color = c2.color;
		c1.element.addClass( c1.color );
	}

	var c1 = this.cells[ 0 ][ col ];
	c1.element.removeClass( c1.color );
	c1.color = this.colors[ Math.floor( Math.random() * this.colors.length ) ];
	c1.element.addClass( c1.color );
}

Board.prototype.compress = function() {
	this.in_compression = true;

	var found_compress = false;
	for( var c = 0; c < this.cols; c++ ) {
		var found = null;
		for( var r = this.rows - 1; r >= 0; r-- ) {
			if ( this.cells[ r ][ c ].color == 'white' ) {
				found = r;
			}
		}
		if ( found != null ) {
			this.compressColumn( c, found );
			found_compress = true;
		}
	}

	var self = this;
	if ( found_compress ) {
		window.setTimeout( function() { self.compress() }, 100 );
	} else {
		window.setTimeout( function() { self.findMatches() }, 0 );
	}
}

angular.module('diamondApp')
	.controller('MainCtrl', function ($scope) {
		$scope.total = 0;
		$scope.board = new Board( $('#board'), {
			scoreCallback: function( cells ) {
				$scope.$apply( function() {
					$scope.total += cells;
				} );
			}
		} );
		$scope.compress = function() {
			$scope.board.compress();
		}
	});
