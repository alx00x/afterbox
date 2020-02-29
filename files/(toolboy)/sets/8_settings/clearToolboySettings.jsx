// clearToolboySettings.jsx
//
// Name: clearToolboySettings
// Version: 1.0
// Author: Aleksandar Kocic
//


(function clearToolboySettings(thisObj) {

    function clearFunction() {
        var sectionName = "Toolboy";
        var keyArray = ["Commit Date", "Commit Hash", "Ignore List", "Repo URL", "Update"];
        for (var i = 0; i < keyArray.length; i++) {
            if (app.settings.haveSetting(sectionName, keyArray[i]) == true) {
                app.preferences.deletePref("Settings_" + sectionName, keyArray[i]);
            }
        }
        app.preferences.saveToDisk();
    }

    // Run script
    if (confirm("This will clear your Toolboy settings. Do you wish to continue?")) {
        try {
            clearFunction();
            alert("Settings cleared successfully!\r\rYou should restart your Toolboy panel now.");
        } catch (e) {
            alert(e);
        }
    } else {
        // Do nothing!
    }
})(this);
