/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Pagination,
  Spin,
  Input,
  Button,
  Col,
  Row,
  Space,
  Avatar,
  Divider,
  Flex,
  Popconfirm,
  Typography,
  Grid,
  Card,
  Image
} from "antd";
import { PlusOutlined, DeleteOutlined, DownloadOutlined, SearchOutlined } from "@ant-design/icons";

import userImg from "Static/img/user.jpg";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQueryClient } from "react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarInfoConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";

const { Title } = Typography;

const EcomUserPermission = () => {
  const { Search } = Input;
  const { setBreadCrumb } = useUserContext();
  const queryClient = useQueryClient();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const searchEnable = useRef();

  const [current, setCurrent] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [submitSearchInput, setSubmitSearchInput] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [listData, setlistData] = useState([]);
  // const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // const [delAllVisible, setDelAllVisible] = useState(false);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const isMobile = () => !screens.lg && (screens.md || screens.sm || screens.xs);

  const columns = [
    {
      title: "User Name",
      dataIndex: "user_name",
      key: "user_name",
      width: "140px",
      sorter: (a, b) => a.user_name.localeCompare(b.user_name),
      render: (value, record) => {
        const logoSrc = record?.doc_path
          ? `${process.env.REACT_APP_ECOM_BASEIMAGE_URL}${record.doc_path}`
          : userImg;

        return (
          <Space>
            <Avatar src={logoSrc} />
            <Typography.Text className="textCapitalize">
              {value || record.cust_name}
            </Typography.Text>
          </Space>
        );
      }
    },
    {
      title: "A.B. Number",
      dataIndex: "distno",
      key: "distno",
      width: "140px",
      render: (value, record) => (
        <Typography.Text>
          {record?.customer_type == "REG" ? "N/A" : value ? value : "N/A"}
        </Typography.Text>
      )
    },
    {
      title: "Phone Number",
      dataIndex: "user_phone_number",
      key: "user_phone_number",
      width: "140px",
      render: (value) => <Typography.Text>{value}</Typography.Text>
    },
    {
      title: "User Type",
      dataIndex: "customer_type",
      key: "customer_type",
      width: "140px",
      render: (value) => <Typography.Text>{value}</Typography.Text>
    }
  ];

  if (
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ||
    actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE)
  ) {
    columns.push({
      align: "center",
      title: "Action",
      key: "action",
      width: "100px",
      fixed: "right",
      render: (_, record) => (
        <Flex gap="small" justify="center">
          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
            <Button onClick={() => handleEdit(record)}>Update</Button>
          )}
        </Flex>
      )
    });
  }

  const fetchTableData = async () => {
    const queryParams = `/${
      searchEnable.current ? 0 : current - 1
    }/${pageSize}?searchTerm=${searchTerm}`;
    const data = await apiService.getAllEcomUserForPermission(queryParams);
    if (data?.success && data?.data?.data?.length > 0) {
      searchEnable.current = false;
      setTotal(data?.data?.total_count);
      let d = data.data.data.map((item, index) => ({ ...item, key: index }));
      setlistData(d);
      return d;
    } else {
      enqueueSnackbar("No users found", snackBarInfoConf);
    }
    return [];
  };

  const { data, mutate: refetch, isLoading } = useMutation("fetchCategoryData", fetchTableData);

  useEffect(() => {
    if (actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)) {
      if (searchTerm) refetch();
    } else {
      navigate("/", { replace: true });
    }
  }, [current, pageSize]);

  useEffect(() => {
    if ((searchTerm === "" || !searchTerm) && submitSearchInput) {
      setlistData([]);
      setSubmitSearchInput(false);
      setstoreInputValue("");
    }
  }, [searchTerm]);

  const handleSearch = (e) => setSearchTerm(e.target?.value || null);

  const handleSearchSubmit = (val, e) => {
    if (val && val !== "") {
      setCurrent(1);
      setPageSize(pageSize);
      searchEnable.current = true;
      refetch();
      setSubmitSearchInput(true);
      setstoreInputValue(val.trim());
    } else {
      setlistData([]);
    }
  };

  const handleEdit = (record) => navigate(`/${Paths.ecomUserPermissionEdit}/${record.user_id}`);

  useEffect(() => {
    setBreadCrumb({
      title: "Block/Unblock User",
      icon: "User Permission",
      path: Paths.ecomUserPermissionList
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Title level={5}>Block/Unblock Ecom User</Title>
      <Spin spinning={isLoading} fullscreen />
      <Row gutter={[12, 30]}>
        <Col span={12}>
          <Flex style={{ marginBottom: "10px" }} justify="space-between" gap="middle">
            <Search
              size="large"
              placeholder="Search By Mobile Number,A.B. No., Name..."
              value={searchTerm}
              onSearch={handleSearchSubmit}
              onChange={handleSearch}
              allowClear
            />
          </Flex>
        </Col>
      </Row>

      {listData?.length > 0 ? (
        <>
          <Table
            columns={columns}
            // rowSelection={{
            //     selectedRowKeys,
            //     onChange: onSelectChange
            // }}
            dataSource={listData}
            pagination={false}
            bordered
            loading={isLoading}
            scroll={{ x: "1070px" }}
          />

          <Pagination
            style={{ marginTop: 25 }}
            total={total}
            current={current}
            pageSize={pageSize}
            showTotal={(total) => `Total ${total} items`}
            onChange={(newPage, newSize) => {
              setCurrent(newPage);
              setPageSize(newSize);
            }}
            showSizeChanger
            showQuickJumper
          />
        </>
      ) : (
        <Row gutter={[12, 30]}>
          <Col span={24}>
            <Flex style={{ marginBottom: "10px" }} justify="space-between" gap="middle">
              <Card className="marginTop24 fullWidth elevated-box">
                <Flex justify="center">
                  <SearchOutlined style={{ fontSize: 48, opacity: 0.5 }} />
                </Flex>
                <Flex justify="center">
                  <Typography.Title level={3}>{"Search User"}</Typography.Title>
                </Flex>
                <Flex justify="center">
                  <Typography.Text type="secondary" className="fontSizeEighteen">
                    {"Search any user to change login/cod permision"}
                  </Typography.Text>
                </Flex>
              </Card>
            </Flex>
          </Col>
        </Row>
      )}
    </>
  ) : null;
};

export default EcomUserPermission;
