import os
import sys
import csv
import ast
import glob
import xml.etree.ElementTree as ET
import unittest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

class TestOdooModuleStatic(unittest.TestCase):
    
    def test_01_manifest_validity_and_dependencies(self):
        manifest_path = os.path.join(REPO_ROOT, '__manifest__.py')
        self.assertTrue(os.path.exists(manifest_path), "__manifest__.py must exist")
        
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest_content = f.read()
            manifest_dict = ast.literal_eval(manifest_content)
            
        self.assertIsInstance(manifest_dict, dict, "Manifest must parse into a dict")
        self.assertEqual(manifest_dict.get('name'), 'Subscription Management')
        self.assertTrue(manifest_dict.get('installable'), "Module must be installable")
        self.assertTrue(manifest_dict.get('application'), "Module must be an application")
        
        # Verify required dependencies
        expected_depends = ['sale_management', 'account', 'mail', 'portal']
        for dep in expected_depends:
            self.assertIn(dep, manifest_dict.get('depends', []), f"Missing dependency: {dep}")
            
        # Verify data files exist
        for data_file in manifest_dict.get('data', []):
            full_path = os.path.join(REPO_ROOT, data_file)
            self.assertTrue(os.path.exists(full_path), f"Declared data file does not exist: {data_file}")

    def test_02_xml_structure_and_records(self):
        xml_files = glob.glob(os.path.join(REPO_ROOT, '**', '*.xml'), recursive=True)
        self.assertGreater(len(xml_files), 0, "There should be XML files")
        
        for xml_file in xml_files:
            try:
                tree = ET.parse(xml_file)
                root = tree.getroot()
                self.assertIn(root.tag, ['odoo', 'openerp'], f"Root tag must be <odoo> in {xml_file}")
                
                # Check record elements
                records = root.findall('.//record')
                for record in records:
                    self.assertIn('id', record.attrib, f"<record> tag missing 'id' attribute in {xml_file}")
                    self.assertIn('model', record.attrib, f"<record> tag missing 'model' attribute in {xml_file}")
            except Exception as e:
                self.fail(f"XML Parsing failed for {xml_file}: {e}")

    def test_03_security_ir_model_access_csv(self):
        csv_path = os.path.join(REPO_ROOT, 'security', 'ir.model.access.csv')
        self.assertTrue(os.path.exists(csv_path), "ir.model.access.csv must exist")
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            expected_header = ['id', 'name', 'model_id:id', 'group_id:id', 'perm_read', 'perm_write', 'perm_create', 'perm_unlink']
            self.assertEqual(header, expected_header, "ir.model.access.csv header is incorrect")
            
            row_count = 0
            for row in reader:
                if not row or row[0].startswith('#'):
                    continue
                row_count += 1
                self.assertEqual(len(row), 8, f"Row must have 8 columns: {row}")
                # permissions check
                for perm in row[4:]:
                    self.assertIn(perm.strip(), ['0', '1'], f"Permission value must be 0 or 1: {row}")
            self.assertGreater(row_count, 0, "ir.model.access.csv must not be empty")

    def test_04_python_models_ast_verification(self):
        models_dir = os.path.join(REPO_ROOT, 'models')
        py_files = glob.glob(os.path.join(models_dir, '*.py'))
        self.assertGreater(len(py_files), 0, "No model python files found")
        
        found_classes = {}
        for py_file in py_files:
            with open(py_file, 'r', encoding='utf-8') as f:
                tree = ast.parse(f.read(), filename=py_file)
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        for item in node.body:
                            if isinstance(item, ast.Assign):
                                for target in item.targets:
                                    if isinstance(target, ast.Name) and target.id in ['_name', '_inherit']:
                                        if isinstance(item.value, ast.Constant):
                                            found_classes[node.name] = (target.id, item.value.value)
        
        # Verify key models exist
        model_names = [val[1] for val in found_classes.values()]
        self.assertIn('subscription.subscription', model_names, "subscription.subscription model must be defined")
        self.assertIn('subscription.plan', model_names, "subscription.plan model must be defined")
        self.assertIn('sale.order.line', model_names, "sale.order.line inheritance must be defined")
        self.assertIn('product.template', model_names, "product.template inheritance must be defined")

if __name__ == '__main__':
    unittest.main()

