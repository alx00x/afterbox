// importOutputSettings.jsx
//
// Name: importOutputSettings
// Version: 1.2
// Author: Simon Bjork, bjork.simon@gmail.com
// Edited by: Aleksandar Kocic
//
// Description:
// This script adds output templates from a template file.
//


(function importOutputSettings(thisObj) {
    var etcFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(eipixTools)/etc");
    var templatePath = new File(etcFolder.fsName + "/outputTemplates.aet");

    function importFunction() {
        // Check to see if the project file is saved.
        if (!app.project.file) {
            alert("Please save the project and run the script again.");
            app.project.saveWithDialog();
            return;
        }

        // Check to see if the template project exists.
        var templateProj = File(templatePath);
        if (!templateProj.exists) {
            alert("Can't find the template project. Current path is: " + templatePath + ". Open the script in a text editor and change the user variable at the top to the correct path.");
            return;
        }

        // Path to current project.
        var projectPath = app.project.file.fsName.toString();
        var projectOrigin = new File(projectPath);

        // Import and save output templates.
        var saveProj = confirm("Press OK to save the project before importing the render templates.");
        if (saveProj == true) {
            app.project.save();
            app.open(templateProj);

            var counter = 0;
            var myRQ = app.project.renderQueue;
            var templateArray = app.project.renderQueue.item(1).outputModules[1].templates;

            for (var i = 1; i <= myRQ.numItems; i++) {
                var outputName = app.project.item(i).name.substr(3);
                var templateExists = false;
                for (var j = 0; j <= templateArray.length; j++) {
                    if (templateArray[j] == outputName) {
                        templateExists = true;
                        counter = counter + 1;
                        break;
                    }
                }
                if (templateExists == false) {
                    myRQ.item(i).outputModules[1].saveAsTemplate(outputName);
                }
            }

            // See if any templates were added.
            if (counter == myRQ.numItems) {
                alert("All output templates already exists.");
            }

            // Open old project.
            app.beginSuppressDialogs();
            app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES)
            app.open(projectOrigin);
            app.endSuppressDialogs(false);

        } else { // if(saveProj == true){
            alert("No output templates were imported.");
        }
    }

    // Run script
    if (parseFloat(app.version) < 11.0) {
        alert("This script requires Adobe After Effects CS6 or later.");
    } else {
        importFunction();
    }
})(this);
