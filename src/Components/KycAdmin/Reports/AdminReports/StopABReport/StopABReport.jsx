import {
  Alert,
  Card,
  Col,
  Flex,
  Input,
  Modal,
  Pagination,
  Row,
  Spin,
  Table,
  Typography
} from "antd";
import Link from "antd/es/typography/Link";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator, getDateTimeFormat, safeString } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { KycAdminPaths } from "Router/KYCAdminPaths";
import { Link as RouterLink } from "react-router-dom";

const StopABReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchEnable, setISearchEnable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const { apiService } = useServices();

  // Modal open function
  const openModal = (data) => {
    setModalData({
      title: `Stopped Remarks for ${data.ab_name} (${data.associate_buyer_no})`,
      dataSource: data?.remark ? data.remark.split(",").map((item) => ({ remark: item })) : []
    });
    setIsModalOpen(true); // Open the modal
  };

  // Table Columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      sorter: (a, b) => Number(a?.sr_no) - Number(b?.sr_no),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "AB ID",
      dataIndex: "associate_buyer_no",
      key: "associate_buyer_no",
      sorter: (a, b) => Number(a?.associate_buyer_no) - Number(b?.associate_buyer_no),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "AB Name",
      dataIndex: "ab_name",
      key: "ab_name",
      sorter: (a, b) => safeString(a?.ab_name).localeCompare(safeString(b?.ab_name)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Stopped On",
      dataIndex: "stopped_on",
      key: "stopped_on",
      sorter: (a, b) => new Date(a?.stopped_on)?.getTime() - new Date(b?.stopped_on)?.getTime(),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      sorter: (a, b) => safeString(a?.created_by).localeCompare(safeString(b?.created_by)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Remarks",
      dataIndex: "remark",
      key: "remark",
      render: (_, field) => (
        <Link underline type="primary" onClick={() => openModal(field)}>
          View Remarks
        </Link>
      )
    }
  ];

  // Api method
  const { mutate: getStoppedABReport, isLoading: reportLoading } = useMutation(
    (data) => apiService.getStoppedABReport(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const newData = data?.data.map((item, index) => {
            return {
              sr_no: index + 1 + (current - 1) * pageSize,
              ...item,
              stopped_on: getDateTimeFormat(item.stopped_on, "YYYY/MM/DD") || null
            };
          });

          setDataSource(newData || []);
          setTotal(data?.totalCount);
        }
      },
      onError: (error) => {
        setTotal(0);
        setDataSource([]);
        console.log(error);
      }
    }
  );

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
      current == 1 ? getStoppedABReport(data) : setCurrent(1);
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
        current == 1 ? getStoppedABReport(data) : setCurrent(1);
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
    getStoppedABReport(data);
  }, [current, pageSize]);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={reportLoading}>
      <Flex gap={12} vertical>
        <div></div>
        <Flex gap={24} vertical>
          {/* ------------- Title & Breadcrumbs ------------- */}
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Stopped AB Report
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">Reports /</Typography.Text> Stopped AB Report
            </Typography.Text>
          </Flex>

          <Card className="fullWidth">
            <Flex gap={18} vertical>
              <Alert
                className="bordered__info__alert"
                message={
                  <span>
                    Note: This report will only display the ABs which are exclusively stopped from
                    the{" "}
                    <RouterLink to={"/" + KycAdminPaths.abIdStop}>
                      <b>AB ID Stop</b>
                    </RouterLink>{" "}
                    menu.
                  </span>
                }
                type="info"
                showIcon
              />
              <div></div>
            </Flex>

            <Col span={24}>
              <Flex justify="space-between">
                {/* <ExportBtn
                  columns={columns}
                  fetchData={dataSource}
                  fileName={"stopped-ab-report"}
                /> */}
                <Row gutter={[12]} className="fullWidth marginBottom16">
                  <Col xs={24} md={12}></Col>
                  <Col xs={24} md={12}>
                    <Input.Search
                      maxLength={50}
                      onSearch={handleSearch}
                      onChange={handleChange}
                      value={searchValue}
                      allowClear
                      size="large"
                      placeholder="Search..."
                    />
                  </Col>
                </Row>
              </Flex>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
              <Table
                className="compact_table"
                dataSource={dataSource}
                columns={columns}
                bordered
                scroll={{
                  x: "max-content"
                }}
                pagination={false}
              />
            </Col>
            <Col span={24}>
              <div className="paginationStyle">
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
              </div>
            </Col>
          </Card>
        </Flex>
      </Flex>

      <Modal
        okText="OK"
        className="removeModalFooter"
        cancelText="Cancel"
        title={modalData.title}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        open={isModalOpen}
        footer={false}>
        <Table
          pagination={false}
          bordered
          scroll={{
            x: "max-content"
          }}
          columns={[
            {
              title: "Sr. No.",
              width: 120,
              render: (_, __, index) => (
                <Typography.Text type="secondary">{index + 1}</Typography.Text>
              )
            },
            {
              title: "Remarks",
              dataIndex: "remark",
              key: "remark",
              render: (text) => (
                <Typography.Text type="secondary">
                  {text?.toLowerCase() === "contact to ho" ? "Contact To Head Office" : text ?? "-"}
                </Typography.Text>
              )
            }
          ]}
          dataSource={modalData.dataSource}
        />
      </Modal>
    </Spin>
  ) : (
    <></>
  );
};

export default StopABReport;
