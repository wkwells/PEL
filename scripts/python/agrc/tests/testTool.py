from unittest import TestCase, main
from agrc.gp.toolbox import Tool
from agrc.tests import helpers
from os import listdir, path

class TestFileInput(TestCase):
                
    def setUp(self):
        self.tool = Tool()
        
        self.bad_file_directory = path.join(path.abspath(path.dirname(__file__)), r"data\bad")
        self.bad_file = path.join(path.abspath(path.dirname(__file__)), r"data\bad\bad.somethingNotZip")
        
        self.good_file = path.join(path.abspath(path.dirname(__file__)), r'data\good\KaneAddressPoints.zip')
        self.good_file_directory = path.join(path.abspath(path.dirname(__file__)), r'data\good')
            
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\KaneAddressPoints.zip'), self.good_file_directory)
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\bad.somethingNotZip'), self.bad_file_directory)
    
    def tearDown(self):
        helpers.delete_directory(self.good_file_directory)
        helpers.delete_directory(self.bad_file_directory)        
    
    def test_bad_file_input(self):
        value = self.tool.validate_input(self.bad_file)
        
        self.assertEqual(value, "Please upload a *.zip file containing your study area.", "wrong message")       
    
    def test_empty_file_input(self):
        empty_location = ""
        
        value = self.tool.validate_input(empty_location)
        
        self.assertEqual(value, "Please upload a *.zip file containing your study area.", "wrong message")             
    
    def test_good_file_input(self):
        value = self.tool.validate_input(self.good_file)
        
        self.assertEqual(value, None, "shoult not get error since ends with zip")

class TestDecompression(TestCase):
            
    def setUp(self):
        self.tool = Tool()
        self.bad_file_directory = path.join(path.abspath(path.dirname(__file__)), r"data\bad")
        self.bad_file = path.join(path.abspath(path.dirname(__file__)), r"data\bad\bad.somethingNotZip")
    
        self.good_file = path.join(path.abspath(path.dirname(__file__)), r'data\good\KaneAddressPoints.zip')
        self.good_file_directory = path.join(path.abspath(path.dirname(__file__)), r'data\good')
        
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\KaneAddressPoints.zip'), self.good_file_directory)
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\bad.somethingNotZip'), self.bad_file_directory)
        
    def tearDown(self):
        helpers.delete_directory(self.good_file_directory)
        helpers.delete_directory(self.bad_file_directory)
        
    def test_can_decompress(self):
        location = self.tool.unzip(self.good_file)

        self.assertEqual(len(listdir(location)), 7, 'unzipped count is off') 

class TestShapefileParts(TestCase):
    
    def setUp(self):
        self.tool = Tool()
    
        self.valid_shapefile = path.join(path.abspath(path.dirname(__file__)), r'data\unzipped\shapefile')
        self.missing_schema_shapefile = path.join(path.abspath(path.dirname(__file__)), r'data\unzipped\incompleteshapefile')
        self.parent_shapefile_directory = path.join(path.abspath(path.dirname(__file__)), r'data\unzipped')
        
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\shapefile'), self.valid_shapefile)
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\incompleteshapefile'), self.missing_schema_shapefile)

    def tearDown(self):
        helpers.delete_directory(self.parent_shapefile_directory)
            
    def test_valid_shapefile_parts(self):
        missing_parts = self.tool.validate_shapefile_parts(self.valid_shapefile)
        
        self.assertEqual(missing_parts, set(), "this shapefile should be seen as valid")
        
    def test_incomplete_shapefile_parts(self):
        missing_parts = self.tool.validate_shapefile_parts(self.missing_schema_shapefile)
        
        self.assertEqual(missing_parts, set([".dbf", ".prj"]), "missing dbf and prj")    
    
if __name__=='__main__':
    main()