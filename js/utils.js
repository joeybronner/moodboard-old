function searchUser(e) {
    if (e.keyCode == 13) {
    	document.getElementById('canvas').innerHTML = '<rect id="background-rect" x="0%" y="0%" width="100%" height="100%" fill="#F5F5F5"/>';
        doload(document.getElementById("fixed-header-drawer-exp").value)
        return false;
    }
}

function changeSection(section) {
	var sections = ['myboard', 'friends', 'random', 'customize'];
	for (var s in sections) {
	  document.getElementById(sections[s]).className = document.getElementById(sections[s]).className.replace(' is-active', '');
	}
	// Show requested view
	document.getElementById(section).className += ' is-active';

	switch(section) {
	    case 'myboard':
	        // TODO: Call good function
	        break;
	    case 'friends':
	        // TODO: Call good function
	        break;
	    case 'random':
	    	// TODO: Call good function
	    	break;
	    case 'customize':
	    	loadApparencePanel();
	    	break;
	}

	// Hide left panel
	document.getElementById('left-panel').className = document.getElementById('left-panel').className.replace(' is-visible', '');
}

function loadApparencePanel() {
	var userData = getJSONFile(user);
	document.getElementById('backgroundcolor').value = userData.apparences[0].backgroundcolor;

	console.log(db);
}

function getJSONFile(user) {
	var d;
    $.ajax({
        url: 'data/dataset_' + user + '.json',
        dataType: 'json',
        async: false,
        success: function(data) {
            d = data;
        }
    });
    return d;
}