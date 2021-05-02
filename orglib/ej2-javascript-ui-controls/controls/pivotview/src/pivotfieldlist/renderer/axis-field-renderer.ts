import { PivotFieldList } from '../base/field-list';
import * as cls from '../../common/base/css-constant';
import * as events from '../../common/base/constant';
import { PivotButtonArgs } from '../../common/base/interface';
import { PivotButton } from '../../common/actions/pivot-button';
import { IFieldOptions } from '../../base/engine';
import { isNullOrUndefined } from '@syncfusion/ej2-base';

/**
 * Module to render Axis Fields
 */
/** @hidden */
export class AxisFieldRenderer {
    public parent: PivotFieldList;

    /* eslint-disable-next-line */
    /** Constructor for render module */
    constructor(parent: PivotFieldList) {   /* eslint-disable-line */
        this.parent = parent;
    }
    /**
     * Initialize the pivot button rendering
     * @returns {void}
     * @private
     */
    public render(): void {
        /* eslint-disable */
        let pivotButtonModule: PivotButton =
            ((!this.parent.pivotButtonModule || (this.parent.pivotButtonModule && this.parent.pivotButtonModule.isDestroyed)) ?
                new PivotButton(this.parent) : this.parent.pivotButtonModule);
        /* eslint-enable */
        this.createPivotButtons();
    }
    private createPivotButtons(): void {
        if (isNullOrUndefined(this.parent.dataSourceSettings.dataSource) && isNullOrUndefined(this.parent.dataSourceSettings.url)) {
            this.parent.setProperties({ dataSourceSettings: { columns: [], rows: [], values: [], filters: [] } }, true);
        }
        let rows: IFieldOptions[] = this.parent.dataSourceSettings.rows;
        let columns: IFieldOptions[] = this.parent.dataSourceSettings.columns;
        let values: IFieldOptions[] = this.parent.dataSourceSettings.values;
        let filters: IFieldOptions[] = this.parent.dataSourceSettings.filters;
        let fields: IFieldOptions[][] = [rows, columns, values, filters];
        let parentElement: HTMLElement = this.parent.dialogRenderer.parentElement;
        if (parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-filters')) {
            parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-filters').querySelector('.' + cls.AXIS_CONTENT_CLASS).innerHTML = '';
        }
        if (parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-rows')) {
            parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-rows').querySelector('.' + cls.AXIS_CONTENT_CLASS).innerHTML = '';
        }
        if (parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-columns')) {
            parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-columns').querySelector('.' + cls.AXIS_CONTENT_CLASS).innerHTML = '';
        }
        if (parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-values')) {
            parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-values').querySelector('.' + cls.AXIS_CONTENT_CLASS).innerHTML = '';
        }
        let axis: string[] = ['rows', 'columns', 'values', 'filters'];
        for (let len: number = 0, lnt: number = fields.length; len < lnt; len++) {
            if (fields[len]) {
                let args: PivotButtonArgs = {
                    field: fields[len],
                    axis: axis[len].toString()
                };
                this.parent.notify(events.pivotButtonUpdate, args);
            }
        }
    }
}
