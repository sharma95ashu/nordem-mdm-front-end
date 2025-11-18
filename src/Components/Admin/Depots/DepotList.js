import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Input, Pagination, Row, Spin, Table, Tag, Typography } from "antd";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator, capitalizeFirstWord, safeString } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import React, { useState } from "react";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";

const DepotList = () => {
  const [dataSource, setDataSource] = useState([]);
  const { setBreadCrumb } = useUserContext();
  const { apiService } = new useServices();
  const navigate = useNavigate();

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [isSearchEnable, setISearchEnable] = useState(false);

  // Table columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      width: "100px",
      sorter: (a, b) => a.sr_no - b.sr_no,
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "Depot Code",
      dataIndex: "depot_code",
      key: "depot_code",
      sorter: (a, b) => safeString(a?.depot_code).localeCompare(safeString(b?.depot_code)),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "Depot Name",
      dataIndex: "depot_name",
      key: "depot_name",
      sorter: (a, b) => safeString(a?.depot_name).localeCompare(safeString(b?.depot_name)),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "Depot User ID",
      dataIndex: "depot_user_id",
      key: "depot_user_id",
      sorter: (a, b) => safeString(a?.depot_user_id).localeCompare(safeString(b?.depot_user_id)),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "State",
      dataIndex: "region_name",
      key: "region_name",
      sorter: (a, b) => safeString(a?.region_name).localeCompare(safeString(b?.region_name)),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      sorter: (a, b) => Number(a?.phone || 0) - Number(b?.phone || 0),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "GST No.",
      dataIndex: "gst_no",
      key: "gst_no",
      sorter: (a, b) => safeString(a?.gst_no).localeCompare(safeString(b?.gst_no)),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "PAN No.",
      dataIndex: "pan_no",
      key: "pan_no",
      sorter: (a, b) => safeString(a?.pan_no).localeCompare(safeString(b?.pan_no)),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) => safeString(a?.city).localeCompare(safeString(b?.city)),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "Pincode",
      dataIndex: "pincode",
      key: "pincode",
      sorter: (a, b) => Number(a?.pincode || 0) - Number(b?.pincode || 0),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "Email ID",
      dataIndex: "email_id",
      key: "email_id",
      sorter: (a, b) => safeString(a?.email_id).localeCompare(safeString(b?.email_id)),
      render: (value) => <Typography.Text type="secondary">{value ?? "-"}</Typography.Text>
    },
    {
      title: "Address 1",
      dataIndex: "address_1",
      key: "address_1",
      width: "350px",
      sorter: (a, b) => safeString(a?.address_1).localeCompare(safeString(b?.address_1)),
      render: (value) => <Typography.Text type="secondary">{value || "-"}</Typography.Text>
    },
    {
      title: "Address 2",
      dataIndex: "address_2",
      key: "address_2",
      width: "350px",
      sorter: (a, b) => safeString(a?.address_2).localeCompare(safeString(b?.address_2)),
      render: (value) => <Typography.Text type="secondary">{value || "-"}</Typography.Text>
    },
    {
      title: "Address 3",
      dataIndex: "address_3",
      key: "address_3",
      width: "350px",
      sorter: (a, b) => safeString(a?.address_3).localeCompare(safeString(b?.address_3)),
      render: (value) => <Typography.Text type="secondary">{value || "-"}</Typography.Text>
    },
    {
      title: "Address 4",
      dataIndex: "address_4",
      key: "address_4",
      width: "350px",
      sorter: (a, b) => safeString(a?.address_4).localeCompare(safeString(b?.address_4)),
      render: (value) => <Typography.Text type="secondary">{value || "-"}</Typography.Text>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "140px",
      fixed: "right",
      align: "center",
      sorter: (a, b) => safeString(a?.status).localeCompare(safeString(b?.status)),
      render: (value) => (
        <>
          <Tag color={value === "active" ? "success" : value === "inactive" ? "error" : ""}>
            {capitalizeFirstWord(value)}
          </Tag>
        </>
      )
    },
    {
      title: "Action",
      dataIndex: "action",
      width: "140px",
      key: "action",
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Flex gap="small" justify="center" align="center">
          <>
            <Button
              type="default"
              disabled={!actionsPermissionValidator(location.pathname, PermissionAction.EDIT)}
              onClick={() => navigate(`/${Paths.depotEdit}/${record.id}`)}
              icon={<EditOutlined />}>
              Edit
            </Button>
          </>
        </Flex>
      )
    }
  ];

  // Set breadcrumb
  useEffect(() => {
    setBreadCrumb({
      title: "Manage Depots",
      icon: "depot",
      path: Paths.depotList
    });
  }, []);

  // API Call to get all depots
  const { mutate: fetchDepots, isLoading } = useMutation((data) => apiService.getAllDepots(data), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      if (data.success && data?.data?.data) {
        const newData = data?.data?.data?.map((record, index) => {
          return {
            sr_no: index + 1 + (current - 1) * pageSize,
            ...record
          };
        });

        setDataSource(newData);
        setTotal(data?.data?.totalCount);
      }
    },
    onError: (error) => {
      setTotal(0);
      setDataSource([]);
      console.log(error);
    }
  });

  // handle search
  const handleSearch = (values) => {
    try {
      const trimmedValue = values?.trim();

      if (!trimmedValue) return;

      setSearchValue(trimmedValue);

      const data = {
        page: current - 1,
        pageSize: pageSize,
        searchTerm: trimmedValue
      };
      // api call
      current == 1 ? fetchDepots(data) : setCurrent(1);
      setISearchEnable(true);
    } catch (error) {
      console.log(error);
    }
  };

  // handle search change
  const handleChange = (e) => {
    try {
      if (e) {
        const value = e.target.value;
        // Update the state with the numeric value
        setSearchValue(value);
      }

      // If the input is cleared, trigger refetch
      if (isSearchEnable && !e.target.value) {
        const data = {
          page: current - 1,
          pageSize: pageSize
        };
        setISearchEnable(false);
        // api call
        current == 1 ? fetchDepots(data) : setCurrent(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle pagination
  useEffect(() => {
    const data = {
      page: current - 1,
      pageSize: pageSize,
      ...(searchValue && { searchTerm: searchValue })
    };
    // api call
    fetchDepots(data);
  }, [current, pageSize]);

  return actionsPermissionValidator(location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading}>
      <Flex vertical gap={24}>
        <Typography.Title level={4} className="removeMargin">
          All Depots
        </Typography.Title>
        <Row gutter={[24, 24]} justify={"space-between"}>
          <Col xs={14} md={12}>
            {" "}
            <Input.Search
              className="search_bar_box"
              size="large"
              placeholder="Search by Depot Name, Depot Code, Phone Number, and Pincode..."
              value={searchValue}
              onSearch={handleSearch}
              onChange={handleChange}
              allowClear
            />
          </Col>
          <Col xs={6} md={12}>
            <Flex justify="flex-end">
              {actionsPermissionValidator(location.pathname, PermissionAction.ADD) && (
                <Flex gap="middle" justify="flex-end">
                  <Button
                    size="large"
                    type="primary"
                    className="wrapButton"
                    onClick={() => navigate(`/${Paths.depotAdd}`)}>
                    <PlusOutlined />
                    Add New
                  </Button>
                </Flex>
              )}
            </Flex>
          </Col>
        </Row>
        <Table
          scroll={{
            x: "max-content"
          }}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          bordered={true}
        />
        <Pagination
          align="end"
          total={total}
          showTotal={(total) => `Total ${total} items`}
          current={current}
          onChange={(newPage, newPageSize) => {
            setCurrent(newPage);
            setPageSize(newPageSize);
          }}
          showSizeChanger={true}
          showQuickJumper
        />
      </Flex>
    </Spin>
  ) : (
    <></>
  );
};

export default DepotList;
