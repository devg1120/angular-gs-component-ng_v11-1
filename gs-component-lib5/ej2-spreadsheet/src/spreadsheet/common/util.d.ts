import { StyleType, CollaborativeEditArgs, IAriaOptions } from './index';
import { Spreadsheet } from '../base/index';
import { SheetModel, CellStyleModel } from '../../workbook/index';
import { Workbook } from '../../workbook/index';
/**
 * The function used to update Dom using requestAnimationFrame.
 *
 * @param  {Function} fn - Function that contains the actual action
 * @returns {void}
 * @hidden
 */
export declare function getUpdateUsingRaf(fn: Function): void;
/**
 * The function used to remove the dom element children.
 *
 * @param  {Element} parent - Specify the parent
 * @returns {void} - The function used to get colgroup width based on the row index.
 * @hidden
 */
export declare function removeAllChildren(parent: Element): void;
/**
 * The function used to get colgroup width based on the row index.
 *
 * @param  {number} index - Specify the index
 * @returns {number} - The function used to get colgroup width based on the row index.
 * @hidden
 */
export declare function getColGroupWidth(index: number): number;
/**
 * @hidden
 * @returns {number} - To get scrollbar width
 */
export declare function getScrollBarWidth(): number;
/**
 * @hidden
 * @param {HTMLElement} element - Specify the element.
 * @param {string[]} classList - Specify the classList.
 * @returns {number} - get Siblings Height
 */
export declare function getSiblingsHeight(element: HTMLElement, classList?: string[]): number;
/**
 * @hidden
 * @param {Spreadsheet} context - Specify the spreadsheet.
 * @param {number[]} range - Specify the range.
 * @param {boolean} isModify - Specify the boolean value.
 * @returns {boolean} - Returns boolean value.
 */
export declare function inView(context: Spreadsheet, range: number[], isModify?: boolean): boolean;
/**
 * To get the top left cell position in viewport.
 *
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {number[]} indexes - Specify the indexes.
 * @param {number} frozenRow - Specify the frozen row.
 * @param {number} frozenColumn - Specify the frozen column
 * @param {number} freezeScrollHeight - Specify the freeze scroll height
 * @param {number} freezeScrollWidth - Specify the freeze scroll width
 * @param {number} rowHdrWidth - Specify the row header width
 * @returns {number} - To get the top left cell position in viewport.
 */
export declare function getCellPosition(sheet: SheetModel, indexes: number[], frozenRow?: number, frozenColumn?: number, freezeScrollHeight?: number, freezeScrollWidth?: number, rowHdrWidth?: number): {
    top: number;
    left: number;
};
/**
 * @param {Spreadsheet} parent - Specify the parent
 * @param {HTMLElement} ele - Specify the element
 * @param {number[]} range - Specify the range
 * @param {string} cls - Specify the class name
 * @returns {void} - To set the position
 * @hidden
 */
export declare function setPosition(parent: Spreadsheet, ele: HTMLElement, range: number[], cls?: string): void;
/**
 * @param {Element} content - Specify the content element.
 * @param {HTMLElement} checkElement - Specify the element.
 * @param {boolean} checkActiveCell - Specify the boolean value.
 * @returns {void} - remove element with given range
 */
export declare function removeRangeEle(content: Element, checkElement: HTMLElement, checkActiveCell: boolean): void;
/**
 * Position element with given range
 *
 * @hidden
 * @param {HTMLElement} ele - Specify the element.
 * @param {number[]} range - specify the range.
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {boolean} isRtl - Specify the boolean value.
 * @param {number} frozenRow - Specidy the frozen row.
 * @param {number} frozenColumn - Specify the frozen column
 * @param {boolean} isActiveCell - Specidy the boolean value.
 * @param {number} freezeScrollHeight - Specify the freeze scroll height
 * @param {number} freezeScrollWidth - Specify the freeze scroll width
 * @param {number} rowHdrWidth - Specify the row header width
 * @returns {void} - Position element with given range
 */
export declare function locateElem(ele: HTMLElement, range: number[], sheet: SheetModel, isRtl: boolean, frozenRow?: number, frozenColumn?: number, isActiveCell?: boolean, freezeScrollHeight?: number, freezeScrollWidth?: number, rowHdrWidth?: number): void;
/**
 * To update element styles using request animation frame
 *
 * @hidden
 * @param {StyleType[]} styles - Specify the styles
 * @returns {void} - To update element styles using request animation frame
 */
export declare function setStyleAttribute(styles: StyleType[]): void;
/**
 * @hidden
 * @returns {string} - to get Start Event
 */
export declare function getStartEvent(): string;
/**
 * @hidden
 * @returns {string} - to get Move Event
 */
export declare function getMoveEvent(): string;
/**
 * @hidden
 * @returns {string} - Returns string value.
 */
export declare function getEndEvent(): string;
/**
 * @hidden
 * @param {Event} e - To specify the event.
 * @returns {boolean} - Returns boolean value.
 */
export declare function isTouchStart(e: Event): boolean;
/**
 * @hidden
 * @param {Event} e - To specify the event.
 * @returns {boolean} - Returns boolean value.
 */
export declare function isTouchMove(e: Event): boolean;
/**
 * @hidden
 * @param {Event} e - To specify the event.
 * @returns {boolean} - Returns boolean value.
 */
export declare function isTouchEnd(e: Event): boolean;
/**
 * @hidden
 * @param {TouchEvent | MouseEvent} e - To specify the mouse and touch event.
 * @returns {number} - To get client value
 */
export declare function isMouseDown(e: MouseEvent): boolean;
/**
 * @param {MouseEvent} e - Specify the event.
 * @returns {boolean} - To get boolean value.
 * @hidden
 */
export declare function isMouseMove(e: MouseEvent): boolean;
/**
 * @param {MouseEvent} e - Specify the event.
 * @returns {boolean} - To get boolean value
 * @hidden
 */
export declare function isMouseUp(e: MouseEvent): boolean;
/**
 * @param {MouseEvent | TouchEvent} e - To specify the mouse or touch event.
 * @returns {number} - To get client X value.
 * @hidden
 */
export declare function getClientX(e: TouchEvent & MouseEvent): number;
/**
 * @hidden
 * @param {MouseEvent | TouchEvent} e - To specify the mouse and touch event.
 * @returns {number} - To get client value
 */
export declare function getClientY(e: MouseEvent & TouchEvent): number;
/**
 * Get even number based on device pixel ratio
 *
 * @param {number} value - Specify the number
 * @param {boolean} preventDecrease - Specify the boolean value
 * @returns {number} - To get DPR value
 * @hidden
 */
export declare function getDPRValue(value: number, preventDecrease?: boolean): number;
/**
 * @hidden
 * @param {HTMLElement} target - specify the target.
 * @param {IAriaOptions<boolean>} options - Specify the options.
 * @returns {void} -  to set Aria Options
 */
export declare function setAriaOptions(target: HTMLElement, options: IAriaOptions<boolean>): void;
/**
 * @hidden
 * @param {HTMLElement} element - specify the element.
 * @param {Object} component - Specify the component.
 * @returns {void} -  to destroy the component.
 */
export declare function destroyComponent(element: HTMLElement, component: Object): void;
/**
 * @hidden
 * @param {number} idx - Specify the index
 * @param {number} index - Specify the index
 * @param {string} value - Specify the value.
 * @param {boolean} isCol - Specify the boolean value.
 * @param {Spreadsheet} parent - Specify the parent.
 * @returns {void} - To set resize.
 */
export declare function setResize(idx: number, index: number, value: string, isCol: boolean, parent: Spreadsheet): void;
/**
 * @hidden
 * @param {HTMLElement} trgt - Specify the target element.
 * @param {number} value - specify the number.
 * @param {boolean} isCol - Specify the boolean vlaue.
 * @returns {void} -  to set width and height.
 */
export declare function setWidthAndHeight(trgt: HTMLElement, value: number, isCol: boolean): void;
/**
 * @hidden
 * @param {HTMLElement} table - Specify the table.
 * @param {HTMLElement[]} text - specify the text.
 * @param {boolean} isCol - Specifyt boolean value
 * @param {Spreadsheet} parent - Specify the parent.
 * @param {string} prevData - specify the prevData.
 * @param {boolean} isWrap - Specifyt boolean value
 * @returns {number} - To find maximum value.
 */
export declare function findMaxValue(table: HTMLElement, text: HTMLElement[], isCol: boolean, parent: Spreadsheet, prevData?: string, isWrap?: boolean): number;
/**
 * @hidden
 * @param {CollaborativeEditArgs} options - Specify the collaborative edit arguments.
 * @param {Spreadsheet} spreadsheet - specify the spreadsheet.
 * @param {boolean} isRedo - Specifyt he boolean value.
 * @returns {void} - To update the Action.
 */
export declare function updateAction(options: CollaborativeEditArgs, spreadsheet: Spreadsheet, isRedo?: boolean): void;
/**
 * @hidden
 * @param {Workbook} workbook - Specify the workbook
 * @param {number} rowIdx - specify the roe index
 * @param {number} colIdx - specify the column Index.
 * @param {number} sheetIdx - specify the sheet index.
 * @returns {boolean} - Returns the boolean value.
 */
export declare function hasTemplate(workbook: Workbook, rowIdx: number, colIdx: number, sheetIdx: number): boolean;
/**
 * Setting row height in view an model.
 *
 * @hidden
 * @param {Spreadsheet} parent - Specify the parent
 * @param {SheetModel} sheet - specify the column width
 * @param {number} height - specify the style.
 * @param {number} rowIdx - specify the rowIdx
 * @param {HTMLElement} row - specify the row
 * @param {HTMLElement} hRow - specify the hRow.
 * @param {boolean} notifyRowHgtChange - specify boolean value.
 * @returns {void} - Setting row height in view an model.
 */
export declare function setRowEleHeight(parent: Spreadsheet, sheet: SheetModel, height: number, rowIdx: number, row?: HTMLElement, hRow?: HTMLElement, notifyRowHgtChange?: boolean): void;
/**
 * @hidden
 * @param {Workbook} context - Specify the context
 * @param {CellStyleModel} style - specify the style.
 * @param {number} lines - specify the lines
 * @returns {number} - get Text Height
 */
export declare function getTextHeight(context: Workbook, style: CellStyleModel, lines?: number): number;
/**
 * @hidden
 * @param {string} text - Specify the text
 * @param {CellStyleModel} style - specify the style.
 * @param {CellStyleModel} parentStyle - specify the parentStyle
 * @returns {number} - get Text Width
 */
export declare function getTextWidth(text: string, style: CellStyleModel, parentStyle: CellStyleModel): number;
/**
 * @hidden
 * @param {string} text - Specify the text
 * @param {number} colwidth - specify the column width
 * @param {CellStyleModel} style - specify the style.
 * @param {CellStyleModel} parentStyle - specify the parentStyle
 * @returns {number} - Setting maximum height while doing formats and wraptext
 */
export declare function getLines(text: string, colwidth: number, style: CellStyleModel, parentStyle: CellStyleModel): number;
/**
 * calculation for height taken by border inside a cell
 *
 * @param {number} rowIdx - Specify the row index.
 * @param {number} colIdx - Specify the column index.
 * @param {SheetModel} sheet - Specify the sheet.
 * @returns {number} - get border height.
 * @hidden
 */
export declare function getBorderHeight(rowIdx: number, colIdx: number, sheet: SheetModel): number;
/**
 * Calculating column width by excluding cell padding and border width
 *
 * @param {SheetModel} sheet - Specify the sheet
 * @param {number} rowIdx - Specify the row index.
 * @param {number} startColIdx - Specify the start column index.
 * @param {number} endColIdx - Specify the end column index.
 * @returns {number} - get excluded column width.
 * @hidden
 */
export declare function getExcludedColumnWidth(sheet: SheetModel, rowIdx: number, startColIdx: number, endColIdx?: number): number;
/**
 * @param {Workbook} context - Specify the Workbook.
 * @param {number} rowIdx - Specify the row index.
 * @param {number} colIdx - Specify the column index.
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {CellStyleModel} style - Specify the style.
 * @param {number} lines - Specify the lines.
 * @returns {number} - get text height with border.
 * @hidden
 */
export declare function getTextHeightWithBorder(context: Workbook, rowIdx: number, colIdx: number, sheet: SheetModel, style: CellStyleModel, lines?: number): number;
/**
 * Setting maximum height while doing formats and wraptext
 *
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet
 * @param {number} rIdx - specify the row Index
 * @param {number} cIdx - specify the column Index.
 * @param {number} hgt - specify the hgt
 * @returns {void} - Setting maximum height while doing formats and wraptext
 */
export declare function setMaxHgt(sheet: SheetModel, rIdx: number, cIdx: number, hgt: number): void;
/**
 * Getting maximum height by comparing each cell's modified height.
 *
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {number} rIdx - Specify the row index.
 * @returns {number} - Getting maximum height by comparing each cell's modified height.
 */
export declare function getMaxHgt(sheet: SheetModel, rIdx: number): number;
/**
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet
 * @param {number} index - specify the index
 * @param {boolean} increase - specify the boolean value.
 * @param {string} layout - specify the string
 * @returns {number} - To skip the hidden index
 *
 */
export declare function skipHiddenIdx(sheet: SheetModel, index: number, increase: boolean, layout?: string): number;
/**
 * @hidden
 * @param {HTMLElement} ele - Specify the element.
 * @returns {void} - Specify the focus.
 */
export declare function focus(ele: HTMLElement): void;
