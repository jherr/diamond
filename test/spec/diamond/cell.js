'use strict';

describe('Cell', function () {
  it('should be able to create a cell', function () {
    expect(diamond.Cell).not.toBe(null);
    var c = new diamond.Cell('red');
    expect(c).not.toBe(null);
    expect(c.color).toBe('red');
    expect(c.element).toBe(null);
  });

  it('should be able to move a cell', function () {
    var c = new diamond.Cell('red');
    c.moveTo( 2, 5 );
    expect(c.row).toBe(2);
    expect(c.column).toBe(5);
  });

  it('should be able to match cells', function () {
    var c1 = new diamond.Cell('red');
    var c2 = new diamond.Cell('red');
    var c3 = new diamond.Cell('blue');
    expect(c1.match(c2)).toBe(true);
    expect(c2.match(c1)).toBe(true);
    expect(c1.match(c3)).toBe(false);
  });

  it('should handle wildcards', function () {
    var c1 = new diamond.Cell('red');
    var c2 = new diamond.Cell(null);
    var c3 = new diamond.Cell('blue');
    expect(c1.match(c2)).toBe(true);
    expect(c2.match(c1)).toBe(true);
    expect(c1.match(c3)).toBe(false);
  });

  it('should be able to factory create cells', function () {
  	var cf = new diamond.CellFactory(['red','green','blue']);
    var c = cf.build();
    c.moveTo( 10, 20 );
    expect(c).not.toBe(null);
    expect(( c.color == 'red' || c.color == 'green' || c.color == 'blue' )).toBe(true);
    expect(c.row).toBe(10);
    expect(c.column).toBe(20);
  });
});
