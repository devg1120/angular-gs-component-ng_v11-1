import { Maps } from '../maps';
import { Tile, BingMapType } from '../index';

/**
 * Bing map src doc
 */
export class BingMap {
    /**
     * map instance
     */
    private maps: Maps;
    public subDomains: string[];
    public imageUrl: string;
    public maxZoom: string;
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    constructor(maps: Maps) {
        this.maps = maps;
    }

    public getBingMap(tile: Tile, key: string, type: BingMapType, language: string, imageUrl: string, subDomains: string[]): string {
        let quadKey: string = '';
        const maxZoom: number = Math.min(this.maps.tileZoomLevel, parseInt(this.maxZoom, 10));
        for (let i: number = maxZoom; i > 0; i--) {
            let digit: number = 0;
            const mask: number = 1 << (i - 1);
            if ((tile.x & mask) !== 0) {
                digit++;
            }
            if ((tile.y & mask) !== 0) {
                digit += 2;
            }
            quadKey = quadKey + '' + digit;
        }
        const subDomain: string = subDomains[Math.min(parseInt(quadKey.substr(quadKey.length - 1, 1), 10), subDomains.length)];
        imageUrl = imageUrl.replace('{quadkey}', quadKey).replace('{subdomain}', subDomain);
        return imageUrl += '&mkt=' + language + '&ur=IN&Key=' + key;
    }
}
