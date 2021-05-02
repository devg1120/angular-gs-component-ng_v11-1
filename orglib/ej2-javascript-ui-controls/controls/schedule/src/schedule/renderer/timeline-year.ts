/* eslint-disable @typescript-eslint/no-explicit-any */
import { append, addClass, createElement } from '@syncfusion/ej2-base';
import { Schedule } from '../base/schedule';
import { Year } from './year';
import { TdData, RenderCellEventArgs, CellTemplateArgs } from '../base/interface';
import * as event from '../base/constant';
import * as cls from '../base/css-constant';
import * as util from '../base/util';

/**
 * timeline year view
 */
export class TimelineYear extends Year {
    public viewClass: string = 'e-timeline-year-view';
    public isInverseTableSelect: boolean = true;

    constructor(parent: Schedule) {
        super(parent);
    }

    protected getModuleName(): string {
        return 'timelineYear';
    }

    public renderHeader(headerWrapper: HTMLElement): void {
        const tr: HTMLElement = createElement('tr');
        headerWrapper.appendChild(tr);
        if (this.parent.activeViewOptions.orientation === 'Vertical' && this.parent.activeViewOptions.group.resources.length > 0 &&
            !this.parent.uiStateValues.isGroupAdaptive) {
            this.parent.resourceBase.renderResourceHeaderIndent(tr);
        } else {
            const leftHeaderCells: HTMLElement = createElement('td', { className: cls.LEFT_INDENT_CLASS });
            tr.appendChild(leftHeaderCells);
            leftHeaderCells.appendChild(this.renderResourceHeader(cls.LEFT_INDENT_WRAP_CLASS));
        }
        const td: HTMLElement = createElement('td');
        tr.appendChild(td);
        const container: HTMLElement = createElement('div', { className: cls.DATE_HEADER_CONTAINER_CLASS });
        td.appendChild(container);
        if (this.parent.activeViewOptions.orientation === 'Horizontal' && this.parent.activeViewOptions.group.resources.length > 0 &&
            !this.parent.uiStateValues.isGroupAdaptive) {
            container.appendChild(this.renderResourceHeader(cls.DATE_HEADER_WRAP_CLASS));
            this.columnCount = this.colLevels.slice(-1)[0].length;
        } else {
            const wrapper: HTMLElement = createElement('div', { className: cls.DATE_HEADER_WRAP_CLASS });
            container.appendChild(wrapper);
            const table: HTMLElement = this.createTableLayout() as HTMLElement;
            wrapper.appendChild(table);
            table.appendChild(this.createTableColGroup(this.columnCount));
            const innerTr: HTMLElement = createElement('tr');
            table.querySelector('tbody').appendChild(innerTr);
            for (let column: number = 0; column < this.columnCount; column++) {
                const innerTd: HTMLElement = createElement('td', { className: cls.HEADER_CELLS_CLASS });
                if (this.parent.activeViewOptions.orientation === 'Horizontal') {
                    innerTd.innerHTML = `<span>${this.parent.getDayNames('abbreviated')[column % 7]}</span>`;
                } else {
                    const date: Date = new Date(this.parent.selectedDate.getFullYear(), column, 1);
                    innerTd.innerHTML = `<span>${this.getMonthName(date)}</span>`;
                    innerTd.setAttribute('data-date', date.getTime().toString());
                }
                innerTr.appendChild(innerTd);
                this.parent.trigger(event.renderCell, { elementType: 'headerCells', element: innerTd });
            }
        }
    }

    private renderResourceHeader(className: string): HTMLElement {
        const wrap: HTMLElement = createElement('div', { className: className });
        const tbl: Element = this.createTableLayout();
        wrap.appendChild(tbl);
        const trEle: Element = createElement('tr');
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            this.colLevels = this.generateColumnLevels();
        } else {
            const colData: TdData[] = [{ className: [cls.HEADER_CELLS_CLASS], type: 'headerCell' }];
            this.colLevels = [colData];
        }
        for (const col of this.colLevels) {
            const ntr: Element = trEle.cloneNode() as Element;
            const count: TdData[] = className === cls.DATE_HEADER_WRAP_CLASS ? col : [col[0]];
            for (const c of count) {
                const tdEle: Element = createElement('td');
                if (c.className) { addClass([tdEle], c.className); }
                if (className === cls.DATE_HEADER_WRAP_CLASS) {
                    if (c.template) { append(c.template, tdEle); }
                    if (c.colSpan) { tdEle.setAttribute('colspan', c.colSpan.toString()); }
                    this.setResourceHeaderContent(tdEle, c);
                }
                const args: RenderCellEventArgs = { elementType: c.type, element: tdEle, date: c.date, groupIndex: c.groupIndex };
                this.parent.trigger(event.renderCell, args);
                ntr.appendChild(tdEle);
            }
            tbl.querySelector('tbody').appendChild(ntr);
        }
        if (className === cls.DATE_HEADER_WRAP_CLASS) {
            tbl.appendChild(this.createTableColGroup(this.colLevels.slice(-1)[0].length));
        }
        return wrap;
    }

    public renderContent(contentWrapper: HTMLElement): void {
        const tr: HTMLElement = createElement('tr');
        contentWrapper.appendChild(tr);
        const firstTd: HTMLElement = createElement('td');
        const lastTd: HTMLElement = createElement('td');
        const tdCollection: HTMLElement[] = [];
        let monthTBody: HTMLTableSectionElement;
        if (this.parent.activeViewOptions.orientation === 'Vertical' && this.parent.activeViewOptions.group.resources.length > 0 &&
            !this.parent.uiStateValues.isGroupAdaptive) {
            tdCollection.push(firstTd);
            firstTd.appendChild(this.parent.resourceBase.createResourceColumn());
            this.rowCount = this.parent.resourceBase.lastResourceLevel.length;
        } else {
            tdCollection.push(firstTd);
            const monthWrapper: HTMLElement = createElement('div', { className: cls.MONTH_HEADER_WRAPPER });
            firstTd.appendChild(monthWrapper);
            monthWrapper.appendChild(this.createTableLayout() as HTMLElement);
            monthTBody = monthWrapper.querySelector('tbody');
        }
        tdCollection.push(lastTd);
        append(tdCollection, tr);
        const content: HTMLElement = createElement('div', { className: cls.CONTENT_WRAP_CLASS });
        lastTd.appendChild(content);
        const contentTable: HTMLElement = this.createTableLayout(cls.CONTENT_TABLE_CLASS) as HTMLElement;
        content.appendChild(contentTable);
        const eventWrapper: HTMLElement = createElement('div', { className: cls.EVENT_TABLE_CLASS });
        content.appendChild(eventWrapper);
        const contentTBody: HTMLTableSectionElement = contentTable.querySelector('tbody');
        if (this.parent.activeViewOptions.group.resources.length > 0 && !this.parent.uiStateValues.isGroupAdaptive) {
            if (this.parent.rowAutoHeight) {
                addClass([contentTable], cls.AUTO_HEIGHT);
            }
            const colCount: number = this.parent.activeViewOptions.orientation === 'Horizontal' ? this.colLevels.slice(-1)[0].length : 12;
            contentTable.appendChild(this.createTableColGroup(colCount));
            this.renderResourceContent(eventWrapper, monthTBody, contentTBody);
        } else {
            contentTable.appendChild(this.createTableColGroup(this.columnCount));
            this.renderDefaultContent(eventWrapper, monthTBody, contentTBody);
        }
    }

    private renderDefaultContent(wrapper: HTMLElement, monthBody: HTMLTableSectionElement, contentBody: HTMLTableSectionElement): void {
        for (let month: number = 0; month < this.rowCount; month++) {
            wrapper.appendChild(createElement('div', { className: cls.APPOINTMENT_CONTAINER_CLASS }));
            let monthDate: Date = new Date(this.parent.selectedDate.getFullYear(), month, 1);
            let monthStart: Date = this.parent.calendarUtil.getMonthStartDate(new Date(monthDate.getTime()));
            let monthEnd: Date = this.parent.calendarUtil.getMonthEndDate(new Date(monthDate.getTime()));
            const tr: HTMLElement = createElement('tr', { attrs: { 'role': 'row' } });
            const monthTr: HTMLElement = tr.cloneNode() as HTMLElement;
            monthBody.appendChild(monthTr);
            const contentTr: HTMLElement = tr.cloneNode() as HTMLElement;
            contentBody.appendChild(contentTr);
            const monthTd: HTMLElement = createElement('td', { className: cls.MONTH_HEADER_CLASS, attrs: { 'role': 'gridcell' } });
            if (this.parent.activeViewOptions.orientation === 'Horizontal') {
                monthTd.setAttribute('data-date', monthDate.getTime().toString());
                monthTd.innerHTML = `<span>${this.getMonthName(monthDate)}</span>`;
            } else {
                monthTd.innerHTML = `<span>${this.parent.getDayNames('abbreviated')[month % 7]}</span>`;
            }
            monthTr.appendChild(monthTd);
            this.parent.trigger(event.renderCell, { elementType: 'leftHeaderCells', element: monthTd });
            let date: Date = new Date(monthStart.getTime());
            for (let column: number = 0; column < this.columnCount; column++) {
                let isDateAvail: boolean;
                if (this.parent.activeViewOptions.orientation === 'Vertical') {
                    monthDate = new Date(this.parent.selectedDate.getFullYear(), column, 1);
                    monthStart = this.parent.calendarUtil.getMonthStartDate(new Date(monthDate.getTime()));
                    monthEnd = this.parent.calendarUtil.getMonthEndDate(new Date(monthDate.getTime()));
                    const dayDate: number = (month - monthStart.getDay()) + 1;
                    date = new Date(this.parent.selectedDate.getFullYear(), column, dayDate);
                    isDateAvail = dayDate > 0 && date.getTime() < monthEnd.getTime();
                } else {
                    isDateAvail = column >= monthStart.getDay() && date.getTime() < monthEnd.getTime();
                }
                const td: HTMLElement = createElement('td', {
                    className: cls.WORK_CELLS_CLASS,
                    attrs: { 'role': 'gridcell', 'aria-selected': 'false' }
                });
                contentTr.appendChild(td);
                const dateHeader: HTMLElement = createElement('div', {
                    className: cls.DATE_HEADER_CLASS + ' ' + cls.NAVIGATE_CLASS,
                    innerHTML: (isDateAvail) ? date.getDate().toString() : ''
                });
                const skeleton: string = 'full';
                const annocementText: string =
                    this.parent.globalize.formatDate(date, {
                        skeleton: skeleton,
                        calendar: this.parent.getCalendarMode()
                    });
                dateHeader.setAttribute('aria-label', annocementText);
                if (isDateAvail) {
                    const tds: HTMLElement[] = [td];
                    const classList: string[] = [];
                    if (this.parent.activeViewOptions.workDays.indexOf(date.getDay()) > -1) {
                        classList.push(cls.WORKDAY_CLASS);
                    }
                    if (this.isCurrentDate(date)) {
                        classList.push(cls.CURRENT_DAY_CLASS);
                        if (this.parent.activeViewOptions.orientation === 'Horizontal') {
                            tds.push(this.element.querySelector('.' + cls.HEADER_CELLS_CLASS + `:nth-child(${column + 1})`));
                        } else {
                            tds.push(this.element.querySelectorAll('.' + cls.MONTH_HEADER_CLASS).item(month) as HTMLElement);
                        }
                    }
                    if (classList.length > 0) {
                        addClass(tds, classList);
                    }
                } else {
                    addClass([td], cls.OTHERMONTH_CLASS);
                }
                td.appendChild(dateHeader);
                if (isDateAvail) {
                    td.setAttribute('data-date', date.getTime().toString());
                    this.wireEvents(td, 'cell');
                }
                this.renderCellTemplate({ date: date, type: 'workCells' }, td);
                this.parent.trigger(event.renderCell, { elementType: 'workCells', element: td, date: date });
                if (isDateAvail) {
                    if (this.parent.activeViewOptions.orientation === 'Horizontal') {
                        date = util.addDays(new Date(date.getTime()), 1);
                    }
                }
            }
        }
    }

    private renderResourceContent(wrapper: HTMLElement, monthBody: HTMLTableSectionElement, contentBody: HTMLTableSectionElement): void {
        for (let row: number = 0; row < this.rowCount; row++) {
            wrapper.appendChild(createElement('div', { className: cls.APPOINTMENT_CONTAINER_CLASS }));
            const tr: HTMLElement = createElement('tr', { attrs: { 'role': 'row' } });
            contentBody.appendChild(tr);
            let resData: TdData;
            if (this.parent.activeViewOptions.group.resources.length > 0 && !this.parent.uiStateValues.isGroupAdaptive) {
                resData = this.parent.resourceBase.lastResourceLevel[row];
            }
            let monthDate: Date = new Date(this.parent.selectedDate.getFullYear(), row, 1);
            let date: Date = this.parent.calendarUtil.getMonthStartDate(new Date(monthDate.getTime()));
            if (this.parent.activeViewOptions.orientation === 'Horizontal') {
                const monthTr: HTMLElement = tr.cloneNode() as HTMLElement;
                monthBody.appendChild(monthTr);
                const monthTd: HTMLElement = createElement('td', {
                    className: cls.MONTH_HEADER_CLASS,
                    innerHTML: `<span>${this.getMonthName(monthDate)}</span>`,
                    attrs: { 'role': 'gridcell', 'data-date': date.getTime().toString() }
                });
                monthTr.appendChild(monthTd);
            }
            for (let month: number = 0; month < this.columnCount; month++) {
                let classList: string[] = [];
                let groupIndex: number = row;
                if (this.parent.activeViewOptions.orientation === 'Vertical') {
                    classList = classList.concat(resData.className);
                    if (classList.indexOf(cls.RESOURCE_PARENT_CLASS) > -1) {
                        classList.push(cls.RESOURCE_GROUP_CELLS_CLASS);
                    } else {
                        classList.push(cls.WORKDAY_CLASS);
                    }
                    monthDate = new Date(this.parent.selectedDate.getFullYear(), month, 1);
                    date = this.parent.calendarUtil.getMonthStartDate(new Date(monthDate.getTime()));
                } else {
                    groupIndex = this.colLevels.slice(-1)[0][month].groupIndex;
                    classList.push(cls.WORKDAY_CLASS);
                }
                const td: HTMLElement = createElement('td', {
                    className: cls.WORK_CELLS_CLASS,
                    attrs: {
                        'role': 'gridcell', 'aria-selected': 'false',
                        'data-date': date.getTime().toString()
                    }
                });
                addClass([td], classList);
                td.setAttribute('data-group-index', groupIndex.toString());
                this.renderCellTemplate({ date: date, type: 'workCells', groupIndex: groupIndex }, td);
                this.wireEvents(td, 'cell');
                tr.appendChild(td);
                this.parent.trigger(event.renderCell, { elementType: 'workCells', element: td, date: date });
            }
        }
        if (this.parent.activeViewOptions.orientation === 'Vertical') {
            this.collapseRows(this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS));
        }
    }

    private renderCellTemplate(data: Record<string, any>, td: HTMLElement): void {
        if (!this.parent.activeViewOptions.cellTemplate) {
            return;
        }
        const args: CellTemplateArgs = { date: data.date as Date, type: data.type as string };
        if (data.groupIndex) {
            args.groupIndex = data.groupIndex as number;
        }
        const scheduleId: string = this.parent.element.id + '_';
        const viewName: string = this.parent.activeViewOptions.cellTemplateName;
        const templateId: string = scheduleId + viewName + 'cellTemplate';
        const cellTemplate: HTMLElement[] =
            [].slice.call(this.parent.getCellTemplate()(args, this.parent, 'cellTemplate', templateId, false));
        append(cellTemplate, td);
    }

    public scrollToDate(scrollDate: Date): void {
        if (this.parent.activeViewOptions.group.resources.length === 0) {
            const date: number = +new Date(util.resetTime(scrollDate));
            const element: HTMLElement = this.element.querySelector('[data-date="' + date + '"]');
            if (element) {
                this.getScrollableElement().scrollLeft = element.offsetLeft;
                this.getScrollableElement().scrollTop = element.offsetTop;
            }
        }
    }

    public getScrollableElement(): Element {
        if (this.parent.isAdaptive && !this.isTimelineView()) {
            return this.element.querySelector('.' + cls.SCROLL_CONTAINER_CLASS);
        } else {
            return this.getContentAreaElement();
        }
    }

}
