// simpleLooper.jsx
// 
// Name: simpleLooper
// Version: 0.0
// Author: Aleksandar Kocic
// 
// Description:     
// This script generates a PSD from composition for external editing and
// provides a basic interface for live updating.
// 

(function simpleLooper(thisObj) {
    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var sloopData = new Object();

    sloopData.scriptNameShort = "STPS";
    sloopData.scriptName = "Send To Photoshop";
    sloopData.scriptVersion = "0.0";
    sloopData.scriptTitle = sloopData.scriptName + " v" + sloopData.scriptVersion;

    sloopData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    sloopData.strActiveCompErr = {en: "Please select a composition."};

    sloopData.strUnlink = {en: "UNLINK"};
    sloopData.strSend = {en: "SEND"};
    sloopData.strUpdate = {en: "UPDATE"};

    sloopData.strLayered = {en: "Layered"};
    sloopData.strFlattened = {en: "Flattened"};

    sloopData.strOptions = {en: "..."};
    sloopData.strHelp = {en: "?"};

    sloopData.strHelpTitle = {en: "Help"};
    sloopData.strErr = {en: "Something went wrong."};
    sloopData.strHelpText = {en: "This script generates a PSD from composition for external editing and provides a basic interface for live updating."};

    // Define project variables
    sloopData.outputQuality = "Best Settings";
    sloopData.outputTemplateVid = "Lossless";
    sloopData.outputTemplateImg = "PNG Sequence";
    sloopData.activeItem = app.project.activeItem;
    sloopData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    sloopData.projectFolder = app.project.file.parent;
    sloopData.outputPath;

    // Localize
    function simpleLooper_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function simpleLooper_buildUI(thisObj) {
        var pal = new Window("palette", sloopData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + sloopData.scriptNameShort + " v" + sloopData.scriptVersion + "', alignment:['fill','center'] }, \
                        options: Button { text:'" + simpleLooper_localize(sloopData.strOptions) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                        help: Button { text:'" + simpleLooper_localize(sloopData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    btns: Group { \
                        orientation:'column', alignment:['fill','top'], \
                        seperator: Panel { height: 2, alignment:['fill','center'] }, \
                        unlinkBtn: Button { text:'" + simpleLooper_localize(sloopData.strUnlink) + "', alignment:['fill','center'] }, \
                        sendBtn: Button { text:'" + simpleLooper_localize(sloopData.strSend) + "', alignment:['fill','center'] }, \
                        radio: Group { \
                            orientation:'row', alignment:['fill','top'], \
                            layeredBtn: RadioButton { text:'" + simpleLooper_localize(sloopData.strLayered) + "', alignment:['fill','top'], value:true }, \
                            flattenedBtn: RadioButton { text:'" + simpleLooper_localize(sloopData.strFlattened) + "', alignment:['fill','top'], value:false }, \
                        }, \
                        seperator: Panel { height: 2, alignment:['fill','center'] }, \
                        updateBtn: Button { text:'" + simpleLooper_localize(sloopData.strUpdate) + "', alignment:['fill','center'] }, \
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
                alert(sloopData.scriptTitle + "\n" + simpleLooper_localize(sloopData.strHelpText), simpleLooper_localize(sloopData.strHelpTitle));
            }

            pal.grp.header.options.onClick = function() {
                alert("...");
            }

            pal.grp.btns.unlinkBtn.onClick = engineText_doUnlink;
            pal.grp.btns.sendBtn.onClick = engineText_doSend;
            pal.grp.btns.updateBtn.onClick = engineText_doUpdate;
        }

        return pal;
    }

    // Button Functions:
    //

    function engineText_doUnlink() {
        //code
    }

    function engineText_doSend() {
        //code
    }

    function engineText_doUpdate() {
        //code
    }

    // Main Functions:
    //

    function simpleLooper() {
        //code
    }

    function simpleLooper_main() {      
        simpleLooper();
    }

    // Main Code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(engineText_localize(sloopData.strMinAE));
    } else {
        // Build and show the floating palette
        var sloopPal = simpleLooper_buildUI(thisObj);
        if (sloopPal !== null) {
            if (sloopPal instanceof Window) {
                // Show the palette
                sloopPal.center();
                sloopPal.show();
            } else {
                sloopPal.layout.layout(true);
            }
        }
    }
})(this);