import { Spreadsheet } from '../index';
/**
 * `Hyperlink` module
 */
export declare class SpreadsheetHyperlink {
    private parent;
    /**
     * Constructor for Hyperlink module.
     *
     * @param {Spreadsheet} parent - Constructor for Hyperlink module.
     */
    constructor(parent: Spreadsheet);
    /**
     * To destroy the Hyperlink module.
     *
     * @returns {void} - To destroy the Hyperlink module.
     */
    protected destroy(): void;
    private addEventListener;
    private removeEventListener;
    /**
     * Gets the module name.
     *
     * @returns {string} - Gets the module name.
     */
    protected getModuleName(): string;
    private keyUpHandler;
    private initiateHyperlinkHandler;
    private dlgClickHandler;
    private showDialog;
    private editHyperlinkHandler;
    private openHyperlinkHandler;
    private hlOpenHandler;
    private isValidUrl;
    private showInvalidHyperlinkDialog;
    private hyperlinkClickHandler;
    private createHyperlinkElementHandler;
    private hyperEditContent;
    private hyperlinkContent;
}
