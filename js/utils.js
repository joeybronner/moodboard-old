function searchUser(e) {
    if (e.keyCode == 13) {
    	document.getElementById('canvas').innerHTML = '<rect id="background-rect" x="0%" y="0%" width="100%" height="100%" fill="#F5F5F5"/>';
        doload(document.getElementById("fixed-header-drawer-exp").value)
        return false;
    }
}

function changeSection(section) {
	document.getElementById('myboard').className = document.getElementById('myboard').className.replace(' is-active', '');
	document.getElementById('friends').className = document.getElementById('friends').className.replace(' is-active', '');
	document.getElementById('random').className = document.getElementById('random').className.replace(' is-active', '');
	document.getElementById('customize').className = document.getElementById('customize').className.replace(' is-active', '');	

	document.getElementById(section).className += ' is-active';

	document.getElementById('left-panel').className = document.getElementById('left-panel').className.replace(' is-visible', '');
}


