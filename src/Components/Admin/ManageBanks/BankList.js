import React, { useEffect, useRef, useState } from "react";
import { Table, Pagination, Button, Col, Row, theme, Flex, Tag, Input, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { PermissionAction } from "Helpers/ats.constants";

import { actionsPermissionValidator } from "Helpers/ats.helper";

import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { useUserContext } from "Hooks/UserContext";

//Bank List Component
const BankList = () => {
  const searchEnable = useRef();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const { Search } = Input;
  const { setBreadCrumb } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [submitSearchInput, setSubmitSearchInput] = useState(false);
  const [storeInputValue, setstoreInputValue] = useState("");

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

  // Function to fetch bank table  data
  const fetchTableData = async (reset = false) => {
    try {
      // Define the base URL for the API endpoint
      const payload = {
        page: searchEnable.current ? 0 : current - 1,
        pageSize: pageSize,
        ...(searchTerm && { searchTerm: searchTerm.trim() })
      };

      // Construct the complete API URL with parameters
      let apiUrl = `/bank/get-all`;

      // Make an API call to get the table data
      const data = await apiService.getBankList(apiUrl, payload);

      // Check if the API call is successful
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
  const { data, mutate: refetch, isLoading } = useMutation("fetchAllBanks", fetchTableData);

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
      title: "Bank Name",
      dataIndex: "bank_name",
      width: "150px",
      key: "bank_name",
      sorter: (a, b) => a.bank_name.localeCompare(b.bank_name)
    },
    {
      title: "Short Name",
      dataIndex: "short_name",
      width: "80px",
      key: "short_name",
      sorter: (a, b) => a.short_name.localeCompare(b.short_name)
    },
    {
      title: "Account Length",
      dataIndex: "acc_code_final",
      key: "acc_code_final",
      align: "center",
      width: 120,
      render: (v) => v?.join?.(", ") || "-"
    },
    {
      title: "No of Branches",
      dataIndex: "total_branches",
      key: "total_branches",
      align: "center",
      width: 80,
      sorter: (a, b) => a.total_branches - b.total_branches
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "100px",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (value) => (
        <>{value === "A" ? <Tag color="success">Active</Tag> : <Tag color="error">Inactive</Tag>}</>
      )
    },
    {
      title: "Action",
      dataIndex: "action",
      width: "100px",
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
                onClick={() => navigate(`/${Paths.bankEdit}/${record.bank_code}`)}>
                Edit
              </Button>
            </>
          )}
        </Flex>
      )
    }
  ];

  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Manage Banks",
      icon: "bank",
      path: Paths.bankList
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>Manage Banks</Typography.Title>
      <Spin spinning={false} fullscreen />
      <Row gutter={[0, 0]}>
        <Col className="gutter-row" span={24}>
          <Flex gap="middle" justify="space-between">
            <Search
              className="search_bar_box"
              size="large"
              placeholder="Search by Bank Name or Short Name"
              value={searchTerm}
              onSearch={handleSearchSubmit}
              onChange={handleSearch}
              allowClear
              style={StyleSheet.searchBarStyle}
            />
            <Flex justify="space-between" gap="middle">
              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                  <NavLink to={`/${Paths.bankAdd}`}>
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
        scroll={false}
        sticky={false}
      />

      <div style={StyleSheet.paginationStyle}>
        <Pagination
          total={total}
          showTotal={(total) => `Total ${total} items`}
          defaultPageSize={pageSize}
          defaultCurrent={1}
          current={current}
          onChange={(newPage, newPageSize) => {
            setCurrent(newPage);
            setPageSize(newPageSize);
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

export default BankList;
