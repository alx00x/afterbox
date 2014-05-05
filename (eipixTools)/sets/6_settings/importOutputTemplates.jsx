// importOutputSettings
// by Simon Bjork
// Version 1.1
// August 2011
// bjork.simon@gmail.com

var etcFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(eipixTools)/etc");
var templatePath = new File(etcFolder.fsName + "/outputTemplates.aep");

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
    var project = File(projectPath);

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
                } // if(templateArray[j] == outputName){
            } // for(var j = 0; j<=templateArray.length;j++){        
            if (templateExists == false) {
                myRQ.item(i).outputModules[1].saveAsTemplate(outputName);
            } // if(templateExists == false){
        } // for(var i = 1; i<=myRQ.numItems; i++) {

        // See if any templates were added.
        if (counter == myRQ.numItems) {
            alert("All output templates already exists.");
        }

        // Open old project.
        app.beginSuppressDialogs();
        app.open(project);
        app.endSuppressDialogs(false);

    } else { // if(saveProj == true){
        alert("No output templates were imported.");
    }

}

// Run script.
importFunction();