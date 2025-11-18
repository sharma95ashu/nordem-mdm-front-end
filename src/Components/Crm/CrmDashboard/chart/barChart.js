import React, { useEffect, useState, useContext } from "react";
import { Bar } from "react-chartjs-2";
import { Flex, Spin, Empty, Typography, Segmented } from "antd";
import { ColorModeContext } from "Helpers/contexts";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { CARD_OPTIONS } from "CrmHelper/crmConstant";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = (props) => {
  const [showLoader, setShowLoader] = useState(props.loading || false);

  useEffect(() => {
    setShowLoader(props.loading);
  }, [props.loading]);

  const { mode: lightMode } = useContext(ColorModeContext);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.raw; // Adjusted for latest Chart.js versions
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: false,
          text: props.xField
        },
        grid: {
          color: function () {
            return lightMode ? "#ececec" : "#1f1f1f";
          }
        },
        ticks: {
          callback: function (val, index) {
            const label = this.getLabelForValue(val);
            return label?.length > 10 ? label.slice(0, 10) + "..." : label;
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: props.yField
        },
        grid: {
          color: function () {
            return lightMode ? "#ececec" : "#1f1f1f";
          }
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
          }
        }
      }
    }
  };

  const chartData = {
    labels: props?.data && props?.data?.map((item) => item[props.xField]),
    datasets: [
      {
        label: "Quantity",
        data: props?.data && props?.data?.map((item) => parseFloat(item[props.yField])),
        backgroundColor: "rgba(23, 85, 166, 0.9)",
        hoverBackgroundColor: "rgba(23, 85, 166, 1)"
      }
    ]
  };

  const handleSegment = (value) => {
    props?.setBarChartSegmentKey(value);
  };

  // wrap="wrap" align="flex-start"

  return (
    <div className="CommonChartSize">
      <Flex justify="space-between">
        <Typography.Title level={5}>{"Top Selling Product"}</Typography.Title>
        <Segmented options={CARD_OPTIONS} className="textCapitalize" onChange={handleSegment} />
      </Flex>
      {showLoader ? (
        <Flex justify="center" align="center" className="cardFullHeight">
          <Spin />
        </Flex>
      ) : props?.data && props?.data?.length > 0 ? (
        <div className="ChartHeight">
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <Flex justify="center" align="center" className="cardFullHeight" style={{ height: "100%" }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Flex>
      )}
    </div>
  );
};

export default BarChart;
