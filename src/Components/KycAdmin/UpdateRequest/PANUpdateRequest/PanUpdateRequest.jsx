import { Card, Col, Flex, Pagination, Row, Spin, Table, theme, Typography } from "antd";
import Search from "antd/es/input/Search";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";

const PanUpdateRequestList = () => {
  const { apiService } = useServices();
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const navigate = useNavigate();
  const [isSearchEnable, setISearchEnable] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const {
    token: { colorPrimary }
  } = theme.useToken();

  const StyleSheet = {
    fontSize14: {
      fontSize: "14px"
    },
    viewBtnStyle: {
      color: colorPrimary,
      cursor: "pointer",
      display: "block"
    }
  };

  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      render: (sr_no, record, index) => (
        <Typography.Text type="secondary">{index + 1}</Typography.Text>
      )
    },
    {
      title: "Associate Buyer Number",
      dataIndex: "dist_no",
      key: "dist_no",
      sorter: (a, b) => a?.dist_no - b?.dist_no,
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "dist_name",
      key: "dist_name",
      sorter: (a, b) => a?.dist_name.localeCompare(b?.dist_name),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      align: "center",
      title: "Action",
      dataIndex: "action",
      width: "190px",
      key: "action",
      fixed: "right",
      render: (text, record) => (
        <Flex gap="small" justify="center" align="center">
          <>
            <Typography.Text
              style={StyleSheet.viewBtnStyle}
              onClick={() => navigate(`/${KycAdminPaths.viewPanUpdateRequest}/${record.dist_no}`)}>
              View
            </Typography.Text>
          </>
        </Flex>
      )
    }
  ];

  // useQuery to fetch data
  const { mutate: getPanUpdateRequests, isLoading } = useMutation(
    "fetchPANUpdateRequests",
    (data) => apiService.getAllPANUpdateRequests(data),
    {
      enabled: true, // Fetch only when payload is available
      onSuccess: (res) => {
        if (res?.success && res?.data) {
          setTotal(res.totalCount || 0);
          setDataSource(res?.data || []);
        }
      },
      onError: (error) => {
        setTotal(0);
        setDataSource([]);
      }
    }
  );
  // hanlde dsearch icon click
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
      current == 1 ? getPanUpdateRequests(data) : setCurrent(1);
      setISearchEnable(true);
    } catch (error) {
      console.log(error);
    }
  };

  // handle search input change
  const handleChange = (e) => {
    try {
      const val = e.target.value;
      if (e) {
        setSearchValue(val);
      }
      if (isSearchEnable && !val) {
        const data = {
          page: current - 1,
          pageSize: pageSize
        };
        setISearchEnable(false);
        current == 1 ? getPanUpdateRequests(data) : setCurrent(1);
      }
    } catch (error) {}
  };

  useEffect(() => {
    const data = {
      page: current - 1,
      pageSize: pageSize,
      ...(searchValue && { searchTerm: searchValue })
    };
    getPanUpdateRequests(data); // api call
  }, [current, pageSize]);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Spin spinning={isLoading} fullscreen />
      <Row gutter={[20, 24]} className="marginTop8">
        <Col span={24}>
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              PAN Update Request
            </Typography.Title>
            <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
              <Typography.Text type="secondary">Update Request /</Typography.Text> PAN Update
              Request
            </Typography.Text>
          </Flex>
        </Col>
        <Col span={24}>
          <Card className="fullWidth ">
            <Row gutter={[20, 24]}>
              <Col span={24}>
                <Search
                  className="search_bar_box"
                  size="large"
                  placeholder="Search by AB Number or AB name"
                  allowClear
                  onSearch={handleSearch}
                  onChange={handleChange}
                  maxLength={50}
                />
              </Col>
              <Col span={24}>
                <Table columns={columns} dataSource={dataSource} bordered pagination={false} />
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
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  ) : (
    <></>
  );
};

export default PanUpdateRequestList;
