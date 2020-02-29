// clearImportSettings.jsx
//
// Name: clearToolboySettings
// Version: 1.0
// Author: Aleksandar Kocic
//


(function clearImportSettings(thisObj) {

    function deleteOutputPrefs() {
        var outputPrefsFile = new File(Folder.userData.fullName + "/Adobe/After Effects/" + parseFloat(app.version) + "/Adobe After Effects " + parseFloat(app.version) + " Prefs-indep-output.txt")
        var delCommand = 'del ' + '"' + outputPrefsFile.fsName + '"';

        if (outputPrefsFile.exists == true) {
            app.setSavePreferencesOnQuit(false)
            system.callSystem("cmd.exe /c \"" + delCommand + "\"");
        } else {
            alert("Something went wrong!")
        }
    }

    // Run script
    if (confirm("This will clear your output settings. Do you wish to continue?")) {
        try {
            deleteOutputPrefs();
            alert("Settings cleared successfully!\r\rAfter effects will quit now.");
            app.quit()
        } catch (e) {
            alert(e);
        }
    } else {
        // Do nothing!
    }
})(this);
