/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Schedule event tooltip spec
 */
import { isVisible } from '@syncfusion/ej2-base';
import { Schedule, ScheduleModel, Day, Week, WorkWeek, Month, Agenda, TimelineViews } from '../../../src/schedule/index';
import { defaultData, tooltipData, resourceData } from '../base/datasource.spec';
import * as util from '../util.spec';
import { profile, inMB, getMemoryProfile } from '../../common.spec';

Schedule.Inject(Day, Week, WorkWeek, Month, Agenda, TimelineViews);

describe('Schedule event tooltip module', () => {
    beforeAll(() => {
        const isDef: (o: any) => boolean = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            // eslint-disable-next-line no-console
            console.log('Unsupported environment, window.performance.memory is unavailable');
            (this as any).skip(); //Skips test (in Chai)
            return;
        }
    });

    describe('Event tooltip on default content', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const model: ScheduleModel = {
                height: '500px',
                selectedDate: new Date(2018, 0, 1),
                currentView: 'Month',
                eventSettings: {
                    enableTooltip: true,
                    fields: { subject: { name: 'Subject', default: 'No Title' } }
                }
            };
            schObj = util.createSchedule(model, tooltipData, done);
            util.disableTooltipAnimation((schObj.eventTooltip as any).tooltipObj);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('mouse hover open tooltip - check for single day appointment', () => {
            const target: HTMLElement = [].slice.call(schObj.element.querySelectorAll('.e-appointment'))[1];
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect(tooltipEle.querySelector('.e-subject').innerHTML).toBe('Normal Event');
            expect(tooltipEle.querySelector('.e-location').innerHTML).toBe('');
            expect(tooltipEle.querySelector('.e-details').innerHTML).toBe('January 3, 2018');
            expect(tooltipEle.querySelector('.e-all-day').innerHTML).toBe('10:00 AM - 11:00 AM');
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });

        it('mouse hover open tooltip- check for single all day appointment', () => {
            const target: HTMLElement = [].slice.call(schObj.element.querySelectorAll('.e-appointment'))[2];
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect(tooltipEle.querySelector('.e-subject').innerHTML).toBe('Normal Spanned Event');
            expect(tooltipEle.querySelector('.e-details').innerHTML).toBe('Jan 4 - Jan 5, 2018');
            expect(tooltipEle.querySelector('.e-all-day').innerHTML).toBe('10:00 AM - 9:30 AM');
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });

        it('mouse hover open tooltip- check for multiple all day appointment', () => {
            const target: HTMLElement = [].slice.call(schObj.element.querySelectorAll('.e-appointment'))[0];
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect(tooltipEle.querySelector('.e-subject').innerHTML).toBe('No Title');
            expect(tooltipEle.querySelector('.e-location').innerHTML).toBe('Chennai');
            expect(tooltipEle.querySelector('.e-details').innerHTML).toBe('Dec 31, 2017 - Jan 1, 2018');
            expect(tooltipEle.querySelector('.e-all-day').innerHTML).toBe('10:00 AM - 11:30 AM');
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });

        it('mouse hover open tooltip- check for long day appointment', () => {
            const target: HTMLElement = [].slice.call(schObj.element.querySelectorAll('.e-appointment'))[4];
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect(tooltipEle.querySelector('.e-subject').innerHTML).toBe('AllDay Spanned Event');
            expect(tooltipEle.querySelector('.e-details').innerHTML).toBe('Jan 6 - Jan 8, 2018');
            expect(tooltipEle.querySelector('.e-all-day').innerHTML).toBe('10:00 AM - 10:30 AM');
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });

        it('mouse hover open tooltip- check default subject', () => {
            const target: HTMLElement = [].slice.call(schObj.element.querySelectorAll('.e-appointment'))[0];
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect(tooltipEle.querySelector('.e-subject').innerHTML).toBe('No Title');
            expect(tooltipEle.querySelector('.e-details').innerHTML).toBe('Dec 31, 2017 - Jan 1, 2018');
            expect(tooltipEle.querySelector('.e-all-day').innerHTML).toBe('10:00 AM - 11:30 AM');
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });

        it('mouse hover open and click appointment to open quickinfo window', () => {
            const target: HTMLElement = [].slice.call(schObj.element.querySelectorAll('.e-appointment'))[2];
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            target.click();
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            const eventPopup: HTMLElement = schObj.element.querySelector('.e-quick-popup-wrapper');
            expect(eventPopup).toBeTruthy();
            (<HTMLElement>eventPopup.querySelector('.e-close')).click();
        });
    });

    describe('Event tooltip on template content', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const model: ScheduleModel = {
                height: '500px', width: '500px',
                selectedDate: new Date(2017, 10, 6),
                eventSettings: {
                    enableTooltip: true,
                    tooltipTemplate: '<div class="event-template" style="padding:5px;"><div>Subject : ${Subject}</div></div>'
                }
            };
            schObj = util.createSchedule(model, defaultData, done);
            util.disableTooltipAnimation((schObj.eventTooltip as any).tooltipObj);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('mouse hover open tooltip', () => {
            const target: HTMLElement = schObj.element.querySelector('.e-appointment');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect([].slice.call(tooltipEle.querySelectorAll('.event-template')).length).toEqual(1);
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
        it('change tooltip template through set model', () => {
            schObj.eventSettings.tooltipTemplate = '<div class="event-template1" style="padding:5px;">Subject : ${Subject}</div>';
            schObj.dataBind();
            const target: HTMLElement = schObj.element.querySelector('.e-appointment');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect([].slice.call(tooltipEle.querySelectorAll('.event-template')).length).toEqual(0);
            expect([].slice.call(tooltipEle.querySelectorAll('.event-template1')).length).toEqual(1);
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
    });

    describe('Disable/Enable Event tooltip', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const model: ScheduleModel = {
                height: '500px', width: '500px',
                selectedDate: new Date(2017, 10, 6),
                eventSettings: { enableTooltip: false }
            };
            schObj = util.createSchedule(model, defaultData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('hide tooltip on mouse hover', () => {
            const target: HTMLElement = schObj.element.querySelector('.e-appointment');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
        it('show tooltip through set model on mouse hover', () => {
            schObj.eventSettings.enableTooltip = true;
            schObj.dataBind();
            util.disableTooltipAnimation((schObj.eventTooltip as any).tooltipObj);
            const target: HTMLElement = schObj.element.querySelector('.e-appointment');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
        it('hide tooltip through set model on mouse hover and checking e-control class on schedule element', () => {
            schObj.eventSettings.enableTooltip = false;
            schObj.dataBind();
            expect(schObj.element.classList.contains('e-control')).toEqual(true);
            const target: HTMLElement = schObj.element.querySelector('.e-appointment');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
    });

    describe('Resource tooltip on template content', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const model: ScheduleModel = {
                selectedDate: new Date(2017, 10, 1),
                height: '550px', width: '100%', currentView: 'TimelineDay',
                views: ['TimelineDay', 'TimelineWeek', 'TimelineWorkWeek'],
                group: {
                    byGroupID: false,
                    headerTooltipTemplate: '<div class="tWrap"><div class="rText">Name: ${getResourceName(data)}</div></div>',
                    resources: ['Rooms', 'Owners']
                },
                resources: [{
                    field: 'RoomId', title: 'Room', name: 'Rooms', allowMultiple: false,
                    dataSource: [
                        { RoomText: 'ROOM 1', Id: 1, RoomColor: '#cb6bb2' },
                        { RoomText: 'ROOM 2', Id: 2, RoomColor: '#56ca85', Expand: false }
                    ],
                    textField: 'RoomText', idField: 'Id', colorField: 'RoomColor', expandedField: 'Expand'
                }, {
                    field: 'OwnerId', title: 'Owner', name: 'Owners', allowMultiple: true,
                    dataSource: [
                        { OwnerText: 'Nancy', Id: 1, OwnerColor: '#ffaa00' },
                        { OwnerText: 'Steven', Id: 2, OwnerColor: '#f8a398' },
                        { OwnerText: 'Michael', Id: 3, OwnerColor: '#7499e1' }
                    ],
                    textField: 'OwnerText', idField: 'Id', colorField: 'OwnerColor'
                }]
            };
            schObj = util.createSchedule(model, [], done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });
        it('mouse hover open tooltip', () => {
            util.disableTooltipAnimation((schObj.eventTooltip as any).tooltipObj);
            const target: HTMLElement = schObj.element.querySelector('.e-resource-cells');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect([].slice.call(tooltipEle.querySelectorAll('.tWrap')).length).toEqual(1);
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
        it('change tooltip template through set model', () => {
            schObj.group.headerTooltipTemplate = '<div class="event-template1" style="padding:5px;">Name: ${getResourceName(data)}</div>';
            schObj.dataBind();
            const target: HTMLElement = schObj.element.querySelector('.e-resource-cells');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect([].slice.call(tooltipEle.querySelectorAll('.tWrap')).length).toEqual(0);
            expect([].slice.call(tooltipEle.querySelectorAll('.event-template1')).length).toEqual(1);
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
    });

    describe('Timeline resource header and event tooltip', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const model: ScheduleModel = {
                selectedDate: new Date(2018, 3, 1),
                height: '550px', width: '100%', currentView: 'TimelineDay',
                views: ['TimelineDay', 'TimelineWeek', 'TimelineWorkWeek'],
                group: {
                    byGroupID: false,
                    headerTooltipTemplate: '<div class="resname">Name: ${getResourceName(data)}</div>',
                    resources: ['Rooms', 'Owners']
                },
                resources: [{
                    field: 'RoomId', title: 'Room', name: 'Rooms', allowMultiple: false,
                    dataSource: [
                        { RoomText: 'ROOM 1', Id: 1, RoomColor: '#cb6bb2' },
                        { RoomText: 'ROOM 2', Id: 2, RoomColor: '#56ca85', Expand: false }
                    ],
                    textField: 'RoomText', idField: 'Id', colorField: 'RoomColor', expandedField: 'Expand'
                }, {
                    field: 'OwnerId', title: 'Owner', name: 'Owners', allowMultiple: true,
                    dataSource: [
                        { OwnerText: 'Nancy', Id: 1, OwnerColor: '#ffaa00' },
                        { OwnerText: 'Steven', Id: 2, OwnerColor: '#f8a398' },
                        { OwnerText: 'Michael', Id: 3, OwnerColor: '#7499e1' }
                    ],
                    textField: 'OwnerText', idField: 'Id', colorField: 'OwnerColor'
                }],
                eventSettings: { enableTooltip: true }
            };
            schObj = util.createSchedule(model, resourceData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });
        it('tooltip on resource header', () => {
            util.disableTooltipAnimation((schObj.eventTooltip as any).tooltipObj);
            const target: HTMLElement = schObj.element.querySelector('.e-resource-cells');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect([].slice.call(tooltipEle.querySelectorAll('.resname')).length).toEqual(1);
            expect(tooltipEle.innerHTML).toEqual('<div class="e-tip-content"><div><div class="resname">Name: ROOM 1</div></div></div>');
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
        it('tooltip on appointment', () => {
            const targets: HTMLElement[] = [].slice.call(schObj.element.querySelectorAll('.e-appointment'));
            expect(targets.length).toEqual(2);
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(targets[1], 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect(tooltipEle.querySelector('.e-subject').innerHTML).toBe('Michael');
            expect(tooltipEle.querySelector('.e-location').innerHTML).toBe('');
            expect(tooltipEle.querySelector('.e-details').innerHTML).toBe('April 1, 2018');
            expect(tooltipEle.querySelector('.e-all-day').innerHTML).toBe('10:00 AM - 12:30 PM');
            util.triggerMouseEvent(targets[1], 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
        it('view change including tooltip settings enabled', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-appointment').length).toEqual(6);
                done();
            };
            expect(schObj.element.querySelectorAll('.e-appointment').length).toEqual(2);
            schObj.currentView = 'TimelineWeek';
            schObj.dataBind();
        });
        it('tooltip on appointment after view change', () => {
            const targets: HTMLElement[] = [].slice.call(schObj.element.querySelectorAll('.e-appointment'));
            expect(targets.length).toEqual(6);
            util.triggerScrollEvent(schObj.element.querySelector('.e-content-wrap'), 0, 8500);
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
            util.triggerMouseEvent(targets[1], 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(tooltipEle.querySelector('.e-subject').innerHTML).toBe('Meeting');
            expect(tooltipEle.querySelector('.e-location').innerHTML).toBe('');
            expect(tooltipEle.querySelector('.e-details').innerHTML).toBe('April 4, 2018');
            expect(tooltipEle.querySelector('.e-all-day').innerHTML).toBe('2:00 PM - 3:30 PM');
            util.triggerMouseEvent(targets[1], 'mouseleave');
        });
    });

    describe('EJ2-48019 - Add title missing in agenda view', () => {
        let schObj: Schedule;
        const eventData: Record<string, any>[] = [{
            Id: 4,
            StartTime: new Date(2017, 9, 31),
            EndTime: new Date(2017, 10, 1),
            IsAllDay: true
        }];
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                height: '500px', selectedDate: new Date(2017, 9, 31), currentView: 'Agenda',
                eventSettings: { enableTooltip: true }
            };
            schObj = util.createSchedule(schOptions, eventData, done);
            util.disableTooltipAnimation((schObj.eventTooltip as any).tooltipObj);
        });
        afterAll(() => {
            util.destroy(schObj);
        });
        it('Checking event subject in agenda view', () => {
            const target: HTMLElement = schObj.element.querySelector('.e-appointment');
            expect(target.querySelector('.e-subject').innerHTML).toBe('Add title');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();    
            util.triggerMouseEvent(target, 'mouseover');
            const tooltipEle: HTMLElement = document.querySelector('.e-schedule-event-tooltip') as HTMLElement;
            expect(isVisible(tooltipEle)).toBe(true);
            expect(tooltipEle.querySelector('.e-subject').innerHTML).toBe('Add title');
            expect(tooltipEle.querySelector('.e-location').innerHTML).toBe('');
            expect(tooltipEle.querySelector('.e-details').innerHTML).toBe('October 31, 2017');
            expect(tooltipEle.querySelector('.e-all-day').innerHTML).toBe('All day');
            util.triggerMouseEvent(target, 'mouseleave');
            expect(document.querySelector('.e-schedule-event-tooltip')).toBeNull();
        });
    });

    it('memory leak', () => {
        profile.sample();
        const average: number = inMB(profile.averageChange);
        expect(average).toBeLessThan(10);
        const memory: number = inMB(getMemoryProfile());
        expect(memory).toBeLessThan(profile.samples[0] + 0.25);
    });
});
