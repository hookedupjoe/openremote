(function(hu){
    //--- Start Bubble
    
    /*
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     */
    
     
     var app = {
        // Application Constructor
        initialize: function() {
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        },
    
        // deviceready Event Handler
        //
        // Bind any cordova events here. Common events are:
        // 'pause', 'resume', etc.
        onDeviceReady: function() {
            this.receivedEvent('deviceready');
            setup();
        },
        // Update DOM on a Received Event
        receivedEvent: function(id) {
            // var parentElement = document.getElementById(id);
            // var listeningElement = parentElement.querySelector('.listening');
            // var receivedElement = parentElement.querySelector('.received');
    
            // listeningElement.setAttribute('style', 'display:none;');
            // receivedElement.setAttribute('style', 'display:block;');
    
            // console.log('Received Event: ' + id);
        }
    };
    
    app.initialize();
    
    //---- general variables
    var store,
    btnHome,
    btnBack,
    btnColDlg
    ;
    //---- End general variables
    
    function setup(){
        setupBindings();
        //refreshFromStore();
        ////alert("window.hu " + typeof(window.hu.App.home))
        //alert("App home " + typeof(App.home));
        OpenMenu.load();
		OpenMenu.home();		
    }

    
    function onBtnNameUpdateClick(){
        console.log('onBtnNameUpdateClick');
        showName.innerHTML = 'Testing';
        localStorage.setItem("Name", fldName.value || '');
        refreshFromStore();
    }
    
    function setupBindings(){

       
        btnHome = document.getElementById("btnHome");
        btnHome.addEventListener("click", OpenMenu.home);  

        btnBack = document.getElementById("btnBack");
        btnBack.addEventListener("click", OpenMenu.back);  

        btnColDlg = document.getElementById("btnColDlg");
        btnColDlg.addEventListener("click", OpenMenu.showColDlg);  
  /**/

        // fldName = document.getElementById("fldName");
        // showName = document.getElementById("showName");
        // btnUpdateName = document.getElementById("btnUpdateName");
        // btnUpdateName.addEventListener("click", onBtnNameUpdateClick);  
    }
    
    function refreshFromStore(){
        var tmpName = localStorage.getItem("Name") || '';
        // fldName.value = tmpName;
        // showName.innerHTML = tmpName;
    }
    
    function getLocalStorageByKey() {
        return (localStorage.key(0));
    }
    

    

    //--- End Bubble 
    })(hu);

