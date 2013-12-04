define([
    'dojo/parser',

    'app/App'
], function(
    parser
) {
    var baseUrl = '/arcgis/rest/services/PEL/Toolbox/GPServer';
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
        version: '0.3.0',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        // apiKey: 'AGRC-63E1FF17767822', // localhost
        apiKey: 'AGRC-AC122FA9671436', // test.mapserv.utah.gov

        // extentMaxArea: number
        //      the maximum area of an extent that a report is allowed to be 
        extentMaxArea: 1210000000,

        urls: {
            baseUrl: baseUrl,
            vector: 'http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Vector/MapServer',
            mainReport: baseUrl + '/PEL_Main',
            catexReport: baseUrl + '/PEL_CatEx',
            routeMilepost: baseUrl + '/Milepost_Segment',
            uploadUrl: baseUrl + '/uploads/upload'
        }
    };

    // lights...camera...action!
    parser.parse();
});
