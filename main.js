// paper.install(window);
var tool;
window.onload = function() {
    paper.setup('canvas');
    // Create a simple drawing tool:

    tool = new Tool();

    var brush = new Sharpie(paper.project)
    tool.onMouseDown = brush.onMouseDown;
    tool.onMouseUp = brush.onMouseUp;
    tool.onMouseDrag = brush.onMouseDrag;
}

