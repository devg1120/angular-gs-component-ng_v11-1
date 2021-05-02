import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { ConnectorModel } from '../../../src/diagram/objects/connector-model';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { DiagramScroller } from '../../../src/diagram/interaction/scroller';
import { Rect } from '../../../src/index';
import { PrintAndExport } from '../../../src/diagram/print-settings';
import { PageSettingsModel, BackgroundModel } from '../../../src/diagram/diagram/page-settings-model';
import { IExportOptions } from '../../../src/diagram/objects/interface/interfaces';
import { DiagramModel } from '../../../src/diagram/index';
import { UndoRedo } from '../../../src/diagram/objects/undo-redo';
import { profile, inMB, getMemoryProfile } from '../../../spec/common.spec';
Diagram.Inject(PrintAndExport, UndoRedo);

/**
 * Print and Export Spec
 */
describe('Print and export', () => {

    describe('Print and Export Settings', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let pageSettings: PageSettingsModel = {};
        let background: BackgroundModel = {};

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 300, y: 400 }, targetPoint: { x: 500, y: 500 }
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: 100, offsetY: 100,
                annotations: [{ content: 'Node1', height: 50, width: 50 }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 80, height: 130, offsetX: 200, offsetY: 200,
                annotations: [{ content: 'Node2', height: 50, width: 50 }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 100, height: 75, offsetX: 300, offsetY: 350,
                annotations: [{ content: 'Node3', height: 50, width: 50 }]
            };
            background.color = 'yellow';
            pageSettings.multiplePage = true;
            pageSettings.background = background;
            pageSettings.height = 300; pageSettings.width = 300;
            pageSettings.orientation = 'Portrait';
            diagram = new Diagram({
                width: '1200px', height: '600px', nodes: [node, node2, node3], connectors: [connector],
                mode: 'Canvas'
            });
            diagram.appendTo('#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Export settings with bounds and margin - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.margin = { left: 10, right: 10, top: 10, bottom: 10 };
            let rect: Rect = new Rect();
            rect.x = 5; rect.y = 5; rect.height = 500; rect.width = 500;
            options.bounds = rect;
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });

        it('Export settings with default functions with margin as zero - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.margin = { left: null, right: null, top: null, bottom: null };
            options.region = 'PageSettings';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export settings with default functions with bounds as zero - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.bounds = new Rect();
            options.region = 'PageSettings';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });

        it('Export settings with mode svg and format SVG - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            
            options.format = 'SVG';
            diagram.mode = 'Canvas';
            options.region = 'PageSettings';
            options.margin = { left: 5, right: 5, top: 5, bottom: 5 };
            options.multiplePage = false;
            options.pageHeight = 300;
            options.pageWidth = 300;
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export settings with mode Data and format SVG', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'SVG';
            options.region = 'PageSettings';
            options.multiplePage = false;
            options.margin = { left: 5, top: 5, bottom: 5, right: 5 };
            options.pageHeight = 300;
            options.pageWidth = 300;
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with mode PNG and multiple page false - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            diagram.mode = 'Canvas';
            diagram.dataBind();
            options.region = 'PageSettings';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Fromat PNG and Multiple page true - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'Content';
            options.multiplePage = true;
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Fromat PNG and Multiple page true with page height and page width - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            diagram.pageSettings = pageSettings;
            diagram.dataBind();
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Fromat PNG and Multiple page true with page height and width as null - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            diagram.pageSettings = pageSettings;
            diagram.pageSettings.height = null;
            diagram.pageSettings.width = null;
            diagram.dataBind();
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Fromat PNG and Multiple page false with page height and page width - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            diagram.pageSettings = pageSettings;
            diagram.pageSettings.multiplePage = false;
            diagram.pageSettings.height = 300;
            diagram.pageSettings.width = 400;
            diagram.dataBind();
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Fromat PNG and Multiple page false with page height ,width as null- Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            diagram.pageSettings = pageSettings;
            diagram.pageSettings.multiplePage = false;
            diagram.pageSettings.height = null;
            diagram.pageSettings.width = null;
            diagram.dataBind();
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Fromat PNG and Multiple page true with page height,width(Landscape) - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            options.pageOrientation = 'Landscape';
            options.pageHeight = 300;
            options.pageWidth = 500;
            diagram.pageSettings = pageSettings;
            diagram.dataBind();
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Format PNG and Multiple page true with Strectch - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            options.pageHeight = 300;
            options.pageWidth = 500;
            options.stretch = 'Stretch';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Format PNG and Multiple page true with Meet - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            options.pageHeight = 300;
            options.pageWidth = 500;
            options.stretch = 'Meet';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Format PNG and Multiple page true with Slice - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            options.pageHeight = 500;
            options.pageWidth = 300;
            options.pageOrientation = 'Landscape';
            options.stretch = 'Slice';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Format PNG and Multiple page true with Slice (Portrait) - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            options.pageHeight = 300;
            options.pageWidth = 500;
            options.pageOrientation = 'Portrait';
            options.stretch = 'Meet';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Print and Export Settings with Format PNG and Multiple page true with Slice (Portrait) - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.multiplePage = true;
            options.pageHeight = 300;
            options.pageWidth = 500;
            options.pageOrientation = 'Portrait';
            options.stretch = 'Meet';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });

        it('Export Settings with Fromat PNG and mode Data', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });

        it('Export Settings with Format PNG and mode Data with background image with color', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            let background: BackgroundModel = {};
            background.source = 'https://www.w3schools.com/images/w3schools_green.jpg';
            background.scale = 'Meet';
            background.align = 'XMinYMin';
            background.color = 'grey';
            diagram.pageSettings.background = background;
            diagram.dataBind();
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });

        it('Export Settings with Format PNG and mode Data with background image with color,scale slice', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            let background: BackgroundModel = {};
            background.source = 'https://www.w3schools.com/images/w3schools_green.jpg';
            background.scale = 'Slice';
            background.align = 'XMinYMin';
            background.color = 'grey';
            diagram.pageSettings.background = background;
            diagram.dataBind();
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Format PNG and mode Data with background image with no color', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            let background: BackgroundModel = {};
            background.source = 'https://www.w3schools.com/images/w3schools_green.jpg';
            background.scale = 'Meet';
            background.align = 'XMinYMin';
            background.color = 'none';
            diagram.pageSettings.background = background;
            diagram.dataBind();
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export Settings with Format PNG and mode Data with  image(Slice)', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            let background: BackgroundModel = {};
            background.source = 'https://www.w3schools.com/images/w3schools_green.jpg';
            background.scale = 'Slice';
            background.align = 'None';
            diagram.pageSettings.background = background;
            diagram.dataBind();
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export settings with default functions - Default', (done: Function) => {
            let options: IExportOptions = {};
            options.margin = { left: 10, right: 10, top: 10, bottom: 10 };
            let rect: Rect = new Rect();
            rect.x = 5; rect.y = 5; rect.height = 500; rect.width = 500;
            options.bounds = rect;
            options.region = 'PageSettings';
            options.mode = 'Data';
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export settings without Margin - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.fileName = 'export';
            options.multiplePage = true;
            options.pageHeight = 300;
            options.pageWidth = 300;
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export settings without Margin - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            options.margin = { left: 5, right: 5, top: 5, bottom: 5 };
            options.fileName = 'export';
            options.multiplePage = true;
            options.pageHeight = 300;
            options.pageWidth = 300;
            let svg: string | SVGElement;
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
        it('Export settings without Margin - Download', (done: Function) => {
            let rect: Rect = new Rect();
            rect.x = null;
            rect.y = null;
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'SVG';
            options.bounds = rect;
            options.region = 'PageSettings';
            options.fileName = 'export';
            let data: SVGElement | string;
            data = diagram.exportDiagram(options);
            expect(data).not.toBeNull();
            done();
        });
        it('undo redo the background color', (done: Function) => {
            diagram.pageSettings.background.color = 'black';
            diagram.dataBind();
            expect(diagram.pageSettings.background.color).toBe('black');
            done();
            diagram.undo();
            expect(diagram.pageSettings.background.color).toBe('none');
            done();
        });
        it('Export settings with Stretch', (done: Function) => {
            let rect: Rect = new Rect();
            rect.x = null;
            rect.y = null;
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.bounds = rect;
            options.region = 'PageSettings';
            options.fileName = 'export';
            options.pageHeight = 500;
            options.pageWidth = 500;
            options.pageOrientation = 'Landscape';
            options.multiplePage = false;
            let data: SVGElement | string;
            data = diagram.exportDiagram(options);
            expect(data).not.toBeNull();
            done();
        });
    });

    describe('Print and Export Settings', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let pageSettings: PageSettingsModel = {};
        let background: BackgroundModel = {};

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 300, y: 400 }, targetPoint: { x: 500, y: 500 }
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: 100, offsetY: 100,
                annotations: [{ content: 'Node1', height: 50, width: 50 }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 80, height: 130, offsetX: 200, offsetY: 200,
                annotations: [{ content: 'Node2', height: 50, width: 50 }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 100, height: 75, offsetX: 300, offsetY: 350,
                annotations: [{ content: 'Node3', height: 50, width: 50 }]
            };
            background.color = 'none';
            pageSettings.multiplePage = true;
            pageSettings.background = background;
            pageSettings.height = 300; pageSettings.width = 300;
            pageSettings.orientation = 'Portrait';
            diagram = new Diagram({
                width: '1200px', height: '600px', nodes: [node, node2, node3], connectors: [connector]
            });
            diagram.appendTo('#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Export settings With diagram mode SVG and format SVG - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'SVG';
            options.region = 'PageSettings';
            options.fileName = 'export';
            let data: SVGElement | string;
            data = diagram.exportDiagram(options);
            expect(data).not.toBeNull();
            done();
        });

        it('Print Settings with Fromat PNG and mode Data', (done: Function) => {
            let options: IExportOptions = {};
            options.multiplePage = true;
            options.pageHeight = 500;
            options.pageWidth = 300;
            options.pageOrientation = 'Landscape';
            options.region = 'PageSettings';
            diagram.print(options);
            done();
        });
        it('Print Settings with mode Data', (done: Function) => {
            let options: IExportOptions = {};
            options.multiplePage = false;
            options.pageHeight = 300;
            options.pageWidth = 500;
            options.pageOrientation = 'Portrait';
            options.region = 'PageSettings';
            diagram.print(options);
            done();
        });
        it('Print Settings with mode Data with page Width', (done: Function) => {
            let options: IExportOptions = {};
            options.multiplePage = true;
            options.pageWidth = 500;
            options.pageOrientation = 'Portrait';
            options.region = 'PageSettings';
            diagram.print(options);
            let svg: string | SVGElement = null;
            done();
        });
        it('Print Settings with mode Data with page Height', (done: Function) => {
            let options: IExportOptions = {};
            options.multiplePage = true;
            options.pageHeight = 500;
            options.pageOrientation = 'Portrait';
            options.region = 'PageSettings';
            diagram.print(options);
            done();
        });
        it('Print Settings with mode Data with page Width without Format', (done: Function) => {
            let options: IExportOptions = {};
            options.multiplePage = true;
            options.pageWidth = 500;
            options.format = 'SVG';
            options.pageOrientation = 'Portrait';
            options.region = 'PageSettings';
            diagram.print(options);
            done();
        });
        it('Print Settings with mode Data with page Height without format', (done: Function) => {
            let options: IExportOptions = {};
            options.multiplePage = true;
            options.pageHeight = 500;
            options.format = 'SVG';
            options.pageOrientation = 'Portrait';
            options.region = 'PageSettings';
            diagram.print(options);
            done();
        });
        it('Exported data returns same png format for all other format', (done: Function) => {
			let options: IExportOptions = {};
            options.mode = 'Data';
            options.region = 'Content';
            options.fileName = 'export';
            options.format = 'JPG';
            let image: string|SVGElement = diagram.exportDiagram(options);
            expect(image).not.toBeNull();
            done();
        });
    });
    describe('Print and Export Settings', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let pageSettings: PageSettingsModel = {};
        let background: BackgroundModel = {};

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 300, y: 400 }, targetPoint: { x: 500, y: 500 }
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: 100, offsetY: 100,
                annotations: [{ content: 'Node1', height: 50, width: 50 }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 80, height: 130, offsetX: 200, offsetY: 200,
                annotations: [{ content: 'Node2', height: 50, width: 50 }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 100, height: 75, offsetX: 300, offsetY: 350,
                annotations: [{ content: 'Node3', height: 50, width: 50 }]
            };
            background.color = 'yellow';
            pageSettings.multiplePage = true;
            pageSettings.background = background;
            pageSettings.height = 300; pageSettings.width = 300;
            pageSettings.orientation = 'Portrait';
            diagram = new Diagram({
                width: '1200px', height: '600px'
            } as DiagramModel);
            diagram.appendTo('#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('No elements in diagram - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'SVG';
            options.region = 'PageSettings';
            options.fileName = 'export';
            let data: SVGElement | string;
            data = diagram.exportDiagram(options);
            done();
        });

        it('Page Settings in diagram - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'SVG';
            options.region = 'PageSettings';
            diagram.pageSettings = pageSettings;
            options.fileName = 'export';
            let data: SVGElement | string;
            data = diagram.exportDiagram(options);
            done();
        });

        it('Page Settings color as none in diagram - Download', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            diagram.pageSettings = pageSettings;
            diagram.pageSettings.background.color = 'none';
            options.fileName = 'export';
            let data: SVGElement | string;
            data = diagram.exportDiagram(options);
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
    describe('tesing the native node export and print', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let pageSettings: PageSettingsModel = {};
        let background: BackgroundModel = {};

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 300, y: 400 }, targetPoint: { x: 500, y: 500 }
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: 100, offsetY: 100,
                annotations: [{ content: 'Node1', height: 50, width: 50 }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 80, height: 130, offsetX: 200, offsetY: 200,
                annotations: [{ content: 'Node2', height: 50, width: 50 }]
            };
            let node3: NodeModel = {
                id: 'nativenode', width: 150, height: 100, offsetX: 700, offsetY: 300, style: { fill: 'none' },
                shape: {
                    type: 'Native', content: '<g xmlns="http://www.w3.org/2000/svg">	<g transform="translate(1 1)">		<g>			<path style="fill:#61443C;" d="M61.979,435.057c2.645-0.512,5.291-0.853,7.936-1.109c-2.01,1.33-4.472,1.791-6.827,1.28     C62.726,435.13,62.354,435.072,61.979,435.057z"/>			<path style="fill:#61443C;" d="M502.469,502.471h-25.6c0.163-30.757-20.173-57.861-49.749-66.304     c-5.784-1.581-11.753-2.385-17.749-2.389c-2.425-0.028-4.849,0.114-7.253,0.427c1.831-7.63,2.747-15.45,2.731-23.296     c0.377-47.729-34.52-88.418-81.749-95.317c4.274-0.545,8.577-0.83,12.885-0.853c25.285,0.211,49.448,10.466,67.167,28.504     c17.719,18.039,27.539,42.382,27.297,67.666c0.017,7.846-0.9,15.666-2.731,23.296c2.405-0.312,4.829-0.455,7.253-0.427     C472.572,434.123,502.783,464.869,502.469,502.471z"/>		</g>		<path style="fill:#8B685A;" d="M476.869,502.471H7.536c-0.191-32.558,22.574-60.747,54.443-67.413    c0.375,0.015,0.747,0.072,1.109,0.171c2.355,0.511,4.817,0.05,6.827-1.28c1.707-0.085,3.413-0.171,5.12-0.171    c4.59,0,9.166,0.486,13.653,1.451c2.324,0.559,4.775,0.147,6.787-1.141c2.013-1.288,3.414-3.341,3.879-5.685    c7.68-39.706,39.605-70.228,79.616-76.117c4.325-0.616,8.687-0.929,13.056-0.939c13.281-0.016,26.409,2.837,38.485,8.363    c3.917,1.823,7.708,3.904,11.349,6.229c2.039,1.304,4.527,1.705,6.872,1.106c2.345-0.598,4.337-2.142,5.502-4.264    c14.373-25.502,39.733-42.923,68.693-47.189h0.171c47.229,6.899,82.127,47.588,81.749,95.317c0.017,7.846-0.9,15.666-2.731,23.296    c2.405-0.312,4.829-0.455,7.253-0.427c5.996,0.005,11.965,0.808,17.749,2.389C456.696,444.61,477.033,471.713,476.869,502.471    L476.869,502.471z"/>		<path style="fill:#66993E;" d="M502.469,7.537c0,0-6.997,264.96-192.512,252.245c-20.217-1.549-40.166-5.59-59.392-12.032    c-1.365-0.341-2.731-0.853-4.096-1.28c0,0-0.597-2.219-1.451-6.144c-6.656-34.048-25.088-198.997,231.765-230.144    C485.061,9.159,493.595,8.22,502.469,7.537z"/>		<path style="fill:#9ACA5C;" d="M476.784,10.183c-1.28,26.197-16.213,238.165-166.827,249.6    c-20.217-1.549-40.166-5.59-59.392-12.032c-1.365-0.341-2.731-0.853-4.096-1.28c0,0-0.597-2.219-1.451-6.144    C238.363,206.279,219.931,41.329,476.784,10.183z"/>		<path style="fill:#66993E;" d="M206.192,246.727c-0.768,3.925-1.365,6.144-1.365,6.144c-1.365,0.427-2.731,0.939-4.096,1.28    c-21.505,7.427-44.293,10.417-66.987,8.789C21.104,252.103,8.816,94.236,7.621,71.452c-0.085-1.792-0.085-2.731-0.085-2.731    C222.747,86.129,211.653,216.689,206.192,246.727z"/>		<path style="fill:#9ACA5C;" d="M180.336,246.727c-0.768,3.925-1.365,6.144-1.365,6.144c-1.365,0.427-2.731,0.939-4.096,1.28    c-13.351,4.412-27.142,7.359-41.131,8.789C21.104,252.103,8.816,94.236,7.621,71.452    C195.952,96.881,185.541,217.969,180.336,246.727z"/>	</g>	<g>		<path d="M162.136,426.671c3.451-0.001,6.562-2.08,7.882-5.268s0.591-6.858-1.849-9.298l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    C157.701,425.773,159.872,426.673,162.136,426.671L162.136,426.671z"/>		<path d="M292.636,398.57c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054s-3.335,8.671-0.054,12.012L292.636,398.57z"/>		<path d="M296.169,454.771c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012L296.169,454.771z"/>		<path d="M386.503,475.37c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012L386.503,475.37z"/>		<path d="M204.803,409.604c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C198.241,407.524,201.352,409.603,204.803,409.604z"/>		<path d="M332.803,443.737c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C326.241,441.658,329.352,443.737,332.803,443.737z"/>		<path d="M341.336,366.937c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C334.774,364.858,337.885,366.937,341.336,366.937z"/>		<path d="M164.636,454.771l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C173.337,451.515,167.977,451.49,164.636,454.771L164.636,454.771z"/>		<path d="M232.903,429.171l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C241.604,425.915,236.243,425.89,232.903,429.171L232.903,429.171z"/>		<path d="M384.003,409.604c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C377.441,407.524,380.552,409.603,384.003,409.604z"/>		<path d="M70.77,463.304l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271s3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C79.47,460.048,74.11,460.024,70.77,463.304L70.77,463.304z"/>		<path d="M121.97,446.238l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C130.67,442.981,125.31,442.957,121.97,446.238L121.97,446.238z"/>		<path d="M202.302,420.638c-1.6-1.601-3.77-2.5-6.033-2.5c-2.263,0-4.433,0.899-6.033,2.5l-8.533,8.533    c-2.178,2.151-3.037,5.304-2.251,8.262c0.786,2.958,3.097,5.269,6.055,6.055c2.958,0.786,6.111-0.073,8.262-2.251l8.533-8.533    c1.601-1.6,2.5-3.77,2.5-6.033C204.802,424.408,203.903,422.237,202.302,420.638L202.302,420.638z"/>		<path d="M210.836,463.304c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    c2.149,2.188,5.307,3.055,8.271,2.27c2.965-0.785,5.28-3.1,6.065-6.065c0.785-2.965-0.082-6.122-2.27-8.271L210.836,463.304z"/>		<path d="M343.836,454.771l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C352.537,451.515,347.177,451.49,343.836,454.771L343.836,454.771z"/>		<path d="M429.17,483.904c3.341,3.281,8.701,3.256,12.012-0.054s3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012L429.17,483.904z"/>		<path d="M341.336,401.071c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    s-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.441-3.169,6.11-1.849,9.298C334.774,398.991,337.885,401.07,341.336,401.071z"/>		<path d="M273.069,435.204c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    s-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298C266.508,433.124,269.618,435.203,273.069,435.204z"/>		<path d="M253.318,258.138c22.738,7.382,46.448,11.338,70.351,11.737c31.602,0.543,62.581-8.828,88.583-26.796    c94.225-65.725,99.567-227.462,99.75-234.317c0.059-2.421-0.91-4.754-2.667-6.421c-1.751-1.679-4.141-2.52-6.558-2.308    C387.311,9.396,307.586,44.542,265.819,104.5c-28.443,42.151-38.198,94.184-26.956,143.776c-3.411,8.366-6.04,17.03-7.852,25.881    c-4.581-7.691-9.996-14.854-16.147-21.358c8.023-38.158,0.241-77.939-21.57-110.261C160.753,95.829,98.828,68.458,9.228,61.196    c-2.417-0.214-4.808,0.628-6.558,2.308c-1.757,1.667-2.726,4-2.667,6.421c0.142,5.321,4.292,130.929,77.717,182.142    c20.358,14.081,44.617,21.428,69.367,21.008c18.624-0.309,37.097-3.388,54.814-9.138c11.69,12.508,20.523,27.407,25.889,43.665    c0.149,15.133,2.158,30.19,5.982,44.832c-12.842-5.666-26.723-8.595-40.759-8.6c-49.449,0.497-91.788,35.567-101.483,84.058    c-5.094-1.093-10.29-1.641-15.5-1.638c-42.295,0.38-76.303,34.921-76.025,77.217c-0.001,2.263,0.898,4.434,2.499,6.035    c1.6,1.6,3.771,2.499,6.035,2.499h494.933c2.263,0.001,4.434-0.898,6.035-2.499c1.6-1.6,2.499-3.771,2.499-6.035    c0.249-41.103-31.914-75.112-72.967-77.154c0.65-4.78,0.975-9.598,0.975-14.421c0.914-45.674-28.469-86.455-72.083-100.045    c-43.615-13.59-90.962,3.282-116.154,41.391C242.252,322.17,242.793,288.884,253.318,258.138L253.318,258.138z M87.519,238.092    c-55.35-38.567-67.358-129.25-69.833-158.996c78.8,7.921,133.092,32.454,161.458,72.992    c15.333,22.503,22.859,49.414,21.423,76.606c-23.253-35.362-77.83-105.726-162.473-140.577c-2.82-1.165-6.048-0.736-8.466,1.125    s-3.658,4.873-3.252,7.897c0.406,3.024,2.395,5.602,5.218,6.761c89.261,36.751,144.772,117.776,161.392,144.874    C150.795,260.908,115.29,257.451,87.519,238.092z M279.969,114.046c37.6-53.788,109.708-86.113,214.408-96.138    c-2.65,35.375-17.158,159.05-91.892,211.175c-37.438,26.116-85.311,30.57-142.305,13.433    c19.284-32.09,92.484-142.574,212.405-191.954c2.819-1.161,4.805-3.738,5.209-6.76c0.404-3.022-0.835-6.031-3.25-7.892    c-2.415-1.861-5.64-2.292-8.459-1.131C351.388,82.01,279.465,179.805,252.231,222.711    C248.573,184.367,258.381,145.945,279.969,114.046L279.969,114.046z M262.694,368.017c15.097-26.883,43.468-43.587,74.3-43.746    c47.906,0.521,86.353,39.717,85.95,87.625c-0.001,7.188-0.857,14.351-2.55,21.337c-0.67,2.763,0.08,5.677,1.999,7.774    c1.919,2.097,4.757,3.1,7.568,2.676c1.994-0.272,4.005-0.393,6.017-0.362c29.59,0.283,54.467,22.284,58.367,51.617H17.661    c3.899-29.333,28.777-51.334,58.367-51.617c4-0.004,7.989,0.416,11.9,1.254c4.622,0.985,9.447,0.098,13.417-2.467    c3.858-2.519,6.531-6.493,7.408-11.017c7.793-40.473,43.043-69.838,84.258-70.192c16.045-0.002,31.757,4.582,45.283,13.212    c4.01,2.561,8.897,3.358,13.512,2.205C256.422,375.165,260.36,372.163,262.694,368.017L262.694,368.017z"/>	</g></g>',
                }
            };
            background.color = 'yellow';
            pageSettings.multiplePage = true;
            pageSettings.background = background;
            pageSettings.height = 300; pageSettings.width = 300;
            pageSettings.orientation = 'Portrait';
            diagram = new Diagram({
                width: '1200px', height: '600px', nodes: [node, node2, node3],pageSettings:pageSettings
            } as DiagramModel);
            diagram.appendTo('#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('export the diagram with native node', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            let regionType: any = document.getElementById('regionTypes');
            options.region = 'Content';
            options.fileName = 'export';
            let type: any = document.getElementById('exportTypes');
            options.format = 'PNG';
            let htmlData: string = diagram.getDiagramContent();
            let imBound: Rect = diagram.getDiagramBounds();
            let jsonResult: {} = { htmlData: { htmlData: htmlData, width: imBound.width } };

            let image: string = "data:image/png;base64,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…"
            diagram.exportImage(image, options);
            done();
        });

        it('export the diagram with native node which is zoomed and with in custombounds', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            let regionType: any = document.getElementById('regionTypes');
            options.region = 'CustomBounds';
            options.fileName = 'export';
            options.bounds = new Rect(100, 100, 100, 100);
            let type: any = document.getElementById('exportTypes');
            options.format = 'PNG';
            diagram.zoom(0.5);
            let htmlData: string = diagram.getDiagramContent();
            let imBound: Rect = diagram.getDiagramBounds();
            let jsonResult: {} = { htmlData: { htmlData: htmlData, width: imBound.width } };
            let image: string = "data:image/png;base64,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…"
            diagram.exportImage(image, options);
            done();
        });

        it('print the diagram with native node', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            let regionType: any = document.getElementById('regionTypes');
            options.region = 'Content';
            options.fileName = 'export';
            let type: any = document.getElementById('exportTypes');
            options.format = 'PNG';
            let htmlData: string = diagram.getDiagramContent();
            let imBound: Rect = diagram.getDiagramBounds();
            let jsonResult: {} = { htmlData: { htmlData: htmlData, width: imBound.width } };

            let image: string = "data:image/png;base64,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…"
            diagram.printImage(image, options);
            done();
        });
    });

    describe('tesing the native node export and print with multiple page', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let pageSettings: PageSettingsModel = {};
        let background: BackgroundModel = {};

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 300, y: 400 }, targetPoint: { x: 500, y: 500 }
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: 0, offsetY: 0,
                annotations: [{ content: 'Node1', height: 50, width: 50 }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 80, height: 130, offsetX: 200, offsetY: 200,
                annotations: [{ content: 'Node2', height: 50, width: 50 }]
            };
            let node3: NodeModel = {
                id: 'nativenode', width: 150, height: 100, offsetX: 700, offsetY: 300, style: { fill: 'none' },
                shape: {
                    type: 'Native', content: '<g xmlns="http://www.w3.org/2000/svg">	<g transform="translate(1 1)">		<g>			<path style="fill:#61443C;" d="M61.979,435.057c2.645-0.512,5.291-0.853,7.936-1.109c-2.01,1.33-4.472,1.791-6.827,1.28     C62.726,435.13,62.354,435.072,61.979,435.057z"/>			<path style="fill:#61443C;" d="M502.469,502.471h-25.6c0.163-30.757-20.173-57.861-49.749-66.304     c-5.784-1.581-11.753-2.385-17.749-2.389c-2.425-0.028-4.849,0.114-7.253,0.427c1.831-7.63,2.747-15.45,2.731-23.296     c0.377-47.729-34.52-88.418-81.749-95.317c4.274-0.545,8.577-0.83,12.885-0.853c25.285,0.211,49.448,10.466,67.167,28.504     c17.719,18.039,27.539,42.382,27.297,67.666c0.017,7.846-0.9,15.666-2.731,23.296c2.405-0.312,4.829-0.455,7.253-0.427     C472.572,434.123,502.783,464.869,502.469,502.471z"/>		</g>		<path style="fill:#8B685A;" d="M476.869,502.471H7.536c-0.191-32.558,22.574-60.747,54.443-67.413    c0.375,0.015,0.747,0.072,1.109,0.171c2.355,0.511,4.817,0.05,6.827-1.28c1.707-0.085,3.413-0.171,5.12-0.171    c4.59,0,9.166,0.486,13.653,1.451c2.324,0.559,4.775,0.147,6.787-1.141c2.013-1.288,3.414-3.341,3.879-5.685    c7.68-39.706,39.605-70.228,79.616-76.117c4.325-0.616,8.687-0.929,13.056-0.939c13.281-0.016,26.409,2.837,38.485,8.363    c3.917,1.823,7.708,3.904,11.349,6.229c2.039,1.304,4.527,1.705,6.872,1.106c2.345-0.598,4.337-2.142,5.502-4.264    c14.373-25.502,39.733-42.923,68.693-47.189h0.171c47.229,6.899,82.127,47.588,81.749,95.317c0.017,7.846-0.9,15.666-2.731,23.296    c2.405-0.312,4.829-0.455,7.253-0.427c5.996,0.005,11.965,0.808,17.749,2.389C456.696,444.61,477.033,471.713,476.869,502.471    L476.869,502.471z"/>		<path style="fill:#66993E;" d="M502.469,7.537c0,0-6.997,264.96-192.512,252.245c-20.217-1.549-40.166-5.59-59.392-12.032    c-1.365-0.341-2.731-0.853-4.096-1.28c0,0-0.597-2.219-1.451-6.144c-6.656-34.048-25.088-198.997,231.765-230.144    C485.061,9.159,493.595,8.22,502.469,7.537z"/>		<path style="fill:#9ACA5C;" d="M476.784,10.183c-1.28,26.197-16.213,238.165-166.827,249.6    c-20.217-1.549-40.166-5.59-59.392-12.032c-1.365-0.341-2.731-0.853-4.096-1.28c0,0-0.597-2.219-1.451-6.144    C238.363,206.279,219.931,41.329,476.784,10.183z"/>		<path style="fill:#66993E;" d="M206.192,246.727c-0.768,3.925-1.365,6.144-1.365,6.144c-1.365,0.427-2.731,0.939-4.096,1.28    c-21.505,7.427-44.293,10.417-66.987,8.789C21.104,252.103,8.816,94.236,7.621,71.452c-0.085-1.792-0.085-2.731-0.085-2.731    C222.747,86.129,211.653,216.689,206.192,246.727z"/>		<path style="fill:#9ACA5C;" d="M180.336,246.727c-0.768,3.925-1.365,6.144-1.365,6.144c-1.365,0.427-2.731,0.939-4.096,1.28    c-13.351,4.412-27.142,7.359-41.131,8.789C21.104,252.103,8.816,94.236,7.621,71.452    C195.952,96.881,185.541,217.969,180.336,246.727z"/>	</g>	<g>		<path d="M162.136,426.671c3.451-0.001,6.562-2.08,7.882-5.268s0.591-6.858-1.849-9.298l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    C157.701,425.773,159.872,426.673,162.136,426.671L162.136,426.671z"/>		<path d="M292.636,398.57c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054s-3.335,8.671-0.054,12.012L292.636,398.57z"/>		<path d="M296.169,454.771c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012L296.169,454.771z"/>		<path d="M386.503,475.37c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012L386.503,475.37z"/>		<path d="M204.803,409.604c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C198.241,407.524,201.352,409.603,204.803,409.604z"/>		<path d="M332.803,443.737c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C326.241,441.658,329.352,443.737,332.803,443.737z"/>		<path d="M341.336,366.937c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C334.774,364.858,337.885,366.937,341.336,366.937z"/>		<path d="M164.636,454.771l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C173.337,451.515,167.977,451.49,164.636,454.771L164.636,454.771z"/>		<path d="M232.903,429.171l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C241.604,425.915,236.243,425.89,232.903,429.171L232.903,429.171z"/>		<path d="M384.003,409.604c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C377.441,407.524,380.552,409.603,384.003,409.604z"/>		<path d="M70.77,463.304l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271s3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C79.47,460.048,74.11,460.024,70.77,463.304L70.77,463.304z"/>		<path d="M121.97,446.238l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C130.67,442.981,125.31,442.957,121.97,446.238L121.97,446.238z"/>		<path d="M202.302,420.638c-1.6-1.601-3.77-2.5-6.033-2.5c-2.263,0-4.433,0.899-6.033,2.5l-8.533,8.533    c-2.178,2.151-3.037,5.304-2.251,8.262c0.786,2.958,3.097,5.269,6.055,6.055c2.958,0.786,6.111-0.073,8.262-2.251l8.533-8.533    c1.601-1.6,2.5-3.77,2.5-6.033C204.802,424.408,203.903,422.237,202.302,420.638L202.302,420.638z"/>		<path d="M210.836,463.304c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    c2.149,2.188,5.307,3.055,8.271,2.27c2.965-0.785,5.28-3.1,6.065-6.065c0.785-2.965-0.082-6.122-2.27-8.271L210.836,463.304z"/>		<path d="M343.836,454.771l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C352.537,451.515,347.177,451.49,343.836,454.771L343.836,454.771z"/>		<path d="M429.17,483.904c3.341,3.281,8.701,3.256,12.012-0.054s3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012L429.17,483.904z"/>		<path d="M341.336,401.071c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    s-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.441-3.169,6.11-1.849,9.298C334.774,398.991,337.885,401.07,341.336,401.071z"/>		<path d="M273.069,435.204c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    s-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298C266.508,433.124,269.618,435.203,273.069,435.204z"/>		<path d="M253.318,258.138c22.738,7.382,46.448,11.338,70.351,11.737c31.602,0.543,62.581-8.828,88.583-26.796    c94.225-65.725,99.567-227.462,99.75-234.317c0.059-2.421-0.91-4.754-2.667-6.421c-1.751-1.679-4.141-2.52-6.558-2.308    C387.311,9.396,307.586,44.542,265.819,104.5c-28.443,42.151-38.198,94.184-26.956,143.776c-3.411,8.366-6.04,17.03-7.852,25.881    c-4.581-7.691-9.996-14.854-16.147-21.358c8.023-38.158,0.241-77.939-21.57-110.261C160.753,95.829,98.828,68.458,9.228,61.196    c-2.417-0.214-4.808,0.628-6.558,2.308c-1.757,1.667-2.726,4-2.667,6.421c0.142,5.321,4.292,130.929,77.717,182.142    c20.358,14.081,44.617,21.428,69.367,21.008c18.624-0.309,37.097-3.388,54.814-9.138c11.69,12.508,20.523,27.407,25.889,43.665    c0.149,15.133,2.158,30.19,5.982,44.832c-12.842-5.666-26.723-8.595-40.759-8.6c-49.449,0.497-91.788,35.567-101.483,84.058    c-5.094-1.093-10.29-1.641-15.5-1.638c-42.295,0.38-76.303,34.921-76.025,77.217c-0.001,2.263,0.898,4.434,2.499,6.035    c1.6,1.6,3.771,2.499,6.035,2.499h494.933c2.263,0.001,4.434-0.898,6.035-2.499c1.6-1.6,2.499-3.771,2.499-6.035    c0.249-41.103-31.914-75.112-72.967-77.154c0.65-4.78,0.975-9.598,0.975-14.421c0.914-45.674-28.469-86.455-72.083-100.045    c-43.615-13.59-90.962,3.282-116.154,41.391C242.252,322.17,242.793,288.884,253.318,258.138L253.318,258.138z M87.519,238.092    c-55.35-38.567-67.358-129.25-69.833-158.996c78.8,7.921,133.092,32.454,161.458,72.992    c15.333,22.503,22.859,49.414,21.423,76.606c-23.253-35.362-77.83-105.726-162.473-140.577c-2.82-1.165-6.048-0.736-8.466,1.125    s-3.658,4.873-3.252,7.897c0.406,3.024,2.395,5.602,5.218,6.761c89.261,36.751,144.772,117.776,161.392,144.874    C150.795,260.908,115.29,257.451,87.519,238.092z M279.969,114.046c37.6-53.788,109.708-86.113,214.408-96.138    c-2.65,35.375-17.158,159.05-91.892,211.175c-37.438,26.116-85.311,30.57-142.305,13.433    c19.284-32.09,92.484-142.574,212.405-191.954c2.819-1.161,4.805-3.738,5.209-6.76c0.404-3.022-0.835-6.031-3.25-7.892    c-2.415-1.861-5.64-2.292-8.459-1.131C351.388,82.01,279.465,179.805,252.231,222.711    C248.573,184.367,258.381,145.945,279.969,114.046L279.969,114.046z M262.694,368.017c15.097-26.883,43.468-43.587,74.3-43.746    c47.906,0.521,86.353,39.717,85.95,87.625c-0.001,7.188-0.857,14.351-2.55,21.337c-0.67,2.763,0.08,5.677,1.999,7.774    c1.919,2.097,4.757,3.1,7.568,2.676c1.994-0.272,4.005-0.393,6.017-0.362c29.59,0.283,54.467,22.284,58.367,51.617H17.661    c3.899-29.333,28.777-51.334,58.367-51.617c4-0.004,7.989,0.416,11.9,1.254c4.622,0.985,9.447,0.098,13.417-2.467    c3.858-2.519,6.531-6.493,7.408-11.017c7.793-40.473,43.043-69.838,84.258-70.192c16.045-0.002,31.757,4.582,45.283,13.212    c4.01,2.561,8.897,3.358,13.512,2.205C256.422,375.165,260.36,372.163,262.694,368.017L262.694,368.017z"/>	</g></g>',
                }
            };
            background.color = 'yellow';
            pageSettings.multiplePage = true;
            pageSettings.background = background;
            pageSettings.height = 1000; pageSettings.width = 1000;
            pageSettings.orientation = 'Portrait';
            diagram = new Diagram({
                width: '600px', height: '600px', nodes: [node, node2, node3], pageSettings: pageSettings
            } as DiagramModel);
            diagram.appendTo('#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('export the diagram with native node', (done: Function) => {
            let options: IExportOptions = {};
            options.mode = 'Data';
            let regionType: any = document.getElementById('regionTypes');
            options.region = 'Content';
            options.fileName = 'export';
            let type: any = document.getElementById('exportTypes');
            options.format = 'PNG';
            let imBound: Rect = diagram.getDiagramBounds();
            let htmlData: string = diagram.getDiagramContent();
            let jsonResult: {} = { htmlData: { htmlData: htmlData, width: imBound.width } };
            let image: string = "data:image/png;base64,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…"
            diagram.exportImage(image, options);
            done();
        });
    });

    describe('tesing the native node export and print with multiple page', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let nodes: NodeModel[] = [
                {
                    id: "node1",
                    height: 100,
                    width: 100,
                    offsetX: 100,
                    offsetY: 100,
                    shape: {
                        type: "HTML",
                        content:
                            '<div style="background:#6BA5D7;height:100%;width:100%;"><button type="button" style="width:100px"> New-Button</button></div>'
                    }
                },
                {
                    id: "node2",
                    height: 100,
                    width: 100,
                    offsetX: 300,
                    offsetY: 100,
                    shape: {
                        type: "HTML",
                        content:
                            '<div style="background:#6BA5D7;height:100%;width:100%;"><button type="button" style="width:100px"> SVG</button></div>'
                    }
                },
                {
                    id: "node3",
                    height: 100,
                    width: 100,
                    offsetX: 500,
                    offsetY: 100,
                    shape: {
                        type: "Native",
                        content:
                            '<g xmlns="http://www.w3.org/2000/svg">' +
                            '<rect height="256" width="256" fill="#34353F"/>' +
                            '<path id="path1" transform="rotate(0,128,128) translate(59,61.2230899333954) scale(4.3125,4.3125)  " fill="#FFFFFF" d="M18.88501,23.042998L26.804993,23.042998 26.804993,30.969001 18.88501,30.969001z M9.4360352,23.042998L17.358032,23.042998 17.358032,30.969001 9.4360352,30.969001z M0.014038086,23.042998L7.9360352,23.042998 7.9360352,30.969001 0.014038086,30.969001z M18.871033,13.609001L26.791016,13.609001 26.791016,21.535994 18.871033,21.535994z M9.4219971,13.609001L17.342041,13.609001 17.342041,21.535994 9.4219971,21.535994z M0,13.609001L7.9219971,13.609001 7.9219971,21.535994 0,21.535994z M9.4219971,4.1859968L17.342041,4.1859968 17.342041,12.113998 9.4219971,12.113998z M0,4.1859968L7.9219971,4.1859968 7.9219971,12.113998 0,12.113998z M25.846008,0L32,5.2310026 26.773987,11.382995 20.619019,6.155998z"/>' +
                            "</g>"
                    }
                }
            ];
            diagram = new Diagram({
                width: '100%', height: '700px', nodes: nodes
            } as DiagramModel);
            diagram.appendTo('#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('export the diagram with native node', (done: Function) => {
            let htmlData: string = diagram.getDiagramContent();
            done();
        });
    });
});