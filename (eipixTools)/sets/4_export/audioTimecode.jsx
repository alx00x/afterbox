// audioTimecode.jsx
// 
// Name: audioTimecode
// Version: 0.2
// Author: Aleksandar Kocic
// 
// Description: Exports audio layers timecode.    
// 
//  


(function audioTimecode(thisObj) {

    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Select at least one audio layer.");
        return;
    }

    if (app.project.activeItem.selectedLayers.length == 0) {
        alert("Select at least one audio layer.");
        return;
    }

    // Define main variables
    var atcData = new Object();

    atcData.scriptNameShort = "ATC";
    atcData.scriptName = "Audio Timecode";
    atcData.scriptVersion = "0.2";
    atcData.scriptTitle = atcData.scriptName + " v" + atcData.scriptVersion;

    atcData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    atcData.strSaveProject = {en: "Save your project first.."};
    atcData.strActiveCompErr = {en: "Please select a composition."};
    atcData.strExecute = {en: "Export"};
    atcData.strCancel = {en: "Cancel"};

    atcData.strHelp = {en: "?"};
    atcData.strHelpTitle = {en: "Help"};
    atcData.strErr = {en: "Something went wrong."};
    atcData.strNoAudioLayers = {en: "No audio layers weere found."};
    atcData.strHelpText = {en: "This script exports timecode data related to audio files to the external XML or TXT file."};

    atcData.strRenderSettings = {en: "Settings"};
    atcData.strOutputPath = {en: "Output Path"};
    atcData.strXML = {en: "Export as XML"};
    atcData.strTXT = {en: "Export as TXT"};

    // Define project variables
    atcData.projectName = app.project.file.name;
    atcData.projectNameNoExt = atcData.projectName.replace(".aepx", "").replace(".aep", "");
    atcData.projectFolder = app.project.file.parent;

    atcData.selectedLayers = []
    atcData.selectedAudioLayers = []

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
                            xml: RadioButton { text:'" + audioTimecode_localize(atcData.strXML) + "' }, \
                            txt: RadioButton { text:'" + audioTimecode_localize(atcData.strTXT) + "', value:true }, \
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

            pal.grp.opts.rdio.xml.enabled = false;

            pal.grp.header.help.onClick = function() {
                alert(atcData.scriptTitle + "\n" + audioTimecode_localize(atcData.strHelpText), audioTimecode_localize(atcData.strHelpTitle));
            }

            pal.grp.cmds.executeBtn.onClick = audioTimecode_doExecute;
            pal.grp.cmds.cancelBtn.onClick = audioTimecode_doCancel;
        }

        return pal;
    }

    function secondsToTime(timeInSeconds) {
        var sec_num = parseInt(timeInSeconds, 10);
        if (timeInSeconds.toString().indexOf('.') === -1)  {
            var mil_num = 00;
        } else {
            var mil_num_dec = timeInSeconds.toString().split(".")[1];
            var mil_num = parseInt(mil_num_dec, 10);
        }
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var milliseconds = parseInt(mil_num, 10);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (milliseconds < 10) {
            milliseconds = "0" + milliseconds;
        }
        var time = hours + ':' + minutes + ':' + seconds + ":0" + milliseconds;
        return time;
    }

    // Main Functions:
    //

    function audioTimecode_main() {
        atcData.selectedLayers = app.project.activeItem.selectedLayers;

        for (var i = 0; i < atcData.selectedLayers.length; i++) {
            if (atcData.selectedLayers[i].hasAudio == true) {
                atcData.selectedAudioLayers.push(atcData.selectedLayers[i]); 
            }
        }

        if (atcData.selectedAudioLayers.length == 0) {
            alert(audioTimecode_localize(atcData.strNoAudioLayers));
        } else {
            if (atcPal.grp.opts.rdio.xml.value == true){
                audioTimecode_exportAsXML(atcData.selectedAudioLayers);
            } else if (atcPal.grp.opts.rdio.txt.value == true) {
                audioTimecode_exportAsTXT(atcData.selectedAudioLayers);
            } else {
                alert(audioTimecode_localize(atcData.strErr))
            } 
        }
    }

    function audioTimecode_exportAsXML(layers) {
        //code
    }

    function audioTimecode_exportAsTXT(layers) {
        var audioLayersDict = [];
        var audioTimecode_txt = new File(atcData.projectFolder.fsName + "/" + atcData.projectNameNoExt + ".txt");
        for (var i = 0; i < layers.length; i++) {
            var sourcename = layers[i].source.name;
            var starttime = secondsToTime(layers[i].startTime.toFixed(2));
            var endtime = secondsToTime(layers[i].outPoint.toFixed(2));
            audioLayersDict.push([sourcename, starttime, endtime]);
        }
        audioTimecode_txt.open("w");
        for (var i = 0; i < audioLayersDict.length; i++) {
            audioTimecode_txt.writeln("Filename: " + audioLayersDict[i][0]);
            audioTimecode_txt.writeln("Timecode: " + audioLayersDict[i][1] + " --> " + audioLayersDict[i][2] + "\n");
        }
        audioTimecode_txt.close();
    }

    // Button Functions:
    //

    // Execute
    function audioTimecode_doExecute() {
        app.beginUndoGroup(atcData.scriptName);
        audioTimecode_main()
        app.endUndoGroup();
        atcPal.close();
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