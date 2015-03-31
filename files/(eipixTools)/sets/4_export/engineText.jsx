// engineText.jsx
// 
// Name: engineText
// Version: 1.7
// Author: Aleksandar Kocic
// 
// Description: Exports audio layers timecode.    
// 
//  


(function engineText(thisObj) {

    if (app.project.file == null) {
        alert("Save your project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var etData = new Object();

    etData.scriptNameShort = "ET";
    etData.scriptName = "Engine Text";
    etData.scriptVersion = "1.7";

    etData.strBtnEipix = {en: "EIPIX ENTERTAINMENT"};
    etData.strBtnPesents = {en: "PRESENTS"};
    etData.strBtnCE = {en: "COLLECTOR'S EDITION"};
    etData.strTextLayerName = "engine_text";

    etData.strHelp = {en: "?"};
    etData.strHelpTitle = {en: "Help"};
    etData.strErr = {en: "Something went wrong."};
    etData.strHelpText = {en: "This script provides a quick way to add placeholder text elements such as intro branding and collector's edition text."};
    etData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};

    // Define project variables
    etData.activeItem = app.project.activeItem;
    etData.activeItemName = etData.activeItem.name;

    // Localize
    function engineText_localize(strVar) {
        return strVar["en"];
    }

    // Remove apostrophe
    function removeApostropheAndNewline(str) {
        var string = str;
        string = string.replace(/'/g, '');
        string = string.replace(/(\r\n|\n|\r)/gm,'');
        return string;
    }

    // Build UI
    function engineText_buildUI(thisObj) {
        var pal = new Window("palette", etData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + etData.scriptNameShort + " v" + etData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + engineText_localize(etData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    btns: Group { \
                        orientation:'column', alignment:['fill','top'], \
                        eiBtn: Button { text:'" + removeApostropheAndNewline(engineText_localize(etData.strBtnEipix)) + "', alignment:['fill','center'] }, \
                        prBtn: Button { text:'" + removeApostropheAndNewline(engineText_localize(etData.strBtnPesents)) + "', alignment:['fill','center'] }, \
                        ceBtn: Button { text:'" + removeApostropheAndNewline(engineText_localize(etData.strBtnCE)) + "', alignment:['fill','center'] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function() {
                this.layout.resize();
            }

            pal.grp.header.help.onClick = function() {
                alert(etData.scriptTitle + "\n" + engineText_localize(etData.strHelpText), engineText_localize(etData.strHelpTitle));
            }

            pal.grp.btns.eiBtn.onClick = engineText_doEipix;
            pal.grp.btns.prBtn.onClick = engineText_doPresents;
            pal.grp.btns.ceBtn.onClick = engineText_doCollectors;
        }

        return pal;
    }

    // Variables
    var textFont = "Trebuchet MS";
    var textSize = 36;
    var textColor = [1.0, 0.8, 0.0];

    // Main Functions:
    //
    function engineText_doEipix() {
        //undo group open
        app.beginUndoGroup(removeApostropheAndNewline(engineText_localize(etData.strBtnEipix)));

        //get necesery data
        var activeItem = app.project.activeItem;
        var activeItemName = activeItem.name;
        var activeItemWidth = activeItem.width;
        var activeItemHeight = activeItem.height;
        var activeItemPixelAspect = activeItem.pixelAspect;
        var activeItemDuration = activeItem.duration;
        var curentTime = activeItem.time;

        //add empty text layer
        var eipixText = activeItem.layers.addText(engineText_localize(etData.strBtnEipix));
        var eipixTextValue = eipixText.sourceText.value;
        eipixText.moveToBeginning();
        eipixText.label = 2;

        //add marker and comment
        var mv = new MarkerValue("[0] " + engineText_localize(etData.strBtnEipix));
        eipixText.property("Marker").setValueAtTime(0, mv);

        //set font
        eipixTextValue.resetParagraphStyle();
        eipixTextValue.resetCharStyle();
        eipixTextValue.justification = ParagraphJustification.CENTER_JUSTIFY;
        eipixTextValue.fontSize = textSize;
        eipixTextValue.fillColor = textColor;
        eipixTextValue.font = textFont;
        eipixText.sourceText.setValue(eipixTextValue);

        //set position
        eipixText.position.setValue([activeItemWidth/2, activeItemHeight/2]);
        eipixText.name = etData.strTextLayerName;

        //set duration to 7 seconds
        eipixText.startTime = curentTime;
        eipixText.outPoint = curentTime + 7;

        //add solid composite effect
        var addEffect = eipixText.Effects.addProperty("ADBE Solid Composite");
        addEffect.property(3).setValue(0);

        //set source opacity keyframes
        addEffect.property(1).addKey(curentTime);
        addEffect.property(1).addKey(curentTime + 3);
        addEffect.property(1).addKey(curentTime + 5);
        addEffect.property(1).addKey(curentTime + 7);
        addEffect.property(1).setValueAtKey(1, 0);
        addEffect.property(1).setValueAtKey(2, 100);
        addEffect.property(1).setValueAtKey(3, 100);
        addEffect.property(1).setValueAtKey(4, 0);

        //guide
        eipixText.guideLayer = true;

        //undo group close
        app.endUndoGroup();
    }

    function engineText_doPresents() {
        //undo group open
        app.beginUndoGroup(removeApostropheAndNewline(engineText_localize(etData.strBtnPesents)));

        //get necesery data
        var activeItem = app.project.activeItem;
        var activeItemName = activeItem.name;
        var activeItemWidth = activeItem.width;
        var activeItemHeight = activeItem.height;
        var activeItemPixelAspect = activeItem.pixelAspect;
        var activeItemDuration = activeItem.duration;
        var curentTime = activeItem.time;

        //add empty text layer
        var presentsText = activeItem.layers.addText(engineText_localize(etData.strBtnPesents));
        var presentsTextValue = presentsText.sourceText.value;
        presentsText.moveToBeginning();
        presentsText.label = 2;

        //add marker and comment
        var mv = new MarkerValue("[0] " + engineText_localize(etData.strBtnPesents));
        presentsText.property("Marker").setValueAtTime(0, mv);

        //set font
        presentsTextValue.resetParagraphStyle();
        presentsTextValue.resetCharStyle();
        presentsTextValue.justification = ParagraphJustification.CENTER_JUSTIFY;
        presentsTextValue.fontSize = textSize;
        presentsTextValue.fillColor = textColor;
        presentsTextValue.font = textFont;
        presentsText.sourceText.setValue(presentsTextValue);

        //set position
        presentsText.position.setValue([activeItemWidth/2, activeItemHeight/1.76]);
        presentsText.name = etData.strTextLayerName;

        //set duration to 7 seconds
        presentsText.startTime = curentTime;
        presentsText.outPoint = curentTime + 7;

        //add solid composite effect
        var addEffect = presentsText.Effects.addProperty("ADBE Solid Composite");
        addEffect.property(3).setValue(0);

        //set source opacity keyframes
        addEffect.property(1).addKey(curentTime);
        addEffect.property(1).addKey(curentTime + 3);
        addEffect.property(1).addKey(curentTime + 5);
        addEffect.property(1).addKey(curentTime + 7);
        addEffect.property(1).setValueAtKey(1, 0);
        addEffect.property(1).setValueAtKey(2, 100);
        addEffect.property(1).setValueAtKey(3, 100);
        addEffect.property(1).setValueAtKey(4, 0);

        //guide
        presentsText.guideLayer = true;

        //undo group close
        app.endUndoGroup();
    }

    function engineText_doCollectors() {
        //undo group open
        app.beginUndoGroup(removeApostropheAndNewline(engineText_localize(etData.strBtnCE)));

        //get necesery data
        var activeItem = app.project.activeItem;
        var activeItemName = activeItem.name;
        var activeItemWidth = activeItem.width;
        var activeItemHeight = activeItem.height;
        var activeItemPixelAspect = activeItem.pixelAspect;
        var activeItemDuration = activeItem.duration;
        var curentTime = activeItem.time;

        //add empty text layer
        var collectorsText = activeItem.layers.addText(engineText_localize(etData.strBtnCE));
        var collectorsTextValue = collectorsText.sourceText.value;
        collectorsText.moveToBeginning();
        collectorsText.label = 2;

        //add marker and comment
        var mv = new MarkerValue("[1] " + engineText_localize(etData.strBtnCE));
        collectorsText.property("Marker").setValueAtTime(0, mv);

        //set font
        collectorsTextValue.resetParagraphStyle();
        collectorsTextValue.resetCharStyle();
        collectorsTextValue.justification = ParagraphJustification.CENTER_JUSTIFY;
        collectorsTextValue.fontSize = textSize;
        collectorsTextValue.fillColor = textColor;
        collectorsTextValue.font = textFont;
        collectorsText.sourceText.setValue(collectorsTextValue);

        //set position
        collectorsText.position.setValue([activeItemWidth/2, activeItemHeight/8*7]);
        collectorsText.name = etData.strTextLayerName;

        //set duration to 7 seconds
        collectorsText.startTime = curentTime;
        collectorsText.outPoint = curentTime + 6;

        //add solid composite effect
        var addEffect = collectorsText.Effects.addProperty("ADBE Solid Composite");
        addEffect.property(3).setValue(0);

        //set source opacity keyframes
        addEffect.property(1).addKey(curentTime);
        addEffect.property(1).addKey(curentTime + 3);
        addEffect.property(1).addKey(curentTime + 5);
        addEffect.property(1).addKey(curentTime + 6);
        addEffect.property(1).setValueAtKey(1, 0);
        addEffect.property(1).setValueAtKey(2, 100);
        addEffect.property(1).setValueAtKey(3, 100);
        addEffect.property(1).setValueAtKey(4, 0);

        //set guide
        collectorsText.guideLayer = true;

        //undo group close
        app.endUndoGroup();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(engineText_localize(etData.strMinAE));
    } else {
        // Build and show the floating palette
        var etPal = engineText_buildUI(thisObj);
        if (etPal !== null) {
            if (etPal instanceof Window) {
                // Show the palette
                etPal.center();
                etPal.show();
            } else {
                etPal.layout.layout(true);
            }
        }
    }
})(this);