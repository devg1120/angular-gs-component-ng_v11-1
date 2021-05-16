import json
import pprint

pp = pprint.PrettyPrinter(indent=0)

with open('../angular.json') as infile:
    aj = json.load(infile)

#print(type(aj))
#print('---------------------------------------------')
#pp.pprint(aj['projects']['admin'])
#print('---------------------------------------------')
#pp.pprint(aj['projects']['spreadsheet'])
#print('---------------------------------------------')
#pp.pprint(aj['projects']['@gs-common-lib/gs-spreadsheet'])
#print('---------------------------------------------')


with open('angular1.json', 'w') as outfile:
    json.dump(aj, outfile, indent=2)

pj = aj['projects']
pj.pop('@gs-common-lib/gs-spreadsheet')
aj['projects'] = pj

with open('angular2.json', 'w') as outfile:
    json.dump(aj, outfile, indent=2)

#with open('../package.json') as p:
#    pj = json.load(p)
#
#print('---------------------------------------------')
#pp.pprint(pj)
#print('---------------------------------------------')
#print(type(pj['name']))
#pp.pprint(pj['name'])
#print('---------------------------------------------')
#print(type(pj['private']))
#pp.pprint(pj['private'])
#print('---------------------------------------------')
#print(type(pj['dependencies']))
#pp.pprint(pj['dependencies'])
#print('---------------------------------------------')
#
