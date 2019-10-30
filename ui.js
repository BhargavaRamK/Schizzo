var menuActions = {
    'save as json' : function(){
	console.log('save as JSON');
	console.log(paper.project.exportJSON().length);
	var svg = new Blob([ paper.project.exportJSON() ], {type: 'application/json'});
	saveAs(svg, 'image.json')
    },
};

// ----------------------------------------
// the lookup key is a letter + binary mask 
// letter ctrlKey, metaKey, shiftKey
var keyBindings = {
    's100' : 'save',
    'z100' : 'undo',
    'Z100' : 'redo',        
}; 

var setUpDocumentKeyListener = function(){
    document.addEventListener("keydown", e => {
	if (e.key.match(/^[a-z0-9]{1,1}$/i)) {
	    var k = e.key + [ e.ctrlKey, e.metaKey, e.shiftKey ].map(e => { return e ? 1 : 0 }).join('')
	    if(keyBindings[k] && menuActions[keyBindings[k]]) {
		try {
		    menuActions[keyBindings[k]]();
		} catch(e) {
		    console.log('key : ' + k);
		    console.log('binding: ' + keyBindings[k]);
		    console.log(e)
		}
	    } else {
		
	    }
	}
    });
}

var setUpDocumentMenuListener = function(){
    $('a').on('click', function(e){
	console.log('click');
	var v = $(e.target).html().toLowerCase();
	console.log('executing command ' + v);
	if (menuActions[v]) {
	    try {
		console.log('found command ' + v);
		menuActions[v]();
	    } catch(e) {
		console.log(`command  ${v} failed`);
		console.log(e)
	    }
	} else {
	    console.log( `item ${v} is not connected to an action` )
	}
    })
}

$(function(){
    // paper.setup('canvas');

    setUpDocumentKeyListener();
    setUpDocumentMenuListener();
})
