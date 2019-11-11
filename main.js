// paper.install(window);
var tool;
window.onload = function() {
    paper.setup('canvas');

    $(canvas).on('linePoint', function(e) {
	console.log(e.detail)
    })
}

