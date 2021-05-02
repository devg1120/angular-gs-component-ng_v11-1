import { Workbook } from '@syncfusion/ej2-excel-export';
import { ExcelRow, ExcelCell, ExcelColumn, BeforeExportEventArgs } from '../../common/base/interface';
import * as events from '../../common/base/constant';
import { PivotView } from '../base/pivotview';
import { IAxisSet, IPivotValues, PivotEngine } from '../../base/engine';
import { IPageSettings } from '../../base/engine';
import { OlapEngine } from '../../base/olap/engine';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { PivotUtil } from '../../base/util';

/**
 * @hidden
 * `ExcelExport` module is used to handle the Excel export action.
 */
export class ExcelExport {
    private parent: PivotView;
    private engine: PivotEngine | OlapEngine;

    /**
     * Constructor for the PivotGrid Excel Export module.
     * @param {PivotView} parent - Instance of pivot table.
     * @hidden
     */
    constructor(parent?: PivotView) {   /* eslint-disable-line */
        this.parent = parent;
    }

    /**
     * For internal use only - Get the module name.
     * @returns {string} - string.
     * @private
     */
    protected getModuleName(): string {
        return 'excelExport';
    }

    /* eslint-disable */
    /**
     * Method to perform excel export.
     * @hidden
     */
    public exportToExcel(type: string): void {
        this.engine = this.parent.dataType === 'olap' ? this.parent.olapEngineModule : this.parent.engineModule;
        /** Event trigerring */
        let clonedValues: IPivotValues;
        let currentPivotValues: IPivotValues = PivotUtil.getClonedPivotValues(this.engine.pivotValues);
        if (this.parent.exportAllPages && this.parent.enableVirtualization && this.parent.dataType !== 'olap') {
            let pageSettings: IPageSettings = this.engine.pageSettings; this.engine.pageSettings = null;
            (this.engine as PivotEngine).generateGridData(this.parent.dataSourceSettings);
            this.parent.applyFormatting(this.engine.pivotValues);
            clonedValues = PivotUtil.getClonedPivotValues(this.engine.pivotValues);
            this.engine.pivotValues = currentPivotValues;
            this.engine.pageSettings = pageSettings;
        } else {
            clonedValues = currentPivotValues;
        }
        let args: BeforeExportEventArgs = {
            fileName: 'default', header: '', footer: '', dataCollections: [clonedValues]
        };
        let fileName: string; let header: string;
        let footer: string; let dataCollections: IPivotValues[];
        this.parent.trigger(events.beforeExport, args, (observedArgs: BeforeExportEventArgs) => {
            fileName = observedArgs.fileName; header = observedArgs.header;
            footer = observedArgs.footer; dataCollections = observedArgs.dataCollections;
        });

        /** Fill data and export */
        let workSheets: any = [];
        for (let dataColl: number = 0; dataColl < dataCollections.length; dataColl++) {
            let pivotValues: IPivotValues = dataCollections[dataColl]; let colLen: number = 0; let rowLen: number = pivotValues.length;
            let actualrCnt: number = 0; let formatList: { [key: string]: string } = this.parent.renderModule.getFormatList();
            let rows: ExcelRow[] = []; let maxLevel: number = 0;
            for (let rCnt: number = 0; rCnt < rowLen; rCnt++) {
                if (pivotValues[rCnt]) {
                    actualrCnt++; colLen = pivotValues[rCnt].length; let cells: ExcelCell[] = [];
                    for (let cCnt: number = 0; cCnt < colLen; cCnt++) {
                        if (pivotValues[rCnt][cCnt]) {
                            let pivotCell: IAxisSet = (pivotValues[rCnt][cCnt] as IAxisSet);
                            if (!(pivotCell.level === -1 && !pivotCell.rowSpan)) {
                                let cellValue: string | number = pivotCell.axis === 'value' ? pivotCell.value : pivotCell.formattedText;
                                if (pivotCell.type === 'grand sum') {
                                    cellValue = this.parent.localeObj.getConstant('grandTotal');
                                } else if (pivotCell.type === 'sum') {
                                    cellValue = cellValue.toString().replace('Total', this.parent.localeObj.getConstant('total'));
                                } else {
                                    cellValue = cellValue;
                                }
                                if (!(pivotCell.level === -1 && !pivotCell.rowSpan)) {
                                    cells.push({
                                        index: cCnt + 1, value: cellValue,
                                        colSpan: pivotCell.colSpan, rowSpan: (pivotCell.rowSpan === -1 ? 1 : pivotCell.rowSpan),
                                    });
                                    if (pivotCell.axis === 'value') {
                                        if (isNaN(pivotCell.value) || pivotCell.formattedText === '' ||
                                            pivotCell.formattedText === undefined || isNullOrUndefined(pivotCell.value)) {
                                            cells[cells.length - 1].value = '';
                                        }
                                        let field: string = (this.parent.dataSourceSettings.valueAxis === 'row' &&
                                            this.parent.dataType === 'olap' && pivotCell.rowOrdinal &&
                                            (this.engine as OlapEngine).tupRowInfo[pivotCell.rowOrdinal]) ?
                                            (this.engine as OlapEngine).tupRowInfo[pivotCell.rowOrdinal].measureName :
                                            pivotCell.actualText as string;
                                        cells[cells.length - 1].style = {
                                            numberFormat: formatList[field], bold: false, wrapText: true
                                        };
                                        if (pivotCell.style) {
                                            cells[cells.length - 1].style.backColor = pivotCell.style.backgroundColor;
                                            cells[cells.length - 1].style.fontColor = pivotCell.style.color;
                                            cells[cells.length - 1].style.fontName = pivotCell.style.fontFamily;
                                            cells[cells.length - 1].style.fontSize = Number(pivotCell.style.fontSize.split('px')[0]);
                                        }
                                    } else {
                                        cells[cells.length - 1].style = {
                                            bold: true, vAlign: 'Center', wrapText: true, indent: cCnt === 0 ? pivotCell.level * 10 : 0
                                        };
                                        if (pivotCell.axis === 'row' && cCnt === 0) {
                                            cells[cells.length - 1].style.hAlign = 'Left';
                                            if (this.parent.dataType === 'olap') {
                                                let indent: number = this.parent.renderModule.indentCollection[rCnt];
                                                cells[cells.length - 1].style.indent = indent * 2;
                                                maxLevel = maxLevel > indent ? maxLevel : indent;
                                            } else {
                                                cells[cells.length - 1].style.indent = pivotCell.level * 2;
                                                maxLevel = pivotCell.level > maxLevel ? pivotCell.level : maxLevel;
                                            }
                                        }
                                    }
                                    cells[cells.length - 1].style.borders = { color: '#000000', lineStyle: 'Thin' };
                                }
                            }
                            cCnt = cCnt + (pivotCell.colSpan ? (pivotCell.colSpan - 1) : 0);
                        } else {
                            cells.push({
                                index: cCnt + 1, value: '', colSpan: 1, rowSpan: 1,
                            });
                        }
                    }
                    rows.push({ index: actualrCnt, cells: cells });
                }
            }
            let columns: ExcelColumn[] = [];
            for (let cCnt: number = 0; cCnt < colLen; cCnt++) {
                columns.push({ index: cCnt + 1, width: 100 });
            }
            if (maxLevel > 0) {
                columns[0].width = 100 + (maxLevel * 20);
            }
            workSheets.push({ columns: columns, rows: rows });
        }
        let book: Workbook = new Workbook({ worksheets: workSheets }, type === 'Excel' ? 'xlsx' : 'csv', undefined, (this.parent as any).currencyCode);
        book.save(fileName + (type === 'Excel' ? '.xlsx' : '.csv'));
    }

    /**
     * To destroy the excel export module
     * @returns {void}
     * @hidden
     */
    public destroy(): void {
    }
}
