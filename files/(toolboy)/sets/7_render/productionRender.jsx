#include "../../update/json.js";
// productionRender.jsx
//
// Name: productionRender
// Author: Aleksandar Kocic
//
// Description:
// Starts background render and exports composition to png sequence and wav
// audio file, than converts using ffmpeg to production needed file formats.
//


(function productionRender(thisObj) {

    // Mandatory checks

    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Select the composition you wish to render.");
        return;
    }

    if ($.os.indexOf("Win") == -1) {
        alert("This script only works on windows.");
        return;
    }

    // required toolboy check
    var requiredToolboyVersion = 4.1;
    if (app.settings.haveSetting("Toolboy", "Version")) {
        var currentToolboyVersion = parseFloat(app.settings.getSetting("Toolboy", "Version"));
    } else {
        var currentToolboyVersion = 0.0;
    }

    if (currentToolboyVersion < requiredToolboyVersion) {
        alert("This script requires toolboy version " + requiredToolboyVersion + " or later. Please update to use this!");
        return;
    }

    // Define main variables
    var prrData = new Object();

    prrData.scriptNameShort = "PR";
    prrData.scriptName = "Production Render";
    prrData.scriptVersion = "2.12";
    prrData.scriptTitle = prrData.scriptName + " v" + prrData.scriptVersion;

    prrData.strErrNotTopComp = { en: "NOTE: Composition you are rendering is not top composition in hierarchy." };
    prrData.strStandardStructureErr = { en: "NOTE: Project file is not located in standard structure path." };
    prrData.strPathErr = { en: "Specified path could not be found. Reverting to: ~/Desktop.\rDo you wish to continue?" };
    prrData.strMinAE = { en: "This script requires Adobe After Effects CC2014 or later." };
    prrData.strActiveCompErr = { en: "Please select a composition." };
    prrData.strModulesErr = { en: "Export modules not found. Do you wish to install them?" };
    prrData.strFFmppegErr = { en: "Dependency ffmpeg not found. Install new version of toolboy." };
    prrData.strFFmppeg2TheoraErr = { en: "Dependency ffmpeg2theora not found. Install new version of toolboy!" };
    prrData.strCurlErr = { en: "Dependency curl not found. Install new version of toolboy!" };

    prrData.strSaveActionMsg = { en: "Project needs to be saved now. Are you ready to render?" };
    prrData.strInstructions = { en: "Rendering with the following settings:" };
    prrData.strQuestion = { en: "Do you wish to proceed?" };
    prrData.strExecute = { en: "Yes" };
    prrData.strCancel = { en: "No" };

    prrData.strRerunBtn = { en: "Re-Run" };
    prrData.strOpenInExplorerBtn = { en: "Open in Explorer" };
    prrData.strPlayPreviewBtn = { en: "Play Preview" };
    prrData.strSendToPublishBtn = { en: "Publish" };

    prrData.strCopyToNetworkShowProgress = { en: "Show command line window when copying to network" };
    prrData.strEnable = { en: "Enable" };
    prrData.strSendToTrello = { en: "Send to Trello" };
    prrData.strCopyToNetwork = { en: "Copy to Network" };

    prrData.strRefreshStatusBtn = { en: "Refresh Status" };
    prrData.strExitBtn = { en: "Exit" };
    prrData.strSaveBtn = { en: "Save" };

    prrData.strAPIKey = { en: "API Key" };
    prrData.strAPIToken = { en: "API Token" };

    prrData.strPrevious = { en: "Previous Renders" };

    prrData.strTrelloDisabled = { en: "NOTE: Send to Trello feature is disabled. You will need to enable it in settings and configure API key and token." };
    prrData.strRenderAlreadySentToTrello = { en: "NOTE: This render has already been sent to Trello. \n\nDo you want to send it again?" };

    prrData.strNothingSelected = { en: "ERROR: Select a render from the list first." };
    prrData.strRenderIncomplete = { en: "ERROR: This render does not appear to be complete." };
    prrData.strSelectionDoesNotExist = { en: "ERROR: Sorry, could not locate the file." };

    prrData.strNetworkDoesNotExist = {
        en: "ERROR: Network error. Please try again later or contact your IT administrator for more information."
    };
    prrData.strNetworkPathDoesNotExist = {
        en: "ERROR: Could not locate network location for this task. Probably not created while initializing. Will not publish to network."
    };

    prrData.strCouldNotResolveNetLoc = { en: "ERROR: Could not resolve network location! You will have to move the files manually." };
    prrData.strFolderNotExist = { en: "ERROR: Folder does not seem to exist." };
    prrData.strFilesCopied = { en: "Files copied successfully!" };

    prrData.strOverwriteFiles = { en: "Overwrite existing files?" };
    prrData.strOverwriteFilesDeclined = { en: "Nothing has been copied." };

    prrData.strOptions = { en: "Options" };
    prrData.strVideo = { en: "Video" };
    prrData.strAudio = { en: "Audio" };
    prrData.strComment = { en: "Comment" };

    prrData.strOutputPath = { en: "Output Path" };
    prrData.strRenderSettings = { en: "Render Settings" };
    prrData.strOutputModule = { en: "Output Module" };
    prrData.strTimeSpan = { en: "Time Span" };

    prrData.strOMVHelpTip = { en: "This option is not settable." };
    prrData.strOMAHelpTip = { en: "This option is not settable." };

    prrData.strContinueOnMissing = { en: "Continue on missing footage" };
    prrData.strDeleteSequence = { en: "Delete png sequence when finished" };
    prrData.strOpenInExplorer = { en: "Open in explorer when finished" };
    prrData.strReuse = { en: "GUI rendering (non-background)" };
    prrData.strMultiprocessing = { en: "Enable multiprocessing" };

    prrData.strBrowse = { en: "Browse" };
    prrData.strTimeOpts = { en: ["Length of Comp", "Work Area Only"] };

    prrData.strSettings = { en: "..." };
    prrData.strHelp = { en: "?" };
    prrData.strHelpTitle = { en: "Help" };
    prrData.strHelpText = {
        en: "Starts background render and exports composition to png sequence and wav audio file, " +
            "than converts using ffmpeg to production needed file formats."
    };
    prrData.strHelpTextRenderPrevious = {
        en: "This window allows you to re-run previously rendered sequences for the " +
            "current project. Works only on projects rendered with Production Render v2.0 or later.\n\n" +
            "Status colors:\n" +
            "red - something went terribly wrong\n" +
            "yellow - incomplete render\n" +
            "green - everything seems alright" +
            ""
    };
    prrData.strHelpTextSettings = {
        en: "You will have to fill in key and token for authorization to work properly. Ask your team lead to provide these for you."
    };

    prrData.strMayTakeAWhile = { en: "Please be patient, this may take a while..." };
    prrData.strSubmittedToTrello = { en: "Selected item submitted to Trello successfully!" };
    prrData.strSomethingWentWrong = { en: "Something went wrong! Please try again later or report a bug." };

    prrData.outputFileList = [
        "<filename>.mp4",
        "<filename>.ogg",
        "<filename>.ogv",
        "<filename>.txt",
        "<filename>.wav",
        "<filename>_lossless.mp4",
        "<filename>_preview.mp4"
    ];

    // Define active item
    prrData.activeItem = app.project.activeItem;

    // Set start frame to 0 for render composition
    prrData.activeItem.displayStartTime = 0;

    // Define project variables
    prrData.activeItemName = app.project.activeItem.name;
    prrData.activeItemRes = prrData.activeItem.width + " x " + prrData.activeItem.height;
    prrData.projectName = app.project.file.name;
    prrData.projectNameFix = prrData.projectName.replace("%20", " ");
    prrData.projectFile = app.project.file;
    prrData.projectRoot = app.project.file.fsName.replace(prrData.projectNameFix, "");

    prrData.activeItemFPS = prrData.activeItem.frameRate;
    prrData.activeItemHeight = prrData.activeItem.height;
    prrData.activeItemWidth = prrData.activeItem.width;
    prrData.activeItemPixelAspect = prrData.activeItem.pixelAspect;
    prrData.timeSpanStart = prrData.activeItem.displayStartTime * prrData.activeItemFPS;
    prrData.timeSpanDuration = prrData.activeItem.duration;
    prrData.workAreaStart = prrData.activeItem.workAreaStart;
    prrData.workAreaDuration = prrData.activeItem.workAreaDuration;

    prrData.frameRate = app.project.activeItem.frameRate;

    // Define render queue variables
    prrData.desktopPath = new Folder("~/Desktop");
    prrData.outputPath = app.project.file.parent.toString();

    // ffmpeg
    prrData.etcFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(toolboy)/etc");
    prrData.ffmpegPath = new File(prrData.etcFolder.fsName + "/ffmpeg.exe");
    prrData.ffmpeg2theoraPath = new File(prrData.etcFolder.fsName + "/ffmpeg2theora.exe");

    // curl
    prrData.curl = new File(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(toolboy)/update/curl.exe");

    // Images
    prrData.imgFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(toolboy)/images");
    prrData.headerImage = new File(prrData.imgFolder.fsName + "/productionRender_header.png");
    prrData.redStatusImage = new File(prrData.imgFolder.fsName + "/productionRender_red.png");
    prrData.yellowStatusImage = new File(prrData.imgFolder.fsName + "/productionRender_yellow.png");
    prrData.greenStatusImage = new File(prrData.imgFolder.fsName + "/productionRender_green.png");

    prrData.loadingSWF = new File(prrData.imgFolder.fsName + "/loading.swf");

    // Trello
    prrData.trelloURL = "api.trello.com";
    prrData.trelloAPIVersion = "1";
    prrData.memberID = "567d1c36e840dc56233ed84c";

    // Templates
    prrData.rsTemplates = [];
    prrData.omTemplates = [];

    // Re-rendering
    prrData.renderBatchFiles = [];

    // Localize
    function productionRender_localize(strVar) {
        return strVar["en"];
    }

    // Check ffmpeg
    if (prrData.ffmpegPath.exists == false) {
        alert(productionRender_localize(prrData.strFFmppegErr));
        return;
    }

    // Check ffmpeg2theora
    if (prrData.ffmpeg2theoraPath.exists == false) {
        alert(productionRender_localize(prrData.strFFmppeg2TheoraErr));
        return;
    }

    // Check curl
    if (prrData.curl.exists == false) {
        alert(productionRender_localize(prrData.strCurlErr));
        return;
    }

    // Check active item
    if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(productionRender_localize(prrData.strActiveCompErr));
        return;
    }

    // Prototype startsWith
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str) {
            return this.slice(0, str.length) == str;
        };
    }

    // Prototype return folders ony
    function returnOnlyFolders(f) {
        return f instanceof Folder;
    }

    // Prototipe indexOf
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
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

    // Prototipe includes a string inside another string
    if (!String.prototype.includes) {
        String.prototype.includes = function () {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }

    // Prototipe string to bool: <string>.bool()
    String.prototype.bool = function () {
        return (/^true$/i).test(this);
    };

    // Is in array
    function isInArray(value, array) {
        return array.indexOf(value) > -1;
    }

    // Reverse array
    function reverseObj(items, func) {
        var reversed = Array();
        for (var key in items) {
            reversed.unshift(items[key]);
        }
        if (func) {
            for (var key in reversed) {
                func(key, reversed[key]);
            }
        }
        return reversed;
    }

    // helper function to replace line in text file
    function replaceInTextFile(file, text, newText) {
        // read file
        file.open("r");
        var textFileContent = file.read();
        file.close();

        // find in file
        var str = textFileContent.indexOf(text);
        if (str == -1) {
            var txt = textFileContent + "\r\n" + newText + "\r\n";
        } else {
            var txt = textFileContent.replace(text, newText);
        }

        // write file
        file.open("w");
        file.write(txt);
        file.close();
    }

    // helper function to copy file
    function copyFile(sourceFile, destinationFile) {
        createFolder(destinationFile.parent);
        // sourceFile.copy(destinationFile);

        try {
            var sourceDir = sourceFile.parent.fsName;
            var destDir = destinationFile.parent.fsName;
            var copyFile = sourceFile.name;
            var copyCmd = "robocopy \"" + sourceDir + "\" \"" + destDir + "\" \"" + copyFile + "\"";
            var call = system.callSystem(copyCmd);
        } catch (e) {
            alert(e);
        }
    }

    // helper function to copy multiple files when in same folder
    function copyMultipleFiles(sourceFolder, destinationFolder, fileArray) {
        createFolder(destinationFolder);
        try {
            var srcF = sourceFolder.fsName;
            var destF = destinationFolder.fsName;

            var fileString = "\"" + fileArray.join("\" \"") + "\"";
            var copyCmd = "cmd.exe /c robocopy \"" + srcF + "\" \"" + destF + "\" " + fileString;
            var call = system.callSystem(copyCmd);
        } catch (e) {
            alert(e);
        }
    }

    // helper function to create folders
    function createFolder(folder) {
        if (folder.parent !== null && !folder.parent.exists) {
            createFolder(folder.parent);
        }
        folder.create();
    }

    // function for getting bat files in subfolders
    function getBatchFiles(theFolder) {
        var searchFolder = new Folder(theFolder);
        var allFiles = searchFolder.getFiles();
        var loadFiles = [];
        for (var i = 0; i < allFiles.length; i++) {
            var scriptFile = allFiles[i];
            if (scriptFile instanceof File && scriptFile.name.match(/\.bat$/i)) {
                var scriptFileName = scriptFile.toString().split(/(\\|\/)/g).pop();
                loadFiles.push(scriptFile);
            }
        }
        return loadFiles;
    }

    // get previous renders of current project
    function getPreviousRenders() {
        var renderableBatchFiles = [];

        // get project folder
        var lookInFolder = prrData.projectRoot;

        // get all production render batch files
        var batchFiles = getBatchFiles(lookInFolder);

        // filter batch files
        var prodRendBatchFiles = [];
        for (var i = 0; i < batchFiles.length; i++) {
            var file = batchFiles[i];
            // read file
            if (file && file.open("r")) {
                while (!file.eof) {
                    var line = file.readln();
                    if (line == "rem Production Render for After Effects") {
                        prodRendBatchFiles.push(file);
                    }
                }
            }
            file.close();
        }

        // read files ad populate renderableBatchFiles dict
        for (var i = 0; i < prodRendBatchFiles.length; i++) {
            var file = prodRendBatchFiles[i];
            if (file && file.open("r")) {
                var readRenderName;
                var readRenderTime;
                var readPublishStatus;
                var readRenderOwner;
                var readRenderSubmitDate;
                var readRenderSubmitTime;
                var readRenderComment;
                var readRenderOutput;
                var readRenderFolderName;
                var readRenderPath;
                var readRenderSequencePath;
                var readRenderGameName;
                var readRenderTaskName;
                var readRenderTaskType;
                var readRenderFile;

                while (!file.eof) {
                    var line = file.readln();
                    if (line.startsWith("set \"RENDER_NAME")) {
                        readRenderName = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set \"RENDER_OWNER")) {
                        readRenderOwner = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set \"RENDER_SUBMIT_DATE")) {
                        readRenderSubmitDate = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set \"RENDER_SUBMIT_TIME")) {
                        readRenderSubmitTime = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set \"RENDER_COMMENT")) {
                        readRenderComment = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set \"RENDER_OUTPUT")) {
                        readRenderOutput = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set \"RENDER_FOLDER_NAME")) {
                        readRenderFolderName = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set \"GAME_NAME=")) {
                        readRenderGameName = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set \"TASK_NAME=")) {
                        readRenderTaskName = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set \"TASK_TYPE=")) {
                        readRenderTaskType = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set RENDER_PATH=")) {
                        readRenderPath = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    if (line.startsWith("set RENDER_SEQEUNCE_PATH=")) {
                        readRenderSequencePath = line.split("=")[1].replace(/['"]+/g, '');
                    }
                    readRenderFile = file;
                }

                // get render time
                readRenderTime = getRenderTime(readRenderPath + "\\" + readRenderOutput + ".txt");
                readPublishStatus = getRenderTime(readRenderPath + "\\" + readRenderOutput + ".txt");

                // dict
                var dict = {
                    "name": readRenderName,
                    "render_time": readRenderTime,
                    "publish_status": readPublishStatus,
                    "owner": readRenderOwner,
                    "submit_date": readRenderSubmitDate,
                    "submit_time": readRenderSubmitTime,
                    "comment": readRenderComment,
                    "output": readRenderOutput,
                    "render_folder_name": readRenderFolderName,
                    "render_path": readRenderPath,
                    "sequence_path": readRenderSequencePath,
                    "game_name": readRenderGameName,
                    "task_name": readRenderTaskName,
                    "task_type": readRenderTaskType,
                    "file": readRenderFile,
                };

                renderableBatchFiles.push(dict);
            }
            file.close();
        }
        return renderableBatchFiles;
    }

    function getRenderStatus(tableItem) {
        var statusImage;
        // get status
        var tableItemRenderPath = new Folder(tableItem["render_path"]);
        if (tableItemRenderPath.exists == true) {
            // generate expected output file list
            var outName = tableItem["output"];
            var outFileList = prrData.outputFileList;
            var outFileListProper = [];
            for (var f = 0; f < outFileList.length; f++) {
                var fl = outFileList[f].replace(/^.*[\\\/]/, '');
                var fo = fl.replace("<filename>", outName);
                outFileListProper.push(fo);
            }

            // get output file list
            var filesFromRenderFolder = tableItemRenderPath.getFiles();
            var filesFromRenderFolderNamesOnly = [];
            for (var t = 0; t < filesFromRenderFolder.length; t++) {
                if (filesFromRenderFolder[t] instanceof File) {
                    var tl = filesFromRenderFolder[t].fsName.replace(/^.*[\\\/]/, '');
                    filesFromRenderFolderNamesOnly.push(tl);
                }
            }

            // compare to expected state
            var renderFiles = []
            for (var j = 0; j < outFileListProper.length; j++) {
                if (isInArray(outFileListProper[j], filesFromRenderFolderNamesOnly) == true) {
                    renderFiles.push(outFileListProper[j]);
                }
            }

            if (renderFiles.length == 0) {
                statusImage = prrData.redStatusImage;
            } else if (renderFiles.length <= 2) {
                statusImage = prrData.redStatusImage;
            } else if (renderFiles.length < outFileList.length) {
                statusImage = prrData.yellowStatusImage;
            } else if (renderFiles.length > outFileList.length) {
                statusImage = prrData.yellowStatusImage;
            } else {
                statusImage = prrData.greenStatusImage;
            }
        } else {
            statusImage = prrData.redStatusImage;
        }
        return statusImage;
    }

    function getRenderTime(infoFilePath) {
        var renderTime = "Unknown";
        var infoFile = new File(infoFilePath);
        if (infoFile.exists == true) {
            // read file
            if (infoFile && infoFile.open("r")) {
                while (!infoFile.eof) {
                    var line = infoFile.readln();
                    if (line.startsWith("RenderTime:")) {
                        renderTime = line.split(": ")[1];
                    }
                }
            }
            infoFile.close();
        }
        return renderTime;
    }

    function getPublishStatus(infoFilePath) {
        var published = "";
        var infoFile = new File(infoFilePath);
        if (infoFile.exists == true) {
            // read file
            if (infoFile && infoFile.open("r")) {
                while (!infoFile.eof) {
                    var line = infoFile.readln();
                    if (line.startsWith("Published:")) {
                        var pubbool = line.split(": ")[1].bool();
                        if (pubbool == false) {
                            published = "";
                        } else {
                            published = "\u2022";
                        }
                    }
                }
            }
            infoFile.close();
        }

        return published;
    }

    // Build Settings UI
    function productionRender_settings_buildUI(thisObj) {
        var set_pal = new Window("dialog", "Settings", undefined, { resizeable: false });
        if (set_pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + prrData.scriptNameShort + " v" + prrData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + productionRender_localize(prrData.strHelp) + "', alignment:['right','center'], maximumSize:[30,20] }, \
                    }, \
                    network: Panel { \
                        alignment:['fill','center'], \
                        text: '" + productionRender_localize(prrData.strCopyToNetwork) + "', alignment:['fill','top'], \
                        prog: Group { \
                            alignment:['fill','center'], \
                            filler: StaticText { text:'', preferredSize:[80,20] }, \
                            box: Checkbox { text:'  " + productionRender_localize(prrData.strCopyToNetworkShowProgress) + "', preferredSize:[400,20] }, \
                        }, \
                    }, \
                    trello: Panel { \
                        alignment:['fill','center'], \
                        text: '" + productionRender_localize(prrData.strSendToTrello) + "', alignment:['fill','top'], \
                        enable: Group { \
                            alignment:['fill','center'], \
                            filler: StaticText { text:'', preferredSize:[80,20] }, \
                            box: Checkbox { text:'  " + productionRender_localize(prrData.strEnable) + "', preferredSize:[400,20] }, \
                        }, \
                        key: Group { \
                            alignment:['fill','center'], \
                            txt: StaticText { text:'" + productionRender_localize(prrData.strAPIKey) + "', preferredSize:[80,20] }, \
                            box: EditText { alignment:['fill','center'], preferredSize:[400,20] },  \
                        }, \
                        token: Group { \
                            alignment:['fill','center'], \
                            txt: StaticText { text:'" + productionRender_localize(prrData.strAPIToken) + "', preferredSize:[80,20] }, \
                            box: EditText { alignment:['fill','center'], preferredSize:[400,20] },  \
                        }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        saveBtn: Button { text:'" + productionRender_localize(prrData.strSaveBtn) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        exitBtn: Button { text:'" + productionRender_localize(prrData.strExitBtn) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";

            set_pal.grp = set_pal.add(res);

            set_pal.layout.layout(true);
            set_pal.grp.minimumSize = set_pal.grp.size;
            set_pal.layout.resize();
            set_pal.onResizing = set_pal.onResize = function () {
                this.layout.resize();
            }

            set_pal.grp.header.help.onClick = function () {
                alert(productionRender_localize(prrData.strHelpTextSettings), productionRender_localize(prrData.strHelpTitle));
            }

            if (app.settings.haveSetting("ProductionRender", "network_progress_enable")) {
                set_pal.grp.network.prog.box.value = app.settings.getSetting("ProductionRender", "network_progress_enable").bool();
            } else {
                set_pal.grp.network.prog.box.value = false;
            }

            if (app.settings.haveSetting("ProductionRender", "trello_enable")) {
                set_pal.grp.trello.enable.box.value = app.settings.getSetting("ProductionRender", "trello_enable").bool();
            } else {
                set_pal.grp.trello.enable.box.value = false;
            }

            set_pal.grp.trello.key.enabled = set_pal.grp.trello.enable.box.value;
            set_pal.grp.trello.token.enabled = set_pal.grp.trello.enable.box.value;

            if (app.settings.haveSetting("ProductionRender", "trello_key")) {
                set_pal.grp.trello.key.box.text = app.settings.getSetting("ProductionRender", "trello_key");
            }
            if (app.settings.haveSetting("ProductionRender", "trello_token")) {
                set_pal.grp.trello.token.box.text = app.settings.getSetting("ProductionRender", "trello_token");
            }

            set_pal.grp.trello.enable.box.onClick = function () {
                set_pal.grp.trello.key.enabled = set_pal.grp.trello.enable.box.value;
                set_pal.grp.trello.token.enabled = set_pal.grp.trello.enable.box.value;
            }

            set_pal.grp.cmds.saveBtn.onClick = productionRender_doSaveSettings;
            set_pal.grp.cmds.exitBtn.onClick = productionRender_doExitSettings;
        }
        return set_pal;
    }

    // Build Render Previous UI
    function productionRender_renderPrevious_buildUI(thisObj) {
        var rp_pal = new Window("dialog", "Renders", undefined, { resizeable: true });
        if (rp_pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + prrData.scriptNameShort + " v" + prrData.scriptVersion + "', alignment:['fill','center'] }, \
                        status: Button { text:'" + productionRender_localize(prrData.strRefreshStatusBtn) + "', alignment:['right','center'], preferredSize:[-1,20] }, \
                        settings: Button { text:'" + productionRender_localize(prrData.strSettings) + "', alignment:['left','center'], maximumSize:[30,20] }, \
                        help: Button { text:'" + productionRender_localize(prrData.strHelp) + "', alignment:['right','center'], maximumSize:[30,20] }, \
                    }, \
                    table: Group { \
                        alignment:['fill','fill'], \
                        tbl: ListBox { alignment:['fill','fill'], size:[1080,440], properties:{numberOfColumns:8, showHeaders:true, columnTitles: ['', 'Name', 'Time', 'Owner', 'Submitted', 'Type', 'Comment', ''], columnWidths:[25,180,80,80,100,80,500,20]} }, \
                    }, \
                    loader: Group { \
                        orientation: 'column', alignment:['left','bottom'], \
                        bar: Progressbar { text:'Progressbar', minvalue:0, maxvalue:100, preferredSize:[1080,4]},\
                    }, \
                    cmds: Group { \
                        alignment:['fill','bottom'], \
                        rerunBtn: Button { text:'" + productionRender_localize(prrData.strRerunBtn) + "', alignment:['left','bottom'], preferredSize:[-1,20] }, \
                        openBtn: Button { text:'" + productionRender_localize(prrData.strOpenInExplorerBtn) + "', alignment:['left','bottom'], preferredSize:[-1,20] }, \
                        playBtn: Button { text:'" + productionRender_localize(prrData.strPlayPreviewBtn) + "', alignment:['left','bottom'], preferredSize:[-1,20] }, \
                        publishBtn: Button { text:'" + productionRender_localize(prrData.strSendToPublishBtn) + "', alignment:['left','bottom'], preferredSize:[-1,20] }, \
                        exitBtn: Button { text:'" + productionRender_localize(prrData.strExitBtn) + "', alignment:['right','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";

            rp_pal.grp = rp_pal.add(res);

            rp_pal.layout.layout(true);
            rp_pal.grp.minimumSize = rp_pal.grp.size;
            rp_pal.layout.resize();
            rp_pal.onResizing = rp_pal.onResize = function () {
                this.layout.resize();
            }

            rp_pal.grp.header.help.onClick = function () {
                alert(productionRender_localize(prrData.strHelpTextRenderPrevious), productionRender_localize(prrData.strHelpTitle));
            }
            rp_pal.grp.header.status.onClick = productionRender_doRefreshStatus;
            rp_pal.grp.header.settings.onClick = productionRender_settings;

            // populate table
            prrData.renderBatchFiles = getPreviousRenders();
            for (var i = 0; i < prrData.renderBatchFiles.length; i++) {
                // define item
                var tableItem = prrData.renderBatchFiles[i];

                // get status image 
                var statusImage = getRenderStatus(tableItem);

                // get render time
                var infoF = tableItem["render_path"] + "\\" + tableItem["output"] + ".txt";
                var renderTime = getRenderTime(infoF);
                var publishStatus = getPublishStatus(infoF);

                // fill in table
                var myItem = rp_pal.grp.table.tbl.add("item", i);
                myItem.subItems[0].text = tableItem["render_folder_name"];
                myItem.subItems[1].text = renderTime;
                myItem.subItems[2].text = tableItem["owner"];
                myItem.subItems[3].text = tableItem["submit_date"] + " " + tableItem["submit_time"];
                myItem.subItems[4].text = tableItem["task_type"];
                myItem.subItems[5].text = tableItem["comment"];;
                myItem.subItems[6].text = publishStatus;

                // assign status image
                myItem.image = statusImage;
            }

            // buttons
            rp_pal.grp.cmds.rerunBtn.onClick = productionRender_doRerun;
            rp_pal.grp.cmds.openBtn.onClick = productionRender_doOpenInExplorer;
            rp_pal.grp.cmds.playBtn.onClick = productionRender_doPlayPreview
            rp_pal.grp.cmds.publishBtn.onClick = productionRender_doPublish;
            rp_pal.grp.cmds.exitBtn.onClick = productionRender_doExitPrevious;
        }
        return rp_pal;
    }

    // Progressbar function
    //
    function updateProgressbar(pal, minValue, currentValue, maxValue) {
        pal.grp.loader.bar.minvalue = minValue;
        pal.grp.loader.bar.maxvalue = maxValue;
        pal.grp.loader.bar.value = currentValue;
        pal.update();
    }

    // Log function
    //
    // function log(pal, message) {
    //     pal.grp.logger.box.text = message;
    //     pal.update();
    // }

    // Update published
    //
    function updatePublishedColumn(pal, item) {
        var allRenders = pal.grp.table.tbl.items;
        var publishedRender = item;

        // for (var i = 0; i < allRenders.length; i++) {
        //     allRenders[i].subItems[5].text = "";
        // }

        publishedRender.subItems[6].text = "\u2022";

        pal.grp.table.tbl.selection = 0;
        pal.grp.table.tbl.selection = item;
    }

    // Build UI
    function productionRender_buildUI(thisObj) {
        var pal = new Window("dialog", prrData.scriptName, undefined, { resizeable: false });
        if (pal !== null) {
            var head =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + prrData.scriptNameShort + " v" + prrData.scriptVersion + "', alignment:['fill','center'] }, \
                        previousBtn: Button { text:'" + productionRender_localize(prrData.strPrevious) + "', preferredSize:[-1,20], alignment:['right','center'] }, \
                        help: Button { text:'" + productionRender_localize(prrData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                }, \
            }";

            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
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
                        cont: Group { \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'  " + productionRender_localize(prrData.strContinueOnMissing) + "', value:true, alignment:['fill','top'] }, \
                        }, \
                        del: Group { \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'  " + productionRender_localize(prrData.strDeleteSequence) + "', value:false, alignment:['fill','top'] }, \
                        }, \
                        open: Group { \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'  " + productionRender_localize(prrData.strOpenInExplorer) + "', value:false, alignment:['fill','top'] }, \
                        }, \
                        reuse: Group { \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'  " + productionRender_localize(prrData.strReuse) + "', value:false, alignment:['fill','top'] }, \
                        }, \
                        mp: Group { \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'  " + productionRender_localize(prrData.strMultiprocessing) + "', value:false, alignment:['fill','top'] }, \
                        }, \
                    }, \
                    outputModule: Panel { \
                        alignment:['fill','top'], \
                        text: '" + productionRender_localize(prrData.strOutputModule) + "', alignment:['fill','top'] \
                        omv: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + productionRender_localize(prrData.strVideo) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { helpTip: '" + productionRender_localize(prrData.strOMVHelpTip) + "',alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                        oma: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + productionRender_localize(prrData.strAudio) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { helpTip: '" + productionRender_localize(prrData.strOMAHelpTip) + "',alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                    }, \
                    comment: Panel { \
                        alignment:['fill','top'], \
                        text: '" + productionRender_localize(prrData.strComment) + "', alignment:['fill','top'] \
                        com: Group { \
                            alignment:['fill','top'], \
                            box: EditText { alignment:['fill','center'], properties:{multiline:true}, preferredSize:[-1,60] },  \
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

            pal.hdr = pal.add(head);
            pal.img = pal.add("image", undefined, prrData.headerImage);
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function () {
                this.layout.resize();
            }

            pal.hdr.header.help.onClick = function () {
                alert(prrData.scriptTitle + "\n" + productionRender_localize(prrData.strHelpText), productionRender_localize(prrData.strHelpTitle));
            }

            pal.hdr.header.previousBtn.onClick = productionRender_renderPrevious;

            if (app.settings.haveSetting("ProductionRender", "cont")) {
                pal.grp.opts.cont.box.value = app.settings.getSetting("ProductionRender", "cont").bool();
            }
            if (app.settings.haveSetting("ProductionRender", "del")) {
                pal.grp.opts.del.box.value = app.settings.getSetting("ProductionRender", "del").bool();
            }
            if (app.settings.haveSetting("ProductionRender", "open")) {
                pal.grp.opts.open.box.value = app.settings.getSetting("ProductionRender", "open").bool();
            }
            if (app.settings.haveSetting("ProductionRender", "reuse")) {
                pal.grp.opts.reuse.box.value = app.settings.getSetting("ProductionRender", "reuse").bool();
            }
            if (app.settings.haveSetting("ProductionRender", "mp")) {
                pal.grp.opts.mp.box.value = app.settings.getSetting("ProductionRender", "mp").bool();
            }

            // for (var i = 0; i < pr_settings.length; i++) {
            //     if (app.settings.haveSetting("ProductionRender", pr_settings[i])) {
            //         var setting = app.settings.getSetting("ProductionRender", pr_settings[i]);
            //         alert(setting);
            //         // pal.grp.opts.pr_settings[i].box.value = setting;
            //     }
            // }

            pal.grp.opts.cont.box.onClick = function () {
                app.settings.saveSetting("ProductionRender", "cont", pal.grp.opts.cont.box.value);
            }
            pal.grp.opts.del.box.onClick = function () {
                app.settings.saveSetting("ProductionRender", "del", pal.grp.opts.del.box.value);
            }
            pal.grp.opts.open.box.onClick = function () {
                app.settings.saveSetting("ProductionRender", "open", pal.grp.opts.open.box.value);
            }
            pal.grp.opts.reuse.box.onClick = function () {
                app.settings.saveSetting("ProductionRender", "reuse", pal.grp.opts.reuse.box.value);
            }
            pal.grp.opts.mp.box.onClick = function () {
                app.settings.saveSetting("ProductionRender", "mp", pal.grp.opts.mp.box.value);
            }

            // pal.grp.opts.cont.box.value = true;
            // pal.grp.opts.del.box.value = true;
            // pal.grp.opts.open.box.value = true;

            // pal.grp.opts.reuse.box.value = false;
            // pal.grp.opts.mp.box.value = false;

            var rsItems = prrData.rsTemplates;
            for (var i = 0; i < rsItems.length; i++) {
                pal.grp.opts.rset.list.add("item", rsItems[i]);
            }
            pal.grp.opts.rset.list.selection = prrData.rsTemplates.indexOf("Best Settings");
            pal.grp.opts.rset.enabled = true;

            var timeItems = productionRender_localize(prrData.strTimeOpts);
            for (var i = 0; i < timeItems.length; i++) {
                pal.grp.opts.time.list.add("item", timeItems[i]);
            }
            pal.grp.opts.time.list.selection = 0;
            pal.grp.opts.time.enabled = true;

            var omItems = prrData.omTemplates;
            for (var i = 0; i < omItems.length; i++) {
                pal.grp.outputModule.omv.list.add("item", omItems[i]);
            }
            pal.grp.outputModule.omv.list.selection = prrData.omTemplates.indexOf("PNG Seq Colors");
            pal.grp.outputModule.omv.enabled = false;

            var omItems = prrData.omTemplates;
            for (var i = 0; i < omItems.length; i++) {
                pal.grp.outputModule.oma.list.add("item", omItems[i]);
            }
            pal.grp.outputModule.oma.list.selection = prrData.omTemplates.indexOf("WAV");
            pal.grp.outputModule.oma.enabled = false;

            pal.grp.comment.com.box.text = "Your comment here...";
            pal.grp.comment.com.box.active = true;

            pal.grp.outputPath.main.btn.onClick = function () {
                productionRender_doBrowse();
            }

            var outputPath = locateRenderFolder();
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
        return "\"" + string + "\"";
    }

    // Leading zeros padding
    function pad(num, size) {
        var s = "000000000" + num;
        return s.substr(s.length - size);
    }

    // Try int pars or return defaultValue
    function TryParseInt(str, defaultValue) {
        var retValue = defaultValue;
        if (str !== null) {
            if (str.length > 0) {
                if (!isNaN(str)) {
                    retValue = parseInt(str, 10);
                }
            }
        }
        return retValue;
    }

    // Locate metadata.xml in standard structure
    function locateMetadataFile() {
        var metadataFile = new File();
        var projectRoot = prrData.projectRoot;
        var projectFolder = projectRoot.split('\\').reverse()[1];
        if (projectFolder == "after") {
            var mFile = new File(app.project.file.parent.parent.toString() + "/info/metadata.xml");
            if (mFile.exists == true) {
                metadataFile = mFile;
            }
        }
        return metadataFile;
    }

    // Locate startNewTaskStructure.xml in standard structure
    function locateStartNewTaskStructureFile() {
        var startNewTaskStructureFile = new File();
        var projectRoot = prrData.projectRoot;
        var projectFolder = projectRoot.split('\\').reverse()[1];
        if (projectFolder == "after") {
            var sFile = new File(app.project.file.parent.parent.parent.parent.toString() + "/startNewTaskStructure.xml");
            if (sFile.exists == true) {
                startNewTaskStructureFile = sFile;
            }
        } else if (projectRoot.startsWith("D:\\epx\\")) {
            var sFile = new File("D:/epx/startNewTaskStructure.xml");
            if (sFile.exists == true) {
                startNewTaskStructureFile = sFile;
            }
        }
        return startNewTaskStructureFile;
    }

    // Locate render folder in standard structure
    function locateRenderFolder() {
        var renderPathOut;
        var projectRoot = prrData.projectRoot;
        var projectFolder = projectRoot.split('\\').reverse()[1];
        if (projectFolder == "after") {
            var renderPath = new Folder(app.project.file.parent.parent.toString() + "/render");
            if (renderPath.exists == true) {
                renderPathOut = renderPath.fsName;
            }
        } else if (projectFolder == "work") {
            var renderPath = new Folder(app.project.file.parent.toString());
            if (renderPath.exists == true) {
                renderPathOut = renderPath.fsName;
            }
        } else {
            alert(productionRender_localize(prrData.strStandardStructureErr));
            renderPathOut = prrData.projectRoot;
        }

        if (renderPathOut == undefined) {
            renderPathOut = "";
        }

        return renderPathOut;
    }

    // Check if active item is top item on hierarchy
    function checkIfTopComp() {
        if (app.project.items.length > 0) {
            for (var i = 1; i <= app.project.items.length; i++) {
                var currentItem = app.project.items[i];
                if (currentItem instanceof CompItem) {
                    if (currentItem.layers.length > 0) {
                        for (var j = 1; j <= currentItem.layers.length; j++) {
                            if (currentItem.layers[j].source instanceof CompItem) {
                                if (currentItem.layers[j].source.id == prrData.activeItem.id) {
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    // Check if active item is top item on hierarchy
    function getTypeOfTask() {
        var taskType;
        var getParentA = new Folder(app.project.file.parent.toString());
        var getParentF = getParentA.fsName.split('\\').reverse()[0];

        if (getParentF == "after") {
            taskType = "cinematic";
        } else if (getParentF == "work") {
            taskType = "animatic";
        } else {
            taskType = "irregular";
        }

        return taskType;
    }

    // Get files recursively
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
        var setsFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(toolboy)/sets");
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

    // Audio timecode exports
    // TODO: reimplement as lib
    function productionRender_exportTimecode(activecomp, filepath) {

        function compare(a, b) {
            return a[1] - b[1];
        }

        function compensateTimeRemap(comp, index, value) {
            var framerate = comp.frameRate;
            var layer = comp.layer(index);
            var timeRemapValue = layer.property("ADBE Time Remapping");
            var currentTime = 0;
            var oneFrame = 1 / framerate;
            while (timeRemapValue.valueAtTime(currentTime, false) < value) {
                currentTime = currentTime + oneFrame;
            }
            return currentTime;
        }

        var audioLayersDataDirty = [];
        function getAudioTimeRecursively(timeRemap, parentComp, childIndex, childComp, timeOffset, timeStretch) {
            var offsetFloat = parseFloat(timeOffset);
            var currentLayer;
            for (var i = 1; i <= childComp.layers.length; i++) {
                currentLayer = childComp.layers[i];
                if (!(currentLayer.source instanceof CompItem) && (currentLayer.source instanceof FootageItem) && (currentLayer instanceof AVLayer) && (currentLayer.source.hasAudio == true) && (currentLayer.audioEnabled == true) && (currentLayer.source.hasVideo == false)) {
                    var sourceName = currentLayer.source.name;
                    var layerStartTime = parseFloat(currentLayer.inPoint);
                    var layerEndTime = parseFloat(currentLayer.outPoint);
                    if (timeRemap == true) {
                        var startTime = compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.inPoint)) * timeStretch + offsetFloat;
                        var endTime = compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.outPoint)) * timeStretch + offsetFloat;
                    } else {
                        var startTime = layerStartTime * timeStretch + offsetFloat;
                        var endTime = layerEndTime * timeStretch + offsetFloat;
                    }
                    audioLayersDataDirty.push([sourceName, startTime.toFixed(2), endTime.toFixed(2)]);
                } else if ((currentLayer.source instanceof CompItem) && (currentLayer.audioEnabled == true)) {
                    var timeRemapCheck = false;
                    var getParentComp = childComp;
                    var getChildIndex = currentLayer.index;
                    var stretch = (currentLayer.stretch / 100) * timeStretch;
                    var offset;
                    if (currentLayer.timeRemapEnabled == true) {
                        timeRemapCheck = true;
                        offset = timeOffset;
                    } else {
                        offset = currentLayer.startTime + timeOffset;
                    }
                    getAudioTimeRecursively(timeRemapCheck, getParentComp, getChildIndex, currentLayer.source, offset, stretch);
                }
            }
        }

        //get audio layers information
        getAudioTimeRecursively(false, activecomp, 0, activecomp, 0, 1);

        var layersDataDirty = audioLayersDataDirty;
        var layersDataUnique = [];
        for (var i = 0; i < layersDataDirty.length; i++) {
            var flag = true;
            for (var j = 0; j < layersDataUnique.length; j++) {
                if (layersDataUnique[j][0] == layersDataDirty[i][0]) {
                    flag = false;
                }
            }
            if (flag == true) {
                layersDataUnique.push(layersDataDirty[i]);
            }
        }
        var audioLayersData = layersDataUnique.sort(compare);

        // export data to file
        var audioTimecode_text = new File(filepath);

        audioTimecode_text.open("w");
        if (audioLayersData.length != 0) {
            for (var i = 0; i < audioLayersData.length; i++) {
                audioTimecode_text.writeln("Filename: " + audioLayersData[i][0]);
                audioTimecode_text.writeln("Timecode: " + audioLayersData[i][1] + " --> " + audioLayersData[i][2] + "\n");
            }
            audioTimecode_text.writeln("----------------------------------------" + "\n");
        } else {
            audioTimecode_text.writeln("Note: Could not find any active audio." + "\n");
            audioTimecode_text.writeln("----------------------------------------" + "\n");
        }
        audioTimecode_text.close();
    }

    // Main
    function productionRender_main(path) {
        // get path
        var usePath = path;

        // Add black solid at the end to avoid transparency issues (temporary solution)
        var bgSolid = prrData.activeItem.layers.addSolid([0, 0, 0], "background", prrData.activeItemWidth, prrData.activeItemHeight, prrData.activeItemPixelAspect, prrData.timeSpanDuration);
        bgSolid.moveToEnd()

        // Add to render queue
        var renderQueueItemVideo = app.project.renderQueue.items.add(prrData.activeItem);
        var renderQueueItemVideoIndex = app.project.renderQueue.numItems;
        var renderQueueItemAudio = app.project.renderQueue.items.add(prrData.activeItem);
        var renderQueueItemAudioIndex = app.project.renderQueue.numItems;

        // Assign Render Settings template
        renderQueueItemVideo.applyTemplate(prrPal.grp.opts.rset.list.selection);
        renderQueueItemVideo.setSetting("Skip Existing Files", true);
        renderQueueItemAudio.applyTemplate(prrPal.grp.opts.rset.list.selection);

        // Get Render Settings resolution
        // activeItem.resolutionFactor
        var itemHeight;
        var itemWidth;
        var itemResolution = renderQueueItemVideo.getSetting("Resolution");
        var itemResolutionP = itemResolution.substring(1, itemResolution.length - 1);
        var itemResolutionJSON = JSON.parse(itemResolutionP);

        if (itemResolutionJSON["x"] == 0) {
            itemHeight = prrData.activeItemHeight / prrData.activeItem.resolutionFactor[0];
        } else {
            itemHeight = prrData.activeItemHeight / itemResolutionJSON["x"];
        }
        itemHeight = Math.round(itemHeight / 2) * 2;

        if (itemResolutionJSON["y"] == 0) {
            itemWidth = prrData.activeItemWidth / prrData.activeItem.resolutionFactor[1];
        } else {
            itemWidth = prrData.activeItemWidth / itemResolutionJSON["y"];
        }
        itemWidth = Math.round(itemWidth / 2) * 2;

        // Assign Output Module template
        renderQueueItemVideo.outputModules[1].applyTemplate("PNG Seq Colors");
        renderQueueItemAudio.outputModules[1].applyTemplate("WAV");

        // Assign Time Span choice
        var startFrame;
        var endFrame;
        if (prrPal.grp.opts.time.list.selection.index == 1) {
            // work area
            startFrame = prrData.workAreaStart * prrData.frameRate;
            endFrame = (prrData.workAreaStart + prrData.workAreaDuration) * prrData.frameRate;

            renderQueueItemVideo.timeSpanStart = prrData.workAreaStart;
            renderQueueItemVideo.timeSpanDuration = prrData.workAreaDuration;

            renderQueueItemAudio.timeSpanStart = prrData.workAreaStart;
            renderQueueItemAudio.timeSpanDuration = prrData.workAreaDuration;
        } else {
            // length of comp
            startFrame = prrData.timeSpanStart * prrData.frameRate;
            endFrame = (prrData.timeSpanStart + prrData.timeSpanDuration) * prrData.frameRate;

            renderQueueItemVideo.timeSpanStart = prrData.timeSpanStart;
            renderQueueItemVideo.timeSpanDuration = prrData.timeSpanDuration;

            renderQueueItemAudio.timeSpanStart = prrData.timeSpanStart;
            renderQueueItemAudio.timeSpanDuration = prrData.timeSpanDuration;
        }

        var renderFrames = endFrame - startFrame;

        var mpString = "";
        if (prrPal.grp.opts.mp.box.value == true) {
            mpString = " -mp";
        }
        var contOnMissingString = "";
        if (prrPal.grp.opts.cont.box.value == true) {
            contOnMissingString = " -continueOnMissingFootage";
        }
        var reuseInstance = "";
        if (prrPal.grp.opts.reuse.box.value == true) {
            reuseInstance = " -reuse";
        }

        // Define render folder
        var foldersInPath = new Folder(usePath).getFiles(returnOnlyFolders);
        var folderIncrement = 0;
        for (var i = 0; i < foldersInPath.length; i++) {
            var pi = foldersInPath[i].toString();
            var piFold = pi.match(/([^\/]*)\/*$/)[1];
            var ni = piFold.substr(0, prrData.activeItemName.length);
            var niAfter = piFold.substr(prrData.activeItemName.length, 2);
            if ((ni == prrData.activeItemName) && (niAfter == "_r")) {
                var fi = pi.substr(pi.length - 3);
                var fiInt = TryParseInt(fi, null);
                if (!(fiInt == null) && (fiInt > folderIncrement)) {
                    folderIncrement = fiInt;
                }
            }
        }
        var folderIncrementString = pad(folderIncrement + 1, 3);

        // Create render folder
        var renderFolderName = prrData.activeItemName + "_r" + folderIncrementString;
        var renderFolder = new Folder(usePath.toString() + "\\" + renderFolderName);
        renderFolder.create();

        // Create sequence Folder
        var sequenceFolder = new Folder(renderFolder.fsName + "\\" + prrData.activeItemName);
        sequenceFolder.create();

        // Output
        var outputSeqPath = sequenceFolder.fsName + "\\" + prrData.activeItemName + "_[#####]";
        var outputAudioPath = renderFolder.fsName + "\\" + prrData.activeItemName + "";

        renderQueueItemVideo.outputModules[1].file = new File(outputSeqPath);
        renderQueueItemAudio.outputModules[1].file = new File(outputAudioPath);

        // Save the project
        app.project.save();

        // Export audio timecode data
        var timecodeFilePath = renderFolder.fsName + "\\" + prrData.activeItemName + ".txt";
        var timecodeFilePathFile = new File(timecodeFilePath);
        productionRender_exportTimecode(prrData.activeItem, timecodeFilePath);

        // Get frame path and ogv output path
        var sequenceFramePath = sequenceFolder.fsName + "\\" + prrData.activeItemName + "_%%05d.png";
        var fileOutPath = renderFolder.fsName + "\\" + prrData.activeItemName;

        // get metadata
        var renderGameName;
        var renderTaskName;
        var matadataFile = locateMetadataFile();
        if (matadataFile.exists == true) {
            // parse xml file
            matadataFile.open("r");
            var metaxmlString = matadataFile.read();
            var metaXML = new XML(metaxmlString);
            matadataFile.close();

            // get elements
            renderGameName = metaXML.xpath("data/game[1]").toString();
            renderTaskName = metaXML.xpath("data/task[1]").toString();
        } else {
            // try to figure out game and task from path
            var projectRoot = prrData.projectRoot;
            if (projectRoot.startsWith("D:\\epx\\")) {
                var splited = projectRoot.split("\\");
                renderGameName = splited[2];
                renderTaskName = splited[3];
                var promptProjInfo = confirm("Folder structure is not regular. Please confirm if this information is correct:\n\nGame Name: " + renderGameName + "\nTask Name: " + renderTaskName);
                if (promptProjInfo == false) {
                    renderGameName = "Undefined";
                    renderTaskName = "Undefined";
                }
            } else {
                renderGameName = "Undefined";
                renderTaskName = "Undefined";
            }
        }

        // Write bat file
        var aerenderEXE = new File(Folder.appPackage.fullName + "/aerender.exe");

        // Not needed any more
        // var zipScript = new File(prrData.etcFolder.fsName + "/zipscript.vbs");

        // Datetime
        var current_date = new Date(Date(0));
        var day = ('0' + current_date.getDate()).slice(-2);
        var month = ('0' + (current_date.getMonth() + 1)).slice(-2);
        var year = current_date.getFullYear().toString().slice(-2);
        var hours = ('0' + current_date.getHours()).slice(-2);
        var minutes = ('0' + current_date.getMinutes()).slice(-2);
        var seconds = ('0' + current_date.getSeconds()).slice(-2);

        // Define bat variables
        var renderName = prrData.projectName;
        var renderOutput = prrData.activeItemName;
        var renderSubmitDate = "" + day + "-" + month + "-" + year;
        var renderSubmitTime = "" + hours + ":" + minutes;
        var renderOwner = $.getenv("COMPUTERNAME");
        var renderComment = prrPal.grp.comment.com.box.text.replace(/[^a-z0-9\ \.]/gi, '');

        // get task type
        var taskType = getTypeOfTask();
        if (taskType == "cinematic") {
            netRenderFolder = "render";
        } else if (taskType == "animatic") {
            netRenderFolder = "info";
        } else {
            netRenderFolder = "render_irregular";
        }

        // Network variables
        var localRenderOnly = false;
        var structureXMLFile = locateStartNewTaskStructureFile();
        if (structureXMLFile.exists == false) {
            var localRenderOnly = true;
        } else {
            // parse xml file
            var xmlFile = new File(structureXMLFile.fsName);
            xmlFile.open("r");
            var xmlString = xmlFile.read();
            var myXML = new XML(xmlString);
            xmlFile.close();

            // read network root from xml file
            var networkRoot = myXML.@network.toString();

            // define network location for given project
            var get_gamename = renderGameName;
            var get_taskname = renderTaskName;

            var networkRootFolder = new Folder(networkRoot);
            if (networkRootFolder.exists == false) {
                alert(productionRender_localize(prrData.strNetworkDoesNotExist));
                localRenderOnly = true;
            } else {
                var networkPath = new Folder(networkRoot + "\\" + get_gamename + "\\" + get_taskname);
                if (networkPath.exists == false) {
                    alert(productionRender_localize(prrData.strNetworkPathDoesNotExist));
                    localRenderOnly = true;
                }
            }
            var renderDirLoc = renderFolder.fsName;
            var renderDirNet = networkRoot + "\\" + get_gamename + "\\" + get_taskname + "\\" + netRenderFolder + "\\" + renderFolderName;
            var previewFileLoc = renderOutput + "_preview.mp4";
        }

        // Define bat content
        var batContent = "@echo off\r\n";
        batContent += "rem Production Render for After Effects\r\n";
        batContent += "rem v" + prrData.scriptVersion + "\r\n";

        batContent += "rem info start\r\n";
        batContent += "set \"RENDER_NAME=" + renderName + "\"" + "\r\n";
        batContent += "set \"RENDER_OUTPUT=" + renderOutput + "\"" + "\r\n";
        batContent += "set \"RENDER_FOLDER_NAME=" + renderFolderName + "\"" + "\r\n";
        batContent += "set \"RENDER_SUBMIT_DATE=" + renderSubmitDate + "\"" + "\r\n";
        batContent += "set \"RENDER_SUBMIT_TIME=" + renderSubmitTime + "\"" + "\r\n";
        batContent += "set \"RENDER_OWNER=" + renderOwner + "\"" + "\r\n";
        batContent += "set \"RENDER_COMMENT=" + renderComment + "\"" + "\r\n";
        batContent += "set \"GAME_NAME=" + renderGameName + "\"" + "\r\n";
        batContent += "set \"TASK_NAME=" + renderTaskName + "\"" + "\r\n";
        batContent += "set \"TASK_TYPE=" + taskType + "\"" + "\r\n";
        batContent += "rem info end\r\n";

        batContent += "rem print info start\r\n";
        batContent += "echo INFO:  Name: %RENDER_NAME%\r\n";
        batContent += "echo INFO:  Submit Date: %RENDER_SUBMIT_DATE%\r\n";
        batContent += "echo INFO:  Submit Time: %RENDER_SUBMIT_TIME%\r\n";
        batContent += "echo INFO:  Owner: %RENDER_OWNER%\r\n";
        batContent += "echo INFO:  Comment: %RENDER_COMMENT%\r\n";
        batContent += "rem print info end\r\n";

        batContent += "rem get start time\r\n";
        batContent += "for /F \"tokens=1-4 delims=:.,\" %%a in (\"%time%\") do (\r\n";
        batContent += "   set /A \"start=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100\"\r\n";
        batContent += ")\r\n";

        batContent += "echo Starting...\r\n";

        batContent += "title Please Wait\r\n";
        batContent += "set RENDER_PATH=" + addQuotes(renderFolder.fsName) + "\r\n";
        batContent += "set RENDER_SEQEUNCE_PATH=" + addQuotes(sequenceFolder.fsName) + "\r\n";
        batContent += "if not exist %RENDER_SEQEUNCE_PATH% mkdir %RENDER_SEQEUNCE_PATH%\r\n";

        batContent += "cd %RENDER_PATH%\r\n";
        batContent += "set ffmpeg=" + prrData.ffmpegPath.fsName + "\r\n";
        batContent += "set ffmpeg2theora=" + prrData.ffmpeg2theoraPath.fsName + "\r\n";

        //batContent += "if exist NUL (del NUL)\r\n";
        batContent += "if exist ffmpeg2pass-0.log (del ffmpeg2pass-0.log)\r\n";
        batContent += "if exist ffmpeg2pass-0.log.mbtree (del ffmpeg2pass-0.log.mbtree)\r\n";
        batContent += "if exist log-0.log (del log-0.log)\r\n";
        batContent += "if exist log-0.log.mbtree (del log-0.log.mbtree)\r\n";

        batContent += "title Rendering Video: " + renderFrames + " frames\r\n";
        batContent += "start \"\" /b " + "/normal" + " /wait " +
            addQuotes(aerenderEXE.fsName) + " -project " + addQuotes(prrData.projectFile.fsName) + " -rqindex " + renderQueueItemVideoIndex + " -sound OFF" + mpString + contOnMissingString + reuseInstance + "\r\n";
        batContent += "echo Rendering Finished\r\n";

        batContent += "title Rendering Audio: " + renderFrames + " frames\r\n";
        batContent += "start \"\" /b " + "/normal" + " /wait " +
            addQuotes(aerenderEXE.fsName) + " -project " + addQuotes(prrData.projectFile.fsName) + " -rqindex " + renderQueueItemAudioIndex + " -sound OFF" + mpString + contOnMissingString + reuseInstance + "\r\n";
        batContent += "echo Rendering Finished\r\n";

        batContent += "title Converting, Please Wait\r\n";

        batContent += "echo.\r\n";
        batContent += "echo [Converting] PC Audio\r\n";
        batContent += "\"%ffmpeg%\" -y -i " + addQuotes(fileOutPath + ".wav") + " -vn -c:a libvorbis -q:a 10 " + addQuotes(fileOutPath + ".ogg") + "\r\n";

        // depreciated
        // batContent += "echo.\r\n";
        // batContent += "echo [Converting] Lossless Video OLD (will be deprecated)\r\n";
        // batContent += "\"%ffmpeg%\" -y -start_number " + startFrame + " -framerate " + prrData.frameRate + " -i " + addQuotes(sequenceFramePath) + " -i " + addQuotes(fileOutPath + ".wav") + " -r "
        //     + prrData.frameRate + " -c:v libx264 -preset veryslow -pix_fmt yuv420p -qp 0 -c:a aac -strict -2 -b:a 128k " + addQuotes(fileOutPath + "_lossless.mp4") + "\r\n";

        batContent += "echo.\r\n";
        batContent += "echo [Converting] Lossless Video\r\n";
        batContent += "\"%ffmpeg%\" -y -start_number " + startFrame + " -framerate " + prrData.frameRate + " -i " + addQuotes(sequenceFramePath) + " -i " + addQuotes(fileOutPath + ".wav") + " -r "
            + prrData.frameRate + " -c:v libx264 -pix_fmt yuv420p -preset slow -tune animation -x264opts keyint=1 -crf 0 -c:a aac -strict -2 -b:a 128k " + addQuotes(fileOutPath + "_lossless.mp4") + "\r\n";

        // ogv conversion using ffmpeg, depreciated in favour of ffmpeg2theora
        // batContent += "echo.\r\n";
        // batContent += "echo [Converting] PC Video\r\n";
        // batContent += "\"%ffmpeg%\" -y -start_number " + startFrame + " -framerate " + prrData.frameRate + " -i " + addQuotes(sequenceFramePath) + " -r " + prrData.frameRate + " -c:v libtheora -pix_fmt yuv420p -qscale:v 8 -an " + addQuotes(fileOutPath + ".ogv") + "\r\n";

        batContent += "echo.\r\n";
        batContent += "echo [Converting] PC Video\r\n";
        batContent += "\"%ffmpeg2theora%\" " + addQuotes(fileOutPath + "_lossless.mp4") + " --videoquality 8 --noaudio -o " + addQuotes(fileOutPath + ".ogv") + "\r\n";

        batContent += "echo.\r\n";
        batContent += "echo [Converting] iOS Video\r\n";
        batContent += "\"%ffmpeg%\" -y  -start_number " + startFrame + " -framerate " + prrData.frameRate + " -i " + addQuotes(sequenceFramePath) + " -r " + prrData.frameRate + " -c:v libx264 -preset slow -pix_fmt yuv420p -profile:v baseline -level 3.0 -an " +
            addQuotes(fileOutPath + ".mp4") + "\r\n";

        batContent += "echo.\r\n";
        batContent += "echo [Converting] Preview Video\r\n";
        batContent += "\"%ffmpeg%\" -y -start_number " + startFrame + " -framerate " + prrData.frameRate + " -i " + addQuotes(sequenceFramePath) + " -r " + prrData.frameRate + " -c:v libx264 -preset slow -pix_fmt yuv420p -b:v 555k -minrate 555k -maxrate 555k -bufsize 555k -pass 1 -passlogfile log -an -f mp4 NUL && " + "\"%ffmpeg%\" -y -start_number " + startFrame + " -framerate " + prrData.frameRate + " -i " +
            addQuotes(sequenceFramePath) + " -i " + addQuotes(fileOutPath + ".wav") + " -r " + prrData.frameRate + " -c:v libx264 -preset slow -pix_fmt yuv420p -b:v 555k -minrate 555k -maxrate 555k -bufsize 555k -pass 2 -passlogfile log -c:a aac -strict -2 -b:a 128k " + addQuotes(fileOutPath + "_preview.mp4") + "\r\n";

        batContent += "echo Converting Finished\r\n";

        batContent += "cd %RENDER_PATH%\r\n";
        batContent += "if exist ffmpeg2pass-0.log (del ffmpeg2pass-0.log)\r\n";
        batContent += "if exist ffmpeg2pass-0.log.mbtree (del ffmpeg2pass-0.log.mbtree)\r\n";
        batContent += "if exist log-0.log (del log-0.log)\r\n";
        batContent += "if exist log-0.log.mbtree (del log-0.log.mbtree)\r\n";
        if (prrPal.grp.opts.del.box.value == true) {
            batContent += "rmdir /s /q " + addQuotes(sequenceFolder.fsName) + "\r\n";
        }
        batContent += "echo Cleanup Finished\r\n";
        if (prrPal.grp.opts.open.box.value == true) {
            batContent += "%SystemRoot%\\explorer.exe " + addQuotes(renderFolder.fsName) + "\r\n";
        }
        batContent += "timeout 1 > NUL\r\n";
        batContent += "title Done\r\n";

        // copy to network
        if (localRenderOnly == false) {
            batContent += "echo Copying preview file to network..\r\n";
            batContent += "set \"renderDirNet=" + renderDirNet + "\"" + "\r\n";
            batContent += "set \"renderDirLoc=" + renderDirLoc + "\"" + "\r\n";
            batContent += "set \"previewFileLoc=" + previewFileLoc + "\"" + "\r\n";
            batContent += "if exist \"%renderDirNet%\" (del \"%renderDirNet%\")\r\n";
            batContent += "mkdir \"%renderDirNet%\"\r\n";
            batContent += "robocopy \"%renderDirLoc%\" \"%renderDirNet%\" \"%previewFileLoc%\"\r\n";
            batContent += "echo Copying Done\r\n";
            batContent += "echo.\r\n";
            batContent += "echo.\r\n";
        }

        // print info
        batContent += "rem print info start\r\n";
        batContent += "echo INFO:  Name: %RENDER_NAME%\r\n";
        batContent += "echo INFO:  Submit Date: %RENDER_SUBMIT_DATE%\r\n";
        batContent += "echo INFO:  Submit Time: %RENDER_SUBMIT_TIME%\r\n";
        batContent += "echo INFO:  Owner: %RENDER_OWNER%\r\n";
        batContent += "echo INFO:  Comment: %RENDER_COMMENT%\r\n";
        batContent += "rem print info end\r\n";
        batContent += "echo Production Render Done\r\n";

        // time and msgbox
        batContent += "rem get end time\r\n";
        batContent += "for /F \"tokens=1-4 delims=:.,\" %%a in (\"%time%\") do (\r\n";
        batContent += "   set /A \"end=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100\"\r\n";
        batContent += ")\r\n";
        batContent += "rem get elapsed time\r\n";
        batContent += "set /A elapsed=end-start\r\n";
        batContent += "set /A hh=elapsed/(60*60*100), rest=elapsed%%(60*60*100), mm=rest/(60*100), rest%%=60*100, ss=rest/100\r\n";
        batContent += "if %mm% lss 10 set mm=0%mm%\r\n";
        batContent += "if %ss% lss 10 set ss=0%ss%\r\n";
        batContent += "set RENDER_TIME=%hh%:%mm%:%ss%\r\n";

        batContent += "@echo RenderTime: %RENDER_TIME%>>" + timecodeFilePathFile.fsName + "\r\n";
        batContent += "@echo Published: false>>" + timecodeFilePathFile.fsName + "\r\n";

        batContent += "rem show message to the user\r\n";
        batContent += "echo msgbox Replace(\"Project:  %RENDER_NAME%\\nTime:     %RENDER_TIME%\", \"\\n\", vbLf), 64, \"Production Render\" > %tmp%\\prmsgtmp.vbs\r\n";
        batContent += "cscript /nologo %tmp%\\prmsgtmp.vbs\r\n";
        batContent += "del %tmp%\\prmsgtmp.vbs\r\n";
        batContent += "echo Exiting...\r\n";

        var batFile = new File(app.project.file.fsName.replace(".aepx", ".bat").replace(".aep", ".bat"));
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
        app.project.renderQueue.item(renderQueueItemAudioIndex).remove();
        app.project.renderQueue.item(renderQueueItemVideoIndex).remove();

        // Remove background layer
        bgSolid.remove();

        // Close interface
        app.executeCommand(app.findMenuCommandId("Increment and Save"))
        prrPal.close();
    }

    // Execute
    function productionRender_doExecute() {
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
                var prompt = confirm(productionRender_localize(prrData.strPathErr));
                if (prompt == false) {
                    return;
                }
                usePath = prrData.outputPath;
            }
        }

        var saveAction = confirm(productionRender_localize(prrData.strSaveActionMsg));
        if (saveAction == true) {
            app.beginUndoGroup(prrData.scriptName);
            productionRender_main(usePath);
            app.endUndoGroup();
            prrPal.close();
        } else {
            return;
        }
    }

    function productionRender_doCancel() {
        prrPal.close();
    }

    //
    // settings
    //

    function productionRender_settings() {
        // Build and show the floating palette
        pprSetPal = productionRender_settings_buildUI();
        if (pprSetPal !== null) {
            if (pprSetPal instanceof Window) {
                // Show the palette
                pprSetPal.center();
                pprSetPal.show();
            } else {
                pprSetPal.layout.layout(true);
            }
        }
    }

    function productionRender_doSaveSettings() {
        var netprogress, trello, key, token;

        netprogress = pprSetPal.grp.network.prog.box.value;
        trello = pprSetPal.grp.trello.enable.box.value;
        key = pprSetPal.grp.trello.key.box.text;
        token = pprSetPal.grp.trello.token.box.text;

        app.settings.saveSetting("ProductionRender", "network_progress_enable", netprogress);
        app.settings.saveSetting("ProductionRender", "trello_enable", trello);
        app.settings.saveSetting("ProductionRender", "trello_key", key);
        app.settings.saveSetting("ProductionRender", "trello_token", token);

        pprSetPal.close();
    }

    function productionRender_doExitSettings() {
        pprSetPal.close();
    }

    //
    // previous renders
    //
    function productionRender_renderPrevious() {
        // Build and show the floating palette
        prevPal = productionRender_renderPrevious_buildUI();
        if (prevPal !== null) {
            if (prevPal instanceof Window) {
                // Show the palette
                prevPal.center();
                prevPal.show();
            } else {
                prevPal.layout.layout(true);
            }
        }
    }

    function productionRender_doExitPrevious() {
        prevPal.close();
    }

    function productionRender_doRerun() {
        // get selected
        var selectedRender = prevPal.grp.table.tbl.selection;

        // check if anything is selected
        if (selectedRender == null) {
            alert(productionRender_localize(prrData.strNothingSelected));
            return;
        }

        var rerunFile = new File(prrData.renderBatchFiles[selectedRender]["file"]);

        // paths and cleanup before re-rendering
        var run_renderPath = new Folder(prrData.renderBatchFiles[selectedRender]["render_path"])
        var run_sequencePath = new Folder(prrData.renderBatchFiles[selectedRender]["sequence_path"])

        if (run_sequencePath.exists == true) {
            // get all files in sequence folder
            var allSequenceFiles = run_sequencePath.getFiles();
            // delete last rendered file
            if (allSequenceFiles.length != 0) {
                var lastFile = allSequenceFiles[allSequenceFiles.length - 1];
                lastFile.remove();
            }
        }

        // run selected
        if (run_renderPath.exists == true) {
            if (rerunFile.exists == true) {
                rerunFile.execute();
            }
        }

        // close gui
        // prevPal.close();
        // prrPal.close();
    }

    function productionRender_doOpenInExplorer() {
        // get selected
        var selectedRender = prevPal.grp.table.tbl.selection;

        // check if anything is selected
        if (selectedRender == null) {
            alert(productionRender_localize(prrData.strNothingSelected));
            return;
        }

        // open in explorer
        var run_renderPath = new Folder(prrData.renderBatchFiles[selectedRender]["render_path"]);
        if (run_renderPath.exists == true) {
            var cmd = "explorer " + String(run_renderPath.fsName);
            try {
                system.callSystem(cmd);
            } catch (e) {
                alert(e);
            }
        } else {
            alert(productionRender_localize(prrData.strFolderNotExist));
            return;
        }
    }

    function productionRender_doPlayPreview() {
        // get selected
        var selectedRender = prevPal.grp.table.tbl.selection;

        // check if anything is selected
        if (selectedRender == null) {
            alert(productionRender_localize(prrData.strNothingSelected));
            return;
        }

        // play preview file
        var previewFile = new File(prrData.renderBatchFiles[selectedRender]["render_path"] + "\\" + prrData.renderBatchFiles[selectedRender]["output"] + "_preview.mp4");
        if (previewFile.exists == true) {
            var cmd = "cmd.exe /c call " + addQuotes(previewFile.fsName);
            try {
                system.callSystem(cmd);
            } catch (e) {
                alert(e);
            }
        } else {
            alert(productionRender_localize(prrData.strSelectionDoesNotExist));
            return;
        }
    }

    function productionRender_doPublish() {
        productionRender_doCopyToNetwork();
        productionRender_doSendPreviewToTrello();
        // reset progress bar
        updateProgressbar(prevPal, 0, 0, 10);
    }

    function productionRender_checkTrelloAuthorization(key, token) {
        var authResponse;

        // variables
        var curl = prrData.curl;
        var api_url = prrData.trelloURL;
        var api_version = prrData.trelloAPIVersion;
        var memberID = prrData.memberID;

        // get board
        var rspGetAuthJSON;
        var cmdGetAuth = "\"" + curl.fsName + "\"" + " -s -k -X GET " + "\"" + "https://" + api_url + "/" + api_version + "/members/" + memberID + "?&key=" + key + "&token=" + token + "\"";
        try {
            var rspGetAuth = system.callSystem(cmdGetAuth);
            rspGetAuthJSON = JSON.parse(rspGetAuth);
            if (rspGetAuthJSON.confirmed == true) {
                authResponse = true;
            } else {
                authResponse = false;
            }
        } catch (e) {
            authResponse = false;
        }

        return authResponse;
    }

    function productionRender_getTrelloBoardID(board, key, token) {
        var getBoardID;

        // variables
        var curl = prrData.curl;
        var api_url = prrData.trelloURL;
        var api_version = prrData.trelloAPIVersion;
        var memberID = prrData.memberID;

        // get board id
        var rspGetMyBoardsJSON;
        var cmdGetMyBoards = "\"" + curl.fsName + "\"" + " -s -k -X GET " + "\"" + "https://" + api_url + "/" + api_version + "/members/" + memberID + "/boards" + "?fields=id,name" + "&key=" + key + "&token=" + token + "\"";
        try {
            var rspGetMyBoards = system.callSystem(cmdGetMyBoards);
            rspGetMyBoardsJSON = JSON.parse(rspGetMyBoards);
        } catch (e) {
            alert(e);
        }

        if (rspGetMyBoardsJSON != undefined) {
            for (var a = 0; a < rspGetMyBoardsJSON.length; a++) {
                var name = rspGetMyBoardsJSON[a].name;
                if (name == board) {
                    getBoardID = rspGetMyBoardsJSON[a].id;
                }
            }
        }

        return getBoardID;
    }

    function productionRender_createTrelloCard(board, key, token, task) {
        var cardIDFromResponse;

        // variables
        var curl = prrData.curl;
        var api_url = prrData.trelloURL;
        var api_version = prrData.trelloAPIVersion;

        // board id
        var boardID = board;

        // get board
        var rspGetBoardJSON;
        var cmdGetBoard = "\"" + curl.fsName + "\"" + " -s -k -X GET " + "\"" + "https://" + api_url + "/" + api_version + "/boards/" + boardID + "?fields=id,name&lists=open&list_fields=id,name&cards=open&card_fields=id,name,idList" + "&key=" + key + "&token=" + token + "\"";
        try {
            var rspGetBoard = system.callSystem(cmdGetBoard);
            rspGetBoardJSON = JSON.parse(rspGetBoard);
        } catch (e) {
            alert(e);
        }

        // update progress bar
        updateProgressbar(prevPal, 0, 5, 10);

        // check if "Cinematics" list exist
        var listIDs = [];
        if (rspGetBoardJSON != undefined) {
            var lists = rspGetBoardJSON.lists;
            var revLists = reverseObj(lists);
            for (var i = 0; i < revLists.length; i++) {
                var string = revLists[i].name;
                var re = new RegExp('^' + 'Cinematic', 'i');
                if (re.test(string)) {
                    listID = revLists[i].id;
                    listIDs.push(listID);
                }
            }
        }

        // create "Cinematics" list if it doesn't exist
        if (listIDs.length == 0) {
            var rspCreateListJSON;
            var cmdCreateList = "\"" + curl.fsName + "\"" + " -s -k -X POST " + "\"" + "https://" + api_url + "/" + api_version + "/lists?name=" + "Cinematics" + "&idBoard=" + boardID + "&pos=bottom" + "&key=" + key + "&token=" + token + "\"";
            try {
                var rspCreateList = system.callSystem(cmdCreateList);
                rspCreateListJSON = JSON.parse(rspCreateList);
                listID = rspCreateListJSON.id;
            } catch (e) {
                alert(e);
            }
        }

        // update progress bar
        updateProgressbar(prevPal, 0, 6, 10);

        // check if card exist
        var cardID;
        if (rspGetBoardJSON != undefined) {
            var cards = rspGetBoardJSON.cards;
            for (var j = 0; j < cards.length; j++) {
                if (cards[j].name == task) {
                    if (listIDs.indexOf(cards[j].idList) != -1) {
                        cardID = cards[j].id;
                    }
                }
            }
        }

        // create card for task if it doesn't exist
        if (cardID == undefined) {
            var rspCreateCardJSON;
            var cmdCreateCard = "\"" + curl.fsName + "\"" + " -s -k -X POST " + "\"" + "https://" + api_url + "/" + api_version + "/cards?name=" + task + "&idList=" + listID + "&key=" + key + "&token=" + token + "\"";
            try {
                var rspCreateCard = system.callSystem(cmdCreateCard);
                rspCreateCardJSON = JSON.parse(rspCreateCard);
                cardID = rspCreateCardJSON.id;
            } catch (e) {
                alert(e);
            }
        }

        // update progress bar
        updateProgressbar(prevPal, 0, 7, 10);

        // assign card id
        if (cardID != undefined) {
            cardIDFromResponse = cardID;
        }

        // return card id
        return cardIDFromResponse;
    }

    function productionRender_sendPreviewToTrello(board, key, token, task, file, name) {
        var attachmentURLFromResponse;

        // variables
        var curl = prrData.curl;
        var api_url = prrData.trelloURL;
        var api_version = prrData.trelloAPIVersion;

        // update progress bar
        updateProgressbar(prevPal, 0, 4, 10);

        // create card for task if it doesn't exist
        var cardID = productionRender_createTrelloCard(board, key, token, task);

        // update progress bar
        updateProgressbar(prevPal, 0, 8, 10);

        // get previous attachments
        var previousAttachmentIDs = [];
        if (cardID != undefined) {
            var cmdGetAttach = "\"" + curl.fsName + "\"" + " -s -k -X GET " + "\"" + "https://" + api_url + "/" + api_version + "/" + "cards/" + cardID + "/attachments" + "?fields=id,name&key=" + key + "&token=" + token + "\"";
            try {
                var rspGetAttach = system.callSystem(cmdGetAttach);
                var rspJSONGetAttach = JSON.parse(rspGetAttach);
                for (var i = 0; i < rspJSONGetAttach.length; i++) {
                    if (rspJSONGetAttach[i].name == name) {
                        previousAttachmentIDs.push(rspJSONGetAttach[i].id);
                    }
                }
            } catch (e) {
                alert(e);
            }
        }

        // delete previous attachments
        if (cardID != undefined) {
            if (previousAttachmentIDs.length != 0) {
                for (var j = 0; j < previousAttachmentIDs.length; j++) {
                    var cmdDelAttach = "\"" + curl.fsName + "\"" + " -s -k -X DELETE " + "\"" + "https://" + api_url + "/" + api_version + "/" + "cards/" + cardID + "/attachments/" + previousAttachmentIDs[j] + "?key=" + key + "&token=" + token + "\"";
                    try {
                        var rspDelAttach = system.callSystem(cmdDelAttach);
                        var rspJSONDelAttach = JSON.parse(rspDelAttach);
                    } catch (e) {
                        alert(e);
                    }
                }
            }
        }

        // update progress bar
        updateProgressbar(prevPal, 0, 9, 10);

        // upload preview file as attachment
        if (cardID != undefined) {
            var command = "\"" + curl.fsName + "\"" + " -F \"file=@" + file + "\"" + " -s -k -X POST " + "\"" + "https://" + api_url + "/" + api_version + "/" + "cards/" + cardID + "/attachments" + "?name=" + name + "&key=" + key + "&token=" + token + "\"";
            try {
                var response = system.callSystem(command);
                var responseJSON = JSON.parse(response);
                var attachmentURLFromResponse = responseJSON.url;
            } catch (e) {
                alert(e);
            }
        }

        // update progress bar
        updateProgressbar(prevPal, 0, 10, 10);

        // return attachment url
        return attachmentURLFromResponse;
    }

    // previous renders buttons
    function productionRender_doSendPreviewToTrello() {
        // get selected render
        var file_path;
        var selectedRender = prevPal.grp.table.tbl.selection;

        //variables
        // var trello_board = "5a3fd1140692860bf459f4ae";
        var trello_board_name = prrData.renderBatchFiles[selectedRender]["game_name"] + " WIP";

        // check if send to trello is enabled
        var trello_enable, trello_key, trello_token;

        if (app.settings.haveSetting("ProductionRender", "trello_enable")) {
            trello_enable = app.settings.getSetting("ProductionRender", "trello_enable").bool();
        } else {
            trello_enable = false;
        }

        if (trello_enable == false) {
            alert(productionRender_localize(prrData.strTrelloDisabled));
            updateProgressbar(prevPal, 0, 0, 100);
            return;
        }

        // check if key and token are valid
        if (app.settings.haveSetting("ProductionRender", "trello_key")) {
            trello_key = app.settings.getSetting("ProductionRender", "trello_key");
        } else {
            alert("ERROR: API key not found!");
            updateProgressbar(prevPal, 0, 0, 100);
            return;
        }

        if (app.settings.haveSetting("ProductionRender", "trello_token")) {
            trello_token = app.settings.getSetting("ProductionRender", "trello_token");
        } else {
            alert("ERROR: API token not found!");
            updateProgressbar(prevPal, 0, 0, 100);
            return;
        }

        // check autorization 
        var trello_auth = productionRender_checkTrelloAuthorization(trello_key, trello_token);
        if (trello_auth == false) {
            alert("ERROR: Trello API Key or Token invalid!\n\nTask has not been published to Trello.");
            updateProgressbar(prevPal, 0, 0, 100);
            return;
        }

        // get board id
        var trello_board = productionRender_getTrelloBoardID(trello_board_name, trello_key, trello_token);
        if (trello_board == undefined) {
            alert("ERROR: Trello board for this game has not bean found!");
            updateProgressbar(prevPal, 0, 0, 100);
            return;
        }

        // check if selected render is already published
        if (selectedRender.subItems[6].text != "") {
            if (!confirm(productionRender_localize(prrData.strRenderAlreadySentToTrello))) {
                updateProgressbar(prevPal, 0, 0, 100);
                return;
            }
        }

        // start progress bar
        updateProgressbar(prevPal, 0, 1, 10);

        // check if anything is selected
        if (selectedRender == null) {
            alert(productionRender_localize(prrData.strNothingSelected));
            return;
        }

        // get preview file
        var previewFile = new File(prrData.renderBatchFiles[selectedRender]["render_path"] + "\\" + prrData.renderBatchFiles[selectedRender]["output"] + "_preview.mp4");
        if (previewFile.exists == false) {
            alert(productionRender_localize(prrData.strSelectionDoesNotExist));
            return;
        } else {
            file_path = previewFile.fsName;
        }

        // update progress bar
        updateProgressbar(prevPal, 0, 1, 10);

        // get game and task
        var game_name = prrData.renderBatchFiles[selectedRender]["game_name"];
        var task_name = prrData.renderBatchFiles[selectedRender]["task_name"];

        // define attachment name
        var attachment_name = file_path.replace(/^.*[\\\/]/, '');

        if (game_name == "Undefined" || task_name == "Undefined") {
            alert("Invalid task!");
            return;
        }

        // update progress bar
        updateProgressbar(prevPal, 0, 3, 10);

        // send
        var attachURL = productionRender_sendPreviewToTrello(trello_board, trello_key, trello_token, task_name, file_path, attachment_name);

        // notify user
        if (attachURL == undefined) {
            alert(productionRender_localize(prrData.strSomethingWentWrong));
        } else {
            // alert(productionRender_localize(prrData.strSubmittedToTrello));

            // write published to txt file
            var timecodeFilePath = prrData.renderBatchFiles[selectedRender]["render_path"] + "\\" + prrData.renderBatchFiles[selectedRender]["output"] + ".txt";
            var timecodeFilePathFile = new File(timecodeFilePath);
            if (timecodeFilePathFile.exists == true) {
                replaceInTextFile(timecodeFilePathFile, "Published: false", "Published: true");
            }

            // update published column
            updatePublishedColumn(prevPal, selectedRender);
        }

        // reset progress bar
        updateProgressbar(prevPal, 0, 0, 100);
    }

    function productionRender_doCopyToNetwork() {
        // get selected
        var selectedRender = prevPal.grp.table.tbl.selection;

        // check if anything is selected
        if (selectedRender == null) {
            alert(productionRender_localize(prrData.strNothingSelected));
            return;
        }

        // generate expected output file list
        var tableItem = prrData.renderBatchFiles[selectedRender];
        var outName = tableItem["output"];
        var outFileList = prrData.outputFileList;
        var outFileListProper = [];
        for (var f = 0; f < outFileList.length; f++) {
            var fl = outFileList[f].replace(/^.*[\\\/]/, '');
            var fo = fl.replace("<filename>", outName);
            outFileListProper.push(fo);
        }

        // check if selected render is complete
        var missingFiles = [];
        for (var z = 0; z < outFileListProper.length; z++) {
            var zl = new File(tableItem["render_path"] + "\\" + outFileListProper[z]);
            if (zl.exists == false) {
                missingFiles.push(zl);
            }
        }

        if (missingFiles != 0) {
            alert(productionRender_localize(prrData.strRenderIncomplete));
            return;
        }

        // check task type
        var publishFolder = "";
        var get_tasktype = tableItem["task_type"];
        if (get_tasktype == "cinematic") {
            publishFolder = "";
        } else if (get_tasktype == "animatic") {
            publishFolder = "info";
        } else {
            publishFolder = "render_irregular";
        }

        // get structure xml for network path finding
        var structureXMLFile = locateStartNewTaskStructureFile();
        if (structureXMLFile.exists == false) {
            alert(productionRender_localize(prrData.strCouldNotResolveNetLoc));
            return;
        } else {
            // parse xml file
            var xmlFile = new File(structureXMLFile.fsName);
            xmlFile.open("r");
            var xmlString = xmlFile.read();
            var myXML = new XML(xmlString);
            xmlFile.close();

            // read network root from xml file
            var networkRoot = myXML.@network.toString();

            // define network location for given project
            var get_gamename = tableItem["game_name"];
            var get_taskname = tableItem["task_name"];

            var networkRootFolder = new Folder(networkRoot);
            if (networkRootFolder.exists == false) {
                alert(productionRender_localize(prrData.strNetworkDoesNotExist));
                return;
            } else {
                var networkLocation = networkRoot + "\\" + get_gamename + "\\" + get_taskname + "\\" + publishFolder;
                var networkPath = new Folder(networkLocation);
                if (networkPath.exists == false) {
                    alert(productionRender_localize(prrData.strNetworkPathDoesNotExist));
                    return;
                } else {
                    // alert(productionRender_localize(prrData.strMayTakeAWhile));

                    // check if files are already on the network
                    var filesAlreadyOnNetwork = [];
                    for (var a = 0; a < outFileListProper.length; a++) {
                        var al = new File(networkPath.fsName + "\\" + outFileListProper[a]);
                        if (al.exists == true) {
                            filesAlreadyOnNetwork.push(al);
                        }
                    }

                    if (app.settings.haveSetting("ProductionRender", "network_progress_enable")) {
                        var net_progress = app.settings.getSetting("ProductionRender", "network_progress_enable").bool();
                    } else {
                        var net_progress = false;
                    }

                    if (filesAlreadyOnNetwork.length != 0) {
                        // create folder "old" if it doesnt exist
                        var folderOld = new Folder(networkRoot + "\\" + get_gamename + "\\" + get_taskname + "\\" + "old");
                        if (folderOld.exists == false) {
                            createFolder(folderOld);
                        }

                        // datetime
                        var current_date = new Date(Date(0));
                        var day = ('0' + current_date.getDate()).slice(-2);
                        var month = ('0' + (current_date.getMonth() + 1)).slice(-2);
                        var year = current_date.getFullYear().toString().slice(-2);
                        var hours = ('0' + current_date.getHours()).slice(-2);
                        var minutes = ('0' + current_date.getMinutes()).slice(-2);
                        var seconds = ('0' + current_date.getSeconds()).slice(-2);

                        // create subfolder to backup files
                        var datetime = "" + day + month + year + hours + minutes + seconds;
                        var folderBackup = new Folder(folderOld.fsName + "\\" + datetime);
                        createFolder(folderBackup);

                        // move files
                        if (net_progress) {
                            var filesToCopy = [];
                            for (var j = 0; j < filesAlreadyOnNetwork.length; j++) {
                                var filename = filesAlreadyOnNetwork[j].name;
                                filesToCopy.push(filename);
                            }
                            var srcDir = new Folder(networkLocation);
                            var destDir = new Folder(folderBackup.fsName);
                            copyMultipleFiles(srcDir, destDir, filesToCopy);
                        } else {
                            // move existing files to backup folder individualy
                            for (var t = 0; t < filesAlreadyOnNetwork.length; t++) {
                                updateProgressbar(prevPal, 0, t + 1, filesAlreadyOnNetwork.length);
                                var destFileBase = filesAlreadyOnNetwork[t].fsName.split('\\').reverse()[0];
                                var destFile = new File(folderBackup.fsName + "\\" + destFileBase);
                                copyFile(filesAlreadyOnNetwork[t], destFile);
                            }
                        }
                    }

                    // copy files
                    if (net_progress) {
                        // copy all files in one go
                        var srcDir = new Folder(tableItem["render_path"]);
                        var destDir = new Folder(networkLocation);
                        var filesToCopy = outFileListProper;
                        copyMultipleFiles(srcDir, destDir, filesToCopy);
                    } else {
                        // copy files individually
                        for (var y = 0; y < outFileListProper.length; y++) {
                            updateProgressbar(prevPal, 0, y + 1, outFileListProper.length);
                            var sourceFile = new File(tableItem["render_path"] + "\\" + outFileListProper[y]);
                            var destFile = new File(networkLocation + "\\" + outFileListProper[y]);
                            copyFile(sourceFile, destFile);
                        }
                    }

                    // reset progress bar
                    updateProgressbar(prevPal, 0, 0, 100);

                    // notify user
                    // alert(productionRender_localize(prrData.strFilesCopied));

                }
            }
        }
    }

    function productionRender_doRefreshStatus() {
        var tableItems = prevPal.grp.table.tbl.items;
        for (var i = 0; i < tableItems.length; i++) {
            var img = getRenderStatus(prrData.renderBatchFiles[i]);
            tableItems[i].image = img;

            var infoF = prrData.renderBatchFiles[i]["render_path"] + "\\" + prrData.renderBatchFiles[i]["output"] + ".txt";
            var rentime = getRenderTime(infoF);
            var pubstat = getPublishStatus(infoF);

            tableItems[i].subItems[1].text = rentime;
            tableItems[i].subItems[6].text = pubstat;
        }
    }

    // Main code:
    //

    // Check if PNG Sequence output template exists
    function checkmodules() {
        var check = false;

        var renderQ = app.project.renderQueue;
        var tempComp = app.project.items.addComp("setProxyTempComp", 100, 100, 1, 1, 25);
        var tempCompQueueItem = renderQ.items.add(tempComp)
        var tempCompQueueItemIndex = renderQ.numItems;
        var templateArray = renderQ.item(tempCompQueueItemIndex).outputModules[1].templates;

        var PNGcheck = isInArray("PNG Seq Colors", templateArray);
        var WAVcheck = isInArray("WAV", templateArray);

        if ((PNGcheck == true) && (WAVcheck == true)) {
            var check = true;
        }

        // Get Render Settings Templates
        var rsTemplatesAll = renderQ.item(tempCompQueueItemIndex).templates;
        for (var i = 0; i < rsTemplatesAll.length; i++) {
            if ((rsTemplatesAll[i].startsWith("_HIDDEN") == false) && (rsTemplatesAll[i].startsWith("Multi-Machine") == false)) {
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

        if (app.activeViewer != null) {
            app.activeViewer.setActive();
        }

        return check;
    }

    // Warning
    if (parseFloat(app.version) < 13.0) {
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
                if (checkIfTopComp() == false) {
                    alert(productionRender_localize(prrData.strErrNotTopComp));
                }
                // Show the palette
                prrPal.center();
                prrPal.show();
            } else {
                prrPal.layout.layout(true);
            }
        }
    }
})(this);
