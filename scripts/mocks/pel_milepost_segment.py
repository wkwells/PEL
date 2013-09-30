"""
Create a line segment from Utah LRS route starting/ending mileposts

"""

#------------------------------------------------------------------
# pel_get_milepost_segment.py
# This is a supporting ArcGIS Server geoprocessing task 
# of the online version of PEL
# Utah version, developed as part of UPLAN
#
# Author:    BIO-WEST, Inc.
#   Original Programmer: Kevin Wells
#
# Current Version Date: August 2013
#   Initiated:  24 January 2013
#   Modified:   7 March 2013 to use local data instead of a connection
#                to AGRC SGID
#------------------------------------------------------------------

# Import ESRI modules
import arcpy as ap
# import pel_info
#import logging

def main():
    # """Generate a road line segment between two mileposts"""
    
    # ap.ResetEnvironments()
    # # Set the workspace to in memory.
    # ap.env.workspace = "in_memory"
    
    # # Set overwrite option
    # ap.env.overwriteOutput = True
    
    # # Get Parameters
    # route = ap.GetParameterAsText(0)
    # start_milepost = ap.GetParameter(1)
    # end_milepost = ap.GetParameter(2)
    
    # # Milepost data
    # milepost_data = pel_info.Locations.pel_folder + "\\Utility\\Reference.gdb\\UDOTMileposts"

    # # The entire process is in one try statement
    # try:
        
    #     # Get coordinates of starting milepost via SQL.
    #     rows = (ap.SearchCursor(milepost_data, "\"LABEL\" = " + "\'" + route + 
    #                                            "\'" + " AND \"MP\" = " + 
    #                                            str(start_milepost), "", 
    #                                            "XCOORD; YCOORD"))
    #     for row in rows:
    #         startx = row.XCOORD
    #         starty = row.YCOORD
        
    #     # Get coordinates of end milepost via SQL.
    #     rows = (ap.SearchCursor(milepost_data, "\"LABEL\" = " + "\'" + route + 
    #                                            "\'" + " AND \"MP\" = " +
    #                                            str(end_milepost), "",
    #                                            "XCOORD; YCOORD"))
    #     for row in rows:
    #         endx = row.XCOORD
    #         endy = row.YCOORD
        
    #     # Determine the smaller coordinate
    #     if (startx <= endx):
    #         smallx = startx
    #         largex = endx
    #     else:
    #         smallx = endx
    #         largex = startx
        
    #     if (starty <= endy):
    #         smally = starty
    #         largey = endy
    #     else:
    #         smally = endy
    #         largey = starty
        
    #     # Determine the mid_point coordinates
    #     midx = ((largex - smallx) / 2) + smallx
    #     midy = ((largey - smally) / 2) + smally
        
    #     # Determine the radius. (use pythagorean theorom for diameter)
    #     diameter = (((largex - smallx) ** 2) + ((largey - smally) ** 2)) ** 0.5
    #     radius = diameter / 2
        
    #     # Create the mid_point
    #     point = ap.Point(midx, midy)
    #     mid_point = ap.PointGeometry(point)
        
    #     # Buffer the mid_point, creating a circle that will be used to
    #     # clip the route.
    #     result_circle = ap.Buffer_analysis(mid_point, "circle" , radius)
        
    #     # Get the route layer, select the route
    #     lrs = pel_info.Locations.pel_folder + "\\Utility\\Reference.gdb\\UDOTRoutes_LRS"
    #     route_string = "\"label\" = " + "'"+ route + "'"
        
    #     result_route = ap.Select_analysis(lrs, "fullRoute", route_string)
        
    #     # Clip the route by circle; save route segment into a temporary file.
    #     ap.Clip_analysis(result_route, result_circle, "routeSegment")
        
        # ap.SetParameter(3, "routeSegment")

    import os

    currentDir = os.path.dirname(os.path.realpath(__file__))
    output = os.path.join(currentDir, r'data.gdb\MilepostSegment')
    ap.SetParameter(3, output)
    
    # except:
    #     ap.AddError("Couldn't process route segment")    
        

if __name__ == '__main__':
    main()