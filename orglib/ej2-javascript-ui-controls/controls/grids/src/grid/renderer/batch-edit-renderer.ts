import { IGrid } from '../base/interface';
import { classList } from '@syncfusion/ej2-base';
import { Column } from '../models/column';
import * as literals from '../base/string-literals';

/**
 * Edit render module is used to render grid edit row.
 * @hidden
 */
export class BatchEditRender {
    //Internal variables              

    //Module declarations
    private parent: IGrid;

    /**
     * Constructor for render module
     */
    constructor(parent?: IGrid) {
        this.parent = parent;
    }

    public update(elements: Element[], args: { columnObject?: Column, cell?: Element, row?: Element }): void {
        if (this.parent.isReact && args.columnObject && args.columnObject.template) {
            let parentRow: HTMLTableRowElement = args.cell.parentElement as HTMLTableRowElement;
            let newTd: HTMLTableCellElement = args.cell.cloneNode(true) as HTMLTableCellElement;
            parentRow.insertBefore(newTd, parentRow.children[parseInt(args.cell.getAttribute(literals.ariaColIndex), 10)]);
            newTd.focus();
            args.cell.remove();
            args.cell = newTd;
        }
        args.cell.innerHTML = '';
        args.cell.appendChild(this.getEditElement(elements, args));
        args.cell.classList.remove('e-ellipsistooltip');
        args.cell.classList.add('e-editedbatchcell');
        classList(args.row, [literals.editedRow, 'e-batchrow'], []);
    }

    private getEditElement(elements: Object, args: { columnObject?: Column, cell?: Element, row?: Element }): Element {
        let gObj: IGrid = this.parent;
        let form: HTMLFormElement = this.parent
        .createElement('form', { id: gObj.element.id + 'EditForm', className: 'e-gridform' }) as HTMLFormElement;
        form.appendChild(elements[args.columnObject.uid]);
        if (args.columnObject.editType === 'booleanedit') {
            args.cell.classList.add('e-boolcell');
        }
        if (!args.columnObject.editType) {
            args.cell.classList.add('e-inputbox');
        }
        return form;
    }

    public removeEventListener(): void {
        //To destroy the renderer
    }
}

