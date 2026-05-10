const axios = require('axios');
async function test() {
  try {
    const res = await axios.delete('http://localhost:5000/api/trips/123/stops/123', { headers: { Authorization: 'Bearer test' } });
    console.log(res.data);
  } catch(e) {
    console.log(e.response ? e.response.status + ' ' + e.response.statusText : e.message);
  }
}
test();
