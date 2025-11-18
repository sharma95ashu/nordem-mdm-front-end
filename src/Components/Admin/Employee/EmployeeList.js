import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Pagination,
  Button,
  Col,
  Row,
  theme,
  Flex,
  Tag,
  Popconfirm,
  Input,
  Spin,
  Divider
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";

import { actionsPermissionValidator } from "Helpers/ats.helper";

import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { useUserContext } from "Hooks/UserContext";

//Employee List Component
const Employees = () => {
  const searchEnable = useRef();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const { Search } = Input;
  const { setBreadCrumb } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [delAllVisible, setDelAllVisible] = useState(false);

  const [submitSearchInput, setSubmitSearchInput] = useState(false);
  const [storeInputValue, setstoreInputValue] = useState("");

  const {
    token: {
      borderRadiusLG,
      paddingContentHorizontal,
      colorBorder,
      colorError,
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

  // Function to fetch employee table  data
  const fetchTableData = async (reset = false) => {
    try {
      // Define the base URL for the API endpoint
      const payload = {
        page: searchEnable.current ? 0 : current - 1,
        pageSize: pageSize
      };

      // Construct parameters for the API request
      const params = {
        ...(searchTerm && { searchTerm: searchTerm.trim() })
      };

      // Construct the complete API URL with parameters
      let baseUrl = `/employee/get-list`;
      const apiUrl = `${baseUrl}?${new URLSearchParams(params).toString()}`;

      // Make an API call to get the table data
      const data = await apiService.getEmployeeListForManageEmployees(apiUrl, payload);

      // Check if the API call is successfull
      if (data.success) {
        searchEnable.current = false;
        setTotal(data?.totalCount);
        let tableData = data?.data.map((item, index) => ({ ...item, key: index }));

        // Return the fetched data
        return tableData; //
      }
    } catch (error) {
      console.log("error", error);
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch, isLoading } = useMutation("fetchAllEmployees", fetchTableData);

  // Calling api when click pagination
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
  }, [current, pageSize]);

  // Search table data clear input then call api
  useEffect(() => {
    if (searchTerm === "" && submitSearchInput) {
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
    setCurrent(1);
    setPageSize(10);
  };

  // search bar button when click search button then call api
  const handleSearchSubmit = () => {
    if (searchTerm !== null && searchTerm !== "" && searchTerm !== storeInputValue) {
      searchEnable.current = true;
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
      title: "Emp ID",
      dataIndex: "emp_code",
      width: "100px",
      key: "emp_code",
      sorter: (a, b) => a.emp_code.localeCompare(b.emp_code)
    },
    {
      title: "Emp Name",
      dataIndex: "full_name",
      width: "150px",
      key: "full_name",
      sorter: (a, b) => a.full_name.localeCompare(b.full_name)
    },
    {
      title: "Mobile No.",
      dataIndex: "phone_number",
      key: "phone_number",
      width: "150px",
      sorter: (a, b) => a.phone_number.localeCompare(b.phone_number)
    },
    {
      title: "Department",
      dataIndex: "department_name",
      width: "250px",
      key: "department_name",
      sorter: (a, b) => a.department_name.localeCompare(b.department_name)
    },
    {
      title: "Work Location",
      dataIndex: "work_location",
      width: "150px",
      key: "work_location",
      sorter: (a, b) => a.work_location.localeCompare(b.work_location)

    },
    {
      title: "Company",
      dataIndex: "company_name",
      width: "120px",
      key: "company_name",
      sorter: (a, b) => a.company_name.localeCompare(b.company_name)

    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: "100px",
      sorter: (a, b) => a.is_active.localeCompare(b.is_active),
      render: (value) => (
        <>
          {value === true ? <Tag color="success">Active</Tag> : <Tag color="error">Inactive</Tag>}
        </>
      )
    },
    {
      title: "Action",
      dataIndex: "action",
      width: "200px",
      key: "action",
      fixed: "right",
      align: "center",
      render: (text, record) => (
        <Flex gap="small" justify="center" align="center">
          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
            <>
              <Button
                type="default"
                primary
                onClick={() => navigate(`/${Paths.employeeEdit}/${record.employee_id}`)}>
                Edit
              </Button>
            </>
          )}

          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) &&
            actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) && (
              <Divider style={StyleSheet.verDividerStyle} type="vertical" />
            )}

          {actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) && (
            <Popconfirm
              title="Delete"
              icon={
                <DeleteOutlined
                  style={{
                    color: colorError
                  }}
                />
              }
              okButtonProps={{ danger: true }}
              description="Are you sure to delete this ?"
              onConfirm={() => {
                handleDelete(record);
              }}
              okText="Yes"
              placement="left"
              cancelText="No">
              <Button type="default" danger>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Flex>
      )
    }
  ];

  // api  to delete employee data
  const { mutate: deleteMutate } = useMutation(
    (data) => apiService.deleteEmployee(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res) => {
        if (res) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
          setSelectedRowKeys([]);
          setDelAllVisible(false);
          refetch();
        }
      },
      onError: (error) => {
        setSelectedRowKeys([]);
      }
    }
  );

  const filterDeleteIds = (deleteArr) => {
    try {
      const filteredKeys = data
        .filter((obj) => deleteArr.includes(obj.key))
        .map((obj) => obj.employee_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of employee
  const handleDelete = (data) => {

    try {
      // Create a request body with tagsIds array
      const body = {
        ids: Array.isArray(data) ? filterDeleteIds(data) : [data.employee_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for employee deletion
      deleteMutate(obj);
    } catch (error) {
      console.log(error);
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    if (newSelectedRowKeys.length >= 1) {
      setDelAllVisible(true);
    } else {
      setDelAllVisible(false);
    }

    try {
      setSelectedRowKeys(newSelectedRowKeys);
    } catch (error) {}
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Employee",
      icon: "employee",
      path: Paths.employeeList
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>All Employees</Typography.Title>
      <Spin spinning={false} fullscreen />
      <Row gutter={[0, 0]}>
        <Col className="gutter-row" span={24}>
          <Flex gap="middle" justify="space-between">
            <Search
              className="search_bar_box"
              size="large"
              placeholder="Search by Emp ID, Emp Name"
              value={searchTerm}
              onSearch={handleSearchSubmit}
              onChange={handleSearch}
              allowClear
              style={StyleSheet.searchBarStyle}
            />
            <Flex justify="space-between" gap="middle">
              {actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) &&
                delAllVisible && (
                  <Popconfirm
                    title="Delete"
                    icon={
                      <DeleteOutlined
                        style={{
                          color: colorError
                        }}
                      />
                    }
                    okButtonProps={{ danger: true }}
                    description="Are you sure to delete ?"
                    onConfirm={() => {
                      handleDelete(selectedRowKeys);
                    }}
                    onCancel={() => {
                      //
                    }}
                    okText="Yes"
                    placement="left"
                    cancelText="No">
                    <Button
                      type="default"
                      danger
                      size="large"
                      disabled={selectedRowKeys?.length > 0 ? false : true}>
                      Delete
                    </Button>
                  </Popconfirm>
                )}

              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                  <NavLink to={`/${Paths.employeeAdd}`}>
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
        rowSelection={rowSelection}
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
            setSelectedRowKeys([]);
            setCurrent(newPage);
            setPageSize(newPageSize);
            setSelectedRowKeys([]);
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

export default Employees;
