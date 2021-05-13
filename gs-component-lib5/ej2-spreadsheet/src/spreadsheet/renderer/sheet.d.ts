import { Spreadsheet } from '../base/index';
import { SheetRenderArgs } from '../common/index';
import { IRenderer } from '../common/index';
import { SheetModel } from '../../workbook/index';
/**
 * Sheet module is used to render Sheet
 *
 * @hidden
 */
export declare class SheetRender implements IRenderer {
    private parent;
    private headerPanel;
    contentPanel: HTMLElement;
    private col;
    private rowRenderer;
    private cellRenderer;
    colGroupWidth: number;
    constructor(parent?: Spreadsheet);
    private refreshSelectALLContent;
    private updateLeftColGroup;
    setPanelWidth(sheet: SheetModel, rowHdr: HTMLElement): void;
    private getScrollSize;
    private setHeaderPanelWidth;
    private setPanelHeight;
    renderPanel(): void;
    private initHeaderPanel;
    private createHeaderTable;
    private updateTable;
    /**
     * It is used to refresh the select all, row header, column header and content of the spreadsheet.
     *
     * @param {SheetRenderArgs} args - Specifies the cells, indexes, direction, skipUpdateOnFirst, top, left, initload properties.
     * @returns {void}
     */
    renderTable(args: SheetRenderArgs): void;
    private triggerCreatedEvent;
    private checkTableWidth;
    refreshColumnContent(args: SheetRenderArgs): void;
    refreshRowContent(args: SheetRenderArgs): void;
    updateCol(sheet: SheetModel, idx: number, appendTo?: Element): Element;
    updateColContent(args: SheetRenderArgs): void;
    updateRowContent(args: SheetRenderArgs): void;
    private checkRowMerge;
    private refreshPrevMerge;
    private checkColMerge;
    /**
     * Used to toggle row and column headers.
     *
     * @returns {void}
     */
    showHideHeaders(): void;
    private updateHideHeaders;
    private rowHeightChange;
    private colWidthChange;
    getRowHeaderWidth(sheet: SheetModel, skipFreezeCheck?: boolean): number;
    getColHeaderHeight(sheet: SheetModel, skipHeader?: boolean): number;
    /**
     * Get the select all table element of spreadsheet
     *
     * @returns {HTMLElement} - Select all content element.
     */
    getSelectAllContent(): HTMLElement;
    /**
     * Get the horizontal scroll element of spreadsheet
     *
     * @returns {HTMLElement} - Select all content element.
     */
    getScrollElement(): HTMLElement;
    /**
     * Get the select all table element of spreadsheet
     *
     * @returns {HTMLTableElement} - Select all table element.
     */
    getSelectAllTable(): HTMLTableElement;
    /**
     * Get the column header element of spreadsheet
     *
     * @returns {HTMLTableElement} - Column header table element.
     */
    getColHeaderTable(): HTMLTableElement;
    /**
     * Get the row header table element of spreadsheet
     *
     * @returns {HTMLTableElement} - Row header table element.
     */
    getRowHeaderTable(): HTMLTableElement;
    /**
     * Get the main content table element of spreadsheet
     *
     * @returns {Element} - Content table element.
     */
    getContentTable(): HTMLTableElement;
    /**
     * Get the row header div element of spreadsheet
     *
     * @returns {HTMLElement} - Row header panel element.
     */
    getRowHeaderPanel(): HTMLElement;
    /**
     * Get the column header div element of spreadsheet
     *
     * @returns {HTMLElement} - Column header panel element.
     */
    getColHeaderPanel(): HTMLElement;
    /**
     * Get the main content div element of spreadsheet
     *
     * @returns {HTMLElement} - Content panel element.
     */
    getContentPanel(): HTMLElement;
    private addEventListener;
    private destroy;
    private removeEventListener;
}
