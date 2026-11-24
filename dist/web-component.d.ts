export declare const TAG_NAME = "heatmap-247";
export interface ElementRegistry {
    get(name: string): unknown;
    define(name: string, constructor: CustomElementConstructor): void;
}
declare const ElementBase: typeof HTMLElement;
export declare class Heatmap247Element extends ElementBase {
    #private;
    static get observedAttributes(): readonly string[];
    connectedCallback(): void;
    attributeChangedCallback(): void;
}
export declare function defineHeatmap247(registry?: ElementRegistry): void;
export {};
