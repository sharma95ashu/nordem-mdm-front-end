import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Spin,
  Table,
  Typography
} from "antd";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { PermissionAction } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  getFilteredMonths,
  safeString,
  validationNumber
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useMutation, useQueries } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

const formKeys = {
  BRAND: "brand",
  YEAR: "year",
  MONTH: "month"
};

const SelfPVReport = () => {
  const [selectionList, setSelectionList] = useState([]);
  // const [labelNames, setLabelNames] = useState({});

  // Table States
  const [pageSize, setPageSize] = useState(10);
  const [filterData, setFilterData] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [isSearchEnable, setISearchEnable] = useState(false);

  const [form] = Form.useForm();
  const { apiService } = useServices();

  // column
  const tableColumns = [
    {
      title: "Sr. No.",
      dataIndex: "serial_number",
      key: "serial_number",
      sorter: (a, b) => Number(a.serial_number) - Number(b.serial_number),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "AB No.",
      dataIndex: "AB_no",
      key: "AB_no",
      sorter: (a, b) => Number(a.AB_no) - Number(b.AB_no),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "AB Name",
      dataIndex: "AB_name",
      key: "AB_name",
      sorter: (a, b) => safeString(a?.AB_name).localeCompare(safeString(b?.AB_name)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "P.V.",
      dataIndex: "PV",
      key: "PV",
      sorter: (a, b) => Number(a.PV) - Number(b.PV),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) => safeString(a?.city).localeCompare(safeString(b?.city)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      sorter: (a, b) => safeString(a?.district).localeCompare(safeString(b?.district)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => safeString(a?.state).localeCompare(safeString(b?.state)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Mobile  No.",
      dataIndex: "mobile_no",
      key: "mobile_no",
      sorter: (a, b) => Number(a.mobile_no) - Number(b.mobile_no),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    }
  ];

  // API CALL - fetching the club types and period types
  const [
    { data: brandList, isLoading: isBrandsLoading, isSuccess: isBrandsSuccess },
    { data: yearsList, isLoading: isYearsLoading, isSuccess: isYearsSuccess },
    { data: monthsList, isLoading: isMonthsLoading, isSuccess: isMonthsSuccess }
  ] = useQueries([
    {
      queryKey: "brandList",
      queryFn: () => apiService.KYC_getAllBrandList(),
      enabled: true,
      select: (data) =>
        data?.success && data?.data
          ? data?.data?.map((item) => ({
              label: item?.brand_name,
              value: item?.brand_id
            }))
          : [],
      onError: (error) => {
        //
      }
    },
    {
      queryKey: "yearsList",
      queryFn: () => apiService.getAvailableYearsforKYC(),
      enabled: true,
      select: (data) =>
        data?.success && data?.data
          ? data?.data?.map((e) => ({
              value: e.year,
              label: e.year
            }))
          : [],
      onError: (error) => {
        //
      }
    },
    {
      queryKey: "monthsList",
      queryFn: () => apiService.getAvailableMonthsforKYC(),
      enabled: true,
      select: (data) =>
        data?.success && data?.data
          ? data?.data?.map((e) => ({
              value: e.month,
              label: e.month_name
            }))
          : [],
      onError: (error) => {
        //
      }
    }
  ]);

  const handleSetSelectionList = () => {
    setSelectionList([
      {
        formKey: formKeys.BRAND,
        formLabel: "Select Brand",
        options: brandList
      },
      {
        formKey: formKeys.YEAR,
        formLabel: "Select Year",
        options: yearsList
      },
      {
        formKey: formKeys.MONTH,
        formLabel: "Select Month",
        options: getFilteredMonths(form, monthsList) // this will return the filtered months based on year selected...
      }
    ]);
  };

  // This will be called when all BRANDS, YEARS, and MONTHS are fetched successfully!
  useEffect(() => {
    if (isBrandsSuccess && isYearsSuccess && isMonthsSuccess) {
      handleSetSelectionList();
    }
  }, [isBrandsSuccess, isYearsSuccess, isMonthsSuccess, brandList, yearsList, monthsList]);

  const handleSelectionChange = (key, data) => {
    if (key === formKeys.YEAR) {
      handleSetSelectionList();
    }

    // updating the currently selected option label...
    // setLabelNames((prev) => ({
    //   ...prev,
    //   [key]: data?.label
    // }));
  };

  // API CALL - fetching the list of Self PV Report
  const { mutate: getSelfPVReportMutate, isLoading } = useMutation(
    ["get-self-pv-report"],
    (request) => apiService.getSelfPVReport(request),
    {
      enabled: false,
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setTotal(data?.totalCount);
          setFilterData(null);

          // modifying data for better export columns
          const updatedData = data?.data?.map((record, i) => {
            return {
              serial_number: i + 1,
              ...(record?.dist_no && { AB_no: record?.dist_no }),
              ...(record?.dist_name && { AB_name: record?.dist_name }),
              ...(record?.amt && { amount: record?.amt }),
              ...(record?.pv && { PV: record?.pv }),
              ...(record?.city && { city: record?.city }),
              ...(record?.district && { district: record?.district }),
              ...(record?.state && { state: record?.state }),
              ...(record?.mobile_no && { mobile_no: record?.mobile_no })
            };
          });

          setDataSource(updatedData || []);
          setShowTable(true); // show data
        }
      },
      onError: (error) => {
        setTotal(0);
        setFilterData(null);
        setDataSource([]);
        setShowTable(false); // hide data
        console.log(error);
      }
    }
  );

  // ------------- Fetch Associate Details -------------
  const fetchSelfPVReport = (values, handleCurrent = true) => {
    const { brand, year, month, minimum, maximum } = values ?? {}; // de-structured form input values

    // early return if all the required fields are not avaialble...
    if (!brand || !year || !month || !minimum || !maximum) {
      return;
    }

    // making an api call to fetch data...
    const request = {
      brand,
      year,
      month,
      min_pv: minimum,
      max_pv: maximum,
      page: current - 1,
      pageSize,
      ...(searchValue && { searchTerm: searchValue })
    };

    // making the API CALL
    if (handleCurrent) {
      current == 1 ? getSelfPVReportMutate(request) : setCurrent(1);
    } else {
      getSelfPVReportMutate(request);
    }
  };

  // validating min pv and max pv
  const validatePVFields = (values) => {
    return new Promise((resolve, reject) => {
      let { minimum, maximum } = values;
      // Convert to numbers
      minimum = Number(minimum);
      maximum = Number(maximum);

      // Clear previous errors
      form.setFields([
        { name: "minimum", errors: [] },
        { name: "maximum", errors: [] }
      ]);

      let errors = [];
      if (maximum == 0) {
        errors.push({ name: "maximum", errors: ["Maximum PV cannot be zero"] });
      } else if (minimum == maximum) {
        errors.push({ name: "minimum", errors: ["Minimum PV can not be equal to Maximum PV"] });
      } else if (minimum > maximum) {
        errors.push({ name: "minimum", errors: ["Minimum PV must be less than Maximum PV"] });
      } else if (maximum < minimum) {
        errors.push({ name: "maximum", errors: ["Maximum PV must be greater than Minimum PV"] });
      }
      if (errors.length > 0) {
        form.setFields(errors);
        reject("Validation failed");
      } else {
        resolve(values);
      }
    });
  };

  // ON FINISH: triggered on form submission...
  const onFinish = (values) => {
    validatePVFields(values)
      .then((validatedValues) => {
        setISearchEnable(false);
        setSearchValue("");
        fetchSelfPVReport(validatedValues);
      })
      .catch((err) => console.error(err));
  };

  /** ----------------------------------------------------------
  -----------------------  Table Methods   ---------------------
  ------------------------------------------------------------ */

  // function to fetch data on the page size change...
  useEffect(() => {
    fetchSelfPVReport(form.getFieldsValue(), false);
  }, [current, pageSize]);

  // Function to clear the field and its error when changing one
  const handlePVChange = (e) => {
    form.setFields([
      { name: "maximum", errors: [] },
      { name: "minimum", errors: [] }
    ]); // Clear maximum error
  };

  // handle search
  const handleSearch = (values) => {
    try {
      const trimmedValue = values?.trim();
      if (!trimmedValue) return;
      setSearchValue(values);
      fetchSelfPVReport(form.getFieldsValue());
      setISearchEnable(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    try {
      if (e) {
        const value = e.target.value;
        // Update the state with the numeric value
        setSearchValue(value);
      }
      // If the input is cleared, trigger refetch
      if (isSearchEnable && !e.target.value) {
        fetchSelfPVReport(form.getFieldsValue());
        setISearchEnable(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading || isBrandsLoading || isYearsLoading || isMonthsLoading}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Flex gap={12} vertical>
            <div></div>
            <Flex justify="space-between" vertical gap={8} className="fullWidth">
              <Typography.Title level={4} className="removeMargin">
                {"Self P.V. Report"}
              </Typography.Title>
              <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
                <Typography.Text type="secondary">{"Reports /"}</Typography.Text>{" "}
                {"Self P.V. Report"}
              </Typography.Text>
            </Flex>
          </Flex>
        </Col>
        <Col span={24}>
          <Card>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={[24, 24]}>
                <Col span={21}>
                  {/* Options */}
                  <Flex gap={24}>
                    {selectionList.length > 0 &&
                      selectionList.map((item) => {
                        return (
                          <Form.Item
                            key={item.formKey}
                            name={item.formKey}
                            className="margin-bottom-0 flex-1"
                            label={item.formLabel}
                            rules={[{ required: true, message: "Field selection is required" }]}>
                            <Select
                              size="large"
                              placeholder={item.formLabel}
                              options={item?.options || []}
                              onChange={(_, option) => handleSelectionChange(item.formKey, option)}
                            />
                          </Form.Item>
                        );
                      })}

                    {/* Enter Minimum */}
                    <Form.Item
                      name={"minimum"}
                      className="margin-bottom-0 flex-1"
                      label={"Enter Minimum PV"}
                      onInput={validationNumber}
                      rules={[{ required: true, message: "Minimum PV is required" }]}>
                      <Input
                        size="large"
                        placeholder={"Enter Minimum PV"}
                        maxLength={18}
                        onChange={handlePVChange}
                      />
                    </Form.Item>

                    {/* Enter Maximum */}
                    <Form.Item
                      name={"maximum"}
                      className="margin-bottom-0 flex-1"
                      label={"Enter Maximum PV"}
                      onInput={validationNumber}
                      rules={[{ required: true, message: "Maximum PV is required" }]}>
                      <Input
                        size="large"
                        placeholder={"Enter Maximum PV"}
                        maxLength={20}
                        onChange={handlePVChange}
                      />
                    </Form.Item>
                  </Flex>
                </Col>
                <Col span={3}>
                  {/* Search */}
                  <Button
                    htmlType="submit"
                    type="primary"
                    size="large"
                    className="margin-top-28 fullWidth"
                    icon={<SearchOutlined />}>
                    Search
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={24}>
          {showTable ? (
            <Card>
              <Flex justify="space-between">
                {/* <ExportBtn
                  columns={tableColumns}
                  fetchData={dataSource}
                  fileName={`Self PV Report - ${labelNames["brand"]} - ${labelNames["year"]} - ${labelNames["month"]}`}
                /> */}
                <Row gutter={[12]} className="fullWidth marginBottom16">
                  <Col xs={24} md={12}></Col>
                  <Col xs={24} md={12}>
                    <Input.Search
                      maxLength={18}
                      size="large"
                      onSearch={handleSearch}
                      onChange={handleChange}
                      allowClear
                      value={searchValue}
                      placeholder="Search..."></Input.Search>
                  </Col>
                </Row>
              </Flex>
              <Table
                dataSource={filterData != null ? filterData : dataSource}
                columns={tableColumns}
                bordered={true}
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
            </Card>
          ) : (
            <SearchByFallbackComponent
              title={"Search For Self P.V. Report"}
              subTitle={"Quickly search for Self P.V. Report to generate the relevant report."}
              image={searchByIcon}
            />
          )}
        </Col>
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default SelfPVReport;
