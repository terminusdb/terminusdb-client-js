const { expect } = require('chai');
const WOQLChartConfig = require('../lib/viewer/chartConfig');

describe('woqlChart config', () => {
  let woqlChart;

  beforeEach(() => {
	   	woqlChart = new WOQLChartConfig();
  });

  it('config type chart', () => {
    expect(woqlChart.type).to.equal('chart');

    woqlChart.xAxis('timestamp').label('Day').type('number');

    const json = {
      chart: {},
      rules: [{
        pattern: { scope: 'XAxis', variables: ['v:timestamp'] },
        rule: { label: 'Day', type: 'number' },
      }],
    };

    // console.log(JSON.stringify(woqlChart.json()));
  });
});
