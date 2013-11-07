import arcpy, os, zipfile

class Toolbox(object):
    def __init__(self):
        """Define the toolbox (the name of the toolbox is the name of the
        .pyt file)."""
        self.label = "Toolbox"
        self.alias = ""

        # List of tool classes associated with this toolbox
        self.tools = [Tool]

class Tool(object):
    
    shapefile_parts = None
    
    def __init__(self):
        """Define the tool (tool name is the name of the class)."""
        self.label = "Shapefile Upload"
        self.description = "Upload a zipped shapefile containing .shp, .shx, .dbf, and .prj"
        self.canRunInBackground = True
        self.shapefile_parts = set(['.shp', '.shx', '.dbf', '.prj'])

    def getParameterInfo(self):
        """Define parameter definitions"""
        upload_param = arcpy.Parameter(displayName="shapefile zip file",
                                       name="zip",
                                       datatype="File",
                                       parameterType="Required",
                                       direction="Input")
        
        output = arcpy.Parameter(displayName="url",
                                      name='url',
                                      datatype='String',
                                      parameterType="Derived",
                                      direction="Output")
                                       
        upload_param.value = "*.zip"
        
        return [upload_param, output]

    def isLicensed(self):
        """Set whether tool is licensed to execute."""
        return True

    def updateParameters(self, parameters):
        """Modify the values and properties of parameters before internal
        validation is performed.  This method is called whenever a parameter
        has been changed."""
        return

    def updateMessages(self, parameters):
        """Modify the messages created by internal validation for each tool
        parameter.  This method is called after internal validation."""
        return
    
    def set_return_value(self, parameters, message):
        pass
    
    def validate_input(self, file_location):
        message = None
        
        is_file = os.path.isfile(file_location)
        
        if not is_file:
            message = "Please upload a *.zip file containing your study area."
            return message
        
        ftype = self.get_extension(file_location)
        
        if ftype != ".zip":
            message = "Please upload a *.zip file containing your study area."
            return message
            
        return message
    
    def validate_shapefile_parts(self, file_location):      
        files = os.listdir(file_location);

        parts = list()

        for f in files:
            if os.path.isfile(os.path.join(file_location, f)) and self.get_extension(f) in self.shapefile_parts:
                parts.append(self.get_extension(f))

        parts = set(parts)

        return self.shapefile_parts - parts;
    
    def get_featureclass_from_fgdb(self, file_location):
        arcpy.env.workspace = file_location
        classes = arcpy.ListFeatureClasses(None, "Point")
        
        if len(classes) < 1:
            return None
        
        return os.path.join(file_location, classes[0])
    
    def get_extension(self, f):
        file_name, file_extension = os.path.splitext(f)
        
        return file_extension.lower()
    
    def unzip(self, file_location):
        unzip_location = None
        
        with zipfile.ZipFile(file_location) as zf:
            for member in zf.infolist():
                words = member.filename.split('\\')
                parts = file_location.split('\\')
                
                destination_dir = "\\".join(parts[:-1])
                
                path = destination_dir
                
                for word in words[:-1]:
                    drive, word = os.path.splitdrive(word)
                    head, word = os.path.split(word)
                    
                    if word in (os.curdir, os.pardir, ''):
                        continue
                    path = os.path.join(path, word)
                    
                if unzip_location is None:
                    unzip_location = os.path.join(path,words[0])
                    
                zf.extract(member, path)
        
        return unzip_location

    def execute(self, parameters, messages):
        """The source code of the tool."""
        file_location = parameters[0].valueAsText
        messages.addMessage(file_location)

        message = self.validate_input(file_location)

        if message is not None:
            messages.addErrorMessage(message)
            return

        unzip_location = self.unzip(file_location)

        parts = self.validate_shapefile_parts(unzip_location)

        if len(parts) > 0:
            messages.addErrorMessage('missing complete shapefile parts/. ' + ' '.join(parts))
            return

        parameters[1].value = 'report url';

        return message
