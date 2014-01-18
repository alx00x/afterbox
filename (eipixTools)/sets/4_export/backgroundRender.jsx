// backgroundRender.jsx
// 
// Name: backgroundRender
// Version: 1.0
// Author: Aleksandar Kocic
// 
// Description:     
// This script renders saves the project and renders the active composition
// in after effects native command-line renderer.
//  


(function backgroundRender(thisObj) {

    // Define main variables
    var bgrData = new Object();

    bgrData.scriptNameShort = "BGR";
    bgrData.scriptName = "Background Render";
    bgrData.scriptVersion = "1.0";
    bgrData.scriptTitle = bgrData.scriptName + " v" + bgrData.scriptVersion;

    bgrData.strRenderSettings = {en: "Render Settings"};
    bgrData.strOutputModule = {en: "Output Module"};
    bgrData.strOutputPath = {en: "Output Path"};

    bgrData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    bgrData.strActiveCompErr = {en: "Please select a composition."};
    bgrData.strSaveActionMsg = {en: "Project needs to be saved now. Do you wish to continue?"};
    bgrData.strInstructions = {en: "Rendering with following settings:"};
    bgrData.strQuestion = {en: "Do you wish to proceed?"};
    bgrData.strExecute = {en: "Yes"};
    bgrData.strCancel = {en: "No"};

    bgrData.strHelp = {en: "?"};
    bgrData.strHelpTitle = {en: "Help"};
    bgrData.strHelpText = {en: "This script renders saves the project and renders the active composition in After Effecs native command-line renderer."};

    // Define project variables
    bgrData.activeItem = app.project.activeItem;
    bgrData.activeItemName = app.project.activeItem.name;
    bgrData.activeItemRes = bgrData.activeItem.width + " x " + bgrData.activeItem.height;
    bgrData.projectName = app.project.file.name;
    bgrData.projectFile = app.project.file.fsName;
    bgrData.projectRoot = bgrData.projectFile.replace(projectName, "");

    // Define render queue variables
    bgrData.renderSettingsTemplate = "Best Settings";
    bgrData.outputModuleTemplate = "Lossless";
    bgrData.timeSpanStart = 0;
    bgrData.timeSpanDuration = bgrData.activeItem.duration;
    bgrData.desktopPath = new Folder("~/Desktop");
    bgrData.outputPath = bgrData.desktopPath.fsName;

    // Init global variables
    renderQueueItem;
    renderQueueItemIndex;

    // Localize
    function backgroundRender_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function backgroundRender_buildUI(thisObj) {
        var pal = new Window("dialog", bgrData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + bgrData.scriptNameShort + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + backgroundRender_localize(bgrData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    sep: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    inst: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + backgroundRender_localize(bgrData.strInstructions) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    renderSettings: Panel { \
                        alignment:['fill','top'], \
                        text: '" + backgroundRender_localize(bgrData.strRenderSettings) + "', alignment:['fill','top'] \
                        temp: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Template:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'"+ bgrData.renderSettingsTemplate + "', preferredSize:[-1,20] }, \
                        }, \
                        qual: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Quality:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'Best', preferredSize:[-1,20] }, \
                        }, \
                        res: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Resolution:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'" + bgrData.activeItemRes + "', preferredSize:[-1,20] }, \
                        }, \
                        frbl: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Frame Blending:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'On for Checked Layers', preferredSize:[-1,20] }, \
                        }, \
                        mblr: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Motion Blur:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'On for Checked Layers', preferredSize:[-1,20] }, \
                        }, \
                        time: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Time Span:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'Lenght of Comp', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    outputModules: Panel { \
                        alignment:['fill','top'], \
                        text: '" + backgroundRender_localize(bgrData.strOutputModule) + "', alignment:['fill','top'], \
                        temp: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Template:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'"+ bgrData.outputModuleTemplate + "', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    outputPath: Panel { \
                        alignment:['fill','top'], \
                        text: '" + backgroundRender_localize(bgrData.strOutputPath) + "', alignment:['fill','top'], \
                        qual: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Path:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'" + bgrData.outputPath + "', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    ques: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + backgroundRender_localize(bgrData.strQuestion) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + backgroundRender_localize(bgrData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + backgroundRender_localize(bgrData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                alert(bgrData.scriptTitle + "\n" + backgroundRender_localize(bgrData.strHelpText), backgroundRender_localize(bgrData.strHelpTitle));
            }

            pal.grp.cmds.executeBtn.onClick = backgroundRender_doExecute;
            pal.grp.cmds.cancelBtn.onClick = backgroundRender_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    // Dialog to let users define render location
    // function setRenderLocation() {
    //     // code
    // }

    function addToRenderQueue() {
        renderQueueItem = app.project.renderQueue.items.add(bgrData.activeItem);
        renderQueueItemIndex = app.project.renderQueue.numItems;
        renderQueueItem.applyTemplate(bgrData.renderSettingsTemplate);
        renderQueueItem.startTime = bgrData.timeSpanStart;
        renderQueueItem.timeSpanDuration = bgrData.timeSpanDuration;
        renderQueueItem.outputModules[1].applyTemplate(bgrData.outputModuleTemplate);
        renderQueueItem.outputModules[1].file = new File(bgrData.outputPath.toString() + "/" + bgrData.activeItemName + "_raw.avi";
    }

    function saveTheProject() {
        app.project.save()
    }

    function sendSystemCommands() {
        // code
    }

    // Execute
    function backgroundRender_doExecute() {
        var saveAction = confirm(backgroundRender_localize(bgrData.strSaveActionMsg));
        if (saveAction == true) {
            app.beginUndoGroup(bgrData.scriptName);

            addToRenderQueue();
            saveTheProject();
            sendSystemCommands();

            app.endUndoGroup();
            bgrPal.close();
        } else {
            return;
        }
    }

    function backgroundRender_doCancel() {
        bgrPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(backgroundRender_localize(bgrData.strMinAE));
    // } else if ( condition ) { // check if project is not saved
    //     alert(bgrData.strSaveProj);
    } else if (!(bgrData.activeItem instanceof CompItem) || (bgrData.activeItem == null)) {
        alert(backgroundRender_localize(bgrData.strActiveCompErr));
    } else {
        // Build and show the floating palette
        var bgrPal = backgroundRender_buildUI(thisObj);
        if (bgrPal !== null) {
            if (bgrPal instanceof Window) {
                // Show the palette
                bgrPal.center();
                bgrPal.show();
            } else {
                bgrPal.layout.layout(true);
            }
        }
    }
})(this);