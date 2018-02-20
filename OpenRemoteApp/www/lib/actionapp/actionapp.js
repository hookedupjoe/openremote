/*
ActionAppCore Core Library
Author: Joseph Francis, 2017
License: MIT
*/

/**  
 *   About ActionAppCore
 *   

What is an Action?
 - An action is a registered function with a name, so when you say ..
    "run action doSomethingCool" ... something cool happens.

 - How do you say "run action"?
   That is the key to simplicity .. once an action is registered, there are lots of ways to call it.
   The primary way to call an action is to add an attribute to any element, 
    ... such as ... <div action="doSomethingCool" >Do it</div>, when clicked, something cool will happen.

Key features: 
  - Action based, which means "actions" are at the core of most "actions"
  - Simple, all the source code for the base system is a single, small file (this one).
  - Modular, so that all components are in their own function bubble yet can still communicate with each other easily
  - Repeatable, programming by exception, just start with a working, responsive application frame and go
  - Template based, making it easy to create dynamic content, but templating is not required
  - Comes with tons of libraries to make getting started easy

Key concepts / features the application framework provides:
  - Common / responsive navigational components such as primary pages and sub-tabs
    * Navigation areas can be included in the top menu and/or the sidebar
  - Common way to add a special "appaction" attribute to any element and have it trigger a common or custom function
    * So there is no need to have onclick events or other bindings
  - Application Actions use attributes on the target element to look for related parameters, such as the ID of the selected item
    * So there is no need to specify a bunch of parameters in function calls
  - Custom application modules and plugins use the concept of namespaces to assure uniqueness
  - Common subscribe / public service available
  - Common component repository allows for components and modules to register and hence be retrieved and communcated with directly
  - Common messages methodology with toaster option to pop them up and ways to clear / retrieve them easily
  - Common way to find and update DOM elements using attributes, used extensively for it's simplicity and power
  - Common concept of a "facet", which simply any element with a facet="area:item", allowing for simple content targeting
  - Plugin modules provide extended common and custom functionatlity that can be used across other modules
*/

//--- Global Entry Point
window.ActionAppCore = {};

//--- Base module and simple module system --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {
    var modules = {};

    //--- Create module
    ActionAppCore.createModule = function (theModName, theOptionalModuleContent) {
        if (modules.hasOwnProperty(theModName)) {
            throw { error: "Module already exists", module: theModName }
        }
        modules[theModName] = theOptionalModuleContent || {};
        return modules[theModName];
    };
    //--- get / use module
    ActionAppCore.module = function (theModName) {
        if (!modules.hasOwnProperty(theModName)) {
            throw { error: "Module does not exists", module: theModName }
        }
        return modules[theModName];
    }

})(ActionAppCore, $);


//--- Common Modules --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    ActionAppCore.createModule("site");
    ActionAppCore.createModule("plugin");

})(ActionAppCore, $);

//--- CoreApp Standard App Component ---- ---- ---- ---- ---- ---- ---- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    SiteMod.CoreApp = CoreApp;



    //--- Base class for application pages
    function CoreApp(theOptions) {
        me.options = theOptions || {};
        me.actions = me.options.actions || {};
        me.actionsDelegates = me.options.actionsDelegates || {};

        var defaults = {};
        me.events = $({});
        me.$window = $(window);
        me.$document = $(document);


        me.pagesGroup = "app:pages";

        me.messages = [];
        me.messagesAt = 0;
        me.navConfig = {};

        me.getNavConfig = function (theName) {
            return me.navConfig[theName];
        }


        me.registerNavLink = function (theNavObject) {
            if (!(theNavObject)) { return false };
            var tmpName = theNavObject.name || '';
            me.navConfig[tmpName] = theNavObject;
            me.config.navlinks.push(theNavObject)
            return true;
        }

        me.getMessages = function () {
            return me.messages;
        }
        me.getMessageCount = function () {
            return me.messagesAt;
        }
        me.clearMessages = function () {
            me.messages = [];
            me.messagesAt = 0;
        }

        /**
         * showMessage
        *  - Shows a message and saves in messages array, optionall with related saved data
        * 
        * Example: 

        * ThisApp.showMessage("Just some info");
        * ThisApp.showMessage("Successful message here.", true, "It was updated", { what: "nothing" });
        * ThisApp.showMessage("Warning, Warning, Warning!", "w", "This is just a warning", { reason: "testing" });
        * ThisApp.showMessage("There was an error, in case you want to take action.", false, false, { reason: "testing" });

        * 
        * @param  {String} theMsg   [The name of the facet to load]
        * @param  {String} theOptionalType   [info, warning, error, success] Default: info
        *  "info" or <blank> 
        *  "warning" or "w"
        *  "error" or "e" or false
        *  "success" or "s" or true
        * @param  {String} theOptionalTitle   [The title, no title if excluded]
        * @param  {String} theOptionalData   [The optional data to be stored with the message log]
        * @return void
        * 
        */
        me.showMessage = function (theMsg, theOptionalType, theOptionalTitle, theOptionalData) {
            var tmpType = "info";
            if (typeof (theOptionalType) == 'string') {
                theOptionalType = theOptionalType.toLowerCase();
                if (theOptionalType == "warning" || theOptionalType == "error" || theOptionalType == "success") {
                    tmpType = theOptionalType;
                } else if (theOptionalType == "w") {
                    tmpType = "warning";
                } else if (theOptionalType == "e") {
                    tmpType = "error";
                } else if (theOptionalType == "s") {
                    tmpType = "success";
                }
            } else if (typeof (theOptionalType) == 'boolean') {
                if (theOptionalType == true) {
                    tmpType = "success";
                } else if (theOptionalType == false) {
                    tmpType = "error";
                }
            }
            var tmpMsgPos = (me.messagesAt++);
            var tmpData = false;
            if (theOptionalData) {
                tmpData = theOptionalData
            }
            var tmpMsgObj = {
                text: theMsg,
                type: tmpType,
                title: theOptionalTitle || '',
                pos: tmpMsgPos,
                data: theOptionalData
            }

            me.messages.push(tmpMsgObj)

            if (typeof (theOptionalTitle) == 'string') {
                toastr[tmpType](theMsg, theOptionalTitle);
            } else {
                toastr[tmpType](theMsg);
            }
            me.publish("message:sent", tmpMsgObj);
        }

        /**
          * subscribe / unsubscribe / publish
          *     - Standard Pub / Sub functionality
         * 
         * 
         * @return void
         * 
         */
        me.subscribe = function () {
            ThisApp.events.on.apply(ThisApp.events, arguments);
        };

        me.unsubscribe = function () {
            ThisApp.events.off.apply(ThisApp.events, arguments);
        };

        me.publish = function () {
            ThisApp.events.trigger.apply(ThisApp.events, arguments);
        };



    }

    var me = CoreApp.prototype;
    me.components = {};

    /**
       * loadFacet
       *  - Load HTML content or renders a jsRender template into a known facet name
       * 
       * Example: ThisApp.loadFacet('myarea:out', '', 'tpl-some-registered-template');
       *   - This loads the facet <div facet="myarea:out" ... with a rendered template 'tpl-some-registered-template'
       *
       * 
       * Note:  theContent is usually HTML if no template name passed
       *        theContent can be blank, a string value or an objet to be passed into the template for rendering
       *        if there is a string value for theOptionalTemplateName, 
       *         ... theOptionalTemplateName is used to render the content and theContent passed as the input
       * 
       * 
       * @param  {String} theName   [The name of the facet to load]
       * @param  {String} theContent   [The content to load or object to use when rendering the template]
       * @param  {String} theOptionalTemplateName   [The content to load or object to use when rendering the template]
       * @return void
       * 
       * 
       */
    me.loadFacet = function (theName, theContent, theOptionalTemplateName) {
        var tmpSelector = '[facet="' + theName + '"]';
        var tmpContent = theContent || '';
        if (theOptionalTemplateName) {
            tmpContent = $.templates[theOptionalTemplateName].render(tmpContent);
        }
        var tmpFacet = $(tmpSelector);
        tmpFacet.html(tmpContent);
        return tmpFacet;
    }

    /**
       * addToFacet
       *  - Appends or Prepends to existing facet content
       * 
       * Example: See loadFacet for more details
       * 
       * 
       * @param  {String} theName   [The name of the facet to append/prepend to]
       * @param  {String} theContent   [The content to load or object to use when rendering the template]
       * @param  {String} theOptionalTemplateName   [The content to load or object to use when rendering the template]
       * @param  {String} thePrepend   [true to prepend, blank or false to append (default)]
       * @return void
       * 
       * 
       */
    me.addToFacet = function (theName, theContent, theOptionalTemplateName, thePrepend) {
        var tmpSelector = '[facet="' + theName + '"]';
        var tmpContent = theContent || '';
        if (theOptionalTemplateName && theOptionalTemplateName != '' && theOptionalTemplateName != null) {
            tmpContent = $.templates[theOptionalTemplateName].render(tmpContent);
        }
        var tmpFacet = $(tmpSelector);
        if (thePrepend === true) {
            tmpFacet.prepend(tmpContent);
        } else {
            tmpFacet.append(tmpContent);
        }
        return tmpFacet;
    }

    /**
   * getFacet$
   *  - Returns jQuery element for the facet name provided
   *  - Optionally pass a parent element as the scope to look in
   * 
   * Example: 
   *   var tmpEl = ThisApp.getFacet('main:out')
   *   var tmpEl = ThisApp.getFacet('main:out',parentEl)
   * 
   * @param  {String} theName   [The name of the facet to append/prepend to]
   * @param  {jQuery Element} theOptionalParent   [The parent to find in, uses global search if not provided]
   * @return {jQuery Element} [The facet element]
   * 
   */
    me.getFacet$ = function (theName, theOptionalParent) {
        var tmpSelector = '[facet="' + theName + '"]';
        var tmpParent = false;
        if (theOptionalParent && theOptionalParent != null) {
            tmpParent = theOptionalParent;
            if (!tmpParent.attr) {
                tmpParent = $(tmpParent);
            }
        }
        if (tmpParent) {
            return tmpParent.find(tmpSelector);
        } else {
            return $(tmpSelector);
        }
    }


    /**
       * gotoPage
       * Goes to a page on the site
       *
       * @param  {String} thePageName   [The unique page name to open]
       * @return this
       */
    me.gotoPage = function (thePageName) {
        me.gotoTab({ group: 'app:pages', item: thePageName, animation: 'slide down', duration: 10 });
        var tmpActionObj = ThisApp.getNavConfig(thePageName);
        if (tmpActionObj && typeof (tmpActionObj.onActivate) == 'function') {
            tmpActionObj.onActivate();
        }
        me.hideSidebar();
        
        ThisApp.refreshLayouts();
        return me;
    }


    /**
     * Show / hide the sidebar
     *
     * @param  {Boolean} theIsVis   [true to show, false to hide]
     * @return this
     */


    me.sidebarSetDisplay = function (theIsVis) {
        $('[appuse="side-menu"]').sidebar((theIsVis !== false) ? 'show' : 'hide');
        return me;
    }
    me.sidebarGetDisplay = function () {
        return $('[appuse="side-menu"]').sidebar('is visible');
    }
    me.hideSidebar = function () {
        return me.sidebarSetDisplay(false);
    }
    me.showSidebar = function () {
        return me.sidebarSetDisplay(true);
    }



    /**
     * gotoTab
     * 
     * To Use:  
     * 
     *  Go to a top level page
     *      ThisApp.gotoTab({page:'mainpage'})
     *  Go to a sub tab (assuming on current main page)
     *      ThisApp.gotoTab({group:'some:group', item:'some:item"})
     *  Go to a top level page and a sub tab on that page
     *      ThisApp.gotoTab({page:'mainpage', group:'some:group', item:'some:item"})
     *
     * Options:
     *  - group = Name of the group, usually namespaced like main:tabs
     *  - item = Name of the item to show within the group, like 'main'
     *  - page = Optional primary page to open in case on a different page
     * 
     * Example: 
     *          var tmpInitialSpot = {
     *            page:'logs',
     *            group:'logs:tabs',
     *            item: 'jobs'
     *          };
     *          ThisApp.gotoTab(tmpInitialSpot);
     *
     *
     * @param  {Object} theOptions   [object with details that control what tab and/or page to open]
     * @return this
     */
    me.gotoTab = function (theOptions) {
        var tmpOptions = theOptions || {};
        var tmpHadPage = false;
        if (tmpOptions.hasOwnProperty('page')) {
            me.gotoPage(tmpOptions.page);
            tmpHadPage = true;
        }
        if ((tmpOptions.group && tmpOptions.item)) {
            me.gotoTabLink(tmpOptions);
            me.gotoCard(tmpOptions);
        } else {
            if (!tmpHadPage) {
                console.error("Can not go to tab, group and item are required.")
            }
        }
        return me;
    }

    /**
     * gotoCard
     *   - Hides all the related cards and show the card within a card group
     * 
     * Options:
     *  - group = Name of the group, usually namespaced like main:tabs
     *  - item = Name of the card to show within the group, like 'main'
     *  - parent = Optional parent jQuery element to look inside
     *  
     * To Use:  
     * 
     *  Show the specific card in the group, assuming to look at the entire page 
     *      ThisApp.gotoCard({group:'some:group', item:'some:item'})
     *  Show the specific card in the group, within the parent element passed
     *      ThisApp.gotoCard({group:'some:group', item:'some:item', parent: someEl})
     *
     * @param  {Object} theOptions   [object with details that control what tab and/or page to open]
     * @return this
     */

    me.gotoCard = function (theOptions) {
        var tmpOptions = theOptions || {};
        var tmpGroupName = tmpOptions.group || '';
        var tmpItemId = tmpOptions.item || '';
        var tmpParent = theOptions.parent || undefined;
        var tmpAnimation = tmpOptions.animation || 'fade';
        var tmpAnimDuration = tmpOptions.duration || 250;
        var tmpSelector = {
            appuse: 'cards',
            group: tmpGroupName
        }
        me.getByAttr$(tmpSelector, tmpParent).addClass('hidden').transition('hide', 1);
        tmpSelector.item = tmpItemId;
        me.getByAttr$(tmpSelector, tmpParent).removeClass('hidden').transition(tmpAnimation + ' in', tmpAnimDuration);
        if( ThisApp.refreshLayouts ){
            ThisApp.refreshLayouts();
        }
        return me;
    }


    /**
     * gotoTabLink
     *   - Hides all the related cards and show the card within a card group
     * 
     * Options:
     *  - group = Name of the group, usually namespaced like main:tabs
     *  - item = Name of the card to show within the group, like 'main'
     *  - parent = Optional parent jQuery element to look inside
     *  
     * To Use:  
     * 
     *  Show the specific card in the group, assuming to look at the entire page 
     *      ThisApp.gotoCard({group:'some:group', item:'some:item'})
     *  Show the specific card in the group, within the parent element passed
     *      ThisApp.gotoCard({group:'some:group', item:'some:item', parent: someEl})
     *
     *
     * @param  {Object} theOptions   [object with details about the page / tab to open]
     * @return void
     */
    me.gotoTabLink = function (theOptions) {
        var tmpOptions = theOptions || {};
        var tmpGroupName = tmpOptions.group || '';
        var tmpItemId = tmpOptions.item || '';
        var tmpParent = theOptions.parent || undefined;
        var tmpAnimation = tmpOptions.tabAnimation || 'fade';
        var tmpAnimDuration = tmpOptions.duration || 1000;

        //--- Create a list of attributes to look for
        //  * appuse is tablink and the group is this group
        var tmpSelector = {
            appuse: 'tablinks',
            group: tmpGroupName
        }
        //--- Remove the 'active' class from all matching items for this group that are tablinks
        //--- Note: The getByAttr$ returns the elements, jQuery's removeClass 
        //          returns the elements being effected for chaining
        var tmpAll = me.getByAttr$(tmpSelector)
            .removeClass('active');

        //--- Add the item selector to update the search to find just the one that is active
        tmpSelector.item = tmpItemId;
        //--- Add the 'active' class to the one item we have
        //--- Note: This calls me.getByAttr$ not ThisApp.getByAttr$, which by default only searches this tab page content
        //--  Note: The reason tmpAll is passed is to keep the scope down to the active ones, since we 
        //          have a handle to those already, that is optional, if not passed, just this page is passed
        me.getByAttr$(tmpSelector, tmpAll).addClass('active');
    }


    //--- Public ================ ================= ===================== ================


    /**
     * getAttrs
     *    - returns an object with the attribute values matching the array of names passed
     * 
     * To Use: var tmpAttribs = ThisApp.getAttrs(anyEl,['item','group']);
     *    - returns an object with {item:"val",group:"val"}
     *
     * @param  {String} theAction   [name of the action (showSubPage)]
     * @param  {Object} theTargetObj   [target object with details about the page to open]
     * @return {Object} [node name = attribute, node value = attribute value]
     */
    me.getAttrs = function (theEl, theAttrList) {
        var tmpRet = {};
        if (!theEl) {
            return tmpRet;
        }
        var tmpAttrList = theAttrList || {};
        if (typeof (tmpAttrList) == 'string') {
            tmpAttrList = [tmpAttrList];
        }
        var tmpEl = $(theEl);
        for (aAttrPos in tmpAttrList) {
            var tmpAName = tmpAttrList[aAttrPos];
            if (tmpAName) {
                tmpRet[tmpAName] = tmpEl.attr(tmpAName);
            }
        }
        return tmpRet;
    }

    /**
     * getByAttr$
     *    - returns a jQuery element collection (which may be one) that matches the attributes passed
     *    - the same as using [ATTRIBUTENAME="SOMEVALUE"][ATTRIBUTENAME2="SOMEVALUE2"]
     * 
     * To Use: var tmpEls = ThisApp.getByAttr$({ group: "THEGROUPNAME", "item": "THEITEMNAME" })
     *    - returns jQuery elements, use as usual  -  i.e. tmpEls.html(tmpContentHTML); or tmpEls.removeClass('active');
     * 
     * Note: If a blank value is passed
     * 
     *
     * @param  {Object} theItems   [object where the name is the attibute and the value is the value to look for]
     * @param  {Object} theParent   [parent object to search in, if not provided, a global search is done]
     * @param  {Boolean} theExcludeBlanks   [set to true to ignore blank values]
     *         * Important: By default if an attribute that has no value to find is passed (present but blank)
     *                then ALL items that contain the attribute will be included.
     *                 the same as using [ATTRIBUTENAME="SOMEVALUE"][ATTRIBUTENAME2]
     *           Setting theExcludeBlanks to true will use [ATTRIBUTENAME="SOMEVALUE"] (leaving the item out)
     * 
     * @return {$el} [jQuery element collection (which may be one)]
     */
    me.getByAttr$ = function (theItems, theParent, theExcludeBlanks) {
        if (!theItems) {
            return false;
        }
        var tmpFoundItems = false;
        var tmpSS = '';
        for (aItemName in theItems) {
            if ((aItemName)) {
                var tmpVal = theItems[aItemName];
                tmpFoundItems = true;
                var tmpSSItem = '';
                if (tmpVal) {
                    tmpSSItem = '[' + aItemName + '="' + tmpVal + '"]'
                } else {
                    if (theExcludeBlanks !== true) {
                        tmpSSItem = '[' + aItemName + ']'
                    }
                };
                tmpSS += tmpSSItem;
            }
        }

        if (!tmpFoundItems) {
            return false;
        }

        var tmpParent = false;
        if (theParent) {
            //--- Convert if there is a parent and it is not a jQuery element already
            if (typeof (theParent) != 'string' && theParent.hasOwnProperty('nodeType')) {
                tmpParent = $(theParent);
            }
        }
        if (tmpParent) {
            return tmpParent.find(tmpSS);
        } else {
            return $(tmpSS);
        }

    }

    /**
     * setDisplay
     *    - sets the attribute to hidden or not hidden
     * 
     * To Use: ThisApp.setDisplay(anyEl,anyBooleanValue);
     *
     * @param  {Object} theEl   [target object with details about the page to open]
     * @param  {Boolean} theIsVis   [true to show, false to hide]
     * @return void
     */
    me.setDisplay = function (theEl, theIsVis) {
        var tmpEl = $(theEl);
        if (theIsVis) {
            tmpEl.removeClass('hidden');
        } else {
            tmpEl.addClass('hidden');
        }
    }
    me.show = function (theEl) {
        me.setDisplay(theEl, true);
    }
    me.hide = function (theEl) {
        me.setDisplay(theEl, false);
    }

    me.initModuleComponents = initModuleComponents;
    function initModuleComponents(theApp, theModuleName, theComponents) {
        var appModule = ActionAppCore.module(theModuleName);
        for (var aPos in theComponents) {
            var tmpComp = theComponents[aPos];
            try {
                var tmpCompName = theComponents[aPos];
                var tmpComp = appModule[tmpCompName];
                theApp.registerComponent(theModuleName + ":" + tmpComp.pageName, tmpComp);
            } catch (ex) {
                console.error("Error in init component: " + theModuleName, ex);
            }
        }
    }

    /**
     * useModuleComponentsuseModuleComponents
     *    - Initializes application components from the modules they live in
     * 
     * To Use: 
     *   var tmpAppComponents = ['DataTablesPage', 'PouchPage', 'LogsPage'];
     *   var tmpPluginComponents = ['DataTables'];
     *   ThisApp.useModuleComponents('app', tmpAppComponents)
     *   ThisApp.useModuleComponents('plugin', tmpPluginComponents)
     *
     *  Note: Order matters, they load in the order provided, 
     *        ... if components add their own navigational items, the navigation items show in that order
     *
     * @param  {String} theModuleName   [the name of the module (i.e. app or plugin or any custom module)]
     * @param  {Array<String>} theComponentNames   [List of component to load form this module, in the order they should initialize]
     * @return void
     */
    me.useModuleComponents = useModuleComponents;
    function useModuleComponents(theModuleName, theComponentNames) {
        if (!theModuleName && theComponentNames) {
            console.error("Need both theComponentNames and theModuleName");
            return false;
        }
        var tmpComponentNames = theComponentNames || [];
        if (typeof (tmpComponentNames) == 'string') {
            tmpComponentNames = [tmpComponentNames];
        }
        var tmpModule = ActionAppCore.module(theModuleName);
        if (!(tmpModule)) {
            console.error("Module not found: " + tmpModule);
            return false;
        }
        for (var aPos in tmpComponentNames) {
            var tmpName = tmpComponentNames[aPos];
            try {
                var tmpNew = new tmpModule[tmpName]({ app: ThisApp });
            } catch (ex) {
                console.error("Error loading component: " + tmpName);
            }
        }
        return true;
    }


    /**
     * getComponent
     *    - Returns any registered component by full name
     * 
     * To Use: 
     *   me.dt = ThisApp.getComponent("plugin:DataTables");
     *    - or - 
     *   me.logs = ThisApp.getComponent("app:Logs");
     *
     *  Note: You can then call the related component functions
     *        There is no need to get the component to use the related registered actions (i.e. <div appaction="logs:doSomeAction")
     *
     * @param  {String} theName   [the full name of the component to load including module name]
     * @return void
     */
    me.getComponent = getComponent;
    function getComponent(theName) {
        return me.components[theName];
    }

    /**
     * registerComponent
     *    - Register a component that can be received using getComponent
     * 
     * To Use: Implement your controller as shown below and register with the full module:ComponentName
     * 
     * 
     * Example: 
     * 
     * function ThisPageController(theOptions) {
     *   me.options = theOptions || {};
     *   me.actions = me.options.actions || {};
     *   var defaults = {};
     *   if (typeof (me.options.app) == 'object') {
     *       ThisApp = me.options.app;
     *       if (ThisApp && ThisApp.registerComponent) {
     *           ThisApp.registerComponent("app:PouchPage", this);
     *       }
     *   }
     * }
     *
     * @param  {String} theName   [the full name of the component to register including module name]
     * @param  {Object} theController   [The base object for the component being registered, usually "me"]
     * @return void
     */

    me.registerComponent = registerComponent;
    function registerComponent(theName, theController) {
        me.components[theName] = theController;
    }

    /**
     * registerAction
     *    - Register an action
     * 
     * Note: Usually components register a single action delegate function for all in the registered namespace
     *       ... see "registerActionDelegate" for details.
     * 
     * Example: 
     *   ThisApp.registerAction("doSomethingSpecial", me.doSomethingSpecial);
     * 
     *
     * @param  {String} theActionName   [the name of the action, do NOT include any module name prefix (:) here]
     * @param  {Object} theFunction   [The standard "Action" function to handle the action pass (action name, target object)]
     * @return void
     */
    me.registerAction = registerAction;
    function registerAction(theActionName, theFunction) {
        ThisCoreApp.actions[theActionName] = theFunction;
    }

    /**
     * registerActionDelegate
     *    - Register an delegate for all actions with a prefix using (:)
     * 
     * 
     * Example: 
     *   ThisApp.registerActionDelegate("previews", runAction);
     *    - this makes any <div appaction="previews:doSomething" .. 
     *     ...   go be routed to the callback "runAction" delegate function
     *
     * @param  {String} theActionDelegateName   [the prefix to use (do not iclude the ":")]
     * @param  {Function} theDelegate   [The standard "Action" function to handle the action pass (action name, target object)]
     * @return void
     */
    me.registerActionDelegate = registerActionDelegate;
    function registerActionDelegate(theActionDelegateName, theDelegate) {
        ThisCoreApp.actionsDelegates[theActionDelegateName] = theDelegate;
    }




    /**
     * runAppAction
     *    - Manually run an action passing the name and target object (jQuery element)
     * 
     * Example: 
     *   ThisApp.runAppAction("doSomethingSpecial", someEl);
     * 
     *
     * @param  {String} theAction   [the name of the action, you can include a module name prefix (:) here]
     * @param  {Object} theObject   [The object that contains the attributes that provide the target action parameters]
     * @return void
     */
    me.runAppAction = runAppAction;
    function runAppAction(theAction, theObject) {
        var tmpAction = theAction || '';
        var tmpASPos = tmpAction.indexOf(":");
        var tmpActionSpace = '';
        var tmpRan = false;

        var tmpObject = theObject;

        if (tmpASPos > -1) {
            tmpActionSpace = tmpAction.substr(0, tmpASPos);
            if (tmpActionSpace && ThisApp.actionsDelegates.hasOwnProperty(tmpActionSpace)) {
                var tmpAD = ThisApp.actionsDelegates[tmpActionSpace];
                if (typeof (tmpAD) == 'function') {
                    tmpAction = tmpAction.replace((tmpActionSpace + ":"), "");
                    tmpRan = true;
                    tmpAD(tmpAction, tmpObject);
                }
            }
        }

        if (!tmpRan) {
            var tmpAction = ThisCoreApp.actions[theAction] || ThisCoreApp[theAction];
            if (tmpAction) {
                return tmpAction(theAction, tmpObject);
            } else {
                console.error("No registered action for " + theAction);
                return null
            }
        }
    }


    /**
     * showCommonDialog
     *    - Shows the common dialog box with content provided
     * 
     * 
     * Example: 
     *   ThisApp.showCommonDialog();
     *
     * @param  {Object} theOptions   [The options object with header and content and optional actions]
     * @return this
     */
    me.showCommonDialog = showCommonDialog;
    function showCommonDialog(theOptions) {
        var tmpHeader = theOptions.header || '';
        var tmpContent = theOptions.content || '';
        if (typeof (tmpContent) == 'object') {
            tmpContent = me.getTemplatedContent(tmpContent);
        }
        ThisApp.loadFacet('site:dialog-header', tmpHeader);
        ThisApp.loadFacet('site:dialog-content', tmpContent);
        ThisApp.loadFacet('site:dialog-actions', ' ');
        getCommonDialog().modal('show');
        return me;
    }

    me.closeCommonDialog = closeCommonDialog;
    function closeCommonDialog() {
        getCommonDialog().modal('hide');
    }

    /**
     * getTemplatedContent
     *    - Returns HTML rendered from a template using jsrender
     * 
     * 
     * Example: 
     *   ThisApp.showCommonDialog('sometempaltename');
     *   ThisApp.showCommonDialog('sometempaltename',someData);
     *   ThisApp.showCommonDialog({tempate:'sometempaltename'});
     *   ThisApp.showCommonDialog({tempate:'sometempaltename', data:someData});
     *
     * @param  {String} theActionDelegateName   [the prefix to use (do not iclude the ":")]
     * @param  {Function} theDelegate   [The standard "Action" function to handle the action pass (action name, target object)]
     * @return void
     */
    me.getTemplatedContent = function (theOptionsOrTemplateName, theDataIfNotObject) {
        var tmpTemplateName = theOptionsOrTemplateName;
        var tmpData = theDataIfNotObject;
        if (typeof (theOptionsOrTemplateName) == 'object') {
            tmpTemplateName = theOptionsOrTemplateName.template;
            tmpData = theOptionsOrTemplateName.data || theDataIfNotObject || '';
        }
        tmpData = tmpData || '';
        if (!(tmpTemplateName)) {
            console.error("Need to pass template name as a string or an object with a .template")
            return;
        }
        return $.templates[tmpTemplateName].render(tmpData);
    }


    //--- App Actions ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 


    /**
     * AppAction: showPage
     * 
     * To Use:  <div appaction="showPage" item="THEPAGENAME">...
     *
     * @param  {String} theAction   [name of the action (showPage)]
     * @param  {Object} theTargetObj   [target object with details about the page to open]
     * @return this
     */
    var showPage = function (theAction, theTargetObj) {
        if (!theTargetObj) {
            theTargetObj = theAction;
        }
        var tmpPage = $(theTargetObj).attr("item") || '';
        if (tmpPage) {
            me.gotoPage(tmpPage);
        } else {
            console.error("No item provided");
        }
        return me;
    }

    /**
     * AppAction: showSubPage
     * 
     * To Use:  <div appaction="showPage" group="THEGROUPNAME" item="THEPAGENAME" >...
     *
     * @param  {String} theAction   [name of the action (showSubPage)]
     * @param  {Object} theTargetObj   [target object with details about the page to open]
     * @return this
     */
    var showSubPage = function (theAction, theTargetObj) {
        if (!theTargetObj) {
            theTargetObj = theAction;
        }
        var tmpPage = $(theTargetObj).attr("item") || '';
        var tmpGroupName = $(theTargetObj).attr("group") || '';
        if (tmpPage && tmpGroupName) {
            me.gotoTab({ group: tmpGroupName, item: tmpPage });
        } else {
            console.error("No pagename provided");
        }
    }




    //--- Internal Functionality ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 


    /**
    * me.commonDialog - globally used dialog, private variable used to assure proper usage
   */
    var commonDialog = null,
        commonDialogTemplate = 'tpl-common-global-dialog',
        commonDialogFacet = 'site:global-dialog';

    function getCommonDialog() {
        if (!commonDialog) {
            //var tmpFacet = ThisApp.loadFacet(commonDialogFacet,'',commonDialogTemplate);
            commonDialog = ThisApp.getByAttr$({ appuse: 'global-dialog' })
            commonDialog.modal('setting', { closable: true }); // example of using modal dialog
        }
        return commonDialog;
    }

    me.hasSidebar = false;

    function initMenus() {
        var tmpSBSelector = '[semaction="showsidebar"]';
        if ($(tmpSBSelector).length > 0) {
            me.hasSidebar = true;
            $('[appuse="side-menu"]')
            .sidebar('setting', 'duration', 20)
            .sidebar('setting', 'mobileTransition', 'fade')            
            .sidebar('attach events', tmpSBSelector);
        }
    }
    function initGlobalDialog() {
        me.loadFacet('site:global-dialog', '', 'tpl-common-global-dialog')
    }
    function initAppActions() {
        $('[appuse="appbody"]').on("click", itemClicked)
    }
    function instClicked(theEvent) {
        theEvent.preventDefault();
        theEvent.stopPropagation();
    }

    //---- Internal: Gets the action or appaction from the current element or the first parent element with such an entry,
    //               ... this is needed so when a child element is clicked, the proper parent action element is used.
    function _getActionFromObj(theObj) {
        var tmpObj = theObj;
        var tmpAction = $(tmpObj).attr("appaction") || $(tmpObj).attr("action") || "";
        if (!tmpAction) {
            var tmpParent = $(tmpObj).closest('[action]');
            if (tmpParent.length == 1) {
                tmpObj = tmpParent.get(0);
                tmpAction = $(tmpObj).attr("action") || "";
            } else {
                tmpParent = $(tmpObj).closest('[appaction]');
                if (tmpParent.length == 1) {
                    tmpObj = tmpParent.get(0);
                    tmpAction = $(tmpObj).attr("appaction") || "";
                    $(tmpObj).attr("action", tmpAction)
                } else {
                    return false; //not an action
                }
            }
        }
        return { action: tmpAction, el: tmpObj };
    }

    //---- Internal: Catch a click item to look for the action
    function itemClicked(theEvent) {
        var tmpObj = theEvent.target || theEvent.currentTarget || theEvent.delegetTarget || {};
        var tmpActionDetails = _getActionFromObj(tmpObj);
        if (!((tmpActionDetails.hasOwnProperty('action') || tmpActionDetails.hasOwnProperty('appaction')) && tmpActionDetails.hasOwnProperty('el'))) {
            //--- OK, just clicked somewhere with nothing to catch it, but not an action
            return;
        }
        var tmpAction = tmpActionDetails.action;
        tmpObj = tmpActionDetails.el;

        if (tmpAction) {
            theEvent.preventDefault();
            theEvent.stopPropagation();
            runAppAction(tmpAction, tmpObj);
        }
        return false;
    }


    function initMessageCenter() {
        toastr.options.closeButton = true;
        /*
        //--- Some other available options
        toastr.options.timeOut = 2000;
        toastr.options.extendedTimeOut = 6000;
         */
    }


    me.init = init;
    var ThisCoreApp = this;
    function init(theAppConfig) {
        
        ThisCoreApp = this;

        me.config = me.config || {};
        if (theAppConfig) {
            $.extend(me.config, theAppConfig)
        }
        me.config.navbuttons = me.config.navbuttons || [];
        me.config.navlinks = me.config.navlinks || [];
        me.registerAction("showPage", showPage);
        me.registerAction("showSubPage", showSubPage);

        me.$appPageContainer = $(me.config.container || '[appuse="main-page-container"]');

        for (var aName in me.components) {
            var tmpController = me.components[aName];
            //--- Call any plug in component init functions on init, if it has one
            if (tmpController && typeof (tmpController.init) == 'function') {
                tmpController.init(this);
            }
        }

        //--- Standard functionality  ===================================
       
        var tmpNavHTML = $.templates['tpl-side-menu-item'].render(me.config['navlinks']);
        $('[appuse="side-menu"]').html(tmpNavHTML);

        var tmpNavHTML = $.templates['tpl-nav-menu-item'].render(me.config['navlinks']);
        $('[appuse="nav-menu"]').html(tmpNavHTML);

        var tmpHeaderHTML = $.templates['tpl-top-menu'].render(me.config);
        $('[appuse="top-menu"]').html(tmpHeaderHTML);
         /* */

        initAppActions();

        initMessageCenter();
        initGlobalDialog();
        initMenus();

        if (me.config['navlinks']) {
            var tmpFirstNavLink = me.config['navlinks'][0];
            if (tmpFirstNavLink && tmpFirstNavLink.name) {
                ThisApp.gotoPage(tmpFirstNavLink.name);
            }
        }


    }





    //--- Templates ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    $.templates({
        "tpl-standard-loading-icon": '<div> <i class="huge icons"> <i class="big loading spinner icon"></i> </i> </div>'});

    $.templates({
        "tpl-border-layout": '{{if (layoutOptions.north != false)}} <div facet="{{>layoutOptions.facetPrefix}}:north" class="middle-north"> {{if (layoutOptions.northContent)}} {{:layoutOptions.northContent}} {{/if}} </div> {{/if}} {{if (layoutOptions.south != false)}} <div facet="{{>layoutOptions.facetPrefix}}:south" class="middle-south"> {{if (layoutOptions.southContent)}} {{:layoutOptions.southContent}} {{/if}} </div> {{/if}} <div facet="{{>layoutOptions.facetPrefix}}:center" class="middle-center"> {{if (layoutOptions.centerContent)}} {{:layoutOptions.centerContent}} {{/if}} </div> {{if (layoutOptions.west != false)}} <div facet="{{>layoutOptions.facetPrefix}}:west" class="middle-west"> {{if (layoutOptions.westContent)}} {{:layoutOptions.westContent}} {{/if}} </div> {{/if}} {{if (layoutOptions.east != false)}} <div facet="{{>layoutOptions.facetPrefix}}:east" class="middle-east"> {{if (layoutOptions.eastContent)}} {{:layoutOptions.eastContent}} {{/if}} </div> {{/if}}'});

    $.templates({
        "tpl-common-global-dialog":'<div appuse="global-dialog" class="ui modal"> <i class="close icon"></i> <div facet="site:dialog-header" class="header"></div> <div facet="site:dialog-content" class="content"> </div> {{if (actions != null && actions != "")}} <div facet="site:dialog-actions" class="actions"></div> {{/if}} </div>'});

    $.templates({
        "tpl-side-menu-item": '<a appuse="tablinks" group="app:pages" item="{{:name}}" appaction="showPage" class="{{if display == "primary"}}mobileonly{{/if}} item">{{:title}}</a>'});

    $.templates({
        "tpl-nav-menu-item": '<a appuse="tablinks" group="app:pages" item="{{:name}}" appaction="showPage" class="{{if display == "primary"}}mobileonly{{/if}} item">{{:title}}</a>'});

    $.templates({
        "tpl-top-menu-item": '{{if (display == "primary" || display == "both")}}<a appuse="tablinks" group="app:pages" item="{{:name}}" appaction="showPage" class="mobilehidden item">{{:title}}</a>{{/if}}'});

    $.templates({
        "tpl-top-menu-button": '<a appaction="{{:appaction}}" class="ui button">{{:title}}</a>'});

    $.templates({
        "tpl-top-menu": '<div class=" ui vertical masthead center aligned segment"> <div class="rem-ui rem-container"> {{if (title != null)}} <h1>{{:title}}</h1> {{/if}} <div appuse="topmenu" class="ui large secondary menu"> {{for navlinks tmpl="tpl-top-menu-item"/}} <div class="right item"> {{for navbuttons tmpl="tpl-top-menu-button"/}} </div> </div> </div> </div> '});

    $.templates({
            "app:about-this-app": '<div class=""> This is an application based on the ActionApp design. <hr /> See the source code for details. </div>' });



})(ActionAppCore, $);



















/*
Author: Joseph Francis
License: MIT
*/
//---  SitePage - Base for all application pages --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    SiteMod.SitePage = ThisController;

    var defaultLayoutOptions = {
        spacing_closed: 8,
        spacing_open: 6,
        resizable: true,
        togglerLength_open: 100,
        togglerLength_closed: 100,
        south__resizable: false,
        south__closable: false,
        south__slidable: false,
        south__togglerLength_open: 0,
        south__spacing_open: 0,
        north__resizable: false,
        north__closable: false,
        north__slidable: false,
        north__togglerLength_open: 0,
        north__spacing_open: 0,
        center__paneSelector: ".middle-center",
        north__paneSelector: ".middle-north",
        south__paneSelector: ".middle-south",
        west__paneSelector: ".middle-west",
        east: { paneSelector: ".middle-east", resizable: true, resizeWhileDragging: true, slidable: true }
    };



    //--- Base class for application pages
    function ThisController(theOptions) {
        
        this.options = theOptions || {};
        this.pageName = this.options.pageName || '';
        this.pageActionPrefix = this.options.pageActionPrefix || '';
        this.pageTitle = this.options.pageTitle || '';

        this.linkDisplayOption = this.options.linkDisplayOption || "both"
        this.hasRefreshed = false;
        this.pageTemplate = this.options.pageTemplate || '';
        this.layoutOptions = this.options.layoutOptions || false;


        if( !this.pageTemplate || this.layoutOptions ){
            this.layoutOptions = this.layoutOptions || {};
            this.layoutConfig = $.extend({}, defaultLayoutOptions, (this.options.layoutConfig || {}));
            if( this.options.layoutConfig ){
                console.log("this.layoutConfig", this.layoutConfig);
            }

            //--- Use standard border layout template if none provided
            this.layoutOptions.facetPrefix = this.layoutOptions.facetPrefix || this.pageName;
            this.pageTemplate = this.pageTemplate || 'tpl-border-layout';
            
            //--- Extend with new layout related facet functions
            this.addToRegion = function(theRegion, theContent, theOptionalTemplateName, thePrepend){
                var tmpRegionFacetName = this.layoutOptions.facetPrefix + ":" + theRegion;
                ThisApp.addToFacet(tmpRegionFacetName, theContent, theOptionalTemplateName, thePrepend)
            }
            this.loadRegion = function(theRegion, theContent, theOptionalTemplateName){
                var tmpRegionFacetName = this.layoutOptions.facetPrefix + ":" + theRegion;
                ThisApp.loadFacet(tmpRegionFacetName, theContent, theOptionalTemplateName)
            }
            
        }
        
        //this.app = ThisApp; //new SiteMod.CoreApp(); //singleton - global site application object

        this.appModule = this.options.appModule || false;
        if (this.appModule) {
            this.appModule[this.pageName] = this;
        }


        //registerPage();
        //ToDo: _registerPage
    }

    var me = ThisController.prototype;
    var that = this;

    me.getByAttr$ = function (theItems, theExcludeBlanks) {
        return ThisApp.getByAttr$(theItems, this.getParent$(), theExcludeBlanks);
    }
    me.getParent$ = function () {
        var tmpAttribs = {
            group: "app:pages",
            item: this.pageName
        }
        this.parent$ = this.parent$ || this.app.getByAttr$(tmpAttribs);
        return this.parent$;
    }


    me.init = init;
    function init(theApp) {

        if (theApp) {
            this.app = theApp;
        }

        if (typeof (this.preInit) == 'function') {
            this.preInit(this.app)
        }

        if (this.app && this.pageActionPrefix && this.pageActionPrefix != '') {
            this.app.registerActionDelegate(this.pageActionPrefix, runAction.bind(this));
        }

        //--- Add dynamic link on init from plugin module
        if (this.app && this.app.$appPageContainer) {
            this.app.$appPageContainer.append('<div appuse="cards" group="app:pages" item="' + this.pageName + '" class="hidden">' + this.pageTitle + '</div>')
            this.app.registerNavLink({
                "name": this.pageName,
                "title": this.pageTitle,
                "display": this.linkDisplayOption,
                "onActivate": onActivateThisPage
            })
            //theApp.config.navlinks.push()
            var tmpContentHTML = $.templates[this.pageTemplate].render(this);
            this.parentEl = this.app.getByAttr$({ group: "app:pages", item: this.pageName })
            this.parentEl.html(tmpContentHTML);

            if (typeof (this.compInit) == 'function') {
                this.compInit(this.app)
            }

            if( this.layoutOptions && this.layoutConfig){
                this.layoutSpot = ThisApp.getByAttr$({ group: ThisApp.pagesGroup, "item": this.pageName });
                this.layout = this.layoutSpot.layout(this.layoutConfig);
            }

        }

    }


    //---- Internal Stuff ---------------------
    /*
    function registerPage() {
        if (typeof (me.options.app) == 'object') {
            ThisApp = me.options.app;
            if (me.pageName != '' && ThisApp && ThisApp.registerComponent) {
                ThisApp.registerComponent("app:" + me.pageName, this);
            }
        }
    }
     */

    function runAction(theAction, theSourceObject) {
        if (typeof (this[theAction]) == 'function') {
            this[theAction](theAction, theSourceObject);
        }
    }

    function onActivateThisPage() {
        //-refresh local message details everytime we change to this view
        onActivate();
        if (this.hasRefreshed) {
            return;
        }
        this.hasRefreshed = true;
        onInitialLoad();
    }
    function onInitialLoad() {
        // console.info("Logs Page - Initial Load")
    }
    function onActivate() {

    }


    return me;

})(ActionAppCore, $);
