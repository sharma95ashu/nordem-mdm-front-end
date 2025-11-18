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
  const [form] = Form.useForm();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [messageApi, contextHolder] = message.useMessage();

  const columns = [
    {
      title: "Batch ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id
    },
    {
      title: "Participant Name",
      dataIndex: "participant_name",
      key: "participant_name",
      sorter: (a, b) => a.participant_name.localeCompare(b.participant_name)
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      sorter: (a, b) => a.gender.localeCompare(b.gender)
    },
    {
      title: "Mobile Number",
      dataIndex: "mobile_number",
      key: "mobile_number",
      sorter: (a, b) => a.mobile_number.localeCompare(b.mobile_number)
    },
    {
      title: "WhatsApp Number",
      dataIndex: "whatsapp_number",
      key: "whatsapp_number",
      sorter: (a, b) => a.whatsapp_number.localeCompare(b.whatsapp_number)
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: (a, b) => a.address.localeCompare(b.address)
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => a.state.localeCompare(b.state)
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      sorter: (a, b) => a.district.localeCompare(b.district)
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) => a.city.localeCompare(b.city)
    },
    {
      title: "Pincode",
      dataIndex: "pincode",
      key: "pincode",
      sorter: (a, b) => a.pincode.localeCompare(b.pincode)
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      sorter: (a, b) => a.language.localeCompare(b.language)
    },
    {
      title: "Date & Time Slot",
      dataIndex: "time_slot",
      key: "time_slot",
      sorter: (a, b) => a.time_slot.localeCompare(b.time_slot)
    },
    {
      title: "Blazer Size",
      dataIndex: "blazer_size",
      key: "blazer_size",
      sorter: (a, b) => a.blazer_size.localeCompare(b.blazer_size)
    },
    {
      title: "Blazer Color",
      dataIndex: "blazer_color",
      key: "blazer_color",
      sorter: (a, b) => a.blazer_color.localeCompare(b.blazer_color)
    },
    {
      title: "Jacket Size",
      dataIndex: "jacket_size",
      key: "jacket_size",
      sorter: (a, b) => a.jacket_size.localeCompare(b.jacket_size)
    },
    {
      title: "T-Shirt Size",
      dataIndex: "tshirt_size",
      key: "tshirt_size",
      sorter: (a, b) => a.tshirt_size.localeCompare(b.tshirt_size)
    }
  ];
  const [tableData, setTableData] = useState([]);
  const [batchType, setBatchType] = useState("");
  const [filterTermData, setFilterTermData] = useState({});
  const [isDownloading, setIsDownloading] = useState(false); // State for spinner
  const [pagination, setPagination] = useState({
    current: 1, // Current page
    pageSize: 10, // Default page size
    total: 0 // Total items (fetched dynamically)
  });
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [date, setDate] = useState("");

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? fetchAllRegisteredUsers({
          current: 1,
          pageSize: 10,
          searchTerm: ""
        })
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Udaan",
      icon: "",
      titlePath: Paths.udaanReport,
      subtitle: "Registration List",
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
    fetchAllRegisteredUsers({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      searchTerm: searchTerm
    });
  };

  //Function to search by searchTerm
  const handleSearchTerm = (val) => {
    // API Call to fetch all details
    setSearchTerm(val);
    fetchAllRegisteredUsers({
      current: 1,
      pageSize: 10,
      searchTerm: val
    });
  };

  //Function to run when the searchTerm changes
  const onChangeSearchTerm = (e) => {
    if (e.target.value === "") {
      fetchAllRegisteredUsers({
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
  const { mutate: fetchAllRegisteredUsers, isLoading: loadingUsers } = useMutation(
    (data) => {
      const batchType = form.getFieldValue("batch_type");
      return apiService.getRegisteredUsersUdaan(
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

  //APi call to download the registered Users
  const { mutate: downloadRegisteredUsers, isLoading: downloadingUsers } = useMutation(
    (data) => {
      const batchType = form.getFieldValue("batch_type");
      data.filterTerm = encodeURIComponent(JSON.stringify(data.filterTerm));
      setIsDownloading(true); // Start spinner before request
      return apiService.downloadRegisteredUsers(data.searchTerm, data.filterTerm, batchType);
    },
    {
      onSuccess: (res, variables) => {
        if (res?.data?.data?.length > 0) {
          // Format the data based on your provided columns
          const formattedData = res.data.data.map((item) => ({
            "Batch ID": item.id,
            "Participant Name": item.participant_name,
            Gender: item.gender,
            "Mobile Number": item.mobile_number,
            "WhatsApp Number": item.whatsapp_number,
            Address: item.address,
            State: item.state,
            District: item.district,
            City: item.city,
            Pincode: item.pincode,
            Language: item.language,
            "Date & Time Slot": item.time_slot,
            "Blazer Size": item.blazer_size,
            "Blazer Color": item.blazer_color,
            "Jacket Size": item.jacket_size,
            "T-Shirt Size": item.tshirt_size
          }));

          if (variables.type === "Pdf") {
            downloadJsonAsPDF(formattedData, "Registered Users");
          } else {
            downloadExcelData(formattedData, "Registered_Users"); // Convert data and download Excel
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
    fetchAllRegisteredUsers({
      current: 1,
      pageSize: 10,
      searchTerm: searchTerm,
      filterTerm: encodeURIComponent(JSON.stringify(filterTerm)) // Encode filterTerm
    });

    setPagination({ current: 1, pageSize: 10 });
  };

  //Function to download to Excel Or Pdf
  const handleDownload = (type) => {
    downloadRegisteredUsers({
      type: type,
      searchTerm: searchTerm,
      filterTerm: filterTermData // Encode filterTerm
    });
  };

  //Function to run when the date filter is cleared
  const onDateChange = (val) => {
    if (!val || val.length === 0) {
      fetchAllRegisteredUsers({
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
    fetchAllRegisteredUsers({
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
          placeholder="Search by Participants Name, Mobile No., State, District, Language, AB ID and Batch Id"
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

export default memo(RegistrationList);
