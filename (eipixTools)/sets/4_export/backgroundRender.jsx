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
    var backgroundRenderData = new Object();

    backgroundRenderData.scriptNameShort = "BGR";
    backgroundRenderData.scriptName = "Background Render";
    backgroundRenderData.scriptVersion = "1.0";
    backgroundRenderData.scriptTitle = backgroundRenderData.scriptName + " v" + backgroundRenderData.scriptVersion;

    backgroundRenderData.strRenderSettings = {en: "Render Settings"};
    backgroundRenderData.strOutputModule = {en: "Output Module"};
    backgroundRenderData.strOutputPath = {en: "Output Path"};

    backgroundRenderData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    backgroundRenderData.strActiveCompErr = {en: "Please select a composition."};
    backgroundRenderData.strSaveActionMsg = {en: "Project needs to be saved now. Do you wish to continue?"};
    backgroundRenderData.strInstructions = {en: "Rendering with following settings:"};
    backgroundRenderData.strQuestion = {en: "Do you wish to proceed?"};
    backgroundRenderData.strExecute = {en: "Yes"};
    backgroundRenderData.strCancel = {en: "No"};

    backgroundRenderData.strHelp = {en: "?"};
    backgroundRenderData.strHelpTitle = {en: "Help"};
    backgroundRenderData.strHelpText = {en: "This script renders saves the project and renders the active composition in After Effecs native command-line renderer."};

    // Define secondary variables
    backgroundRenderData.activeItem = app.project.activeItem;
    backgroundRenderData.activeItemName = app.project.activeItem.name;
    backgroundRenderData.

    // Localize
    function backgroundRender_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function backgroundRender_buildUI(thisObj) {
        var pal = new Window("dialog", backgroundRenderData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + backgroundRenderData.scriptNameShort + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + backgroundRender_localize(backgroundRenderData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    sep: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    inst: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + backgroundRender_localize(backgroundRenderData.strInstructions) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    renderSettings: Panel { \
                        alignment:['fill','top'], \
                        text: '" + backgroundRender_localize(backgroundRenderData.strRenderSettings) + "', alignment:['fill','top'] \
                        qual: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Quality:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'Best', preferredSize:[-1,20] }, \
                        }, \
                        res: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Resolution:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'1024 x 512', preferredSize:[-1,20] }, \
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
                        text: '" + backgroundRender_localize(backgroundRenderData.strOutputModule) + "', alignment:['fill','top'], \
                        temp: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Template:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'Lossless', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    outputPath: Panel { \
                        alignment:['fill','top'], \
                        text: '" + backgroundRender_localize(backgroundRenderData.strOutputPath) + "', alignment:['fill','top'], \
                        qual: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Path:', preferredSize:[80,20] }, \
                            sst2: StaticText { text:'~/Desktop', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    ques: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + backgroundRender_localize(backgroundRenderData.strQuestion) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + backgroundRender_localize(backgroundRenderData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + backgroundRender_localize(backgroundRenderData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                alert(backgroundRenderData.scriptTitle + "\n" + backgroundRender_localize(backgroundRenderData.strHelpText), backgroundRender_localize(backgroundRenderData.strHelpTitle));
            }

            pal.grp.cmds.executeBtn.onClick = backgroundRender_doExecute;
            pal.grp.cmds.cancelBtn.onClick = backgroundRender_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    function defineRenderSettings() {
        
    }

    // Dialog to let users define render location
    // function setRenderLocation() {
    //     // code
    // }

    function addToRenderQueue() {
        // add the queue
    }

    function saveTheProject() {
        app.project.save()
    }

    function sendSystemCommands() {
        // code
    }

    // Execute
    function backgroundRender_doExecute() {
        var saveAction = confirm(backgroundRender_localize(backgroundRenderData.strSaveActionMsg));
        if (saveAction == true) {
            app.beginUndoGroup(backgroundRenderData.scriptName);

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
        alert(backgroundRender_localize(backgroundRenderData.strMinAE));
    // } else if ( condition ) { // check if project is not saved
    //     alert(backgroundRenderData.strSaveProj);
    } else if (!(backgroundRenderData.activeItem instanceof CompItem) || (backgroundRenderData.activeItem == null)) {
        alert(backgroundRender_localize(backgroundRenderData.strActiveCompErr));
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