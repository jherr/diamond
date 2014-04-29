'use strict';

describe('DiamondGame', function () {
  it('click, click, boom', function () {
    var gb = new Gameboard(10,10);
    var builder = new TestFactoryWithGrid([
      'TZTZTZTZTZ',
      'ZTZTZTZTZT',
      'TZTZTZTZTZ',
      'ZTZATAZTZT',
      'TZTZ!ZTZTZ',
      'ZTZTZTZTZT',
      'TZTZTZTZTZ',
      'ZTZTZTZTZT',
      'TZTZTZTZTZ',
      'ZTZTZTZTZT'
    ]);

    var gameStarted = false;
    var dg = new DiamondGame( gb, builder, {
      initialCollapse: false,
      cascadeCollapses: false,
      on: {
        initialSetupComplete: function() {
          this.cellFactory = new TestFactoryWithSequence(1,'+');
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

    dg.click( 4, 4 );
    dg.click( 5, 4 );

    while( dg.servicePending() ) {
    }

    expect(colorsInGridAsString(dg.gameboard.allRows())).toEqual(['T+++++++TZ', 'ZZ+++++ZZT', 'TT+++++TTZ', 'ZZ+++++ZZT', 'TT+++++TTZ', 'ZZTZ+ZTZZT', 'TZZT+TZZTZ', 'ZTTZTZTTZT', 'TZTZZZTZTZ', 'ZTZTZTZTZT']);
  });

  it('click, click, boom, boom', function () {
    var gb = new Gameboard(10,10);
    var builder = new TestFactoryWithGrid([
      'TZTZTZTZTZ',
      'ZTZTZTZTZT',
      'TZTZTZ!ZTZ',
      'ZTZATAZTZT',
      'TZTZ!ZTZTZ',
      'ZTZTZTZTZT',
      'TZTZTZTZTZ',
      'ZTZTZTZTZT',
      'TZTZTZTZTZ',
      'ZTZTZTZTZT'
    ]);

    var gameStarted = false;
    var dg = new DiamondGame( gb, builder, {
      initialCollapse: false,
      cascadeCollapses: false,
      on: {
        initialSetupComplete: function() {
          this.cellFactory = new TestFactoryWithSequence(1,'+');
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

    dg.click( 4, 4 );
    dg.click( 5, 4 );

    while( dg.servicePending() ) {
    }

    expect(colorsInGridAsString(dg.gameboard.allRows())).toEqual(['T+++++++++', 'ZZ+++++++Z', 'TT+++++++T', 'ZZ+++++++T', 'TT+++++++Z', 'ZZT+++++ZT', 'TZZZ+++ZTZ', 'ZTTT+++TZT', 'TZTZ+ZTZTZ', 'ZTZTZTZTZT']);
  });

  it('click, click, boom, boom, booms', function () {
    var gb = new Gameboard(10,10);
    var builder = new TestFactoryWithGrid([
      'TZTZTZTZ!Z',
      'ZT!TZTZTZT',
      'TZTZTZ!ZTZ',
      'ZTZATAZTZT',
      'TZTZ!ZTZTZ',
      'Z!ZTZTZTZT',
      'TZTZTZT!TZ',
      'ZT!TZTZTZT',
      'TZTZTZTZTZ',
      'ZTZTZT!TZT'
    ]);

    var gameStarted = false;
    var dg = new DiamondGame( gb, builder, {
      initialCollapse: false,
      cascadeCollapses: false,
      on: {
        initialSetupComplete: function() {
          this.cellFactory = new TestFactoryWithSequence(1,'+');
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

    dg.click( 4, 4 );
    dg.click( 5, 4 );

    while( dg.servicePending() ) {
    }

    expect(colorsInGridAsString(dg.gameboard.allRows())).toEqual(['++++++++++', '++++++++++', '++++++++++', '++++++++++', '++++++++++', '++++++++++', '++++++++++', '++++++++++', '++++++++++', '+++++++++T']);
  });

  it('click, click, color boom', function () {
    var gb = new Gameboard(10,10);
    var builder = new TestFactoryWithGrid([
      'TZTZTZTZTZ',
      'ZTZTZTZTZT',
      'TZTZTZTZTZ',
      'ZTZTZTZTZT',
      'TZTZtZTZTZ',
      'ZTZTZTZTZT',
      'TZTZTZTZTZ',
      'ZTZTZTZTZT',
      'TZTZTZTZTZ',
      'ZTZTZTZTZT'
    ]);

    var gameStarted = false;
    var dg = new DiamondGame( gb, builder, {
      initialCollapse: false,
      cascadeCollapses: false,
      on: {
        initialSetupComplete: function() {
          this.cellFactory = new TestFactoryWithSequence(1,'+');
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

    dg.click( 4, 4 );
    dg.click( 5, 4 );

    while( dg.servicePending() ) {
    }

    expect(colorsInGridAsString(dg.gameboard.allRows())).toEqual([ '++++++++++', '++++++++++', '++++++++++', '++++++++++', '++++++++++', 'ZZZ+++ZZZZ', 'ZZZZZZZZZZ', 'ZZZZZZZZZZ', 'ZZZZZZZZZZ', 'ZZZZZZZZZZ' ]);
  });
});
