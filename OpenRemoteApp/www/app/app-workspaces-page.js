/*
Author: Joseph Francis
License: MIT
*/
//---  DataTablesPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisSiteSpecs = {
        pageName:"WorkspacesPage", 
        pageTitle: "Workspaces", 
        pageActionPrefix: 'ws',
        linkDisplayOption:'both',
        //pageTemplate:'app-pages-ws',
        appModule:AppModule
    };

    thisSiteSpecs.layoutOptions = {
        facetPrefix: thisSiteSpecs.pageActionPrefix,
        north: true,
        west: false,
        east: false
      
    }

    //--- Start with a ase SitePage component
    var ThisPage = new SiteMod.SitePage(thisSiteSpecs);
    ThisPage.compInit = compInit;
    function compInit() {
        ThisPage.loadRegion('north', '',thisSiteSpecs.pageActionPrefix + ':page-header')
        ThisPage.loadRegion('south', '',thisSiteSpecs.pageActionPrefix + ':page-footer')
        ThisPage.loadRegion('center', '',thisSiteSpecs.pageActionPrefix + ':page-body')
    }


    ThisPage.currentSessionDB = 'dbname';

    ThisPage.LocalCouchUser = 'adminapi';
    ThisPage.LocalCouchPassword = 'asldksdijfjd11joijs3';

    //---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 
    ThisPage.currentWorkspace = 'default';

    //--- Used to ellipse text
    function textEllipsis(el, text, width) {
        el.textContent = text;
        width -= 2;
        if (typeof el.getComputedTextLength !== "undefined") {
            while (el.getComputedTextLength() >= width) {
                text = text.slice(0, -1);
                el.textContent = text + "...";
            }
        } else {
            // the last fallback
            while (el.getBBox().width >= width) {
                text = text.slice(0, -1);
                // we need to update the textContent to update the boundary width
                el.textContent = text + "...";
            }
        }
    }

    ThisPage.boxCount = 0;

    ThisPage.addBox = function () {
       alert('add box');

    }
    ThisPage.addBox1 = function () {
       alert('not implemented')
    }

    ThisPage.workspaceTest = function () {
        var tmpMarkup = '<hr/>Added to Out';
        ThisApp.addToFacet('ws:workspaces-out', tmpMarkup);
    }
    ThisPage.runTest1 = function () {
        var tmpContentHTML = 'Hello <b>World</b>';


        var pouchOpts = {
            skipSetup: true
        };
        // var db = new PouchDB('dbname');

        // db.put({
        //     _id: 'attach1',
        //     _attachments: {
        //         'myattachment.html': {
        //             content_type: 'text/html',
        //             data: btoa(tmpContentHTML)
        //         }
        //     }
        // });

        var remoteDB = new PouchDB('http://localhost:5984/' + ThisPage.currentSessionDB, pouchOpts);
        remoteDB.put({
            _id: 'attach3',
            _attachments: {
                'myattachment.html': {
                    content_type: 'text/html',
                    data: btoa(ThisPage.contentHTML)
                }
            }
        });
        console.log("Did it")
        // remoteDB.login(ThisPage.LocalCouchUser, ThisPage.LocalCouchPassword).then(function (user) {


        // }).on('error', function (err) {
        //     console.error("error in replication", err);

        // });
        // return remoteDB.logout();



    }

    ThisPage.pullSessionsFromLocal = pullSessionsFromLocal;
    function pullSessionsFromLocal() {
        showOutLoading();
        var db = new PouchDB(ThisPage.currentSessionDB);

        var pouchOpts = {
            skipSetup: true
        };

        var remoteDB = new PouchDB('http://localhost:5984/' + ThisPage.currentSessionDB, pouchOpts);

        db.replicate.from(remoteDB).on('complete', function () {
            console.log("Pulled down session from CouchDB");
            ThisApp.loadFacet('ws:home-out', "Replication Pull From DB Complete");
        }).on('error', function (err) {
            console.error("error in replication", err);
            ThisApp.loadFacet('ws:home-out', "Replication Error, see console");
        });
    }



 //--- Templates ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 

    var tmpModuleTemplates = {};
    
    tmpModuleTemplates[thisSiteSpecs.pageActionPrefix +":page-header"] = '<div class="ui menu" style="padding-bottom:0;margin-bottom:0"> <a appuse="tablinks" group="ws:tabs" item="home" action="showSubPage" class="active item">Dashboard</a> <a appuse="tablinks" group="ws:tabs" item="all" action="showSubPage" class="item">Workspaces</a> <a appuse="tablinks" group="ws:tabs" item="more" action="showSubPage" class="item">More</a>';

    tmpModuleTemplates[thisSiteSpecs.pageActionPrefix +":page-footer"] = '<h1>Workspaces Footer</h1>';
    var tmpAllBody = '';
    tmpAllBody += '<h3 class="mobileonly">My Workspaces</h3> <div appuse="cards" group="ws:tabs" item="home"> <div class="ui" style="padding-top:5px;margin-top:0px;min-height:300px;"> <div class="requests-outline"> <svg facet="ws:home-svg" viewBox="0 0 800 800" style="width:100%;min-height:400px;background-color:black"> </div> <div class="requests-details"> <div class="ui menu flow middle" style=""> <div class="item"> <div action="ws:runTest1" class="ui primary basic icon button"><i class="icon home"></i></div> </div> <div class="item"> <div action="ws:addBox" class="ui purple basic button">Add Box</div> </div> </div> <div facet="ws:home-out"></div> </div> </div> </div> <div appuse="cards" group="ws:tabs" item="all" class="hidden"> <div>Workspace: <b><span facet="ws:currentWorkspace">';
    tmpAllBody += ThisPage.currentWorkspace;
    tmpAllBody += '</span></b></div> <div class="ui menu flow middle" style=""> <div class="item"> <div action="ws:gotoMainWorkspace" class="ui primary basic icon button"><i class="icon home"></i></div> </div> <div class="item"> <div action="ws:workspaceTest" class="ui purple basic button">Workspace Testing</div> </div> </div> <div facet="ws:workspaces-out"></div> </div> <div appuse="cards" group="ws:tabs" item="more" class="hidden"> <div class="ui segment"> <p>Testing some values here</p> <div class="ui active"> <div class="ui loader"></div> </div> </div> </div> </div>';

    tmpModuleTemplates[thisSiteSpecs.pageActionPrefix +":page-body"] = tmpAllBody;
    
    tmpModuleTemplates["svg-test-1"] = '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="210mm" height="297mm" viewBox="0 0 210 297" version="1.1" id="svg1985" inkscape:version="0.92.1 r15371" sodipodi:docname="data-comp-db.svg"> </svg>';

    $.templates(tmpModuleTemplates);



})(ActionAppCore, $);
