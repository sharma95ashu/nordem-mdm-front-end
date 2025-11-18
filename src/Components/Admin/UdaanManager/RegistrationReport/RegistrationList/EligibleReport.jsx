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
function EligibleReport({ activeTab }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { setBreadCrumb } = useUserContext();
  const [filterTermData, setFilterTermData] = useState({});
  const [messageApi, contextHolder] = message.useMessage();
  // eslint-disable-next-line no-unused-vars
  const [date, setDate] = useState("");

  const { apiService } = useServices();

  const columns = [
    {
      title: "Joining Date",
      dataIndex: "dist_join_date",
      key: "dist_join_date",
      sorter: (a, b) => dayjs(a.dist_join_date).unix() - dayjs(b.dist_join_date).unix(),
      render: (_, record) => dayjs(record.dist_join_date).format("D MMMM YYYY")
    },
    {
      title: "AB ID",
      dataIndex: "associate_buyer_number",
      key: "abId",
      sorter: (a, b) => a.associate_buyer_number - b.associate_buyer_number
    },
    {
      title: "AB Name",
      dataIndex: "associate_buyer_name",
      key: "abName",
      sorter: (a, b) => a.associate_buyer_name.localeCompare(b.associate_buyer_name)
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) => a.city.localeCompare(b.city)
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      sorter: (a, b) => a.district.localeCompare(b.district)
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => a.state.localeCompare(b.state)
    },
    {
      title: "Mobile No.",
      dataIndex: "mobile_number",
      key: "mobileNo",
      sorter: (a, b) => a.mobile_number.localeCompare(b.mobile_number)
    },
    {
      title: "Registration Done",
      dataIndex: "registration_done",
      key: "registration_done",
      sorter: (a, b) => dayjs(a.registration_done).unix() - dayjs(b.registration_done).unix()
    },
    {
      title: "Registration Date",
      dataIndex: "registrationDate",
      key: "registrationDate",
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      render: (_, record) => dayjs(record.created_at).format("D MMMM YYYY")
    },
    {
      title: "Date & Time Slot",
      dataIndex: "time_slot",
      key: "dateTimeSlot"
    }
  ];
  const [tableData, setTableData] = useState([]);
  const [batchType, setBatchType] = useState("");
  const [isDownloading, setIsDownloading] = useState(false); // State for spinner

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
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? fetchAllEligibleUsers({
          current: 1,
          pageSize: 10,
          searchTerm: ""
        })
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Udaan",
      icon: "",
      titlePath: Paths.udaanReport,
      subtitle: "Eligible AB Report",
      path: Paths.users
    });
  }, [activeTab]);

  // Handle pagination changes
  const handleTableChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));
    fetchAllEligibleUsers({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      searchTerm: searchTerm
    });
  };

  //Function to search by searchTerm
  const handleSearchTerm = (val) => {
    // API Call to fetch all details
    setSearchTerm(val);
    fetchAllEligibleUsers({
      current: 1,
      pageSize: 10,
      searchTerm: val
    });
  };

  //Function to run when the searchTerm changes
  const onChangeSearchTerm = (e) => {
    if (e.target.value === "") {
      fetchAllEligibleUsers({
        current: 1,
        pageSize: 10,
        searchTerm: ""
      });
      setPagination((prev) => ({
        current: 1,
        pageSize: 10
      }));
      setSearchTerm("");
    }
    setSearchTerm(e.target.value);
  };

  //APi call fetching all registered Users
  const { mutate: fetchAllEligibleUsers, isLoading: loadingUsers } = useMutation(
    (data) => {
      const batchType = form.getFieldValue("batch_type");
      return apiService.getEligibleUsersUdaan(
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

  //Function to get all the Registered Users
  const onFinish = (values) => {
    const dateRange = values.date_filter || []; // Get selected date range from the form

    let filterTerm = {};

    // Apply date filter if selected
    if (dateRange.length === 2) {
      filterTerm.startDate = dateRange[0].format("DD MMMM YYYY"); // Format: 7 March 2025
      filterTerm.endDate = dateRange[1].format("DD MMMM YYYY"); // Format: 21 March 2025
    }

    setFilterTermData(filterTerm);

    fetchAllEligibleUsers({
      current: 1,
      pageSize: 10,
      searchTerm: searchTerm,
      filterTerm: encodeURIComponent(JSON.stringify(filterTerm)) // Encode filterTerm
    });

    setPagination({ current: 1, pageSize: 10 });
  };

  //APi call to download the eligible Users
  const { mutate: downloadEligibleUsers, isLoading: downloadingUsers } = useMutation(
    (data) => {
      const batchType = form.getFieldValue("batch_type");
      data.filterTerm = encodeURIComponent(JSON.stringify(data.filterTerm));
      setIsDownloading(true); // Start spinner before request
      return apiService.downloadEligibleUsers(data.searchTerm, data.filterTerm, batchType);
    },
    {
      onSuccess: (res, variables) => {
        if (res?.data?.data?.length > 0) {
          // Format the data based on your provided columns

          const formattedData = res.data.data.map((item) => ({
            "Joining Date": item.dist_join_date
              ? dayjs(item.dist_join_date).format("D MMMM YYYY")
              : "N/A",
            "AB ID": item.associate_buyer_number || "N/A",
            "AB Name": item.associate_buyer_name || "N/A",
            City: item.city || "N/A",
            District: item.district || "N/A",
            State: item.state || "N/A",
            "Mobile No.": item.mobile_number || "N/A",
            "Registration Done": item.registration_done || "N/A",
            "Registration Date": item.created_at
              ? dayjs(item.created_at).format("D MMMM YYYY")
              : "N/A",
            "Date & Time Slot": item.time_slot || "N/A"
          }));

          if (variables.type === "Pdf") {
            downloadJsonAsPDF(formattedData, "Eligible Users");
          } else {
            downloadExcelData(formattedData, "Eligible_Users"); // Convert data and download Excel
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
    downloadEligibleUsers({
      type: type,
      searchTerm: searchTerm,
      filterTerm: filterTermData // Encode filterTerm
    });
  };

  //Function to run when the date filter is cleared
  const onDateChange = (val) => {
    if (!val || val.length === 0) {
      fetchAllEligibleUsers({
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
    fetchAllEligibleUsers({
      current: 1,
      pageSize: 10,
      searchTerm: "",
      filterTerm: encodeURIComponent(JSON.stringify(filterTerm)) // Encode filterTerm
    });

    // Reset pagination
    setPagination({ current: 1, pageSize: 10 });
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <div>
        <Spin spinning={loadingUsers || downloadingUsers} fullscreen />
        {contextHolder}
        <Input.Search
          size="large"
          placeholder="Search by AB ID, AB Name, Mobile No., State, District, City and Time Slot"
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
                  options={batchTypes}
                  allowClear
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
                Apply Filter
              </Button>
            </Col>
          </Row>
        </Form>
        <Flex gap={10}>
          {/* <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload("Pdf")}
            loading={isDownloading || downloadingUsers}>
            Download Pdf
          </Button> */}
          <Button
            onClick={() => handleDownload("Excel")}
            loading={isDownloading || downloadingUsers}
            icon={<DownloadOutlined />}>
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

export default memo(EligibleReport);
