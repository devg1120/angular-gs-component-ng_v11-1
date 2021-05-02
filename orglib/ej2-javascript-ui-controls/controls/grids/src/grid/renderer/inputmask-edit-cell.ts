import { extend } from '@syncfusion/ej2-base';
import { IGrid, EJ2Intance, IEditCell } from '../base/interface';
import { Column } from '../models/column';
import { MaskedTextBox  } from '@syncfusion/ej2-inputs';
import { isEditable, createEditElement, getObject } from '../base/util';
import { EditCellBase } from './edit-cell-base';

/**
 * `MaskedTextBoxCellEdit` is used to handle masked input cell type editing.
 * @hidden
 */
export class MaskedTextBoxCellEdit extends EditCellBase implements IEditCell {

    private column: Column;

    public write(args: { rowData: Object, element: Element, column: Column, row: HTMLElement, requestType: string }): void {
        this.column = args.column;
        let isInlineEdit: boolean = this.parent.editSettings.mode !== 'Dialog';
        this.obj = new MaskedTextBox(extend(
            {
            fields: { value: args.column.field },
            value: getObject(args.column.field, args.rowData),
            floatLabelType: isInlineEdit ? 'Never' : 'Always',
            mask: '000-000-0000',
            enabled: isEditable(args.column, args.requestType, args.element),
            },
            args.column.edit.params));
        this.obj.appendTo(args.element as HTMLElement);
    }
}