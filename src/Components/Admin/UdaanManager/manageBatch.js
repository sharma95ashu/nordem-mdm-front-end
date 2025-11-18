/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Pagination,
  Spin,
  Input,
  Tag,
  Button,
  Col,
  Row,
  Flex,
  Typography,
  Space,
  Divider,
  Popconfirm,
  theme
} from "antd";

import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQueryClient } from "react-query";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate } from "react-router-dom";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { tabletWidth } from "Helpers/ats.constants";
import dayjs from "dayjs";

const manageBatch = () => {
  const { Search } = Input;
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [psize, setPsize] = useState(10);
  const { apiService } = useServices();

  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const {
    token: { colorError }
  } = theme.useToken();
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [delAllVisible, setDelAllVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  // check window inner width
  const checkInnerWidth = () => {
    try {
      return windowWidth < tabletWidth;
    } catch (error) {}

    // check window width and set inner width
    React.useEffect(() => {
      try {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      } catch (error) {}
    }, [windowWidth]);
  };

  const columns = [
    {
      title: "Batch Type",
      dataIndex: "batch_type",
      key: "batch_type",
      sorter: (a, b) => a.batch_type.localeCompare(b.batch_type)
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language"
    },
    {
      title: "Date & Time Slot",
      key: "datetime_slot",
      render: (_, record) => {
        const formattedDate = dayjs(record.start_time).format("D MMMM YYYY"); // 7th March 2025
        const startTime = dayjs(record.start_time).format("hA"); // 4AM
        const endTime = dayjs(record.end_time).format("hA"); // 1PM
        return `${formattedDate} | ${startTime} - ${endTime}`;
      }
    },

    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      sorter: (a, b) => a.capacity - b.capacity
    },
    // {
    //   title: "Course Id",
    //   dataIndex: "course_id",
    //   key: "course_id"
    // },
    // {
    //   title: "Class Id",
    //   dataIndex: "class_id",
    //   key: "class_id"
    // },
    {
      title: "Short Link",
      dataIndex: "short_link",
      key: "short_link",
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      )
    },
    {
      title: "YouTube Link",
      dataIndex: "youtube_link",
      key: "youtube_link",
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => Number(b.status) - Number(a.status),
      render: (value) => (
        <>{value ? <Tag color="success">Active</Tag> : <Tag color="error">Inactive</Tag>}</>
      )
    }
  ];

  if (
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ||
    actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE)
  ) {
    columns.push({
      align: "center",
      title: "Action",
      dataIndex: "action",
      width: "190px",
      key: "action",
      fixed: "right",
      render: (text, record) => (
        <Flex gap="small" justify="center" align="center">
          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
            <>
              <Button type="default" primary onClick={() => handleEdit(record)}>
                Edit
              </Button>
            </>
          )}

          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) &&
            actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) && (
              <Divider style={StyleSheet.verDividerStyle} type="vertical" />
            )}

          {/* {actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) && (
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
              // onConfirm={() => {
              //   handleDelete(record);
              // }}
              onCancel={() => {
                "";
              }}
              okText="Yes"
              placement="left"
              cancelText="No">
              <Button type="default" danger>
                Delete
              </Button>
            </Popconfirm>
          )} */}
        </Flex>
      )
    });
  }

  // Function to handle Edit of tags
  const handleEdit = (data) => {
    navigate(`/${Paths.batchEdit}/${data.batch_id}`);
  };

  const { mutate: fetchAllBatches, isLoading: allBatchesLoading } = useMutation(
    "fetchAllBatchesData",
    (data) => {
      return apiService.getAllBatchesData(data.page, data.pageSize, data.searchTerm);
    },
    {
      onSuccess: (res) => {
        if (res?.success) {
          if (res?.data?.data?.length > 0) {
            setTableData(res?.data?.data);
            setTotal(res?.data?.total_count);
          } else if (res?.data?.data?.length == 0) {
            setTableData([]);
            setTotal(0);
          }
        }
      },
      onError: (error) => {
        console.log(error, "error occured in fetchAllBatchesData");

        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  useEffect(() => {
    setBreadCrumb({
      title: "Manage Batch",
      icon: "user",
      path: Paths.users
    });

    fetchAllBatches({
      page: current,
      pageSize: psize
    });
  }, []);

  // Handle key press event to detect "Enter" key and call handleSearchSubmit
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };
  // Calling api when click pagination
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? null
      : navigate("/", { state: { from: null }, replace: true });
  }, [current, psize]);

  // handle table search row data
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPsize(10);
    setCurrent(0);
    if (event.target.value === "") {
      fetchAllBatches({
        page: 0,
        pageSize: 10,
        searchTerm: ""
      });
    }
  };

  // search bar button when click search button then call api
  const handleSearchSubmit = () => {
    if (searchTerm !== null && searchTerm !== "") {
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? fetchAllBatches({ page: current, pageSize: psize, searchTerm: searchTerm })
        : navigate("/", { state: { from: null }, replace: true });
    }
  };

  //Function to run when the pagination is changed
  const handlePagination = (page, pageSize) => {
    setCurrent(page);
    setPsize(pageSize);
    fetchAllBatches({
      page: page - 1,
      pageSize: pageSize,
      searchTerm: searchTerm
    });
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>Manage Batches</Typography.Title>
      <Spin spinning={allBatchesLoading} fullscreen />
      <>
        <Row gutter={12}>
          <Col className="gutter-row" span={24}>
            <Flex justify="space-between" gap="middle">
              <Search
                className="search_bar_box"
                size="large"
                placeholder="Search by batch type and language..."
                value={searchTerm}
                onSearch={handleSearchSubmit}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
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
                      // onConfirm={() => {
                      //   handleDelete(selectedRowKeys);
                      // }}
                      onCancel={() => {
                        //
                      }}
                      okText="Yes"
                      placement="left"
                      cancelText="No">
                      <Button
                        type="default"
                        size="large"
                        danger
                        disabled={selectedRowKeys?.length > 0 ? false : true}>
                        Delete
                      </Button>
                    </Popconfirm>
                  )}
                {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                  <NavLink to={"/" + Paths.batchAdd}>
                    <Button size="large" block type="primary">
                      <PlusOutlined /> Add New
                    </Button>
                  </NavLink>
                )}
              </Flex>
            </Flex>
          </Col>
        </Row>
      </>

      <Table
        className="mt-16"
        columns={columns}
        // rowSelection={rowSelection}
        bordered={true}
        dataSource={tableData}
        pagination={false}
        scroll={{
          x: checkInnerWidth() ? "1200px" : "auto"
        }}
      />

      <div style={StyleSheet.paginationStyle}>
        <Pagination
          total={total}
          showTotal={(total) => `Total ${total} items`}
          defaultPageSize={psize}
          defaultCurrent={1}
          current={current}
          onChange={handlePagination}
          showSizeChanger={true}
          showQuickJumper
        />
      </div>
    </>
  ) : (
    <></>
  );
};
export default manageBatch;
