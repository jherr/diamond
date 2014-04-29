'use strict';

function RowColFinder( cutoff ) {
	this.cutoff = cutoff || 3;
}

RowColFinder.prototype.find = function( board ) {
	var out = [];

	var found = this.findSequences( board.allRows() );
	for( var f in found ) { out.push( found[f] ); }

	var found = this.findSequences( board.allColumns() );
	for( var f in found ) { out.push( found[f] ); }

	return out;
}

RowColFinder.prototype.findSequences = function( rows ) {
	var out = [];

	if ( this.debug ) {
		dumpRows( rows );
	}

	for( var r in rows ) {
		var row = rows[r];
		var seq = [];
		var nonWild = null;

		for( var i in row ) {
			var cell = row[ i ];
			if ( cell == null ) {
				if ( seq.length >= this.cutoff ) {
					out.push( seq );
				}
				seq = [];
				nonWild = null;
			} else {
				if ( cell.isWildcard() ) {
					seq.push( cell );
				} else {
					if ( nonWild == null ) {
						nonWild = cell;
					}
					if( nonWild.match( cell ) ) {
						seq.push( cell );
					} else {
						if ( seq.length >= this.cutoff ) {
							out.push( seq );
						}
						var last = seq[ seq.length - 1 ];
						seq = last.isWildcard() ? [ last, cell ] : [ cell ];
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
}
