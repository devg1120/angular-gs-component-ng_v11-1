import { Workbook } from '../base/index';
import { SheetModel, RowModel, CellModel } from './index';
/**
 * Update data source to Sheet and returns Sheet
 *
 * @param {Workbook} context - Specifies the context.
 * @param {string} address - Specifies the address.
 * @param {boolean} columnWiseData - Specifies the bool value.
 * @param {boolean} valueOnly - Specifies the valueOnly.
 * @param {number[]} frozenIndexes - Specifies the freeze row and column start indexes, if it is scrolled.
 * @param {boolean} filterDialog - Specifies the bool value.
 * @returns {Promise<Map<string, CellModel> | Object[]>} - To get the data
 * @hidden
 */
export declare function getData(context: Workbook, address: string, columnWiseData?: boolean, valueOnly?: boolean, frozenIndexes?: number[], filterDialog?: boolean): Promise<Map<string, CellModel> | {
    [key: string]: CellModel;
}[]>;
/**
 * @hidden
 * @param {SheetModel | RowModel | CellModel} model - Specifies the sheet model.
 * @param {number} idx - Specifies the index value.
 * @returns {SheetModel | RowModel | CellModel} - To process the index
 */
export declare function getModel(model: (SheetModel | RowModel | CellModel)[], idx: number): SheetModel | RowModel | CellModel;
/**
 * @hidden
 * @param {SheetModel | RowModel | CellModel} model - Specifies the sheet model.
 * @param {boolean} isSheet - Specifies the bool value.
 * @param {Workbook} context - Specifies the Workbook.
 * @returns {void} - To process the index
 */
export declare function processIdx(model: (SheetModel | RowModel | CellModel)[], isSheet?: true, context?: Workbook): void;
/**
 * @hidden
 * @param {Workbook} context - Specifies the context.
 * @param {string} address - Specifies the address.
 * @param {number} sheetIdx - Specifies the sheetIdx.
 * @param {boolean} valueOnly - Specifies the bool value.
 * @returns {void} - To clear the range.
 */
export declare function clearRange(context: Workbook, address: string, sheetIdx: number, valueOnly: boolean): void;
