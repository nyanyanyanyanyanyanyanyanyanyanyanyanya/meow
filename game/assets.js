// follow the BG_ pattern when naming backgrounds
// though the filename itself doesn't have to match

const BGs = {
    // required
    BG_TITLE:"images/lys.png",

    // custom
    BG_OUTSIDE:"images/lumiose.png",
    BG_CAFE:"images/lyscafe.png",
    BG_SYCCALL:"images/syccall.png",
    BG_CAFEINSIDE:"images/cafeinterior.png",
    BG_LABS:"https://south-boulevard.nekoweb.org/game%2Fimages/lab.png",
    BG_TY:"https://south-boulevard.nekoweb.org/game%2Fimages/1h2.png",
    BG_INTRO:"https://south-boulevard.nekoweb.org/game%2Fimages/1h1.png"
};

const FGs = {
    // required
    FG_BLANK:"images/blank.png", 

    // custom
    FG_MIKU:"images/FG_MIKU.png",
    FG_SYC:"https://south-boulevard.nekoweb.org/game%2Fimages/idl1.png",
        FG_SYCSMILEFOLD:"https://south-boulevard.nekoweb.org/game%2Fimages/smilefold1.png",
        FG_SYCWINK:"https://south-boulevard.nekoweb.org/game%2Fimages/wink1.png",
        FG_SYCPRESENTS:"https://south-boulevard.nekoweb.org/game%2Fimages/presents.png",
        FG_SYCJOYFUL:"https://south-boulevard.nekoweb.org/game%2Fimages/joyful.png",
        FG_SYCSADGE:"https://south-boulevard.nekoweb.org/game%2Fimages/sadge.png",
        FG_SYCSRS:"https://south-boulevard.nekoweb.org/game%2Fimages/fistserious.png",
        FG_SYCCLOSER:"https://south-boulevard.nekoweb.org/game%2Fimages/closer.png",
        FG_SYCSHOCKED:"https://south-boulevard.nekoweb.org/game%2Fimages/shocked.png"
};

// use MUS_ for looping background music
// max one music track playing at once
// and SFX_ for oneshot sound effects that can play on top

const MUSIC = {
    // required
    SFX_TEXT: "music/SFX_TEXT.mp3",

    // custom
    MUS_OLLIE:"music/pixelollie.mp3",
    MUS_SYC:"https://south-boulevard.nekoweb.org/game%2Fmusic/XY_synca.mp3",
    MUS_RETROSPECTIVE:"https://south-boulevard.nekoweb.org/game%2Fmusic/Whatever_FF8_My_Mind.mp3",
    MUS_MAYBE:"https://south-boulevard.nekoweb.org/game%2Fmusic/sorrow.mp3",
    MUS_EVILEND:"https://south-boulevard.nekoweb.org/game%2Fmusic/ff8_lunatic_pandora.mp3",
    MUS_NICEEND:"https://south-boulevard.nekoweb.org/game%2Fmusic/Whatever_FF8_Roses_and_Wine.mp3",
    SFX_CROW: "https://south-boulevard.nekoweb.org/game%2Fmusic/crowd.wav",
    SFX_BING:"https://south-boulevard.nekoweb.org/game%2Fmusic/bing!.wav",
    SFX_HUH: "https://south-boulevard.nekoweb.org/game%2Fmusic/Huh.wav",
};

const SPEAKERS = {

    L: {name: "Lysandre", colour: "#F12C45"},
    S: {name:"Professor Sycamore", colour:"#2CACF1"}

};
