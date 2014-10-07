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
		var drawer = new Drawer(svgId);
		var schedule = new Schedule();
		drawer.draw(schedule);
		getCourseJSONs().forEach(function(json) {
			var course = new Course(schedule, json);
			var params = schedule.add(course);
			drawer.draw(course, params);
		});
	}

	function getCourseJSONs() {
		return [new CourseJSON(3), 
				new CourseJSON(2)];
	}
}

function Drawer(svgId) {
	var snap = Snap(svgId);
	var colors = new ColorFactory();
	this.draw = function(element, params) {
		element.draw(this, snap, colors, params);
	}
}

function Schedule() {
	var MONTHNAMES = ['oct','nov','dec','jan', 'feb', 'mar', 'apr', 'may'];
	var instance = this;
	this.months = {};
	function initMonths() {
		MONTHNAMES.forEach(function(name) {
			instance.months[name] = new Month(name);
		});
	}
	this.add = function(course) {
		return instance.months[course.json.month].add(course);
	}

	this.draw = function(drawer, snap) {
		var $element = $(snap.node);
		var height = $element.height();
		var width = $element.width()/MONTHNAMES.length;
		var x = 0;
		var y = 0;
		MONTHNAMES.forEach(function(name) {
			var month = instance.months[name];
			drawer.draw(month, { 
				x: x, 
				y: y, 
				width: width, 
				height: height
			});
			x += width;
		});
	}
	this.find = function(x, y) {
		for(var i = 0; i < MONTHNAMES.length; i++) {
			var month = instance.months[MONTHNAMES[i]];
			if (month.isIn(x,y))
				return month;
		};
	}
	initMonths();
}

function Month(name) {
	var snapElement;
	var MARGIN = 10;
	var lowerBound = MARGIN;
	var middleX;
	var queue = [];
	var courses = {};
	this.add = function(course) {
		var params;
		if (queue.length === 0) {
			params = {
				x: middleX,
				y: lowerBound + course.COURSERADIUS,
			}
			lowerBound += course.COURSERADIUS * 2 + MARGIN;
		} else {
			params = queue.shift();
		}
		courses[course.json.id] = params;
		return params;
	}
	this.remove = function(course) {
		queue.push(courses[course.json.id]);
		
	}
	this.draw = function(drawer, snap, colors, params) {
		var x = params.x;
		var y = params.y;
		var width = params.width;
		var height = params.height;
		
		middleX = x + width/2;
		snapElement = snap.rect(x, y, width, height);
		snapElement.attr({fill: colors.get()});
		var text = snap.text(x + width/5, height/2, name.toUpperCase());
		text.attr({
			fontSize: 40,
			fontFamily: 'Comic Sans MS',
			fill: 'white' 
		});
	}

	this.isIn = function(x,y) {
		return Snap.path.isPointInsideBBox(snapElement.getBBox(), x, y);
	}
}

function Course(schedule, json) {
	this.COURSERADIUS = 50;
	this.json = json;
	var instance = this;
	var snapElement;
	var month = schedule.months[json.month];
	var drawer = drawer;
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
			month.remove(instance);
			snapElement.remove();
			var newMonth = schedule.find(event.x, event.y);
			drawer.draw(instance, newMonth.add(instance));
			month = newMonth;
		});
	}

	this.draw = function(draw, snap, colors, params) {
		var x = params.x;
		var y = params.y;
		drawer = draw;
		snapElement = snap.circle(x, y, instance.COURSERADIUS);
		snapElement.attr({
			fill: colors.get(),
			stroke: '#000',
		});
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