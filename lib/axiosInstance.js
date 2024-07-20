const axios = require('axios').default;

// Add workaround for axios formdata issue
// Added transformRequest based on on issue resolution suggestion here:
// https://github.com/axios/axios/issues/5986#issuecomment-2029933275
const axiosInstance = axios.create({
  transformRequest: [(data) => data,
  ]
});

module.exports = axiosInstance;
