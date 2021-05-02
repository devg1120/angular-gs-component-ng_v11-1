import { VirtualRowModelGenerator } from '@syncfusion/ej2-grids';
import { NotifyArgs, Row, Column, IGrid, Grid, VirtualContentRenderer } from '@syncfusion/ej2-grids';
import { ITreeData } from '../base';
import * as events from '../base/constant';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { isCountRequired } from '../utils';
/**
 * RowModelGenerator is used to generate grid data rows.
 *
 * @hidden
 */

export class TreeVirtualRowModelGenerator extends VirtualRowModelGenerator {
    private visualData: ITreeData[];
    constructor(parent: IGrid) {
        super(parent);
        this.addEventListener();
    }
    public addEventListener() : void {
        this.parent.on(events.dataListener, this.getDatas, this);
    }
    private getDatas(args: {data: ITreeData[]}): void {
        this.visualData = args.data;
    }
    public generateRows(data: Object[], notifyArgs?: NotifyArgs): Row<Column>[] {
        if ((this.parent.dataSource instanceof DataManager && (this.parent.dataSource as DataManager).dataSource.url !== undefined
        && !(this.parent.dataSource as DataManager).dataSource.offline && (this.parent.dataSource as DataManager).dataSource.url !== '') || isCountRequired(this.parent)) {
            return super.generateRows(data, notifyArgs);
        } else {
            if (!isNullOrUndefined(notifyArgs.requestType) && notifyArgs.requestType.toString() === 'collapseAll') {
                notifyArgs.requestType = 'refresh';
            }
            const rows: Row<Column>[] = super.generateRows(data, notifyArgs);
            for (let r: number = 0; r < rows.length; r++) {
                rows[r].index = (<ITreeData[]>(this.visualData)).indexOf(rows[r].data);
            }
            return rows;
        }
    }
    public checkAndResetCache(action: string): boolean {
        const clear: boolean = ['paging', 'refresh', 'sorting', 'filtering', 'searching', 'reorder',
            'save', 'delete'].some((value: string) => action === value);
        if ((this.parent.dataSource instanceof DataManager && (this.parent.dataSource as DataManager).dataSource.url !== undefined
        && !(this.parent.dataSource as DataManager).dataSource.offline && (this.parent.dataSource as DataManager).dataSource.url !== '') || isCountRequired(this.parent)) {
            const model: string = 'model';
            const currentPage: number = this[model].currentPage;
            if (clear) {
                this.cache = {};
                this.data = {};
                this.groups = {};
            } else if (action === 'virtualscroll' && this.cache[currentPage] &&
                    this.cache[currentPage].length > (((this.parent as Grid).contentModule) as VirtualContentRenderer).getBlockSize()) {
                delete this.cache[currentPage];
            }
        } else {
            if (clear || action === 'virtualscroll') {
                this.cache = {}; this.data = {}; this.groups = {};
            }
        }
        return clear;
    }
}
