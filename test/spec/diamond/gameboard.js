'use strict';

describe('Gameboard', function () {
  it('should be able to create a gameboard', function () {
    expect(Gameboard).not.toBe(null);
    var gb = new Gameboard(5,10);
    expect(gb).not.toBe(null);
    expect(gb.get(0,0)).toBe(null);
  });

  it('should be able to set locations', function () {
    var gb = new Gameboard(5,10);

    var c1 = new Cell('red');
    gb.set(1,2,c1);
    expect(c1.row).toBe(1);
    expect(c1.column).toBe(2);

    var c = new Cell('red');
    spyOn(c, 'moveTo').andCallThrough();

    gb.set(0,0,c);
    expect(c.moveTo).toHaveBeenCalledWith(0,0);

    gb.set(2,3,c);
    expect(c.moveTo).toHaveBeenCalledWith(2,3);
    expect(c.row).toBe(2);
    expect(c.column).toBe(3);

    expect(gb.get(2,3)).toBe(c);
  });

  it('should be able to get rows', function () {
    var gb = new Gameboard(5,10);
    var c1 = new Cell('red');

    gb.set(1,2,c1);

    expect(gb.row(0).length).toBe(10);
    expect(gb.row(1)[2]).toBe(c1);
    expect(gb.row(1)[0]).toBe(null);
  });

  it('should be able to get columns', function () {
    var gb = new Gameboard(5,10);
    var c1 = new Cell('red');

    gb.set(1,2,c1);

    expect(gb.column(0).length).toBe(5);
    expect(gb.column(2)[1]).toBe(c1);
    expect(gb.column(2)[1]._id).not.toBe(null);
    expect(gb.column(1)[0]).toBe(null);
  });

  it('should be able to build test boards', function () {
    var gb = GameboardBuilder(['ABC','DEF','GHI','JKL']);
    expect(gb.rows).toBe(4);
    expect(gb.columns).toBe(3);

    expect(colors(gb.row(0))).toEqual(['A','B','C']);
    expect(colors(gb.row(1))).toEqual(['D','E','F']);
    expect(colors(gb.row(2))).toEqual(['G','H','I']);
    expect(colors(gb.row(3))).toEqual(['J','K','L']);

    expect(colorsInGrid(gb.allRows())).toEqual([['A','B','C'],['D','E','F'],['G','H','I'],['J','K','L']]);

    expect(colors(gb.column(0))).toEqual(['A','D','G','J']);
    expect(colors(gb.column(1))).toEqual(['B','E','H','K']);
    expect(colors(gb.column(2))).toEqual(['C','F','I','L']);

    expect(colorsInGrid(gb.allColumns())).toEqual([['A','D','G','J'],['B','E','H','K'],['C','F','I','L']]);

    expect(gb.get(0,0).color).toEqual('A');
    expect(gb.get(1,1).color).toEqual('E');
    expect(gb.get(1,2).color).toEqual('F');
  });

  it('should be able to build test boards', function () {
    var gb = GameboardBuilder(['ABC','DEF','GHI','JKL']);
    expect(colorsInGrid(gb.allRows())).toEqual([['A','B','C'],['D','E','F'],['G','H','I'],['J','K','L']]);
    gb.set(0,1,null);
    expect(colorsInGrid(gb.allRows())).toEqual([['A',null,'C'],['D','E','F'],['G','H','I'],['J','K','L']]);
    gb.set(2,0,null);
    expect(colorsInGrid(gb.allRows())).toEqual([['A',null,'C'],['D','E','F'],[null,'H','I'],['J','K','L']]);
  });
});
