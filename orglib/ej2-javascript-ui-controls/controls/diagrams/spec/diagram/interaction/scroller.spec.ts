import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { ZoomOptions } from '../../../src/diagram/objects/interface/interfaces';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { profile, inMB, getMemoryProfile } from '../../../spec/common.spec';
import { MouseEvents } from './mouseevents.spec';

/**
 * Selector spec
 */
describe('Diagram Control', () => {

    describe('Scroller', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagramik' });
            ele.style.width = '100%';
            document.body.appendChild(ele);
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 400, offsetY: 400 };
            let node2: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 600, offsetY: 400 };
            diagram = new Diagram({ width: '100%', height: '600px', nodes: [node, node2] });
            diagram.appendTo('#diagramik');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Moving nodes out of view - negative', (done: Function) => {
            diagram.nodes[0].offsetX = -500;
            diagram.nodes[0].offsetY = -500;
            diagram.dataBind();
            document.getElementById("diagramik").scrollLeft = 0;
            document.getElementById("diagramik").scrollTop = 0;
            diagram.updateScrollOffset();
            done();
        });

        it('Moving nodes into view - negative', (done: Function) => {
            diagram.nodes[0].offsetX = 400;
            diagram.nodes[0].offsetY = 400;
            diagram.dataBind();
            document.getElementById("diagramik").scrollLeft = 550;
            document.getElementById("diagramik").scrollTop = 550;
            diagram.updateScrollOffset();
            done();
        });

        it('Moving nodes out of view - positive', (done: Function) => {
            diagram.nodes[1].offsetX = 1500;
            diagram.nodes[1].offsetY = 1000;
            diagram.dataBind();
            document.getElementById("diagramik").scrollLeft = 874;
            document.getElementById("diagramik").scrollTop = 470;
            diagram.updateScrollOffset();
            done();
        });

        it('Moving nodes into view - positive', (done: Function) => {
            diagram.nodes[1].offsetX = 600;
            diagram.nodes[1].offsetY = 400;
            diagram.dataBind();
            document.getElementById("diagramik").scrollLeft = 0;
            document.getElementById("diagramik").scrollTop = 0;
            diagram.updateScrollOffset();
            done();
        });


        it('Moving nodes out of view - invalid - negative', (done: Function) => {
            diagram.nodes[0].offsetX = 200;
            diagram.nodes[0].offsetY = 200;
            diagram.dataBind();
            document.getElementById("diagramik").scrollLeft = 80;
            document.getElementById("diagramik").scrollTop = 80;
            diagram.updateScrollOffset();
            done();
        });

        it('Moving nodes out of view - invalid', (done: Function) => {
            diagram.nodes[1].offsetX = 1400;
            diagram.nodes[1].offsetY = 800;
            document.getElementById("diagramik").scrollLeft = 1500;
            document.getElementById("diagramik").scrollTop = 800;
            diagram.updateScrollOffset();
            done();
        });
        it('memory leak', () => {
            profile.sample();
            let average: any = inMB(profile.averageChange)
            //Check average change in memory samples to not be over 10MB
            expect(average).toBeLessThan(10);
            let memory: any = inMB(getMemoryProfile())
            //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
            expect(memory).toBeLessThan(profile.samples[0] + 0.25);
        })
    });

    describe('Diagram padding left and top', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_padding_tl' });
            ele.style.width = '100%';
            document.body.appendChild(ele);
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 50, offsetY: 50 };
            diagram = new Diagram({
                width: '400px',
                height: '400px',
                nodes: [node],
                scrollSettings: { padding: { left: 50, top: 50 } }
            });
            diagram.appendTo('#diagram_padding_tl');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('checking Diagram padding left and top', (done: Function) => {
            let diagramContent: HTMLElement = document.getElementById(diagram.element.id + 'content');
            expect(diagramContent.scrollLeft).toBe(50);
            expect(diagramContent.scrollTop).toBe(50);
            done();
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

    describe('Diagram padding Right and Bottom', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_padding_rb' });
            ele.style.width = '100%';
            document.body.appendChild(ele);
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 350, offsetY: 350 };
            diagram = new Diagram({
                width: '400px',
                height: '400px',
                nodes: [node],
                scrollSettings: { padding: { right: 50, bottom: 50 } }
            });
            diagram.appendTo('#diagram_padding_rb');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('checking Diagram padding Right and Bottom', (done: Function) => {
            let diagramContent: HTMLElement = document.getElementById(diagram.element.id + 'content');
            expect(diagramContent.scrollHeight).toBe(450);
            expect(diagramContent.scrollWidth).toBe(450);
            done();
        });
    });


    describe('Fit to page is not working for zoom greater than 1', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_padding_rb' });
            ele.style.width = '100%';
            ele.style.width = '100%';
            document.body.appendChild(ele);
            let nodes: NodeModel[] = [
                {
                    id: 'node1', width: 200, height: 200, offsetX: 100, offsetY: 100, shape: {
                        type: "Basic",
                        shape: "Ellipse",
                    },
                },
                {
                    id: 'node2', width: 200, height: 200, offsetX: 100, offsetY: 600, shape: {
                        type: "Basic",
                        shape: "Ellipse",
                    },
                },
                {
                    id: 'node3', width: 200, height: 200, offsetX: 600, offsetY: 100, shape: {
                        type: "Basic",
                        shape: "Ellipse",
                    },
                },
                {
                    id: 'node4', width: 200, height: 200, offsetX: 600, offsetY: 600, shape: {
                        type: "Basic",
                        shape: "Ellipse",
                    },
                },
            ];
            diagram = new Diagram({
                width: '100%',
                height: '969px', nodes: nodes,
            });
            diagram.appendTo('#diagram_padding_rb');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('Fit to page is not working for zoom greater than 1', (done: Function) => {

            diagram.zoom(2, { x: 600, y: 600 })
            diagram.fitToPage({
                mode: "Page",
                region: "Content",
            });
            expect(diagram.scroller.horizontalOffset == 25 && (diagram.scroller.verticalOffset == 132.5|| diagram.scroller.verticalOffset == 134.5)).toBe(true);

            diagram.fitToPage({
                mode: "Page",
                region: "Content",
            });
            expect(diagram.scroller.horizontalOffset == 25 && (diagram.scroller.verticalOffset == 132.5|| diagram.scroller.verticalOffset == 134.5)).toBe(true);
            done();
        });
    });
    describe('Scroller issue', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagramVerticalScrollerIssue' });
            ele.style.width = '500px';
            document.body.appendChild(ele);
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 400, offsetY: 400 };
            let node2: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 600, offsetY: 400 };
            diagram = new Diagram({
                width: '500px', height: '500px',
                connectors: [{
                    id: 'connector1',
                    type: 'Straight',
                    sourcePoint: { x: 100, y: 300 },
                    targetPoint: { x: 200, y: 400 },
                }], nodes: [
                    {
                        id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 100,
                        annotations: [{ content: 'Default Shape' }]
                    },
                    {
                        id: 'node2', width: 100, height: 100, offsetX: 300, offsetY: 100,
                        shape: {
                            type: 'Path', data: 'M540.3643,137.9336L546.7973,159.7016L570.3633,159.7296L550.7723,171.9366L558.9053,194.9966L540.3643,' +
                                '179.4996L521.8223,194.9966L529.9553,171.9366L510.3633,159.7296L533.9313,159.7016L540.3643,137.9336z'
                        },
                        annotations: [{ content: 'Path Element' }]
                    }
                ],
                pageSettings: {
                    background: { color: 'transparent' }
                },
                scrollSettings: {
                    canAutoScroll: true,                                         // enable auto scroll as element moves
                    scrollLimit: 'Diagram',                                         // Diagram scroll limit with in canvas  
                    autoScrollBorder: { left: 50, right: 50, bottom: 50, top: 50 } // specify the maximum distance between the object and diagram edge to trigger autoscroll
                }
            });
            diagram.appendTo('#diagramVerticalScrollerIssue');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('CR issue(EJ2-42921) - Vertical Scroll bar appears while scroll the diagram', (done: Function) => {
            console.log('CR issue(EJ2-42921) - Vertical Scroll bar appears while scroll the diagram');
            let mouseEvents: MouseEvents = new MouseEvents();
            console.log("diagram.scrollSettings.verticalOffset:"+diagram.scrollSettings.verticalOffset);
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id+'content');
            var center = { x: 300, y: 300 };
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseWheelEvent(diagramCanvas, 500, 850, false);
            console.log("diagram.scrollSettings.verticalOffset:"+diagram.scrollSettings.verticalOffset);
            expect(diagram.scrollSettings.verticalOffset == 0).toBe(true);
            done();
        });
    });
    describe('Scroller issue after zooming the diagram', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagramVerticalScrollerIssue' });
            document.body.appendChild(ele);
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 400, offsetY: 400 };
            let node2: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 600, offsetY: 400 };
            diagram = new Diagram({
                width: '800px', height: '500px',
                pageSettings: {
                    height: 500,
                    width: 500,
                    orientation: "Landscape",
                    showPageBreaks: true
                },
                rulerSettings: { showRulers: true },
            });
            diagram.appendTo('#diagramVerticalScrollerIssue');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('CR issue(EJ2-43276) - When zoom out the diagram ruler value not update properly', (done: Function) => {
            diagram.pageSettings.width = 1080;
            diagram.pageSettings.height = 1920;
            diagram.dataBind();

            let zoomout: ZoomOptions = { type: "ZoomOut", zoomFactor: 0.2 };
            diagram.zoomTo(zoomout);
            diagram.zoomTo(zoomout);
            diagram.zoomTo(zoomout);
            diagram.zoomTo(zoomout);

            diagram.zoomTo(zoomout);
            diagram.zoomTo(zoomout);
            diagram.zoomTo(zoomout);
            diagram.zoomTo(zoomout);

            console.log("Scroller issue after zooming the diagram");
            
            let diagramCanvas = document.getElementById(diagram.element.id + 'content');
            let mouseEvents = new MouseEvents();
            mouseEvents.clickEvent(diagramCanvas, 300+diagram.element.offsetLeft, 300+diagram.element.offsetTop);
            
            // Scroll the diagram untill the top end
            console.log("diagram.scrollSettings.verticalOffset:"+diagram.scrollSettings.verticalOffset);
            expect(diagram.scrollSettings.verticalOffset==191.86).toBe(true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, true);
            expect(diagram.scrollSettings.verticalOffset==248.82651748971188).toBe(true);
            console.log("diagram.scrollSettings.verticalOffset:"+diagram.scrollSettings.verticalOffset);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, true);
            expect(diagram.scrollSettings.verticalOffset==248.82651748971188).toBe(true);
            console.log("diagram.scrollSettings.verticalOffset:"+diagram.scrollSettings.verticalOffset);

            // Scroll the diagram untill the bottom end
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            expect(diagram.scrollSettings.verticalOffset==0).toBe(true);
            console.log("diagram.scrollSettings.verticalOffset:"+diagram.scrollSettings.verticalOffset);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, false);
            expect(diagram.scrollSettings.verticalOffset==0).toBe(true);
            console.log("diagram.scrollSettings.verticalOffset:"+diagram.scrollSettings.verticalOffset);

            // Try to scroll the diagram to top after the vertical offset is 0
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, false, true);
            expect(diagram.scrollSettings.verticalOffset==0).toBe(true);
            console.log("diagram.scrollSettings.verticalOffset:"+diagram.scrollSettings.verticalOffset);
            
            
            expect(diagram.scrollSettings.horizontalOffset==306.97).toBe(true);
            console.log("diagram.scrollSettings.horizontalOffset:"+diagram.scrollSettings.horizontalOffset);
            // Scroll the diagram untill the left side end
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, true);
            expect(diagram.scrollSettings.horizontalOffset==353.4693644261544).toBe(true);
            console.log("diagram.scrollSettings.horizontalOffset:"+diagram.scrollSettings.horizontalOffset);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, true);
            expect(diagram.scrollSettings.horizontalOffset==353.4693644261544).toBe(true);
            console.log("diagram.scrollSettings.horizontalOffset:"+diagram.scrollSettings.horizontalOffset);

            // Scroll the diagram untill the right side end
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            console.log("diagram.scrollSettings.horizontalOffset:"+diagram.scrollSettings.horizontalOffset);
            expect(Math.abs(diagram.scrollSettings.horizontalOffset)==0).toBe(true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);
            console.log("diagram.scrollSettings.horizontalOffset:"+diagram.scrollSettings.horizontalOffset);
            expect(Math.abs(diagram.scrollSettings.horizontalOffset)==0).toBe(true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, false);

            console.log("diagram.scrollSettings.horizontalOffset:"+diagram.scrollSettings.horizontalOffset);
            expect(Math.abs(diagram.scrollSettings.horizontalOffset)==0).toBe(true);

            // Try to scroll the diagram to left after the horizontal offset is 0
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, true);
            mouseEvents.mouseWheelEvent(diagramCanvas, 300, 300, false, true, true);
            
            console.log("diagram.scrollSettings.horizontalOffset:"+diagram.scrollSettings.horizontalOffset);
            expect(Math.abs(diagram.scrollSettings.horizontalOffset)==0).toBe(true);

            done();
        });
    });
});