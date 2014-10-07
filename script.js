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
		var json = new CourseJSON(3);
		schedule.add(json);
		json = new CourseJSON(2);
		schedule.add(json);
	}
}

function Schedule() {
	var $element;
	var snap;
	var MONTHNAMES = ['oct','nov','dec','jan', 'feb', 'mar', 'apr', 'may'];
	var months = {};
	var colors = new ColorFactory();
	function drawMonths() {
		var height = $element.height();
		var width = $element.width()/MONTHNAMES.length;
		var x = 0;
		var y = 0;
		MONTHNAMES.forEach(function(name) {
			var month = months[name]
			month.draw(x, y, width, height);
			x += width;
		});
	}
	function initMonths() {
		MONTHNAMES.forEach(function(name) {
			months[name] = new Month(snap, colors, name);
		});
	}
	this.init = function(svgId) {
		$element = $(svgId);
		snap = Snap(svgId);
		initMonths();
		drawMonths();
	}
	this.add = function(courseJSON) {
		months[courseJSON.month].add(new Course(snap, colors, courseJSON));
	}
}

function Month(snap, colors, name) {
	var snapRect;
	var MARGIN = 10;
	var lowerBound = MARGIN;
	var middleX;
	var courses = {};
	this.draw = function(x, y, width, height) {
		middleX = x + width/2;
		snapRect = snap.rect(x, y, width, height);
		snapRect.attr({fill: colors.get()});
		var text = snap.text(x + width/5, height/2, name.toUpperCase());
		text.attr({
			fontSize: 40,
			fontFamily: 'Comic Sans MS',
			fill: 'white' 
		});
	}
	this.add = function(course) {
		course.draw(middleX, lowerBound + course.COURSERADIUS);
		courses[course.json.id] = course;
		lowerBound += course.COURSERADIUS * 2 + MARGIN;	
	}
}

function Course(snap, colors, json) {
	this.COURSERADIUS = 50;
	this.json = json;
	var instance = this;
	var snapElement;
	var drag = function() {
		var localMatrix;
		snapElement.drag(function(shiftX,shiftY) {
			var matrix = new Snap.matrix();
			matrix.translate(
				localMatrix.e + shiftX, 
				localMatrix.f + shiftY
			);
			snapElement.attr({
				transform: matrix.toTransformString()
			});
		}, function() {
			localMatrix = snapElement.transform().localMatrix;
		}, function(event) {
			findRect(event.x, event.y);
		});
	}

	var findRect = function(x,y) {
		Snap.selectAll('rect').forEach(function(element) {
				if (Snap.path.isPointInsideBBox(element.getBBox(), x, y))
					console.log(element.node);
			});
	}

	this.draw = function(x, y) {
		snapElement = snap.circle(x, y, instance.COURSERADIUS);
		snapElement.attr({fill: colors.get()});
		drag();
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

function CourseJSON(id) {
	this.id = id;
	this.month = 'jan';
}