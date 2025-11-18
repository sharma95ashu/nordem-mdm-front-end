/* eslint-disable no-unused-vars */
import { DownloadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Row,
  Select,
  Spin,
  Table
} from "antd";
import dayjs from "dayjs";
import { batchTypes, DATEFORMAT, MDM_PAGINATION, PermissionAction } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  downloadExcelData,
  downloadJsonAsPDF
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import React, { memo, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
const { RangePicker } = DatePicker;

function RegistrationList({ activeTab }) {
  const navigate = useNavigate();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [batchType, setBatchType] = useState("");
  const [filterTermData, setFilterTermData] = useState({});
  const [messageApi, contextHolder] = message.useMessage();
  const [date, setDate] = useState("");

  const [isDownloading, setIsDownloading] = useState(false); // State for spinner
  const columns = [
    {
      title: "Batch Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type)
    },
    {
      title: "Date & Time Slot",
      dataIndex: "time_slot",
      key: "time_slot"
    },
    {
      title: "Total Attendees",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => a.total - b.total
    }
  ];
  const [tableData, setTableData] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1, // Current page
    pageSize: 10, // Default page size
    total: 0 // Total items (fetched dynamically)
  });
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    if (activeTab === "1") {
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? fetchAllSummary({
            current: 1,
            pageSize: 10,
            searchTerm: ""
          })
        : navigate("/", { state: { from: null }, replace: true });

      setBreadCrumb({
        title: "Udaan",
        icon: "",
        titlePath: Paths.udaanReport,
        subtitle: "Registration Summary",
        path: Paths.users
      });
    }
  }, [activeTab]);

  // Handle pagination changes
  const handleTableChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));
    fetchAllSummary({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      searchTerm: searchTerm
    });
  };

  //Function to search by searchTerm
  const handleSearchTerm = (val) => {
    // API Call to fetch all details
    setSearchTerm(val);
    fetchAllSummary({
      current: 1,
      pageSize: 10,
      searchTerm: val
    });
  };

  //Function to run when the searchTerm changes
  const onChangeSearchTerm = (e) => {
    // API Call to fetch all details
    if (e.target.value === "") {
      fetchAllSummary({
        current: 1,
        pageSize: 10,
        searchTerm: ""
      });
      setPagination((prev) => ({
        current: 1,
        pageSize: 10
      }));
    }
    setSearchTerm(e.target.value);
  };

  //APi call fetching all registered Users
  const { mutate: fetchAllSummary, isLoading: loadingUsers } = useMutation(
    (data) => {
      const batchType = form.getFieldValue("batch_type");
      return apiService.getAllSummary(
        data.current,
        data.pageSize,
        data.searchTerm,
        data.filterTerm,
        batchType
      );
    },
    {
      onSuccess: (res) => {
        if (res?.data?.data?.length > 0) {
          setTableData(res?.data?.data);
          setPagination((prev) => ({
            ...prev,
            total: res?.data?.total_count
          }));
        } else if (res?.data?.data?.length == 0) {
          setTableData([]);
          setPagination((prev) => ({ ...prev, total: res?.data?.total_count }));
        }
      },
      onError: (error) => {
        console.error("ERROR:", error);
      }
    }
  );

  //Function to get all the Summary of the Users
  const onFinish = (values) => {
    const dateRange = values.date_filter || []; // Get selected date range from the form

    let filterTerm = {};

    // Apply date filter if selected
    if (dateRange.length === 2) {
      filterTerm.startDate = dateRange[0].format("DD MMMM YYYY"); // Format: 7 March 2025
      filterTerm.endDate = dateRange[1].format("DD MMMM YYYY"); // Format: 21 March 2025
    }
    setFilterTermData(filterTerm);
    fetchAllSummary({
      current: 1,
      pageSize: 10,
      searchTerm: searchTerm,
      filterTerm: encodeURIComponent(JSON.stringify(filterTerm)) // Encode filterTerm
    });

    setPagination({ current: 1, pageSize: 10 });
  };

  //Function to get all the Summary of the Users
  const onClearSearchTerm = () => {
    let filterTerm = {};

    // Get the selected date range
    const dateRange = form.getFieldValue("date_filter");

    if (dateRange && dateRange.length === 2) {
      filterTerm.startDate = dayjs(dateRange[0]).format("DD MMMM YYYY"); // Format: 08 March 2025
      filterTerm.endDate = dayjs(dateRange[1]).format("DD MMMM YYYY"); // Format: 15 March 2025
    }

    // Send filterTerm with the request
    fetchAllSummary({
      current: 1,
      pageSize: 10,
      searchTerm: "",
      filterTerm: encodeURIComponent(JSON.stringify(filterTerm)) // Encode filterTerm
    });

    // Reset pagination
    setPagination({ current: 1, pageSize: 10 });
  };

  //APi call to download the registered Users
  const { mutate: downloadSummaryOfUsers, isLoading: downloadingUsers } = useMutation(
    (data) => {
      const batchType = form.getFieldValue("batch_type");
      data.filterTerm = encodeURIComponent(JSON.stringify(data.filterTerm));
      setIsDownloading(true); // Start spinner before request
      return apiService.downloadSummaryOfUsers(data.searchTerm, data.filterTerm, batchType);
    },
    {
      onSuccess: (res, variables) => {
        if (res?.data?.data?.length > 0) {
          // Format the data based on your provided columns
          const formattedData = res.data.data.map((item) => ({
            "Batch Type": item.type,
            "Date & Time Slot": item.time_slot,
            Total: item.total
          }));

          if (variables.type === "Pdf") {
            downloadJsonAsPDF(formattedData, "Users Summary");
          } else {
            downloadExcelData(formattedData, "Registration_Summary"); // Convert data and download Excel
          }
        } else if (res?.data?.data?.length == 0) {
          messageApi.open({
            type: "warning",
            content: "No data available for download!"
          });
        }
      },
      onSettled: () => {
        setIsDownloading(false); // Stop spinner after request completes
      },
      onError: (error) => {
        console.error("ERROR:", error);
      }
    }
  );

  //Function to download to Excel Or Pdf
  const handleDownload = (type) => {
    downloadSummaryOfUsers({
      type: type,
      searchTerm: searchTerm,
      filterTerm: filterTermData // Encode filterTerm
    });
  };

  //Function to run when the date filter is cleared
  const onDateChange = (val) => {
    if (!val || val.length === 0) {
      fetchAllSummary({
        current: 1,
        pageSize: 10,
        searchTerm: searchTerm
      });
      setFilterTermData({});
      setPagination({ current: 1, pageSize: 10 });
    } else {
      setDate(val);
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <div>
        <Spin spinning={loadingUsers || isDownloading || downloadingUsers} fullscreen />
        {contextHolder}
        <Input.Search
          size="large"
          placeholder="Search by Batch Type and Time Slot"
          allowClear
          value={searchTerm}
          onSearch={handleSearchTerm}
          className="fullWidth mt-8"
          onChange={onChangeSearchTerm}
        />

        <Form form={form} layout="vertical" className="mt-8" onFinish={onFinish}>
          <Row align={"middle"} gutter={16}>
            <Col span={9}>
              <Form.Item label="Registration Type" name="batch_type">
                <Select
                  placeholder="Select Type"
                  size="large"
                  allowClear
                  options={batchTypes}
                  value={batchType}
                  showSearch
                  onChange={(val) => setBatchType(val)}
                  filterOption={(input, option) =>
                    (option?.label?.toLowerCase() ?? "").includes(input?.toLowerCase())
                  }
                  onClear={onClearSearchTerm}
                />
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item label="Date Filter" name={["date_filter"]}>
                <RangePicker
                  allowClear
                  size="large"
                  format={DATEFORMAT.RANGE_FORMAT}
                  className="fullWidth"
                  onChange={onDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Button
                type="primary"
                size="large"
                shape="round"
                htmlType="submit"
                block
                disabled={
                  form.getFieldValue("batch_type") || form.getFieldValue("date_filter")
                    ? false
                    : true
                }>
                Apply filter
              </Button>
            </Col>
          </Row>
        </Form>
        <Flex gap={10}>
          {/* <Button icon={<DownloadOutlined />} onClick={() => handleDownload("Pdf")}>
            Download Pdf
          </Button> */}
          <Button onClick={() => handleDownload("Excel")} icon={<DownloadOutlined />}>
            Download Excel
          </Button>
        </Flex>
        <Table
          className="mt-16 no-wrap-table"
          columns={columns}
          dataSource={tableData}
          onChange={handleTableChange}
          bordered={true}
          loading={false}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true, // Enable page size selection
            pageSizeOptions: MDM_PAGINATION, // Page size options
            showQuickJumper: true, // Enable quick jump to page
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} items` // Total items display
          }}
          scroll={{
            x: "auto"
          }}
        />
      </div>
    </>
  ) : (
    <>Not Allowed to View</>
  );
}

export default memo(RegistrationList);
