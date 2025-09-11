function save() {

	let saveGame = {};
	saveGame.GAMEVARS = GAMEVARS;
	saveGame.curChapter = curChapter;
	saveGame.currentPosition = current; // should really rename current to be a clearer var name
	saveGame.currentDial = document.getElementById("dial").innerHTML;
	saveGame.status = document.getElementById('statuswindow').innerHTML;
	saveGame.choiceStatus = choiceStatus;
	saveGame.choices = {};
	saveGame.mode = currentMode;
	saveGame.BG = currentBG;
	saveGame.FG = currentFG;
	if (currentMUS != null) {
		saveGame.MUS = currentMUS;
	} else {
		saveGame.MUS = null;
	}
	if (saveGame.choiceStatus == true) {
		let choiceList = document.getElementsByClassName("choiceListItem");
		for (i = 0; i < choiceList.length; i++) {	
			saveGame.choices[i] = {};
			saveGame.choices[i].id = choiceList[i].id;
			saveGame.choices[i].content = choiceList[i].innerHTML;
			saveGame.choices[i].destination = choiceList[i].dataset.destination;
			console.log(saveGame.choices[i].destination);
		}
	}
	let saveName = "ADVsave" + CONFIG.Name;
	if (localStorage.getItem(saveName) === null) {
  		localStorage.setItem(saveName, JSON.stringify(saveGame));
	} else {
		if (confirm("Overwrite save?") == true) {
  			localStorage.setItem(saveName, JSON.stringify(saveGame));
		} else {
  			// idk something
  		}
  	}

  	console.log(saveGame);
};

function load() {

	/// hrrrrngh look. it works

	console.log("loadin");

	let saveName = "ADVsave" + CONFIG.Name;
	if (localStorage.getItem(saveName) === null ) {
		alert("No save game found </3");
		return;
	} else {
		let saveGame = JSON.parse(localStorage.getItem(saveName));
		console.log(saveGame);

		Object.assign(GAMEVARS, saveGame.GAMEVARS);

		curChapter = saveGame.curChapter;
		chapterArray = chapters[curChapter];
		current = saveGame.currentPosition; // should really rename current to be a clearer var name
		mode(saveGame.mode);

		if (saveGame.status != null && saveGame.status != "") {
			document.getElementById('statuswindow').innerHTML = saveGame.status;
			document.getElementById('statuswindow').classList.remove('hidden');
		} else {
			document.getElementById('statuswindow').innerHTML = null;
			document.getElementById('statuswindow').classList.add('hidden');
		}

		document.getElementById("dial").innerHTML = saveGame.currentDial;

		if (saveGame.MUS != null) musicPlayer(saveGame.MUS);
		
		if (typeof saveGame.BG == "string") {
			document.getElementById(background).style.backgroundImage = "url('" + BGs[saveGame.BG] + "')";	
		} else if (typeof saveGame.BG == "object") {
			document.getElementById(background).style.backgroundImage = "url('" + BGs[saveGame.BG[0]] + "')";
		}
		
		if (typeof saveGame.FG == "string") {
			document.getElementById('fg1').src = FGs[saveGame.FG]; // upsets me that these are irregular
		} else if (typeof saveGame.FG == "object") {
			document.getElementById('fg1').src = FGs[saveGame.FG[0]]; // upsets me that these are irregular
		}

		if (choiceStatus == true) {
			choicewindow.classList.add('hidden');
			let list = document.getElementById('choicelist');
    		while (list.firstChild) {
            	list.removeChild(list.firstChild);
        	}
		}
		if (saveGame.choiceStatus == true) {
			choiceStatus = true;
			choicewindow.classList.remove('hidden');
			for (const [key, value] of Object.entries(saveGame.choices)) {
				let list = document.getElementById('choicelist');
	    		let item = document.createElement("li");
	    		item.setAttribute('id', value.id);
	    		item.setAttribute('data-destination', value.destination);
	    		item.classList.add("choiceListItem");
	    		item.innerHTML = value.content;
	    		let target = value.destination;
	    		item.onclick = function() {changeText(target, "story");};
	    		list.appendChild(item);
    		}
		}
	}
};