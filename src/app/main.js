define([
    'dojo/parser', 

    'app/App'
], 

function (
    parser
    ) {
    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // appName: String
        //      The name of the app in permissions proxy.
        //      See the LoginRegister widget
        appName: 'pel',

        // version: String
        //      The version number.
        version: '0.1.0',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        // apiKey: 'AGRC-63E1FF17767822', // localhost

        // exportWebMapUrl: String
        //      print task url
        exportWebMapUrl: 'http://mapserv.utah.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',

        urls: {
            vector: 'http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Vector/MapServer',
            mainReport: '/arcgis/rest/services/PEL/Toolbox/GPServer/PEL_Main',
            catexReport: '/arcgis/rest/services/PEL/Toolbox/GPServer/PEL_CatEx'
        }
    };

    // lights...camera...action!
    parser.parse();
});