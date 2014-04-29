'use strict';

function colors( rows ) {
  var out = [];
  for( var r in rows ) {
    out.push( rows[r] ? rows[r].color : null );
  }
  return out;
}

function colorsInGrid( rows ) {
  var out = [];
  for( var r in rows ) {
    out.push( colors( rows[r] ) );
  }
  return out;
}

function dumpRows( rows ) {
  for( var r in rows ) {
    console.log( colors( rows[ r ] ).join('') );
  }
}

function colorsInGridAsString( rows ) {
  var out = [];
  for( var r in rows ) {
    var cs = colors( rows[r] );
    var s = '';
    for( var c in cs ) {
      s += cs[c] ? cs[c] : '-';
    }
    out.push( s );
  }
  return out;
}

function dumpGameboard( gb ) {
  var colors = colorsInGridAsString( gb.allRows() );
  for( var c in colors ) {
    console.log( colors[ c ] );
  }
}
