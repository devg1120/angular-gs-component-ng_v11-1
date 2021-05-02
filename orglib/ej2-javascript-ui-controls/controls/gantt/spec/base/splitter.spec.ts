/**
 * Gantt Splitter spec
 */
import { Gantt } from '../../src/index';
import { baselineData } from '../base/data-source.spec';
import { createGantt, destroyGantt, triggerMouseEvent } from '../base/gantt-util.spec';
import { ResizeEventArgs, ResizingEventArgs } from '@syncfusion/ej2-layouts';
import { ISplitterResizedEventArgs } from '../../src/gantt/base/interface';

describe('Gantt splitter support', () => {
    describe('Gantt splitter action', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: baselineData,
                    taskFields: {
                        id: 'TaskId',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'Children'
                    },
                    projectStartDate: new Date('10/15/2017'),
                    projectEndDate: new Date('12/30/2017'),
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Perform Splitter Action', () => {
            ganttObj.splitterResizeStart = (args: ResizeEventArgs) => {
                expect(args['name']).toBe('splitterResizeStart');
            };
            ganttObj.splitterResizing = (args: ResizingEventArgs) => {
                expect(args['name']).toBe('splitterResizing');
            };
            ganttObj.splitterResized = (args: ISplitterResizedEventArgs) => {
                args.cancel = true;
                expect(args['name']).toBe('splitterResized');
            };
            ganttObj.dataBind();
            let splitterIcon: HTMLElement = ganttObj.element.querySelector('.e-split-bar') as HTMLElement;
            triggerMouseEvent(splitterIcon, 'mousedown');
            triggerMouseEvent(splitterIcon, 'mousemove',100,0);
            triggerMouseEvent(splitterIcon, 'mouseup');
        });

        it('Setsplitter Position by public method', () => {
            ganttObj.splitterResized = (args) => {
                args.cancel = false;
            }
            ganttObj.dataBind();
            ganttObj.setSplitterPosition('50%','position');
            expect(ganttObj.splitterModule.splitterObject.paneSettings[0].size).toBe('50%');
        });

        it('Splitter Settings at Initial Load', () => {
            ganttObj.splitterSettings.position = '70';
            ganttObj.dataBind();
            expect(ganttObj.splitterModule.splitterObject.paneSettings[0].size).toBe('70%');
        });

        it('Splitter Settings grid view', () => {
            ganttObj.splitterSettings.view = 'Grid';
            ganttObj.dataBind();
            expect(ganttObj.splitterModule.splitterObject.paneSettings[0].size).toBe('100%');
        });

        it('Splitter Settings chart view', () => {
            ganttObj.splitterSettings.view = 'Chart';
            ganttObj.dataBind();
            expect(ganttObj.splitterModule.splitterObject.paneSettings[0].size).toBe('0%');
        });
    });

    describe('Schedule mode', () => {
        let ganttObj: Gantt;

        beforeAll((done: Function) => {
            ganttObj = createGantt({
                dataSource: baselineData,
                taskFields: {
                    id: 'TaskId',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'Children'
                },
                splitterSettings: {
                    columnIndex: 3
                },
                projectStartDate: new Date('10/15/2017'),
                projectEndDate: new Date('12/30/2017'),
            }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Vertical scrollbar hidden issue while setting columnIndex', () => {
            ganttObj.splitterSettings.position = '50%';
            ganttObj.dataBind();
            expect(ganttObj.splitterModule.splitterObject.paneSettings[0].size).toBe('50%');
        });
    });
});