var myFile = new File("C://Program Files//Adobe//Adobe After Effects CS6//Support Files//Scripts//ScriptUI Panels//(eipixTools)//elm//afterfx.csv");
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

alert(pathColumn);



function numProps(obj) {
    var c = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key))++c;
    }
    return c;
}

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