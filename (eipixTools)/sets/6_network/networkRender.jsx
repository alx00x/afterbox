// networkRender.jsx
// 
// Name: networkRender
// Version: 1.1
// Author: Aleksandar Kocic
// 
// Description:
// Backburner render script
//  


(function networkRender(thisObj) {

    // Define main variables
    var netrData = new Object();

    netrData.strManagerIP = "192.168.0.210";
    netrData.strTimeoutValue = "600";
    netrData.strMinutes = {en: "minutes"};

    netrData.scriptNameShort = "NET";
    netrData.scriptName = "Network Render";
    netrData.scriptVersion = "1.1";
    netrData.scriptTitle = netrData.scriptName + " v" + netrData.scriptVersion;

    netrData.strPathErr = {en: "Specified path could not be found."};
    netrData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    
    netrData.strSaveProjectErr = {en: "Save the project first."};
    netrData.strActiveCompErr = {en: "Please select a composition."};

    netrData.strSaveActionMsg = {en: "Project needs to be saved now. Do you wish to continue?"};
    netrData.strQuestion = {en: "Do you wish to proceed?"};
    netrData.strExecute = {en: "Yes"};
    netrData.strCancel = {en: "No"};

    netrData.strJobName = {en: "Job Name"};
    netrData.strManager = {en: "Manager"};
    netrData.strProject = {en: "Project"};
    netrData.strRenderSettings = {en: "Render Settings"};
    netrData.strOutputModule = {en: "Output Module"};
    netrData.strPriority = {en: "Priority"};
    netrData.strTimeout = {en: "Timeout"};
    netrData.strGroup = {en: "Group"};
    netrData.strGroupOpts = {en: ["AE", "3D"]};

    netrData.strSound = {en: "Sound"};
    netrData.strMultiProcessing = {en: "Multi Processing"};
    netrData.strProgress = {en: "Show Progress"};

    netrData.strErrors = {en: "Errors"};
    netrData.strOptions = {en: "Options"};
    netrData.strFlags = {en: "Flags"};
    netrData.strNameTemplate = {en: "Name Template"};
    netrData.strOutputPath = {en: "Output Path"};
    netrData.strTimeSpan = {en: "Time Span"};
    netrData.strNumTasks = {en: "Tasks"};
    netrData.strTimeOpts = {en: ["Length of Comp", "Work Area Only"]};

    netrData.strHelp = {en: "?"};
    netrData.strHelpTitle = {en: "Help"};
    netrData.strHelpText = {en: "This script sends the active project  command-line renderer."};

    netrData.errNoRenderFolder = {en: "Could not find render folder. Please specify render output location."};
    netrData.errNoPNG = {en: "You don't have \"PNG Sequence\" template installed. Run [IMP REND] script to enable it. Switching to PSD sequence for now."};

    if (app.project.file == null) {
        alert(networkRender_localize(netrData.strSaveProjectErr));
        return;
    }
    
    if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(networkRender_localize(netrData.strActiveCompErr));
        return;
    }

    // Define project variables
    netrData.activeItem = app.project.activeItem;
    netrData.activeItemName = app.project.activeItem.name;
    netrData.activeItemRes = netrData.activeItem.width + " x " + netrData.activeItem.height;
    netrData.projectName = app.project.file.name;
    netrData.projectNameFix = netrData.projectName.replace("%20", " ")
    netrData.projectFile = app.project.file;
    netrData.projectRoot = app.project.file.fsName.replace(netrData.projectNameFix, "");
    netrData.framerate = netrData.activeItem.frameRate;

    // Define render queue variables
    netrData.timeSpanStart = 0;
    netrData.timeSpanDuration = netrData.activeItem.duration;

    netrData.workAreaStart = netrData.activeItem.workAreaStart;
    netrData.workAreaDuration = netrData.activeItem.workAreaDuration;

    // Localize
    function networkRender_localize(strVar) {
        return strVar["en"];
    }

    // Prototipe startsWith
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function(str) {
            return this.slice(0, str.length) == str;
        };
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

    // Prototipe includs a string inside another scrting
    if (!String.prototype.includes) {
        String.prototype.includes = function() {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }

    // Create temp render queue item
    var tempRenderQueueItem = app.project.renderQueue.items.add(netrData.activeItem);
    var tempRenderQueueItemIndex = app.project.renderQueue.numItems;

    // Get Render Settings templates
    var rsTemplates = [];
    var rsTemplatesAll = app.project.renderQueue.item(tempRenderQueueItemIndex).templates;
    for (var i = 0; i < rsTemplatesAll.length; i++) {
        if (rsTemplatesAll[i].startsWith("_HIDDEN") == false) {
            rsTemplates.push(rsTemplatesAll[i]);
        }
    }
    var rsMMIndex = rsTemplates.indexOf("Multi-Machine Settings");

    // Get Output Module templates
    var omTemplates = [];
    var omTemplatesAll = app.project.renderQueue.item(tempRenderQueueItemIndex).outputModule(1).templates;
    for (var i = 0; i < omTemplatesAll.length; i++) {
        if (omTemplatesAll[i].startsWith("_HIDDEN") == false) {
            omTemplates.push(omTemplatesAll[i]);
        }
    }
    var omMMIndex = omTemplates.indexOf("Multi-Machine Sequence");

    // Check if theres Multi-Machine PNG Sequence
    var omPNGSequence = omTemplates.indexOf("PNG Sequence");

    var errorConsoleScrolling = "false";
    var errorConsole = "No Errors...";
    if (omPNGSequence == -1) {
        errorConsoleScrolling = "true";
        errorConsole = networkRender_localize(netrData.errNoPNG);
    } else {
        omMMIndex = omPNGSequence;
    }

    // Padding
    var selectedOMTemplate = omTemplates[omMMIndex];
    if (selectedOMTemplate.toString().includes("Sequence") == true) {
        sequencePadding = "_[#####]";
    }

    // Remove temp render queue item
    app.project.renderQueue.item(tempRenderQueueItemIndex).remove();

    // Build UI
    function networkRender_buildUI(thisObj) {
        var pal = new Window("dialog", netrData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + netrData.scriptNameShort + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + networkRender_localize(netrData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    errors: Panel { \
                        alignment:['fill','top'], \
                        text: '" + networkRender_localize(netrData.strErrors) + "', alignment:['fill','top'] \
                        main: Group { \
                            alignment:['fill','top'], \
                            fld: EditText { alignment:['fill','center'], preferredSize:[-1,60], properties:{multiline:true" + ",scrolling:" + errorConsoleScrolling + "} },  \
                        }, \
                    }, \
                    options: Panel { \
                        alignment:['fill','top'], \
                        text: '" + networkRender_localize(netrData.strOptions) + "', alignment:['fill','top'] \
                        jn: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + networkRender_localize(netrData.strJobName) + ":', preferredSize:[100,20] }, \
                            fld: EditText { alignment:['fill','center'], preferredSize:[180,20] },  \
                        }, \
                        mn: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + networkRender_localize(netrData.strManager) + ":', preferredSize:[100,20] }, \
                            fld: EditText { alignment:['fill','center'], preferredSize:[180,20] },  \
                        }, \
                        rendergroup: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + networkRender_localize(netrData.strGroup) + ":', preferredSize:[100,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[180,20] }, \
                        }, \
                        priority: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + networkRender_localize(netrData.strPriority) + ":', preferredSize:[100,20] }, \
                            fld: EditText { text:'50', characters: 4, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:50, minvalue:1, maxvalue:100, alignment:['fill','center'] }, \
                        }, \
                        task: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + networkRender_localize(netrData.strNumTasks) + ":', preferredSize:[100,20] }, \
                            fld: EditText { text:'1', characters: 4, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:1, minvalue:1, maxvalue:10, alignment:['fill','center'] }, \
                        }, \
                        timeout: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + networkRender_localize(netrData.strTimeout) + ":', preferredSize:[100,20] }, \
                            fld: EditText { characters: 4, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] },  \
                            min: StaticText { text:'" + networkRender_localize(netrData.strMinutes) + "', preferredSize:[-1,20] }, \
                        }, \
                        sepr: Group { \
                            alignment:['fill','top'], \
                            rule: Panel { height: 2, alignment:['fill','center'] }, \
                        }, \
                        rs: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + networkRender_localize(netrData.strRenderSettings) + ":', preferredSize:[100,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[180,20] }, \
                        }, \
                        om: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + networkRender_localize(netrData.strOutputModule) + ":', preferredSize:[100,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[180,20] }, \
                        }, \
                        time: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + networkRender_localize(netrData.strTimeSpan) + ":', preferredSize:[100,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[180,20] }, \
                        }, \
                    }, \
                    name: Panel { \
                        alignment:['fill','top'], \
                        text: '" + networkRender_localize(netrData.strNameTemplate) + "', alignment:['fill','top'], \
                        main: Group { \
                            alignment:['fill','top'], \
                            fld: EditText { alignment:['fill','center'], preferredSize:[-1,20] },  \
                        }, \
                    }, \
                    outputPath: Panel { \
                        alignment:['fill','top'], \
                        text: '" + networkRender_localize(netrData.strOutputPath) + "', alignment:['fill','top'], \
                        main: Group { \
                            alignment:['fill','top'], \
                            fld: EditText { alignment:['fill','center'], preferredSize:[-1,20] },  \
                        }, \
                    }, \
                    flags: Panel { \
                        alignment:['fill','top'], \
                        text: '" + networkRender_localize(netrData.strFlags) + "', alignment:['fill','top'], \
                        opts: Group { \
                            alignment:['fill','top'], \
                            box1: Checkbox { text:'" + networkRender_localize(netrData.strSound) + "', alignment:['fill','top'] }, \
                            box2: Checkbox { text:'" + networkRender_localize(netrData.strMultiProcessing) + "', alignment:['fill','top'] }, \
                            box3: Checkbox { text:'" + networkRender_localize(netrData.strProgress) + "', alignment:['fill','top'] }, \
                        }, \
                    }, \
                    ques: Group { \
                        alignment:['fill','top'], \
                        text: StaticText { text:'" + networkRender_localize(netrData.strQuestion) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + networkRender_localize(netrData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + networkRender_localize(netrData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                alert(netrData.scriptTitle + "\n" + networkRender_localize(netrData.strHelpText), networkRender_localize(netrData.strHelpTitle));
            }

            pal.grp.errors.main.fld.text = errorConsole;

            pal.grp.options.jn.fld.text = netrData.projectName.replace(".aep", "");
            pal.grp.options.mn.fld.text = netrData.strManagerIP;
            pal.grp.options.mn.fld.enabled = false;

            var rendergroupItems = networkRender_localize(netrData.strGroupOpts);
            for (var i = 0; i < rendergroupItems.length; i++) {
                pal.grp.options.rendergroup.list.add("item", rendergroupItems[i]);
            }
            pal.grp.options.rendergroup.list.selection = 0;
            pal.grp.options.rendergroup.list.enabled = false;

            pal.grp.options.timeout.fld.text = netrData.strTimeoutValue;

            pal.grp.options.priority.fld.onChange = function () {
                var value = parseInt(this.text);
                if (isNaN(value))
                    value = this.parent.sld.value;
                else if (value < this.parent.sld.minvalue)
                    value = this.parent.sld.minvalue;
                else if (value > this.parent.sld.maxvalue)
                    value = this.parent.sld.maxvalue;
                this.text = value.toString();
                this.parent.sld.value = value;
            }
            pal.grp.options.priority.sld.onChange = pal.grp.options.priority.sld.onChanging = function () {
                var value = parseInt(this.value);
                if (isNaN(value))
                    value = parseInt(this.parent.fld.text);
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            pal.grp.options.task.fld.onChange = function () {
                var value = parseInt(this.text);
                if (isNaN(value))
                    value = this.parent.sld.value;
                else if (value < this.parent.sld.minvalue)
                    value = this.parent.sld.minvalue;
                else if (value > this.parent.sld.maxvalue)
                    value = this.parent.sld.maxvalue;
                this.text = value.toString();
                this.parent.sld.value = value;
            }
            pal.grp.options.task.sld.onChange = pal.grp.options.task.sld.onChanging = function () {
                var value = parseInt(this.value);
                if (isNaN(value))
                    value = parseInt(this.parent.fld.text);
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            var rsItems = rsTemplates;
            for (var i = 0; i < rsItems.length; i++) {
                pal.grp.options.rs.list.add("item", rsItems[i]);
            }
            pal.grp.options.rs.list.selection = rsMMIndex;

            var omItems = omTemplates;
            for (var i = 0; i < omItems.length; i++) {
                pal.grp.options.om.list.add("item", omItems[i]);
            }
            pal.grp.options.om.list.selection = omMMIndex;

            var timeItems = networkRender_localize(netrData.strTimeOpts);
            for (var i = 0; i < timeItems.length; i++) {
                pal.grp.options.time.list.add("item", timeItems[i]);
            }
            pal.grp.options.time.list.selection = 1;

            pal.grp.name.main.fld.text = "[compName]" + sequencePadding + ".[fileExtension]";
            pal.grp.options.om.list.onChange = function () {
                var selectedOMTemplate = pal.grp.options.om.list.selection;
                if (selectedOMTemplate.toString().includes("Sequence") == true) {
                    if (pal.grp.options.task.fld.enabled != true) {
                        pal.grp.options.task.fld.text = "1";
                        pal.grp.options.task.fld.enabled = true;
                        pal.grp.options.task.sld.value = 1;
                        pal.grp.options.task.sld.enabled = true;
                    }
                    sequencePadding = "_[#####]";
                } else {
                    pal.grp.options.task.fld.text = "1";
                    pal.grp.options.task.fld.enabled = false;
                    pal.grp.options.task.sld.value = 1;
                    pal.grp.options.task.sld.enabled = false;
                    sequencePadding = "";
                }
                pal.grp.name.main.fld.text = "[compName]" + sequencePadding + ".[fileExtension]";
            }

            pal.grp.flags.opts.box1.value = true;
            pal.grp.flags.opts.box2.value = true;
            pal.grp.flags.opts.box3.value = true;

            pal.grp.cmds.executeBtn.onClick = networkRender_doExecute;
            pal.grp.cmds.cancelBtn.onClick = networkRender_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    // Add quotes
    function addQuotes(string) { 
        return "\""+ string + "\"";
    }

    // Create task list
    function networkRender_createTaskList(tasks, start, end) {
        //function to seperate frame range to tasks
        function seperateToChunks(a, n) {
            var len = a.length,
                out = [],
                i = 0;
            while (i < len) {
                var size = Math.ceil((len - i) / n--);
                out.push(a.slice(i, i += size));
            }
            return out;
        }

        //build tasks array
        var listArr = [];
        for (var i = start; i <= end; i++) {
            listArr.push(i);
        }
        var listArrChunks = seperateToChunks(listArr, tasks);

        //create list items
        var taskListTXT = new File(netrData.projectRoot + netrData.projectName.replace(".aep", "_render.txt"));
        var taskListTuple = [];
        for (var i = 0; i < listArrChunks.length; i++) {
            var frameStart = listArrChunks[i][0];
            var frameEnd = listArrChunks[i].slice(-1)[0];
            taskListTuple.push([frameStart, frameEnd]);
        }

        //create txt file
        taskListTXT.open("w");
        for (var i = 0; i < taskListTuple.length; i++) {
            taskListTXT.writeln("frames" + taskListTuple[i][0] + "-" + taskListTuple[i][1] + "\t" + taskListTuple[i][0] + "\t" + taskListTuple[i][1]);
        }
        taskListTXT.close();

        return taskListTXT;
    }

    // Main
    function networkRender_main() {
        // Save the project
        app.project.save();

        // Write bat file
        var aerenderEXE = new File(Folder.appPackage.fullName + "/aerender.exe");

        // get parameters
        var jobname =  netrPal.grp.options.jn.fld.text;
        var manager =  netrPal.grp.options.mn.fld.text;
        var rendergroup = netrPal.grp.options.rendergroup.list.selection;
        var tasklistvalue = netrPal.grp.options.task.fld.text;
        var timeoutvalue = netrPal.grp.options.timeout.fld.text;
        var priorityvalue = netrPal.grp.options.priority.fld.text;
        var rstemplatevalue =  netrPal.grp.options.rs.list.selection;
        var omtemplatevaleu =  netrPal.grp.options.om.list.selection;
        var timevalue =  netrPal.grp.options.time.list.selection;

        if (netrPal.grp.flags.opts.box1.value == true) {
            var sound = " -sound ON";
        } else {
            var sound = " -sound OFF";
        }

        if (netrPal.grp.flags.opts.box2.value == true) {
            var multiProcessing = " -mp";
        } else {
            var multiProcessing = "";
        }

        if (netrPal.grp.flags.opts.box3.value == true) {
            var progress = " -progress";
        } else {
            var progress = "";
        }

        // get render subfolder name
        var today = new Date();
        var currDay = ("0" + today.getDate()).slice(-2);
        var currMonth = ("0" + (today.getMonth() + 1)).slice(-2);
        var currYear = today.getFullYear();
        var currHour = ("0" + today.getHours()).slice(-2);
        var currMinute = ("0" + today.getMinutes()).slice(-2);
        var currSecond = ("0" + today.getSeconds()).slice(-2);
        var renderFolderName = currYear + "_" + currMonth + "_" + currDay + "_" + currHour + "-" + currMinute;

        var renderFile = new File(netrData.projectRoot + netrData.projectName.replace(".aep", "_render.aep"));
        var renderProject = "\\\\" + system.machineName + renderFile.fsName.substring(2);
        var renderPathLocal = app.project.file.parent.parent.fsName + "\\render";

        var usePath;
        var useName = netrPal.grp.name.main.fld.text;
        var fldOutputPath = netrPal.grp.outputPath.main.fld.text;
        if (fldOutputPath == "") {
            var renderPathLocal = new Folder(app.project.file.parent.parent.fsName + "\\render");
            if (renderPathLocal.exists == true) {
                var renderPathFolder = new Folder(renderPathLocal.fsName + "\\" + renderFolderName);
                var makeDir = "mkdir " + renderPathFolder.fsName;
                system.callSystem("cmd /c \"" + makeDir + "\"");
                var renderPath = "\\\\" + system.machineName + renderPathFolder.fsName.substring(2);
                usePath = renderPath + "\\" + useName;
            } else {
                alert(networkRender_localize(netrData.errNoRenderFolder));
                return;
            }
        } else {
            var usePathFolder = new Folder(fldOutputPath);
            if (usePathFolder.exists == true) {
                usePath = "\\\\" + system.machineName + fldOutputPath.substring(2) + "\\" + useName;
            } else {
                alert(networkRender_localize(netrPal.strPathErr));
                return;
            }
        }

        var createTaskList = false;
        if (tasklistvalue > 1) {
            createTaskList = true;
        }

        var startframe;
        var endframe;
        if (netrPal.grp.options.time.list.selection.index == 1) {
            startframe = netrData.workAreaStart * netrData.framerate;
            endframe = netrData.workAreaDuration * netrData.framerate;
        } else {
            startframe = netrData.timeSpanStart * netrData.framerate;
            endframe = netrData.timeSpanDuration * netrData.framerate;
        }

        var tasklist = "";
        var startFlag;
        var endFlag;
        if (createTaskList == true) {
            var taskListFile = networkRender_createTaskList(tasklistvalue, startframe, endframe);
            tasklist = " -taskList " + addQuotes("\\\\" + system.machineName + taskListFile.fsName.substring(2)) + " -taskName 1";
            startFlag = "%%tp2";
            endFlag = "%%tp3";
        } else {
            startFlag = startframe;
            endFlag = endframe;
        }

        app.project.save(renderFile);

        var batContent = "@echo off\r\n";
        batContent += "title Network Render Prompt\r\n"
        batContent += "\"C:\\Program Files (x86)\\Autodesk\\Backburner\\cmdjob.exe\" -jobname " + addQuotes(jobname) + " -manager " + manager + " "
        batContent += "-group " + addQuotes(rendergroup.toString()) + " -timeout " + timeoutvalue + " -priority " + priorityvalue + progress + tasklist + " "
        batContent += addQuotes(aerenderEXE.fsName) + " -project " + addQuotes(renderProject.toString()) + " "
        batContent += "-comp " + addQuotes(netrData.activeItemName) + " -RStemplate " + addQuotes(rstemplatevalue.toString()) + " -OMtemplate " + addQuotes(omtemplatevaleu.toString()) + " -output " + addQuotes(usePath.toString()) + " "
        batContent += "-s " + addQuotes(startFlag) + " -e " + addQuotes(endFlag)
        batContent += sound + multiProcessing + "\r\n"
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

        // Close interface
        netrPal.close();
        app.project.close(CloseOptions.SAVE_CHANGES)
        app.open(netrData.projectFile);
    }

    // Execute
    function networkRender_doExecute() {
        var saveAction = confirm(networkRender_localize(netrData.strSaveActionMsg));
        if (saveAction == true) {
            app.beginUndoGroup(netrData.scriptName);
            networkRender_main()
            app.endUndoGroup();
            netrPal.close();
        } else {
            return;
        }
    }

    function networkRender_doCancel() {
        netrPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(networkRender_localize(netrData.strMinAE));
    } else if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(networkRender_localize(netrData.strActiveCompErr));
    } else {
        // Build and show the floating palette
        var netrPal = networkRender_buildUI(thisObj);
        if (netrPal !== null) {
            if (netrPal instanceof Window) {
                // Show the palette
                netrPal.center();
                netrPal.show();
            } else {
                netrPal.layout.layout(true);
            }
        }
    }
})(this);