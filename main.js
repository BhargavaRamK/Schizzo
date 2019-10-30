paper.install(window);

window.onload = function() {
    var canvas = document.querySelector('canvas');
    canvas.style.width ='100%';
    canvas.style.height='100%';

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    paper.setup('canvas');
    // Create a simple drawing tool:

    var tool = new Tool();

    var brush = new InkBrush(paper.project)
    tool.onMouseDown = brush.onMouseDown;
    tool.onMouseUp = brush.onMouseUp;
    tool.onMouseDrag = brush.onMouseDrag;

    $('.fa-paint-brush').on('click', function(e) {
	var brush = new InkBrush(paper.project)
	tool.onMouseDown = brush.onMouseDown;
	tool.onMouseUp = brush.onMouseUp;
	tool.onMouseDrag = brush.onMouseDrag;
    })
    $('.fa-pencil').on('click', function(e) {
	var brush = new Sharpie(paper.project)
	tool.onMouseDown = brush.onMouseDown;
	tool.onMouseUp = brush.onMouseUp;
	tool.onMouseDrag = brush.onMouseDrag;
    })
    $('.fa-eraser').on('click', function(e) {
	var brush = new Eraser(paper.project)
	tool.onMouseDown = brush.onMouseDown;
	tool.onMouseUp = brush.onMouseUp;
	tool.onMouseDrag = brush.onMouseDrag;
    })

}

