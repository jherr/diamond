'use strict';

describe('Game', function () {
  it('should be able to create a game', function () {
    var gb = new diamond.Gameboard(3,5);
    var builder = new TestFactoryWithGrid(['ZTZTZ',
                           		   		       'TZTZT',
                           	               'ZTZTZ']);
    var dg = new diamond.Game( gb, builder, {} );
    var calledBack = false;
    dg.on( 'initialSetupComplete', function() {
    	calledBack = true;
    });
    dg.start();

    expect(dg).not.toBe(null);
    expect(dg.gameboard).toBe(gb);
    expect(dg.cellFactory).toBe(builder);
    expect(dg.gameboard.get(0,0).color).toEqual('Z');
    expect(dg.gameboard.get(0,1).color).toEqual('T');
    expect(dg.gameboard.get(2,0).color).toEqual('Z');
    expect(calledBack).toBe(true);
  });

  it('game should be initialized properly', function () {
    var gb = new diamond.Gameboard(3,5);
    var builder = new TestFactoryWithGrid(['ZAAAZ',
                           		   		       'TZTZT',
                           	               'ZTZTZ']);

    var dg = new diamond.Game( gb, builder, {
      on: {
        initialSetupComplete: function() {
          this.cellFactory = new TestFactoryWithSequence(5,'ZT');
        }
      }
    } );
    dg.start();
    while( dg.servicePending() ) {
    }

    expect(dg.gameboard.get(0,0).color).toEqual('Z');
    expect(dg.gameboard.get(0,1).color).toEqual('T');
    expect(dg.gameboard.get(2,0).color).toEqual('Z');
  });

  it('game should be initialized properly', function () {
    var gb = new diamond.Gameboard(3,5);
    var builder = new TestFactoryWithGrid(['ZAAAZ',
                                           'TZTZT',
                                           'ZTZTZ']);

    var dg = new diamond.Game( gb, builder, {
      on: {
        initialSetupComplete: function() {
          this.cellFactory = new TestFactoryWithSequence(5,'ZT');
        }
      }
    } );
    dg.start();
    while( dg.servicePending() ) {
    }

    expect(dg.gameboard.get(0,0).color).toEqual('Z');
    expect(dg.gameboard.get(0,1).color).toEqual('T');
    expect(dg.gameboard.get(2,0).color).toEqual('Z');
  });

  it('game should handle clicks', function () {
    var gb = new diamond.Gameboard(3,5);
    var builder = new TestFactoryWithGrid(['ZATAZ',
                                           'TTATT',
                                           'ZTZTZ']);

    var gameStarted = false;
    var dg = new diamond.Game( gb, builder, {
      initialCollapse: false,
      cascadeCollapses: false,
      on: {
        initialSetupComplete: function() {
          this.cellFactory = new TestFactoryWithSequence(5,'ZT');
        },
        gameStarted: function() {
          gameStarted = true;
        }
      }
    } );
    dg.start();

    while( dg.servicePending() ) {
    }

    expect(gameStarted).toBe(true);

    expect(dg.gameboard.get(0,0).color).toEqual('Z');
    expect(dg.gameboard.get(0,1).color).toEqual('A');
    expect(dg.gameboard.get(2,0).color).toEqual('Z');

    dg.click( 0, 2 );
    dg.click( 1, 2 );

    while( dg.servicePending() ) {
    }

    expect(dg.gameboard.get(0,0).color).toEqual('Z');
    expect(dg.gameboard.get(0,1).color).toEqual('T');
    expect(dg.gameboard.get(2,0).color).toEqual('Z');
  });


  it('game should find invalid moves', function () {
    var gb = new diamond.Gameboard(3,5);
    var builder = new TestFactoryWithGrid(['ZATAZ',
                                           'TZAZT',
                                           'ZTZTZ']);

    var invalidFound = false;
    var dg = new diamond.Game( gb, builder, {
      initialCollapse: false,
      on: {
        invalidMove: function() {
          invalidFound = true;
        }
      }
    } );
    dg.start();

    invalidFound = false;
    dg.click( 1, 1 );
    dg.click( 1, 1 );
    expect(invalidFound).toEqual(true);

    invalidFound = false;
    dg.click( 1, 1 );
    dg.click( 0, 0 );
    expect(invalidFound).toEqual(true);

    invalidFound = false;
    dg.click( 1, 1 );
    dg.click( 2, 0 );
    expect(invalidFound).toEqual(true);

    invalidFound = false;
    dg.click( 1, 1 );
    dg.click( 0, 2 );
    expect(invalidFound).toEqual(true);

    invalidFound = false;
    dg.click( 1, 1 );
    dg.click( 2, 2 );
    expect(invalidFound).toEqual(true);

    invalidFound = false;
    dg.click( 2, 2 );
    dg.click( 2, 0 );
    expect(invalidFound).toEqual(true);

    invalidFound = false;
    dg.click( 2, 2 );
    dg.click( 0, 2 );
    expect(invalidFound).toEqual(true);

    invalidFound = false;
    dg.click( 0, 2 );
    dg.click( 1, 2 );
    expect(invalidFound).toEqual(false);
  });
});
