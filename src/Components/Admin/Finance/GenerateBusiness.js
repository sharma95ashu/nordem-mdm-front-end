import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Image,
  Input,
  Pagination,
  Row,
  Space,
  Spin,
  Table,
  Timeline,
  Typography
} from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import { useUserContext } from "Hooks/UserContext";
import React, { useEffect, useState } from "react";
import GenerateBusinessPlaceholder from "Static/img/generate-business-placeholder.svg";
import GenerateBusinessLoader from "Static/img/generate-business-loader.svg";
import styling from "Styles/variables.scss";
import { validationNumber } from "Helpers/ats.helper";
import { useMutation, useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { CheckCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import { BUSINESS_GENERATION_STEPS, snackBarErrorConf } from "Helpers/ats.constants";

const GenerateBusiness = () => {
  const [businessData, setBusinessData] = useState({});
  const [payload, setPayload] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchEnable, setISearchEnable] = useState(false);
  const [progressStep, setProgressStep] = useState([]);

  const { apiService } = useServices();
  const { setBreadCrumb } = useUserContext();

  // TABLE Columns
  const columns = [
    {
      title: "AB Id",
      dataIndex: "dist_no",
      key: "dist_no",
      sorter: (a, b) => Number(a?.dist_no || 0) - Number(b?.dist_no || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? 0}</Typography.Text>
    },
    // {
    //   title: "AB Name",
    //   dataIndex: "dist_no",
    //   key: "dist_no",
    //   sorter: (a, b) => safeString(a?.dist_no).localeCompare(safeString(b?.dist_no)),
    //   render: (text) => <Typography.Text type="secondary">{text ?? 0}</Typography.Text>
    // },
    {
      title: "Net Purchase Incentive",
      dataIndex: "perf_com",
      key: "perf_com",
      sorter: (a, b) => Number(a?.perf_com || 0) - Number(b?.perf_com || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? 0}</Typography.Text>
    },
    {
      title: "Royalty Bonus",
      dataIndex: "royal_com",
      key: "royal_com",
      sorter: (a, b) => Number(a?.royal_com || 0) - Number(b?.royal_com || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? 0}</Typography.Text>
    },
    {
      title: "Technical Bonus",
      dataIndex: "tech_com",
      key: "tech_com",
      sorter: (a, b) => Number(a?.tech_com || 0) - Number(b?.tech_com || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? 0}</Typography.Text>
    },
    {
      title: "Monthly Growth Bonus",
      dataIndex: "point_com",
      key: "point_com",
      sorter: (a, b) => Number(a?.point_com || 0) - Number(b?.point_com || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? 0}</Typography.Text>
    },
    {
      title: "Less T.D.S",
      dataIndex: "tds",
      key: "tds",
      sorter: (a, b) => Number(a?.tds || 0) - Number(b?.tds || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? 0}</Typography.Text>
    },
    {
      title: "Net Payable Amount",
      dataIndex: "final_pay",
      key: "final_pay",
      sorter: (a, b) => Number(a?.final_pay || 0) - Number(b?.final_pay || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? 0}</Typography.Text>
    }
  ];

  // useEffect function to set breadCrumb data
  useEffect(() => {
    setBreadCrumb({
      title: "Generate Business"
    });
  }, []);

  // Function to search data in the table
  const handleSearch = (values) => {
    try {
      const trimmedValue = values?.trim();

      if (!trimmedValue) return;
      setSearchValue(values);
      const request = {
        page: current - 1,
        pageSize: pageSize,
        searchTerm: values
      };
      // this will automatically make api call, as it's dependency is on useQuery
      current == 1 ? setPayload(request) : setCurrent(1);
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
        const request = {
          page: current - 1,
          pageSize: pageSize
        };
        setISearchEnable(false);
        // this will automatically make api call, as it's dependency is on useQuery
        current == 1 ? setPayload(request) : setCurrent(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // function to get the generated business
  const { refetch: fetchBusiness, isLoading } = useQuery(
    ["getGeneratedBusiness", payload],
    () => apiService.getGeneratedBusiness(payload),
    {
      enabled: !!payload, // fetch data if the payload is available
      refetchInterval: () => {
        if (businessData?.isStarted && !businessData?.isCompleted) {
          return 10000; // Continue polling every 10 seconds
        }
        return false;
      },
      onSuccess: (response) => {
        if (response?.success && response?.data) {
          const allRecords = response?.data?.data?.data || [];
          setBusinessData({
            records: allRecords,
            businessMonth: response?.data?.businessMonth || "",
            isGenerated: true,
            canGenerateBusiness: response?.data?.canGenerateBusiness,
            totalCount: response?.data?.data?.total_count,
            isStarted: response?.data?.isStarted,
            isCompleted:
              response?.data?.stepData?.current_step ===
              BUSINESS_GENERATION_STEPS.FINAL_BUSINESS_CALCULATED,
            stepData: response?.data?.stepData || {}
          });

          setTotal(response?.data?.data?.total_count);
          setDataSource(allRecords);

          // update progress step
          const steps = [];
          response?.data?.stepData?.completedSteps?.forEach((step) => {
            steps.push({
              dot: (
                <CheckCircleOutlined style={{ fontSize: 16, color: "var(--ant-color-success)" }} />
              ),
              children: step?.message || ""
            });
          });
          setProgressStep(steps);
        } else {
          setBusinessData({
            records: [],
            businessMonth: "",
            canGenerateBusiness: response?.data?.canGenerateBusiness,
            totalCount: 0,
            isStarted: response?.data?.isStarted,
            isCompleted:
              response?.data?.stepData?.current_step ===
              BUSINESS_GENERATION_STEPS.FINAL_BUSINESS_CALCULATED,
            stepData: response?.data?.stepData || {}
          });
        }
      }
    }
  );

  // Handle sheet download
  const handleDownload = async () => {
    try {
      // Show spinner
      setIsDownloading(true);

      // Making API call
      const response = await apiService.downloadBusiness();

      if (!response.ok) {
        return;
      }

      if (!response.ok && response.status === 409) {
        throw new Error("Progress Already In Queue, please try after sometime.");
      }

      /* ------------ Creating blob for file download ------------ */
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      let filename = response.headers.get("FileName") || "business.zip";
      link.setAttribute("download", filename); // Set the extracted filename

      document.body.appendChild(link);
      link.click();
      link.remove();
      /* ------------ Completed ------------ */
    } catch (error) {
      // show error
      enqueueSnackbar(error, snackBarErrorConf);
    } finally {
      setIsDownloading(false); // hide spinner
    }
  };

  useEffect(() => {
    const request = {
      page: current - 1,
      pageSize: pageSize,
      ...(searchValue && { searchTerm: searchValue })
    };

    // this will automatically make api call, as it's dependency is on useQuery
    setPayload(request);
  }, [current, pageSize]);

  /**
   * function to generate the business
   * - Triggered on Button Click
   */
  const { mutate: generateBusinessMutate, isLoading: generatingLoader } = useMutation(
    [`generateBusinessMutate`],
    () => apiService.generateBusiness(),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          fetchBusiness(); // refetching generated business data
        }
      },
      onError: (error) => {
        fetchBusiness(); // refetching generated business data
        console.log(error);
      }
    }
  );

  /*  ----------------------------------------------------------------------------
    When Busines can't be generated
  ----------------------------------------------------------------------------*/
  if (businessData?.canGenerateBusiness === false) {
    return (
      <Card>
        <Flex gap={24} vertical align="center">
          <Image width={400} preview={false} src={GenerateBusinessPlaceholder} />
          <Flex gap={8} vertical align="center">
            <Title level={5} className="margin-bottom-0">
              Business Generation Unavailable{" "}
            </Title>
            {/* <Text type="secondary">
              This may take a few moments—please wait while we process your request.
            </Text> */}
          </Flex>
          {businessData?.stepData?.current_step === BUSINESS_GENERATION_STEPS.BASE_STEP ? (
            <Alert
              style={{ padding: styling.alertPaddingSmall }}
              description="We can't generate the business at the moment as the performance bonus is not calculated yet."
              type="error"
              showIcon
            />
          ) : (
            <Alert
              style={{ padding: styling.alertPaddingSmall }}
              description="We’re unable to generate your business at the moment."
              type="error"
              showIcon
            />
          )}
        </Flex>
      </Card>
    );
  }

  /*  ----------------------------------------------------------------------------
  => LOADER GIF -  When Busines is generating...
  ----------------------------------------------------------------------------*/
  if (generatingLoader || (businessData?.isStarted && !businessData?.isCompleted)) {
    return (
      <Card>
        <Flex gap={24} vertical align="center">
          <Image width={165} preview={false} src={GenerateBusinessLoader} />
          <Flex gap={12} vertical align="center">
            {/* <Title level={5} className="margin-bottom-0">
              Business generation is in progress{" "}
            </Title> */}
            {/* <Text type="secondary" content="center">
              We are generating the business it may take some time. We will notify you once it is
              done.
            </Text> */}
            <Timeline
              style={{ marginTop: 24 }}
              items={progressStep}
              {...(businessData?.stepData?.next_pending_step && {
                pending: (
                  <Typography.Text type="secondary">
                    {businessData?.stepData?.next_pending_step}
                  </Typography.Text>
                )
              })}
            />
          </Flex>
        </Flex>
      </Card>
    );
  }

  /*  ----------------------------------------------------------------------------
    When Business is successfully generated! Displaying TABLE data 
  ----------------------------------------------------------------------------*/
  if (
    businessData?.isStarted &&
    businessData?.isCompleted &&
    businessData?.stepData?.current_step === BUSINESS_GENERATION_STEPS.FINAL_BUSINESS_CALCULATED
  ) {
    return (
      <Spin spinning={isLoading || isDownloading}>
        <Card>
          <Flex gap={16} vertical>
            <Title level={5} className="margin-bottom-0">
              {businessData?.businessMonth && `Business of ${businessData?.businessMonth}`}
            </Title>
            <Flex gap={24} vertical className="">
              <Row>
                <Col span={12}>
                  <Flex gap={12}>
                    <Button
                      onClick={handleDownload}
                      size="large"
                      icon={<DownloadOutlined />}
                      type="primary">
                      Download Sheet
                    </Button>
                    {/* <Button
                      size="large"
                      type="primary"
                      style={{ backgroundColor: "var(--ant-color-success)" }}>
                      Update Into Ledger
                    </Button> */}
                  </Flex>
                </Col>
                <Col span={12}>
                  <Input.Search
                    maxLength={50}
                    size="large"
                    onSearch={handleSearch}
                    onChange={handleChange}
                    allowClear
                    onInput={validationNumber}
                    value={searchValue}
                    placeholder="Search by A.B. ID"></Input.Search>
                </Col>
              </Row>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  bordered={true}
                  pagination={false}
                  scroll={{
                    x: "max-content"
                  }}
                />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
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
            </Flex>
          </Flex>
        </Card>

        {/* Downloading Modal */}
        {/* <Modal open={true} title="Title" footer={null} okText={"Asdsad"} onCancel={}></Modal> */}
      </Spin>
    );
  }

  /*  ----------------------------------------------------------------------------
    When Busines is not generated yet! - Allow business generation only if the performance bonus is calculated
  ----------------------------------------------------------------------------*/
  if (
    businessData?.isStarted === false &&
    businessData?.isCompleted === false &&
    businessData?.stepData?.current_step === BUSINESS_GENERATION_STEPS.PERFORMANCE_CALCULATED
  ) {
    return (
      <Spin spinning={isLoading}>
        <Card>
          <Flex gap={24} vertical>
            <Title level={5} className="margin-bottom-0">
              Generate Business
              {businessData?.businessMonth && (
                <>
                  {" for "}
                  <span style={{ color: "var(--ant-color-primary-text" }}>
                    {businessData.businessMonth}
                  </span>
                </>
              )}
            </Title>
            <Flex gap={24} vertical align="center">
              <div></div>

              {/* Screen 1 - Click to Generate Business */}
              <Image width={400} preview={false} src={GenerateBusinessPlaceholder} />
              <Flex gap={8} vertical align="center">
                <Title level={5} className="margin-bottom-0">
                  Click Generate to View Business of Current Month{" "}
                </Title>
                <Text type="secondary">
                  This may take a few moments—please wait while we process your request.
                </Text>
              </Flex>
              <Alert
                style={{ padding: styling.alertPaddingSmall }}
                description="This can be generated only once after the completion of month"
                type="warning"
                showIcon
              />
              <Button size="large" type="primary" onClick={generateBusinessMutate}>
                Generate Business
              </Button>
              <div></div>
            </Flex>
          </Flex>
        </Card>
      </Spin>
    );
  }

  /*  ----------------------------------------------------------------------------
   Empty Screen
  ----------------------------------------------------------------------------*/

  return (
    <Spin spinning={isLoading}>
      <Card>
        <Space direction="vertical" size={120}>
          <div></div>
          <div></div>
        </Space>
      </Card>
    </Spin>
  );
};

export default GenerateBusiness;
