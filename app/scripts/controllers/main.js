'use strict';

/*global $:false */
/*global Gameboard:false */
/*global DiamondGame:false */
/*global HTMLDriver:false */
/*global Cell:false */
/*global Bomb:false */

function MyHTMLDriver( host ) {
	MyHTMLDriver.prototype.constructor();
	this.host = host;
	this.cellWidth = 40;
	this.cellHeight = 40;
	this.gutter = 5;
}
MyHTMLDriver.prototype = new HTMLDriver();
MyHTMLDriver.prototype.constructor = HTMLDriver;
/*jshint unused:false */
MyHTMLDriver.prototype.onCellAdded = function( cell ) {
	var left = cell.column * ( this.cellWidth + this.gutter );
	var top = cell.row * ( this.cellHeight + this.gutter );
	var self = this;
	var newElement = $('<div>',{
		style:'position:absolute;width:25px;height:25px;left:'+left+'px;top:0px;',
		click: function( event ) {
			self.onClick( cell );
		}
	});
	cell.renderInto( newElement );
	cell.element = newElement;
	this.host.append( newElement );
	$(newElement).animate({top:'+='+top},200);
};
MyHTMLDriver.prototype.onClick = function( cell ) {
	this.game.clickCell( cell );
};
MyHTMLDriver.prototype.onCellMoved = function( cell, from ) {
	var oleft = from.column * ( this.cellWidth + this.gutter );
	var left = cell.column * ( this.cellWidth + this.gutter );
	var otop = from.row * ( this.cellHeight + this.gutter );
	var top = cell.row * ( this.cellHeight + this.gutter );
	var topMove = '+='+(top-otop);
	var leftMove = '+='+(left-oleft);
	$(cell.element).animate({top:topMove,left:leftMove},200);
};
MyHTMLDriver.prototype.onCellRemoved = function( cell ) {
	if ( cell.element ) {
		$(cell.element).remove();
		cell.element = null;
	}
};

function MyCell( color ) {
	this.color = color;
	this.row = null;
	this.column = null;
	this.element = null;
}
MyCell.prototype = new Cell( null );
MyCell.prototype.constructor = Cell;
MyCell.prototype.iconMap = {heart:'heart',chevy:'chevron-circle-up',tictac:'th',square:'square',star:'star'};
MyCell.prototype.renderInto = function( element ) {
	$(element).append('<div class="diamond game-'+this.color+'"><i class="fa fa-'+this.iconMap[this.color]+'"></i></div>');
};

function MyBomb( color ) {
	this.radius = 4;
	this.row = null;
	this.column = null;
	this.element = null;
}
MyBomb.prototype = new Bomb( null );
MyBomb.prototype.constructor = Bomb;
MyBomb.prototype.renderInto = function( element ) {
	$(element).append('<div class="diamond game-bomb"><i class="fa fa-flash"></i></div>');
};

function MyFactory( game ) {
	this.started = false;
	this.colors = [ 'heart', 'chevy', 'tictac', 'square', 'star' ];
}
MyFactory.prototype.build = function( row, column ) {
	if ( this.started && Math.random() < 0.01 ) {
		return new MyBomb();
	}
	return new MyCell( this.colors[Math.floor(Math.random()*this.colors.length)] );
};

angular.module('diamondApp')
	.controller('MainCtrl', function ($scope) {
		$scope.total = 0;
		$scope.factory = new MyFactory();
		$scope.game = new DiamondGame( new Gameboard(12,8), $scope.factory, {
			htmlDriver: new MyHTMLDriver( $('#board') ),
			initialCollapse: true,
			on: {
				gameStarted: function() {
					$scope.factory.started = true;
				},
				score: function( count ) {
					$scope.total += count;
				}
			}
		} );
		$scope.game.start();
		window.setInterval( function() {
			$scope.game.servicePending();
			$scope.$digest();
		}, 50 );
	});
