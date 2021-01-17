export = WOQLChartConfig;
declare function WOQLChartConfig(): void;
declare class WOQLChartConfig {
    type: string;
    constructor: typeof Config.ViewConfig;
    prettyPrint(): string;
    json(): {
        chart: {
            margin: any;
            title: any;
            description: any;
            layout: any;
        };
        rules: any;
    };
    loadJSON(config: any, rules: any): void;
    rules: WOQLChartRule[];
    title(title: any): any;
    _title: any;
    description(description: any): any;
    _description: any;
    layout(layout: any): any;
    _layout: any;
    margin(marginObj: any): any;
    _margin: any;
    create(client: any): WOQLChartConfig;
    xAxis(...vars: any[]): any;
    legend(...vars: any[]): any;
    yAxis(...vars: any[]): any;
    bar(...vars: any[]): any;
    line(...vars: any[]): any;
    point(...vars: any[]): any;
    area(...vars: any[]): any;
}
import Config = require("./viewConfig.js");
/**
 *
 * @param {Chart} scope
 */
declare function WOQLChartRule(): void;
declare class WOQLChartRule {
    constructor: typeof Config.WOQLViewRule;
    style(key: any, value: any): any;
    label(label: any): any;
    legendType(legendType: any): any;
    fillOpacity(fillOpacity: any): any;
    fill(color: any): any;
    stroke(color: any): any;
    strokeWidth(size: any): any;
    dot(isVisible: any): any;
    labelRotate(angle: any): any;
    padding(paddingObj: any): any;
    labelDateInput(labelDateInput: any): any;
    labelDateOutput(labelDateOutput: any): any;
    stackId(stackId: any): any;
    type(type: any): any;
    axisDomain(domainArr: any): any;
    colorEntry(propValue: any): any;
    customColors(colorsObj: any): any;
    payload(payloadArr: any): any;
    barSize(barSize: any): any;
}
