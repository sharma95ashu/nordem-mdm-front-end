import React, { useContext } from "react";
import { Flex, Spin, Empty, Typography, Segmented } from "antd";

import { ColorModeContext } from "Helpers/contexts";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
import { CARD_OPTIONS } from "CrmHelper/crmConstant";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const AreaChart = (props) => {
  const { mode: lightMode } = useContext(ColorModeContext);

  // Static data
  // const staticData = [
  //   { date: "2024-08-01", price: 100 },
  //   { date: "2024-08-02", price: 150 },
  //   { date: "2024-08-03", price: 120 },
  //   { date: "2024-08-04", price: 180 },
  //   { date: "2024-08-05", price: 170 },
  //   { date: "2024-08-06", price: 200 },
  //   { date: "2024-08-07", price: 190 }
  // ];

  const ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: function () {
            if (!lightMode) return "#1f1f1f";
            return "#ececec";
          }
        }
      },
      y: {
        grid: {
          color: function () {
            if (!lightMode) return "#1f1f1f";
            return "#ececec";
          }
        },
        beginAtZero: true
      }
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart"
    }
  };

  const chartData = {
    labels: props?.data?.map((item) =>
      (props?.reportKey === 'daily' || props?.reportKey === 'weekly')
        ? dayjs(item.date).format("DD/MM/YY")
        : dayjs(item.date).format("MMM")
    ),
    datasets: [
      {
        fill: true,
        label: "Amount",
        data: props?.data && props?.data?.map((item) => item.price),
        borderColor: "rgba(0, 191, 96, 1)",
        backgroundColor: "rgba(0, 191, 96, 0.1)",
        tension: 0.4
      }
    ]
  };

  const handleSegment = (value) => {
    props?.setSegmentKey(value);
  };

  //  align="flex-start" wrap="wrap"

  return (
    <div className="CommonChartSize">
      <Flex justify="space-between">
        <Typography.Title level={5}>{"Sales Summary"}</Typography.Title>
        <Segmented options={CARD_OPTIONS} className="textCapitalize" onChange={handleSegment} />
      </Flex>
      {props?.loading ? (
        <Flex width={"100%"} justify="center" className="cardFullHeight" align="center">
          <Spin />
        </Flex>
      ) : props?.data && props?.data?.length > 0 ? (
        <div className="ChartHeight">
          <Line options={ChartOptions} data={chartData} />
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

export default AreaChart;
