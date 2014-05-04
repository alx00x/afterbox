// audioTimecode.jsx
// 
// Name: audioTimecode
// Version: 0.1
// Author: Aleksandar Kocic
// 
// Description:     
// 
//  


(function audioTimecode(thisObj) {

    // Define main variables
    var atcData = new Object();

    atcData.scriptNameShort = "ATC";
    atcData.scriptName = "Audio Timecode";
    atcData.scriptVersion = "0.1";
    atcData.scriptTitle = atcData.scriptName + " v" + atcData.scriptVersion;

    atcData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    atcData.strActiveCompErr = {en: "Please select a composition."};
    atcData.strExecute = {en: "Export"};
    atcData.strCancel = {en: "Cancel"};

    atcData.strHelp = {en: "?"};
    atcData.strHelpTitle = {en: "Help"};
    atcData.strHelpText = {en: "This script exports timecode data related to audio files to the external XML or TXT file."};

    atcData.strRenderSettings = {en: "Settings"};
    atcData.strOutputPath = {en: "Output Path"};
    atcData.strXML = {en: "Export as XML"};
    atcData.strTXT = {en: "Export as TXT"};

    // Define project variables
    atcData.projectName = app.project.file.name;
    atcData.projectNameFix = atcData.projectName.replace("%20", " ")
    atcData.projectFile = app.project.file;
    atcData.projectRoot = app.project.file.fsName.replace(atcData.projectNameFix, "");
    atcData.desktopPath = new Folder("~/Desktop");
    atcData.outputPath = atcData.desktopPath.fsName;

    // Localize
    function audioTimecode_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function audioTimecode_buildUI(thisObj) {
        var pal = new Window("dialog", atcData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + atcData.scriptNameShort + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + audioTimecode_localize(atcData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], \
                        text: '" + audioTimecode_localize(atcData.strRenderSettings) + "', alignment:['fill','top'] \
                        rdio: Group { \
                            alignment:['fill','top'], \
                            xml: RadioButton { text:'" + audioTimecode_localize(atcData.strXML) + "', value:true }, \
                            txt: RadioButton { text:'" + audioTimecode_localize(atcData.strTXT) + "' }, \
                        }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + audioTimecode_localize(atcData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + audioTimecode_localize(atcData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                alert(atcData.scriptTitle + "\n" + audioTimecode_localize(atcData.strHelpText), audioTimecode_localize(atcData.strHelpTitle));
            }

            pal.grp.cmds.executeBtn.onClick = audioTimecode_doExecute;
            pal.grp.cmds.cancelBtn.onClick = audioTimecode_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    function audioTimecode_main() {
        //code
    }

    function audioTimecode_exportAsXML() {
        //code
    }

    function audioTimecode_exportAsTXT() {
        //code
    }

    // Button Functions:
    //

    // Execute
    function audioTimecode_doExecute() {
        if (saveAction == true) {
            app.beginUndoGroup(atcData.scriptName);
            audioTimecode_main()
            app.endUndoGroup();
            atcPal.close();
        } else {
            return;
        }
    }

    // Cancel
    function audioTimecode_doCancel() {
        atcPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(audioTimecode_localize(atcData.strMinAE));
    } else {
        // Build and show the floating palette
        var atcPal = audioTimecode_buildUI(thisObj);
        if (atcPal !== null) {
            if (atcPal instanceof Window) {
                // Show the palette
                atcPal.center();
                atcPal.show();
            } else {
                atcPal.layout.layout(true);
            }
        }
    }
})(this);