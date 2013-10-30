define([
    'dojo/parser',

    'app/App'
], function(
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
        version: '0.2.5',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        // apiKey: 'AGRC-63E1FF17767822', // localhost
        apiKey: 'AGRC-AC122FA9671436', // test.mapserv.utah.gov

        // extentMaxArea: number
        //      the maximum area of an extent that a report is allowed to be 
        extentMaxArea: 1210000000,

        urls: {
            vector: 'http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Vector/MapServer',
            mainReport: '/arcgis/rest/services/PEL/Toolbox/GPServer/PEL_Main',
            catexReport: '/arcgis/rest/services/PEL/Toolbox/GPServer/PEL_CatEx',
            routeMilepost: '/arcgis/rest/services/PEL/MilepostSegment/GPServer/Milepost_Segment'
        }
    };

    // lights...camera...action!
    parser.parse();
});
