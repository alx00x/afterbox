// collectFilesAndReduce.jsx
// 
// Name: collectFilesAndReduce
// Version: 0.9
// Author: Aleksandar Kocic
// Based on: Collect function based on work by duduf.net
// 
// Description:
// This script removes unused footage and collects files
// at the location of the original project. It mimics the 
// "Collect Files..." function. Heavily based on a script
// by duduf.net
//  
// Note: Might not be completely stable. Use with caution.


(function collectFilesAndReduce(thisObj) {

    // Define main variables
    var cfarData = new Object();

    cfarData.scriptNameShort = "CFAR";
    cfarData.scriptName = "Collect Files And Reduce";
    cfarData.scriptVersion = "0.9";
    cfarData.scriptTitle = cfarData.scriptName + " v" + cfarData.scriptVersion;

    cfarData.strMinAE = {en: "This script requires Adobe After Effects CS5 or later."};
    cfarData.strHelp = {en: "?"};
    cfarData.strHelpTitle = {en: "Help"};
    cfarData.strHelpText = {en: "Might not be completely stable. Use with caution."};

    cfarData.strExecute = {en: "Yes"};
    cfarData.strCancel = {en: "No"};
    cfarData.strInstructions = {en: "This script removes unused footage and collects files at the location of the original project. To collect element resources, click \"Get Files\" button."};
    cfarData.strQuestion = {en: "Are you sure you want to proceed?"};

    cfarData.strElem = {en: "Element 3D"};
    cfarData.strGatherBtn = {en: "Gather"};
    cfarData.strParseBtn = {en: "Parse"};
    cfarData.strGetElemInst = {en: "Gathering resources could take a minute. Be patient!"};

    cfarData.strOpts = {en: "Options"};
    cfarData.strZipFileEnable = {en: "Collect as archive"};

    // cfarData.strAddlPath = {en: "Additional"};
    // cfarData.strAddlPathBtn = {en: "Add Path"};
    // cfarData.strAddlPathInst = {en: "You can specify additional paths to be collected."};

    cfarData.runprocessMissing = {en: "runprocess.vbs script is missing"};

    // Global arrays
    cfarData.elementFilesArray;
    cfarData.elementFilesArrayClean;
    cfarData.nonElementFilesArray = [];
    cfarData.doCollectElementFiles = false;

    // Localize
    function collectFilesAndReduce_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function collectFilesAndReduce_buildUI(thisObj) {
        var pal = new Window("dialog", cfarData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
            "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + cfarData.scriptNameShort + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + collectFilesAndReduce_localize(cfarData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                sepr: Group { \
                    orientation:'row', alignment:['fill','top'], \
                    rule: Panel { height: 2, alignment:['fill','center'] }, \
                }, \
                inst: Group { \
                    orientation:'row', alignment:['left','fill'], \
                    instructions: StaticText { text:'" + collectFilesAndReduce_localize(cfarData.strInstructions) + "', alignment:['left','fill'], properties:{multiline:true} }, \
                    opts: Panel { \
                        text: '" + collectFilesAndReduce_localize(cfarData.strOpts) + "', alignment:['fill','top'], \
                        orientation:'row', alignment:['left','fill'], minimumSize:[155,-1], \
                        zip: Group { \
                            box: Checkbox { text:'" + collectFilesAndReduce_localize(cfarData.strZipFileEnable) + "', alignment:['fill','top'] }, \
                        }, \
                    }, \
                }, \
                elem: Panel { \
                    text: '" + collectFilesAndReduce_localize(cfarData.strElem) + "', alignment:['fill','top'], \
                    orientation:'row', alignment:['left','fill'], \
                    lst: Group { \
                        orientation:'column', alignment:['left','fill'], \
                        dispElemList: ListBox { alignment:['fill','fill'], minimumSize:[220,60], maximumSize:[220,120], properties:{numberOfColumns:2, showHeaders:true, columnTitles: ['#', 'Path'], columnWidths:[20,180]} }, \
                    }, \
                    btn: Group { \
                        orientation:'column', alignment:['left','fill'], \
                        gatherBtn: Button { text:'" + collectFilesAndReduce_localize(cfarData.strGatherBtn) + "', preferredSize:[100,20] }, \
                        getElemInst: StaticText { text:'" + collectFilesAndReduce_localize(cfarData.strGetElemInst) + "', preferredSize:[100,40], properties:{multiline:true} }, \
                        parseBtn: Button { text:'" + collectFilesAndReduce_localize(cfarData.strParseBtn) + "', preferredSize:[100,20] }, \
                    }, \
                }, \
                ques: Group { \
                    alignment:['fill','top'], \
                    instructions: StaticText { text:'" + collectFilesAndReduce_localize(cfarData.strQuestion) + "', alignment:['left','fill'], preferredSize:[-1,20], properties:{multiline:true} }, \
                }, \
                cmds: Group { \
                    alignment:['fill','bottom'], \
                    executeBtn: Button { text:'" + collectFilesAndReduce_localize(cfarData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    cancelBtn: Button { text:'" + collectFilesAndReduce_localize(cfarData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                }, \
            }";


                // addl: Panel { \
                //     alignment:['fill','top'], \
                //     text: '" + collectFilesAndReduce_localize(cfarData.strAddlPath) + "', alignment:['fill','top'], \
                //     temp: Group { \
                //         alignment:['fill','top'], \
                //         sst1: StaticText { text:'"+ collectFilesAndReduce_localize(cfarData.strAddlPathBtn) + ":', preferredSize:[80,20] }, \
                //         sst2: StaticText { text:'List', preferredSize:[-1,20] }, \
                //     }, \
                // }, \

            pal.grp = pal.add(res);
            pal.grp.header.help.onClick = function() {
                alert(cfarData.scriptTitle + "\n" + collectFilesAndReduce_localize(cfarData.strHelpText), collectFilesAndReduce_localize(cfarData.strHelpTitle));
            }

            pal.grp.elem.btn.parseBtn.enabled = false;
            pal.grp.inst.opts.zip.box.value = true;

            pal.grp.elem.btn.gatherBtn.onClick = function() {
                pal.grp.elem.btn.gatherBtn.enabled = false;
                collectFilesAndReduce_doGather();
            }

            pal.grp.elem.btn.parseBtn.onClick = function() {
                collectFilesAndReduce_doParse();
            }

            pal.grp.cmds.executeBtn.onClick = collectFilesAndReduce_doExecute;
            pal.grp.cmds.cancelBtn.onClick = collectFilesAndReduce_doCancel;
        }

        return pal;
    }

    // Trigger element files
    //
    function collectElementInstances() {
        var elementInstancesArray = [];
        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project != null && app.project.item(i) instanceof CompItem) {
                var curComp = app.project.item(i);
                for (var f = 1; f <= curComp.numLayers; f++) {

                    //unsolo all
                    // if (curComp.layer(f).enabled == true) {
                    //     curComp.layer(f).solo = false;
                    // }

                    if (curComp.layer(f) instanceof AVLayer && curComp.layer(f).property("ADBE Effect Parade") !=null && curComp.layer(f).property("ADBE Effect Parade").numProperties !=0)  {
                        var curLayer = curComp.layer(f);
                        for (var j = 1; j <= curLayer.property("ADBE Effect Parade").numProperties; j++) {
                            var curProperty = curLayer.property("ADBE Effect Parade").property(j);
                            if (curProperty.matchName == "VIDEOCOPILOT 3DArray") {
                                elementInstancesArray.push([curComp.id, curLayer.index, curProperty.propertyIndex]);
                            }
                        }
                    }
                }
            }
        }
        return elementInstancesArray;
    }

    function triggerElementResources(array) {
        var arrayLenght = numProps(array);
        for (var i = 0; i < arrayLenght; i++) {
            var elemCompId = array[i][0];
            var elemCompIdx = itemIndexFromId(elemCompId);
            var elemLayerIdx = array[i][1];
            var elemPropertyIdx = array[i][2];
            
            var elemComp = app.project.item(elemCompIdx);
            var elemLayer = app.project.item(elemCompIdx).layer(elemLayerIdx);
            var elemProperty = app.project.item(elemCompIdx).layer(elemLayerIdx).property("ADBE Effect Parade").property(elemPropertyIdx);
            
            var newSolid = elemComp.layers.addSolid([0, 0, 0], "tempTextureLayer"+i, elemComp.width, elemComp.height, elemComp.pixelAspect, elemComp.duration);
            newSolid.moveToEnd();
            var newSolidIndex = elemComp.numLayers;
            
            var elemLayerSolo = elemLayer.solo;
            elemLayer.solo = true;
            //elemLayer.openInViewer();
            //elemComp.openInViewer();
            
            //custom map texture 10
            var texMap10 = elemProperty.property("VIDEOCOPILOT 3DArray-1861").value;
            elemProperty.property("VIDEOCOPILOT 3DArray-1861").setValue(newSolidIndex);

            //render settings, fog
            var renderSettingsFog = elemProperty.property("VIDEOCOPILOT 3DArray-1202").value;
            elemProperty.property("VIDEOCOPILOT 3DArray-1202").setValue(1);

            //render settings, fog color
            var randomNumberA = Math.floor(Math.random()*1001);
            var randomNumberB = Math.floor(Math.random()*1001);
            var fogColorA = "0.2718" + randomNumberA;
            var fogColorB = "0.2719" + randomNumberB;

            var renderSettingsFogColor = elemProperty.property("VIDEOCOPILOT 3DArray-1203").value;
            elemProperty.property("VIDEOCOPILOT 3DArray-1203").setValue([1,fogColorA,fogColorB,0]);
            
            var elemCompDuration = elemComp.workAreaDuration;
            elemComp.workAreaDuration = elemComp.frameDuration*4;
            elemComp.ramPreviewTest("",.25,"");
            elemComp.workAreaDuration = elemCompDuration;
            
            //reset element settings
            elemProperty.property("VIDEOCOPILOT 3DArray-1860").setValue(texMap10);
            elemProperty.property("VIDEOCOPILOT 3DArray-1202").setValue(renderSettingsFog);
            elemProperty.property("VIDEOCOPILOT 3DArray-1203").setValue(renderSettingsFogColor);

            //other cleanup
            elemLayer.solo = elemLayerSolo;
            newSolid.source.remove();
        }
    }

    function itemIndexFromId(input) {
        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i).id ==  input) {
                return i;
            }
        }
        return false;
    }

    function numProps(obj) {
        var c = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key))++c;
        }
        return c;
    }

    // Parse CSV
    //

    // Main parse function
    function parseCSV(filePath) {
        var pathColumn = [];

        var myFile = new File(filePath);
        var fileOK = myFile.open("r", "TEXT", "????");
        var arrayLinesRaw = [];

        while (!myFile.eof) {
            lines = myFile.readln();
            arrayLinesRaw.push(lines);
        }
        
        var arrayLines = [];
        var arrayLinesRawLenght = numProps(arrayLinesRaw);
        for (var i = 0; i < arrayLinesRawLenght; i++) {
            a = arrayLinesRaw[i].split(",");
            arrayLines.push(a);
        }
        
        var pathColumnAll = [];
        var arrayLinesLenght = numProps(arrayLines);
        for (var i = 0; i < arrayLinesLenght; i++) {
            pathColumnAll.push(arrayLines[i][4]);
        }
        
        pathColumnAll.splice(0, 1);
        var pathColumn = removeDuplicatesFromArray(pathColumnAll);

        return pathColumn;
    }

    // Gets number of properties (sub-arrays)
    function numProps(obj) {
        var c = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key))++c;
        }
        return c;
    }

    // Removes duplicates from long-array
    function removeDuplicatesFromArray(arr) {
        var i,
            len = arr.length,
            out = [],
            obj = {};
        for (i = 0; i < len; i++) {
            obj[arr[i]] = 0;
        }
        for (i in obj) {
            out.push(i);
        }
        return out;
    }

    // Removes arrat A from array B
    function diffArray(a, b) {
        var seen = [],
            diff = [];
        for (var i = 0; i < b.length; i++)
            seen[b[i]] = true;
        for (var i = 0; i < a.length; i++)
            if (!seen[a[i]])
                diff.push(a[i]);
        return diff;
    }

    // Main functions:
    //


    // Reduce project function
    function reduceProjectAction() {
        app.project.removeUnusedFootage();
    }

    // Collect files function
    function collectFilesAction() {

        var projectName = app.project.file.name;
        var projectNameNoExt = projectName.replace(".aep", "");
        var projectFile = app.project.file.fsName;

        var currentProjectFile = new File(app.project.file);

        var folderProject = projectFile.replace(projectName, "");
        var folderCollectPath = folderProject + projectNameNoExt + "_folder";
        var folderFootagePath = folderCollectPath + "\\(footage)\\";
        var folderElement3DPath = folderCollectPath + "\\(element)\\";

        var folderCollect = new Folder(folderCollectPath);
        var folderFootage = new Folder(folderFootagePath);
        var folderElement3D = new Folder(folderElement3DPath);

        folderCollect.create();
        folderFootage.create();

        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i) instanceof FootageItem) {
                var folderElement = new Folder(folderFootage.absoluteURI + "\\" + app.project.item(i).parentFolder.name + "\\");
                folderElement.create();

                if (app.project.item(i).file != null && !app.project.item(i).footageMissing) {
                    var extension = app.project.item(i).file.name
                    .substring(app.project.item(i).file.name.lastIndexOf(".") + 1).toLowerCase();
                    if (app.project.item(i).mainSource.isStill) {
                        app.project.item(i).file.copy(folderElement.absoluteURI + "\\" + app.project.item(i).file.name);
                        app.project.item(i).replace(new File(folderElement.absoluteURI + "\\" + app.project.item(i).file.name));
                    } else if (extension != "jpg" && extension != "jpeg" && extension != "png" && extension != "tga" && extension != "tif" && extension != "tiff" && extension != "exr" && extension != "bmp" && extension != "pxr" && extension != "pct" && extension != "hdr" && extension != "rla" && extension != "ai" && extension != "cin" && extension != "dpx") {
                        app.project.item(i).file.copy(folderElement.absoluteURI + "\\" + app.project.item(i).file.name);
                        app.project.item(i).replace(new File(folderElement.absoluteURI + "\\" + app.project.item(i).file.name));
                    } else {
                        var folderSequence = app.project.item(i).file.parent;
                        var frameSequence = folderSequence.getFiles();
                        var folderSequenceTarget = new Folder(folderElement.absoluteURI + "\\" + folderSequence.name + "\\");
                        folderSequenceTarget.create();

                        for (j = 0; j < frameSequence.length; j++) {
                            frameSequence[j].copy(folderSequenceTarget.absoluteURI + "\\" + frameSequence[j].name);
                        }

                        app.project.item(i).replaceWithSequence(new File(folderSequenceTarget.absoluteURI + "\\" + app.project.item(i).file.name), true);
                        delete folderSequence;
                        delete frameSequence;
                        delete folderSequenceTarget;
                    }
                    delete extension;
                }
                delete folderElement;
            }
        }

        var savePath = new File(folderCollectPath + "\\" + projectName);
        app.project.save(savePath);
        
        if (cfarData.doCollectElementFiles == true) {
            folderElement3D.create();
            for (var f = 0; f < cfarData.elementFilesArrayClean.length; f++) {
                var elementFile = new File(cfarData.elementFilesArrayClean[f]);
                var elementFileName = elementFile.name;
                elementFile.copy(folderElement3D.absoluteURI + "\\" + elementFileName);
            }
        }

        //reopen project file
        app.open(currentProjectFile);

        if (cfarPal.grp.inst.opts.zip.box.value == true) {
            var zipFile = folderProject + projectNameNoExt + "_folder.zip";
            var zipScript = new File(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(eipixTools)/etc/zipscript.vbs");
            var cmdLineToExecute = "\"" + zipScript.fsName + "\"" + " " + "\"" + folderCollectPath + "\"" + " " + "\"" + zipFile + "\"";
            system.callSystem("cmd.exe /c \"" + cmdLineToExecute + "\"");
        }
    }

    // Button onclick functions:
    //

    // Gather element files with procmon
    function collectFilesAndReduce_doGather() {
        //start procmon
        var etcFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(eipixTools)/etc");
        var desktopPath = new Folder("~/Desktop");
        var terminateProc = new File(desktopPath.fsName + "/terminateProcess.txt");

        var runprocess = new File(etcFolder.fsName + "/runprocess.vbs");

        if (runprocess.exists == true) {
            runprocess.execute();
        } else {
            alert(collectFilesAndReduce_localize(cfarData.runprocessMissing));
        }

        alert("Ready to collect element resources. Click OK and wait.");

        //trigger element resources
        var elemArray = collectElementInstances();
        triggerElementResources(elemArray);

        //terminate procmon
        terminateProc.open("w");
        terminateProc.write("terminate");
        terminateProc.close();

        var csvFilePath = new File(desktopPath.fsName + "/afterfx.csv");
        for (var i = 1; i < 20; i++) {
            
            if (csvFilePath.exists == true) {
                cfarPal.grp.elem.btn.parseBtn.enabled = true;
            } else {
                $.sleep(2000);
                i = i + 1;
            }
        }
        cfarPal.grp.elem.btn.parseBtn.enabled = true;
    }

    // Parse the newly created csv
    function collectFilesAndReduce_doParse() {
        var desktopPath = new Folder("~/Desktop");
        var csvFilePath = new File(desktopPath.fsName + "/afterfx.csv");

        var parseArray = parseCSV(csvFilePath);
        for (var j = 0; j < parseArray.length; j++) {
            parseArray[j] = parseArray[j].slice(1, -1);
        }

        cfarData.elementFilesArray = parseArray;

        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i) instanceof FootageItem) {
                if (app.project.item(i).file != null && !app.project.item(i).footageMissing) {
                    cfarData.nonElementFilesArray.push(app.project.item(i).file.fsName);
                }
            }
        }

        cfarData.elementFilesArrayClean = diffArray(cfarData.elementFilesArray, cfarData.nonElementFilesArray);

        for (var i = 0; i < cfarData.elementFilesArrayClean.length; i++) {
            var myItem = cfarPal.grp.elem.lst.dispElemList.add("item", i + 1);
            myItem.subItems[0].text = cfarData.elementFilesArrayClean[i];
        }

        cfarData.doCollectElementFiles = true;
        csvFilePath.remove();
    }

    // Execute
    function collectFilesAndReduce_doExecute() {
        app.beginUndoGroup(reduceProjectAction);
        reduceProjectAction();
        app.endUndoGroup();

        app.beginUndoGroup(collectFilesAction);
        collectFilesAction();

        app.endUndoGroup();
        cfarPal.close();
    }

    // Cancel
    function collectFilesAndReduce_doCancel() {
        cfarPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 10.0) {
        alert(collectFilesAndReduce_localize(cfarData.strMinAE));
    } else {
        // Build and show the floating palette
        var cfarPal = collectFilesAndReduce_buildUI(thisObj);
        if (cfarPal !== null) {
            if (cfarPal instanceof Window) {
                // Show the palette
                cfarPal.center();
                cfarPal.show();
            } else {
                cfarPal.layout.layout(true);
            }
        }
    }
})(this);