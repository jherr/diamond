'use strict';

describe('Finders', function () {
  it('should be able to find simple sequences', function () {
    var rcf = new RowColFinder();

    var gb = GameboardBuilder(['RTZ',
                               'AZT',
                               'ATZ',
                               'AZT',
                               'RTZ']);
    var found = rcf.find(gb);
    expect(colorsInGrid(found)).toEqual([['A','A','A']]);

    gb = GameboardBuilder(['RAAAR',
                           'TZTZT',
                           'ZTZTZ']);
    found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([['A','A','A']]);

    gb = GameboardBuilder(['RAAAA',
                           'TZTZT',
                           'ZTZTZ']);
    found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([['A','A','A','A']]);

    gb = GameboardBuilder(['AAAAR',
                           'TZTZT',
                           'ZTZTZ']);
    found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([['A','A','A','A']]);

    gb = GameboardBuilder(['AAAAR',
                           'TBBBT',
                           'ZTCCC']);
    found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([['A','A','A','A'],['B','B','B'],['C','C','C']]);

    gb = GameboardBuilder(['RAAAR',
                           'TBABT',
                           'ZTACC']);
    found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([['A','A','A'],['A','A','A']]);

    gb = GameboardBuilder(['ZTZTZTZTZT', 'TZTZTZTZTZ', 'ZTZTZTZTZT', 'TZTZTZTZTZ', 'ZTZATAZTZT', 'TZTZ!ZTZTZ', 'ZTZTZTZTZT', 'TZTZTZTZTZ', 'ZTZTZTZTZT', 'TZTZTZTZTZ']);
    gb.swap( gb.get( 4, 4 ), gb.get( 5, 4 ) );
    found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([]);
  });

  it('should be able to find sequences with wildcards', function () {
    var rcf = new RowColFinder();

    var gb = GameboardBuilder(['RA*AR']);
    var found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([['A',null,'A']]);

    gb = GameboardBuilder(['RAA*R']);
    found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([['A','A',null]]);

    gb = GameboardBuilder(['R*AAR']);
    found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([[null,'A','A']]);

    gb = GameboardBuilder(['R*AAR',
                           'T*ZFT',
                           'RAFZR']);
    found = rcf.find( gb );
    expect(colorsInGrid(found)).toEqual([[null,'A','A'],[null,null,'A']]);
  });

  it('should be able to find sequences and remove sequences', function () {
    var rcf = new RowColFinder();

    var gb = GameboardBuilder(['R*AAR',
                               'T*ZFT',
                               'RAFZR']);

    var found = rcf.find( gb );

    expect(colorsInGrid(found)).toEqual([[null,'A','A'],[null,null,'A']]);

    gb.removeGroups( found );

    expect(colorsInGrid(gb.allRows())).toEqual([['R',null,null,null,'R'],['T',null,'Z','F','T'],['R',null,'F','Z','R']]);
  });

  it('should be able to find sequences and remove sequences', function () {
    var rcf = new RowColFinder();

    var gb = GameboardBuilder(['TZTZR',
                               'TAAAT',
                               'RAFZR']);

    var found = rcf.find( gb );

    expect(colorsInGrid(found)).toEqual([['A','A','A']]);

    gb.removeGroups( found );

    expect(colorsInGrid(gb.allRows())).toEqual([['T','Z','T','Z','R'],['T',null,null,null,'T'],['R','A','F','Z','R']]);

    gb.collapse();

    expect(colorsInGrid(gb.allRows())).toEqual([['T',null,null,null,'R'],['T','Z','T','Z','T'],['R','A','F','Z','R']]);
  });

  it('should be able to collapse properly', function () {
    var gb = GameboardBuilder(['TZTZT',
                               'T---T',
                               'R---R']);
    gb.collapse();
    expect(colorsInGrid(gb.allRows())).toEqual([['T',null,null,null,'T'],['T',null,null,null,'T'],['R','Z','T','Z','R']]);

    var gb = GameboardBuilder(['TZTZT',
                               '-----',
                               'R---R']);

    gb.collapse();

    expect(colorsInGrid(gb.allRows())).toEqual([[null,null,null,null,null],['T',null,null,null,'T'],['R','Z','T','Z','R']]);

    var gb = GameboardBuilder(['-ZTZT',
                               '-----',
                               'R---R']);

    gb.collapse();

    expect(colorsInGridAsString(gb.allRows())).toEqual(['-----',
                                                        '----T',
                                                        'RZTZR']);
  });

  it('should be able to fill properly', function () {
    var gb = GameboardBuilder(['-ZTZT',
                               '-----',
                               'R---R']);

    gb.collapse();

    expect(colorsInGridAsString(gb.allRows())).toEqual(['-----',
                                                        '----T',
                                                        'RZTZR']);

    var seqFaq = new TestFactoryWithRowSequence('ABC');
    gb.fill( seqFaq )

    expect(colorsInGridAsString(gb.allRows())).toEqual(['----A',
                                                        'BBBBT',
                                                        'RZTZR']);

    gb.fill( seqFaq )

    expect(colorsInGridAsString(gb.allRows())).toEqual(['AAAAA',
                                                        'BBBBT',
                                                        'RZTZR']);
  });

  it('should be able to find shapes', function () {
    var gb = GameboardBuilder(['21',
                               '12',
                               '21']);
    var shapes = [];
    gb.findShapes([[-1,0],[1,0],[0,-1]],function(shape){
      shapes.push( shape );
    });
    expect(shapes.length).toBe(1);
    expect(colors(shapes[0])).toEqual(['1','1','1']);

    shapes = [];
    gb.findShapes([[-1,0],[1,0],[0,1]],function(shape){
      shapes.push( shape );
    });
    expect(shapes.length).toBe(1);
    expect(colors(shapes[0])).toEqual(['2','2','2']);

    gb = GameboardBuilder(['21',
                           '12']);

    shapes = [];
    gb.findShapes([[-1,0],[1,0],[0,1]],function(shape){
      shapes.push( shape );
    });
    expect(shapes.length).toBe(0);
  } );

  it('should be able to find simple sequences', function () {
    var rcf = new StrictFinder();

    var gb = GameboardBuilder(['RTZ',
                               'AZT',
                               'ATZ',
                               'AZT',
                               'RTZ']);

    var found = rcf.find(gb,[{column:0,row:1},{column:0,row:2}]);
    expect(colorsInGrid(found)).toEqual([['A','A','A']]);
    found = rcf.find(gb,[{column:1,row:1},{column:1,row:2}]);
    expect(colorsInGrid(found)).toEqual([]);
    found = rcf.find(gb,[{column:0,row:0},{column:1,row:0}]);
    expect(colorsInGrid(found)).toEqual([]);

    found = rcf.find(gb,[{column:0,row:2},{column:0,row:3}]);
    expect(colorsInGrid(found)).toEqual([['A','A','A']]);
    found = rcf.find(gb,[{column:0,row:3},{column:0,row:2}]);
    expect(colorsInGrid(found)).toEqual([['A','A','A']]);
    found = rcf.find(gb,[{column:0,row:1},{column:1,row:1}]);
    expect(colorsInGrid(found)).toEqual([['A','A','A']]);
    found = rcf.find(gb,[{column:0,row:2},{column:1,row:2}]);
    expect(colorsInGrid(found)).toEqual([['A','A','A']]);
    found = rcf.find(gb,[{column:0,row:3},{column:1,row:3}]);
    expect(colorsInGrid(found)).toEqual([['A','A','A']]);
  } );

  it('should be able to find simple sequences with anys', function () {
    var rcf = new StrictFinder();

    var gb = GameboardBuilder(['RTZ',
                               'AZT',
                               '*TZ',
                               'AZT',
                               'RTZ']);

    var found = rcf.find(gb,[{column:0,row:1},{column:0,row:2}]);
    expect(colorsInGrid(found)).toEqual([['A',null,'A']]);
    found = rcf.find(gb,[{column:1,row:1},{column:1,row:2}]);
    expect(colorsInGrid(found)).toEqual([]);
    found = rcf.find(gb,[{column:0,row:0},{column:1,row:0}]);
    expect(colorsInGrid(found)).toEqual([]);

    found = rcf.find(gb,[{column:0,row:2},{column:0,row:3}]);
    expect(colorsInGrid(found)).toEqual([['A',null,'A']]);
    found = rcf.find(gb,[{column:0,row:3},{column:0,row:2}]);
    expect(colorsInGrid(found)).toEqual([['A',null,'A']]);
    found = rcf.find(gb,[{column:0,row:1},{column:1,row:1}]);
    expect(colorsInGrid(found)).toEqual([['A',null,'A']]);
    found = rcf.find(gb,[{column:0,row:3},{column:1,row:3}]);
    expect(colorsInGrid(found)).toEqual([['A',null,'A']]);
  } );
});
