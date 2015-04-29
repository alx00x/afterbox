// sendToPhotoshop.jsx
// 
// Name: sendToPhotoshop
// Version: 0.0
// Author: Aleksandar Kocic
// 
// Description:     
// This script generates a PSD from composition for external editing and
// provides a basic interface for live updating.
// 

(function sendToPhotoshop(thisObj) {
    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var s2psData = new Object();

    s2psData.scriptNameShort = "STPS";
    s2psData.scriptName = "Send To Photoshop";
    s2psData.scriptVersion = "0.0";
    s2psData.scriptTitle = s2psData.scriptName + " v" + s2psData.scriptVersion;

    s2psData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    s2psData.strActiveCompErr = {en: "Please select a composition."};

    s2psData.strUnlink = {en: "UNLINK"};
    s2psData.strSend = {en: "SEND"};
    s2psData.strUpdate = {en: "UPDATE"};

    s2psData.strLayered = {en: "Layered"};
    s2psData.strFlattened = {en: "Flattened"};

    s2psData.strOptions = {en: "..."};
    s2psData.strHelp = {en: "?"};

    s2psData.strHelpTitle = {en: "Help"};
    s2psData.strErr = {en: "Something went wrong."};
    s2psData.strHelpText = {en: "This script generates a PSD from composition for external editing and provides a basic interface for live updating."};

    // Define project variables
    s2psData.outputQuality = "Best Settings";
    s2psData.outputTemplateVid = "Lossless";
    s2psData.outputTemplateImg = "PNG Sequence";
    s2psData.activeItem = app.project.activeItem;
    s2psData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    s2psData.projectFolder = app.project.file.parent;
    s2psData.outputPath;

    // Localize
    function sendToPhotoshop_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function sendToPhotoshop_buildUI(thisObj) {
        var pal = new Window("palette", s2psData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + s2psData.scriptNameShort + " v" + s2psData.scriptVersion + "', alignment:['fill','center'] }, \
                        options: Button { text:'" + sendToPhotoshop_localize(s2psData.strOptions) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                        help: Button { text:'" + sendToPhotoshop_localize(s2psData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    btns: Group { \
                        orientation:'column', alignment:['fill','top'], \
                        seperator: Panel { height: 2, alignment:['fill','center'] }, \
                        unlinkBtn: Button { text:'" + sendToPhotoshop_localize(s2psData.strUnlink) + "', alignment:['fill','center'] }, \
                        sendBtn: Button { text:'" + sendToPhotoshop_localize(s2psData.strSend) + "', alignment:['fill','center'] }, \
                        radio: Group { \
                            orientation:'row', alignment:['fill','top'], \
                            layeredBtn: RadioButton { text:'" + sendToPhotoshop_localize(s2psData.strLayered) + "', alignment:['fill','top'], value:true }, \
                            flattenedBtn: RadioButton { text:'" + sendToPhotoshop_localize(s2psData.strFlattened) + "', alignment:['fill','top'], value:false }, \
                        }, \
                        seperator: Panel { height: 2, alignment:['fill','center'] }, \
                        updateBtn: Button { text:'" + sendToPhotoshop_localize(s2psData.strUpdate) + "', alignment:['fill','center'] }, \
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
                alert(s2psData.scriptTitle + "\n" + sendToPhotoshop_localize(s2psData.strHelpText), sendToPhotoshop_localize(s2psData.strHelpTitle));
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

    function sendToPhotoshop() {
        //code
    }

    function sendToPhotoshop_main() {      
        sendToPhotoshop();
    }

    // Main Code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(engineText_localize(s2psData.strMinAE));
    } else {
        // Build and show the floating palette
        var s2psPal = sendToPhotoshop_buildUI(thisObj);
        if (s2psPal !== null) {
            if (s2psPal instanceof Window) {
                // Show the palette
                s2psPal.center();
                s2psPal.show();
            } else {
                s2psPal.layout.layout(true);
            }
        }
    }
})(this);