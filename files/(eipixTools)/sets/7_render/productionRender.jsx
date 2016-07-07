﻿// productionRender.jsx
//
// Name: productionRender
// Version: 0.8
// Author: Aleksandar Kocic
//
// Description:
// Starts background render and exports composition to png sequence and wav
// audio file, than converts using ffmpeg to production needed file formats.
//


(function productionRender(thisObj) {

    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    // Define main variables
    var prrData = new Object();

    prrData.scriptNameShort = "PRR";
    prrData.scriptName = "Production Render";
    prrData.scriptVersion = "0.8";
    prrData.scriptTitle = prrData.scriptName + " v" + prrData.scriptVersion;

    prrData.strPathErr = {en: "Specified path could not be found. Reverting to: ~/Desktop."};
    prrData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    prrData.strActiveCompErr = {en: "Please select a composition."};
    prrData.strModulesErr = {en: "Export modules not found. Do you wish to install them?"};
    prrData.strFFmppegErr = {en: "FFmpeg not found. Install new version of eipixTools."};

    prrData.strSaveActionMsg = {en: "Project needs to be saved now. Do you wish to continue?"};
    prrData.strInstructions = {en: "Rendering with following settings:"};
    prrData.strQuestion = {en: "Do you wish to proceed?"};
    prrData.strExecute = {en: "Yes"};
    prrData.strCancel = {en: "No"};

    prrData.strOptions = {en: "Options"};
    prrData.strVideo = {en: "Video"};
    prrData.strAudio = {en: "Audio"};

    prrData.strOutputPath = {en: "Output Path"};
    prrData.strRenderSettings = {en: "Render Settings"};
    prrData.strOutputModule = {en: "Output Module"};
    prrData.strTimeSpan = {en: "Time Span"};

    prrData.strBrowse = {en: "Browse"};
    prrData.strTimeOpts = {en: ["Length of Comp", "Work Area Only"]};

    prrData.strHelp = {en: "?"};
    prrData.strHelpTitle = {en: "Help"};
    prrData.strHelpText = {en: "Starts background render and exports composition to png sequence and wav audio file, than converts using ffmpeg to production needed file formats."};

    // Define project variables
    prrData.activeItem = app.project.activeItem;
    prrData.activeItemName = app.project.activeItem.name;
    prrData.activeItemRes = prrData.activeItem.width + " x " + prrData.activeItem.height;
    prrData.projectName = app.project.file.name;
    prrData.projectNameFix = prrData.projectName.replace("%20", " ")
    prrData.projectFile = app.project.file;
    prrData.projectRoot = app.project.file.fsName.replace(prrData.projectNameFix, "");

    prrData.workAreaStart = prrData.activeItem.workAreaStart;
    prrData.workAreaDuration = prrData.activeItem.workAreaDuration;

    prrData.frameRate = app.project.activeItem.frameRate;

    // Define render queue variables
    prrData.timeSpanStart = 0;
    prrData.timeSpanDuration = prrData.activeItem.duration;
    prrData.desktopPath = new Folder("~/Desktop");
    prrData.outputPath = prrData.desktopPath.fsName;

    // ffmpeg
    prrData.etcFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(eipixTools)/etc");
    prrData.ffmpegPath = new File(prrData.etcFolder.fsName + "/ffmpeg.exe");

    // Templates
    prrData.rsTemplates = [];
    prrData.omTemplates = [];

    // Localize
    function productionRender_localize(strVar) {
        return strVar["en"];
    }

    // Check ffmpeg
    if (prrData.ffmpegPath.exists == false) {
        alert(productionRender_localize(prrData.strFFmppegErr));
        return;
    }

    // Check active item
    if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(productionRender_localize(prrData.strActiveCompErr));
        return;
    }

    // Prototype startsWith
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function(str) {
            return this.slice(0, str.length) == str;
        };
    }

    // Prototype return folders ony
    function returnOnlyFolders(f) {
        return f instanceof Folder;
    }

    // Prototipe indexOf
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var k;
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }
            var n = +fromIndex || 0;
            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            if (n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    // Prototipe includs a string inside another string
    if (!String.prototype.includes) {
        String.prototype.includes = function() {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }

    // Is in array
    function isInArray(value, array) {
      return array.indexOf(value) > -1;
    }

    // Build UI
    function productionRender_buildUI(thisObj) {
        var pal = new Window("dialog", prrData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + prrData.scriptNameShort + " v" + prrData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + productionRender_localize(prrData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    inst: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + productionRender_localize(prrData.strInstructions) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], \
                        text: '" + productionRender_localize(prrData.strOptions) + "', alignment:['fill','top'] \
                        rset: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + productionRender_localize(prrData.strRenderSettings) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                        time: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + productionRender_localize(prrData.strTimeSpan) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                    }, \
                    video: Panel { \
                        alignment:['fill','top'], \
                        text: '" + productionRender_localize(prrData.strVideo) + "', alignment:['fill','top'] \
                        omv: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + productionRender_localize(prrData.strOutputModule) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                    }, \
                    audio: Panel { \
                        alignment:['fill','top'], \
                        text: '" + productionRender_localize(prrData.strAudio) + "', alignment:['fill','top'] \
                        oma: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + productionRender_localize(prrData.strOutputModule) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                    }, \
                    outputPath: Panel { \
                        alignment:['fill','top'], \
                        text: '" + productionRender_localize(prrData.strOutputPath) + "', alignment:['fill','top'], \
                        main: Group { \
                            alignment:['fill','top'], \
                            btn: Button { text:'" + productionRender_localize(prrData.strBrowse) + "', preferredSize:[-1,20] }, \
                            box: EditText { alignment:['fill','center'], preferredSize:[-1,20] },  \
                        }, \
                    }, \
                    ques: Group { \
                        alignment:['fill','top'], \
                        text: StaticText { text:'" + productionRender_localize(prrData.strQuestion) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + productionRender_localize(prrData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + productionRender_localize(prrData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                alert(prrData.scriptTitle + "\n" + productionRender_localize(prrData.strHelpText), productionRender_localize(prrData.strHelpTitle));
            }

            var rsItems = prrData.rsTemplates;
            for (var i = 0; i < rsItems.length; i++) {
                pal.grp.opts.rset.list.add("item", rsItems[i]);
            }
            pal.grp.opts.rset.list.selection = prrData.rsTemplates.indexOf("Best Settings");
            pal.grp.opts.rset.list.enabled = false;

            var timeItems = productionRender_localize(prrData.strTimeOpts);
            for (var i = 0; i < timeItems.length; i++) {
                pal.grp.opts.time.list.add("item", timeItems[i]);
            }
            pal.grp.opts.time.list.selection = 0;
            pal.grp.opts.time.list.enabled = false;

            var omItems = prrData.omTemplates;
            for (var i = 0; i < omItems.length; i++) {
                pal.grp.video.omv.list.add("item", omItems[i]);
            }
            pal.grp.video.omv.list.selection = prrData.omTemplates.indexOf("PNG Sequence");
            pal.grp.video.omv.list.enabled = false;

            var omItems = prrData.omTemplates;
            for (var i = 0; i < omItems.length; i++) {
                pal.grp.audio.oma.list.add("item", omItems[i]);
            }
            pal.grp.audio.oma.list.selection = prrData.omTemplates.indexOf("WAV");
            pal.grp.audio.oma.list.enabled = false;

            pal.grp.outputPath.main.btn.onClick = function() {
                productionRender_doBrowse();
            }

            pal.grp.inst.enabled = true;
            pal.grp.opts.enabled = false;
            pal.grp.video.enabled = false;
            pal.grp.audio.enabled = false;

            var outputPath = checkIfStandardStructure();
            pal.grp.outputPath.main.box.text = outputPath;

            pal.grp.cmds.executeBtn.onClick = productionRender_doExecute;
            pal.grp.cmds.cancelBtn.onClick = productionRender_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    // Dialog to let users define render location
    function productionRender_doBrowse() {
        var browseOutputPath = Folder.selectDialog();
        if (browseOutputPath != null) {
            prrPal.grp.outputPath.main.box.text = browseOutputPath.toString();
        }
    }

    // Add quotes
    function addQuotes(string) {
        return "\""+ string + "\"";
    }

    // Leading zeros padding
    function pad(num, size) {
        var s = "000000000" + num;
        return s.substr(s.length-size);
    }

    // Try int pars or return defaultValue
    function TryParseInt(str, defaultValue) {
         var retValue = defaultValue;
         if(str !== null) {
             if(str.length > 0) {
                 if (!isNaN(str)) {
                     retValue = parseInt(str, 10);
                 }
             }
         }
         return retValue;
    }

    // Check if project is in standard structure
    function checkIfStandardStructure() {
        var renderPathOut;
        var projectRoot = prrData.projectRoot;
        var projectFolder = projectRoot.split('\\').reverse()[1];
        if (projectFolder == "after") {
            var renderPath = new Folder(app.project.file.parent.parent.toString() + "/render");
            if (renderPath.exists == true) {
                renderPathOut = renderPath.fsName;
            }
        }
        return renderPathOut;
    }

    // Get files recursivly
    function getFilesRecursively(dir, type, array) {
        var array = array;
        var folder = new Folder(dir.toString());
        var files = folder.getFiles();
        for (var i = 0; i < files.length; i++) {
            if (files[i] instanceof Folder) {
                 getFilesRecursively(files[i], type, array);
            } else if ((files[i] instanceof File) && (files[i].toString().slice(-3) == type)) {
                array.push(files[i]);
            }
        }
        return array;
    }

    // Run import output modules script (importRenderTemplates.jsx)
    function importRenderTemplates() {
        var setsFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(eipixTools)/sets");
        var jsxFiles = getFilesRecursively(setsFolder.fsName, "jsx", []);
        for (var i = 0; i < jsxFiles.length; i++) {
            var currentScript = new File(jsxFiles[i]);
            var currentScriptName = currentScript.fsName.replace(/^.*[\\\/]/, '')
            if (currentScriptName == "importOutputTemplates.jsx") {
                var scriptText = "";
                currentScript.open("r");
                while (!currentScript.eof)
                scriptText += currentScript.readln() + "\r\n";
                currentScript.close();
                eval(scriptText);
            }
        }
    }

    // Main
    function productionRender_main() {

        // Add to render queue
        var renderQueueItem = app.project.renderQueue.items.add(prrData.activeItem);
        var renderQueueItemIndex = app.project.renderQueue.numItems;

        // Assign Render Settings template
        renderQueueItem.applyTemplate(prrPal.grp.opts.rset.list.selection);

        // Assign Output Module template
        renderQueueItem.outputModules.add()
        renderQueueItem.outputModules[1].applyTemplate("PNG Sequence");
        renderQueueItem.outputModules[2].applyTemplate("WAV");

        // Assign Time Span choice
        var startFrame;
        if (prrPal.grp.opts.time.list.selection.index == 1) {
            startFrame = prrData.workAreaStart * prrData.frameRate;
            renderQueueItem.timeSpanStart = prrData.workAreaStart;
            renderQueueItem.timeSpanDuration = prrData.workAreaDuration;
        } else {
            startFrame = prrData.timeSpanStart * prrData.frameRate;
            renderQueueItem.timeSpanStart = prrData.timeSpanStart;
            renderQueueItem.timeSpanDuration = prrData.timeSpanDuration;
        }

        // Define usepath
        var usePath;
        var editboxOutputPath = prrPal.grp.outputPath.main.box.text;
        if (editboxOutputPath == "") {
            usePath = prrData.outputPath;
        } else {
            var usePathFolder = new Folder(editboxOutputPath);
            if (usePathFolder.exists == true) {
                usePath = editboxOutputPath;
            } else {
                alert(productionRender_localize(prrPal.strPathErr));
                usePath = prrData.outputPath;
            }
        }

        // Define render folder
        var foldersInPath = new Folder(usePath).getFiles(returnOnlyFolders);
        var folderIncrement = 0;
        for (var i = 0; i < foldersInPath.length; i++) {
            var pi = foldersInPath[i].toString();
            var fi = pi.substr(pi.length - 3);
            var fiInt = TryParseInt(fi, null);
            if (!(fiInt == null) && (fiInt > folderIncrement)) {
                folderIncrement = fiInt;
            }

        }
        var folderIncrementString = pad(folderIncrement + 1, 3);

        // Create render folder
        var renderFolder = new Folder(usePath.toString() + "\\" + prrData.activeItemName + "_r" + folderIncrementString);
        renderFolder.create();

        // Create sequence Folder
        var sequenceFolder = new Folder(renderFolder.fsName + "\\" + prrData.activeItemName);
        sequenceFolder.create();

        // Write play with vlc bat file
        var playBatContent = '@echo off\r\n';
        playBatContent += 'set VLC="C:\\Program Files\\VideoLAN\\VLC\\vlc.exe"\r\n';
        playBatContent += 'if not exist %VLC% (set VLC="C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe")\r\n';
        playBatContent += 'if not exist %VLC% goto NOVLC\r\n';
        playBatContent += 'set NetPath=%~dp0\r\n';
        playBatContent += 'set Video=%NetPath%' + prrData.activeItemName + '.ogv\r\n';
        playBatContent += 'set Audio=%NetPath%' + prrData.activeItemName + '.ogg\r\n';
        playBatContent += 'set Subtitle=%NetPath%' + prrData.activeItemName + '.srt\r\n';
        playBatContent += 'if not exist %Video% goto NOVIDEO\r\n';
        playBatContent += 'if not exist %Audio% goto NOAUDIO\r\n';
        playBatContent += 'if not exist %Subtitle% goto NOSUBTITLE\r\n';
        playBatContent += 'goto EXECUTE\r\n';
        playBatContent += ':NOVLC\r\n';
        playBatContent += 'echo No VLC found\r\n';
        playBatContent += 'pause\r\n';
        playBatContent += 'goto :eof\r\n';
        playBatContent += ':NOVIDEO\r\n';
        playBatContent += 'echo No Video file found\r\n';
        playBatContent += 'pause\r\n';
        playBatContent += 'goto :eof\r\n';
        playBatContent += ':NOAUDIO\r\n';
        playBatContent += 'echo No Audio file found\r\n';
        playBatContent += 'goto EXECUTENOAUDIO\r\n';
        playBatContent += ':NOSUBTITLE\r\n';
        playBatContent += 'echo No Subtitle file found\r\n';
        playBatContent += 'goto EXECUTENOSUBTITLE\r\n';
        playBatContent += ':EXECUTE\r\n';
        playBatContent += 'start "" %VLC% %Video% --input-slave=%Audio% --sub-file=%Subtitle%\r\n';
        playBatContent += 'goto :eof\r\n';
        playBatContent += ':EXECUTENOAUDIO\r\n';
        playBatContent += 'start "" %VLC% %Video%\r\n';
        playBatContent += 'goto :eof\r\n';
        playBatContent += ':EXECUTENOSUBTITLE\r\n';
        playBatContent += 'start "" %VLC% %Video% --input-slave=%Audio%\r\n';
        playBatContent += 'goto :eof\r\n';

        var playWithVLCFile = new File(renderFolder.fsName + "\\" + prrData.activeItemName + ".bat");
        if (playWithVLCFile.exists == true) {
            playWithVLCFile.remove();
        }
        if (playWithVLCFile.open("w")) {
            try {
                playWithVLCFile.write(playBatContent);
            } catch (err) {
                alert(err.toString());
            } finally {
                playWithVLCFile.close();
            }
        }

        // Define output files
        var sequenceOutput = new File(renderFolder.fsName + "\\" + prrData.activeItemName + "\\" + prrData.activeItemName + "_[#####]");
        var audioOutput = new File(renderFolder.fsName + "\\" + prrData.activeItemName);

        // Add output modules
        renderQueueItem.outputModules[1].file = sequenceOutput;
        renderQueueItem.outputModules[2].file = audioOutput;

        // Save the project
        app.project.save();

        // Get frame path and ogv output path
        var sequenceFramePath = sequenceFolder.fsName + "\\" + prrData.activeItemName + "_%%05d.png";
        var fileOutPath = renderFolder.fsName + "\\" + prrData.activeItemName;

        // Write render bat file
        var aerenderEXE = new File(Folder.appPackage.fullName + "/aerender.exe");
        var zipScript = new File(prrData.etcFolder.fsName + "/zipscript.vbs");

        var batContent = "@echo off\r\n";
        batContent += "title Please Wait\r\n"
        batContent += "start \"\" /b " + "/low" + " /wait "
        batContent += addQuotes(aerenderEXE.fsName) + " -project " + addQuotes(prrData.projectFile.fsName) + " -rqindex " + renderQueueItemIndex + " -sound ON -mp\r\n";
        batContent += "echo Rendering Finished\r\n"
        batContent += addQuotes(prrData.ffmpegPath.fsName) + " -y -i " + addQuotes(fileOutPath) + ".wav" + " -vn -c:a libvorbis -q:a 10 " + addQuotes(fileOutPath) + ".ogg\r\n";;
        // temp file for preview
        batContent += addQuotes(prrData.ffmpegPath.fsName) + " -y -start_number " + startFrame + " -i " + addQuotes(sequenceFramePath) + " -r " + prrData.frameRate + " -i " + addQuotes(fileOutPath) + ".wav" + " -c:v libx264 -preset slow -pix_fmt yuv420p -profile:v baseline -level 3.0 -c:a aac " + addQuotes(fileOutPath) + "_preview.mp4\r\n";;
        //continue
        batContent += addQuotes(prrData.ffmpegPath.fsName) + " -y -start_number " + startFrame + " -i " + addQuotes(sequenceFramePath) + " -r " + prrData.frameRate + " -c:v libtheora -qscale:v 8 -an " + addQuotes(fileOutPath) + ".ogv\r\n";
        batContent += addQuotes(prrData.ffmpegPath.fsName) + " -y -start_number " + startFrame + " -i " + addQuotes(sequenceFramePath) + " -r " + prrData.frameRate + " -c:v libx264 -preset slow -pix_fmt yuv420p -profile:v baseline -level 3.0 -an " + addQuotes(fileOutPath) + ".mp4\r\n";;
        batContent += "echo Converting Finished\r\n"
        batContent += "mkdir " + addQuotes(renderFolder.fsName + "\\" + prrData.activeItemName + "_temp") + "\r\n"
        batContent += "move " + addQuotes(sequenceFolder.fsName) + " " + addQuotes(renderFolder.fsName + "\\" + prrData.activeItemName + "_temp") + "\r\n"
        batContent += "ren " + addQuotes(renderFolder.fsName + "\\" + prrData.activeItemName + "_temp") + " " + prrData.activeItemName + "\r\n"
        batContent += addQuotes(zipScript.fsName) + " " + addQuotes(sequenceFolder.fsName) + " " + addQuotes(sequenceFolder.fsName + ".zip") + "\r\n"
        batContent += "echo Cleanup Finished\r\n"
        batContent += "%SystemRoot%\\explorer.exe " + addQuotes(renderFolder.fsName) + "\r\n"
        batContent += "pause";

        var batFile = new File(app.project.file.fsName.replace(".aep", ".bat"));
        if (batFile.exists == true) {
            batFile.remove();
        }
        if (batFile.open("w")) {
            try {
                batFile.write(batContent);
            } catch (err) {
                alert(err.toString());
            } finally {
                batFile.close();
            }
        }

        // Start rendering
        if (batFile.exists == true) {
            batFile.execute();
        }

        // Remove queue item
        app.project.renderQueue.item(renderQueueItemIndex).remove();

        // Close interface
        app.executeCommand(app.findMenuCommandId("Increment and Save"))
        prrPal.close();
    }

    // Execute
    function productionRender_doExecute() {
        var saveAction = confirm(productionRender_localize(prrData.strSaveActionMsg));
        if (saveAction == true) {
            app.beginUndoGroup(prrData.scriptName);

            productionRender_main()

            app.endUndoGroup();
            prrPal.close();
        } else {
            return;
        }
    }

    function productionRender_doCancel() {
        prrPal.close();
    }

    // Main code:
    //

    // Check if PNG Sequenxce output template exists
    function checkmodules() {
        var check = false;

        var renderQ = app.project.renderQueue;
        var tempComp = app.project.items.addComp("setProxyTempComp", 100, 100, 1, 1, 25);
        var tempCompQueueItem = renderQ.items.add(tempComp)
        var tempCompQueueItemIndex = renderQ.numItems;
        var templateArray = renderQ.item(tempCompQueueItemIndex).outputModules[1].templates;

        PNGcheck = isInArray("PNG Sequence", templateArray);
        WAVcheck = isInArray("WAV", templateArray);

        if ((PNGcheck == true) && (WAVcheck == true)) {
            var check = true;
        }

        // Get Render Settings Templates
        var rsTemplatesAll = renderQ.item(tempCompQueueItemIndex).templates;
        for (var i = 0; i < rsTemplatesAll.length; i++) {
            if (rsTemplatesAll[i].startsWith("_HIDDEN") == false) {
                prrData.rsTemplates.push(rsTemplatesAll[i]);
            }
        }

        // Get Output Module Templates
        var omTemplatesAll = renderQ.item(tempCompQueueItemIndex).outputModule(1).templates;
        for (var i = 0; i < omTemplatesAll.length; i++) {
            if (omTemplatesAll[i].startsWith("_HIDDEN") == false) {
                prrData.omTemplates.push(omTemplatesAll[i]);
            }
        }

        // Cleanup
        tempCompQueueItem.remove();
        tempComp.remove();

        return check;
    }

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(productionRender_localize(prrData.strMinAE));
    } else if (checkmodules() == false) {
        var confirmImportModules = confirm(productionRender_localize(prrData.strModulesErr));
        if (confirmImportModules == true) {
            try {
                importRenderTemplates();
            } catch (err) {
                alert(err.toString());
            }
        }
    } else if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(productionRender_localize(prrData.strActiveCompErr));
    } else {
        // Build and show the floating palette
        var prrPal = productionRender_buildUI(thisObj);
        if (prrPal !== null) {
            if (prrPal instanceof Window) {
                // Show the palette
                prrPal.center();
                prrPal.show();
            } else {
                prrPal.layout.layout(true);
            }
        }
    }
})(this);
