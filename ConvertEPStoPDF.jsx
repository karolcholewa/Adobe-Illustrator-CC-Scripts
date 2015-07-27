    /************************************************************************************************************************************
        Script for Adobe Illustrator CC to convert Illustrator files (.AI or .EPS) to .PDF. 
        I needed to get rid of hidden layers as well and resize the artboard so it matches my template.

    ************************************************************************************************************************************/
    var sourceFolder,
        files,
        fileType,
        doc,
        art,
        artSize,
        artboardSize;

    //Choose the source folder
    sourceFolder = Folder.selectDialog('Select the folder with vector files you want to convert to PDF');
    if (!sourceFolder) {
        throw new Error("No such folder exists");
    }

    //Filter file types using a wildcard. I use the script primarily to convert EPS files to PDFs
    fileType = prompt("Select the vector file types you want to process. Use a relevant wildcard to match the file types e.g. *.eps or *.ai", "*.eps");

    //Get all the matching files and store them to an array
    files = sourceFolder.getFiles(fileType);
    if (!files.length) {
        throw new Error("No matching files found");
    };

    //Main function
    function convert(files) {
        for (var i = 0; i < files.length; i++) {
            doc = app.open(files[i]); //returns the document object and also the active document
            artSize = doc.geometricBounds;
            artboardSize = doc.artboards[0].artboardRect;
            var initialArtSize = artSize;
            var artWidth = artSize[2] - artSize[0];
            var artHeight = artSize[1] - artSize[3];

   //My art size must fit into a Letter or A4 page therefore the default artboard template for Windows is 501px X 567px. The art size is never larger than the artboard itself.

            switch (true) {
                case (artWidth <= 480 && artHeight <= 540):
                    artSize[0] -= 10;
                    artSize[2] += 10;
                    artSize[1] += 10;
                    artSize[3] -= 10;
                    doc.artboards[0].artboardRect = artSize;
                    break;
                case (artWidth <= 480 && artHeight > 540):
                    artSize[0] -= 10;
                    artSize[2] += 10;
                    doc.artboards[0].artboardRect = artSize;
                    break;
                case (artWidth > 480 && artHeight <= 540):
                    artSize[1] += 10;
                    artSize[3] -= 10;
                    doc.artboards[0].artboardRect = artSize;
                    break;
                default:
                    break;
            }

            artSize = initialArtSize;
            removeHiddenLayers(doc);
            saveFileToPDF(sourceFolder);
            doc.close();
            doc = null;

    //Write to ExtentScript Toolkit JavaScript Console            
          $.writeln("W=" + Math.round(artSize[2] - artSize[0]) + " H=" + Math.round(artSize[1] - artSize[3]));

        };

    };


    //Sometimes the file contains hidden layers and I want to remove all hidden layers
    function removeHiddenLayers(doc) {
        for (var i = doc.layers.length -1; i >= 0; i--) {
            var activeLayer = doc.layers[i];
            if (!activeLayer.visible) {
                activeLayer.visible = true;
                activeLayer.locked = false;
                activeLayer.remove();
            }
        }
    };


    //Save to PDF format with default PDF settings. You can modify relevant properties
    function saveFileToPDF(dest) {
        var doc = app.activeDocument;
        if (app.documents.length > 0) {
            var saveName = new File(dest);
            saveOpts = new PDFSaveOptions();
            doc.saveAs(saveName, saveOpts);
        }
    };


    //Call the main function
    convert(files);