import os
import sys
import win32com.client

docx_path = os.path.abspath('docs/documentation/Final_Project_Document.docx')
pdf_path = os.path.abspath('docs/documentation/Final_Project_Document.pdf')

if not os.path.exists(docx_path):
    print(f"Error: {docx_path} does not exist")
    sys.exit(1)

print(f"Opening Word COM to convert: {docx_path}")
word = None
try:
    word = win32com.client.Dispatch('Word.Application')
    word.Visible = False
    word.DisplayAlerts = 0

    doc = word.Documents.Open(docx_path, ReadOnly=True)
    
    # Compute actual rendered page count
    pages = doc.ComputeStatistics(2) # 2 = wdStatisticPages
    print(f"Rendered Page Count in Word: {pages}")

    # Export to PDF (17 = wdFormatPDF)
    doc.SaveAs(pdf_path, FileFormat=17)
    doc.Close(False)
    print(f"[SUCCESS] PDF successfully created at: {pdf_path}")
    print(f"PDF File Size: {os.path.getsize(pdf_path)} bytes")
except Exception as e:
    print(f"Word Conversion Error: {e}")
    sys.exit(1)
finally:
    if word:
        try:
            word.Quit()
        except:
            pass

