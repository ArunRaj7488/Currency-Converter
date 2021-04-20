import React from "react";
import { Line } from "react-chartjs-2";
import "../Css/currencyConverter.css";
import axios from "axios";
import moment from "moment";

export default class CurrencyConverter extends React.Component {
  constructor(props) {
    super();
    this.state = {
      currency: "United State Dollar (USD)",
      currencyData: {},
      labels: [],
      coinData: [],
      currencyPrice: {},
      defaultPrice: "",
    };
  }

  ChartStateData = () => {
    let { labels, coinData } = this.state;
    return {
      labels,
      datasets: [
        {
          label: "rate",
          fill: true,
          lineTension: 0.5,
          backgroundColor: "rgba(52,168,83, 0.3)",
          borderColor: "rgba(52,168,83, 0.6)",
          borderWidth: 1,
          pointBackgroundColor: "rgba(52,168,83, 0.6)",
          data: coinData,
        },
      ],
    };
  };

  getCurrentCurrencyData = () => {
    axios
      .get("https://api.coindesk.com/v1/bpi/currentprice.json")
      .then((res) => {
        let currencyDetails = res["data"]["bpi"];
        this.setState({
          currencyPrice: currencyDetails,
          defaultPrice: currencyDetails["USD"].rate_float,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentDidMount() {
    this.getCurrentCurrencyData();
    this.generateChartData("USD");
  }

  onSelectionValue = (e) => {
    this.setState({ currency: e.target.value });
    if (e.target.value === "United State Dollar (USD)") {
      this.setState((state) => {
        return { currencyData: state.currencyPrice["USD"] };
      });
      this.generateChartData("USD");
    } else if (e.target.value === "British Pound Sterling (GBP)") {
      this.setState((state) => {
        return {
          currencyData: state.currencyPrice["GBP"],
        };
      });
      this.generateChartData("GBP");
    } else {
      this.setState((state) => {
        return {
          currencyData: state.currencyPrice["EUR"],
        };
      });
      this.generateChartData("EUR");
    }
  };

  generateChartData = (currencyName) => {
    let date = new Date();
    let currentDate = date;
    let endDate = moment(currentDate).format("YYYY-MM-DD");
    let dateBefore60Day = date.setDate(date.getDate() - 60);
    let startDate = moment(date).format("YYYY-MM-DD");
    axios
      .get(
        `https://api.coindesk.com/v1/bpi/historical/close.json?currency=${currencyName}&start=${startDate}&end=${endDate}`
      )
      .then((res) => {
        this.setState({
          labels: Object.keys(res["data"]["bpi"]),
          coinData: Object.values(res["data"]["bpi"]),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const Currency = [
      "United State Dollar (USD)",
      "British Pound Sterling (GBP)",
      "Euro (EUR)",
    ];
    let rate = this.state.currencyData.rate_float || this.state.defaultPrice;
    return (
      <div>
        <div className="navbar">
          <span>₿ Currency Converter </span>
        </div>
        <div className="main">
          <div className="card">
            <div className="dropdown">
              <h5>1 Bitcoin equals </h5>
              <select
                className="select_input"
                value={this.state.currency}
                onChange={this.onSelectionValue}
              >
                {Currency.map((item, i) => (
                  <option key={i} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {}
              <h1>{`${rate} ${this.state.currency}`}</h1>
            </div>
          </div>
          <div className="chart">
            <Line
              data={this.ChartStateData}
              options={{
                title: {
                  display: true,
                  text: "Last 60 Days Tends",
                  fontSize: 16,
                  fontColor: "#3333",
                },
                legend: {
                  display: false,
                  position: "right",
                },
                scales: {
                  xAxes: [
                    {
                      type: "time",
                      ticks: {
                        maxTicksLimit: 5,
                      },

                      gridLines: {
                        display: false,
                      },
                    },
                  ],

                  yAxes: [
                    {
                      gridLines: {
                        display: false,
                      },
                    },
                  ],
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
