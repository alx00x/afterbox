// collectFilesAndReduce.jsx
// 
// Name: collectFilesAndReduce
// Version: 1.9
// Author: Aleksandar Kocic
// 
// Description:
// This script removes unused footage and collects files
// at the location of the original project. It mimics the 
// "Collect Files..." function. Portion of the code is 
// based on a script by duduf.net
//  
// Note: Might not be completely stable. Use with caution.


(function collectFilesAndReduce(thisObj) {

    // Define main variables
    var cfarData = new Object();

    cfarData.scriptNameShort = "CFAR";
    cfarData.scriptName = "Collect Files And Reduce";
    cfarData.scriptVersion = "1.9";
    cfarData.scriptTitle = cfarData.scriptName + " v" + cfarData.scriptVersion;

    cfarData.strMinAE = {en: "This script requires Adobe After Effects CS5 or later."};
    cfarData.strHelp = {en: "?"};
    cfarData.strHelpTitle = {en: "Help"};
    cfarData.strHelpText = {en: "This script removes unused footage and collects files at the location of the original project. Might not be completely stable. Use with caution."};

    cfarData.strExecute = {en: "Yes"};
    cfarData.strCancel = {en: "No"};
    cfarData.strInstructions = {en: "To collect Element3D resources, click \"Gather\" button, wait to finish and then press \"Parse\"."};
    cfarData.strQuestion = {en: "Are you sure you want to proceed?"};

    cfarData.strElem = {en: "Element 3D"};
    cfarData.strGatherBtn = {en: "Gather"};
    cfarData.strParseBtn = {en: "Parse"};
    cfarData.strGetElemInst = {en: "Gathering resources could take a minute. Please be patient!"};
    cfarData.strNoElementInProject = {en: "Could not detect Element3D in this project."};

    cfarData.strOpts = {en: "Options"};
    cfarData.strGenerateReport = {en: "Generate report"};
    cfarData.strZipFileEnable = {en: "Collect as archive"};
    cfarData.strObjSequence = {en: "Collect obj sequence"};
    cfarData.strObjSequenceWarning = {en: "Enabling this option may significantly increase collecting time."};

    cfarData.strAddlPath = {en: "Additional folder"};
    cfarData.strAddlPathBtn = {en: "Browse"};

    cfarData.runprocessMissing = {en: "runprocess.vbs script is missing"};

    // Global arrays
    cfarData.elementFilesArray = [];
    cfarData.elementFilesArrayClean = [];
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
                    title: StaticText { text:'" + cfarData.scriptNameShort + " v" + cfarData.scriptVersion + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + collectFilesAndReduce_localize(cfarData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                sepr: Group { \
                    orientation:'row', alignment:['fill','top'], \
                    rule: Panel { height: 2, alignment:['fill','center'] }, \
                }, \
                inst: Group { \
                    orientation:'row', alignment:['left','fill'], \
                    instgrp: Group { \
                        orientation: 'column', alignment:['left','center'], \
                        instructions: StaticText { text:'" + collectFilesAndReduce_localize(cfarData.strInstructions) + "', alignment:['left','fill'], properties:{multiline:true} }, \
                        text: StaticText { text:'', alignment:['left','fill'], properties:{multiline:true} }, \
                        loader: Progressbar { text:'Progressbar', minvalue:0, maxvalue:100, size:[200,12]},\
                    }, \
                    opts: Panel { \
                        text: '" + collectFilesAndReduce_localize(cfarData.strOpts) + "', alignment:['fill','top'], \
                        orientation:'column', alignment:['left','fill'], minimumSize:[155,-1], \
                        box1: Checkbox { text:'" + collectFilesAndReduce_localize(cfarData.strGenerateReport) + "', alignment:['fill','top'] }, \
                        box2: Checkbox { text:'" + collectFilesAndReduce_localize(cfarData.strZipFileEnable) + "', alignment:['fill','top'] }, \
                        box3: Checkbox { text:'" + collectFilesAndReduce_localize(cfarData.strObjSequence) + "', alignment:['fill','top'] }, \
                    }, \
                }, \
                elem: Panel { \
                    text: '" + collectFilesAndReduce_localize(cfarData.strElem) + "', alignment:['fill','top'], \
                    orientation:'column', alignment:['left','fill'] \
                    lst: Group { \
                        orientation:'row', alignment:['left','fill'], \
                        dispElemList: ListBox { alignment:['fill','fill'], size:[335,120], properties:{numberOfColumns:2, showHeaders:true, columnTitles: ['#', 'Path'], columnWidths:[20,310]} }, \
                    }, \
                    btn: Group { \
                        alignment:['left','fill'] \
                        text: Group { \
                            orientation:'row', alignment:['left','top'] \
                            getElemInst: StaticText { text:'" + collectFilesAndReduce_localize(cfarData.strGetElemInst) + "', preferredSize:[220,40], properties:{multiline:true} }, \
                        }, \
                        button: Group { \
                            orientation:'column', alignment:['left','fill'] \
                            gatherBtn: Button { text:'" + collectFilesAndReduce_localize(cfarData.strGatherBtn) + "', preferredSize:[100,20] }, \
                            parseBtn: Button { text:'" + collectFilesAndReduce_localize(cfarData.strParseBtn) + "', preferredSize:[100,20] }, \
                        }, \
                    }, \
                }, \
                addl: Panel { \
                    orientation:'column', alignment:['left','fill'], \
                    text: '" + collectFilesAndReduce_localize(cfarData.strAddlPath) + "', alignment:['fill','top'], \
                    main: Group { \
                        alignment:['fill','top'], \
                        edt: EditText { alignment:['fill','center'], preferredSize:[200,20] },  \
                        btn: Button { text:'"+ collectFilesAndReduce_localize(cfarData.strAddlPathBtn) + "', preferredSize:[-1,20] }, \
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

            pal.grp = pal.add(res);
            pal.grp.header.help.onClick = function() {
                alert(cfarData.scriptTitle + "\n" + collectFilesAndReduce_localize(cfarData.strHelpText), collectFilesAndReduce_localize(cfarData.strHelpTitle));
            }

            pal.grp.elem.btn.button.parseBtn.enabled = false;
            pal.grp.inst.opts.box1.value = false;
            pal.grp.inst.opts.box1.enabled = false;
            pal.grp.inst.opts.box2.value = true;
            pal.grp.inst.opts.box3.value = false;

            pal.grp.elem.btn.button.gatherBtn.onClick = function() {
                pal.grp.elem.btn.button.gatherBtn.enabled = false;
                collectFilesAndReduce_doGather();
            }

            pal.grp.elem.btn.button.parseBtn.onClick = function() {
                pal.grp.elem.btn.button.gatherBtn.enabled = false;
                collectFilesAndReduce_doParse();
            }

            pal.grp.inst.opts.box3.onClick = function() {
                alert(collectFilesAndReduce_localize(cfarData.strObjSequenceWarning));
            }

            pal.grp.addl.main.btn.onClick = function() {
                collectFilesAndReduce_doBrowse();
            }

            pal.grp.cmds.executeBtn.onClick = collectFilesAndReduce_doExecute;
            pal.grp.cmds.cancelBtn.onClick = collectFilesAndReduce_doCancel;
        }

        return pal;
    }

    // Progressbar function
    //
    function updateProgressbar(pal, minValue, currentValue, maxValue) {
        pal.grp.inst.instgrp.loader.minvalue = minValue;
        pal.grp.inst.instgrp.loader.maxvalue = maxValue;
        pal.grp.inst.instgrp.loader.value = currentValue;
        pal.update();
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

    function triggerElementResources(array, bool) {
        var arrayLength = numProps(array);

        for (var i = 0; i < arrayLength; i++) {
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
            
            var elemLayerVisibility = elemLayer.enabled;
            var elemLayerSolo = elemLayer.solo;
            elemLayer.enabled = true;
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
            
            //record work area properties
            var elemCompWorkAreaStart = elemComp.workAreaStart;
            var elemCompWorkAreaDuration = elemComp.workAreaDuration;
            var elemCompDuration = elemComp.duration;

            //do the gathering
            if (bool == false) {
                //regular
                elemComp.workAreaDuration = elemComp.frameDuration*4;
                elemComp.ramPreviewTest("",.25,"");
            } else {
                //sequence
                elemComp.workAreaStart = "0";
                elemComp.workAreaDuration = elemCompDuration;
                elemComp.ramPreviewTest("",.25,"");
            }

            //reset work area
            elemComp.workAreaStart = elemCompWorkAreaStart;
            elemComp.workAreaDuration = elemCompWorkAreaDuration;
            
            //reset element settings
            elemProperty.property("VIDEOCOPILOT 3DArray-1860").setValue(texMap10);
            elemProperty.property("VIDEOCOPILOT 3DArray-1202").setValue(renderSettingsFog);
            elemProperty.property("VIDEOCOPILOT 3DArray-1203").setValue(renderSettingsFogColor);

            //other cleanup
            elemLayer.solo = elemLayerSolo;
            elemLayer.enabled = elemLayerVisibility;
            newSolid.source.remove();

            updateProgressbar(cfarPal, 0, i+1, arrayLength);

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
        var arrayLinesRawLength = numProps(arrayLinesRaw);
        for (var i = 0; i < arrayLinesRawLength; i++) {
            a = arrayLinesRaw[i].split(",");
            arrayLines.push(a);

            updateProgressbar(cfarPal, 0, i+1, arrayLinesRawLength);
        }
        
        var pathColumnAll = [];
        var arrayLinesLength = numProps(arrayLines);
        for (var i = 0; i < arrayLinesLength; i++) {
            pathColumnAll.push(arrayLines[i][4]);

            updateProgressbar(cfarPal, 0, i+1, arrayLinesLength);
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

    // Removes array A from array B
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

    // Find a match in an element of a subarray
    function findInMulDimArray(searchArray, searchIndex, searchString) {
        for (var i = 0; i < searchArray.length; i++) {
            if (searchArray[i][searchIndex] === searchString) {
                return i;
            }
        }
        return -1;
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
        var projectNameNoExt = projectName.replace(".aepx", "").replace(".aep", "");
        var projectFile = app.project.file.fsName;

        var currentProjectFile = new File(app.project.file);

        var folderProject = projectFile.replace(projectName, "");
        var folderCollectPath = folderProject + projectNameNoExt + "_folder";
        var folderFootagePath = folderCollectPath + "/(footage)/";
        var folderElement3DPath = folderCollectPath + "/(element)/";

        var folderCollect = new Folder(folderCollectPath);
        var folderFootage = new Folder(folderFootagePath);
        var folderElement3D = new Folder(folderElement3DPath);
        
        var psdFileData = [];
        var psdFileDataWithDuplicates = [];

        folderCollect.create();
        folderFootage.create();

        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i) instanceof FootageItem) {
                var itemParentFolder = app.project.item(i).parentFolder;
                var folderStructure = "/";
                while (itemParentFolder != app.project.rootFolder) {
                    var folderName =  "/" + itemParentFolder.name;
                    folderStructure = folderName.concat(folderStructure);
                    itemParentFolder = itemParentFolder.parentFolder;
                }
                var folderElement = new Folder(folderFootage.absoluteURI + folderStructure);

                folderElement.create();

                if (app.project.item(i).file != null && !app.project.item(i).footageMissing) {
                    var extension = app.project.item(i).file.name
                    .substring(app.project.item(i).file.name.lastIndexOf(".") + 1).toLowerCase();
                    if (app.project.item(i).mainSource.isStill && extension != "psd" ) {
                        app.project.item(i).file.copy(folderElement.absoluteURI + "/" + app.project.item(i).file.name);
                        app.project.item(i).replace(new File(folderElement.absoluteURI + "/" + app.project.item(i).file.name));
                    } else if (extension == "psd") {
                        var psdCurrentFile = new File(folderElement.absoluteURI + "/" + app.project.item(i).file.name);
                        if (psdCurrentFile.exists == false) {
                            app.project.item(i).file.copy(folderElement.absoluteURI + "/" + app.project.item(i).file.name);
                            psdFileDataWithDuplicates.push([app.project.item(i).file.fsName, (new File(folderElement.absoluteURI + "/" + app.project.item(i).file.name)).fsName]);
                        }
                    } else if (extension != "psd" && extension != "jpg" && extension != "jpeg" && extension != "png" && extension != "tga" && extension != "tif" && extension != "tiff" && extension != "exr" && extension != "bmp" && extension != "pxr" && extension != "pct" && extension != "hdr" && extension != "rla" && extension != "ai" && extension != "cin" && extension != "dpx") {
                        app.project.item(i).file.copy(folderElement.absoluteURI + "/" + app.project.item(i).file.name);
                        app.project.item(i).replace(new File(folderElement.absoluteURI + "/" + app.project.item(i).file.name));
                    } else {
                        var folderSequence = app.project.item(i).file.parent;
                        var frameSequence = folderSequence.getFiles();
                        var folderSequenceTarget = new Folder(folderElement.absoluteURI + "/" + folderSequence.name + "/");
                        folderSequenceTarget.create();

                        for (j = 0; j < frameSequence.length; j++) {
                            frameSequence[j].copy(folderSequenceTarget.absoluteURI + "/" + frameSequence[j].name);
                        }

                        app.project.item(i).replaceWithSequence(new File(folderSequenceTarget.absoluteURI + "/" + app.project.item(i).file.name), true);
                        delete folderSequence;
                        delete frameSequence;
                        delete folderSequenceTarget;
                    }
                    delete extension;
                }
                delete itemParentFolder;
                delete folderStructure;
                delete folderName;
                delete folderElement;
            }

            updateProgressbar(cfarPal, 1, i+1, app.project.numItems);
        }

        var psdFileData = psdFileDataWithDuplicates;
        if (psdFileData.length > 0) {
            var i = psdFileData.length - 1,
                prev = '';
            do {
                if (psdFileData[i].join('/') === prev) {
                    psdFileData.splice(i, 1);
                }
                prev = psdFileData[i].join('/');
            } while (i-- && i > -1);
        }

        // Collect Element files if requested
        if (cfarData.doCollectElementFiles == true) {
            folderElement3D.create();
            for (var f = 0; f < cfarData.elementFilesArrayClean.length; f++) {
                var elementFile = new File(cfarData.elementFilesArrayClean[f]);
                var elementFileName = elementFile.name;
                elementFile.copy(folderElement3D.absoluteURI + "/" + elementFileName);

                updateProgressbar(cfarPal, 0, f+1, cfarData.elementFilesArrayClean.length);
            }
        }

        // Add additional paths if requested
        if (cfarPal.grp.addl.main.edt.text != "") {
            var requestedPath = cfarPal.grp.addl.main.edt.text;
            if (requestedPath == "element") {
                var requestedFolder = new Folder(folderProject + "/element");
                var destinationFolder = new Folder(folderCollect.fsName + "/element")
                destinationFolder.create();
                var cmdLineToExecute = "robocopy " + "\"" + requestedFolder.fsName + "\"" + "  " + "\"" + destinationFolder.fsName + "\"" + " /S";
                system.callSystem("cmd.exe /c \"" + cmdLineToExecute + "\"");
            } else {
                var requestedFolder = new Folder(requestedPath);
                var destinationFolder = new Folder(folderCollect.fsName + "/" + requestedFolder.name);
                var cmdLineToExecute = "robocopy " + "\"" + requestedFolder.fsName + "\"" + "  " + "\"" + destinationFolder.fsName + "\"" + " /S";
                system.callSystem("cmd.exe /c \"" + cmdLineToExecute + "\"");
            }
        }

        // Save to XML
        var xmlFile = new File(folderCollectPath + "/" + projectNameNoExt + ".aepx");
        app.project.save(xmlFile);

        // Close project
        app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);

        // Parse XML and replace PSD paths
        if (psdFileData.length > 0) {
            xmlFile.open("r");
            var xmlString = xmlFile.read();
            var myXML = new XML(xmlString);
            default xml namespace = "http://www.adobe.com/products/aftereffects";
            xmlFile.close();
            
            var relativeIndexIntoFullpathLength = (folderCollectPath + "/").length;
            var pathNodes = myXML.Fold.Item.xpath ("//*[@fullpath]");
            
            for (var i = 0; i < pathNodes.length(); i++) {
                var referenceFullpath = pathNodes[i].@fullpath.toString();
                var xmlFileIndex = findInMulDimArray(psdFileData, 0, referenceFullpath);
                if (xmlFileIndex != -1) {
                    pathNodes[i].@fullpath = psdFileData[xmlFileIndex][1];
                    pathNodes[i].@relativeAscendCountFromProject = "1";
                    pathNodes[i].@relativeIndexIntoFullpath = relativeIndexIntoFullpathLength;
                }
                
                updateProgressbar(cfarPal, 0, i+1, pathNodes.length());
            }
            
            xmlFile.open("w");
            xmlFile.write(myXML);
            xmlFile.close();
        }
    
        // Reopen project file
        app.open(currentProjectFile);

        // Generate report
        if (cfarPal.grp.inst.opts.box1.value == true) {
            //code
        }

        // Zip collect folder
        if (cfarPal.grp.inst.opts.box2.value == true) {
            var zipFile = folderProject + projectNameNoExt + "_folder.zip";
            var zipScript = new File(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(afterbox)/etc/zipscript.vbs");
            var cmdLineToExecute = "\"" + zipScript.fsName + "\"" + " " + "\"" + folderCollectPath + "\"" + " " + "\"" + zipFile + "\"";
            system.callSystem("cmd.exe /c \"" + cmdLineToExecute + "\"");
        }
    }

    // Button onclick functions:
    //

    // Gather element files with procmon
    function collectFilesAndReduce_doGather() {
        var elemArray = collectElementInstances();
        if (elemArray.length > 0) {
            // Start procmon
            var etcFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(afterbox)/etc");
            var desktopPath = new Folder("~/Desktop");

            var afterfxPML = new File(desktopPath.fsName + "/afterfx.pml");
            var afterfxPML_seq = new File(desktopPath.fsName + "/afterfx_seq.pml");

            var afterfxCSV = new File(desktopPath.fsName + "/afterfx.csv");
            var afterfxCSV_seq = new File(desktopPath.fsName + "/afterfx_seq.csv");

            var terminateProc = new File(desktopPath.fsName + "/terminateProcess.txt");
            var terminateProc_seq = new File(desktopPath.fsName + "/terminateProcess_seq.txt");

            var collectSequenceArgument = "false";
            var afterfxEXE = new File(Folder.appPackage.fullName + "/afterfx.exe");
            var runprocess = new File(etcFolder.fsName + "/runprocess.vbs");

            if (runprocess.exists == true) {
                var cmdLineToExecute = "\"" + runprocess.fsName + "\"" + " " + collectSequenceArgument + " " + "\"" + afterfxEXE.fsName + "\"";
                system.callSystem("cmd.exe /c \"" + cmdLineToExecute + "\"");
            } else {
                alert(collectFilesAndReduce_localize(cfarData.runprocessMissing));
            }

            while (afterfxPML.exists == false) {
                $.sleep(1000);
            }

            triggerElementResources(elemArray, false);
            // Terminate regular procmon
            terminateProc.open("w");
            terminateProc.write("terminate");
            terminateProc.close();

            while (afterfxCSV.exists == false) {
                $.sleep(1000);
            }

            if (cfarPal.grp.inst.opts.box3.value == true) {
                collectSequenceArgument = "true";

                var cmdLineToExecute = "\"" + runprocess.fsName + "\"" + " " + collectSequenceArgument;
                system.callSystem("cmd.exe /c \"" + cmdLineToExecute + "\"");

                while (afterfxPML_seq.exists == false) {
                    $.sleep(1000);
                }

                triggerElementResources(elemArray, true);
                // Terminate sequence procmon
                terminateProc_seq.open("w");
                terminateProc_seq.write("terminate");
                terminateProc_seq.close();

                while (afterfxCSV_seq.exists == false) {
                    $.sleep(1000);
                }
            }

            cfarPal.grp.elem.btn.button.parseBtn.enabled = true;
        } else {
            alert(collectFilesAndReduce_localize(cfarData.strNoElementInProject));
        }
    }

    // Parse the newly created csv
    function collectFilesAndReduce_doParse() {
        var desktopPath = new Folder("~/Desktop");
        var csvFilePath = new File(desktopPath.fsName + "/afterfx.csv");
        var csvFilePath_seq = new File(desktopPath.fsName + "/afterfx_seq.csv");

        if (csvFilePath.exists == true) {
            var parseArray = parseCSV(csvFilePath);
            for (var j = 0; j < parseArray.length; j++) {
                parseArray[j] = parseArray[j].slice(1, -1);
            }
            csvFilePath.remove();
        }

        if (csvFilePath_seq.exists == true) {
            var parseArray_seq = parseCSV(csvFilePath_seq);
            for (var j = 0; j < parseArray_seq.length; j++) {
                parseArray_seq[j] = parseArray_seq[j].slice(1, -1);
            }
            parseArray = parseArray.concat(parseArray_seq);
            removeDuplicatesFromArray(parseArray);
            csvFilePath_seq.remove();
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
        cfarPal.grp.elem.btn.button.parseBtn.enabled = false;
    }

    // Additional
    function collectFilesAndReduce_doBrowse() {
        var additionalPath = Folder.selectDialog().fsName;
        cfarPal.grp.addl.main.edt.text = additionalPath.toString();
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