import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Pagination,
  Row,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography
} from "antd";
import React, { useEffect, useState, useRef } from "react";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { SearchOutlined } from "@ant-design/icons";
import {
  actionsPermissionValidator,
  StringTruncate,
  validateABAndReferenceNumber,
  validationNumber
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import dayjs from "dayjs";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import { PermissionAction } from "Helpers/ats.constants";
const { Title } = Typography;
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";

const CurrentBusiness = () => {
  const params = useParams();
  const location = useLocation();
  const currentPath = location.pathname;

  const scrollDetails = useRef(null);
  const [show, setShow] = useState(false);
  const [responseData, setResponseData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tabKey, setTabKey] = useState("1");
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [currentBusinessForm] = Form.useForm();
  const [distNumber, setDistNumber] = useState("");
  const [showTenativeAlert, setShowTenativeAlert] = useState(false);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: (total, range) => `Total ${total} items`,
    onShowSizeChange: (current, size) => {
      setPagination((prevPagination) => ({ ...prevPagination, pageSize: size }));
    }
  });
  const { apiService } = useServices();
  const navigate = useNavigate();

  // Get month Count
  const showMonthValue = (key = 1) => {
    key = +key;
    try {
      // For key 1, return the current month in numeric format
      if (key === 1) {
        return dayjs().format("M"); // Returns current month number (e.g., "1" for January)
      } else {
        // For any other key, subtract the number of months and return the corresponding month number
        const month = dayjs()
          .subtract(key - 1, "month")
          .format("M"); // Adjust key to subtract correct months
        return month;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // get  month on tab change
  const showMonth = (key = 1) => {
    try {
      if (key == 1) {
        return dayjs().format("MMMM YYYY");
      } else {
        const month = key - 1;
        return dayjs().subtract(month, "month").format("MMMM YYYY");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // brand column
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "srNo",
      key: "srNo",
      render: (text, record, index) => (
        <Typography.Text type="secondary">{index + 1} </Typography.Text>
      )
    },
    {
      title: "Brand Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    },
    {
      title: "Purchase Volume",
      dataIndex: "pv",
      key: "pv",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    },
    {
      title: "Amount",
      dataIndex: "amt",
      key: "amt",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    }
  ];
  // downLine columns
  const downLineColumn = [
    // {
    //   title: "Sr. No.",
    //   dataIndex: "srNo",
    //   key: "srNo",
    //   render: (text, record, index) => (
    //     <Typography.Text type="secondary">{index + 1} </Typography.Text>
    //   )
    // },
    {
      title: "AB ID",
      dataIndex: "ab_no",
      key: "ab_no",
      sorter: (a, b) => Number(a?.ab_no) - Number(b?.ab_no),
      render: (text, record) =>
        record.show_down_link == true ? (
          <Typography.Link underline onClick={() => checkAbDownLine(record?.ab_no)}>
            {text}
          </Typography.Link>
        ) : (
          <Typography.Text type="secondary">{text}</Typography.Text>
        )
    },

    {
      title: "AB Name",
      dataIndex: "dist_name",
      key: "dist_name",
      sorter: (a, b) => a?.dist_name?.localeCompare(b?.dist_name),
      render: (text) => (
        <Tooltip title={text}>
          <Typography.Text type="secondary">{StringTruncate(text, 40)} </Typography.Text>
        </Tooltip>
      )
    },
    {
      title: "Sponsor",
      dataIndex: "sponsor",
      key: "sponsor",
      sorter: (a, b) => Number(a.sponsor) - Number(b.sponsor),
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    },
    {
      title: "Purchase Volume",
      dataIndex: "pv",
      key: "pv",
      sorter: (a, b) => Number(a.pv) - Number(b.pv),
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    }
  ];

  // handle scroll to top
  const scrollToElement = () => {
    if (scrollDetails.current) {
      scrollDetails.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Api to get Ab downLine api
  const { mutate: getDownLine, isLoading: loadingDownLine } = useMutation(
    (data) => apiService.kycCurrentBusinessDownLine(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          setTotal(data?.totalCount);
          setTableData(data?.data);
        }
      },
      onError: (error) => {
        setTableData([]);
        setTotal(0);
        console.log(error);
      }
    }
  );

  // Api method to ab details
  const { mutate: getCurrentBusiness, isLoading: loadingCurrentBusiness } = useMutation(
    (data) => apiService.kycCurrentBusiness(data),
    {
      // Configuration options for the mutation
      onSuccess: (data, variables) => {
        if (data?.success) {
          setDistNumber(variables?.dist_no);
          const month_code = Number(variables?.month_code);
          setResponseData(data?.data);
          const downLineData = {
            page: 0,
            pageSize: 10,
            dist_no: params?.id ? params.id : variables?.dist_no,
            month_code: month_code
          };
          getDownLine(downLineData);
          scrollToElement();
          setShow(true);
        }
      },
      onError: (error) => {
        setShow(false);
        setTotal(0);
        setTableData([]);
        navigate(`/${KycAdminPaths.currentBusiness}`);
        console.log(error);
      }
    }
  );

  // Common tab items
  const CommonItem = () => {
    return (
      <>
        <Row gutter={[20, 24]}>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
            <Flex justify="center" align="center">
              <Typography.Text strong>{`Month: ${showMonth(tabKey)}`}</Typography.Text>
            </Flex>
          </Col>
          <Card className="fullWidth">
            <Row gutter={[0, 16]}>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Title level={5}>Own Purchase Volume</Title>
              </Col>
              <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Space direction="vertical" size={0}>
                  <Typography.Text type="secondary">AB. Name</Typography.Text>
                  <Typography.Text>{responseData?.dist_name || "N/A"}</Typography.Text>
                </Space>
              </Col>
              <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Space direction="vertical" size={0}>
                  <Typography.Text type="secondary">Self PV</Typography.Text>
                  <Typography.Text>{responseData?.self_products_pv || "N/A"}</Typography.Text>
                </Space>
              </Col>
              <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Space direction="vertical" size={0}>
                  <Typography.Text type="secondary">Self Amount</Typography.Text>
                  <Typography.Text>{responseData?.self_products_amount || "N/A"}</Typography.Text>
                </Space>
              </Col>
              <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Space direction="vertical" size={0}>
                  <Typography.Text type="secondary">Cumulative PV</Typography.Text>
                  <Typography.Text>{responseData?.self_total_pv || "N/A"}</Typography.Text>
                </Space>
              </Col>
              <Col span={24}>
                <Divider />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Flex justify="start" alignItems="center" gap={10}>
                  <Flex justify="center" align="center">
                    <Typography.Title className="removeMargin" level={5}>
                      Down Purchase Volume
                    </Typography.Title>
                  </Flex>

                  {showTenativeAlert && (
                    <Alert
                      size={"small"}
                      message="This is tentative purchase volume it may increase or decrease"
                      type="warning"
                      showIcon
                    />
                  )}
                </Flex>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Table
                  columns={downLineColumn}
                  dataSource={tableData}
                  loading={loadingDownLine}
                  pagination={false}
                  scroll={{
                    x: "max-content"
                  }}
                />

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

              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Divider />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Typography.Text strong className="font-size-16">
                  Point PIN
                </Typography.Text>
              </Col>
              <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 12 }}>
                <Space direction="vertical" size={3}>
                  <Typography.Text type="secondary">February Pin</Typography.Text>
                  {responseData?.feb_pin ? (
                    <Tag color="processing" bordered={true}>
                      {responseData?.feb_pin}
                    </Tag>
                  ) : (
                    <Typography.Text>{"N/A"}</Typography.Text>
                  )}
                </Space>
              </Col>
              <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 12 }}>
                <Space direction="vertical" size={3}>
                  <Typography.Text type="secondary">Highest Pin</Typography.Text>
                  {responseData?.max_pin ? (
                    <Tag color="processing" bordered={true}>
                      {responseData?.max_pin}
                    </Tag>
                  ) : (
                    <Typography.Text>{"N/A"}</Typography.Text>
                  )}
                </Space>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Divider />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Typography.Title level={5}>Self Re-Purchase Brand Wise</Typography.Title>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Table
                  columns={columns}
                  dataSource={responseData?.brand_purchase}
                  pagination={responseData?.brand_purchase?.length > 10 ? pagination : false}
                  scroll={{
                    x: "max-content"
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Row>
      </>
    );
  };

  // Tab items
  const items = [
    {
      key: "1",
      label: (
        <Typography.Text secondary className="font-size-16">
          {dayjs().format("MMMM YYYY")}
        </Typography.Text>
      ),
      children: CommonItem()
    },
    {
      key: "2",
      label: (
        <Typography.Text secondary className="font-size-16">
          {dayjs().subtract(1, "month").format("MMMM YYYY")}
        </Typography.Text>
      ),
      children: CommonItem()
    },
    {
      key: "3",
      label: (
        <Typography.Text secondary className="font-size-16">
          {dayjs().subtract(2, "month").format("MMMM YYYY")}
        </Typography.Text>
      ),
      children: CommonItem()
    }
  ];

  // handle search click
  const handleSearchClick = (values) => {
    try {
      setTabKey("1");
      setDistNumber(values?.dist_no);
      const currentMonthNumber = dayjs().month() + 1;
      const data = {
        dist_no: values?.dist_no,
        month_code: Number(currentMonthNumber)
      };

      // api call to fetch report data
      getCurrentBusiness(data);
    } catch (error) {
      console.log(error);
    }
  };

  // handle tab
  const handleTabChange = (value) => {
    try {
      setTabKey(value);
      const data = {
        dist_no: params?.id ? params.id : distNumber,
        month_code: showMonthValue(value)
      };
      // api call to fetch report data
      current == 1 ? getCurrentBusiness(data) : setCurrent(1);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tabKey == 3 && dayjs().date() > 5) {
      setShowTenativeAlert(false); // hide alert
    } else {
      setShowTenativeAlert(true); // show alert
    }
  }, [tabKey]);

  //   Open new tab onClick Ab number
  const checkAbDownLine = (record) => {
    try {
      // Remove the last segment of the currentPath (e.g., "1212" from "path/1212")

      let newUrl = currentPath.replace(/\/\d+$/, ""); // This will remove the / followed by numbers at the end

      // Open the new URL with the basePath and append the `record`
      window.open(`${newUrl}/${record}`, "_blank");

      setTabKey("1");
    } catch (error) {
      console.log(error);
    }
  };

  // user profile card data
  const userDetails = {
    dist_name: responseData?.dist_name,
    dist_no: responseData?.ab_no,
    member_since: responseData?.join_date,
    old_pin: responseData?.old_pin,
    old_pin_date: responseData?.old_pin_date,
    curr_pin: responseData?.curr_pin,
    doc_path: responseData?.photo_path
  };

  // api call on pagination
  useEffect(() => {
    if (distNumber) {
      const data = {
        dist_no: params?.id ? params?.id : distNumber,
        page: current - 1,
        pageSize: pageSize,
        month_code: showMonthValue(tabKey)
      };
      getDownLine(data);
    }
  }, [current, pageSize]);

  useEffect(() => {
    if (params?.id) {
      const data = {
        dist_no: params?.id,
        month_code: dayjs().month() + 1
      };

      // api call to fetch report data
      getCurrentBusiness(data);
      scrollToElement();
    }
  }, []);

  const StyleSheet = {
    marginTop8: {
      marginTop: "8px"
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loadingCurrentBusiness}>
      <Row gutter={[20, 24]} style={StyleSheet.marginTop8} ref={scrollDetails}>
        <Col span={24}>
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Associate Buyer Current Business
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">Associate Buyers /</Typography.Text> Current
              Business
            </Typography.Text>
          </Flex>
        </Col>
        {!params?.id && (
          <>
            <Card className="fullWidth ">
              <Col
                xs={{ span: 24 }}
                sm={{ span: 24 }}
                md={{ span: 24 }}
                lg={{ span: 12 }}
                className="removePadding">
                <Form
                  name="search_form_current_business"
                  form={currentBusinessForm}
                  layout="vertical"
                  onFinish={handleSearchClick}>
                  <Form.Item
                    name="dist_no"
                    label={"Associate Buyer Number / Reference Number"}
                    required
                    rules={[
                      {
                        validator: validateABAndReferenceNumber
                      }
                    ]}
                    className="removeMargin">
                    <Input.Search
                      minLength={3}
                      maxLength={18}
                      onInput={validationNumber}
                      placeholder="Enter Associate Buyer Number / Reference Number"
                      size="large"
                      enterButton={
                        <Button
                          icon={<SearchOutlined />}
                          type="primary"
                          size="large"
                          onClick={() => currentBusinessForm.submit()}>
                          Search
                        </Button>
                      }
                      allowClear={false}
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Card>
            <Col span={24}></Col>
          </>
        )}
      </Row>

      <Row gutter={[20, 24]}>
        {show ? (
          <>
            {params?.id && <Col span={24}></Col>}
            <UserProfileCard userDetails={userDetails} />
            <Card className="fullWidth">
              <Col span={24}>
                <div className="kycTab">
                  <Tabs
                    className="fullWidth"
                    activeKey={tabKey}
                    items={items}
                    size="large"
                    onChange={(value) => handleTabChange(value)}
                  />
                </div>
              </Col>
            </Card>
          </>
        ) : (
          <SearchByFallbackComponent
            title={"Search by Associate Buyer Number / Reference Number"}
            subTitle={
              "Quickly search the Associate Buyer Number / Reference Number to process the Current Business details."
            }
            image={searchByIcon}
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default CurrentBusiness;
