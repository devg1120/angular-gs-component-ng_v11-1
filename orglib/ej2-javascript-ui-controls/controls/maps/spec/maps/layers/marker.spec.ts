/**
 * Bing map layer testing
 */
import { Maps, ILoadedEventArgs } from '../../../src/index';
import { createElement, remove } from '@syncfusion/ej2-base';
import { World_Map, usMap, India_Map, CustomPathData, flightRoutes, intermediatestops1 } from '../data/data.spec';
import { MouseEvents } from '../../../spec/maps/base/events.spec';
import { getElement, marker } from '../../../src/maps/utils/helper';
import { Marker, ILoadEventArgs, BingMap, Zoom, MapsTooltip } from '../../../src/maps/index';
import { profile, inMB, getMemoryProfile } from '../common.spec';
import { debug } from 'util';
Maps.Inject(Marker, Zoom, MapsTooltip);

let imageUrl: string = "http:\/\/ecn.{subdomain}.tiles.virtualearth.net\/tiles\/a{quadkey}.jpeg?g=6465";
let subDomains: string[] = ["t0", "t1", "t2", "t3"];
let zoomMax: string = "21";

export function getElementByID(id: string): Element {
    return document.getElementById(id);
}

let MapData: Object = World_Map;
describe('Map marker properties tesing', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });
    describe('Marker testing', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let spec: Element;
        let prevent: Function = (): void => {
        };
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                layers: [
                    {
                        shapeData: MapData
                    }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });

        it('Marker shapes checking with Triangle', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Triangle',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Triangle',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Triangle',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Triangle',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Triangle',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ];
            map.refresh();
        });


        it('Marker shape checking with Circle', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });

        it('Marker shape checking with Circle captial letter Latitude and Longitude', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "USA", Latitude: 38.8833, Longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "Brazil", Latitude: -15.7833, Longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "India", Latitude: 21.0000, Longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "China", Latitude: 35.0000, Longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Circle',
                    dataSource: [{ Name: "Indonesia", Latitude: -6.1750, Longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });
  
        it('Marker shape checking with InvertedTriangle', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'InvertedTriangle',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'InvertedTriangle',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'InvertedTriangle',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'InvertedTriangle',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'InvertedTriangle',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });

        it('Marker shape checking with Pentagon', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Pentagon',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Pentagon',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Pentagon',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Pentagon',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Pentagon',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });


        it('Marker shape checking with Rectangle', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Rectangle',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Rectangle',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Rectangle',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Rectangle',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Rectangle',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });

        it('Marker shape checking with Star', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Star',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Star',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Star',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Star',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Star',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });

        it('Marker shape checking with Cross', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Cross',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Cross',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Cross',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Cross',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Cross',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });

        it('Marker shape checking with Diamond', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Diamond',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Diamond',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Diamond',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Diamond',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Diamond',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });


        it('Marker shape checking with Balloon', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Balloon',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Balloon',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Balloon',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Balloon',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Balloon',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });


        it('Marker shape checking with HorizontalLine', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'HorizontalLine',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'HorizontalLine',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'HorizontalLine',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'HorizontalLine',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'HorizontalLine',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });

        it('Marker shape checking with VerticalLine', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'VerticalLine',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'VerticalLine',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'VerticalLine',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'VerticalLine',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'VerticalLine',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });

        it('Marker shape checking with Image', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shape: 'Image',
                    imageUrl: 'http://js.syncfusion.com/demos/web/Images/map/pin.png',
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 }]
                },
                {
                    visible: true,
                    shape: 'Image',
                    imageUrl: 'http://js.syncfusion.com/demos/web/Images/map/pin.png',
                    dataSource: [{ Name: "Brazil", latitude: -15.7833, longitude: -47.8667 }]
                },
                {
                    visible: true,
                    shape: 'Image',
                    imageUrl: 'http://js.syncfusion.com/demos/web/Images/map/pin.png',
                    dataSource: [{ Name: "India", latitude: 21.0000, longitude: 78.0000 }]
                },
                {
                    visible: true,
                    shape: 'Image',
                    imageUrl: 'http://js.syncfusion.com/demos/web/Images/map/pin.png',
                    dataSource: [{ Name: "China", latitude: 35.0000, longitude: 103.0000 }]
                },
                {
                    visible: true,
                    shape: 'Image',
                    imageUrl: 'http://js.syncfusion.com/demos/web/Images/map/pin.png',
                    dataSource: [{ Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ]
            map.refresh();
        });
        it('checking with marker template', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    template: '<div id="marker1"><p>{{:Name}}</p></div>',
                    dataSource: [
                        { Name: "USA", latitude: 38.8833, longitude: -77.0167 },
                        { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                        { Name: "India", latitude: 21.0000, longitude: 78.0000 },
                        { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                        { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }
                    ]
                }]
            map.refresh();
        });

        it('checking with marker template captial letter latitude and longtitude', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    template: '<div id="marker1"><p>{{:Name}}</p></div>',
                    dataSource: [
                        { Name: "USA", Latitude: 38.8833, Longitude: -77.0167 },
                        { Name: "Brazil", Latitude: -15.7833, Longitude: -47.8667 },
                        { Name: "India", Latitude: 21.0000, longitude: 78.0000 },
                        { Name: "China", Latitude: 35.0000, Longitude: 103.0000 },
                        { Name: "Indonesia", Latitude: -6.1750, Longitude: 106.8283 }
                    ]
                }]
            map.refresh();
        });
  
        it('checking with add marker method', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = <Element>document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_1_dataIndex_0').firstChild;
                let triger: MouseEvents = new MouseEvents();
                triger.clickEvent(element);
                expect(element.getAttribute('fill')).toBe('blueviolet');
                let transform: string = element.getAttribute('transform');
                //     expect(transform.indexOf('translate(135') > -1).toBe(true);
                //     expect(transform.indexOf(', 178') > -1).toBe(true);
                //     expect(transform.indexOf('scale(0.44') > -1).toBe(true);
                //     expect(transform.indexOf(', 0.33') > -1).toBe(true);
            };
            map.addMarker(0, [{
                animationDuration: 1, visible: true, fill: 'blueviolet', dataSource: [
                    { Name: 'USA', latitude: 38.8833, longitude: -77.0167 }
                ]
            }]);
        });
        it('checking the marker clustering balloon', () => {
            map.loaded = (args: ILoadEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            }
            map.layers[0].markerClusterSettings = {
                allowClustering: true,
                shape: 'Balloon',
                height: 30,
                width: 30,
                fill: 'blue',
                opacity: 0.5,
            },
                map.layers[0].markerSettings = [
                    {
                        visible: true,
                        dataSource: [
                          {latitude: 40.6971494,longitude: -74.2598747,city: "New York",area: 8683,Rank: 1},
                          {latitude: 35.4526439,longitude: 139.4567198,city: "Tokyo",area: 6993,Rank: 2},
                          {latitude: 41.8333925,longitude: -88.0121569,city: "Chicago",area: 5498,Rank: 3},
                          {latitude: 33.1147951,longitude: -94.2114611,city: "Atlanta",area: 5083,Rank: 4},
                          {latitude: 40.0024137,longitude: -75.2581194,city: "Philadelphia",area: 4661,Rank: 5},
                          {latitude: 42.3142647,longitude: -71.11037,city: "Boston",area: 4497,Rank: 6},
                          {latitude: 34.0201613,longitude: -118.6919306,city: "Los Angeles",area: 4320,Rank: 7},
                          {latitude: 32.8203525,longitude: -97.0117413,city: "Dallas",area: 3644,Rank: 8},
                          {latitude: 31.2590796,longitude: -95.6476923,city: "Houston",area: 3355,Rank: 9},
                          {latitude: 42.3526257,longitude: -83.239291,city: "Detroit",area: 3267,Rank: 10},
                          {latitude: 47.2510905,longitude: -123.1255834,city: "Washington",area: 2996,Rank: 11},
                          {latitude: 25.7823907,longitude: -80.2994995,city: "Miami",area: 2891,Rank: 12},
                          {latitude: 35.1468253,longitude: 136.7862238,city: "Nagoya",area: 2875,Rank: 13},
                          {latitude: 48.8588377,longitude: 2.2770198,city: "Paris",area: 2723,Rank: 14},
                          {latitude: 50.1781141,longitude: 2.4939991,city: "Essen",area: 2642,Rank: 15}
                        ]
                    },
                    {
                        visible: true,
                        template: '<div id="marker1" class="markerTemplate">Asia' +
                            '</div>',
                        dataSource: [
                            { latitude: 50.32087157990324, longitude: 90.015625 }
                        ],
                        animationDuration: 0
                    },
                ]
            map.refresh();
        });
        it('checking the marker clustering', () => {
            map.loaded = (args: ILoadEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
                spec = getElement(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_5_cluster_0');
                trigger.clickEvent(spec);
                spec = getElement(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_5_cluster_0');
                trigger.mousemoveEvent(spec, 0, 0, 0, 0);
            }
            map.layers[0].markerClusterSettings = {
                allowClustering: true,
                shape: 'Image',
                height: 30,
                width: 30,
                fill: 'blue',
                opacity: 0.5,
                imageUrl: './images/cluster_icon.svg'
            },
                map.layers[0].markerSettings = [
                    {
                        visible: true,
                        dataSource: [
                            { latitude: 37.6276571, longitude: -122.4276688, name: 'San Bruno' },
                            { latitude: 33.5302186, longitude: -117.7418381, name: 'Laguna Niguel' },
                            { latitude: 40.7424509, longitude: -74.0081468, name: 'New York' },
                            { latitude: -23.5268201, longitude: -46.6489927, name: 'Bom Retiro' },
                            { latitude: 43.6533855, longitude: -79.3729994, name: 'Toronto' },
                            { latitude: 48.8773406, longitude: 2.3299627, name: 'Paris' },
                            { latitude: 52.4643089, longitude: 13.4107368, name: 'Berlin' },
                            { latitude: 19.1555762, longitude: 72.8849595, name: 'Mumbai' },
                            { latitude: 35.6628744, longitude: 139.7345469, name: 'Minato' },
                            { latitude: 51.5326602, longitude: -0.1262422, name: 'London' }
                        ]
                    },
                    {
                        visible: true,
                        template: '<div id="marker1" class="markerTemplate">Asia' +
                            '</div>',
                        dataSource: [
                            { latitude: 50.32087157990324, longitude: 90.015625 }
                        ],
                        animationDuration: 0
                    },
                ]
            map.refresh();
        })
        it('checking the marker clustering template', () => {
            map.loaded = (args: ILoadEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);

            }
            map.layers[0].markerClusterSettings = {
                allowClustering: true,
                shape: 'Image',
                height: 30,
                width: 30,
                fill: 'blue',
                opacity: 0.5,
                imageUrl: './images/cluster_icon.svg'
            },
                map.layers[0].markerSettings = [
                    {
                        visible: true,
                        dataSource: [
                            { latitude: 37.6276571, longitude: -122.4276688, name: 'San Bruno' }
                        ]
                    },
                    {
                        visible: true,
                        tooltipSettings: {
                            visible: true
                        },
                        template: '<div id="marker1" class="markerTemplate">Asia' +
                            '</div>',
                        dataSource: [
                            { latitude: 50.32087157990324, longitude: 90.015625 }
                        ],
                        animationDuration: 0
                    },
                    {
                        visible: true,
                        template: '<div id="marker2" class="markerTemplate">Australia' +
                            '</div>',
                        dataSource: [
                            { latitude: -25.88583769986199, longitude: 134.296875 }
                        ],
                        animationDuration: 0
                    },
                    {
                        visible: true,
                        template: '<div id="marker3" class="markerTemplate">Africa' +
                            '</div>',
                        dataSource: [
                            { latitude: 16.97274101999902, longitude: 16.390625 }
                        ],
                        animationDuration: 0
                    },
                    {
                        visible: true,
                        template: '<div id="marker4" class="markerTemplate">Europe' +
                            '</div>',
                        dataSource: [
                            { latitude: 49.95121990866204, longitude: 18.468749999999998 }
                        ],
                        animationDuration: 0,
                    },
                    {
                        visible: true,
                        template: '<div id="marker5" class="markerTemplate" style="width:50px">North America' +
                            '</div>',
                        dataSource: [
                            { latitude: 59.88893689676585, longitude: -109.3359375 }
                        ],
                        animationDuration: 0
                    },
                    {
                        visible: true,
                        template: '<div id="marker6" class="markerTemplate" style="width:50px">South America' +
                            '</div>',
                        dataSource: [
                            { latitude: -6.64607562172573, longitude: -55.54687499999999 }
                        ],
                        animationDuration: 0
                    },
                    {
                        visible: true,
                        template: '<div id="marker1" class="markerTemplate">Arizona' +
                            '</div>',
                        dataSource: [
                            { latitude: 34.0864548, longitude: -116.4242, name: 'Arizona' },
                        ],
                        animationDuration: 0
                    },
                    {
                        visible: true,
                        template: '<div id="marker2" class="markerTemplate">las vegas' +
                            '</div>',
                        dataSource: [
                            { latitude: 36.1246737, longitude: -115.4551968, name: 'las vegas' },
                        ],
                        animationDuration: 0
                    },
                    {
                        visible: true,
                        template: '<div id="marker3" class="markerTemplate">Nevada' +
                            '</div>',
                        dataSource: [
                            { latitude: 38.4161464, longitude: -121.5160838, name: 'Nevada' },
                        ],
                        animationDuration: 0
                    },
                    {
                        visible: true,
                        template: '<div id="marker5" class="markerTemplate" style="width:50px">San Bruno' +
                            '</div>',
                        dataSource: [
                            { latitude: 37.6276571, longitude: -122.4276688, name: 'San Bruno' },
                        ],
                        animationDuration: 0
                    },
                    {
                        visible: true,
                        template: '<div id="marker6" class="markerTemplate" style="width:50px">Laguna Niguel' +
                            '</div>',
                        dataSource: [
                            { latitude: 33.5302186, longitude: -117.7418381, name: 'Laguna Niguel' },
                        ],
                        animationDuration: 0
                    },
                ]
            map.refresh();
        });
        it('To check the marker color which is applied from marker datasource', (done: Function) => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_0');
                expect(element.getAttribute('fill')).toBe('green');
                expect(element.getAttribute('stroke-opacity')).toBe('0.7');
                done();
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    colorValuePath: 'Color',
                    shape: 'Circle',
                    border:{
                        color: "red",
                        width: 2,
                        opacity: 0.7
                    },
                    dataSource: [
                        { Name: "USA", latitude: 38.8833, longitude: -77.0167, Color: 'green' },
                        { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                        { Name: "India", latitude: 21.0000, longitude: 78.0000 },
                        { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                        { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }
                    ]
                }]
            map.refresh();
        });
        it('To check the marker shape which is applied from marker datasource', (done: Function) => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_0');
                expect(element.getAttribute('href')).toBe('images/weather-clear.png');
                done();
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shapeValuePath: 'shape',
                    imageUrlValuePath: 'imageurl',
                    shape: 'Circle',
                    dataSource: [
                        { Name: "USA", latitude: 38.8833, longitude: -77.0167, imageurl: 'images/weather-clear.png', shape: 'Image' },
                        { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                        { Name: "India", latitude: 21.0000, longitude: 78.0000 },
                        { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                        { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }
                    ]
                }]
            map.refresh();
        });
        it('Checking with Zoom in marker shapes which is applied from marker datasource', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = getElementByID(map.element.id + '_Zooming_ToolBar_ZoomIn_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                for (let i: number = 0; i < 1; i++) {
                    map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
                }
            };
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    shapeValuePath: 'shape',
                    imageUrlValuePath: 'imageurl',
                    shape: 'Circle',
                    dataSource: [
                        { Name: "USA", latitude: 38.8833, longitude: -77.0167, imageurl: 'images/weather-clear.png', shape: 'Image' },
                        { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                        { Name: "India", latitude: 21.0000, longitude: 78.0000 },
                        { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                        { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }
                    ]
                }];
            map.zoomSettings.enable = true;
            map.refresh();
        });

    });

    describe('Marker Checking with bing and osm ', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let spec: Element;
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                layers: [
                    {
                        layerType: 'Bing',
                        key: "AmfB8BVuEu-ep0xaTvL6s44TbnCQplA0CSoNAfe3MI7AoEwvqFjz9FSQ6tLFzx4L",
                    }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });
        it('Marker checking with Bing map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.load = (args: ILoadEventArgs) => {
                let bing: BingMap = new BingMap(map);
                bing.imageUrl = imageUrl;
                bing.maxZoom = zoomMax;
                bing.subDomains = subDomains;
                map.mapLayerPanel["bing"] = bing;
            };
            map.layers[0].markerSettings = [{
                visible: true,
                height: 30,
                width: 30,
                dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 },
                { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                { Name: "India", latitude: 21.0000, longitude: 78.0000 },
                { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
            }]
            map.refresh();
        });

        it('Marker template checking with OSM map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [{
                visible: true,
                height: 30,
                width: 30,
                template: "<div><img src=http://js.syncfusion.com/demos/web/Images/map/pin.png></img></div>",
                dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 },
                { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                { Name: "India", latitude: 21.0000, longitude: 78.0000 },
                { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
            }];
            map.layers[0].layerType = 'OSM';
            map.refresh();
        });
        it('Marker template checking with OSM map and persistence', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerClusterSettings = {
                allowClustering: true,
                shape: 'Image',
                height:30,
                width:30,
                fill: 'blue',
                opacity: 0.5, 
                imageUrl :'./images/cluster_icon.svg'                            
            },
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    dataSource: [
                        { latitude: 37.6276571, longitude: -122.4276688, name: 'San Bruno'},
                            { latitude: 33.5302186, longitude: -117.7418381, name: 'Laguna Niguel'},
                            { latitude: 40.7424509, longitude: -74.0081468, name: 'New York'},
                            { latitude: -23.5268201, longitude: -46.6489927, name: 'Bom Retiro'},
                            { latitude: 43.6533855, longitude: -79.3729994, name: 'Toronto'},
                            { latitude: 48.8773406, longitude: 2.3299627, name: 'Paris'},
                            { latitude: 52.4643089, longitude: 13.4107368, name: 'Berlin'},
                            { latitude: 19.1555762, longitude: 72.8849595, name: 'Mumbai'},
                            { latitude: 35.6628744, longitude: 139.7345469, name: 'Minato'},
                            { latitude: 51.5326602, longitude: -0.1262422, name: 'London'}
                    ]
                },
                {
                    visible: true,
                    template: '<div id="marker1" class="markerTemplate">Asia' +
                        '</div>',
                    dataSource: [
                        { latitude: 50.32087157990324, longitude: 90.015625 }
                    ],
                    animationDuration: 0
                },];
            map.layers[0].layerType = 'OSM';
            map.refresh();
        });
    });

    describe('Zooming the map with marker distance in OSM map', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let spec: Element;
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                zoomSettings: {
                    enable: true,
                    shouldZoomInitially :true
                   // toolbars: ['Zoom', 'ZoomIn', 'ZoomOut', 'Pan', 'Reset']
                },
                layers: [
                    {
                        layerType:'OSM'
                    },
                    {
                        
                    }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });
        it('Marker zooming with OSM map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [{
                visible: true,
                height: 30,
                width: 30,
                template: "<div><img src=http://js.syncfusion.com/demos/web/Images/map/pin.png></img></div>",
                dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 },
                { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                { Name: "India", latitude: 21.0000, longitude: 78.0000 },
                { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
            }];
            map.layers[0].layerType = 'OSM';
            map.enablePersistence = true;
            map.refresh();
        });
        it('Marker template checking with OSM map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerClusterSettings = {
                allowClustering: true,
                shape: 'Image',
                height: 30,
                width: 30,
                fill: 'blue',
                opacity: 0.5,
                imageUrl: './images/cluster_icon.svg'
            },
                map.layers[0].markerSettings = [
                    {
                        visible: true,
                        dataSource: [
                            { latitude: 37.6276571, longitude: -122.4276688, name: 'San Bruno' },
                            { latitude: 33.5302186, longitude: -117.7418381, name: 'Laguna Niguel' },
                            { latitude: 40.7424509, longitude: -74.0081468, name: 'New York' },
                            { latitude: -23.5268201, longitude: -46.6489927, name: 'Bom Retiro' },
                            { latitude: 43.6533855, longitude: -79.3729994, name: 'Toronto' },
                            { latitude: 48.8773406, longitude: 2.3299627, name: 'Paris' },
                            { latitude: 52.4643089, longitude: 13.4107368, name: 'Berlin' },
                            { latitude: 19.1555762, longitude: 72.8849595, name: 'Mumbai' },
                            { latitude: 35.6628744, longitude: 139.7345469, name: 'Minato' },
                            { latitude: 51.5326602, longitude: -0.1262422, name: 'London' }
                        ]
                    },
                    {
                        visible: true,
                        template: '<div id="marker1" class="markerTemplate">Asia' +
                            '</div>',
                        dataSource: [
                            { latitude: 50.32087157990324, longitude: 90.015625 }
                        ],
                        animationDuration: 0
                    },];
            map.layers[0].layerType = 'OSM';
            map.refresh();
        });
    });
    describe('Marker Checking with cluster expand feature ', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let spec: Element;
        let prevent: Function = (): void => {
        };
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                zoomSettings: {
                    enable: true,
                    zoomOnClick: true
                },
                layers: [
                    {
                        shapeData: MapData,
                        markerClusterSettings: {
                            allowClustering: true,
                            allowClusterExpand: false,
                            height: 20, width: 20
                        },
                    }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });

        it('checking the click on the cluster when allowClusterExpand false', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_2_cluster_0');
                let triger: MouseEvents = new MouseEvents();
                triger.clickEvent(element);
                element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_3');
                expect(element['style'].visibility === 'hidden').toBe(true);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true, height: 20, width: 20,
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 },
                    { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                    { Name: "India Data1", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data2", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data3", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                    { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ];
            map.refresh();
        });

        it('checking the click on the cluster when allowClusterExpand true', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_2_cluster_0');
                let triger: MouseEvents = new MouseEvents();
                triger.clickEvent(element);
                element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_3');
                expect(element['style'].visibility === 'visible').toBe(true);
            };
            map.layers[0].markerClusterSettings.allowClusterExpand = true;
            map.refresh();
        });
        it('clusterexpand for more number of markers', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                //When click on different markers location clusters, there should not markers expand and map should zoomed
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_19_cluster_2');
                let triger: MouseEvents = new MouseEvents();
                triger.clickEvent(element);
                expect(element['style'].visibility === '' || element['style'].visibility === 'hidden').toBe(true);

                element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_4_cluster_1');
                triger = new MouseEvents();
                triger.clickEvent(element);
                element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_4_cluster_1');
                expect(element['style'].visibility === '' || element['style'].visibility === 'hidden').toBe(true);
                element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_6');
                expect(element['style'].visibility === 'visible' || element['style'].visibility === 'hidden').toBe(true);
                map.loaded = null;
            };
            map.layers[0].markerSettings = [
                {
                    visible: true, height: 20, width: 20,
                    dataSource: [{ Name: "USA 1", latitude: 38.8833, longitude: -77.0167 },
                    { Name: "USA 2", latitude: 38.8833, longitude: -77.0167 },
                    { Name: "USA 3", latitude: 38.8833, longitude: -77.0167 },
                    { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                    { Name: "India Data1", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data2", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data3", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data4", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data5", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data6", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data7", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data8", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data9", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data10", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data11", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data12", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data13", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data14", latitude: 21.0000, longitude: 78.0000 },
                    { Name: "India Data15", latitude: 21.0000, longitude: 78.0000 },
                    { latitude: 48.8773406, longitude: 2.3299627, Name: 'Paris' },
                    { latitude: 48.0003406, longitude: 2.3299627, Name: 'Paris 1' },
                    { latitude: 52.4643089, longitude: 13.4107368, Name: 'Berlin' },
                    { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                    { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
                }
            ];
            map.refresh();
        });
        it('Click on some another cluster markers and check the previous one is merged', () => {
            let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_0_cluster_0');
            let triger: MouseEvents = new MouseEvents();
            triger.clickEvent(element);
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_0_cluster_0');
            expect(element['style'].visibility === '' || element['style'].visibility === 'hidden').toBe(true);
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_2');
            expect(element['style'].visibility === 'visible' || element['style'].visibility === 'hidden').toBe(true);
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_6');
            expect(element['style'].visibility === 'hidden').toBe(true);

            //When we click on the maps, then expanded markers should be merged
            element = document.getElementById(map.element.id + '_Zooming_ToolBar_ZoomIn_Rect');
            let eventObj: Object = {
                target: element,
                type: 'touchstart',
                stopImmediatePropagation: prevent,
                pageX: element.getBoundingClientRect().left,
                pageY: element.getBoundingClientRect().top
            };
            map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_0_cluster_0');
            expect(element['style'].visibility === '' || element['style'].visibility === 'hidden').toBe(true);
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_2');
            expect(element['style'].visibility === '' || element['style'].visibility === 'hidden').toBe(true);

            //After the zoom then expand the markers and pan the map, there should markers is expanded state
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_0_cluster_0');
            triger = new MouseEvents();
            triger.clickEvent(element);
            element = document.getElementById(map.element.id + '_LayerIndex_0_shapeIndex_26_dataIndex_undefined');
            triger = new MouseEvents();
            triger.dragAndDropEvent(element, 250, 250, 250, 280, 'touch', map);
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_0_cluster_0');
            expect(element['style'].visibility === 'hidden' || element['style'].visibility === '').toBe(true);
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_2');
            expect(element['style'].visibility === 'visible').toBe(true);
            // when click on maps, expanded marker will be merged.
            element = document.getElementById(map.element.id + '_LayerIndex_0_shapeIndex_64_dataIndex_undefined');
            map.zoomModule.isSingleClick = true;
            triger.clickEvent(element);
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_0_cluster_0');
            expect(element['style'].visibility === 'visible' || element['style'].visibility === '').toBe(true);
            element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_2');
            expect(element['style'].visibility === 'hidden').toBe(true);
        });
        it('Show Tooltip for marker on click and checking in zoom panning', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Zooming_ToolBar_ZoomIn_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
                let triger: MouseEvents = new MouseEvents();
                //Show tooltip on click on the marker
                element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_19');
                let x: number = element.getClientRects()[0]['x'];
                let y: number = element.getClientRects()[0]['y'];
                triger.mouseupEvent(element, x, y, x + 5, y + 5);
                let tooltipEle: Element = document.getElementById(map.element.id + '_mapsTooltip');
                expect(tooltipEle['style'].visibility === '' || tooltipEle['style'].visibility === 'visible').toBe(true);
                triger.dragAndDropEvent(element, 250, 250, 250, 280, 'touch', map);
                expect(tooltipEle['style'].visibility === '' || tooltipEle['style'].visibility === 'visible').toBe(true);
            };
            map.tooltipDisplayMode = 'Click';
            map.layers[0].markerSettings[0].tooltipSettings.visible = true;
            map.layers[0].markerSettings[0].tooltipSettings.valuePath = 'Name';
            map.refresh();
        });
        it('Show Tooltip for marker on click and checking in zoom panning for OSM maps', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Zooming_ToolBar_ZoomIn_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
                let triger: MouseEvents = new MouseEvents();
                //Show tooltip on click on the marker
                element = document.getElementById(map.element.id + '_LayerIndex_0_MarkerIndex_0_dataIndex_19');
                let x: number = element.getClientRects()[0]['x'];
                let y: number = element.getClientRects()[0]['y'];
                triger.mouseupEvent(element, x, y, x + 5, y + 5);
                let tooltipEle: Element = document.getElementById(map.element.id + '_mapsTooltip');
                expect(tooltipEle['style'].visibility === '' || tooltipEle['style'].visibility === 'visible').toBe(true);
                triger.dragAndDropEvent(element, 250, 250, 250, 280, 'touch', map);
                expect(tooltipEle['style'].visibility === '' || tooltipEle['style'].visibility === 'visible').toBe(true);
            };
            map.layers[0].layerType = 'OSM';
            map.refresh();
        });
        it('Checking marker template with zooming', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Zooming_ToolBar_ZoomIn_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
                element = document.getElementById(map.element.id + '_Markers_Group');
                expect(element.childElementCount === 0).toBe(true);
            };
            map.layers[0].markerSettings = [
                {
                    visible: true, height: 20, width: 20,
                    dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 },
                    { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }],
                    template: '<div>{{:Name}}</div>'
                }
            ];
            map.layers[0].markerClusterSettings.allowClustering = true;
            map.refresh();
        });
        it('Checking single click zooming', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_Zooming_ToolBar_Reset_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
                element = document.getElementById(map.element.id + '_LayerIndex_0_shapeIndex_134_dataIndex_undefined');
                map.zoomModule.isSingleClick = true;
                eventObj = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                expect(map.scale === 1).toBe(true);
                map.zoomModule.click(<PointerEvent>eventObj);
                expect(map.scale === 2).toBe(true);
            };
            map.zoomSettings.zoomOnClick = true;
            map.layers[0].layerType = 'Geometry';
            map.refresh();
        });
    });
	describe('Zooming the map with marker distance in OSM map', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let spec: Element;
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                zoomSettings: {
                    enable: true,
                    shouldZoomInitially :true
                   // toolbars: ['Zoom', 'ZoomIn', 'ZoomOut', 'Pan', 'Reset']
                },
                layers: [
                    {
                        layerType:'OSM'
                    },
                    {
                        
                    }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });
        it('Marker zooming with OSM map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [{
                visible: true,
                height: 30,
                width: 30,
                template: "<div><img src=http://js.syncfusion.com/demos/web/Images/map/pin.png></img></div>",
                dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 },
                { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                { Name: "India", latitude: 21.0000, longitude: 78.0000 },
                { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
            }];
            map.layers[0].layerType = 'OSM';
            map.enablePersistence = true;
            map.refresh();
        });
        it('Marker template checking with OSM map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerClusterSettings = {
                allowClustering: true,
                shape: 'Image',
                height:30,
                width:30,
                fill: 'blue',
                opacity: 0.5, 
                imageUrl :'./images/cluster_icon.svg'                            
            },
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    dataSource: [
                        { latitude: 37.6276571, longitude: -122.4276688, name: 'San Bruno'},
                            { latitude: 33.5302186, longitude: -117.7418381, name: 'Laguna Niguel'},
                            { latitude: 40.7424509, longitude: -74.0081468, name: 'New York'},
                            { latitude: -23.5268201, longitude: -46.6489927, name: 'Bom Retiro'},
                            { latitude: 43.6533855, longitude: -79.3729994, name: 'Toronto'},
                            { latitude: 48.8773406, longitude: 2.3299627, name: 'Paris'},
                            { latitude: 52.4643089, longitude: 13.4107368, name: 'Berlin'},
                            { latitude: 19.1555762, longitude: 72.8849595, name: 'Mumbai'},
                            { latitude: 35.6628744, longitude: 139.7345469, name: 'Minato'},
                            { latitude: 51.5326602, longitude: -0.1262422, name: 'London'}
                    ]
                },
                {
                    visible: true,
                    template: '<div id="marker1" class="markerTemplate">Asia' +
                        '</div>',
                    dataSource: [
                        { latitude: 50.32087157990324, longitude: 90.015625 }
                    ],
                    animationDuration: 0
                },];
            map.layers[0].layerType = 'OSM';
            map.refresh();
        });
    });
    describe('Zooming the map with marker distance in default map', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let prevent: Function = (): void => {
            //Prevent Function
        };
        let spec: Element;
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                zoomSettings: {
                    enable: true,
                    shouldZoomInitially :true,
                    toolbars: ['Zoom', 'ZoomIn', 'ZoomOut', 'Pan', 'Reset']
                },
                layers: [
                    {
                        shapeData: MapData
                    },
                    {
                        
                    }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });
        it('Marker zooming with default map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [{
                visible: true,
                height: 30,
                width: 30,
                template: "<div><img src=http://js.syncfusion.com/demos/web/Images/map/pin.png></img></div>",
                dataSource: [{ Name: "USA", latitude: 38.8833, longitude: -77.0167 },
                { Name: "Brazil", latitude: -15.7833, longitude: -47.8667 },
                { Name: "India", latitude: 21.0000, longitude: 78.0000 },
                { Name: "China", latitude: 35.0000, longitude: 103.0000 },
                { Name: "Indonesia", latitude: -6.1750, longitude: 106.8283 }]
            }];
            map.layers[0].shapeData = MapData;
            map.enablePersistence = true;
            map.refresh();
        });
        it('Marker template checking with default map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerClusterSettings = {
                allowClustering: true,
                shape: 'Image',
                height:30,
                width:30,
                fill: 'blue',
                opacity: 0.5, 
                imageUrl :'./images/cluster_icon.svg'                            
            },
            map.layers[0].markerSettings = [
                {
                    visible: true,
                    dataSource: [
                        { latitude: 37.6276571, longitude: -122.4276688, name: 'San Bruno'},
                            { latitude: 33.5302186, longitude: -117.7418381, name: 'Laguna Niguel'},
                            { latitude: 40.7424509, longitude: -74.0081468, name: 'New York'},
                            { latitude: -23.5268201, longitude: -46.6489927, name: 'Bom Retiro'},
                            { latitude: 43.6533855, longitude: -79.3729994, name: 'Toronto'},
                            { latitude: 48.8773406, longitude: 2.3299627, name: 'Paris'},
                            { latitude: 52.4643089, longitude: 13.4107368, name: 'Berlin'},
                            { latitude: 19.1555762, longitude: 72.8849595, name: 'Mumbai'},
                            { latitude: 35.6628744, longitude: 139.7345469, name: 'Minato'},
                            { latitude: 51.5326602, longitude: -0.1262422, name: 'London'}
                    ]
                },
                {
                    visible: true,
                    template: '<div id="marker1" class="markerTemplate">Asia' +
                        '</div>',
                    dataSource: [
                        { latitude: 50.32087157990324, longitude: 90.015625 }
                    ],
                    animationDuration: 0
                },];
            map.layers[0].shapeData = MapData;
            map.refresh();
        });
        it('Checking with Reset button with should zoom initially as true', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = getElementByID(map.element.id + '_Zooming_ToolBar_Reset_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
            };
            map.zoomSettings.shouldZoomInitially = true;
            map.refresh(); 
        });
        it('Checking with Zoom in button with shouldZoomInitially as true', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = getElementByID(map.element.id + '_Zooming_ToolBar_ZoomIn_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                for (let i: number = 0; i < 1; i++) {
                    map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
                }
            };
            map.zoomSettings.shouldZoomInitially = true;
            map.refresh(); 
        });
        it('Checking with Zoom in button', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = getElementByID(map.element.id + '_Zooming_ToolBar_ZoomIn_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                for (let i: number = 0; i < 2; i++) {
                    map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
                }
            };
            map.zoomSettings.zoomFactor = 3;
            map.zoomSettings.shouldZoomInitially = true;
            map.refresh(); 
        });
        it('Checking reset button with zooming after shouldZoomInitially as false', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = getElementByID(map.element.id + '_Zooming_ToolBar_Reset_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
            };
            map.zoomSettings.shouldZoomInitially = false;     
            map.refresh();
        });
    });
	describe('Zooming the map based on marker distance in India map', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let spec: Element;
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                zoomSettings: {
                    enable: true,
                    shouldZoomInitially :true
                   // toolbars: ['Zoom', 'ZoomIn', 'ZoomOut', 'Pan', 'Reset']
                },
                layers: [
                    {
                        shapeData:India_Map
                    },
                    {
                        
                    }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });
        it('Marker zooming with India map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [{
                visible: true,
                height: 30,
                width: 30,
                template: "<div><img src=http://js.syncfusion.com/demos/web/Images/map/pin.png></img></div>",
                dataSource: [{ Name: "Chennai", latitude: 13.018410, longitude: 80.223068 },
                { Name: "Mumbai", latitude: 19.076090, longitude: 72.877426 },
                { Name: "Kolakata", latitude: 22.572645, longitude: 88.363892 },
                { Name: "Gujarath", latitude: 22.140547, longitude: 73.184296 }
                ]
            }];
            map.layers[0].shapeData = India_Map;
            map.enablePersistence = true;
            map.refresh();
        });
    });
    describe('Zooming the map based on marker distance in static google map', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let prevent: Function = (): void => {
        };
        let spec: Element;
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                zoomSettings: {
                    enable: true,
                    shouldZoomInitially :true
                   // toolbars: ['Zoom', 'ZoomIn', 'ZoomOut', 'Pan', 'Reset']
                },
                layers: [
                    {
                        layerType:'GoogleStaticMap', 
                        key:'AIzaSyBhIDLGwyY8654k7_Ziss1Nx-mKO6kwvcw',
                    },
                    {
                        
                    }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });
        it('Marker zooming in static google map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [{
                visible: true,
                height: 30,
                width: 30,
                template: "<div><img src=http://js.syncfusion.com/demos/web/Images/map/pin.png></img></div>",
                dataSource: [{ Name: "Chennai", latitude: 13.018410, longitude: 80.223068 },
                { Name: "Mumbai", latitude: 19.076090, longitude: 72.877426 },
                { Name: "Kolakata", latitude: 22.572645, longitude: 88.363892 },
                { Name: "Gujarath", latitude: 22.140547, longitude: 73.184296 }
                ]
            }];
            map.layers[0].layerType = 'GoogleStaticMap';
            map.layers[0].key='AIzaSyBhIDLGwyY8654k7_Ziss1Nx-mKO6kwvcw';
            map.refresh();
        });
        it('Marker zooming in google map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(map.element.id + '_LayerIndex_0_Markers_Template_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            map.layers[0].markerSettings = [{
                visible: true,
                height: 30,
                width: 30,
                template: "<div><img src=http://js.syncfusion.com/demos/web/Images/map/pin.png></img></div>",
                dataSource: [{ Name: "Chennai", latitude: 13.018410, longitude: 80.223068 },
                { Name: "Mumbai", latitude: 19.076090, longitude: 72.877426 },
                { Name: "Kolakata", latitude: 22.572645, longitude: 88.363892 },
                { Name: "Gujarath", latitude: 22.140547, longitude: 73.184296 }
                ]
            }];
            map.layers[0].layerType = 'Google';
            map.refresh();
        });
        it('Marker Template is hidden when the template is placed outside of the map', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let element: Element = getElementByID(map.element.id + '_Zooming_ToolBar_ZoomIn_Rect');
                let eventObj: Object = {
                    target: element,
                    type: 'touchstart',
                    stopImmediatePropagation: prevent,
                    pageX: element.getBoundingClientRect().left,
                    pageY: element.getBoundingClientRect().top
                };
                for (let i: number = 0; i < 2; i++) {
                    map.zoomModule.performToolBarAction(<PointerEvent>eventObj);
                }
            };
            map.layers[0].markerSettings = [{
                visible: true,
                height: 30,
                width: 30,
                template: "<div><img src=http://js.syncfusion.com/demos/web/Images/map/pin.png></img></div>",
                dataSource: [{ Name: "Chennai", latitude: 13.018410, longitude: 80.223068 },
                { Name: "Mumbai", latitude: 19.076090, longitude: 72.877426 },
                { Name: "Kolakata", latitude: 22.572645, longitude: 88.363892 },
                { Name: "Gujarath", latitude: 22.140547, longitude: 73.184296 }
                ]
            },
            {
                visible: true,
                tooltipSettings: {
                    visible: true
                },
                template: '<div id="marker1" class="markerTemplate">Asia' +
                    '</div>',
                dataSource: [
                    { latitude: 50.32087157990324, longitude: 90.015625 }
                ],
                animationDuration: 0
            },
            {
                visible: true,
                template: '<div id="marker2" class="markerTemplate">Australia' +
                    '</div>',
                dataSource: [
                    { latitude: -25.88583769986199, longitude: 134.296875 }
                ],
                animationDuration: 0
            },
            {
                visible: true,
                template: '<div id="marker3" class="markerTemplate">Africa' +
                    '</div>',
                dataSource: [
                    { latitude: 16.97274101999902, longitude: 16.390625 }
                ],
                animationDuration: 0
            },
            {
                visible: true,
                template: '<div id="marker4" class="markerTemplate">Europe' +
                    '</div>',
                dataSource: [
                    { latitude: 49.95121990866204, longitude: 18.468749999999998 }
                ],
                animationDuration: 0,
            },
            {
                visible: true,
                template: '<div id="marker5" class="markerTemplate" style="width:50px">North America' +
                    '</div>',
                dataSource: [
                    { latitude: 59.88893689676585, longitude: -109.3359375 }
                ],
                animationDuration: 0
            },
            {
                visible: true,
                template: '<div id="marker6" class="markerTemplate" style="width:50px">South America' +
                    '</div>',
                dataSource: [
                    { latitude: -6.64607562172573, longitude: -55.54687499999999 }
                ],
                animationDuration: 0
            },
        ];
            map.layers[0].layerType = 'GoogleStaticMap';
            map.layers[0].key='AIzaSyBhIDLGwyY8654k7_Ziss1Nx-mKO6kwvcw';
            map.refresh();
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
