// 	  Copyright 2014 Roman Vayvod

//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at

//        http://www.apache.org/licenses/LICENSE-2.0

//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

$(document).ready(new Main().main);

function Main() {
	this.main = function() {
		var svgId = '#main';
		var schedule = new Schedule();
		schedule.init(svgId);
	}
}

function Schedule() {
	var $element;
	var snap;
	var months = ['oct','nov','dec','jan', 'feb', 'mar', 'apr', 'may'];
	var colors = new ColorFactory();
	function drawMonths() {
		var monthHeight = $element.height();
		var monthWidth = $element.width()/months.length;
		var monthX = 0;
		months.forEach(function(monthName) {
			console.log(monthName);
			var month = new Month();
			month.init(snap);
			month.draw(monthX, 0, monthWidth, monthHeight, colors.get(), monthName);
			monthX += monthWidth;
		});
	}

	this.init = function(svgId) {
		$element = $(svgId);
		snap = Snap(svgId);
		drawMonths();
	}
}

function Month() {
	var snap;
	function setSnap(value) {
		snap = value;
	}

	this.init = function(snap) {
		setSnap(snap);
	}

	this.draw = function(x, y, width, height, color, text) {
		var rect = snap.rect(x, y, width, height);
		rect.attr({fill: color});
		var text = snap.text(x + width/5, height/2, text.toUpperCase());
		text.attr({
			fontSize: 40,
			fontFamily: 'Comic Sans MS',
			fill: 'white' 
		});
	}
}

function ColorFactory() {
	var colors = ['#f6b26b','#ffd966','#d9d9d9', 
	'#6fa8dc', '#a4c2f4', '#f4cccc', '#b6d7a8', '#6aa84f']
	var index = -1;
	function nextIndex() {
		index += 1;
		if (index === colors.length)
			index = 0;
	}

	this.get = function() {
		nextIndex();
		return colors[index];
	}


}