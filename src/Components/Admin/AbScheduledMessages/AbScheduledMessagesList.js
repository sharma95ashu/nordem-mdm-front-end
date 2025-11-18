/* eslint-disable no-undef */
import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Pagination,
  Button,
  Col,
  Row,
  theme,
  Flex,
  Space,
  Tag,
  Input,
  Spin,
  Typography
} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { useUserContext } from "Hooks/UserContext";

// AB Scheduled Messages List Component
const AbScheduledMessagesList = () => {
  const { Search } = Input;
  const { setBreadCrumb } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [delAllVisible, setDelAllVisible] = useState(false);
  const [submitSearchInput, setSubmitSearchInput] = useState(false);
  const [storeInputValue, setstoreInputValue] = useState("");
  const searchEnable = useRef();
  const { apiService } = useServices();
  const navigate = useNavigate();

  const {
    token: {
      borderRadiusLG,
      paddingContentHorizontal,
      colorBorder,
      sizeSM,
      colorPrimaryBg,
      colorPrimaryBorder,
      colorPrimary
    }
  } = theme.useToken();

  // styles
  const StyleSheet = {
    searchBarStyle: {
      marginBottom: 16,
      maxWidth: "538px"
    },
    paginationStyle: {
      marginTop: 25
    },
    contentSubStyle: {
      background: colorPrimaryBg,
      padding: paddingContentHorizontal,
      borderRadius: borderRadiusLG,
      marginTop: 20,
      marginBottom: 20,
      border: "1px solid",
      borderColor: colorPrimaryBorder
    },
    verDividerStyle: {
      borderColor: colorBorder,
      height: 20
    },
    flexFullStyle: {
      width: "100%"
    },
    iconFilterStyle: {
      fontSize: sizeSM
    },
    buttonAlignStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    formItemStyle: {
      marginBottom: 0
    },
    filterIconStyle: {
      marginRight: 6,
      marginTop: 2,
      color: colorPrimary
    },
    viewBtnStyle: {
      color: colorPrimary,
      cursor: "pointer",
      display: "block"
    }
  };

  // Function to fetch ab scheduled messages table data
  const fetchTableData = async (reset = false) => {
    try {
      // Define the base URL for the API endpoint
      let baseUrl = `/ab-schedule-messages/all/${searchEnable.current ? 1 : current}/${pageSize}`;

      // Construct parameters for the API request
      const params = {
        ...(searchTerm && { searchTerm: searchTerm.trim() })
      };

      // Construct the complete API URL with parameters
      const apiUrl = `${baseUrl}?${new URLSearchParams(params).toString()}`;

      // Make an API call to get the table data
      const data = await apiService.getRequest(apiUrl);

      // Check if the API call is successful
      if (data.success) {
        searchEnable.current = false;
        setTotal(data?.totalCount);
        let tableData = data?.data.map((item, index) => ({ ...item, key: index }));

        // Return the fetched data
        return tableData;
      }
    } catch (error) {
      console.log(error);
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const {
    data,
    mutate: refetch,
    isLoading
  } = useMutation("fetchAbScheduledMessagesData", fetchTableData);

  // Calling api when click pagination
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
  }, [current, pageSize]);

  // Search table data clear input then call api
  useEffect(() => {
    if (searchTerm === "" && submitSearchInput) {
      setCurrent(1); // ✅ Reset to first page
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? refetch()
        : navigate("/", { state: { from: null }, replace: true });
      setSubmitSearchInput(false);
      setstoreInputValue("");
    }
  }, [searchTerm, submitSearchInput]);

  // handle table search row data
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // search bar button when click search button then call api
  const handleSearchSubmit = () => {
    if (searchTerm !== null && searchTerm !== "" && searchTerm !== storeInputValue) {
      searchEnable.current = true;
      setCurrent(1); // 👈 Reset page number to 1 on new search
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? refetch()
        : navigate("/", { state: { from: null }, replace: true });
      setSubmitSearchInput(true);
      setstoreInputValue(searchTerm.trim());
    }
  };

  // table columns
  const columns = [
    {
      title: "S.No.",
      key: "serial",
      width: "80px",
      render: (_, __, index) => (current - 1) * pageSize + index + 1
    },
    {
      title: "Message Title",
      dataIndex: "message_title",
      width: "250px",
      key: "message_title",
      sorter: (a, b) => a.message_title.localeCompare(b.message_title),
      render: (value) => <Typography.Text className="textCapitalize">{value}</Typography.Text>
    },
    {
      title: "Language",
      dataIndex: "language",
      width: "100px",
      key: "language",
      render: (value) => (
        <Tag color={value === "hi" ? "blue" : "green"}>
          {value === "hi" ? "Hindi" : value === "en" ? "English" : value}
        </Tag>
      )
    },
    {
      title: "Days After Join",
      dataIndex: "days_after_join",
      width: "120px",
      key: "days_after_join",
      sorter: (a, b) => a.days_after_join - b.days_after_join,
      render: (value) => <Typography.Text>{value} days</Typography.Text>
    },
    {
      title: "Display Order",
      dataIndex: "display_order",
      width: "120px",
      key: "display_order",
      sorter: (a, b) => a.display_order - b.display_order,
      render: (value) => <Typography.Text>{value}</Typography.Text>
    },
    // {
    //   title: "Start Date",
    //   dataIndex: "start_date",
    //   width: "120px",
    //   key: "start_date",
    //   sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
    //   render: (value) => <Typography.Text>{dayjs(value).format("DD/MM/YYYY")}</Typography.Text>
    // },
    // {
    //   title: "End Date",
    //   dataIndex: "end_date",
    //   width: "120px",
    //   key: "end_date",
    //   sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
    //   render: (value) => <Typography.Text>{dayjs(value).format("DD/MM/YYYY")}</Typography.Text>
    // },
    {
      title: "Status",
      dataIndex: "status",
      width: "100px",
      key: "status",
      render: (value) => (
        <Tag color={value === "active" ? "green" : "red"}>
          {value === "active" ? "Active" : "Inactive"}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: "120px",
      render: (_, record) => (
        <Space>
          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() =>
                navigate(`/${Paths.abScheduledMessagesEdit}/${record.scheduled_message_id}`)
              }>
              Edit
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Function to handle deletion of scheduled messages
  // const { mutate: deleteMutate } = useMutation(
  //   (data) => apiService.deleteAbScheduledMessages(data),
  //   {
  //     onSuccess: (res) => {
  //       if (res) {
  //         enqueueSnackbar(res.message, snackBarSuccessConf);
  //         setSelectedRowKeys([]);
  //         setDelAllVisible(false);
  //         refetch();
  //       }
  //     },
  //     onError: (error) => {
  //       setSelectedRowKeys([]);
  //     }
  //   }
  // );

  // const filterDeleteIds = (deleteArr) => {
  //   try {
  //     const filteredKeys = data
  //       .filter((obj) => deleteArr.includes(obj.key))
  //       .map((obj) => obj.scheduled_message_id);
  //     return filteredKeys;
  //   } catch (error) {}
  // };

  // Function to handle deletion of scheduled messages
  // const handleDelete = (data) => {
  //   try {
  //     const body = {
  //       messageIds: Array.isArray(data) ? filterDeleteIds(data) : [data.scheduled_message_id]
  //     };
  //     deleteMutate(body);
  //   } catch (error) {}
  // };

  // // Function to handle Edit of scheduled messages
  // const handleEdit = (data) => {
  //   navigate(`/${Paths.abScheduledMessagesEdit}/${data.scheduled_message_id}`);
  // };

  // Handle key press event to detect "Enter" key and call handleSearchSubmit
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // // row selection
  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: (newSelectedRowKeys) => {
  //     setSelectedRowKeys(newSelectedRowKeys);
  //     setDelAllVisible(newSelectedRowKeys.length > 0);
  //   }
  // };

  useEffect(() => {
    setBreadCrumb({
      title: "AB Scheduled Messages",
      icon: "notification",
      path: Paths.abScheduledMessagesList
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>All AB Scheduled Messages</Typography.Title>
      <Spin spinning={false} fullscreen />
      <Row gutter={[0, 0]}>
        <Col className="gutter-row" span={24}>
          <Flex gap="middle" justify="space-between">
            <Search
              className="search_bar_box"
              size="large"
              placeholder="Search Here..."
              value={searchTerm}
              onSearch={handleSearchSubmit}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              allowClear
              style={StyleSheet.searchBarStyle}
            />
            <Flex justify="space-between" gap="middle">
              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                  <NavLink to={`/${Paths.abScheduledMessagesAdd}`}>
                    <Button size="large" type="primary" className="wrapButton">
                      <PlusOutlined />
                      Add New
                    </Button>
                  </NavLink>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered={true}
        loading={isLoading}
        scroll={{
          x: "1070px"
        }}
      />

      <div style={StyleSheet.paginationStyle}>
        <Pagination
          total={total}
          showTotal={(total) => `Total ${total} items`}
          defaultPageSize={pageSize}
          defaultCurrent={1}
          current={current}
          onChange={(newPage, newPageSize) => {
            // setSelectedRowKeys([]);
            setCurrent(newPage);
            setPageSize(newPageSize);
            // setSelectedRowKeys([]);
          }}
          showSizeChanger
          showQuickJumper
        />
      </div>
    </>
  ) : (
    <></>
  );
};

export default AbScheduledMessagesList;
