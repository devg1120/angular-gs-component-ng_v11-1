/* eslint-disable @typescript-eslint/no-explicit-any */
import { L10n, isNullOrUndefined, createElement, remove, closest, addClass, removeClass, extend } from '@syncfusion/ej2-base';
import { Toolbar, ItemModel, ClickEventArgs } from '@syncfusion/ej2-navigations';
import { Calendar, CalendarView, ChangedEventArgs, NavigatedEventArgs } from '@syncfusion/ej2-calendars';
import { Popup } from '@syncfusion/ej2-popups';
import { Schedule } from '../base/schedule';
import { EJ2Instance, ActionEventArgs, CellClickEventArgs } from '../base/interface';
import * as events from '../base/constant';
import * as util from '../base/util';
import * as cls from '../base/css-constant';
import { View } from '../base/type';
import { ViewsModel } from '../models/models';

/**
 * Header module
 */
export class HeaderRenderer {
    public element: HTMLElement;
    private parent: Schedule;
    private l10n: L10n;
    private toolbarObj: Toolbar;
    private headerPopup: Popup;
    private headerCalendar: Calendar;

    constructor(parent: Schedule) {
        this.parent = parent;
        this.l10n = this.parent.localeObj;
        this.renderHeader();
        this.addEventListener();
    }

    public addEventListener(): void {
        this.parent.on(events.documentClick, this.closeHeaderPopup, this);
    }

    public removeEventListener(): void {
        this.parent.off(events.documentClick, this.closeHeaderPopup);
    }

    private closeHeaderPopup(e: { event: Event }): void {
        const closestEle: Element = closest(e.event.target as HTMLElement, '.e-date-range,.e-header-popup,.e-day,.e-selected');
        let closestPop: Element = closest(e.event.target as HTMLElement, '.e-hor-nav,.e-toolbar-pop');
        let contentWrap: HTMLElement = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS);
        if (this.parent.isAdaptive) {
            if (!isNullOrUndefined(closestPop) && (closestPop.classList.contains('e-toolbar-pop') ||
                closestPop.classList.contains('e-hor-nav')) && !(closestPop.classList.contains('e-hor-nav') &&
                this.element.querySelector('.e-toolbar-pop').classList.contains(cls.POPUP_OPEN)) ) {
                addClass([contentWrap], cls.SCROLL_HIDDEN);
            } else {
                removeClass([contentWrap], cls.SCROLL_HIDDEN);
                let popupEle: HTMLElement = this.element.querySelector('.e-toolbar-pop') as HTMLElement;
                if (!isNullOrUndefined(popupEle)) {
                    let popupObj: Popup = (popupEle as EJ2Instance).ej2_instances[0] as Popup;
                    if (popupObj && !(!isNullOrUndefined(closestPop) && closestPop.classList.contains('e-hor-nav') &&
                        popupEle.classList.contains(cls.POPUP_OPEN))) {
                        popupObj.hide();
                    }
                }
            }
        }
        if (!isNullOrUndefined(closestEle)) {
            return;
        }
        this.hideHeaderPopup();
    }

    public hideHeaderPopup(): void {
        if (this.headerPopup) {
            this.headerPopup.hide();
        }
    }

    public renderHeader(): void {
        this.element = createElement('div', { className: cls.TOOLBAR_CONTAINER });
        const toolbarEle: Element = createElement('div', { className: cls.HEADER_TOOLBAR });
        this.element.appendChild(toolbarEle);
        this.parent.element.insertBefore(this.element, this.parent.element.firstElementChild);
        this.renderToolbar();
    }

    private renderToolbar(): void {
        const items: ItemModel[] = this.getItems();
        this.parent.trigger(events.actionBegin, { requestType: 'toolbarItemRendering', items: items }, (args: ActionEventArgs) => {
            this.toolbarObj = new Toolbar({
                items: args.items,
                overflowMode: 'Popup',
                clicked: this.toolbarClickHandler.bind(this),
                enableRtl: this.parent.enableRtl,
                locale: this.parent.locale
            });
            this.toolbarObj.appendTo(this.parent.element.querySelector('.' + cls.HEADER_TOOLBAR) as HTMLElement);
            const prevNavEle: HTMLElement = this.toolbarObj.element.querySelector('.e-prev') as HTMLElement;
            if (prevNavEle) {
                (prevNavEle.firstElementChild as Element).setAttribute('title', this.l10n.getConstant('previous'));
            }
            const nextNavEle: HTMLElement = this.toolbarObj.element.querySelector('.e-next') as HTMLElement;
            if (nextNavEle) {
                (nextNavEle.firstElementChild as Element).setAttribute('title', this.l10n.getConstant('next'));
            }
            this.updateActiveView();
            this.parent.trigger(events.actionComplete, { requestType: 'toolBarItemRendered', items: this.toolbarObj.items });
        });
    }

    public updateItems(): void {
        if (this.toolbarObj) {
            const items: ItemModel[] = this.getItems();
            this.parent.trigger(events.actionBegin, { requestType: 'toolbarItemRendering', items: items }, (args: ActionEventArgs) => {
                this.toolbarObj.items = args.items;
                this.toolbarObj.dataBind();
                this.parent.trigger(events.actionComplete, { requestType: 'toolBarItemRendered', items: this.toolbarObj.items });
            });
        }
    }

    public getPopUpRelativeElement(): HTMLElement {
        if (this.parent.isAdaptive) {
            return this.toolbarObj.element;
        }
        return this.element.querySelector('.e-date-range') as HTMLElement;
    }

    public setDayOfWeek(index: number): void {
        if (this.headerCalendar) {
            this.headerCalendar.firstDayOfWeek = index;
            this.headerCalendar.dataBind();
        }
    }

    public setCalendarDate(date: Date): void {
        if (this.headerCalendar) {
            this.headerCalendar.value = date;
            this.headerCalendar.dataBind();
        }
    }

    public setCalendarMinMaxDate(): void {
        if (this.headerCalendar) {
            this.headerCalendar.min = this.parent.minDate;
            this.headerCalendar.max = this.parent.maxDate;
            this.headerCalendar.dataBind();
        }
    }

    public getCalendarView(): CalendarView {
        if (['Month', 'MonthAgenda', 'TimelineMonth'].indexOf(this.parent.currentView) > -1) {
            return 'Year';
        } else if (['Year', 'TimelineYear'].indexOf(this.parent.currentView) > -1) {
            return 'Decade';
        } else {
            return 'Month';
        }
    }

    public setCalendarView(): void {
        if (this.headerCalendar) {
            const calendarView: CalendarView = this.getCalendarView();
            this.headerCalendar.depth = calendarView;
            this.headerCalendar.start = calendarView;
            this.headerCalendar.refresh();
        }
    }

    public updateActiveView(): void {
        const selEle: HTMLElement[] = [].slice.call(this.toolbarObj.element.querySelectorAll('.e-views'));
        removeClass(selEle, ['e-active-view']);
        if (selEle.length > 0 && selEle[this.parent.viewIndex]) {
            addClass(<Element[]>[selEle[this.parent.viewIndex]], ['e-active-view']);
        }
    }

    public updateDateRange(text: string): void {
        const selEle: Element = this.toolbarObj.element.querySelector('.e-date-range');
        if (selEle) {
            selEle.setAttribute('aria-label', text);
            selEle.querySelector('.e-tbar-btn-text').innerHTML = text;
            this.toolbarObj.refreshOverflow();
        }
    }

    private getDateRangeText(): string {
        const dateString: string = this.parent.globalize.formatDate(this.parent.selectedDate, {
            format: 'MMMM y', calendar: this.parent.getCalendarMode()
        });
        return util.capitalizeFirstWord(dateString, 'single');
    }

    private getItems(): ItemModel[] {
        const items: ItemModel[] = [];
        items.push({
            align: 'Left', prefixIcon: 'e-icon-prev', tooltipText: 'Previous', overflow: 'Show',
            cssClass: 'e-prev', htmlAttributes: { 'aria-label': 'previous period', 'role': 'navigation' }
        });
        items.push({
            align: 'Left', prefixIcon: 'e-icon-next', tooltipText: 'Next', overflow: 'Show',
            cssClass: 'e-next', htmlAttributes: { 'aria-label': 'next period', 'role': 'navigation' }
        });
        items.push({
            align: 'Left', text: this.getDateRangeText(), suffixIcon: 'e-icon-down-arrow', cssClass: 'e-date-range',
            overflow: 'Show',
            htmlAttributes: { 'aria-atomic': 'true', 'aria-live': 'assertive', 'aria-label': 'title', 'role': 'navigation' }
        });
        if (this.parent.isAdaptive) {
            items.push({
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-add',
                text: this.l10n.getConstant('newEvent'), cssClass: 'e-add', overflow: 'Show'
            });
            items.push({
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-today',
                text: this.l10n.getConstant('today'), cssClass: 'e-today', overflow: 'Show'
            });
        } else {
            items.push({
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-day',
                text: this.l10n.getConstant('today'), cssClass: 'e-today', overflow: 'Show'
            });
            if (this.parent.views.length > 1) {
                items.push({ align: 'Right', type: 'Separator', cssClass: 'e-schedule-seperator' });
            }
        }
        if (this.parent.views.length > 1) {
            for (const item of this.parent.views) {
                items.push(this.getItemObject(item));
            }
        }
        return items;
    }

    private getItemObject(item: View | ViewsModel): ItemModel {
        let viewName: string;
        let displayName: string;
        if (typeof (item) === 'string') {
            viewName = item.toLowerCase();
            displayName = null;
        } else {
            viewName = item.option.toLowerCase();
            displayName = item.displayName;
        }
        let view: ItemModel;
        let orientationClass: string;
        switch (viewName) {
        case 'day':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-day',
                text: displayName || this.l10n.getConstant('day'), cssClass: 'e-views e-day'
            };
            break;
        case 'week':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-week',
                text: displayName || this.l10n.getConstant('week'), cssClass: 'e-views e-week'
            };
            break;
        case 'workweek':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-workweek',
                text: displayName || this.l10n.getConstant('workWeek'), cssClass: 'e-views e-work-week'
            };
            break;
        case 'month':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-month',
                text: displayName || this.l10n.getConstant('month'), cssClass: 'e-views e-month'
            };
            break;
        case 'year':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-year',
                text: displayName || this.l10n.getConstant('year'), cssClass: 'e-views e-year'
            };
            break;
        case 'agenda':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-agenda',
                text: displayName || this.l10n.getConstant('agenda'), cssClass: 'e-views e-agenda'
            };
            break;
        case 'monthagenda':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-month-agenda',
                text: displayName || this.l10n.getConstant('monthAgenda'), cssClass: 'e-views e-month-agenda'
            };
            break;
        case 'timelineday':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-timeline-day',
                text: displayName || this.l10n.getConstant('timelineDay'), cssClass: 'e-views e-timeline-day'
            };
            break;
        case 'timelineweek':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-timeline-week',
                text: displayName || this.l10n.getConstant('timelineWeek'), cssClass: 'e-views e-timeline-week'
            };
            break;
        case 'timelineworkweek':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-timeline-workweek',
                text: displayName || this.l10n.getConstant('timelineWorkWeek'), cssClass: 'e-views e-timeline-work-week'
            };
            break;
        case 'timelinemonth':
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-timeline-month',
                text: displayName || this.l10n.getConstant('timelineMonth'), cssClass: 'e-views e-timeline-month'
            };
            break;
        case 'timelineyear':
            orientationClass = ((item as ViewsModel).orientation === 'Vertical') ? 'vertical' : 'horizontal';
            view = {
                align: 'Right', showAlwaysInPopup: this.parent.isAdaptive, prefixIcon: 'e-icon-timeline-year-' + orientationClass,
                text: displayName || this.l10n.getConstant('timelineYear'), cssClass: 'e-views e-timeline-year'
            };
            break;
        }
        return view;
    }

    private renderHeaderPopup(): void {
        const headerPopupEle: HTMLElement = createElement('div', { className: cls.HEADER_POPUP_CLASS });
        const headerCalendarEle: HTMLElement = createElement('div', { className: cls.HEADER_CALENDAR_CLASS });
        headerPopupEle.appendChild(headerCalendarEle);
        this.element.appendChild(headerPopupEle);
        this.headerPopup = new Popup(headerPopupEle, {
            actionOnScroll: 'hide',
            targetType: 'relative',
            relateTo: this.getPopUpRelativeElement(),
            position: { X: 'left', Y: 'bottom' },
            enableRtl: this.parent.enableRtl
        });
        const calendarView: CalendarView = this.getCalendarView();
        this.headerCalendar = new Calendar({
            value: this.parent.selectedDate,
            min: this.parent.minDate,
            max: this.parent.maxDate,
            firstDayOfWeek: this.parent.activeViewOptions.firstDayOfWeek,
            enableRtl: this.parent.enableRtl,
            locale: this.parent.locale,
            depth: calendarView,
            start: calendarView,
            calendarMode: this.parent.calendarMode,
            change: this.calendarChange.bind(this)
        });
        this.setCalendarTimezone();
        this.headerCalendar.appendTo(headerCalendarEle);
        this.headerPopup.hide();
    }

    private calendarChange(args: ChangedEventArgs & NavigatedEventArgs): void {
        if (args.value.getTime() !== this.parent.selectedDate.getTime()) {
            const calendarDate: Date = util.resetTime(new Date(args.value));
            this.parent.changeDate(calendarDate);
        }
        this.headerPopup.hide();
    }

    public setCalendarTimezone(): void {
        if (this.headerCalendar) {
            (this.headerCalendar as any).timezone = this.parent.timezone || this.parent.tzModule.getLocalTimezoneName();
        }
    }

    private calculateViewIndex(args: ClickEventArgs): number {
        const target: Element = closest(args.originalEvent.target as HTMLElement, '.e-views');
        const views: Element[] = [].slice.call(this.element.querySelectorAll('.e-views'));
        return views.indexOf(target);
    }

    private toolbarClickHandler(args: ClickEventArgs): void {
        if (!args.item) {
            return;
        }
        const strClass: string = args.item.cssClass.replace('e-views ', '');
        let data: CellClickEventArgs;
        let isSameTime: boolean;
        switch (strClass) {
        case 'e-date-range':
            if (!this.headerPopup) {
                this.renderHeaderPopup();
            }
            if (this.headerPopup.element.classList.contains(cls.POPUP_OPEN)) {
                this.headerPopup.hide();
            } else {
                this.headerPopup.show();
            }
            break;
        case 'e-day':
            this.parent.changeView('Day', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-week':
            this.parent.changeView('Week', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-work-week':
            this.parent.changeView('WorkWeek', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-month':
            this.parent.changeView('Month', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-year':
            this.parent.changeView('Year', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-agenda':
            this.parent.changeView('Agenda', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-month-agenda':
            this.parent.changeView('MonthAgenda', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-timeline-day':
            this.parent.changeView('TimelineDay', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-timeline-week':
            this.parent.changeView('TimelineWeek', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-timeline-work-week':
            this.parent.changeView('TimelineWorkWeek', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-timeline-month':
            this.parent.changeView('TimelineMonth', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-timeline-year':
            this.parent.changeView('TimelineYear', args.originalEvent, undefined, this.calculateViewIndex(args));
            break;
        case 'e-today':
            if (!this.parent.isSelectedDate(util.resetTime(this.parent.getCurrentTime()))) {
                this.parent.changeDate(util.resetTime(this.parent.getCurrentTime()), args.originalEvent);
            }
            break;
        case 'e-prev':
            this.parent.changeDate(this.parent.activeView.getNextPreviousDate('previous'), args.originalEvent);
            break;
        case 'e-next':
            this.parent.changeDate(this.parent.activeView.getNextPreviousDate('next'), args.originalEvent);
            break;
        case 'e-add':
            isSameTime = this.parent.activeCellsData.startTime.getTime() === this.parent.activeCellsData.endTime.getTime();
            if (this.parent.activeCellsData && !isSameTime) {
                data = this.parent.activeCellsData;
            } else {
                const interval: number = this.parent.activeViewOptions.timeScale.interval;
                const slotCount: number = this.parent.activeViewOptions.timeScale.slotCount;
                const msInterval: number = (interval * util.MS_PER_MINUTE) / slotCount;
                const startTime: Date = new Date(this.parent.selectedDate.getTime());
                const currentTime: Date = this.parent.getCurrentTime();
                startTime.setHours(currentTime.getHours(), (Math.round(startTime.getMinutes() / msInterval) * msInterval), 0);
                const endTime: Date = new Date(new Date(startTime.getTime()).setMilliseconds(startTime.getMilliseconds() + msInterval));
                data = { startTime: startTime, endTime: endTime, isAllDay: false };
            }
            this.parent.eventWindow.openEditor(<Record<string, any>>extend(data, { cancel: false, event: args.originalEvent }), 'Add');
            break;
        }
        if (isNullOrUndefined(this.toolbarObj)) {
            return;
        }
        const toolbarPopUp: HTMLElement = <HTMLElement>this.toolbarObj.element.querySelector('.e-toolbar-pop');
        if (toolbarPopUp && args.item.type !== 'Input') {
            ((toolbarPopUp as EJ2Instance).ej2_instances[0] as Popup).hide({ name: 'SlideUp', duration: 100 });
        }
    }

    public getHeaderElement(): HTMLElement {
        return this.toolbarObj.element;
    }

    public updateHeaderItems(classType: string): void {
        const prevNavEle: HTMLElement = this.toolbarObj.element.querySelector('.e-prev') as HTMLElement;
        const nextNavEle: HTMLElement = this.toolbarObj.element.querySelector('.e-next') as HTMLElement;
        const dateRangeEle: HTMLElement = this.toolbarObj.element.querySelector('.e-date-range') as HTMLElement;
        if (prevNavEle) {
            if (classType === 'add') {
                addClass([prevNavEle], cls.HIDDEN_CLASS);
            } else {
                removeClass([prevNavEle], cls.HIDDEN_CLASS);
            }
        }
        if (nextNavEle) {
            if (classType === 'add') {
                addClass([nextNavEle], cls.HIDDEN_CLASS);
            } else {
                removeClass([nextNavEle], cls.HIDDEN_CLASS);
            }
        }
        if (dateRangeEle) {
            if (classType === 'add') {
                addClass([dateRangeEle], cls.TEXT_ELLIPSIS);
            } else {
                removeClass([dateRangeEle], cls.TEXT_ELLIPSIS);
            }
        }
    }

    public previousNextIconHandler(): void {
        const dates: Date[] = (this.parent.currentView === 'Agenda' ?
            [this.parent.getCurrentViewDates()[0]] : this.parent.getCurrentViewDates()) as Date[];
        const prevNavEle: HTMLElement = this.toolbarObj.element.querySelector('.' + cls.PREVIOUS_DATE_CLASS);
        const nextNavEle: HTMLElement = this.toolbarObj.element.querySelector('.' + cls.NEXT_DATE_CLASS);
        let firstDate: Date = new Date(dates[0].getTime());
        let lastDate: Date = new Date(dates[dates.length - 1].getTime());
        if (this.parent.currentView === 'WorkWeek' || this.parent.currentView === 'TimelineWorkWeek') {
            firstDate = util.getWeekFirstDate(util.resetTime(this.parent.selectedDate), this.parent.firstDayOfWeek);
            lastDate = util.addDays(firstDate, 7 * this.parent.activeViewOptions.interval);
        }
        if (this.parent.currentView === 'Month') {
            firstDate = util.firstDateOfMonth(this.parent.selectedDate);
            const lastMonthFirstDate: Date = util.addMonths(firstDate, this.parent.activeViewOptions.interval - 1);
            lastDate = util.lastDateOfMonth(lastMonthFirstDate);
        }
        if (!isNullOrUndefined(prevNavEle)) {
            this.toolbarObj.enableItems(prevNavEle, firstDate > this.parent.minDate);
        }
        if (!isNullOrUndefined(nextNavEle)) {
            this.toolbarObj.enableItems(nextNavEle, lastDate < this.parent.maxDate);
        }
        this.setCalendarMinMaxDate();
    }

    protected getModuleName(): string {
        return 'headerbar';
    }

    public destroy(): void {
        if (this.headerPopup && !this.headerPopup.isDestroyed) {
            this.headerPopup.destroy();
            this.headerPopup = null;
        }
        if (this.headerCalendar && !this.headerCalendar.isDestroyed) {
            this.headerCalendar.destroy();
            this.headerCalendar = null;
        }
        if (this.toolbarObj && !this.toolbarObj.isDestroyed) {
            this.toolbarObj.destroy();
            this.removeEventListener();
            remove(this.element);
            this.toolbarObj = null;
        }
    }

}
