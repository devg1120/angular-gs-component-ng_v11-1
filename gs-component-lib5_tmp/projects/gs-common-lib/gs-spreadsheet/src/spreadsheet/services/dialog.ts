import { Spreadsheet } from '../base/index';
import { Dialog as DialogComponent, DialogModel } from '@syncfusion/ej2-popups';
import { extend, remove, L10n, isNullOrUndefined } from '@syncfusion/ej2-base';
import { locale } from '../common/index';

/**
 * Dialog Service.
 *
 * @hidden
 */
export class Dialog {
    private parent: Spreadsheet;
    public dialogInstance: DialogComponent;

    /**
     * Constructor for initializing dialog service.
     *
     * @param {Spreadsheet} parent - Specifies the Spreadsheet instance.
     */
    constructor(parent: Spreadsheet) {
        this.parent = parent;
    }

    /**
     * To show dialog.
     *
     * @param {DialogModel} dialogModel - Specifies the Dialog model.
     * @param {boolean} cancelBtn - Specifies the cancel button.
     * @returns {void}
     */
    public show(dialogModel: DialogModel, cancelBtn?: boolean): void {
        let btnContent: string;
        cancelBtn = isNullOrUndefined(cancelBtn) ? true : false;
        const closeHandler: Function = dialogModel.close || null;
        const model: DialogModel = {
            header: 'Spreadsheet',
            cssClass: this.parent.cssClass,
            target: this.parent.element,
            buttons: []
        };
        dialogModel.close = () => {
            this.dialogInstance.destroy();
            remove(this.dialogInstance.element);
            this.dialogInstance = null;
            if (closeHandler) {
                closeHandler();
            }
        };
        extend(model, dialogModel);
        if (cancelBtn) {
            btnContent = (this.parent.serviceLocator.getService(locale) as L10n).getConstant(model.buttons.length ? 'Cancel' : 'Ok');
            model.buttons.push({
                buttonModel: { content: btnContent, isPrimary: model.buttons.length === 0 },
                click: this.hide.bind(this)
            });
        }
        const div: HTMLElement = this.parent.createElement('div');
        document.body.appendChild(div);
        this.dialogInstance = new DialogComponent(model);
        this.dialogInstance.createElement = this.parent.createElement;
        this.dialogInstance.appendTo(div);
        this.dialogInstance.refreshPosition();
    }

    /**
     * To hide dialog.
     *
     * @returns {void}
     */
    public hide(): void {
        if (this.dialogInstance) {
            this.dialogInstance.hide();
        }
    }

    /**
     * To clear private variables.
     *
     * @returns {void}
     */
    public destroy(): void {
        this.parent = null;
    }
}
