// clearCachePurgeMem.jsx
// 
// Name: clearCachePurgeMem
// Version: 1.4
// Author: Aleksandar Kocic
// 
// Description:
// This script purges all RAM memory taken by After Effects and
// it cleans the disc cache memory at the user defined location.
// Method is very crude and simple. Use at own risk.
//  
// Note: This version of the script requires After Effects CS5 
// or later. 


(function PurgeMem(thisObj) {

    // Startup
    var cacheControlsFolder;
    if (parseInt(app.version) == 11) {
        cacheControlsFolder = "Folder 6";
    } else if ((parseInt(app.version) == 12) || (parseInt(app.version) == 13)) {
        cacheControlsFolder = "Folder 7";
    } else {
        alert("Unfortunately, this script doesn't work this version of After Effects.");
        return;
    }

    var diskCachePathAtStartup = app.preferences.getPrefAsString("Disk Cache Controls", cacheControlsFolder);

    // Globals    
    var PurgeMemData = new Object(); // Store globals in an object
    PurgeMem.scriptNameShort = "CCPM";
    PurgeMem.scriptName = "Clear Cache Purge Memory";
    PurgeMem.scriptVersion = "1.4";
    PurgeMem.scriptTitle = PurgeMem.scriptName + " v" + PurgeMem.scriptVersion;
    PurgeMem.strExecute = {en: "Clear Cache"};

    PurgeMem.strMinAE = {en: "This script requires Adobe After Effects CS5 or later."};
    PurgeMem.strHelp = {en: "?"}
    PurgeMem.strHelpTitle = {en: "Help"};
    PurgeMem.strHelpText = {
        en: "Cleans up AE cache and ram memory.\n" +
            "Use at own risk.\n" +
            "\n" +
            "Your cache memory location is:\n" +
            diskCachePathAtStartup + "\\Adobe After Effects Disk Cache - " + system.machineName + ".noindex"
    };

    // Localize
    function PurgeMem_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function PurgeMem_buildUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", PurgeMem.scriptName, undefined, {
            resizeable: true
        });

        if (pal !== null) {
            var res =
                "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + PurgeMem.scriptNameShort + " v" + PurgeMem.scriptVersion + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + PurgeMem_localize(PurgeMem.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                cmds: Group { \
                    alignment:['fill','bottom'], \
                    executeBtn: Button { text:'" + PurgeMem_localize(PurgeMem.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                alert(PurgeMem.scriptTitle + "\n" + PurgeMem_localize(PurgeMem.strHelpText), PurgeMem_localize(PurgeMem.strHelpTitle));
            }
            pal.grp.cmds.executeBtn.onClick = PurgeMem_doExecute;
        }

        return pal;
    }

    // Main Function:
    //
    function PurgeMem_doExecute(strVar) {
        var machineName = system.machineName;
        var diskCachePath = app.preferences.getPrefAsString("Disk Cache Controls", cacheControlsFolder);
        var diskCachePathFull = diskCachePath + "\\Adobe After Effects Disk Cache - " + machineName + ".noindex\\*";
        var delCommand = 'for /D %I in ("' + diskCachePathFull + '") do rmdir /s/q "%I"';
        system.callSystem("cmd.exe /c \"" + delCommand + "\"");
        app.purge(PurgeTarget.ALL_CACHES)
    }

    // Main code:
    //

    // Prerequisites check
    if (parseFloat(app.version) < 11.0) {
        alert(PurgeMem.strMinAE);
    } else {
        // Build and show the console's floating palette
        var ccpmPal = PurgeMem_buildUI(thisObj);
        if (ccpmPal !== null) {
            if (ccpmPal instanceof Window) {
                // Show the palette
                ccpmPal.center();
                ccpmPal.show();
            } else
                ccpmPal.layout.layout(true);
        }
    }
})(this);