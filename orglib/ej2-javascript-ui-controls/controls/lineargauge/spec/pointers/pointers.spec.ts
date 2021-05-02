/**
 * Linear gauge spec document
 */
import { Browser, EventHandler, createElement, EmitType } from '@syncfusion/ej2-base';
import { ILoadedEventArgs, ILoadEventArgs } from '../../src/linear-gauge/model/interface';
import { LinearGauge } from '../../src/linear-gauge/linear-gauge';
import  {profile , inMB, getMemoryProfile} from '../common.spec';
import { GaugeLocation } from '../../src';

describe('Linear gauge control', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });
    describe('linear gauge direct properties', () => {
        let gauge: LinearGauge;
        let element: HTMLElement;
        let svg: HTMLElement;
        beforeAll((): void => {
            element = createElement('div', { id: 'container' });
            document.body.appendChild(element);
            gauge = new LinearGauge();
            gauge.appendTo('#container');
        });
        afterAll((): void => {
            element.remove();
        });

        it('checking with marker pointer', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.refresh();
        });

        it('checking with bar pointer', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_BarPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].type = 'Bar';
            gauge.refresh();
        });

        it('checking with marker pointer in Triangle', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Triangle';
            gauge.refresh();
        });

        it('checking with marker pointer in Diamond', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].markerType = 'Diamond';
            gauge.refresh();
        });

        it('checking with marker pointer in Rectangle', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].markerType = 'Rectangle';
            gauge.refresh();
        });

        it('checking with marker pointer in InvertedTriangle', (done:Function): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
                done();
            };
            gauge.axes[0].pointers[0].markerType = 'InvertedTriangle';
            gauge.refresh();
        });

        it('checking with marker pointer in Circle', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].markerType = 'Circle';
            gauge.refresh();
        });

        it('checking with marker pointer in InvertedTriangle', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].markerType = 'Image';
            gauge.axes[0].pointers[0].imageUrl = 'http://js.syncfusion.com/demos/web/content/images/chart/sun_annotation.png';
            gauge.refresh();
        });

        it('checking with marker pointer animation', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].value = 50;
            gauge.axes[0].pointers[0].animationDuration = 2000;
            gauge.refresh();
        });

        it('checking with marker pointer animation', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_BarPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].type = 'Bar';
            gauge.axes[0].pointers[0].value = 70;
            gauge.axes[0].pointers[0].animationDuration = 4000;
            gauge.refresh();
        });
        it('checking with marker pointer with databind', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_BarPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].value = 50;
            gauge.dataBind();
        });


        it('checking with marker pointer fill', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg !== null).toBe(true);
            };
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Circle';
            gauge.axes[0].pointers[0].color = 'red';
            gauge.axes[0].pointers[0].value = 70;
            gauge.refresh();
        });

        it('checking with marker pointer stroke', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg !== null).toBe(true);
            };
            gauge.axes[0].pointers[0].border.color = 'green';
            gauge.refresh();
        });

        it('checking with marker pointer stoke width', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg !== null).toBe(true);
            };
            gauge.axes[0].pointers[0].border.width = 5;
            gauge.refresh();
        });

        it('checking with marker pointer placement center', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Center';
            gauge.refresh();
        });

        it('checking with marker pointer placement far', (done:Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
                done();
            };
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Far';
            gauge.refresh();
        });

        it('checking with marker pointer placement as center in opposed position', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Center';
            gauge.refresh();
        });

        it('checking with marker pointer placement far in opposed position', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Far';
            gauge.refresh();
        });

        it('checking with poineter placement as near', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Near';
            gauge.refresh();
        });

        it('checking with poineter placement as Center', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Center';
            gauge.refresh();
        });

        it('checking with poineter placement as Center', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Far';
            gauge.refresh();
        });


        it('checking with poineter placement as near in opposed position', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.orientation = 'Horizontal';
            gauge.axes[0].opposedPosition = true;
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Near';
            gauge.refresh();
        });

        it('checking with poineter placement as Center in opposed position', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.orientation = 'Horizontal';
            gauge.axes[0].opposedPosition = true;
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Center';
            gauge.refresh();
        });

        it('checking with poineter placement as Center in opposed position', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.orientation = 'Horizontal';
            gauge.axes[0].opposedPosition = true;
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].placement = 'Far';
            gauge.refresh();
        });

        it('checking with multiple marker pointers', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_1');
                expect(svg != null).toBe(true);
            };
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers = [{
                value: 50
            }, {
                value: 80
            }
            ];
            gauge.refresh();
            gauge.axes[0].pointers = [{}];
        });

        // it('checking with bar into the container in vertical orientation', () => {
        //     gauge.loaded = (args: ILoadedEventArgs): void => {
        //         svg = document.getElementById('container_AxisIndex_0_BarPointer_0');
        //         //expect(svg != null).toBe(true);
        //     };
        //     gauge.container.width = 40;
        //     gauge.orientation = 'Vertical';
        //     gauge.axes[0].pointers[0].type = 'Bar';
        //     gauge.refresh();
        // });

        // it('checking with bar in vertical orientation', () => {
        //     gauge.loaded = (args: ILoadedEventArgs): void => {
        //         svg = document.getElementById('container_AxisIndex_0_BarPointer_0');
        //         expect(svg != null).toBe(true);
        //     };
        //     gauge.container.width = 0;
        //     gauge.orientation = 'Vertical';
        //     gauge.axes[0].opposedPosition = true;
        //     gauge.axes[0].pointers[0].type = 'Bar';
        //     gauge.refresh();
        // });


        it('checking with bar into the container in horizontal orientation', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_BarPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.container.width = 0;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].opposedPosition = false;
            gauge.axes[0].pointers[0].type = 'Bar';
            gauge.refresh();
        });


        it('checking with pointer circle in near position', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = false;
            gauge.axes[0].pointers[0].placement = 'Near';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Circle';
            gauge.refresh();
        });

        it('checking with pointer circle in axis opposed position', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.axes[0].pointers[0].placement = 'Near';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Circle';
            gauge.refresh();
        });

        it('checking with pointer circle in center placement', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.axes[0].pointers[0].placement = 'Center';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Circle';
            gauge.refresh();
        });

        it('checking with pointer circle in far placement', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = false;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Far';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Circle';
            gauge.refresh();
        });

        it('checking with pointer circle in horizontal orientation', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = false;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Far';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Circle';
            gauge.refresh();
        });

        it('checking with pointer diamond in horizontal orientation', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = false;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Far';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Diamond';
            gauge.refresh();
        });

        it('checking with pointer diamond in vertical orientation', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.orientation = 'Vertical';
            gauge.axes[0].pointers[0].placement = 'Near';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Diamond';
            gauge.refresh();
        });

        it('checking with diamond pointer in horizontal orientation in near plcement', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = false;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Near';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Diamond';
            gauge.refresh();
        });

        it('checking with diamond pointer in near plcement', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Near';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Diamond';
            gauge.refresh();
        });

        it('checking with diamond pointer in center plcement', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Center';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Diamond';
            gauge.refresh();
        });

        it('checking with rectangle pointer in near plcement', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Center';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Rectangle';
            gauge.refresh();
        });

        it('checking with rectangle pointer in vertical orientation', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.orientation = 'Vertical';
            gauge.axes[0].pointers[0].placement = 'Near';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Rectangle';
            gauge.refresh();
        });

        it('checking with rectangle pointer in far placement', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = false;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Far';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Rectangle';
            gauge.refresh();
        });

        it('checking with rectangle pointer in center placement', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
                expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = false;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Center';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Rectangle';
            gauge.refresh();
        });

        it('checking with rectangle pointer in axis opposed position', (): void => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                svg = document.getElementById('container_AxisIndex_0_MarkerPointer_0');
              //  expect(svg != null).toBe(true);
            };
            gauge.axes[0].opposedPosition = true;
            gauge.orientation = 'Horizontal';
            gauge.axes[0].pointers[0].placement = 'Near';
            gauge.axes[0].pointers[0].type = 'Marker';
            gauge.axes[0].pointers[0].markerType = 'Rectangle';
            gauge.refresh();
        });
    });
 describe('Axis pointer position based on position property', () => {
        let gauge: LinearGauge;
        let ele: HTMLElement;
        let direction: string;
        let boundingRect: ClientRect;
        let boundingRect1: ClientRect;
        let svg: HTMLElement;
        let value: string[] | string | number;
        let value1: string[] | string | number;
        beforeAll((): void => {
            ele = createElement('div', { id: 'gauge' });
            document.body.appendChild(ele);
            gauge = new LinearGauge({
                orientation : "Horizontal",
                axes: [{    
                 pointers: [
                     {
                         value: 50,
                         markerType: 'Triangle',
                         position: 'Inside',
                         type: 'Marker'
                     },
                     {
                         type: 'Bar',
                         value: 30,
                         position: 'Inside'
                     }
                 ]
                }]
            },
                '#gauge'
            );
        });
        afterAll((): void => {
            gauge.destroy();
            ele.remove();
        });
        it('Checking pointer position as inside', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '384.5' || value[1] == '379' || value[1] == '381.5').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('204');
                done();
            };
            gauge.refresh();
        });
        it('Checking pointer position as inside with opposed', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '384.5' || value[1] == '379' || value[1] == '381.5').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('226');
                done();
            };
            gauge.axes[0].opposedPosition = true;
            gauge.refresh();
        });
        it('Checking pointer position as outside', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '384.5' || value[1] == '379' || value[1] == '381.5').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('226');
                done();
            };
            gauge.axes[0].opposedPosition = false;
            gauge.axes[0].pointers[0].position = 'Outside';
            gauge.axes[0].pointers[1].position = 'Outside';
            gauge.refresh();
        });
        it('Checking pointer position as outside and opposed', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '384.5' || value[1] == '379' || value[1] == '381.5').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('204');
                done();
            };
            gauge.axes[0].opposedPosition = true;
            gauge.refresh();
        });
        it('Checking pointer position as cross', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '384.5' || value[1] == '379' || value[1] == '381.5').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('215');
                done();
            };
            gauge.axes[0].opposedPosition = false;
            gauge.axes[0].pointers[0].position = 'Cross';
            gauge.axes[0].pointers[1].position = 'Cross';
            gauge.refresh();
        });
        it('Checking pointer position as inside with vertical orientation', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '383.5' || value[1] == '378' || value[1] == '380.5').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('289.5');
                done();
            };
            gauge.orientation = 'Vertical';
            gauge.axes[0].pointers[0].position = 'Inside';
            gauge.axes[0].pointers[1].position = 'Inside';
            gauge.refresh();
        });
        it('Checking pointer position as inside with opposed with vertical orientation', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '385.5' || value[1] == '380' || value[1] == '382.5').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('289.5');
                done();
            };
            gauge.axes[0].opposedPosition = true;
        
            gauge.refresh();
        });
        it('Checking pointer position as outside with vertical orientation', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '385.5' || value[1] == '380' || value[1] == '382.5').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('289.5');
                done();
            };
            gauge.axes[0].opposedPosition = false;
            gauge.axes[0].pointers[0].position = 'Outside';
            gauge.axes[0].pointers[1].position = 'Outside';
            gauge.refresh();
        });
        it('Checking pointer position as outside and opposed with vertical orientation', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '383.5' || value[1] == '378' || value[1] == '380.5').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('289.5');
                done();
            };
            gauge.axes[0].opposedPosition = true;
            gauge.refresh();
        });
        it('Checking pointer position as cross with vertical orientation', (done: Function) => {
            gauge.loaded = (args: ILoadedEventArgs): void => {
                let svgNode: NodeListOf<Element> = document.querySelectorAll('path#gauge_AxisIndex_0_MarkerPointer_0');
                value = svgNode[0].getAttribute('d').split(' ');
                expect(value[1] == '336.05' || value[1] == '331.1' || value[1] == '333.35').toBe(true);
                let svgNode1: NodeListOf<Element> = document.querySelectorAll('rect#gauge_AxisIndex_0_BarPointer_1');
                expect(svgNode1[0].getAttribute('y')).toBe('289.5');
                done();
            };
            gauge.axes[0].opposedPosition = false;
            gauge.axes[0].pointers[0].offset = '10%';
            gauge.axes[0].pointers[1].offset = '10%';
            gauge.axes[0].pointers[0].position = 'Cross';
            gauge.axes[0].pointers[1].position = 'Cross';
            gauge.refresh();
        });
 });
    it('memory leak', () => {     
        profile.sample();
        let average: any = inMB(profile.averageChange)
        //Check average change in memory samples to not be over 10MB
        expect(average).toBeLessThan(10);
        let memory: any = inMB(getMemoryProfile())
        //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
        expect(memory).toBeLessThan(profile.samples[0] + 0.25);
    });
});