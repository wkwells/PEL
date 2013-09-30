"""
Create a placeholder PDF file that will be replaced by the finished
PEL report

"""

#------------------------------------------------------------------
# pel_placeholder_pdf.py
# This is a supporting ArcGIS Server geoprocessing task 
# of the online version of PEL
# Utah version, developed as part of UPLAN
#
# Author:    BIO-WEST, Inc.
#   Original Programmer: Kevin Wells
#
# Current Version Date: August 2013
#   Initiated: February 2013
#------------------------------------------------------------------

# import arcpy as ap
# import os
# import shutil
# import pel_info

def main():
    """Create a placeholder PDF file"""
    
    # ap.env.overwriteOutput = True
    
    # inpath = (pel_info.Locations.pel_folder + 
    #           "\\Utility\\templates\\PEL_processing.pdf")
    # date_folder = ap.GetParameterAsText(0)
    # prj_id = ap.GetParameterAsText(1)
    # outpath = (pel_info.Locations.web_outfolder + "\\" + date_folder)
    # outpdf = (pel_info.Locations.web_outfolder + "\\" + date_folder + "\\" + 
    #           prj_id + ".pdf")
    
    # if not os.path.exists(outpath):
    #     os.makedirs(outpath)
    
    # shutil.copy(inpath, outpdf)
  
if __name__ == '__main__':
    main()