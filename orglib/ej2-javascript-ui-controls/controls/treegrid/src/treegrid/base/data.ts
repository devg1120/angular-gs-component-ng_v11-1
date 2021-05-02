import { extend, isNullOrUndefined, setValue, getValue, Ajax, addClass, removeClass } from '@syncfusion/ej2-base';
import { DataManager, Query, Group, DataUtil, QueryOptions, ReturnOption, ParamOption } from '@syncfusion/ej2-data';
import { ITreeData, RowExpandedEventArgs } from './interface';
import { TreeGrid } from './treegrid';
import { showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
import { getObject, BeforeDataBoundArgs, VirtualContentRenderer, getUid, Row, Column } from '@syncfusion/ej2-grids';
import { ColumnModel as GridColumnModel, NotifyArgs, SaveEventArgs, Action, VirtualInfo } from '@syncfusion/ej2-grids';
import { isRemoteData, isOffline, isCountRequired, getExpandStatus } from '../utils';
import * as events from './constant';

/**
 * Internal dataoperations for tree grid
 *
 * @hidden
 */
export class DataManipulation {
    //Internal variables
    private taskIds: Object[];
    private parentItems: Object[];
    private zerothLevelData: BeforeDataBoundArgs;
    private storedIndex: number;
    private batchChanges: Object;
    private addedRecords: string = 'addedRecords';
    private parent: TreeGrid;
    private dataResults: ReturnOption;
    private sortedData: Object[];
    private hierarchyData: Object[];
    private isSelfReference: boolean;
    private isSortAction: boolean;
    constructor(grid: TreeGrid) {
        this.parent = grid;
        this.parentItems = [];
        this.taskIds = [];
        this.hierarchyData = [];
        this.storedIndex = -1;
        this.sortedData = [];
        this.isSortAction = false;
        this.addEventListener();
        this.dataResults =  <ReturnOption>{};
        this.isSelfReference = !isNullOrUndefined(this.parent.parentIdMapping);
    }

    /**
     * @hidden
     * @returns {void}
     */
    public addEventListener(): void {
        this.parent.on('updateRemoteLevel', this.updateParentRemoteData, this);
        this.parent.grid.on('sorting-begin', this.beginSorting, this);
        this.parent.on('updateAction', this.updateData, this);
        this.parent.on(events.remoteExpand, this.collectExpandingRecs, this);
        this.parent.on('dataProcessor', this.dataProcessor, this);
    }

    /**
     * @hidden
     * @returns {void}
     */
    public removeEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        this.parent.off(events.remoteExpand, this.collectExpandingRecs);
        this.parent.off('updateRemoteLevel', this.updateParentRemoteData);
        this.parent.off('updateAction', this.updateData);
        this.parent.off('dataProcessor', this.dataProcessor);
        this.parent.grid.off('sorting-begin', this.beginSorting);
    }

    /**
     * To destroy the dataModule
     *
     * @returns {void}
     * @hidden
     */
    public destroy(): void {
        this.removeEventListener();
    }

    /**
     * @hidden
     * @returns {boolean} -Returns whether remote data binding
     */
    public isRemote(): boolean {
        if (!(this.parent.dataSource instanceof DataManager)) {
            return false;
        }
        return true;
        // let gridData:  DataManager = <DataManager>this.parent.dataSource;
        // return gridData.dataSource.offline !== true && gridData.dataSource.url !== undefined;
    }

    /**
     * Function to manipulate datasource
     *
     * @param {Object} data - Provide tree grid datasource to convert to flat data
     * @hidden
     * @returns {void}
     */
    public convertToFlatData(data: Object): void {
        this.parent.flatData = <Object[]>(Object.keys(data).length === 0 && !(this.parent.dataSource instanceof DataManager) ?
            this.parent.dataSource : []);
        this.parent.parentData = [];
        if ((isRemoteData(this.parent) && !isOffline(this.parent)) && data instanceof DataManager && !(data instanceof Array)) {
            const dm: DataManager = <DataManager>this.parent.dataSource;
            if (this.parent.parentIdMapping) {
                this.parent.query = isNullOrUndefined(this.parent.query) ?
                    new Query() : this.parent.query;
                if (this.parent.parentIdMapping) {
                    const filterKey: Object[] = this.parent.query.params.filter((param: ParamOption) => param.key === 'IdMapping');
                    if (this.parent.initialRender && !filterKey.length) {
                        this.parent.query.where(this.parent.parentIdMapping, 'equal', null);
                        this.parent.query.addParams('IdMapping', this.parent.idMapping);
                    }
                }
                if (!this.parent.hasChildMapping) {
                    let qry: Query = this.parent.query.clone();
                    qry.queries = [];
                    qry = qry.select([this.parent.parentIdMapping]);
                    qry.isCountRequired = true;
                    dm.executeQuery(qry).then((e: ReturnOption) => {
                        this.parentItems = DataUtil.distinct(<Object[]>e.result, this.parent.parentIdMapping, false);
                        const req: number = getObject('dataSource.requests', this.parent).filter((e: Ajax) => {
                            return e.httpRequest.statusText !== 'OK'; }
                        ).length;
                        if (req === 0) {
                            setValue('grid.contentModule.isLoaded', true, this.parent);
                            if (!isNullOrUndefined(this.zerothLevelData)) {
                                setValue('cancel', false, this.zerothLevelData);
                                getValue('grid.renderModule', this.parent).dataManagerSuccess(this.zerothLevelData);
                                this.zerothLevelData = null;
                            }
                            this.parent.grid.hideSpinner();
                        }
                    });
                }
            }
        } else if (data instanceof Array) {
            this.convertJSONData(data);
        }
    }

    private convertJSONData(data: Object): void {
        this.hierarchyData = [];
        this.taskIds = [];
        if (!this.parent.idMapping) {
            this.hierarchyData = <Object[]> data;
        } else {
            for (let i: number = 0; i < Object.keys(data).length; i++) {
                const tempData: Object = data[i];
                this.hierarchyData.push(extend({}, tempData));
                if (!isNullOrUndefined(tempData[this.parent.idMapping])) {
                    this.taskIds.push(tempData[this.parent.idMapping]);
                }
            }
        }
        if (this.isSelfReference) {
            const selfData: ITreeData[] = [];
            const mappingData: Object[] = new DataManager(this.hierarchyData).executeLocal(
                new Query()
                    .group(this.parent.parentIdMapping)
            );
            for (let i: number = 0; i < mappingData.length; i++) {
                const groupData: Group = mappingData[i];
                const index: number = this.taskIds.indexOf(groupData.key);
                if (!isNullOrUndefined(groupData.key)) {
                    if (index > -1) {
                        const childData: Object[] = (groupData.items);
                        this.hierarchyData[index][this.parent.childMapping] = childData;
                        continue;
                    }
                }
                selfData.push(...groupData.items);
            }
            this.hierarchyData = this.selfReferenceUpdate(selfData);
        }
        if (!Object.keys(this.hierarchyData).length) {
            const isGantt: string = 'isGantt';
            const referenceData: boolean = !(this.parent.dataSource instanceof DataManager) && this.parent[isGantt];
            this.parent.flatData = referenceData ? <Object[]>(this.parent.dataSource) : [];
        } else {
            this.createRecords(this.hierarchyData);
        }
        this.storedIndex = -1;
    }
    // private crudActions(): void {
    //   if (this.parent.dataSource instanceof DataManager && (this.parent.dataSource.adaptor instanceof RemoteSaveAdaptor)) {
    //     let oldUpdate: Function = this.parent.dataSource.adaptor.update;
    //     this.parent.dataSource.adaptor.update =
    //         function (dm: DataManager, keyField: string, value: Object, tableName?: string, query?: Query, original?: Object): Object {
    //                value = getPlainData(value);
    //                return oldUpdate.apply(this, [dm, keyField, value, tableName, query, original]);
    //              }
    //   }
    // }
    private selfReferenceUpdate(selfData: ITreeData[]): ITreeData[] {
        const result: ITreeData[] = [];
        while (this.hierarchyData.length > 0 && selfData.length > 0) {
            const index: number = selfData.indexOf(this.hierarchyData[0]);
            if ( index === -1) {
                this.hierarchyData.shift();
            } else {
                result.push(this.hierarchyData.shift());
                selfData.splice(index, 1);
            }
        }
        return result;
    }
    /**
     * Function to update the zeroth level parent records in remote binding
     *
     * @param {BeforeDataBoundArgs} args - contains data before its bounds to tree grid
     * @hidden
     * @returns {void}
     */
    private updateParentRemoteData(args?: BeforeDataBoundArgs) : void {
        const records: ITreeData[] = args.result;
        if (!this.parent.hasChildMapping && !this.parentItems.length && !this.parent.loadChildOnDemand) {
            this.zerothLevelData = args;
            setValue('cancel', true, args);
        } else {
            if (!this.parent.loadChildOnDemand) {
                for (let rec: number = 0; rec < records.length; rec++) {
                    if (isCountRequired(this.parent) && records[rec].hasChildRecords && this.parent.initialRender) {
                        records[rec].expanded = false;
                    }
                    if (isNullOrUndefined(records[rec].index)) {
                        records[rec].taskData = extend({}, records[rec]);
                        records[rec].uniqueID = getUid(this.parent.element.id + '_data_');
                        setValue('uniqueIDCollection.' + records[rec].uniqueID, records[rec], this.parent);
                        records[rec].level = 0;
                        records[rec].index = Math.ceil(Math.random() * 1000);
                        if ((records[rec][this.parent.hasChildMapping] ||
                          this.parentItems.indexOf(records[rec][this.parent.idMapping]) !== -1)) {
                            records[rec].hasChildRecords = true;
                        }
                        records[rec].checkboxState = 'uncheck';
                    }
                }
            } else {
                if (!isNullOrUndefined(records)) {
                    this.convertToFlatData(records);
                }
            }
        }
        args.result = this.parent.loadChildOnDemand ? this.parent.flatData : records;
        this.parent.notify('updateResults', args);
    }
    /**
     * Function to manipulate datasource
     *
     * @param {{record: ITreeData, rows: HTMLTableRowElement[], parentRow: HTMLTableRowElement}} rowDetails - Row details for which child rows has to be fetched
     * @param {ITreeData} rowDetails.record - current expanding record
     * @param {HTMLTableRowElement[]} rowDetails.rows - Expanding Row element
     * @param {HTMLTableRowElement} rowDetails.parentRow  - Curent expanding row element
     * @param {boolean} isChild - Specified whether current record is already a child record
     * @hidden
     * @returns {void}
     */
    private collectExpandingRecs(rowDetails: {record: ITreeData, rows: HTMLTableRowElement[], parentRow: HTMLTableRowElement},
                                 isChild?: boolean): void {
        let gridRows: HTMLTableRowElement[] = this.parent.getRows();
        if (this.parent.rowTemplate) {
            const rows: HTMLCollection = (this.parent.getContentTable() as HTMLTableElement).rows;
            gridRows = [].slice.call(rows);
        }
        let childRecord: ITreeData;
        if (rowDetails.rows.length > 0) {
            if (!isChild) {
                rowDetails.record.expanded = true;
            }
            for (let i: number = 0; i < rowDetails.rows.length; i++) {
                rowDetails.rows[i].style.display = 'table-row';
                if (this.parent.loadChildOnDemand) {
                    const targetEle: Element = rowDetails.rows[i].getElementsByClassName('e-treegridcollapse')[0];
                    childRecord = this.parent.rowTemplate ? this.parent.grid.getCurrentViewRecords()[rowDetails.rows[i].rowIndex] :
                        this.parent.grid.getRowObjectFromUID(rowDetails.rows[i].getAttribute('data-Uid')).data;
                    if (!isNullOrUndefined(targetEle) && childRecord.expanded) {
                        addClass([targetEle], 'e-treegridexpand');
                        removeClass([targetEle], 'e-treegridcollapse');
                    }
                    let childRows: HTMLTableRowElement[] = [];
                    childRows = gridRows.filter(
                        (r: HTMLTableRowElement) =>
                            r.querySelector(
                                '.e-gridrowindex' + childRecord.index + 'level' + (childRecord.level + 1)
                            )
                    );
                    if (childRows.length && childRecord.expanded) {
                        this.collectExpandingRecs({ record: childRecord, rows: childRows, parentRow: rowDetails.parentRow }, true);
                    }
                }
                const expandingTd: Element = rowDetails.rows[i].querySelector('.e-detailrowcollapse');
                if (!isNullOrUndefined(expandingTd)) {
                    this.parent.grid.detailRowModule.expand(expandingTd);
                }
            }
        } else {
            this.fetchRemoteChildData({record: rowDetails.record, rows: rowDetails.rows, parentRow: rowDetails.parentRow});
        }
    }

    private fetchRemoteChildData(rowDetails: { record: ITreeData, rows: HTMLTableRowElement[], parentRow: HTMLTableRowElement }): void {
        const args: RowExpandedEventArgs = {row: rowDetails.parentRow, data: rowDetails.record};
        const dm: DataManager = <DataManager>this.parent.dataSource;
        const qry: Query = this.parent.grid.getDataModule().generateQuery();
        const clonequries: QueryOptions[] = qry.queries.filter((e: QueryOptions) => e.fn !== 'onPage' && e.fn !== 'onWhere');
        qry.queries = clonequries;
        qry.isCountRequired = true;
        qry.where(this.parent.parentIdMapping, 'equal', rowDetails.record[this.parent.idMapping]);
        showSpinner(this.parent.element);
        dm.executeQuery(qry).then((e: ReturnOption) => {
            const datas: ITreeData[] = this.parent.grid.currentViewData.slice();
            let inx: number = datas.indexOf(rowDetails.record);
            if (inx === -1) {
                this.parent.grid.getRowsObject().forEach((rows: Row<Column>) => {
                    if ((rows.data as ITreeData).uniqueID === rowDetails.record.uniqueID) {
                        inx = rows.index;
                    }
                });
            }
            const haveChild: boolean[] = getObject('actual.nextLevel', e);
            const result: ITreeData[] = <ITreeData[]>e.result;
            rowDetails.record.childRecords = result;
            for (let r: number = 0; r < result.length; r++) {
                result[r].taskData = extend({}, result[r]);
                result[r].level = rowDetails.record.level + 1;
                result[r].index = Math.ceil(Math.random() * 1000);
                const parentData: ITreeData = extend({}, rowDetails.record);
                delete parentData.childRecords;
                result[r].parentItem = parentData;
                result[r].parentUniqueID = rowDetails.record.uniqueID;
                result[r].uniqueID = getUid(this.parent.element.id + '_data_');
                result[r].checkboxState = 'uncheck';
                setValue('uniqueIDCollection.' + result[r].uniqueID, result[r], this.parent);
                // delete result[r].parentItem.childRecords;
                if ((result[r][this.parent.hasChildMapping] || this.parentItems.indexOf(result[r][this.parent.idMapping]) !== -1)
             && !(haveChild && !haveChild[r])) {
                    result[r].hasChildRecords = true; result[r].expanded = false;
                }
                datas.splice(inx + r + 1, 0, result[r]);
            }
            setValue('result', datas, e); setValue('action', 'beforecontentrender', e);
            this.parent.trigger(events.actionComplete, e);
            hideSpinner(this.parent.element);
            if (this.parent.grid.aggregates.length > 0 && !this.parent.enableVirtualization) {
                let gridQuery: Query = getObject('query', e);
                const result: string = 'result';
                if (isNullOrUndefined(gridQuery)) {
                    gridQuery = getValue('grid.renderModule.data', this.parent).aggregateQuery(new Query());
                }
                if (!isNullOrUndefined(gridQuery)) {
                    const summaryQuery: QueryOptions[] = gridQuery.queries.filter((q: QueryOptions) => q.fn === 'onAggregates');
                    e[result] = this.parent.summaryModule.calculateSummaryValue(summaryQuery, e[result], true);
                }
            }
            e.count = this.parent.grid.pageSettings.totalRecordsCount;
            const virtualArgs: NotifyArgs = {};
            if (this.parent.enableVirtualization) {
                this.remoteVirtualAction(virtualArgs);
            }
            const notifyArgs: { index: number, childData: ITreeData[] } = { index: inx, childData : result };
            if (this.parent.enableInfiniteScrolling) {
                this.parent.notify('infinite-remote-expand', notifyArgs);
            } else {
                getValue('grid.renderModule', this.parent).dataManagerSuccess(e, virtualArgs);
            }
            this.parent.trigger(events.expanded, args);
        });
    }

    private remoteVirtualAction(virtualArgs: NotifyArgs): void {
        virtualArgs.requestType = 'refresh';
        setValue('isExpandCollapse', true, virtualArgs);
        const contentModule: VirtualContentRenderer = getValue('grid.contentModule', this.parent);
        const currentInfo: VirtualInfo = getValue('currentInfo', contentModule);
        const prevInfo: VirtualInfo = getValue('prevInfo', contentModule);
        if (currentInfo.loadNext && this.parent.grid.pageSettings.currentPage === currentInfo.nextInfo.page) {
            this.parent.grid.pageSettings.currentPage = prevInfo.page;
        }
    }

    private beginSorting(): void {
        this.isSortAction = true;
    }

    private createRecords(data: Object, parentRecords?: ITreeData): ITreeData[] {
        const treeGridData: ITreeData[] = [];
        for (let i: number = 0, len: number = Object.keys(data).length; i < len; i++) {
            const currentData: ITreeData = extend({}, data[i]);
            currentData.taskData = data[i];
            let level: number = 0;
            this.storedIndex++;
            if (!Object.prototype.hasOwnProperty.call(currentData, 'index')) {
                currentData.index = this.storedIndex;
            }
            if (!isNullOrUndefined(currentData[this.parent.childMapping]) ||
          (currentData[this.parent.hasChildMapping] && isCountRequired(this.parent))) {
                currentData.hasChildRecords = true;
                if (this.parent.enableCollapseAll || !isNullOrUndefined(this.parent.dataStateChange)
            && isNullOrUndefined(currentData[this.parent.childMapping])) {
                    currentData.expanded = false;
                } else {
                    currentData.expanded = !isNullOrUndefined(currentData[this.parent.expandStateMapping])
                        ? currentData[this.parent.expandStateMapping] : true;
                }
            }
            if (!Object.prototype.hasOwnProperty.call(currentData, 'index')) {
                currentData.index =  currentData.hasChildRecords ? this.storedIndex : this.storedIndex;
            }
            if (this.isSelfReference && isNullOrUndefined(currentData[this.parent.parentIdMapping])) {
                this.parent.parentData.push(currentData);
            }
            currentData.uniqueID = getUid(this.parent.element.id + '_data_');
            setValue('uniqueIDCollection.' + currentData.uniqueID, currentData, this.parent);
            if (!isNullOrUndefined(parentRecords)) {
                const parentData: ITreeData = extend({}, parentRecords);
                delete parentData.childRecords;
                delete parentData[this.parent.childMapping];
                if (this.isSelfReference) {
                    delete parentData.taskData[this.parent.childMapping];
                }
                currentData.parentItem = parentData;
                currentData.parentUniqueID = parentData.uniqueID;
                level = parentRecords.level + 1;
            }
            if (!Object.prototype.hasOwnProperty.call(currentData, 'level')) {
                currentData.level = level;
            }
            currentData.checkboxState = 'uncheck';
            if (isNullOrUndefined(currentData[this.parent.parentIdMapping]) || currentData.parentItem) {
                this.parent.flatData.push(currentData);
            }
            if (!this.isSelfReference && currentData.level === 0) {
                this.parent.parentData.push(currentData);
            }
            if (!isNullOrUndefined(currentData[this.parent.childMapping] && currentData[this.parent.childMapping].length )) {
                const record: ITreeData[] = this.createRecords(currentData[this.parent.childMapping], currentData);
                currentData.childRecords = record;
            }
            treeGridData.push(currentData);
        }
        return treeGridData;
    }

    /**
     * Function to perform filtering/sorting action for local data
     *
     * @param {BeforeDataBoundArgs} args - data details to be processed before binding to grid
     * @hidden
     * @returns {void}
     */
    public dataProcessor(args?: BeforeDataBoundArgs) : void {
        const isExport: boolean = getObject('isExport', args); const expresults: Object = getObject('expresults', args);
        const exportType: string = getObject('exportType', args); const isPrinting: boolean = getObject('isPrinting', args);
        let dataObj: Object; const actionArgs: NotifyArgs = getObject('actionArgs', args);
        let requestType: Action = getObject('requestType', args); let actionData: Object = getObject('data', args);
        let action: string = getObject('action', args); const actionAddArgs: SaveEventArgs = actionArgs;
        const primaryKeyColumnName: string = this.parent.getPrimaryKeyFieldNames()[0];
        const dataValue: ITreeData = getObject('data', actionAddArgs);
        if ((!isNullOrUndefined(actionAddArgs)) && (!isNullOrUndefined(actionAddArgs.action)) && (actionAddArgs.action === 'add')
      && (!isNullOrUndefined(actionAddArgs.data)) && isNullOrUndefined(actionAddArgs.data[primaryKeyColumnName])) {
            actionAddArgs.data[primaryKeyColumnName] = args.result[actionAddArgs.index][primaryKeyColumnName];
            dataValue.taskData[primaryKeyColumnName] = args.result[actionAddArgs.index][primaryKeyColumnName];
        }
        if ((!isNullOrUndefined(actionArgs) && Object.keys(actionArgs).length) || requestType === 'save') {
            requestType = requestType ? requestType : actionArgs.requestType;
            actionData = actionData ? actionData : getObject('data', actionArgs);
            action = action ? action : getObject('action', actionArgs);
            if (this.parent.editSettings.mode === 'Batch') {
                this.batchChanges = this.parent.grid.editModule.getBatchChanges();
            }
            if (this.parent.isLocalData) {
                this.updateAction(actionData, action, requestType);
            }
        }
        if (isExport && !isNullOrUndefined(expresults)) {
            dataObj = expresults;
        } else {
            dataObj = isCountRequired(this.parent) ? getValue('result', this.parent.grid.dataSource)
                : this.parent.grid.dataSource;
        }
        let results: ITreeData[] = dataObj instanceof DataManager ? (<DataManager>dataObj).dataSource.json : <ITreeData[]>dataObj;
        let count: number = isCountRequired(this.parent) ? getValue('count', this.parent.dataSource)
            : results.length;
        const qry: Query = new Query(); let gridQuery: Query = getObject('query', args);
        let filterQuery: QueryOptions[]; let searchQuery: QueryOptions[];
        if (!isNullOrUndefined(gridQuery)) {
            filterQuery = gridQuery.queries.filter((q: QueryOptions) => q.fn === 'onWhere');
            searchQuery = gridQuery.queries.filter((q: QueryOptions) => q.fn === 'onSearch');
        }
        if ((this.parent.grid.allowFiltering && this.parent.grid.filterSettings.columns.length) ||
         (this.parent.grid.searchSettings.key.length > 0) || (!isNullOrUndefined(gridQuery) &&
         (filterQuery.length || searchQuery.length))) {
            if (isNullOrUndefined(gridQuery)) {
                gridQuery = new Query(); gridQuery = getValue('grid.renderModule.data', this.parent).filterQuery(gridQuery);
                gridQuery = getValue('grid.renderModule.data', this.parent).searchQuery(gridQuery);
            }
            const fltrQuery: QueryOptions[]  = gridQuery.queries.filter((q: QueryOptions) => q.fn === 'onWhere');
            const srchQuery: QueryOptions[]  = gridQuery.queries.filter((q: QueryOptions) => q.fn === 'onSearch');
            qry.queries = fltrQuery.concat(srchQuery); const filteredData: Object = new DataManager(results).executeLocal(qry);
            this.parent.notify('updateFilterRecs', { data: filteredData });
            results = <ITreeData[]>this.dataResults.result; this.dataResults.result = null;
            if (this.parent.grid.aggregates.length > 0) {
                const query: Query = getObject('query', args);
                if (isNullOrUndefined(gridQuery)) {
                    gridQuery = getValue('grid.renderModule.data', this.parent).aggregateQuery(new Query());
                }
                if (!isNullOrUndefined(query)) {
                    const summaryQuery: QueryOptions[]  = query.queries.filter((q: QueryOptions) => q.fn === 'onAggregates');
                    results = this.parent.summaryModule.calculateSummaryValue(summaryQuery, results, true);
                }
            }
        }
        if (this.parent.grid.aggregates.length && this.parent.grid.sortSettings.columns.length === 0
      && this.parent.grid.filterSettings.columns.length === 0 && !this.parent.grid.searchSettings.key.length) {
            let gridQuery: Query = getObject('query', args);
            if (isNullOrUndefined(gridQuery)) {
                gridQuery = getValue('grid.renderModule.data', this.parent).aggregateQuery(new Query());
            }
            const summaryQuery: QueryOptions[]  = gridQuery.queries.filter((q: QueryOptions) => q.fn === 'onAggregates');
            results = this.parent.summaryModule.calculateSummaryValue(summaryQuery, this.parent.flatData, true);
        }
        if (this.parent.grid.sortSettings.columns.length > 0 || this.isSortAction) {
            this.isSortAction = false;
            const parentData: Object = this.parent.parentData;
            const query: Query = getObject('query', args); const srtQry: Query = new Query();
            for (let srt: number = this.parent.grid.sortSettings.columns.length - 1; srt >= 0; srt--) {
                const col: GridColumnModel = this.parent.grid.getColumnByField(this.parent.grid.sortSettings.columns[srt].field);
                const compFun: Function | string = col.sortComparer && isOffline(this.parent) ?
                    (col.sortComparer as Function).bind(col) :
                    this.parent.grid.sortSettings.columns[srt].direction;
                srtQry.sortBy(this.parent.grid.sortSettings.columns[srt].field, compFun);
            }
            const modifiedData: Object = new DataManager(parentData).executeLocal(srtQry);
            const sortArgs: { modifiedData: ITreeData[], filteredData: ITreeData[], srtQry: Query}
      = {modifiedData: <Object[]>modifiedData, filteredData: results, srtQry: srtQry};
            this.parent.notify('createSort', sortArgs); results = sortArgs.modifiedData;
            this.dataResults.result = null; this.sortedData = results; this.parent.notify('updateModel', {});
            if (this.parent.grid.aggregates.length > 0 && !isNullOrUndefined(query)) {
                const isSort: boolean = false;
                const query: Query = getObject('query', args);
                const summaryQuery: QueryOptions[]  = query.queries.filter((q: QueryOptions) => q.fn === 'onAggregates');
                results = this.parent.summaryModule.calculateSummaryValue(summaryQuery, this.sortedData, isSort);
            }
        }
        count = isCountRequired(this.parent) ? getValue('count', this.parent.dataSource)
            : results.length;
        const temp: BeforeDataBoundArgs = this.paging(results, count, isExport, isPrinting, exportType, args);
        results = temp.result; count = temp.count;
        args.result = results; args.count = count;
        this.parent.notify('updateResults', args);
    }
    private paging(results: ITreeData[], count: number, isExport: boolean,
                   isPrinting: boolean, exportType: string, args: Object): BeforeDataBoundArgs {
        if (this.parent.allowPaging && (!isExport || exportType === 'CurrentPage')
     && (!isPrinting || this.parent.printMode === 'CurrentPage'))  {
            this.parent.notify(events.pagingActions, {result: results, count: count});
            results = <ITreeData[]>this.dataResults.result;
            count = isCountRequired(this.parent) ? getValue('count', this.parent.dataSource)
                : this.dataResults.count;
        } else if ((this.parent.enableVirtualization || this.parent.enableInfiniteScrolling) && (!isExport || exportType === 'CurrentPage')
              && getValue('requestType', args) !== 'save') {
            const actArgs: Object = this.parent.enableInfiniteScrolling ? args : getValue('actionArgs', args);
            this.parent.notify(events.pagingActions, {result: results, count: count, actionArgs: actArgs});
            results = <ITreeData[]>this.dataResults.result;
            count = this.dataResults.count;
        }
        const isPdfExport: string = 'isPdfExport'; const isCollapsedStatePersist: string = 'isCollapsedStatePersist';
        if ((isPrinting === true || (args[isPdfExport] && (isNullOrUndefined(args[isCollapsedStatePersist])
       || args[isCollapsedStatePersist]))) && this.parent.printMode === 'AllPages') {
            const actualResults: ITreeData[] = [];
            for (let i: number = 0; i < results.length; i++) {
                const expandStatus: boolean = getExpandStatus(this.parent, results[i], this.parent.parentData);
                if (expandStatus) {
                    actualResults.push(results[i]);
                }
            }
            results = actualResults;
            count = results.length;
        }
        const value: BeforeDataBoundArgs = { result: results, count: count };
        return value;
    }

    private updateData(dataResult: {result: ITreeData, count: number}): void {
        this.dataResults = <ReturnOption>dataResult;
    }
    private updateAction(actionData: ITreeData, action: string, requestType: string): void {
        if ((requestType === 'delete' || requestType === 'save')) {
            this.parent.notify(events.crudAction, { value: actionData, action: action || requestType });
        }
        if (requestType === 'batchsave' && this.parent.editSettings.mode === 'Batch') {
            this.parent.notify(events.batchSave, {});
        }
    }
}
