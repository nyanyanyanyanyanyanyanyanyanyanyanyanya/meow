/*
 __   __  __   ____   _____   ___   ______   ___   __   __  _____ 
|  | |  ||  | |    \ |     | /   \ |      | /   \ |  |_|  ||     |
|  | |  ||  | |  _  ||   __||  _  ||_    _||  _  ||       ||  ___|
|  |_|  ||  | | | | ||  |__ | | | |  |  |  | | | ||       || |___ 
|       ||  | | |_| ||   __|| |_| |  |  |  | |_| || || || ||  ___|
 |     | |  | |     ||  |__ |     |  |  |  |     || ||_|| || |___ 
  |___|  |__| |____/ |_____| \___/   |__|   \___/ |_|   |_||_____|


a micro narrative engine by freya campbell
comments or thanks to @spdrcstl or communistsister.itch.io
do not ask me for features

*/

//#region regex
const lookForChara = /(\w*)(?:!\ -\ )/;

const lookForCLEAR = /CLEARSCREEN/;
const lookForCLEARSTATUS = /CLEARSTATUS/;

const lookForBG = /BG_\w*/;
const lookForFG = /FG_\w*/;

const lookForMUS = /MUS_\w*/;
const lookForSFX = /SFX_\w*/;
const lookForMusVol = /(?:MUSVOL):\[([^:]*)\]/;
const lookForSFXVol = /(?:SFXVOL):\[([^:]*)\]/;

const lookForChoices = /(?:CHOICE)(\w*):\[([^:]*)\]:(\w*)/g;
const lookForSubChoices = /(?:CHOICE)(\w*):\[([^:]*)\]:(\w*)/;
const lookForRemoves = /(?:REMOVE):(\w*)/g;
const lookForSubRemoves = /(?:REMOVE):(\w*)/;

const lookForSet = /(?:SET):(\w*):(\w*)/g;
const lookForSubSet = /(?:SET):(\w*):(\w*)/;

const lookForCheck = /(?:CHECK):(\w*):(\w*):(\w*):(\w*):(\w*)/;
const lookForGoto = /(?:GOTO):(\w*)/;

const lookForMode = /(?:MODE):(\w*)/;

const lookForStatus = /(?:STATUS):\[(.*)\]\]/;

const lookForFunction = /(?:FUNC):\[(.*)\]\]/;

const lookForAuto = /(?:AUTO):(\w*):(\w*)/;

const lookForTrim = /(?<=\ \-\ ).*/;
//#endreigon

//#region variables
// --- chapters
var chapters = {}; // object that holds each chapter, with each chapter being an array of lines
var curChapter; // current chapter name to access in the object

var chapterArray = null; // current chapter array
var current = 0; // current line in chapter array

var currentBG = null;
var currentFG = null;
var currentMode = null;

var goto = null; // holds new chapter names to change at end of progression

var choiceStatus = false; // checks if a choice is present

var cameFromCheck = false;

// --- loading
const cache = {}; // holds imgs
var inLoadingScreen = true;
var gameLoaded = false;

// these grab how many of each we need
var bgsToLoad = 0;
var fgsToLoad = 0;
var soundsToLoad = 0;
var storiesToLoad = 1; // future proofing for multiple story files maybe

// if the above (except stories) are over 0, that's a group
var groupsToLoad = 0;
var groupsLoaded = 0;

var storiesLoaded = 0;
var bgsLoaded = 0;
var fgsLoaded = 0;
var soundsLoaded = 0;

// ... animation
var loadingAnimInterval;
var loadingDots = 1;

// --- inputs
var inputCooldown = false;

// --- tags
var background; // which bg element is set with mode

var clearText = false;

// autoplay
var autoplay = false;
var autoplayTimer = null;

var currentLineLength;

// sounds
var currentSFX;
var gameplayVolumeSFX = 1;
var currentMUS;
var gameplayVolumeMus = 1;

//auto progression
var autoprogressionOn = false;
var autoprogressionLeft = 0;
var autoprogressionInterval;

// --- variables
var GAMEVARS = {};

const commands = {
	"gt": (a, b) => a > b,
	"lt": (a, b) => a < b,
	"eq": (a, b) => a == b,
	"gte": (a, b) => a >= b,
	"lte": (a, b) => a <= b
};

// --- saving
var SETTINGS = {};

// --- menus
var inMenu = false;
var wasAutoplay; // to resume autoplay on menu close
//#endregion

//#region setup
async function getFile(fileURL) {
	let fileContent = await fetch(fileURL);
	fileContent = await fileContent.text();
	return fileContent;
};

function readyStory() {
	// get the story from story.txt and turn it into array
	parseStory();
	
	makeMusicPlayers();
	cacheBGs();
	cacheFGs();

    // loading screen
    document.getElementById("loadingprogress").innerHTML = CONFIG.loadingSplashMessage + ".";

    loadingAnimation(); // run once to play first "frame"
    loadingAnimInterval = setInterval(loadingAnimation, CONFIG.loadingAnimationSpeed);

    document.getElementById("loadingscreen").onclick = function() {
        removeLoadingScreen();
    };

	// make dialogue lines
	createDialogueLines();

	// set resizing
	setScreen();
	window.onresize = setScreen;

	// defaults
	mode(CONFIG.startingMode);
	curentMode = CONFIG.startingMode;
	curChapter = CONFIG.startingChapter;

	// set backgrounds
	document.getElementById(background).style.backgroundImage = "url('" + BGs[DEFAULT.defaultBG] + "')";
	currentBG = DEFAULT.defaultBG;
	document.getElementById('fg1').src = FGs[DEFAULT.blankFG];
	currentFG = DEFAULT.blankFG;

    // keys and clicks
	document.addEventListener('keydown', logKey);
	document.getElementById('dial').onclick = function() {
		if (!autoprogressionOn) nextLine();
	};

    // button clicks
	document.getElementById('autoplay').addEventListener("click", (event) => {
		toggleAutoplay();
		event.stopPropagation();
	});
	document.getElementById('historybutton').addEventListener("click", (event) => {
		toggleMenu(document.getElementById('messagecontainer'), document.getElementById('historybutton'))
		event.stopPropagation();
	});
	document.getElementById('settingsbutton').addEventListener("click", (event) => {
		toggleMenu(document.getElementById('settings-menu'), document.getElementById('settingsbutton'))
		event.stopPropagation();
	});
	document.getElementById('savesbutton').addEventListener("click", (event) => {
		toggleMenu(document.getElementById('save-menu'), document.getElementById('savesbutton'))
		event.stopPropagation();
	});
	document.getElementById('resetbutton').addEventListener("click", (event) => {
		resetGame();
		event.stopPropagation();
	});

    // settings
    setSettings();
    document.getElementById('settingsMusicVolume').addEventListener('input', function() {
        saveSettings();
    });
    document.getElementById('settingsSFXVolume').addEventListener('input', function() {
        saveSettings();
    });
    document.getElementById('settingsAutoplaySpeed').addEventListener('input', function() {
        saveSettings();
    });

    // save load menu
    document.getElementById('savegame').addEventListener('click', function() {
        toggleMenu(document.getElementById('save-menu'), document.getElementById('savesbutton'))
        save();
    });
    document.getElementById('loadgame').addEventListener('click', function() {
        toggleMenu(document.getElementById('save-menu'), document.getElementById('savesbutton'))
        load();
    });

	// ready!
	console.log('action!');
};

function parseStory() {
	console.log('getting file');
    loadingLine("Loading story", "story");
    
	// Passing file url 
	getFile('story.txt').then(content => {
        let storyArray = {};    

		storyArray = content.trim().split("###");
        if (CONFIG.debugLogs) console.groupCollapsed("retrieved file");
		if (CONFIG.debugLogs) console.info(storyArray);

		for (i = 0; i < storyArray.length; i++) {
			let target = storyArray[i];
			storyArray[i] = target.trim().split("\n");

		};

		if (CONFIG.debugLogs) console.info("split file:");
		if (CONFIG.debugLogs) console.info(storyArray);

		for (i = 0; i < storyArray.length; i++) {
			nextchapter = storyArray[i];
			chaptertitle = nextchapter[0].replace(/[\n\r\s]/g, '');
			chaptercontent = nextchapter;
			chapters[chaptertitle] = chaptercontent;
		};
        if (CONFIG.debugLogs) console.groupEnd();

		storyLoaded();

	}).catch(error => {
		console.log(error);
        console.error("Unable to load story.txt file. Videotome must run on a local server or be uploaded to a website to function. Check README.txt for more information.");
	});

    if (CONFIG.debugLogs) console.info("chapter object:");
	if (CONFIG.debugLogs) console.info(chapters);
};

function setScreen() {
	let screen = document.getElementById('container');

	screen.style.marginTop = (window.innerHeight - screen.offsetHeight) / 2 + "px";
	screen.style.marginLeft = (window.innerWidth - screen.offsetWidth) / 2 + "px";

    if (window.innerWidth > screen.offsetWidth) {
        document.getElementById('container').classList.add("wide");
    } else {
        document.getElementById('container').classList.remove("wide");
    }
}

function createDialogueLines() {
	for (i = 0; i < CONFIG.dialogueLineAmount; i++) {
		let message = "&nbsp";
		if (i == 0) {
			message = CONFIG.startingMessage;
		}

		let item = document.createElement("DIV");

		item.classList.add("dialog");
		item.innerHTML = '<div class="dialogue-speaker"></div><div class="dialogue-text">'  + message + '</div>';
		
		document.getElementById('dial').appendChild(item);
	}
}

function logKey(e) {
    if (inLoadingScreen) {
        removeLoadingScreen();
        return;
    }

    if (e.keyCode == 72) {
        // h, history
		toggleMenu(document.getElementById('messagecontainer'), document.getElementById('historybutton'))
    } else if (e.keyCode == 83) {
        // s, settings
		toggleMenu(document.getElementById('settings-menu'), document.getElementById('settingsbutton'))
	} else if (e.keyCode == 76) {
        // l, load/save
		toggleMenu(document.getElementById('save-menu'), document.getElementById('savesbutton'))
	} else if (e.keyCode == 65) {
        // a, auto
		toggleAutoplay();
	} else if (e.keyCode == 32 || e.keyCode == 13) {
        // space or enter, next line
		if (!autoprogressionOn) nextLine();
	} else {
        // choice numbers
        let target = e.keyCode - 49;
        
        let listClick = document.getElementById('choicelist').childNodes[target]; // choice to click
        if (listClick !== undefined) {
            listClick.onclick();
        } else {
            if (CONFIG.debugLogs) console.warn("key does not equal a current choice number, skipping");
        }
	};

};

//#endregion


//#region loading
function loadingLine(string, id) {
    if(id != "story") groupsToLoad++; // stories are not part of the loading groups since they're all done before sounds and audio
		
	let loadingscreen = document.getElementById("loadingscreen");

	let item = document.createElement("SPAN");
	item.setAttribute("id", "loadingline-" + id)
	item.classList.add("toload");
	item.innerHTML = string;

	loadingscreen.appendChild(item);
	loadingscreen.appendChild(document.createElement("BR"));
}

function storyLoaded() {
    storiesLoaded++;

    if (storiesLoaded == storiesToLoad) loadedText("story", "Story loaded");
}
function bgLoaded() {
    bgsLoaded++;

    if (bgsLoaded == bgsToLoad) loadedText("bgs", "BGs loaded");
}
function fgLoaded() {
    fgsLoaded++;

    if (fgsLoaded == fgsToLoad) loadedText("fgs", "FGs loaded");
}
function soundLoaded() {
    soundsLoaded++;

    if (soundsLoaded == soundsToLoad) loadedText("sounds", "Sounds loaded");
}

function loadedText(id, text) {
	document.getElementById("loadingline-" + id).classList.remove("toload");
	document.getElementById("loadingline-" + id).innerHTML = text;

    if(id != "story") groupsLoaded++; // story is not part of the loading groups since it's done before sounds and audio

	checkIfFinishedLoading();
}

function checkIfFinishedLoading() {
    if (groupsLoaded == groupsToLoad && storiesLoaded == storiesToLoad) {
        // everything's ready!
		gameLoaded = true;
        clearInterval(loadingAnimInterval);

        // fake ux  buffer, we can actually enter the game from this point without needing to wait
        setTimeout(() => {
            if (document.getElementById("loadingprogress")) {
                document.getElementById("loadingprogress").innerHTML = CONFIG.loadingDoneMessage;
                document.getElementById("loadingscreen").innerHTML += "<br>";
                document.getElementById("loadingscreen").innerHTML += CONFIG.loadingPrompt;
            }
        }, CONFIG.loadingBuffer);
    }
}

function loadingAnimation() {
    let string = CONFIG.loadingSplashMessage;
    for (let i = 0; i < loadingDots; i++) {
        string = string + ".";
    }
    
    document.getElementById("loadingprogress").innerHTML = string;
      
    loadingDots++;
    if (loadingDots > 3) loadingDots = 1;
}

function removeLoadingScreen() {
    if (gameLoaded) {
        inLoadingScreen = false;
        if (document.getElementById("loadingscreen")) document.getElementById("loadingscreen").remove();
    }
}
//#endregion

//#region asset creation
function cacheBGs() {
    bgsToLoad = Object.keys(BGs).length;

    if (bgsToLoad > 0) {
		if (CONFIG.debugLogs) console.groupCollapsed("bgs found");
		loadingLine("Loading BGs", "bgs");
    }
	
	for (let [key, value] of Object.entries(BGs)) {

        if (CONFIG.debugLogs) console.log(`${key}: ${value}`);
		var newimage = document.createElement("img");
		newimage.setAttribute("id", key);
		newimage.setAttribute("src", value);
		newimage.setAttribute("hidden", 1);
		cache[key] = newimage;

        // check when it's loaded
        if (newimage.complete) {
            bgLoaded();
        } else {
            newimage.addEventListener('load', bgLoaded);
        }
	};
    if (CONFIG.debugLogs) console.groupEnd();

	console.log('bg images loaded');
	if (CONFIG.debugLogs) console.info(cache);

};

function cacheFGs() {
    fgsToLoad = Object.keys(FGs).length;

    if (fgsToLoad > 0) {
		if (CONFIG.debugLogs) console.groupCollapsed("fgs found");
		loadingLine("Loading FGs", "fgs");
    }
	
	for (let [key, value] of Object.entries(FGs)) {

        if (CONFIG.debugLogs) console.log(`${key}: ${value}`);
		var newimage = document.createElement("img");
		newimage.setAttribute("id", key);
		newimage.setAttribute("src", value);
		newimage.setAttribute("hidden", 1);
		cache[key] = newimage;

        // check when it's loaded
        if (newimage.complete) {
            fgLoaded();
        } else {
            newimage.addEventListener('load', fgLoaded);
        }
	};
    if (CONFIG.debugLogs) console.groupEnd();

	console.log('fg images loaded');
	if (CONFIG.debugLogs) console.info(cache);

};

function makeMusicPlayers() {
    soundsToLoad = Object.keys(MUSIC).length;

    if (soundsToLoad > 0) {
        if (CONFIG.debugLogs) console.groupCollapsed("sounds found");
        loadingLine("Loading sounds", "sounds");
    }

	for (let [key, value] of Object.entries(MUSIC)) {

        if (CONFIG.debugLogs) console.log(`${key}: ${value}`);
		var newplayer = document.createElement("AUDIO");
		newplayer.setAttribute("id", key);
		newplayer.setAttribute("src", value);
		newplayer.setAttribute("preload", "auto");
		if (key.indexOf('MUS') >= 0) {
			newplayer.setAttribute("loop", 1);
		}
		document.body.appendChild(newplayer);

        // check if loaded
        newplayer.addEventListener("canplaythrough", (event) => {
            soundLoaded();
        });
	};
    if (CONFIG.debugLogs) console.groupEnd();
	console.log('music loaded');

};
//#endregion

//#region progression
function nextLine() {
    if (autoprogressionOn) {
        progress();
        return;
    }
	if (inputCooldown) return;

	setTimeout(() => {
		inputCooldown = false
	}, DEFAULT.cooldownLength);

	inputCooldown = true;

	progress();
}

function progress() {
    if (!inMenu || autoprogressionOn) {

		chapterArray = chapters[curChapter];

		if (chapterArray == undefined) {
			console.error("error: next chapter was not found. check story.txt for incorrect spellings")
			return;
		}
	
		if (current != chapterArray.length - 1) {
			current++;
			var str = chapterArray[current];
			if(CONFIG.debugLogs) console.log("next line: " + str);
			updateDialog(str);
		} else {
			console.warn("tried to progress but this block has ended");
		};
	} else {
        console.log("not progressing: currently in menu");
        return;
    }
};

function updateDialog(str) {
	let speaker = '';
	let speakerColour = DEFAULT.speakerColour;

    // JS FUNCTION TAG
	if (lookForFunction.test(str) == true) {
		let matchedCode = str.match(lookForFunction);
		console.log(matchedCode);
		var functionCall = new Function(matchedCode[1]);
		functionCall();
	};

	// MODE TAG
	if (lookForMode.test(str) == true) {
		let matchedMode = str.match(lookForMode);
		mode(matchedMode[1]);
	}

    // STATUS TAG
	if (lookForStatus.test(str) == true) {
		let matchedStatus = str.match(lookForStatus);
		let text = matchedStatus[1];
		if(CONFIG.debugLogs) console.info("status text is" + text);
		displayStatus(text);
	}

	if (lookForCLEARSTATUS.test(str) == true) {
		document.getElementById('statuswindow').innerHTML = null;
		document.getElementById('statuswindow').classList.add('hidden');
	}

	// SET TAG
	if (lookForSet.test(str) == true) {
		let matchedSet = str.match(lookForSet);

		for (i = 0; i < matchedSet.length; i++) {
			let toset = matchedSet[i];
			let target = toset.match(lookForSubSet)[1];
			let value = toset.match(lookForSubSet)[2];
			GAMEVARS[target] = value;
			if(CONFIG.debugLogs) console.info(GAMEVARS);
		};
	};

	// CHECK TAG
	if (lookForCheck.test(str) == true) {
		document.getElementById('choicewindow').classList.toggle('hidden');

		let check = str;
		let [, var1, var2, op, out1, out2] = check.match(lookForCheck)

		if (GAMEVARS[var1]) {
			var1 = GAMEVARS[var1];
		};
		if (GAMEVARS[var2]) {
			var2 = GAMEVARS[var2];
		};

		let operator = commands[op];
		let result = operator(var1, var2);

		if (result) {
			goto = out1;
		} else {
			goto = out2;
		};
	};

	// REMOVE CHOICE TAG
	if (lookForRemoves.test(str) == true) {

		let matchedRemoves = str.match(lookForRemoves);
		if(CONFIG.debugLogs) console.info("choices to remove: " + matchedRemoves);

		for (i = 0; i < matchedRemoves.length; i++) {
			let str = matchedRemoves[i];
			let text = str.match(lookForSubRemoves)[1];

			removeChoices(text);
		};

	};

	// BG IMAGE TAG
	if (lookForBG.test(str) == true) {
		let curBG = str.match(lookForBG);
		let BGtarget = "url('" + BGs[curBG] + "')";
		currentBG = curBG;
		document.getElementById(background).style.backgroundImage = BGtarget;
	};

	// FG IMAGE TAG
	if (lookForFG.test(str) == true) {
		let curFG = str.match(lookForFG);
		let FGtarget = FGs[curFG];
		currentFG = curFG;
		document.getElementById('fg1').src = FGtarget;
	};
	
    // VOL TAGS
    if (lookForSFXVol.test(str) == true) {
        gameplayVolumeSFX = str.match(lookForSFXVol)[1];
        if (gameplayVolumeSFX < 0) {
            console.warn("MUSVOL warning: Volume cannot be lower than 0")
            gameplayVolumeSFX = 0;
        }
        if (gameplayVolumeSFX > 1) {
            console.warn("MUSVOL warning: Volume cannot be higher than 1")
            gameplayVolumeSFX = 1;
        }
        if(currentSFX != null) currentSFX.volume = SETTINGS.sfxVol * gameplayVolumeSFX;
    };
    if (lookForMusVol.test(str) == true) {
        gameplayVolumeMus = str.match(lookForMusVol)[1];
        console.log(gameplayVolumeMus);
        if (gameplayVolumeMus < 0) {
            console.warn("MUSVOL warning: Volume cannot be lower than 0")
            gameplayVolumeMus = 0;
        }
        if (gameplayVolumeMus > 1) {
            console.warn("MUSVOL warning: Volume cannot be higher than 1")
            gameplayVolumeMus = 1;
        }
        if(currentMUS != null) currentMUS.volume = SETTINGS.musVol * gameplayVolumeMus;
    };

	// MUSIC TAG
	if (lookForMUS.test(str) == true) {
		let curMUS = str.match(lookForMUS);
		let track = curMUS[0];
		musicPlayer(track);
	};

	// SFX TAG
	if (lookForSFX.test(str) == true) {
		let curSFX = str.match(lookForSFX);
		let track = curSFX[0];
		sfxPlayer(track);
	};

	// AUTO TAG
    if (lookForAuto.test(str) == true) {
		if (autoprogressionOn) {
			console.warn("AUTO already running, skipping");
		} else {
			autoprogressionOn = true;
			autoprogressionLeft = str.match(lookForAuto)[1];
		
			autoprogressionInterval = setInterval(autoprogressLoop, str.match(lookForAuto)[2]);
			
			if (autoplay) {
				//pause autoplay
				wasAutoplay = true;
				toggleAutoplay();
			}
		}
    };

	// CHOICE TAG
	if (lookForChoices.test(str) == true) {
		let matchedChoices = str.match(lookForChoices);
		if(CONFIG.debugLogs) console.info("choices: " + matchedChoices);

		for (i = 0; i < matchedChoices.length; i++) {
			let str = matchedChoices[i];
			let id = str.match(lookForSubChoices)[1];
			let text = str.match(lookForSubChoices)[2];
			let destination = str.match(lookForSubChoices)[3];
            
			updateChoices(id, text, destination);
			if(CONFIG.debugLogs) console.info("id: " + id + ", text: " + text + ", destination: " + destination);
		};
        
		let choiceClasslist = document.getElementById('choicewindow');
		if (choiceClasslist.classList.contains('hidden')) {
			choiceClasslist.classList.remove('hidden');
		};
	};

	// CLEAR TAG
	if (lookForCLEAR.test(str) == true) {
		clearText = true;
	} else {
		clearText = false;
	};

	// CHARACTER SPEAKING TAG
    let curChara = str.match(lookForChara);
	if (curChara) {
        // backport from heartbreak
        // make sure you put the matching names in the assets list :)
        let chara = SPEAKERS[curChara[1]];
        if (chara) {
            speaker = chara.name;
            if (chara.colour) speakerColour = chara.colour;
        } else {
			console.warn("warning: character tag not recognised. check it's set up correctly in assets.js")
		}
	};

	// GOTO TAG
	if (lookForGoto.test(str) == true) {
		let gototarget = str.match(lookForGoto);
		goto = gototarget[1];
		document.getElementById('choicewindow').classList.toggle('hidden');
	};

	// TRIM COMMANDS FROM STRING
	if (lookForTrim.test(str) == true) {
		str = str.match(lookForTrim);
	};

    // grab line length for autoplay
    currentLineLength = str.toString().length;

	// UPDATE DIALOG BOXES
	if (speaker != "") str = DEFAULT.speechmarkLeft + str + DEFAULT.speechmarkRight;
	
	let item = document.createElement("DIV");
	item.classList.add("dialog");
	item.innerHTML = '<div class="dialogue-speaker" style="color:' + speakerColour + '">' + speaker + '</div><div class="dialogue-text">'  + str + '</div>';

	let dialogueBox = document.getElementById('dial');

	if (clearText) {
		// nuke and remake everything
		dialogueBox.innerHTML = "";
		createDialogueLines();
	} 
	dialogueBox.children[0].remove(); // delete the top line
	dialogueBox.appendChild(item);
	
	// history log
	logMessage(speaker, speakerColour, str);
	lastMessage = [speaker, speakerColour, str];

    // trigger autoplay again
    if (autoplay) {
        autoplayTimer = setTimeout(progress, calcAutoSpeed());
    }

	// next line sound
	sfxPlayer(DEFAULT.progressSFX);

	// go to next chapter
	if (goto != null) {
		let chaptertarget = goto;
		goto = null;
		cameFromCheck = true;
		changeChapter(chaptertarget);
	}
};

function changeChapter(target) {
	curChapter = target;
	current = 0;

	let list = document.getElementById('choicelist');
	while (list.firstChild) {
		list.removeChild(list.firstChild);
	};

	if (!cameFromCheck) {
		progress();
	} else {
		cameFromCheck = false;
	};

	document.getElementById('choicewindow').classList.add('hidden');
};
//#endregion

//region tag functions
function displayStatus(text) {
	string = text;
	document.getElementById('statuswindow').innerHTML = text;
	document.getElementById('statuswindow').classList.remove('hidden');
}

function updateChoices(id, text, destination) {

	choiceStatus = true;
	let list = document.getElementById('choicelist');

	let item = document.createElement("LI");
	item.setAttribute('id', id);
	item.innerHTML = "<a href='#' class='choiceListItem'>" + text + "</a>";

	item.onclick = function() {
		changeChapter(destination);
		choiceStatus = false;
	};

	list.appendChild(item);
};

function removeChoices(text) {
	document.getElementById(text).remove();
	if(CONFIG.debugLogs) console.info("removed choice: " + text);   

	let choicelist = document.getElementById('choicelist');
	if (choicelist.childNodes.length < 1) {
		let choicewindow = document.getElementById('choicewindow');
		choicewindow.classList.add('hidden');
		choiceStatus = false;
	};
};

function mode(target) {
	// pick between different story modes
	// standard is bordered bgs and text box
	// fullBG sets the bgs to be the fullscreen instead and remove the bg box border
	// borderless removes all borders
	// borderlessfullBG is both at once
	
	let screen = document.getElementById('container');
	let BGcontainer = document.getElementById('bg1');
	let dialogue = document.getElementById('dial');

	if (target == "standard") {

		// remove hidden from bg and text box
		background = "bg1";
		screen.classList.remove('fullBG');
		screen.classList.add('standard')
		screen.style.backgroundImage = null;
		BGcontainer.classList.remove('hidden');
		dialogue.classList.remove('transparent');
		currentMode = "standard";

	} else if (target == "fullBG") {

		background = "container";
		BGcontainer.classList.add('hidden');
		BGcontainer.style.backgroundImage = "url('images/blank.png')";
		screen.classList.add('fullBG');
		currentMode = "fullBG";

	} else if (target == "borderless") {

		background = "bg1";
		BGcontainer.classList.add('hidden');
		dialogue.classList.add('transparent');
		currentMode = "borderless";

	} else if (target == "borderlessfullBG") {

		background = "container";
		BGcontainer.classList.add('hidden');
		BGcontainer.style.backgroundImage = "url('images/blank.png')";
		dialogue.classList.add('transparent');
		screen.classList.add('fullBG');
		currentMode = "borderlessfullBG";

	};

	if(CONFIG.debugLogs) console.info("mode:" + target);

};

function musicPlayer(track) {

	let sounds = document.getElementsByTagName('audio');
	for (i = 0; i < sounds.length; i++) sounds[i].pause();

	track = document.getElementById(track);
	if (!track) {
		console.warn("warning: sound not found. make sure it's included in assets.js, with the same label in story.txt")
		return;
	}
    track.volume = SETTINGS.musVol * gameplayVolumeMus;
	track.play();

	currentMUS = track.id;
};

function sfxPlayer(track) {

	track = document.getElementById(track);
	if (!track) {
		console.warn("warning: sound not found. make sure it's included in assets.js, with the same label in story.txt")
		return;
	}
	track.currentTime = 0;
    track.volume = SETTINGS.sfxVol * gameplayVolumeSFX;
	track.play();

	currentSFX = track;
	// console.log('playing sfx');

};

function autoprogressLoop() {
    document.getElementById("dial").style.cursor = "not-allowed";
    progress();

    autoprogressionLeft--;
    if (autoprogressionLeft == 0) {
		console.log("zero");
        window.clearInterval(autoprogressionInterval);
        autoprogressionOn = false;
        document.getElementById("dial").style.cursor = "auto";

        if (wasAutoplay) {
            //resume autoplay
            wasAutoplay = false;
            toggleAutoplay();
        }
    }
}
//#endregion

//#region history
function logMessage(speaker, speakerColour, text) {
	if (speaker == null) {
		speaker = ""
	} else {
		speaker = ('<span style="color:' + speakerColour + '">' + speaker + '</span>');
	};

	let NewMessage = speaker.concat(" ", text);
	let ul = document.getElementById("messagelog");
	let li = document.createElement("li");
	li.innerHTML = NewMessage;
	ul.appendChild(li);

	ul.scrollIntoView(false);

	let messagecount = ul.childElementCount;

	if (messagecount >= DEFAULT.messagelogMax) {
		ul.removeChild(ul.children[0]);
	};
};
//#endregion

//#region menus
function menuClear() {
	let menus = document.getElementById("menus").children;
	for (var i = 0; i < menus.length; i++) {
		menus[i].classList.add("hidden");
	}

	// there is a better way to do this. thog don't caare
    document.getElementById('historybutton').classList.remove('open-menu');
    document.getElementById('settingsbutton').classList.remove('open-menu');
    document.getElementById('savesbutton').classList.remove('open-menu');
}


function toggleMenu(menu, button) {
	if (autoprogressionOn) return;

    // clicking to activate
    if (menu.classList.contains("hidden")) {
        menuClear();
        menu.classList.remove("hidden");
        button.classList.add("open-menu");

		inMenu = true;
		if (autoplay) {
			//pause autoplay
			wasAutoplay = true;
			toggleAutoplay();
		}
    } else // clicking to hide
    {
        menuClear();

		inMenu = false;
		if (wasAutoplay) {
			//resume autoplay
			wasAutoplay = false;
			toggleAutoplay();
		}
    }
}
//#endregion

//#region autoplay
function toggleAutoplay() {
	if (inMenu) return;

    clearTimeout(autoplayTimer);
    if (autoplay == false) {
        autoplay = true;
        autoplayTimer = setTimeout(progress, calcAutoSpeed());

		document.getElementById("autoplay").classList.add("open-menu");
    } else {
        autoplay = false;
        if (wasAutoplay) return;
	document.getElementById("autoplay").classList.remove("open-menu");
    };
}

function calcAutoSpeed() {
    // invert the setting speed because full bar = go faster for ux reasons
    let settingSpeed = invertAutoSpeed(SETTINGS.autoSpeed);

    // clamp the line length
    if (currentLineLength > DEFAULT.autoplayMaxLineLength) currentLineLength = DEFAULT.autoplayMaxLineLength;
    if (currentLineLength < DEFAULT.autoplayMinLineLength) currentLineLength = DEFAULT.autoplayMinLineLength;

    // convert the line length to a multiplication range, this is so it scales with both the set player speed AND the amount of characters
    // ie, we're assuming that someone on slowest speed does not read more words as fast as the top speed 
    let speedMult = ((currentLineLength - DEFAULT.autoplayMinLineLength) * (DEFAULT.autoplayMaxMult - DEFAULT.autoplayBaseMult)) / (DEFAULT.autoplayMaxLineLength - DEFAULT.autoplayMinLineLength) + DEFAULT.autoplayBaseMult; 

    if(CONFIG.debugLogs) console.info("autospeed: " + settingSpeed * speedMult);
    return settingSpeed * speedMult;
}

function invertAutoSpeed(value) {
    return (120 + 40) - value;
}
//#endregion

//#region settings
function saveSettings() {
    SETTINGS.musVol = document.getElementById("settingsMusicVolume").value;
    SETTINGS.sfxVol = document.getElementById("settingsSFXVolume").value;
    SETTINGS.autoSpeed = document.getElementById("settingsAutoplaySpeed").value;

    localStorage.setObject("settings", SETTINGS);

    if (currentSFX != null) {
        currentSFX.volume = SETTINGS.sfxVol * gameplayVolumeSFX;
    }
    if (currentMUS != null) {
        currentMUS.volume = SETTINGS.musVol * gameplayVolumeMus;
    }
}
function setSettings() {
    if (localStorage.getObject("settings")) {
        SETTINGS = localStorage.getObject("settings");
    } else {
        // defaults
        SETTINGS.musVol = 0.7;
        SETTINGS.sfxVol = 0.7;
        SETTINGS.autoSpeed = 70;
    }
    document.getElementById("settingsMusicVolume").value = SETTINGS.musVol;
    document.getElementById("settingsSFXVolume").value = SETTINGS.sfxVol;
    document.getElementById("settingsAutoplaySpeed").value = SETTINGS.autoSpeed;

    if (currentSFX != null) {
        currentSFX.volume = SETTINGS.sfxVol * gameplayVolumeSFX;
    }
    if (currentMUS != null) {
        currentMUS.volume = SETTINGS.musVol * gameplayVolumeMus;
    }

    saveSettings();
}
//#endregion

function resetGame() {
    window.location.href = window.location.href;
}

// saving extensions 
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}
/* 

attributions:
CRT effect based on code from http://aleclownes.com/2017/02/01/crt-display.html
click sound: https://freesound.org/people/EminYILDIRIM/sounds/536108/


*/