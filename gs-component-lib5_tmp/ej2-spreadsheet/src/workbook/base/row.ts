import { CellModel, SheetModel } from './index';
import { RowModel } from './row-model';
import { ChildProperty } from '@syncfusion/ej2-base';
import { FormatModel } from '../common/index';
/**
 * Configures the Row behavior for the spreadsheet.
 *  ```html
 * <div id='Spreadsheet'></div>
 * ```
 * ```typescript
 * let spreadsheet: Spreadsheet = new Spreadsheet({
 *      sheets: [{
 *                rows: [{
 *                        index: 30,
 *                        cells: [{ index: 4, value: 'Total Amount:' },
 *                               { formula: '=SUM(F2:F30)', style: { fontWeight: 'bold' } }]
 *                }]
 * ...
 * });
 * spreadsheet.appendTo('#Spreadsheet');
 * ```
 */
export declare class Row extends ChildProperty<SheetModel> {
    /**
     * Specifies cell and its properties for the row.
     *
     * @default []
     */
    cells: CellModel[];
    /**
     * Specifies the index to the row. Based on the index, row properties are applied.
     *
     * @default 0
     * @asptype int
     */
    index: number;
    /**
     * Specifies height of the row.
     *
     * @default 20
     * @asptype int
     */
    height: number;
    /**
     * specifies custom height of the row.
     *
     * @default false
     */
    customHeight: boolean;
    /**
     * To hide/show the row in spreadsheet.
     *
     * @default false
     */
    hidden: boolean;
    /**
     * Specifies format of the row.
     *
     * @default {}
     */
    format: FormatModel;
}
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} rowIndex - Specifies the rowIndex.
 * @returns {RowModel} - To get the row.
 */
export declare function getRow(sheet: SheetModel, rowIndex: number): RowModel;
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} rowIndex - Specifies the rowIndex.
 * @param {RowModel} row - Specifies the row.
 * @returns {void} - To set the row.
 */
export declare function setRow(sheet: SheetModel, rowIndex: number, row: RowModel): void;
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} index - Specifies the index.
 * @returns {boolean} - To return the bool value.
 */
export declare function isHiddenRow(sheet: SheetModel, index: number): boolean;
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} rowIndex - Specifies the rowIndex.
 * @param {boolean} checkDPR - Specifies the bool value.
 * @returns {number} - To get the row height.
 */
export declare function getRowHeight(sheet: SheetModel, rowIndex: number, checkDPR?: boolean): number;
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} rowIndex - Specifies the rowIndex.
 * @param {number} height - Specifies the height.
 * @returns {void} - To set the row height.
 */
export declare function setRowHeight(sheet: SheetModel, rowIndex: number, height: number): void;
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} startRow - Specifies the startRow.
 * @param {number} endRow - Specifies the endRow.
 * @param {boolean} checkDPR - Specifies the boolean value.
 * @returns {number} - To get the rows height.
 */
export declare function getRowsHeight(sheet: SheetModel, startRow: number, endRow?: number, checkDPR?: boolean): number;
