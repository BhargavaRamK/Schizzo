// paper.install(window);
var tool;
window.onload = function() {
    var canvas = document.querySelector('canvas');
    canvas.style.width ='100%';
    canvas.style.height='100%';

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    paper.setup('canvas');
    // Create a simple drawing tool:

    tool = new Tool();

    var brush = new Sharpie(paper.project)
    tool.onMouseDown = brush.onMouseDown;
    tool.onMouseUp = brush.onMouseUp;
    tool.onMouseDrag = brush.onMouseDrag;
}

