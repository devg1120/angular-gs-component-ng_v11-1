import { Spreadsheet } from '../base';
/**
 * Specifes to create or modify overlay.
 *
 * @hidden
 */
export declare class Overlay {
    private parent;
    private minHeight;
    private minWidth;
    private isOverlayClicked;
    private isResizerClicked;
    private originalMouseX;
    private originalMouseY;
    private originalWidth;
    private originalHeight;
    private currentWidth;
    private currenHeight;
    private originalResizeLeft;
    private originalResizeTop;
    private originalReorderLeft;
    private originalReorderTop;
    private resizedReorderLeft;
    private resizedReorderTop;
    private resizer;
    private diffX;
    private diffY;
    private prevX;
    private prevY;
    /**
     * Constructor for initializing Overlay service.
     *
     *  @param {Spreadsheet} parent - Specifies the Spreadsheet instance.
     */
    constructor(parent: Spreadsheet);
    /**
     * To insert a shape.
     *
     * @param {string} id - Specifies the id.
     * @param {string} range - Specifies the range.
     * @param {number} sheetIndex - Specifies the sheet index.
     * @returns {HTMLElement} - Returns div element
     * @hidden
     */
    insertOverlayElement(id: string, range: string, sheetIndex: number): HTMLElement;
    private addEventListener;
    private setOriginalSize;
    private overlayMouseMoveHandler;
    private overlayMouseUpHandler;
    private overlayClickHandler;
    private renderResizeHandles;
    private removeEventListener;
    /**
     * To clear private variables.
     *
     * @returns {void}
     */
    destroy(): void;
}
