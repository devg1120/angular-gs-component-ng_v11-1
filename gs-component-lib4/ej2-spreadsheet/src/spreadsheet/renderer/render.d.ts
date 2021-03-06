import { Spreadsheet } from '../base/index';
import { RefreshArgs } from '../common/index';
/**
 * Render module is used to render the spreadsheet
 *
 * @hidden
 */
export declare class Render {
    private parent;
    constructor(parent: Spreadsheet);
    render(isRefreshing: boolean): void;
    private checkTopLeftCell;
    private renderSheet;
    /**
     * @hidden
     * @param {RefreshArgs} args - Specifies the RefreshArgs.
     * @param {string} address - Specifies the address.
     * @param {boolean} initLoad - Specifies the initLoad.
     * @returns {void}
     */
    refreshUI(args: RefreshArgs, address?: string, initLoad?: boolean, isRefreshing?: boolean): void;
    private removeSheet;
    /**
     * Refresh the active sheet.
     *
     * @returns {void}
     */
    refreshSheet(isOpen?: boolean): void;
    /**
     * Used to set sheet panel size.
     *
     * @returns {void}
     */
    setSheetPanelSize(): void;
    private roundValue;
    /**
     * Registing the renderer related services.
     *
     * @returns {void}
     */
    private instantiateRenderer;
    /**
     * Destroy the Render module.
     *
     * @returns {void}
     */
    destroy(): void;
    private addEventListener;
    private removeEventListener;
}
