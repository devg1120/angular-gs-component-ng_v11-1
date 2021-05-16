import json
import pprint

pp = pprint.PrettyPrinter(indent=0)

with open('../projects/admin/src/app/app.module.ts') as f:
    fileText = f.read()


with open('app.module1.ts', 'w') as outfile:
    outfile.write(fileText)


afterText = fileText.replace('@syncfusion/ej2-angular-spreadsheet', '@devg1120/gs-angular-spreadsheet')


with open('app.module2.ts', 'w') as outfile:
    outfile.write(afterText)

