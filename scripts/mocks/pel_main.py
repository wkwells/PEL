"""
Run PEL, the Planning and Environmental Linkage analysis tool.

Evaluate inputed areas for potential natural and social environmental impacts.
"""

#------------------------------------------------------------------
# pel_main.py
# This is the Main Module of the online version of PEL
# Utah version, developed as part of UPLAN

# Author:    BIO-WEST, Inc.
#   Original Programmer: April Bough, 2008 - 2012
#   Additional Programmer: Kevin Wells, December 2012 - current

# Current Version Date: August 2013
#   Initiated:  30 May 2008, PEL
#   Modified:   13 April 2011, PEL 1.0 to PEL 2.0
#   Modified:   late 2012 to 31 January 2013, created online version of PEL
#   Modified:   throughout 2013, refactoring, unit tests, enhancements,
#               Major changes:  output now saved in a database,
#                               main script divided into several functions

# Requirements to run PEL
#   Uses ESRI arcpy, so requires ArcGIS and Spatial Analyst licenses
#------------------------------------------------------------------

# Import ESRI modules
# import arcpy as ap

# # Import system modules
# import os
# import sys
# import time
# import logging

# # Import PEL submodules
# import pel_buffer
# import pel_countywide_extract
# import pel_database
# import pel_extract
# import pel_info
# import pel_maps_pdf
# import pel_pm_extract
# import pel_raster_extract
# import pel_select_extract

# # Note: For CatEx, change the following two modules and the references to
# # them throughout this module
# import pel_systems
# import pel_report_pdf

# # Import sqlalchemy for database connection
# import sqlalchemy


def main():
    pass
#     """Execute PEL tasks"""

#     # Start of the analysis, runtime
#     runtime = int(time.time())
#     date_piece = time.strftime('%Y%m%d', time.localtime(runtime))

#     # Turn on file overwrite capabilities
#     ap.env.overwriteOutput = True

#     # Get parameter data
#     prj_name = ap.GetParameterAsText(0)
#     prj_id = ap.GetParameterAsText(1)
#     featureset = ap.GetParameter(2)
#     buffer_distance = ap.GetParameter(3)
#     buffer_units = ap.GetParameterAsText(4)
#     linework_source_option = ap.GetParameter(5)
#     polygon_source_option = ap.GetParameter(6)
#     input_fields = ap.GetParameter(7)

#     # Set working directory
#     ap.env.workspace = (pel_info.Locations.pel_folder +
#                         "\\Utility\\Workspace.gdb")

#     # Establish folder pel_info.Locations
#     folders = pel_info.Folders(date_piece)

#     # Ensure directories exist
#     ensure_dir(folders.outfolder)
#     ensure_dir(folders.geometries_folder)
#     ensure_dir(folders.log_folder)

#     # Configure log
#     log = logging_configure(folders.log_folder, prj_id)

#     log.info('Started PEL process at ' +
#               time.strftime('%d %b %Y  %I:%M:%S %p', time.localtime(runtime)))
#     log.info('Unique project identifier, runtime = ' + str(runtime))

#     # Comment/Uncomment to switch between main and catEx systems
#     log.info("Using Main Systems")
#     #log.info("Using Categorical Exclusion (CatEx) Systems")

#     log.info('\n')
#     log.info("** Step 1:  Setup initial values ")
#     ap.AddMessage("** Step 1:  Setup initial values ")

#     # Log input parameters
#     log.info("Parameter 0, prj_name = " + prj_name)
#     log.info("Parameter 1, prj_id = " + prj_id)
#     log.info("Parameter 2, featureset = " + ap.Describe(featureset).dataType)
#     log.info("             of shape type " + ap.Describe(featureset).shapeType)
#     log.info("Parameter 3, buffer_distance = " + str(buffer_distance))
#     log.info("Parameter 4, buffer_units = " + str(buffer_units))
#     log.info("Parameter 5, linework_source_option = " +
#               str(linework_source_option))
#     log.info("Parameter 6, polygon_source_option = " +
#               str(polygon_source_option))
#     log.info("Parameter 7, input_fields = " + str(input_fields))


#     log.info('\n')
#     log.info("** Step 2:  Determine project footprint ")
#     ap.AddMessage("** Step 2:  Determine project footprint ")

#     # Prepare line or polygon input
#     new_path, linework_list, polygon_list = prepare_input_geometry(
#                     linework_source_option, buffer_distance,
#                     polygon_source_option, input_fields, folders, prj_id, 
#                     prj_name, featureset)

#     log.info("new_path = " + new_path)
#     log.info("linework_list = " + str(linework_list))
#     log.info("polygon_list = " + str(polygon_list))
#     log.info("")

#     # Determine is buffer value comes from user input or from attribute
#     if input_fields == 2:
#         buffer_value = "PEL_BUFF"
#     else:
#         buffer_value = str(buffer_distance) + " " + buffer_units

#     # If input is not a polygon, buffer the input to make a polygon
#     if polygon_source_option == 0:
#         polygon_list = pel_buffer.make_buffers(linework_list,
#                                                     folders.geometries_folder,
#                                                     buffer_value)

#     # Create a dictionary of project identifcation terms
#     # Note: prj_id_dict contains the linework filename (no file extention)
#     # as the key and [PRJ_NAME, PRJ_ID, ROW (optional)] as the value
#     if linework_source_option != 0:
#         prj_id_dict = pel_buffer.make_project_dict(linework_list,
#                                         linework_source_option, buffer_value)
#     else:
#         prj_id_dict = pel_buffer.make_project_dict(polygon_list,
#                                                        linework_source_option)

#     #------------------------------------------------------------------
#     ## If the fields do not already exist in the polygons, add and populate
#     ## project identification fields using the dictionary created above
#     #------------------------------------------------------------------
#     pel_buffer.add_project_info(polygon_list, prj_id_dict)

#     #------------------------------------------------------------------
#     ## Add ID field to each input polygon for use in raster systems evaluation
#     ## as raster mask creation priority
#     #------------------------------------------------------------------
#     pel_buffer.add_pel_id(polygon_list)

#     log.info('\n')
#     log.info("** Step 3:  Analyze data systems within the footprint ")
#     ap.AddMessage("** Step 3:  Analyze data systems within the footprint ")

#     # Folders
#     merged_outfolder = folders.merged_folder
#     intermediate_outfolder = folders.intermediate_folder
#     final_outfolder = folders.final_reports_folder
    
#     # Final PDF report written here for user consumption
#     server_outfolder = pel_info.Locations.web_outfolder + "\\" + date_piece

#     ensure_dir(merged_outfolder)
#     ensure_dir(intermediate_outfolder)
#     ensure_dir(final_outfolder)
#     ensure_dir(server_outfolder)

#     # Set path for the output dbf table template
#     table_template = (pel_info.Locations.pel_folder +
#                       '\\Utility\\templates\\outputTableTemplate.dbf')

#     new_mxd_path = (intermediate_outfolder + "\\" + prj_id + 
#                     "_CriticalMaps.mxd")

#     # Set the report options (flags and charts) for PEL pdfs
#     # Input options for flags/charts on PEL report pdfs
#     #    0 -- Do not show (false),   1 -- Show (true)
#     flag_option = 0
#     chart_option = 1

#     # Set the paths for headers/footer images for PEL pdfs
#     header_images_path = (pel_info.Locations.pel_folder +
#                          "\\Utility\\PDF_Generator\\Header_Footers\\")

#     header1 = header_images_path + "uplan_header1.png"
#     header2 = header_images_path + "uplan_header2.png"
#     footer = header_images_path + "uplan_footer.png"

#     header_option = [header1, header2, footer]

#     # Count total number of projects to analyze
#     totalcnt = str(len(polygon_list))
#     current_cnt = 0
#     log.info("Total number of projects to be analyzed: " + totalcnt)

#     # Merge linework for integration into Critical Maps mxd
#     merge_project_linework(linework_source_option, linework_list,
#                            merged_outfolder, new_mxd_path)

#     # Do PEL analysis for each project
#     for proj in polygon_list:
#         # Increment count
#         current_cnt += 1
#         dbf_path, dbf_name = do_analysis(current_cnt, proj, prj_name, prj_id,
#                                        runtime, intermediate_outfolder,
#                                        table_template)

#         # Create PEL report pdf (the results portion of the final pdf)
#         log.info('')
#         log.info("PEL Analysis completed ... producing PEL Report PDF")
#         pel_pdf_path = pel_report_pdf.generate_systems_list(dbf_path,
#                                     prj_id_dict, intermediate_outfolder,
#                                     flag_option, chart_option, header_option,
#                                     proj)

#         log.info("PEL Report PDF generated for " + dbf_name)

#         individual_folder = os.path.dirname(proj)
#         individual_name = os.path.basename(proj)[:-4]

#         log.info('\n')
#         log.info("** Step 4:  Create maps ")
#         ap.AddMessage("** Step 4:  Create maps ")

#         # Create the critical maps PDFs
#         crit_natural_path, crit_built_path = create_critical_maps(
#                                      individual_folder, 
#                                      individual_name, new_mxd_path, 
#                                      intermediate_outfolder, prj_id)

#         log.info('\n')
#         log.info("** Step 5:  Assemble PEL report ")
#         ap.AddMessage("** Step 5:  Assemble PEL report ")

#         # Assemble the final report pdf
#         combined_pdf_path = (final_outfolder + "\\" +
#                       prj_id_dict[individual_name][1] + ".pdf")

#         server_pdf_path = (server_outfolder + "\\" + 
#                     prj_id_dict[individual_name][1] + ".pdf")

#         assemble_final_report_pdf(combined_pdf_path, server_pdf_path,
#                               crit_natural_path, crit_built_path, pel_pdf_path)

#     # End of the analysis
#     finished = int(time.time())
#     log.info('')
#     log.info('Finished PEL process at ' +
#               time.strftime('%I:%M:%S %p', time.localtime(finished)))

#     processing_time = finished - runtime
#     log.info('Processing time = ' +
#               time.strftime('%M:%S', time.localtime(processing_time)))

#     # Shut down logging
#     logging.shutdown()

#     # Exit the program
#     sys.exit()


# def do_analysis(current_cnt, proj, prj_name, prj_id, runtime, intermediate_outfolder,
#                 table_template):
#     """Do PEL Analysis for current project"""

#     log = logging.getLogger("log")

#     # Create an empty list that will contain the printable names for all of
#     # the systems run in this iteration of reports
#     pdf_systems_list = []

#     dbf_name = prj_id + "_results.dbf"
#     dbf_path = intermediate_outfolder + "\\" + dbf_name

#     log.info(' ')
#     log.info("Analyzing project " + str(current_cnt))
#     log.info("Project footprint = " + proj)

#     # Create the output dbf table using the prepared template
#     ap.CreateTable_management(intermediate_outfolder, dbf_name, table_template)

#     # Create the Insert Cursor object that records data to the output table
#     dbf_rows = ap.InsertCursor(dbf_path)

#     # Extract the project's pertinate information from data layers.
#     extract_from_systems(pdf_systems_list, proj, dbf_rows, runtime)

#     # Add the systems considered to the dbf file
#     pdf_systems_list.sort()
#     for cur_system in pdf_systems_list:

#         # Create row in DBF for each system run to store systems info
#         dbf_row = dbf_rows.newRow()
#         dbf_row.Group = "REPORT DETAILS"
#         dbf_row.Sys_Name = "PEL SYSTEMS EVALUATED BY REPORT"
#         dbf_row.Feat_Name = cur_system
#         dbf_row.ACRES = 0
#         dbf_row.FEET = 0
#         dbf_row.TIER = ""
#         dbf_row.FLAG = 0
#         for i in range (1, 35):
#             field = "INFO_" + str(i)
#             dbf_row.setValue(field, "")
#         dbf_rows.insertRow(dbf_row)

#         del dbf_row

#     ## Finished with DBF production, so remove cursor file lock
#     del dbf_rows

#     # Save project name and runtime (run information) to the database
#     # Establish a session to interact with the database
#     session_maker = sqlalchemy.orm.sessionmaker(bind=pel_database.engine)
#     session = session_maker()

#     systems_used = ""
#     for system in pdf_systems_list:
#         if systems_used == "":
#             systems_used = systems_used + system
#         else:
#             systems_used = systems_used + "," + system

#     session.add(pel_database.PelRuns(runtime, prj_name, prj_id, systems_used))
#     # Commit run information to the database
#     try:
#         session.commit()
#     except:
#         log.error(('Cannot commit:', runtime, prj_name, prj_id, systems_used))

#     return dbf_path, dbf_name


# def merge_project_linework(linework_source_option, linework_list,
#                            merged_outfolder, new_mxd_path):
#     """Merge the project linework and add to critical maps."""

#     log = logging.getLogger("log")

#     # Create empty merge lists
#     point_linework_list = []
#     polyline_linework_list = []

#     # Make sure that linework is provided for this instance of PEL
#     if linework_source_option != 0:

#         # For each linework project
#         for current_linework in linework_list:

#             # Check the geometry type
#             desc = ap.Describe(current_linework)
#             # If it is a point shapefile, add it to the point merge list
#             if desc.ShapeType == "Point":
#                 point_linework_list.append(current_linework)
#             # If it is a polyline shapefile, add it to the polyline merge list
#             elif desc.ShapeType == "Polyline":
#                 polyline_linework_list.append(current_linework)
#             # If it is a polygon, notify the user and inform the user of
#             # the geometry type
#             else:
#                 log.warning("WARNING!! Linework type is not point nor \
#                                polyline. It is " + desc.ShapeType)

#     # Establish the path for the merged point linework
#     merged_point_path = merged_outfolder + "\\Points_Merged.shp"
#     # If no point linework exists, create an empty FC as a place holder
#     # (to prevent errors missing data source errors in the mxd)
#     if len(point_linework_list) == 0:
#         ap.CreateFeatureclass_management(merged_outfolder, "Points_Merged.shp",
#                                          "POINT")
#         ap.AddField_management(merged_point_path, "PRJ_ID", "TEXT")
#     # If there is point linework, merge all of the individual point linework
#     # projects together and save it to the established path
#     else:
#         merge_point_instring = ""
#         for current_point_path in point_linework_list:
#             merge_point_instring += current_point_path + ";"
#         merge_point_instring = merge_point_instring[:-1]

#         ap.Merge_management(merge_point_instring, merged_point_path)
#     # Establish the path for the merged polyline linework
#     merged_line_path = merged_outfolder + "\\Lines_Merged.shp"
#     # If no polyline linework exists, create an empty FC as a place holder
#     # (to prevent errors missing data source errors in the mxd)
#     if len(polyline_linework_list) == 0:
#         ap.CreateFeatureclass_management(merged_outfolder, "Lines_Merged.shp",
#                                          "POLYLINE")
#         ap.AddField_management(merged_line_path, "PRJ_ID", "TEXT")
#     # If there is polyline linework, merge all of the individual polyline
#     # linework projects together and save it to the established path
#     else:
#         merge_line_instring = ""
#         for current_line_path in polyline_linework_list:
#             merge_line_instring += current_line_path + ";"
#         merge_line_instring = merge_line_instring[:-1]

#         ap.Merge_management(merge_line_instring, merged_line_path)

#     # Resource the linework layers in the mxd to the new merged linework
#     # shapefiles (or empty placeholders)
#     # (note that the individual polygon buffers will be added later,
#     # one-at-time after the PEL analysis)
#     pel_maps_pdf.add_linework_2mxd(merged_outfolder, new_mxd_path)


# def extract_from_systems(pdf_systems_list, proj, dbf_rows, runtime):
#     """Extract pertinent information from the data systems"""

#     log = logging.getLogger("log")

#     systems_list = pel_systems.create_systems_list()
#     raster_list = systems_list[0]
#     polygon_clip_list = systems_list[1]
#     county_polygon_clip_list = systems_list[2]
#     polyline_clip_list = systems_list[3]
#     point_clip_list = systems_list[4]
#     vector_select_list = systems_list[5]
#     pm_acres_list = systems_list[6]
#     pm_feet_list = systems_list[7]

#     system_dict = get_system_dictionary()
#     datatype_list = [raster_list, polygon_clip_list, county_polygon_clip_list,
#                  polyline_clip_list, point_clip_list, vector_select_list,
#                  pm_acres_list, pm_feet_list]

#     message_list = ["RasterList", "polygon_clip_list",
#                  "county_polygon_clip_list",
#                  "polyline_clip_list",
#                  "point_clip_list",
#                  "vector_select_list",
#                  "pm_acres_list", "pm_feet_list"]

# #    for datatype in datatype_list:
#     for i in range(8):
#         item_list = datatype_list[i]
#         message_datatype = message_list[i]


#         for item in item_list:
#             system_name = pretty_name(item)
#             print_name = system_dict[system_name]
#             pdf_systems_list.append(print_name)

#             # Log system being evaluated
#             log.info(" ")
#             log.info(print_name + "   " + message_datatype)
#             ap.AddMessage("Evaluating resource: " + print_name)

#             # Extract from the particular data type
#             if message_datatype == "RasterList":
#                 pel_raster_extract.extract_raster_data(system_name, proj, item,
#                                       dbf_rows, runtime)
#             elif message_datatype == "polygon_clip_list":
#                 pel_extract.extract_data(system_name, proj, item, dbf_rows,
#                                         runtime)

#             elif message_datatype == "county_polygon_clip_list":
#                 county_id_list = determine_counties(proj)
#                 pel_countywide_extract.extract_countywide_data(
#                               system_name, proj, item, county_id_list,
#                               dbf_rows, runtime)
#             elif message_datatype == "polyline_clip_list":
#                 pel_extract.extract_data(system_name, proj, item, dbf_rows,
#                                         runtime)

#             elif message_datatype == "point_clip_list":
#                 pel_extract.extract_data(system_name, proj, item, dbf_rows,
#                                         runtime)

#             elif message_datatype == "vector_select_list":
#                 pel_select_extract.extract_select_data(system_name,
#                                                           proj, item, dbf_rows,
#                                                           runtime)
#             elif message_datatype == "pm_acres_list":
#                 pel_pm_extract.extract_pm_data(system_name,
#                                               proj, item, dbf_rows, runtime)

#             elif message_datatype == "pm_feet_list":
#                 pel_pm_extract.extract_pm_data(system_name,
#                                               proj, item, dbf_rows, runtime)


# def prepare_input_geometry(linework_source_option, buffer_distance,
#                  polygon_source_option, input_fields, folders,
#                  prj_id, prj_name, featureset):
#     """Locate and prepare the line or polygon input"""

#     log = logging.getLogger("log")

#     ensure_dir(folders.linework_folder)
#     ensure_dir(folders.geometries_folder )

#     new_path = ''

#     if linework_source_option == 0:
#         linework_list = []
#     elif linework_source_option == 1:
#         linework_list = [pel_info.Locations.pel_folder +
#                          r'\Utility\templates\testing_line.shp']
#     elif linework_source_option == 2:
#         linework_source_folder = r''
#         ap.env.workspace = linework_source_folder
#         linework_source_list = ap.ListFeatureClasses("*")

#         linework_list = []
#         for linework_file in linework_source_list:
#             linework_source_path = (linework_source_folder + "\\" +
#                                     linework_file)
#             linework_list.append(linework_source_path)
#     elif linework_source_option == 3:
#         new_path  = folders.linework_folder + "\\" + prj_id + ".shp"
#         ap.CopyFeatures_management(featureset, new_path)

#         # Add attribute fields if input_fields don't come from shapefile
#         if (input_fields !=2): 
#             ap.AddField_management(new_path, "PRJ_ID", "TEXT")
#             ap.CalculateField_management(new_path, "PRJ_ID", "'" + prj_id +
#                                      "'", "PYTHON")
#             ap.AddField_management(new_path, "PRJ_NAME", "TEXT")
#             ap.CalculateField_management(new_path, "PRJ_NAME", "'" + prj_name +
#                                      "'", "PYTHON")
#             ap.AddField_management(new_path, "PEL_BUFF", "FLOAT")
#             ap.CalculateField_management(new_path, "PEL_BUFF", buffer_distance,
#                                      "PYTHON")

#         linework_list = [new_path]
#     else:
#         log.error("Error in value of Linework Source Option")

#     if polygon_source_option == 0:
#         polygon_list = []
#     elif polygon_source_option == 1:
#         polygon_list = [pel_info.Locations.pel_folder +
#                         r'\Utility\templates\testing_polygon.shp']
#     elif polygon_source_option == 2:
#         polygon_source_folder = r''
#         ap.env.workspace = polygon_source_folder
#         polygon_source_list = ap.ListFeatureClasses("*")

#         polygon_list = []
#         for polygon_file in polygon_source_list:
#             polygon_source_path = polygon_source_folder + "\\" + polygon_file
#             polygon_list.append(polygon_source_path)
#     elif polygon_source_option == 3:
#         new_path  = folders.geometries_folder  + "\\" + prj_id + ".shp"
#         ap.CopyFeatures_management(featureset, new_path)

#         polygon_list = [new_path]

#         # Add attribute fields if input_fields don't come from shapefile
#         if (input_fields !=2):  
#             ap.AddField_management(new_path, "PRJ_ID", "TEXT")
#             ap.CalculateField_management(new_path, "PRJ_ID", "'" + prj_id +
#                                      "'", "PYTHON")
#             ap.AddField_management(new_path, "PRJ_NAME", "TEXT")
#             ap.CalculateField_management(new_path, "PRJ_NAME", "'" + prj_name +
#                                      "'", "PYTHON")

#         polygon_list = [new_path]
#     else:
#         log.error("Error in value of Polygon Source Option")

#     return new_path, linework_list, polygon_list


# def determine_counties(proj):
#     """Determine the counties intersected by the project."""

#     county_boundary_data = \
#                '..\\..\\Utility\\Reference.gdb\\SGID10_BOUNDARIES_Counties'
#     county_boundary_layer = "cb_layer"
#     ap.MakeFeatureLayer_management(county_boundary_data, county_boundary_layer)
#     ap.SelectLayerByLocation_management(county_boundary_layer,
#                                         "INTERSECT", proj)

#     county_id_list = []
#     county_rows = ap.SearchCursor(county_boundary_layer)
#     for county_row in county_rows:
#         if county_row.FIPS not in county_id_list:
#             county_id_list.append(county_row.FIPS)

#     del county_row, county_rows
#     ap.SelectLayerByAttribute_management(county_boundary_layer,
#                                          "CLEAR_SELECTION")

#     county_id_list.sort()
#     return county_id_list


# def ensure_dir(directory):
#     """Create folder if it doesn't already exist."""
#     if not os.path.exists(directory):
#         os.makedirs(directory)


# def logging_configure(log_folder, prj_id):
#     """Configure logging."""

#     # Create a logger and set the level
#     log = logging.getLogger('log')
#     log.setLevel(logging.INFO)

#     # Remove any residual handlers from previous runs
#     all_handlers = list(log.handlers)
#     for a_handler in all_handlers:
#         log.removeHandler(a_handler)
#         a_handler.flush()
#         a_handler.close()

#     # Create the file handler, format, add to logger
#     logfile_handler = logging.FileHandler(log_folder + "\\" + prj_id + ".log",
#                                          mode = 'w')
#     logfile_handler.setLevel(logging.INFO)
#     formatter = logging.Formatter('%(levelname)s  %(message)s')
#     logfile_handler.setFormatter(formatter)
#     log.addHandler(logfile_handler)

#     # Return the logger
#     return log


# def pretty_name(current_system):
#     """Return PEL system name from the end of the path"""
#     system_name = os.path.basename(current_system)
#     system_name = system_name.split(".")[0]
#     return system_name


# def create_critical_maps(individual_folder, individual_name, new_mxd_path,
#                          intermediate_outfolder, prj_id):
#     """Create natural and built critical maps."""

#     log = logging.getLogger("log")

#     pel_maps_pdf.add_project_footprint_2mxd(individual_folder, individual_name,
#                                new_mxd_path)

#     # Critical natural map
#     log.info("Switching to Critical Natural Map Theme...")
#     ap.AddMessage("Switching to Critical Natural Map Theme...")
#     pel_maps_pdf.change_themes(new_mxd_path, "Critical Natural",
#                              "Critical Built")
#     log.info("Creating PDF Map for " + individual_name + "...")
#     crit_natural_path = pel_maps_pdf.export_features(new_mxd_path,
#                                              intermediate_outfolder,
#                                              "_CritNatural", prj_id)
#     log.info("Natural Map pdf completed")
#     ap.AddMessage("Natural Map pdf completed")

#     # Critical built map
#     log.info("")
#     log.info("Switching to Critical Built Map Theme...")
#     ap.AddMessage("Switching to Critical Built Map Theme...")
#     pel_maps_pdf.change_themes(new_mxd_path, "Critical Built",
#                              "Critical Natural")
#     log.info("Creating PDF Map for " + individual_name + "...")
#     crit_built_path = pel_maps_pdf.export_features(new_mxd_path,
#                                 intermediate_outfolder, "_CritBuilt",
#                                 prj_id)
#     log.info("Built map pdf completed")
#     ap.AddMessage("Built map pdf completed")

#     # Return paths to maps
#     return crit_natural_path, crit_built_path


# def assemble_final_report_pdf(combined_pdf_path, server_pdf_path, \
#                               crit_natural_path, crit_built_path,
#                               pel_pdf_path):
#     """Assemble the final report pdf."""

#     log = logging.getLogger("log")

#     log.info("Creating final PDF document " + combined_pdf_path)

#     final_pdf = ap.mapping.PDFDocumentCreate(combined_pdf_path)

#     log.info("Appending Critical Map PDFs and PEL Report PDF to final PEL PDF")

#     final_pdf.appendPages(crit_natural_path)
#     final_pdf.appendPages(crit_built_path)
#     final_pdf.appendPages(pel_pdf_path)

#     log.info("Saving final PEL PDF")

#     final_pdf.updateDocProperties(pdf_open_view="USE_THUMBS",
#                                  pdf_layout="SINGLE_PAGE")
#     del final_pdf

#     log.info("Copying result to server root folder")

#     import shutil
#     try:
#         shutil.copy(combined_pdf_path, server_pdf_path)
#     except:
#         pass

#     link_path = server_pdf_path.replace(pel_info.Locations.wwwroot,
#                                         pel_info.Locations.web_address)
#     log.info(link_path)


# def get_system_dictionary():
#     """Return the dictionary of data systems"""

#     system_dictionary = {
#         "airQuality_reformatted":"Air Quality",
#         "aqueducts_reformatted":"Aqueducts -- LIMITED EXTENT",
#         "Aqueducts":"Aqueduct Buffers-- LIMITED EXTENT",
#         "cntyLow_reformatted":"Low Income for County",
#         "cntyVeryLow_reformatted":"Very Low Income for County",
#         "stateLow_reformatted":"Low Income for State",
#         "stateVeryLow_reformatted":"Very Low Income for State",
#         "paleo_reformatted":"Paleontological Sensitivity",
#         "wildConn_reformatted":"Wildlife Connectivity Across Utah Highways",
#         "wildCons_reformatted":"Wildlife Conservation Species",
#         "children_reformatted":"Concentration of Children",
#         "schools_reformatted":"Schools",
#         "Archeological_Polygons":"Archeological Sites",
#         "district_reformatted":"Historic Districts",
#         "historicSites_reformatted":"Historic Sites",
#         "disabled_reformatted":"Disability Facility(s)",
#         "plant_reformatted":"Rare Plants",
#         "countyGrowthRates_reformatted":"County Growth Rates",
#         "countyHouseProj_reformatted":
#                                    "County Household Population Projections",
#         "countyNumHouse_reformatted":
#                                    "County Number of Households Projections",
#         "countyProjections_reformatted":"County Population Projections",
#         "hazardous_reformatted":"Hazardous Waste Sites",
#         "impairedWaters_reformatted":"Impaired Waters",
#         "solidWaste_reformatted":"Solid Waste Sites",
#         "engineering_reformatted":"Engineering Problems",
#         "faultLines_reformatted":"Fault Lines",
#         "landslide_reformatted":"Landslide",
#         "liquefaction_reformatted":"Liquefaction Potential -- LIMITED EXTENT",
#         "Slope":"Slope",
#         "houseTotal_reformatted":"Average Household Size of Occupied Units",
#         "houseOwner_reformatted":
#                              "Average Household Size of Owner-Occupied Units",
#         "houseRenter_reformatted":
#                             "Average Household Size of Renter-Occupied Units",
#         "hunitDens_reformatted":"Housing Density",
#         "houseMeanVeh_reformatted":"Mean Vehicles Available Per Housing Unit",
#         "houseNoVeh_reformatted":
#                            "Occupied Housing Units with No Vehicle Available",
#         "canals_reformatted":"Canals",
#         "flood_reformatted":"Floodplains -- LIMITED EXTENT",
#         "lakes_reformatted":"Lakes",
#         "Streams":"Streams",
#         "Zoning":"Zoning",
#         "Parcels":"Parcels",
#         "Wetlands":"Wetlands",
#         "waterQuality_reformatted":"Water Quality",
#         "watershed_reformatted":"Watersheds",
#         "ownership_reformatted":"Private / Public Ownership",
#         "poverty_reformatted":"Concentration of Poverty",
#         "pubaIncome_reformatted":"Households on Public Assistance",
#         "language_reformatted":"Language Abilities",
#         "minority_reformatted":"Race / Ethnicity Concentration",
#         "tribal_reformatted":"Tribal Land",
#         "apa_reformatted":"Agricultural Protection Areas -- LIMITED EXTENT",
#         "cemeteries_reformatted":"Cemeteries",
#         "conserv_reformatted":"Conservation & Mitigation",
#         "parks_reformatted":"Parks",
#         "farmland_reformatted":"Prime Farmland -- LIMITED EXTENT",
#         "bikeRoutes_reformatted":"Bike Routes",
#         "busRoutes_reformatted":"Bus Routes",
#         "busStops_reformatted":"Bus Stops",
#         #"commuterRoutes_reformatted":"Commuter Rail Routes",
#         "Commuter_Rail_Routes":"Commuter Rail Routes",
#         "commuterStops_reformatted":"Commuter Rail Stops",
#         #"lightRailRoutes_reformatted":"Light Rail Routes",
#         "Light_Rail_Routes":"Light Rail Routes",
#         "lightRailStops_reformatted":"Light Rail Stops",
#         "age_reformatted":"Age Distribution",
#         "education_reformatted":"Education",
#         "familyIncome_reformatted":"Family Income Distribution",
#         "medianIncome_reformatted":"Median Family Income",
#         "popDens_reformatted":"Population Density",
#         "sexRatio_reformatted":"Sex Ratio",
#         "seniorsConc_reformatted":"Concentration of Seniors",
#         "seniors_reformatted":"Senior Care Facility(s)",
#         "seniorsNoVeh_reformatted":"Seniors without a Vehicle",
#         "railroads_reformatted":"Railroads",
#         "PM_lakes_reformatted":"Lakes - Programmatic Mitigation",
#         "PM_streams_reformatted":"Streams - Programmatic Mitigation"
#     }

#     return system_dictionary


if __name__ == '__main__':
    main()