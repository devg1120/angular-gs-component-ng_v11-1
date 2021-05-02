/* eslint-disable valid-jsdoc */
import { createElement, Browser } from '@syncfusion/ej2-base';
import { LinearGauge} from '../../index';
import { triggerDownload } from '../utils/helper';
import { ExportType } from '../utils/enum';

/**
 * Represent the print and export for gauge.
 *
 * @hidden
 */
export class ImageExport {
    private control: LinearGauge;

    /**
     * Constructor for gauge
     *
     * @param control
     */
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    constructor(control: LinearGauge) {
        this.control = control;
    }

    /**
     * To export the file as image/svg format
     *
     * @param type
     * @param fileName
     * @private
     */
    public export(type: ExportType, fileName: string, allowDownload?: boolean): Promise<string> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const promise: Promise<string> = new Promise((resolve: any, reject: any) => {
            const element: HTMLCanvasElement = <HTMLCanvasElement>createElement('canvas', {
                id: 'ej2-canvas',
                attrs: {
                    'width': this.control.availableSize.width.toString(),
                    'height': this.control.availableSize.height.toString()
                }
            });
            const isDownload: boolean = !(Browser.userAgent.toString().indexOf('HeadlessChrome') > -1);
            const svgData: string = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            this.control.svgObject.outerHTML +
            '</svg>';
            const url: string = window.URL.createObjectURL(
                new Blob(
                    type === 'SVG' ? [svgData] :
                        [(new XMLSerializer()).serializeToString(this.control.svgObject)],
                    { type: 'image/svg+xml' }
                )
            );
            if (type === 'SVG') {
                if (allowDownload) {
                    triggerDownload(
                        fileName, type,
                        url, isDownload
                    );
                } else {
                    resolve(null);
                }
            } else {
                const image: HTMLImageElement = new Image();
                const context: CanvasRenderingContext2D = element.getContext('2d');
                image.onload = (() => {
                    context.drawImage(image, 0, 0);
                    window.URL.revokeObjectURL(url);
                    if (allowDownload) {
                        triggerDownload(
                            fileName, type,
                            element.toDataURL('image/png').replace('image/png', 'image/octet-stream'),
                            isDownload
                        );
                    } else {
                        if (type === 'JPEG') {
                            resolve(element.toDataURL('image/jpeg'));
                        } else if (type === 'PNG') {
                            resolve(element.toDataURL('image/png'));
                        }
                    }
                });
                image.src = url;
            }
        });
        return promise;
    }

    /**
     * Get module name.
     */
    protected getModuleName(): string {
        return 'ImageExport';
    }

    /**
     * To destroy the ImageExport.
     *
     * @return {void}
     * @private
     */
    public destroy(control: LinearGauge): void {
        /**
         * Destroy method performed here
         */
    }
}
