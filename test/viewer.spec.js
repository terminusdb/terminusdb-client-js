const expect = require('chai').expect;

var View = require('../lib/viewer/woqlView');

/*describe('Viewer rules', function () { 
    it('check the View Rule',function(){
        const woqlRule=View.rule();
        woqlRule.literal(true).type("xdd:coordinatePolygon").scope("cell")
        const jsonObj= {pattern: {literal : true, type: ["xdd:coordinatePolygon"], scope: "cell"}}
        expect(woqlRule.json()).to.eql(jsonObj);
    })
    it('check the View Table',function(){
        const woqlConfig =View.table();
        woqlConfig.column_order("a", "b", "c").pager(true).pagesize(12).changesize(false);
        const jsonObj= {rules: [], table: {column_order: ["v:a", "v:b", "v:c"], pager: true, pagesize: 12, changesize: false}}
        const serial = woqlConfig.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Graph',function(){
        const woqlConfig = View.graph();
        woqlConfig.literals(true).source("a").fontfamily("font").show_force(true).fix_nodes(false).explode_out(true).selected_grows(false).width(100).height(100).edges(["a", "b"]);
        const jsonObj= {rules: [], graph: { edges: [["v:a", "v:b"]], explode_out: true, fix_nodes: false, fontfamily: "font", height: 100, literals: true, selected_grows: false, show_force: true, source: "v:a", width: 100}}
        const serial = woqlConfig.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Chooser',function(){
        const woqlConfig = View.chooser();
        var mchange = function(val){alert(val)};
        woqlConfig.change(mchange).show_empty("frank").sort("b").direction("asc").values("x").titles("y").labels("x");
        const jsonObj= {rules: [], chooser: { change: mchange, direction: "asc", labels: "v:x", show_empty: "frank", sort: "v:b", titles: "v:y", values: "v:x"}}
        const serial = woqlConfig.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Stream',function(){
        const woqlConfig = View.stream();
        woqlConfig.template("My stream template");
        const jsonObj= {rules: [], stream: { template: "My stream template"}}
        const serial = woqlConfig.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Chart',function(){
        const woqlConfig = View.chart();
        woqlConfig.xAxis("a");
        woqlConfig.bar("b");
        woqlConfig.point("c");
        woqlConfig.line("d");
        woqlConfig.area("x");
        const jsonObj= {rules: [
            {pattern: {scope: "XAxis", variables: ["v:a"]}, rule: {}},
            {pattern: {scope: "Bar", variables: ["v:b"]}, rule: {}},
            {pattern: {scope: "Point", variables: ["v:c"]}, rule: {}},
            {pattern: {scope: "Line", variables: ["v:d"]}, rule: {}},
            {pattern: {scope: "Area", variables: ["v:x"]}, rule: {}}
        ], chart: {}}
        const serial = woqlConfig.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Document',function(){
        const woqlConfig = View.document();
        woqlConfig.load_schema(false);
        const jsonObj= {rules: [], frame: {load_schema: false}}
        const serial = woqlConfig.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Universal Rules',function(){
        const config=View.table();
        var rend = function(){alert("r")};
        config.column("a").literal(true).type("xdd:coordinatePolygon").value(32).size(43).icon({}).color([0,0,0]).text("hello").border({}).renderer("world").render(rend).click(rend).hover(rend).args({}).hidden(true);
        const jsonObj= {table: {}, rules: [{pattern: {literal : true, scope: "column", type: ["xdd:coordinatePolygon"], value: [32], variables: ["v:a"]}, 
            rule: {
                args: {},
                border: {},
                click: rend,
                color: [0,0,0],
                hidden: true,
                hover: rend,
                icon: {},
                render: rend,
                renderer:"world",
                size: 43,
                text: "hello",
            }
        }]};
        const serial = config.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Table Rules',function(){
        const config=View.table();
        var rend = function(){alert("r")};
        config.row().literal(true).type("xdd:coordinatePolygon").value(32).size(43).icon({}).color([0,0,0]).text("hello").border({}).renderer("world").render(rend).click(rend).hover(rend).args({}).hidden(true).header("fra");

        const jsonObj= {table: {}, rules: [{pattern: {literal : true, scope: "row", type: ["xdd:coordinatePolygon"], value: [32]}, 
            rule: {
                args: {},
                border: {},
                click: rend,
                color: [0,0,0],
                header: "fra",
                hidden: true,
                hover: rend,
                icon: {},
                render: rend,
                renderer:"world",
                size: 43,
                text: "hello",
            }
        }]};
        const serial = config.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Graph Node Rules',function(){
        const config=View.graph();
        var rend = function(){alert("r")};
        config.node().literal(true).type("xdd:coordinatePolygon").value(32).size(43).icon({}).color([0,0,0]).text("hello").border({}).renderer("world").render(rend).click(rend).hover(rend).args({}).hidden(true).
        charge(24).collisionRadius(21).arrow({}).distance(34).symmetric(false).weight(100);

        const jsonObj= {graph: {}, rules: [{pattern: {literal : true, scope: "row", type: ["xdd:coordinatePolygon"], value: [32]}, 
            rule: {
                args: {},
                arrow: {},
                border: {},
                charge: 24,
                click: rend,
                collisionRadius: 21,
                color: [0,0,0],
                distance: 34,
                hidden: true,
                hover: rend,
                icon: {},
                render: rend,
                renderer:"world",
                size: 43,
                symmetric: false,
                text: "hello",
                weight: 100
            }
        }]};
        const serial = config.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Graph Edge Rules',function(){
        const config=View.graph();
        var rend = function(){alert("r")};
        config.edge("a", "b").literal(true).type("xdd:coordinatePolygon").value(32).size(43).icon({}).color([0,0,0]).text("hello").border({}).renderer("world").render(rend).click(rend).hover(rend).args({}).hidden(true).
        charge(24).collisionRadius(21).arrow({}).distance(34).symmetric(false).weight(100);

        const jsonObj= {graph: {}, rules: [{pattern: {literal : true, scope: "edge", source: "v:a", target: "v:b", type: ["xdd:coordinatePolygon"], value: [32], variables: ['v:a']}, 
            rule: {
                args: {},
                arrow: {},
                border: {},
                charge: 24,
                click: rend,
                collisionRadius: 21,
                color: [0,0,0],
                distance: 34,
                hidden: true,
                hover: rend,
                icon: {},
                render: rend,
                renderer:"world",
                size: 43,
                symmetric: false,
                text: "hello",
                weight: 100
            }
        }]};
        const serial = config.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })
    it('check the View Chart Rules',function(){
        const config=View.chart();
        var rend = function(){alert("r")};
        
        config.title("MY CHART TEST").layout("vertical");
        config.bar("a").legendType('square').label('my bar').fill("#00ff00").stroke("#ff0000").strokeWidth(34);

        config.xAxis("b").labelRotate(32.1).type('number').axisDomain(['dataMin - 1', 'dataMax  + 1'])

        const jsonObj= {"chart":{
                              "title":"MY CHART TEST",
                              "layout":"vertical"
                           },
                           "rules":[
                              {
                                 "pattern":{
                                    "scope":"Bar",
                                    "variables":[
                                       "v:a"
                                    ]
                                 },
                                 "rule":{
                                    "legendType":"square",
                                    "label":"my bar",
                                    "fill":"#00ff00",
                                    "stroke":"#ff0000",
                                    "strokeWidth":34
                                 }
                              },
                              {
                                 "pattern":{
                                    "scope":"XAxis",
                                    "variables":[
                                       "v:b"
                                    ]
                                 },
                                 "rule":{
                                    "labelRotate":32.1,
                                    "type":"number",
                                    "domain":[
                                       "dataMin - 1",
                                       "dataMax  + 1"
                                    ]
                                 }
                              }
                           ]
                        }

        //console.log(JSON.stringify(config.json()));
        const serial = config.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })

    it('check the View Chooser Rules',function(){
        const config=View.chooser();
        var rend = function(){alert("r")};
        config.rule("b").literal(true).type("xdd:coordinatePolygon").value(32).size(43).icon({}).color([0,0,0]).text("hello").border({}).renderer("world").render(rend).click(rend).hover(rend).args({}).hidden(true).
        label("arse").values("hole").title("fub").selected(true);

        const jsonObj= {chooser: {}, rules: [{pattern: {literal : true, scope: "row", type: ["xdd:coordinatePolygon"], value: [32], variables: ["v:b"]}, 
            rule: {
                args: {},
                border: {},
                click: rend,
                color: [0,0,0],
                hidden: true,
                hover: rend,
                icon: {},
                label: "arse",
                render: rend,
                renderer:"world",
                selected: true,
                size: 43,
                text: "hello",
                title: "fub",
                values: "hole"
            }
        }]};
        const serial = config.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })

    it('check the View Stream Rules',function(){
        const config=View.stream();
        var rend = function(){alert("r")};
        config.row().literal(true).type("xdd:coordinatePolygon").value(32).size(43).icon({}).color([0,0,0]).text("hello").border({}).renderer("world").render(rend).click(rend).hover(rend).args({}).hidden(true).
        template("arse");

        const jsonObj= {stream: {}, rules: [{pattern: {literal : true, scope: "row", type: ["xdd:coordinatePolygon"], value: [32]}, 
            rule: {
                args: {},
                border: {},
                click: rend,
                color: [0,0,0],
                hidden: true,
                hover: rend,
                icon: {},
                render: rend,
                renderer:"world",
                size: 43,
                template: "arse",
                text: "hello",
            }
        }]};
        const serial = config.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })

    it('check the View Frame Rules',function(){
        const config=View.document();
        var rend = function(){alert("r")};
        config.all().literal(true).type("xdd:coordinatePolygon").value(32).renderer("abc").compare(rend).collapse(true).view("x").mode("edit").showDisabledButtons(false)
        .header("urp").headerStyle("aaa").showEmpty(true).dataviewer("y").render(rend).style("y").hidden(true).args({}).renderer("x").features([]).headerFeatures([]) ;

        const jsonObj= {frame: {}, rules: [{pattern: {literal : true, scope: "*", type: ["xdd:coordinatePolygon"], value: [32]}, 
            rule: {
                args: {},
                collapse: true,
                compare: rend,
                dataviewer: "y",
                features: [[]],
                header: "urp", 
                header_features: [[]],
                headerStyle: "aaa",
                hidden: true,
                mode: "edit",
                render: rend,
                renderer: "x",
                show_disabled_buttons: false,
                show_empty: true,
                style: "y",
                view: "x"

            }
        }]};
        const serial = config.json();
        expect(serial).to.eql(jsonObj);
        const nt = View.loadConfig(serial);
        expect(nt.json()).to.eql(serial);
    })



})*/
    