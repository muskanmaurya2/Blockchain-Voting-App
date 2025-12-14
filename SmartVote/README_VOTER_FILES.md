# Voter Data File Examples

This folder contains example files that can be used with the voter registration system. The system supports uploading voter data in various formats including CSV, Excel, JSON, and TXT files.

## File Format Requirements

All files must contain the following information for each voter:
- **name**: Full name of the voter
- **address**: Ethereum wallet address of the voter
- **phone**: Phone number (optional)

## Example Files

### 1. CSV File (voter_example.csv)
A comma-separated values file with a header row containing column names.

### 2. Excel File Creation
To create an Excel file:
1. Open the CSV file (voter_example.csv) in Microsoft Excel or Google Sheets
2. Save/Export as Excel format (.xlsx)

Alternatively, you can create an Excel file directly with the following structure:
- First row: Headers (name, address, phone)
- Subsequent rows: Voter data

### 3. JSON File (voter_example.json)
A JSON array where each element represents a voter with name, address, and phone properties.

### 4. TXT File (voter_example.txt)
A tab-delimited text file with a header row containing column names.

## How to Use

1. Navigate to the Verification page in the admin panel
2. Click "Choose File" and select one of the example files
3. Click "Upload and Collect Voter Data"
4. The system will parse the data and show results in an alert

## Important Notes

- The current smart contract only allows voters to register themselves
- Uploaded data is collected for distribution purposes
- Voters must still visit the Registration page to complete their registration
- All Ethereum addresses in the examples are valid checksummed addresses

## Customizing Your Files

When creating your own files, ensure:
1. Column headers match: "name", "address", "phone"
2. Ethereum addresses are valid and checksummed
3. Phone numbers follow a consistent format
4. No empty rows or missing required data

## Sample Data Format

All example files contain the same sample data:

| Name           | Address                                    | Phone          |
|----------------|--------------------------------------------|----------------|
| John Doe       | 0x742d35Cc6634C0532925a3b844Bc454e4438f44e | 123-456-7890   |
| Jane Smith     | 0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8 | 234-567-8901   |
| Bob Johnson    | 0x44365a305f47847712b5e5523870512432331122 | 345-678-9012   |
| Alice Williams | 0x32bA16f457A55bF3965f81a35754f44c28182121 | 456-789-0123   |
| Charlie Brown  | 0x5dA58447490961493e435946145b965123456789 | 567-890-1234   |