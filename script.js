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
		getCourseJSONs(function(jsons) {
			jsons.forEach(function(json) {
				var course = new Course(schedule, json);
				var params = schedule.add(course);
				drawer.draw(course, params);
			});
			$('#panel').click(function() {
				save(jsons);
			});
		});
	}
	function save(jsons) {
		$('#panel').html(JSON.stringify(jsons));
	}

	function getCourseJSONs(callback) {
		$.getJSON( 'courses.json', function(data) {
			callback(data);
		});
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
	var MONTHNAMES = ['oct1','oct2','oct3','oct4',
					  'nov1','nov2','nov3','nov4',
					  'dec1','dec2','dec3','dec4',
					  'jan1','jan2','jan3','jan4'];
	this.months = {};
	var months = this.months;
	function initMonths() {
		MONTHNAMES.forEach(function(name) {
			months[name] = new Month(name);
		});
	}
	this.add = function(course) {
		return months[course.json.month].add(course);
	}

	this.draw = function(drawer, snap) {
		var $element = $(snap.node);
		var height = $element.height();
		var width = $element.width()/MONTHNAMES.length;
		var x = 0;
		var y = 0;
		MONTHNAMES.forEach(function(name) {
			var month = months[name];
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
			var month = months[MONTHNAMES[i]];
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
	this.name = name;
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
		snapElement.attr({
			fill: colors.get(),
			stroke: 'black'
		});
		var text = snap.text(x + width/10, height/2, name.toUpperCase());
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
	var snapText;
	var snapWeekText;
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
			snapText.attr({
				transform: matrix.toTransformString()
			});
			snapWeekText.attr({
				transform: matrix.toTransformString()
			});
		}, function() {
			localMatrix = snapElement.transform().localMatrix;
		}, function(event) {
			month.remove(instance);
			snapElement.remove();
			snapText.remove();
			snapWeekText.remove();
			var newMonth = schedule.find(event.x, event.y);
			drawer.draw(instance, newMonth.add(instance));
			month = newMonth;
			json.month = month.name;
		});
	}

	this.draw = function(draw, snap, colors, params) {
		var x = params.x;
		var y = params.y;
		drawer = draw;
		snapElement = snap.circle(x, y, instance.COURSERADIUS);
		snapElement.attr({
			fill: json.color,
			stroke: '#000',
		});
		snapText = snap.text(x - instance.COURSERADIUS + 1, y , json.name);
		snapText.attr({
			fontSize: 25,
			fontFamily: 'Comic Sans MS',
			fill: 'white' 
		});
		snapWeekText = snap.text(x - instance.COURSERADIUS + 15, y + 25, json.week);
		snapWeekText.attr({
			fontSize: 25,
			fontFamily: 'Comic Sans MS',
			fill: 'white' 
		});

		snapElement.after(snapText);
		drag();
	}

}

function ColorFactory() {
	var colors = ['#f6b26b','#ffd966','#d9d9d9', 
	'#6fa8dc', '#a4c2f4', '#f4cccc', '#b6d7a8', '#6aa84f']
	var index2 = -1;
	var index = 0;
	function nextIndex() {
		index2++;
		if (index2 === 4) { 
			index += 1;
			if (index === colors.length + 1)
				index = 0;
			index2 = 0;
		}
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