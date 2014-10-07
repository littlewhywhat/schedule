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
		var course = new Course(3);
		schedule.add(course);
		course = new Course(2);
		schedule.add(course);
	}
}

function Schedule() {
	var $element;
	var snap;
	var MONTHNAMES = ['oct','nov','dec','jan', 'feb', 'mar', 'apr', 'may'];
	var months = {};
	var colors = new ColorFactory();
	function drawMonths() {
		var monthHeight = $element.height();
		var monthWidth = $element.width()/MONTHNAMES.length;
		var monthX = 0;
		MONTHNAMES.forEach(function(monthName) {
			var month = months[monthName]
			month.draw(monthX, 0, monthWidth, monthHeight, 
				colors.get(), monthName);
			monthX += monthWidth;
		});
		console.log(months);
	}
	function initMonths() {
		MONTHNAMES.forEach(function(monthName) {
			months[monthName] = new Month(snap, colors);
		});
	}
	this.init = function(svgId) {
		$element = $(svgId);
		snap = Snap(svgId);
		initMonths();
		drawMonths();
	}
	this.add = function(course) {
		months[course.month].add(course);
	}
}

function Month(snap, colors) {
	var snapRect;
	var margin = 10;
	var lowerBound = margin;
	var courseRadius = 50;
	var middleX;
	var courses = {};
	this.draw = function(x, y, width, height, color, text) {
		middleX = x + width/2;
		snapRect = snap.rect(x, y, width, height);
		snapRect.attr({fill: color});
		var text = snap.text(x + width/5, height/2, text.toUpperCase());
		text.attr({
			fontSize: 40,
			fontFamily: 'Comic Sans MS',
			fill: 'white' 
		});
	}
	this.add = function(course) {
		courses[course.id] = snap.circle(middleX, lowerBound + courseRadius, courseRadius);
		lowerBound += courseRadius * 2 + margin;
		var ix = courses[course.id].transform().localMatrix.e;
		var iy = courses[course.id].transform().localMatrix.f;
		courses[course.id].drag(function(x,y) {
			var matrix = new Snap.Matrix();
			console.log(matrix);
			matrix.translate(ix + x,iy + y);
			courses[course.id].attr({
				transform: matrix.toTransformString()
			});
			console.log(matrix.toTransformString());

		}, function() {}, function(event) {
			console.log(event);
			Snap.selectAll('rect').forEach(function(element) {
				if (Snap.path.isPointInsideBBox(element.getBBox(), event.x, event.y))
					console.log(element.node);
			});
			ix = courses[course.id].transform().localMatrix.e;
			iy = courses[course.id].transform().localMatrix.f;
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

function Course(id) {
	this.id = id;
	this.month = 'jan';
}