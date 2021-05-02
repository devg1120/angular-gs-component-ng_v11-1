/* eslint-disable @typescript-eslint/no-explicit-any */
import { addClass, append, createElement, extend, remove, isNullOrUndefined } from '@syncfusion/ej2-base';
import { setStyleAttribute, EventHandler } from '@syncfusion/ej2-base';
import { Schedule } from '../base/schedule';
import { EventRenderedArgs, TdData } from '../base/interface';
import { TimelineEvent } from './timeline-view';
import * as util from '../base/util';
import * as events from '../base/constant';
import * as cls from '../base/css-constant';

const EVENT_GAP: number = 2;

/**
 * Year view events render
 */

export class YearEvent extends TimelineEvent {
    public cellHeader: number;
    private isResource: boolean = false;

    constructor(parent: Schedule) {
        super(parent, 'day');
    }

    public renderAppointments(): void {
        this.fields = this.parent.eventFields;
        const elementSelector: string = (this.parent.currentView === 'Year') ? '.' + cls.APPOINTMENT_CLASS :
            '.' + cls.APPOINTMENT_WRAPPER_CLASS + ',.' + cls.MORE_INDICATOR_CLASS;
        const eventWrappers: HTMLElement[] = [].slice.call(this.parent.element.querySelectorAll(elementSelector));
        for (const wrapper of eventWrappers) {
            remove(wrapper);
        }
        this.renderedEvents = [];
        if (this.parent.currentView === 'Year') {
            this.yearViewEvents();
        } else {
            this.removeCellHeight();
            if (this.parent.activeViewOptions.group.resources.length > 0 && !this.parent.uiStateValues.isGroupAdaptive) {
                this.isResource = true;
                this.timelineResourceEvents();
            } else {
                this.timelineYearViewEvents();
            }
        }
        this.parent.renderTemplates();
        this.parent.notify(events.contentReady, {});
    }

    private yearViewEvents(): void {
        for (let month: number = 0; month < 12; month++) {
            const queryString: string = `.e-month-calendar:nth-child(${month + 1}) td.e-work-cells`;
            const workCells: HTMLElement[] = [].slice.call(this.parent.element.querySelectorAll(queryString));
            const monthDate: Date = new Date(this.parent.selectedDate.getFullYear(), month, 1);
            const monthStart: Date = this.parent.calendarUtil.getMonthStartDate(new Date(monthDate.getTime()));
            const monthEnd: Date = this.parent.calendarUtil.getMonthEndDate(new Date(monthDate.getTime()));
            let startDate: Date = util.getWeekFirstDate(monthStart, this.parent.firstDayOfWeek);
            const endDate: Date = util.addDays(util.getWeekLastDate(monthEnd, this.parent.firstDayOfWeek), 1);
            for (let index: number = 0; startDate.getTime() < endDate.getTime(); index++) {
                const start: Date = util.resetTime(new Date(startDate.getTime()));
                const end: Date = util.addDays(new Date(start.getTime()), 1);
                const filterEvents: Record<string, any>[] = this.parent.eventBase.filterEvents(start, end);
                if (filterEvents.length > 0) {
                    const workCell: HTMLElement = workCells[index];
                    if (workCell) {
                        workCell.appendChild(createElement('div', { className: cls.APPOINTMENT_CLASS }));
                    }
                }
                startDate = util.addDays(new Date(startDate.getTime()), 1);
            }
        }
    }

    private timelineYearViewEvents(): void {
        const workCell: HTMLElement = this.parent.element.querySelector('.' + cls.WORK_CELLS_CLASS);
        this.cellWidth = workCell.offsetWidth;
        this.cellHeader = util.getOuterHeight(workCell.querySelector('.' + cls.DATE_HEADER_CLASS));
        const eventTable: Element = this.parent.element.querySelector('.' + cls.EVENT_TABLE_CLASS);
        this.eventHeight = util.getElementHeightFromClass(eventTable, cls.APPOINTMENT_CLASS);
        const wrapperCollection: HTMLElement[] = [].slice.call(this.parent.element.querySelectorAll('.' + cls.APPOINTMENT_CONTAINER_CLASS));
        for (let row: number = 0; row < 12; row++) {
            const wrapper: Element = wrapperCollection[row];
            let td: number = row + 1;
            const eventWrapper: HTMLElement = createElement('div', { className: cls.APPOINTMENT_WRAPPER_CLASS });
            wrapper.appendChild(eventWrapper);
            let monthStart: Date = new Date(this.parent.selectedDate.getFullYear(), row, 1);
            const monthEnd: Date = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
            let dayIndex: number = monthStart.getDay();
            const isSpannedCollection: Record<string, any>[] = [];
            if (this.parent.activeViewOptions.orientation === 'Horizontal') {
                this.renderedEvents = [];
            }
            while (monthStart.getTime() <= monthEnd.getTime()) {
                let leftValue: number;
                let rightValue: number;
                if (this.parent.activeViewOptions.orientation === 'Vertical') {
                    const wrapper: Element = wrapperCollection[dayIndex];
                    td = dayIndex + 1;
                    let eventWrapper: HTMLElement = wrapper.querySelector('.' + cls.APPOINTMENT_WRAPPER_CLASS) as HTMLElement;
                    if (!eventWrapper) {
                        eventWrapper = createElement('div', { className: cls.APPOINTMENT_WRAPPER_CLASS });
                        wrapper.appendChild(eventWrapper);
                    }
                    if (this.parent.enableRtl) {
                        rightValue = row * this.cellWidth;
                    } else {
                        leftValue = row * this.cellWidth;
                    }
                } else {
                    if (this.parent.enableRtl) {
                        rightValue = ((dayIndex + monthStart.getDate()) - 1) * this.cellWidth;
                    } else {
                        leftValue = ((dayIndex + monthStart.getDate()) - 1) * this.cellWidth;
                    }
                }
                const rowTd: HTMLElement = this.parent.element.querySelector(`.e-content-wrap tr:nth-child(${td}) td`) as HTMLElement;
                this.cellHeight = rowTd.offsetHeight;
                const dayStart: Date = util.resetTime(new Date(monthStart.getTime()));
                const dayEnd: Date = util.addDays(new Date(dayStart.getTime()), 1);
                let resource: TdData;
                if (this.parent.uiStateValues.isGroupAdaptive) {
                    resource = this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex];
                }
                const dayEvents: Record<string, any>[] = this.parent.eventBase.filterEvents(dayStart, dayEnd, undefined, resource);
                for (let index: number = 0, count: number = dayEvents.length; index < count; index++) {
                    const eventData: Record<string, any> = extend({}, dayEvents[index], null, true) as Record<string, any>;
                    this.updateSpannedEvents(eventData, dayStart, dayEnd);
                    const overlapIndex: number = this.getIndex(dayStart as Date);
                    eventData.Index = overlapIndex;
                    const availedHeight: number = this.cellHeader + (this.eventHeight * (index + 1)) + EVENT_GAP + this.moreIndicatorHeight;
                    if (this.parent.activeViewOptions.orientation === 'Horizontal') {
                        const isRendered: Record<string, any>[] = this.renderedEvents.filter((eventObj: Record<string, any>) =>
                            eventObj.Guid === eventData.Guid);
                        const isSpanned: Record<string, any>[] = isSpannedCollection.filter((eventObj: Record<string, any>) =>
                            eventObj.Guid === eventData.Guid);
                        if (isRendered.length > 0 && isRendered[0].MoreIndicator || isSpanned.length > 0 && isSpanned[0].MoreIndicator) {
                            const moreIndex: number = this.parent.activeViewOptions.orientation === 'Horizontal' ? row : dayIndex;
                            this.renderMoreIndicatior(eventWrapper, count - index, dayStart, moreIndex, leftValue, rightValue);
                            break;
                        } else if (isRendered.length > 0 || isSpanned.length > 0) {
                            continue;
                        }
                    }
                    const isRowAutoHeight: boolean = this.parent.rowAutoHeight && this.parent.activeViewOptions.orientation === 'Horizontal';
                    if (isRowAutoHeight || this.cellHeight > availedHeight) {
                        this.renderEvent(eventWrapper, eventData, row, leftValue, rightValue, dayIndex);
                        this.updateCellHeight(rowTd, availedHeight);
                        isSpannedCollection.push(eventData);
                    } else {
                        const moreIndex: number = this.parent.activeViewOptions.orientation === 'Horizontal' ? row : dayIndex;
                        this.renderMoreIndicatior(eventWrapper, count - index, dayStart, moreIndex, leftValue, rightValue);
                        if (this.parent.activeViewOptions.orientation === 'Horizontal') {
                            for (let a: number = index; a < dayEvents.length; a++) {
                                const moreData: Record<string, any> =
                                    extend({}, dayEvents[a], { Index: overlapIndex + a, MoreIndicator: true }, true) as Record<string, any>;
                                this.renderedEvents.push(moreData);
                                eventData.MoreIndicator = true;
                                isSpannedCollection.push(eventData);
                            }
                        }
                        break;
                    }
                }
                monthStart = util.addDays(new Date(monthStart.getTime()), 1);
                if (this.parent.activeViewOptions.orientation === 'Vertical') {
                    dayIndex++;
                    this.renderedEvents = [];
                }
            }
        }
    }

    private updateSpannedEvents(eventObj: Record<string, any>, dayStart: Date, dayEnd: Date): void {
        const isLeftRightResize: boolean = (this.isResource && this.parent.activeViewOptions.orientation === 'Vertical') ||
            (!this.isResource && this.parent.activeViewOptions.orientation === 'Horizontal');
        const data: Record<string, any> = { isLeft: true, isRight: true, isBottom: true, isTop: true };
        if (dayStart.getTime() <= (eventObj[this.fields.startTime] as Date).getTime()) {
            if (isLeftRightResize) {
                data.isLeft = false;
            } else {
                data.isTop = false;
            }
        }
        if ((dayEnd.getTime() >= (eventObj[this.fields.endTime] as Date).getTime()) || (isLeftRightResize && !this.isResource &&
            util.addDays(dayEnd, -1).getMonth() === (eventObj[this.fields.endTime] as Date).getMonth())) {
            if (isLeftRightResize) {
                data.isRight = false;
            } else {
                data.isBottom = false;
            }
        }
        eventObj.data = data;
    }

    private timelineResourceEvents(): void {
        const workCell: HTMLElement = this.parent.element.querySelector('.' + cls.WORK_CELLS_CLASS);
        this.cellWidth = workCell.offsetWidth;
        this.cellHeader = 0;
        const eventTable: Element = this.parent.element.querySelector('.' + cls.EVENT_TABLE_CLASS);
        this.eventHeight = util.getElementHeightFromClass(eventTable, cls.APPOINTMENT_CLASS);
        const wrapperCollection: HTMLElement[] = [].slice.call(this.parent.element.querySelectorAll('.' + cls.APPOINTMENT_CONTAINER_CLASS));
        const resources: TdData[] = this.parent.uiStateValues.isGroupAdaptive ?
            [this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex]] : this.parent.resourceBase.lastResourceLevel;
        if (this.parent.activeViewOptions.orientation === 'Horizontal') {
            for (let month: number = 0; month < 12; month++) {
                for (let i: number = 0, len: number = resources.length; i < len; i++) {
                    this.renderedEvents = [];
                    this.renderResourceEvent(wrapperCollection[i], resources[i], month, i);
                }
            }
        } else {
            for (let i: number = 0, len: number = resources.length; i < len; i++) {
                this.renderedEvents = [];
                for (let month: number = 0; month < 12; month++) {
                    this.renderResourceEvent(wrapperCollection[i], resources[i], month, i);
                }
            }
        }
    }

    private renderResourceEvent(wrapper: Element, resource: TdData, month: number, index: number): void {
        const eventWrapper: HTMLElement = createElement('div', { className: cls.APPOINTMENT_WRAPPER_CLASS });
        wrapper.appendChild(eventWrapper);
        const monthStart: Date = util.firstDateOfMonth(new Date(this.parent.selectedDate.getFullYear(), month, 1));
        const monthEnd: Date = util.addDays(util.lastDateOfMonth(new Date(monthStart.getTime())), 1);
        const eventDatas: Record<string, any>[] = this.parent.eventBase.filterEvents(monthStart, monthEnd, undefined, resource);
        const rowIndex: number = this.parent.activeViewOptions.orientation === 'Vertical' ? index : month;
        const td: HTMLElement = this.parent.element.querySelector(`.e-content-wrap tr:nth-child(${rowIndex + 1}) td`) as HTMLElement;
        this.cellHeight = td.offsetHeight;
        for (let a: number = 0; a < eventDatas.length; a++) {
            const data: Record<string, any> = eventDatas[a];
            let overlapIndex: number;
            const eventData: Record<string, any> = extend({}, data, null, true) as Record<string, any>;
            if (this.parent.activeViewOptions.group.resources.length > 0) {
                const eventObj: Record<string, any> = this.isSpannedEvent(eventData, month);
                overlapIndex = this.getIndex(eventObj[this.fields.startTime] as Date);
                eventData.Index = overlapIndex;
            } else {
                overlapIndex = this.getIndex(eventData[this.fields.startTime] as Date);
                eventData.Index = overlapIndex;
            }
            const availedHeight: number = this.cellHeader + (this.eventHeight * (a + 1)) + EVENT_GAP + this.moreIndicatorHeight;
            const leftValue: number = (this.parent.activeViewOptions.orientation === 'Vertical') ?
                month * this.cellWidth : index * this.cellWidth;
            if (this.parent.rowAutoHeight || this.cellHeight > availedHeight) {
                this.renderEvent(eventWrapper, eventData, month, leftValue, leftValue, index);
                this.updateCellHeight(td, availedHeight);
            } else {
                const moreIndex: number = this.parent.activeViewOptions.orientation === 'Horizontal' ? month : index;
                this.renderMoreIndicatior(eventWrapper, eventDatas.length - a, monthStart, moreIndex, leftValue, leftValue, index);
                if (this.parent.activeViewOptions.orientation === 'Horizontal') {
                    for (let i: number = index; i < eventDatas.length; i++) {
                        const moreData: Record<string, any> =
                            extend({}, eventDatas[i], { Index: overlapIndex + i }, true) as Record<string, any>;
                        this.renderedEvents.push(moreData);
                    }
                }
                break;
            }
        }
    }

    // eslint-disable-next-line max-len
    private renderEvent(wrapper: HTMLElement, eventData: Record<string, any>, row: number, left: number, right: number, rowIndex?: number): void {
        const eventObj: Record<string, any> = this.isSpannedEvent(eventData, row);
        const wrap: HTMLElement = this.createEventElement(eventObj);
        let width: number;
        let index: number;
        if ((<{ [key: string]: number }>eventObj.isSpanned).count === 1) {
            const endTime: Date = util.addDays(eventObj[this.fields.endTime] as Date, -1);
            eventObj[this.fields.endTime] = (endTime > eventObj[this.fields.startTime]) ? endTime : eventObj[this.fields.endTime];
        }
        if (eventObj[this.fields.startTime] > eventObj[this.fields.endTime]) {
            return;
        }
        if (this.parent.activeViewOptions.orientation === 'Horizontal') {
            index = row + 1;
            if ((eventObj[this.fields.startTime] as Date).getTime() === (eventObj[this.fields.endTime] as Date).getTime()) {
                (<{ [key: string]: number }>eventObj.isSpanned).count = 1;
            }
            width = (<{ [key: string]: number }>eventObj.isSpanned).count * this.cellWidth;
        } else {
            index = rowIndex + 1;
            width = this.cellWidth;
        }
        const rowTd: HTMLElement = this.parent.element.querySelector(`.e-content-wrap tr:nth-child(${index}) td`) as HTMLElement;
        const top: number = rowTd.offsetTop + this.cellHeader + (this.eventHeight * <number>eventObj.Index) + EVENT_GAP;
        setStyleAttribute(wrap, {
            'width': width + 'px', 'height': this.eventHeight + 'px', 'left': left + 'px', 'right': right + 'px', 'top': top + 'px'
        });
        const args: EventRenderedArgs = { data: eventObj, element: wrap, cancel: false, type: 'event' };
        this.parent.trigger(events.eventRendered, args, (eventArgs: EventRenderedArgs) => {
            if (!eventArgs.cancel) {
                wrapper.appendChild(wrap);
                this.wireAppointmentEvents(wrap, eventObj);
                if (this.parent.activeViewOptions.group.resources.length > 0) {
                    this.renderedEvents.push(extend({}, eventObj, null, true) as Record<string, any>);
                } else if (!(eventObj.isSpanned as Record<string, any>).isRight) {
                    this.renderedEvents.push(extend({}, eventObj, null, true) as Record<string, any>);
                } else if (((eventObj.isSpanned as Record<string, any>).isRight
                    || (eventObj.isSpanned as Record<string, any>).isLeft)
                    && this.parent.activeViewOptions.orientation === 'Horizontal') {
                    this.renderedEvents.push(extend({}, eventObj, null, true) as Record<string, any>);
                }
            }
        });
    }

    // eslint-disable-next-line max-len
    private renderMoreIndicatior(wrapper: HTMLElement, count: number, startDate: Date, row: number, left: number, right: number, index?: number): void {
        let endDate: Date;
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            endDate = util.addDays(util.lastDateOfMonth(new Date(startDate.getTime())), 1);
        } else {
            endDate = util.addDays(new Date(startDate.getTime()), 1);
        }
        const moreIndicator: HTMLElement = this.getMoreIndicatorElement(count, startDate, endDate);
        const rowTr: HTMLElement = this.parent.element.querySelector(`.e-content-wrap tr:nth-child(${row + 1})`) as HTMLElement;
        const top: number = rowTr.offsetTop + (this.cellHeight - this.moreIndicatorHeight);
        left = (Math.floor(left / this.cellWidth) * this.cellWidth);
        right = (Math.floor(right / this.cellWidth) * this.cellWidth);
        setStyleAttribute(moreIndicator, { 'width': this.cellWidth + 'px', 'left': left + 'px', 'right': right + 'px', 'top': top + 'px' });
        if (!isNullOrUndefined(index)) {
            moreIndicator.setAttribute('data-group-index', index.toString());
        }
        wrapper.appendChild(moreIndicator);
        EventHandler.add(moreIndicator, 'click', this.moreIndicatorClick, this);
    }

    private createEventElement(record: Record<string, any>): HTMLElement {
        const eventSubject: string = (record[this.fields.subject] || this.parent.eventSettings.fields.subject.default
            || this.parent.localeObj.getConstant('addTitle')) as string;
        const eventWrapper: HTMLElement = createElement('div', {
            className: cls.APPOINTMENT_CLASS,
            attrs: {
                'data-id': 'Appointment_' + record[this.fields.id],
                'data-guid': record.Guid as string,
                'role': 'button', 'tabindex': '0',
                'aria-readonly': this.parent.eventBase.getReadonlyAttribute(record), 'aria-selected': 'false', 'aria-grabbed': 'true',
                'aria-label': this.parent.getAnnocementString(record)
            }
        });
        if (this.cssClass) {
            addClass([eventWrapper], this.cssClass);
        }
        if (record[this.fields.isReadonly]) {
            addClass([eventWrapper], cls.READ_ONLY);
        }
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            const resIndex: number = this.getGroupIndexFromEvent(record);
            eventWrapper.setAttribute('data-group-index', resIndex.toString());
        }
        let templateElement: HTMLElement[] = [];
        const eventObj: Record<string, any> = extend({}, record, null, true) as Record<string, any>;
        if (this.parent.activeViewOptions.eventTemplate) {
            const templateId: string = this.parent.element.id + '_' + this.parent.activeViewOptions.eventTemplateName + 'eventTemplate';
            templateElement = this.parent.getAppointmentTemplate()(eventObj, this.parent, 'eventTemplate', templateId, false);
        } else {
            const locationEle: string = (record[this.fields.location] || this.parent.eventSettings.fields.location.default || '') as string;
            const subjectEle: HTMLElement = createElement('div', {
                className: cls.SUBJECT_CLASS,
                innerHTML: (eventSubject + (locationEle ? ';&nbsp' + locationEle : ''))
            });
            const startTimeEle: HTMLElement = createElement('div', {
                className: cls.APPOINTMENT_TIME + (this.parent.isAdaptive ? ' ' + cls.DISABLE_CLASS : ''),
                innerHTML: this.parent.getTimeString(eventObj[this.fields.startTime] as Date)
            });
            const endTimeEle: HTMLElement = createElement('div', {
                className: cls.APPOINTMENT_TIME + (this.parent.isAdaptive ? ' ' + cls.DISABLE_CLASS : ''),
                innerHTML: this.parent.getTimeString(eventObj[this.fields.endTime] as Date)
            });
            addClass([subjectEle], 'e-text-center');
            if (record[this.fields.isAllDay]) {
                templateElement = [subjectEle];
            } else if (!eventObj.isLeft && !eventObj.isRight) {
                templateElement = [startTimeEle, subjectEle, endTimeEle];
            } else {
                if (!eventObj.isLeft) {
                    templateElement.push(startTimeEle);
                }
                templateElement.push(subjectEle);
                if (!eventObj.isRight) {
                    templateElement.push(endTimeEle);
                }
            }
        }
        const appointmentDetails: HTMLElement = createElement('div', { className: cls.APPOINTMENT_DETAILS });
        append(templateElement, appointmentDetails);
        eventWrapper.appendChild(appointmentDetails);
        this.renderResizeHandler(eventWrapper, record.data as Record<string, any>, record[this.fields.isReadonly] as boolean);
        this.applyResourceColor(eventWrapper, eventObj, 'backgroundColor', this.groupOrder);
        return eventWrapper;
    }

    public isSpannedEvent(eventObj: Record<string, any>, month: number): Record<string, any> {
        const monthStart: Date = new Date(this.parent.selectedDate.getFullYear(), month, 1);
        const monthEnd: Date = util.addDays(new Date(this.parent.selectedDate.getFullYear(), month + 1, 0), 1);
        const eventData: Record<string, any> = extend({}, eventObj, null, true) as Record<string, any>;
        const eventStart: Date = eventData[this.fields.startTime] as Date;
        const eventEnd: Date = eventData[this.fields.endTime] as Date;
        const isSpanned: Record<string, any> = { isLeft: false, isRight: false, count: 1 };
        if (this.isResource) {
            this.updateSpannedEvents(eventObj, monthStart, monthEnd);
        }
        if (eventStart.getTime() < monthStart.getTime()) {
            eventData[this.fields.startTime] = monthStart;
            isSpanned.isLeft = true;
        }
        if (eventEnd.getTime() > monthEnd.getTime()) {
            eventData[this.fields.endTime] = monthEnd;
            isSpanned.isRight = true;
        }
        if (this.parent.activeViewOptions.group.resources.length === 0) {
            isSpanned.count = Math.ceil(((eventData[this.fields.endTime] as Date).getTime() -
                (eventData[this.fields.startTime] as Date).getTime()) / util.MS_PER_DAY);
        }
        eventData.isSpanned = isSpanned;
        if (util.resetTime(eventStart).getTime() < util.resetTime(this.parent.minDate).getTime()) {
            eventData[this.fields.startTime] = this.parent.minDate;
        }
        if (util.resetTime(eventEnd).getTime() > util.resetTime(this.parent.maxDate).getTime()) {
            eventData[this.fields.endTime] = this.parent.maxDate;
        }
        return eventData;
    }

    public getOverlapEvents(date: Date, appointments: Record<string, any>[]): Record<string, any>[] {
        const appointmentsList: Record<string, any>[] = [];
        let dateStart: number;
        let dateEnd: number;
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            const monthStart: Date = this.parent.calendarUtil.getMonthStartDate(new Date(date.getTime()));
            const monthEnd: Date = util.addDays(this.parent.calendarUtil.getMonthEndDate(new Date(date.getTime())), -1);
            dateStart = util.resetTime(new Date(monthStart.getTime())).getTime();
            dateEnd = util.resetTime(new Date(monthEnd.getTime())).getTime();
        } else {
            if (this.parent.rowAutoHeight) {
                dateStart = util.resetTime(new Date(date.getTime())).getTime();
                dateEnd = util.addDays(util.resetTime(new Date(date.getTime())), 1).getTime();
            } else {
                dateStart = dateEnd = util.resetTime(new Date(date.getTime())).getTime();
            }
        }
        for (const app of appointments as Record<string, Date>[]) {
            const appStart: Date = new Date(app[this.fields.startTime].getTime());
            const appEnd: Date = new Date(app[this.fields.endTime].getTime());
            if (this.parent.activeViewOptions.orientation === 'Vertical' &&
                this.parent.activeViewOptions.group.resources.length > 0) {
                if ((util.resetTime(appStart).getTime() >= dateStart)
                    && (util.resetTime(appEnd).getTime() <= dateEnd)) {
                    appointmentsList.push(app);
                }
            } else {
                if (this.parent.rowAutoHeight && (((util.resetTime(appStart).getTime() <= dateStart)
                    && (util.resetTime(appEnd).getTime() >= dateStart)) || (util.resetTime(appStart).getTime() >= dateStart)
                    && (util.resetTime(appEnd).getTime() <= dateEnd))) {
                    appointmentsList.push(app);
                }
                if (!this.parent.rowAutoHeight && (util.resetTime(appStart).getTime() <= dateStart)
                    && (util.resetTime(appEnd).getTime() > dateStart)) {
                    appointmentsList.push(app);
                }
            }
        }
        return appointmentsList;

    }

    private removeCellHeight(): void {
        const elementSelector: string =
            `.${cls.MONTH_HEADER_WRAPPER} tbody tr,.${cls.RESOURCE_COLUMN_TABLE_CLASS} tbody tr,.${cls.CONTENT_TABLE_CLASS} tbody tr`;
        const rows: HTMLElement[] = [].slice.call(this.element.querySelectorAll(elementSelector));
        for (const row of rows) {
            (row.firstElementChild as HTMLElement).style.height = '';
        }
    }

}
