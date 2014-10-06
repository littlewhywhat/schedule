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
		var s = Snap(svgId);
		var height = s.node.offsetHeight;
		var width = s.node.offsetWidth;
		var rect = s.rect(0,0,width,height);		
		var circle = s.circle(10,10,10);
		circle.attr({fill: 'red'});
		circle.drag();
	}
}