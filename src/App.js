import React, { useState } from "react";
import axios from 'axios';
import { Input, Statistic, Card, Tabs, Button, Table } from "antd";

import "./App.css";

const { Search } = Input;
const { TabPane } = Tabs;

function App() {
  const [loading, setLoading] = useState({
    search: false,
    hits: false
  });
  const [resultReadyStatus, setResultReadyStatus] = useState({
    search: false,
    hits: false
  })
  const [errors, setErrors] = useState({
    hits: {
      status: false,
      message: ""
    },
    search: {
      status: false,
      message: ""
    }
  });
  const [cardData, setCardData] = useState({
    bank: "",
    scheme: "",
    type: ""})

  const [stats, setStats] = useState({
    start: 1,
    limit: 5,
    size: 0,
    payload: []
  })


  const handleSearch = (value, event) => {
    console.log(errors);
    if (!isNaN(Number(value))) {
      setLoading({...loading, search: true});
      axios
      .get("http://localhost:8080/card-scheme/verify/" + value)
      .then(response => {
        const { search } = errors;
        search.status = false;
        search.message = '';
        const bank = response.data.payload.bank;
        const scheme = response.data.payload.scheme;
        const type = response.data.payload.type;
        setLoading({...loading, search: false});
        setCardData({bank, scheme, type});
        setResultReadyStatus({...resultReadyStatus, search: true});
      })
      .catch(err => {
        const { search } = errors;
        search.status = !err.response.data.success;
        search.message = err.response.data.message;
        console.log(errors);
        setErrors({...errors, search});
        setLoading({...loading, search: false});
        setResultReadyStatus({...resultReadyStatus, search: true});
        console.log(err.response)
      })
    }
  }

  const handleControlChange = e => {
    setStats({ ...stats, [e.target.name]: e.target.value });
  }

  const getNumberOfHits = () => {
    setLoading({...loading, hits: true});
    axios
      .get('http://localhost:8080/card-scheme/stats', {
        params: {
          start: stats.start,
          limit: stats.limit
        }
      })
      .then(response => {
        const { hits } = errors;
        hits.status = false;
        hits.message = '';
        const start = response.data.start;
        const limit = response.data.limit;
        const size = response.data.size;
        const payload = Object.entries(response.data.payload).map((item, index) => {
          return {
            key: index + 1,
            number: item[0],
            hits: item[1]
          }
        })
        setStats({start, limit, size, payload});
        setLoading({...loading, hits: false});
        setResultReadyStatus({...resultReadyStatus, hits: true});
      })
      .catch(err => {
        const { hits } = errors;
        hits.status = !err.response.data.success;
        hits.message = err.response.data.message;
        console.log(errors);
        setErrors({...errors, hits});
        setLoading({...loading, hits: false});
        setResultReadyStatus({...resultReadyStatus, hits: true});
        console.log(err.response);
      })
  }

  const columns = [
    {
      title: 'Card Number',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'Number of Hits',
      dataIndex: 'hits',
      key: 'hits'
    }
  ];

  let searchOutput = "";
  if (resultReadyStatus.search) {
    const { search } = errors;
    if (search.status) {
      searchOutput = (<p className="error">{search.message}</p>);
    } else {
      searchOutput = (<div className="statistics">
      <Card>
        <Statistic title="BANK" value={cardData.bank} />
      </Card>

      <Card>
        <Statistic title="SCHEME" value={cardData.scheme} />
      </Card>
      <Card>
        <Statistic title="TYPE" value={cardData.type} />
      </Card>
    </div>)
    }
  }

  let hitsOutput = "";
  if (resultReadyStatus.hits) {
    const { hits } = errors;
    console.log(hits);
    if (hits.status) {
      hitsOutput = (<p className="error">{hits.message}</p>);
    } else {
      hitsOutput = (<div>
        <Table pagination={false} dataSource={stats.payload} columns={columns} />
        <div className="summary"><strong>Summary:</strong></div>
        <div className="summary-details">
          <Statistic title="Start" value={stats.start} />
          <Statistic title="Limit" value={stats.limit} />
          <Statistic title="Size" value={stats.size} />
        </div>
      </div>);
    }
  }

  return (
    <div className="App">
      <main className="main">
        <h1>Every Information in one place...</h1>
        <div className="card-container">
          <Tabs type="card">
            <TabPane tab="Verify Card Number" key="1">
              <div className="search-container">
                <Search
                  placeholder="Enter a card number"
                  loading={loading.search}
                  size="large"
                  enterButton="Verify"
                  onSearch={handleSearch}
                />
              {/* {inValid && <p className="error">must be a number containing 6 to 16 digits</p> } */}
              </div>
              {searchOutput}
            </TabPane>
            <TabPane tab="Get Number of Hits" key="2">
              <div className="controls">
                <Input name="start" size="large" type="number" placeholder="Enter Start" onChange={handleControlChange} />
                <Input name="limit" size="large" type="number" placeholder="Enter Limit" onChange={handleControlChange} />
                <Button onClick={getNumberOfHits} type="primary" size="large" loading={loading.hits}>
                  Get Hits
                </Button>
              </div>
              {hitsOutput}
            </TabPane>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default App;
