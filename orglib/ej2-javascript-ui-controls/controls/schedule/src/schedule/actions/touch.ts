import { addClass, removeClass, Touch, remove, EventHandler, TapEventArgs, Browser } from '@syncfusion/ej2-base';
import { closest, isNullOrUndefined, ScrollEventArgs, SwipeEventArgs } from '@syncfusion/ej2-base';
import { Schedule } from '../base/schedule';
import { ActionEventArgs, NavigatingEventArgs, LayoutData } from '../base/interface';
import * as events from '../base/constant';
import * as cls from '../base/css-constant';
import * as util from '../base/util';

/**
 * `touch` module is used to handle touch interactions.
 */
export class ScheduleTouch {
    private element: HTMLElement;
    private currentPanel: LayoutData;
    private previousPanel: LayoutData;
    private nextPanel: LayoutData;
    private parent: Schedule;
    private touchObj: Touch;
    private timeStampStart: number;
    private isScrollTriggered: boolean;
    private touchLeftDirection: string;
    private touchRightDirection: string;
    constructor(parent: Schedule) {
        this.parent = parent;
        this.element = this.parent.element.querySelector('.' + cls.TABLE_CONTAINER_CLASS) as HTMLElement;
        this.touchObj = new Touch(this.element, {
            scroll: this.scrollHandler.bind(this),
            swipe: this.swipeHandler.bind(this),
            tapHold: this.tapHoldHandler.bind(this),
            swipeSettings: { swipeThresholdDistance: 1 }
        });
        EventHandler.add(this.element, 'transitionend', this.onTransitionEnd, this);
        this.touchLeftDirection = this.parent.enableRtl ? 'Right' : 'Left';
        this.touchRightDirection = this.parent.enableRtl ? 'Left' : 'Right';
    }

    private scrollHandler(e: ScrollEventArgs): void {
        if (this.parent.currentView === 'Agenda' || this.parent.uiStateValues.action ||
            (e.originalEvent && ((<HTMLElement>e.originalEvent.target).classList.contains(cls.APPOINTMENT_CLASS) ||
                closest(e.originalEvent.target as HTMLElement, '.' + cls.APPOINTMENT_CLASS)))) {
            return;
        }
        if (!this.timeStampStart) {
            this.timeStampStart = Date.now();
        }
        if (this.element.classList.contains(cls.TRANSLATE_CLASS)) {
            this.onTransitionEnd();
        }
        if (e.scrollDirection === 'Left' || e.scrollDirection === 'Right') {
            const args: ActionEventArgs = { requestType: 'dateNavigate', cancel: false, event: e.originalEvent };
            this.parent.trigger(events.actionBegin, args);
            if (args.cancel) {
                return;
            }
            const scrollDiv: HTMLElement = this.element.querySelector('.' + cls.CONTENT_WRAP_CLASS) as HTMLElement;
            if (scrollDiv && scrollDiv.scrollWidth > scrollDiv.clientWidth) {
                return;
            } else {
                this.isScrollTriggered = true;
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
            }
        }
        if (e.scrollDirection === this.touchLeftDirection) {
            if (!this.nextPanel) {
                this.renderPanel(cls.NEXT_PANEL_CLASS, 'next');
                this.nextPanel = {
                    element: this.parent.activeView.getPanel(),
                    selectedDate: new Date(this.parent.selectedDate.getTime())
                };
                this.setDimensions(this.nextPanel.element);
            }
            const x: number = this.parent.enableRtl ? e.distanceX : - e.distanceX;
            this.element.style.transform = 'translatex(' + (this.getTranslateX(this.element) + x) + 'px)';
        } else if (e.scrollDirection === this.touchRightDirection) {
            let prevWidth: number = 0;
            if (!this.previousPanel) {
                this.renderPanel(cls.PREVIOUS_PANEL_CLASS, 'previous');
                this.previousPanel = {
                    element: this.parent.activeView.getPanel(),
                    selectedDate: new Date(this.parent.selectedDate.getTime())
                };
                this.setDimensions(this.previousPanel.element);
                prevWidth = this.previousPanel.element.offsetWidth;
            }
            const x: number = this.parent.enableRtl ? prevWidth - e.distanceX : -  prevWidth + e.distanceX;
            this.element.style.transform = 'translatex(' + (this.getTranslateX(this.element) + x) + 'px)';
        }
    }

    private swipeHandler(e: SwipeEventArgs): void {
        if (!this.isScrollTriggered || this.parent.uiStateValues.action) { return; }
        this.isScrollTriggered = false;
        const swipeDate: Date = e.swipeDirection === 'Left' ?
            this.parent.activeView.renderDates[0] : this.parent.activeView.renderDates.slice(-1)[0];
        if ((e.swipeDirection === 'Left' && swipeDate < this.parent.maxDate) ||
            (e.swipeDirection === 'Right' && swipeDate >= this.parent.minDate)) {
            const time: number = Date.now() - this.timeStampStart;
            const offsetDist: number = (e.distanceX * (Browser.isDevice ? 6 : 1.66));
            if (offsetDist > time || (e.distanceX > (this.parent.element.offsetWidth / 2))) {
                this.swapPanels(e.swipeDirection);
                if (offsetDist > time && (e.distanceX > (this.parent.element.offsetWidth / 2))) {
                    this.element.style.transitionDuration = ((offsetDist / time) / 10) + 's';
                }
                this.confirmSwipe(e.swipeDirection);
            } else {
                this.cancelSwipe();
            }
            const args: ActionEventArgs = { requestType: 'dateNavigate', cancel: false, event: e.originalEvent };
            this.parent.trigger(events.actionComplete, args);
        } else {
            this.cancelSwipe();
        }
        this.timeStampStart = null;
    }

    private tapHoldHandler(e: TapEventArgs): void {
        const target: Element = closest((e.originalEvent.target as Element), '.' + cls.APPOINTMENT_CLASS);
        if (!isNullOrUndefined(target) && this.parent.isAdaptive) {
            this.parent.quickPopup.tapHoldEventPopup(e.originalEvent);
            return;
        }
    }

    private renderPanel(clsName: string, nextPrevType: string): void {
        if (!this.currentPanel) {
            this.currentPanel = {
                element: this.parent.activeView.getPanel(),
                selectedDate: new Date(this.parent.selectedDate.getTime())
            };
            this.setDimensions(this.currentPanel.element);
        } else {
            this.parent.setProperties({ selectedDate: this.currentPanel.selectedDate }, true);
        }
        this.parent.setProperties({ selectedDate: this.parent.activeView.getNextPreviousDate(nextPrevType) }, true);
        if (this.parent.headerModule) {
            this.parent.headerModule.setCalendarDate(this.parent.selectedDate);
        }
        this.parent.activeView.getRenderDates();
        this.parent.activeView.renderLayout(clsName);
    }

    private swapPanels(direction: string): void {
        if (direction === this.touchLeftDirection) {
            const temp: LayoutData = this.nextPanel;
            this.nextPanel = this.currentPanel;
            this.currentPanel = temp;
        } else {
            const temp: LayoutData = this.previousPanel;
            this.previousPanel = this.currentPanel;
            this.currentPanel = temp;
        }
    }

    private confirmSwipe(swipeDirection: string): void {
        const previousDate: Date = swipeDirection === this.touchLeftDirection ?
            this.nextPanel.selectedDate : this.previousPanel.selectedDate;
        const args: NavigatingEventArgs = {
            action: 'date', cancel: false, previousDate: previousDate, currentDate: this.currentPanel.selectedDate
        };
        this.parent.trigger(events.navigating, args, (navArgs: NavigatingEventArgs) => {
            if (navArgs.cancel) {
                this.swapPanels(swipeDirection);
                this.cancelSwipe();
            } else {
                this.parent.activeView.setPanel(this.currentPanel.element);
                this.parent.setProperties({ selectedDate: this.currentPanel.selectedDate }, true);
                let translateX: number;
                if (this.parent.enableRtl) {
                    translateX = swipeDirection === this.touchLeftDirection ?
                        (this.previousPanel ? this.previousPanel.element.offsetLeft : this.currentPanel.element.offsetWidth) : 0;
                } else {
                    translateX = swipeDirection === this.touchLeftDirection ? -this.currentPanel.element.offsetLeft : 0;
                }
                addClass([this.element], cls.TRANSLATE_CLASS);
                this.element.style.transform = 'translatex(' + translateX + 'px)';
                if (this.parent.headerModule) {
                    this.parent.headerModule.updateDateRange(this.parent.activeView.getDateRangeText());
                }
                this.parent.renderTemplates();
                this.parent.renderModule.refreshDataManager();
            }
        });
    }

    private cancelSwipe(): void {
        this.parent.activeView.setPanel(this.currentPanel.element);
        this.parent.setProperties({ selectedDate: this.currentPanel.selectedDate }, true);
        this.parent.activeView.getRenderDates();
        this.parent.activeView.generateColumnLevels();
        addClass([this.element], cls.TRANSLATE_CLASS);
        const prevWidth: number = this.previousPanel ? this.previousPanel.element.offsetWidth : 0;
        this.element.style.transform = 'translatex(' + (this.parent.enableRtl ? prevWidth : -this.currentPanel.element.offsetLeft) + 'px)';
    }

    private onTransitionEnd(): void {
        removeClass([this.element], cls.TRANSLATE_CLASS);
        this.element.style.transitionDuration = '';
        this.element.style.transform = '';
        if (this.previousPanel) {
            remove(this.previousPanel.element);
            this.previousPanel = null;
            removeClass([this.currentPanel.element], cls.PREVIOUS_PANEL_CLASS);
            addClass([this.currentPanel.element], cls.CURRENT_PANEL_CLASS);
        }
        if (this.nextPanel) {
            remove(this.nextPanel.element);
            this.nextPanel = null;
            removeClass([this.currentPanel.element], cls.NEXT_PANEL_CLASS);
            addClass([this.currentPanel.element], cls.CURRENT_PANEL_CLASS);
        }
        this.currentPanel = null;
        this.parent.activeView.getPanel().style.width = '';
    }

    private getTranslateX(element: HTMLElement): number {
        const style: CSSStyleDeclaration = window.getComputedStyle(element);
        return new WebKitCSSMatrix(style.webkitTransform).m41;
    }

    private setDimensions(element: HTMLElement): void {
        element.style.width = (this.parent.element.clientWidth) + 'px';
    }

    public resetValues(): void {
        this.currentPanel = null;
        this.previousPanel = null;
        this.nextPanel = null;
        this.timeStampStart = null;
        this.element.style.transform = '';
        util.removeChildren(this.element);
        removeClass([this.element], cls.TRANSLATE_CLASS);
    }

    public destroy(): void {
        this.touchObj.destroy();
        EventHandler.remove(this.element, 'transitionend', this.onTransitionEnd);
        this.resetValues();
    }

}
