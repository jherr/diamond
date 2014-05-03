'use strict';

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
