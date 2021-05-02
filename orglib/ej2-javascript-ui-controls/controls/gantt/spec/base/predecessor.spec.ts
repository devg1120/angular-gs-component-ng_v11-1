/**
 * Gantt predecessor base spec
 */
import { createElement, remove } from '@syncfusion/ej2-base';
import { Gantt, DurationUnit } from '../../src/index';
import { destroyGantt, createGantt } from './gantt-util.spec';
let columnTemplateData: Object[] = [
    {
        TaskID: 1,
        TaskName: "Project Schedule",
        StartDate: new Date("02/06/2017"),
        EndDate: new Date("03/10/2017"),
        taskColor: "#F2A4A7",
        progressColor: "#DE605C",
        Children: [
            {
                TaskID: 2,
                TaskName: "Planning",
                StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"),
                taskColor: "#79BDC9",
                progressColor: "#59AAB4",
                Children: [
                    {
                        TaskID: 3, TaskName: "Plan timeline", StartDate: new Date("02/06/2017"),
                        EndDate: new Date("02/10/2017"), Duration: 6, Progress: "60", resourceId: [1]
                    },
                    {
                        TaskID: 4, TaskName: "Plan budget", StartDate: new Date("02/06/2017"),
                        EndDate: new Date("02/10/2017"), Duration: 6, Progress: "90", resourceId: [5]
                    },
                    {
                        TaskID: 5, TaskName: "Allocate resources", StartDate: new Date("02/06/2017"),
                        EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75",
                        predObj: [{ 'from': 4, 'to': 5, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        resourceId: [6]
                    },
                    {
                        TaskID: 6, TaskName: "Planning complete", StartDate: new Date("02/06/2017"),
                        EndDate: new Date("02/10/2017"), Duration: 0,
                        predObj: [{ 'from': 3, 'to': 6, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false },
                        { 'from': 4, 'to': 6, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false },
                        { 'from': 5, 'to': 6, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "3FS,4FS,5FS", resourceId: [1]
                    }
                ]
            },
            {
                TaskID: 7,
                TaskName: "Design",
                StartDate: new Date("02/13/2017"),
                EndDate: new Date("02/17/2017"),
                taskColor: "#93b8a6",
                progressColor: "#7AA992",
                Children: [
                    {
                        TaskID: 8, TaskName: "Software Specification", StartDate: new Date("02/13/2017"),
                        EndDate: new Date("02/15/2017"), Duration: 3, Progress: "60",
                        predObj: [{ 'from': 6, 'to': 8, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "6FS", resourceId: [2]
                    },
                    {
                        TaskID: 9, TaskName: "Develop prototype", StartDate: new Date("02/13/2017"),
                        EndDate: new Date("02/15/2017"), Duration: 3, Progress: "100",
                        predObj: [{ 'from': 6, 'to': 9, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "6FS", resourceId: [3]
                    },
                    {
                        TaskID: 10, TaskName: "Get approval from customer", StartDate: new Date("02/16/2017"),
                        EndDate: new Date("02/17/2017"), Duration: 2, Progress: "100",
                        predObj: [{ 'from': 9, 'to': 10, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "9FS", resourceId: [1]
                    },
                    {
                        TaskID: 11, TaskName: "Design complete", StartDate: new Date("02/17/2017"),
                        EndDate: new Date("02/17/2017"), Duration: 0,
                        predObj: [{ 'from': 10, 'to': 11, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "10FS", resourceId: [2]
                    }
                ]
            },
            {
                TaskID: 12,
                TaskName: "Implementation",
                StartDate: new Date("02/20/2017"),
                EndDate: new Date("03/02/2017"),
                taskColor: "#FAC9CD",
                progressColor: "#F2928D",
                Children: [
                    {
                        TaskID: 13, TaskName: "Development Task 1", StartDate: new Date("02/20/2017"),
                        EndDate: new Date("02/22/2017"), Duration: 3, Progress: "50",
                        predObj: [{ 'from': 11, 'to': 13, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "11FS", resourceId: [3]
                    },
                    {
                        TaskID: 14, TaskName: "Development Task 2", StartDate: new Date("02/20/2017"),
                        EndDate: new Date("02/22/2017"), Duration: 3, Progress: "50",
                        predObj: [{ 'from': 11, 'to': 14, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "11FS", resourceId: [3]
                    },
                    {
                        TaskID: 15, TaskName: "Testing", StartDate: new Date("02/23/2017"),
                        EndDate: new Date("02/25/2017"), Duration: 2, Progress: "0",
                        predObj: [{ 'from': 13, 'to': 15, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false },
                        { 'from': 14, 'to': 15, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "13FS,14FS", resourceId: [4]
                    },
                    {
                        TaskID: 16, TaskName: "Bug fix", StartDate: new Date("02/27/2017"),
                        EndDate: new Date("02/28/2017"), Duration: 2, Progress: "0",
                        predObj: [{ 'from': 15, 'to': 16, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "15FS", resourceId: [3]
                    },
                    {
                        TaskID: 17, TaskName: "Customer review meeting", StartDate: new Date("03/01/2017"),
                        EndDate: new Date("03/02/2017"), Duration: 2, Progress: "0",
                        predObj: [{ 'from': 16, 'to': 17, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "16FS", resourceId: [1]
                    },
                    {
                        TaskID: 18, TaskName: "Implemenation complete", StartDate: new Date("03/02/2017"),
                        EndDate: new Date("03/02/2017"), Duration: 0,
                        predObj: [{ 'from': 17, 'to': 18, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                        Predecessor: "17FS", resourceId: [2]
                    }

                ]
            },
            {
                TaskID: 19, TaskName: "Integration", StartDate: new Date("03/03/2017"),
                EndDate: new Date("03/05/2017"), Duration: 2, Progress: "0",
                predObj: [{ 'from': 18, 'to': 19, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                Predecessor: "18FS", resourceId: [3]
            },
            {
                TaskID: 20, TaskName: "Final Testing", StartDate: new Date("03/06/2017"),
                EndDate: new Date("03/07/2017"), Duration: 2, Progress: "0",
                predObj: [{ 'from': 19, 'to': 20, 'predecessorsType': 'FS', 'offset': 1, 'isdrawn': false }],
                Predecessor: "19FS", resourceId: [4]
            },
            {
                TaskID: 21, TaskName: "Final Delivery", StartDate: new Date("03/07/2017"),
                EndDate: new Date("03/07/2017"), Duration: 0,
                predObj: [{ 'from': 20, 'to': 21, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                Predecessor: "20FS", resourceId: [1]
            }
        ]
    }
];
let predData1: Object[] = [
    {
        TaskID: 1, TaskName: "Plan timeline", StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"), Duration: 6, Progress: "60", resourceId: [1]
    },
    {
        TaskID: 2, TaskName: "Plan budget", StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"), Duration: 6, Progress: "90", Predecessor: '1SS-2', resourceId: [5]
    },
    {
        TaskID: 3, TaskName: "Allocate resources", StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75",
        Predecessor: '1SF+1', resourceId: [6]
    },
    {
        TaskID: 4, TaskName: "Planning complete", StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"), Predecessor: '3FF+1', resourceId: [1]
    },
    {
        TaskID: 5, TaskName: "Task complete", StartDate: new Date("02/06/2017"),
        Duration: 0, Progress: "90", Predecessor: '4SS', resourceId: [5]
    }
];
let predData2: Object[] = [
    {
        TaskID: 1,
        TaskName: "Planning",
        StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"),
        taskColor: "#79BDC9",
        progressColor: "#59AAB4",
        Children: [
            {
                TaskID: 2, TaskName: "Plan timeline", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "60", resourceId: [1]
            },
            {
                TaskID: 3, TaskName: "Plan budget", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "90", resourceId: [5]
            },
            {
                TaskID: 4, TaskName: "Allocate resources", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75",
                Predecessor: '1FS', resourceId: [6]
            }]
    }];
let predData3: Object[] = [
    {
        TaskID: 1,
        TaskName: "Planning",
        StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"),
        taskColor: "#79BDC9",
        progressColor: "#59AAB4",
        Children: [
            {
                TaskID: 2, TaskName: "Plan timeline", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "60", resourceId: [1]
            },
            {
                TaskID: 3, TaskName: "Plan budget", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "90", resourceId: [5]
            },
            {
                TaskID: 4, TaskName: "Allocate resources", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75",
                Predecessor: [{ 'from': 1, 'to': 4, 'predecessorsType': 'FS', 'offset': 0, 'isdrawn': false }],
                resourceId: [6]
            }]
    }];
let predData4: Object[] = [
    {
        TaskID: 1,
        TaskName: "Planning",
        StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"),
        taskColor: "#79BDC9",
        progressColor: "#59AAB4",
        Children: [
            {
                TaskID: 2, TaskName: "Plan timeline", StartDate: new Date("02/06/2017"),
                Duration: 6, Progress: "60", resourceId: [1] // without end date
            },
            {
                TaskID: 3, TaskName: "Plan budget", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), Progress: "90", Predecessor: '2', resourceId: [5] // without duration
            },
            {
                TaskID: 4, TaskName: "Allocate resources 1",
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75",
                Predecessor: '2,3', resourceId: [6] // without start date
            }
        ]
    }];
let predData5: Object[] = [
    {
        TaskID: 1,
        TaskName: "Planning",
        StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"),
        taskColor: "#79BDC9",
        progressColor: "#59AAB4",
        Children: [
            {
                TaskID: 2, TaskName: "Allocate resources 1",
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75", resourceId: [6]
            },
            {
                TaskID: 3, TaskName: "Allocate resources 2",
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75",
                Predecessor: '2f', resourceId: [6]
            }
        ]
    }];
let predData6: Object[] = [
    {
        TaskID: 1,
        TaskName: "Planning",
        StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"),
        taskColor: "#79BDC9",
        progressColor: "#59AAB4",
        Children: [
            {
                TaskID: 2, TaskName: "Allocate resources 1",
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75", resourceId: [6]
            },
            {
                TaskID: 3, TaskName: "Allocate resources 2",
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75",
                Predecessor: '1011', resourceId: [6]
            },
            {
                TaskID: 7, TaskName: "Allocate resources 3", Progress: "75",
                resourceId: [6] // without start date, end date and duration
            },
        ]
    }];
let predData7: Object[] = [
    {
        TaskID: 1,
        TaskName: "Planning",
        StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"),
        taskColor: "#79BDC9",
        progressColor: "#59AAB4",
        Children: [
            {
                TaskID: 2, TaskName: "Allocate resources 1", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75", resourceId: [6]
            },
            {
                TaskID: 3, TaskName: "Allocate resources 2", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75", resourceId: [6]
            },
            {
                TaskID: 4, TaskName: "Allocate resources 3", Progress: "75", StartDate: new Date("02/06/2017"),
                EndDate: new Date("02/10/2017"), resourceId: [6]
            },
        ]
    }];
let predData8: Object[] = [
    {
        TaskID: 1,
        TaskName: "Planning",
        StartDate: new Date("02/06/2017"),
        EndDate: new Date("02/10/2017"),
        taskColor: "#79BDC9",
        progressColor: "#59AAB4",
        Children: [
            {
                TaskID: 2, TaskName: "Allocate resources 1",
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75", resourceId: [6]
            },
            {
                TaskID: 3, TaskName: "Allocate resources 2", Predecessor: '2FS+2.5',
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75", resourceId: [6]
            },
            {
                TaskID: 4, TaskName: "Allocate resources 3", Predecessor: '2FS+2hour',
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75", resourceId: [6]
            },
            {
                TaskID: 5, TaskName: "Allocate resources 4", Predecessor: '2FS+2minute',
                EndDate: new Date("02/10/2017"), Duration: 6, Progress: "75", resourceId: [6]
            }
        ]
    }];
describe('Gantt Predecessor Module', () => {

    describe('Gantt string predecessor', () => {
        let ganttObj: Gantt;
        beforeAll((done) => {
            ganttObj = createGantt(
                {
                    dataSource: columnTemplateData,
                    durationUnit: "Day",
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'Children',
                        dependency: 'Predecessor'
                    },
                    projectStartDate: new Date('02/02/2017'),
                    projectEndDate: new Date('03/20/2018'),
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('control initialization with predecessor', () => {
            expect(ganttObj.taskFields.dependency).toBe('Predecessor');
        });
        it('Gantt object predecessor - testing', (done) => {
            ganttObj.taskFields.dependency = 'predObj';
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
        });
        it('Predecessor type testing', (done) => {
            ganttObj.taskFields.dependency = 'Predecessor';
            ganttObj.dataSource = predData1;
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
        });
        it('Own parent as Predecessor (string) - testing', (done) => {
            ganttObj.dataSource = predData2;
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
        });
        it('Own parent as Predecessor (object) - testing', (done) => {
            ganttObj.dataSource = predData3;
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
        });
        it('Predecessor id without type - testing', (done) => {
            ganttObj.dataSource = predData4;
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
        });
        it('Invalid Predecessor type - testing', (done) => {
            ganttObj.dataSource = predData5;
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
        });
        it('Invalid Predecessor ID - not in datasource - testing', (done) => {
            ganttObj.dataSource = predData6;
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
        });
        it('Duration unit with hour - testing', (done) => {
            ganttObj.dataSource = predData8;
            ganttObj.durationUnit = 'Hour';
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
        });
        it('Duration unit with minute - testing', (done) => {
            ganttObj.dataSource = predData8;
            ganttObj.durationUnit = 'Minute';
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
        });
    });
});