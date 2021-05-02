import { TreeGrid } from '../../src/treegrid/base/treegrid';
import { createGrid, destroy } from '../base/treegridutil.spec';
import { employeeData2, employeeData3  } from '../base/datasource.spec';
import { Sort } from '../../src/treegrid/actions/sort';
import { Page } from '../../src/treegrid/actions/page';
import { Toolbar } from '../../src/treegrid/actions/toolbar';
import { Filter } from '../../src/treegrid/actions/filter'
import { DetailRow } from '../../src/treegrid/actions/detail-row';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { CellSaveEventArgs, actionComplete } from '../../src';
import { CellEditArgs, dataBound } from '@syncfusion/ej2-grids';


TreeGrid.Inject(Page,DetailRow,Toolbar,Sort,Filter);
let template : string = `<table id = "table1">
<colgroup>
    <col width="35%">
    <col width="35%">
    <col width="35%">
</colgroup>
<tbody>
    <tr>
            <td rowspan="4" style="text-align: center;">
                    <img class='photo' src="" alt="\${EmployeeID}" />
                </td>
        <td>
            <span style="font-weight: 500;">Name: </span> \${Name}
        </td>
        <td>
            <span style="font-weight: 500;">Full Name: </span> \${FullName}
        </td>
    </tr>
    <tr>                  
        <td>
            <span style="font-weight: 500;">Designation: </span> \${Designation}
        </td>
        <td>
            <span style="font-weight: 500;">EmployeeID: </span> \${EmployeeID}
        </td>
    </tr>
    <tr>
        <td>
            <span style="font-weight: 500;">Address: </span> \${Address}
        </td>
        <td>
            <span style="font-weight: 500;">Phone: </span> \${Country}
        </td>          
    </tr>
    <tr>
        <td>
            <span style="font-weight: 500;">DOB: </span> \${Contact}
        </td>
        <td>
             <span style="font-weight: 500;">Country: </span> \${DOB}
        </td>
    </tr>  
</tbody>
</table>`;
describe('Render detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData3,
            detailTemplate: template,
            childMapping: "Children",
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
    it('Render the detail template', () => {
       expect(gridObj.getRows()[1].classList.contains("e-detailrow")).toBe(true);
       expect(gridObj.getRows()[3].classList.contains("e-detailrow")).toBe(true);
       expect(gridObj.getRows()[5].classList.contains("e-detailrow")).toBe(true);
    });
    it('Render Collapse', () => {
        gridObj.collapseRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
       expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('none');
    });
     it('Render expand', () => {
        gridObj.expandRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
        expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('table-row');
        });   
     afterAll(() => {
        destroy(gridObj);
      }); 
});

describe('Render selfRefrential detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData2,
            detailTemplate: template,
            idMapping: 'TaskID',
            parentIdMapping: 'parentID',
            allowResizing: true,
            allowSorting: true,
            toolbar: ['Search'],
            pageSettings: {pageSize: 24, pageSizes: true},
            sortSettings: { columns: [{ field: 'EmployeeID', direction: 'Ascending' }] },
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
   it('Render selfrefrential detail template', () => {
       expect(gridObj.getRows()[1].classList.contains("e-detailrow")).toBe(true);
       expect(gridObj.getRows()[3].classList.contains("e-detailrow")).toBe(true);
       expect(gridObj.getRows()[5].classList.contains("e-detailrow")).toBe(true);
    });
    it('Render Collapse', () => {
        gridObj.collapseRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
       expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('none');
    });
    it('Render expand', () => {
        gridObj.expandRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
        expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('table-row');
    });   
     afterAll(() => {
        destroy(gridObj);
      }); 
});

 describe('Paging detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData3,
            detailTemplate: template,
            childMapping: "Children",
            allowPaging:true,
            pageSettings: {pageSize: 10, pageSizes: true},
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
    it('check the pagesize', () => {
        expect(gridObj.getRows().length).toBe(20);
     });
    it('Paging Collapse', (done: Function) => {
        gridObj.dataBound = (args?: Object): void => {
        expect(gridObj.getRows().length == 16).toBe(true);
        done();
        }
        gridObj.collapseRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);  
        
    });
    it('Paging expand', (done: Function) => {
        gridObj.dataBound = (args?: Object): void => {
        expect(gridObj.getRows().length == 20).toBe(true);
        done();
        }
        gridObj.expandRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
    });
         afterAll(() => {
         destroy(gridObj);
       });
 });
describe('Paging selfRefrential detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData2,
            detailTemplate: template,
            idMapping: 'TaskID',
            parentIdMapping: 'parentID',
            allowPaging:true,
            pageSettings: {pageSize: 10, pageSizes: true},
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
    it('check the pagesize', () => {
        expect(gridObj.getRows().length).toBe(20);
     });  
    it('Paging Collapse', (done: Function) => {
       gridObj.dataBound = (args?: Object): void => {
       expect(gridObj.getRows().length == 16).toBe(true);
       done();
       }
       gridObj.collapseRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);  
       
   });
    it('Paging expand', (done: Function) => {
       gridObj.dataBound = (args?: Object): void => {
       expect(gridObj.getRows().length == 20).toBe(true);
       done();
       }
       gridObj.expandRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
   });
         afterAll(() => {
         destroy(gridObj);
       });
 });

 describe('Searching detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData3,
            detailTemplate: template,
            childMapping: "Children",
            toolbar: ['Search'],
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
    it('Check the search records', (done: Function) => {
        actionComplete = (args?: CellSaveEventArgs): void => {
         if (args.requestType == 'searching') {  
           expect(gridObj.getRows()[5].querySelectorAll('tbody')[0].querySelector('td').children[0].classList.contains('photo')).toBe(true);
           done();
         }
        }
        gridObj.grid.actionComplete = actionComplete;
        gridObj.search("Romey Wilson");
    });
    it('Searching Collapse', () => {
        gridObj.collapseRow(gridObj.getRows()[2], gridObj.getCurrentViewRecords()[1]);
       expect((gridObj.getRows()[5] as HTMLTableRowElement).style.display).toBe('none');
    });
    it('Searching expand', () => {
        gridObj.expandRow(gridObj.getRows()[2], gridObj.getCurrentViewRecords()[1]);
        expect((gridObj.getRows()[5] as HTMLTableRowElement).style.display).toBe('table-row');
    }); 
        afterAll(() => {
        destroy(gridObj);
      });
});

describe('Searching  selfRefrence detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData2,
            detailTemplate: template,
            idMapping: 'TaskID',
            parentIdMapping: 'parentID',
            toolbar: ['Search'],
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
    it('Check the search records', (done: Function) => {
        actionComplete = (args?: CellSaveEventArgs): void => {
            if (args.requestType == 'searching') {  
              expect(gridObj.getRows()[5].querySelectorAll('tbody')[0].querySelector('td').children[0].classList.contains('photo')).toBe(true);
              done();
            }
        }
        gridObj.grid.actionComplete = actionComplete;
        gridObj.search("Romey Wilson");
    });
    it('Searching Collapse', () => {
       gridObj.collapseRow(gridObj.getRows()[2], gridObj.getCurrentViewRecords()[1]);
       expect((gridObj.getRows()[5] as HTMLTableRowElement).style.display).toBe('none');
    });
    it('Searching expand', () => {
        gridObj.expandRow(gridObj.getRows()[2], gridObj.getCurrentViewRecords()[1]);
        expect((gridObj.getRows()[5] as HTMLTableRowElement).style.display).toBe('table-row');
    }); 
        afterAll(() => {
        destroy(gridObj);
      });
});

describe('Sorting for detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData3,
            detailTemplate: template,
            childMapping: "Children",
            allowSorting: true,
            toolbar: ['Search'],
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
    it('Sorting the column', (done: Function) => {
        actionComplete = (args?: Object): void => {
           expect((gridObj.getDataRows()[3].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText == "Tedd Lawson").toBe(true);
           expect((gridObj.getDataRows()[4].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText == "Steven Buchanan").toBe(true);
           expect((gridObj.getDataRows()[5].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText == "Margaret Peacock").toBe(true);
           expect((gridObj.getDataRows()[6].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText == "Laura Callahan").toBe(true);
           done();
        }
      gridObj.grid.actionComplete = actionComplete;
      gridObj.sortByColumn("Name", "Descending", true);
        });
        it('Sorting Collapse', () => {
            gridObj.collapseRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
           expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('none');
        });
        it('Sorting expand', () => {
            gridObj.expandRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
            expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('table-row');
        });  
        afterAll(() => {
        destroy(gridObj);
      });
});

describe('Sorting selfrefrential detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData2,
            detailTemplate: template,
            idMapping: 'TaskID',
            parentIdMapping: 'parentID',
            allowSorting: true,
            toolbar: ['Search'],
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
    it('Sorting the column', (done: Function) => {
        actionComplete = (args?: Object): void => {
           expect((gridObj.getDataRows()[3].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText == "Tedd Lawson").toBe(true);
           expect((gridObj.getDataRows()[4].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText == "Steven Buchanan").toBe(true);
           expect((gridObj.getDataRows()[5].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText == "Margaret Peacock").toBe(true);
           expect((gridObj.getDataRows()[6].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText == "Laura Callahan").toBe(true);
           done();
        }
      gridObj.grid.actionComplete = actionComplete;
      gridObj.sortByColumn("Name", "Descending", true);
        });
        it('Sorting Collapse', () => {
            gridObj.collapseRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
           expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('none');
        });
        it('Sorting expand', () => {
            gridObj.expandRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
            expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('table-row');
        });  
        afterAll(() => {
        destroy(gridObj);
      });
});

describe('Checking detailDataBound for detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let detailDataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData3,
            detailTemplate: template,
            childMapping: "Children",
            allowSorting: true,
            toolbar: ['Search'],
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
    it(' detailDataBound Sorting the column', (done: Function) => {
        detailDataBound = (args?: any): void => {
            if(gridObj.sortSettings.columns[0].direction == "Descending"){
                expect(!isNullOrUndefined(args.data)).toBe(true);
                done();
        }
    }
      gridObj.detailDataBound = detailDataBound;
      gridObj.sortByColumn("Name", "Descending", true);
        });
        afterAll(() => {
        destroy(gridObj);
      });
});
describe('Checking detailDataBound selfRefrential for detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let detailDataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

    gridObj = createGrid(
        {
            dataSource: employeeData2,
            detailTemplate: template,
            idMapping: 'TaskID',
            parentIdMapping: 'parentID',
            allowSorting: true,
            toolbar: ['Search'],
            treeColumnIndex: 0,
            columns: [
                {field:'EmployeeID', headerText:'EmployeeID', width: 140},
                { headerText: 'Name', width: 140, field: 'Name' },
                { headerText: 'FullName', width: 150, field:'FullName'},
                {headerText: 'TaskID', width: 150, field: 'TaskID'}
            ],
            height: 315
        },
        done
      );
    });
    it(' detailDataBound Sorting the column', (done: Function) => {
        detailDataBound = (args?: any): void => {
            if(gridObj.sortSettings.columns[0].direction == "Descending"){
                expect(!isNullOrUndefined(args.data)).toBe(true);
                done();
        }
    }
      gridObj.detailDataBound = detailDataBound;
      gridObj.sortByColumn("Name", "Descending", true);
        });
        afterAll(() => {
        destroy(gridObj);
      });
});
describe('Row editing for detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

        gridObj = createGrid(
            {
                dataSource: employeeData3,
                detailTemplate: template,
                childMapping: "Children",
                toolbar: ['Search', 'Edit'],
                allowPaging: true,
                editSettings: { allowEditing: true, mode: 'Row', allowDeleting: true, allowAdding: true, newRowPosition: 'Top' },
                treeColumnIndex: 0,
                columns: [
                    { field: 'EmployeeID', headerText: 'EmployeeID', width: 140 },
                    { headerText: 'Name', width: 140, field: 'Name' },
                    { headerText: 'FullName', width: 150, field: 'FullName' },
                    { headerText: 'TaskID', width: 150, field: 'TaskID' }
                ],
                height: 315
            },
            done
        );
    });
    it('Add row - no selection', (done: Function) => {
        actionComplete = (args?: any): void => {
            if (args.requestType === 'add') {
                expect(args.row.querySelectorAll('.e-editcell')[0].getAttribute('colSpan') == '4').toBe(true);
                done();
            }
        };
        gridObj.actionComplete = actionComplete;
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_add' } });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Row editing selfrefrential for detailTemplate', () => {
    let gridObj: TreeGrid;
    let rows: Element[];
    let actionBegin: () => void;
    let actionComplete: () => void;
    let dataBound: () => void;
    let actionFailure: () => void;
    beforeAll((done: Function) => {

        gridObj = createGrid(
            {
                dataSource: employeeData2,
                detailTemplate: template,
                idMapping: 'TaskID',
                parentIdMapping: 'parentID',
                toolbar: ['Search', 'Edit'],
                allowPaging: true,
                editSettings: { allowEditing: true, mode: 'Row', allowDeleting: true, allowAdding: true, newRowPosition: 'Top' },
                treeColumnIndex: 0,
                columns: [
                    { field: 'EmployeeID', headerText: 'EmployeeID', width: 140 },
                    { headerText: 'Name', width: 140, field: 'Name' },
                    { headerText: 'FullName', width: 150, field: 'FullName' },
                    { headerText: 'TaskID', width: 150, field: 'TaskID' }
                ],
                height: 315
            },
            done
        );
    });
    it('Add row selfrefrential - no selection', (done: Function) => {
        actionComplete = (args?: any): void => {
            if (args.requestType === 'add') {
                expect(args.row.querySelectorAll('.e-editcell')[0].getAttribute('colSpan') == '4').toBe(true);
                done();
            }
        };
        gridObj.actionComplete = actionComplete;
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_add' } });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('check expand status after sorting', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {

        gridObj = createGrid(
            {
                dataSource: employeeData3,
                detailTemplate: template,
                childMapping: "Children",
                allowSorting: true,
                treeColumnIndex: 0,
                columns: [
                    { field: 'EmployeeID', headerText: 'EmployeeID', width: 140 },
                    { headerText: 'Name', width: 140, field: 'Name' },
                    { headerText: 'FullName', width: 150, field: 'FullName' },
                    { headerText: 'TaskID', width: 150, field: 'TaskID' }
                ],
                height: 315
            },
            done
        );
    });
    it('Sorting  and collapse', (done: Function): void => {
        gridObj.collapsed = function(args){
        expect(gridObj.getRows()[4].querySelector('.e-treegridcollapse').classList.contains('e-treegridcollapse')).toBe(true);
           done();
        };
        gridObj.collapseRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
        
    });
    it('Sorting  and collapse', (done: Function): void => {
        gridObj.expanded = function(args){
            
            expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('');
            done();
            }
        gridObj.actionComplete = function(args){
            if(args.requestType == 'sorting') {
                gridObj.expandRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
            }
        };
        gridObj.sortByColumn("Name", "Ascending", true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('check expand status after sorting', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {

        gridObj = createGrid(
            {
                dataSource: employeeData2,
                detailTemplate: template,
                idMapping: 'TaskID',
                parentIdMapping: 'parentID',
                allowSorting: true,
                treeColumnIndex: 0,
                columns: [
                    { field: 'EmployeeID', headerText: 'EmployeeID', width: 140 },
                    { headerText: 'Name', width: 140, field: 'Name' },
                    { headerText: 'FullName', width: 150, field: 'FullName' },
                    { headerText: 'TaskID', width: 150, field: 'TaskID' }
                ],
                height: 315
            },
            done
        );
    });
    it('Sorting  and collapse', (done: Function): void => {
        gridObj.collapsed = function(args){
        expect(gridObj.getRows()[4].querySelector('.e-treegridcollapse').classList.contains('e-treegridcollapse')).toBe(true);
           done();
        };
        gridObj.collapseRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
        
    });
    it('Sorting  and collapse', (done: Function): void => {
        gridObj.expanded = function(args){
            
            expect((gridObj.getRows()[7] as HTMLTableRowElement).style.display).toBe('');
            done();
            }
        gridObj.actionComplete = function(args){
            if(args.requestType == 'sorting') {
                gridObj.expandRow(gridObj.getRows()[4], gridObj.getCurrentViewRecords()[2]);
            }
        };
        gridObj.sortByColumn("Name", "Ascending", true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});