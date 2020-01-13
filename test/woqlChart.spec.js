const expect = require('chai').expect;
var WOQLChartConfig = require('../lib/viewer/chartConfig');

describe('woqlChart config', function () { 

	let woqlChart;
	
	beforeEach(function() {
	   	woqlChart = new WOQLChartConfig()
	});

	it("config type chart",function(){
		expect(woqlChart.type).to.equal('chart');

		woqlChart.xAxis("timestamp").label("Day").type("number");

		const json={"chart":{},"rules":[{"pattern":{"scope":"XAxis","variables":["v:timestamp"]}
										,"rule":{"label":"Day","type":"number"}}]}


		
		console.log(JSON.stringify(woqlChart.json()));

	})

})