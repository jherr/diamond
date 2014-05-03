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

    expect(colorsInGridAsString(dg.gameboard.allRows())).toEqual([ 'TZT+++TZTZ', 'ZTZZTZZTZT', 'TZTTZTTZTZ', 'ZTZZTZZTZT', 'TZTATATZTZ', 'ZTZT!TZTZT', 'TZTZTZTZTZ', 'ZTZTZTZTZT', 'TZTZTZTZTZ', 'ZTZTZTZTZT' ]);
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
