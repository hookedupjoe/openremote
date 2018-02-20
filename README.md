# Action Based Application Development
* Author: Joseph Francis
* License: MIT
* 2018

## Action Application Demo
This is a super simple but responsive application that uses the following libraries at the core.
* jQuery
* Semantic UI
* jsrender
* layout
* toastr

## Design goals
The design goal for this application was to have a super simple yet modular, responsive and powerful starting point for general applications and developer testing.

### Design concepts ...
* Actions can be assigned to any element using the "appaction" attribute.  This will cause the action to be triggered when clicked. 
* Triggered action receive action name and  target element so that attributes and other aspects of the related DOm  control the end result.
* Define and use "facets" where dynamic content is loaded and manipulated.
* jsrender templates and/or standard code can populate content in facets or anywhere in the application.
* A module base application is provided where modules can be plugged in.  The modules should be in their own function "bubble", making it easy to separate parts of the code to isolated memory spaces.
* A standard site frameork and navigation system is provided that handles the navigational menus in a responsive way and control the hiding / showing of navigational pages on the site.


## Design methodology
This design uses attributes to find and modify DOM elements.<pre>
< div suchasthisone="somevalue" /></pre> 

 