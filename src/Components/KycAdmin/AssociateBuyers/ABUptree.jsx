import { FilterOutlined, PlusCircleTwoTone } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Image,
  Input,
  Pagination,
  Row,
  Select,
  Table,
  Typography
} from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator, safeString } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import closeIcon from "Static/img/closeIcon.svg";
import deleteIcon from "Static/img/deleteBinIcon.svg";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

const ABUptree = () => {
  const [searchPayload, setSearchPayload] = useState(null);
  const { apiService } = useServices();
  const [displayFilter, setDisplayFilter] = useState(false);
  const [operator, setOperator] = useState(true);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [paginatedData, setPaginatedData] = useState([]);
  const [filterCount, setFilterCount] = useState(null);
  const [rowCount, setRowCount] = useState(1); // state to manage visibility of 'AND/OR' operator
  const [filteredDataList, setFilteredDataList] = useState([]);
  const [fetchedData, setFetchedData] = useState([]);
  const [searchFilteredData, setSearchFilteredData] = useState([]);

  const StyleSheet = {
    width100: {
      width: "100%"
    },
    width60: {
      width: "60%"
    },
    minwidth30: {
      minWidth: "30%"
    },
    minWidth40: {
      minWidth: "40%"
    },
    marginBottom12: {
      marginBottom: "12px"
    },
    filterBox: {
      width: "100%",
      position: "absolute",
      top: 0,
      zIndex: 10
    },
    zIndex100000000: {
      zIndex: 100000000
    },
    deleteBtnStyle: {
      border: "none",
      boxShadow: "none"
    },
    addCondBtnStyle: {
      border: "1px solid #1755A6"
    }
  };

  // table columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      sorter: (a, b) => a.sr_no - b.sr_no,
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      sorter: (a, b) => a.level - b.level,
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Associate Buyer Number",
      dataIndex: "associate_buyer_number",
      key: "associate_buyer_number",
      sorter: (a, b) => Number(a.associate_buyer_number) - Number(b.associate_buyer_number),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "associate_buyer_name",
      key: "associate_buyer_name",
      sorter: (a, b) =>
        safeString(a.associate_buyer_name).localeCompare(safeString(b.associate_buyer_name)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Sponsor",
      dataIndex: "sponsor",
      key: "sponsor",
      sorter: (a, b) => safeString(a.sponsor).localeCompare(safeString(b.sponsor)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Pin Description",
      dataIndex: "pin_description",
      key: "pin_description",
      sorter: (a, b) => safeString(a.pin_description).localeCompare(safeString(b.pin_description)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Mobile No.1",
      dataIndex: "mobile_no_1",
      key: "mobile_no_1",
      sorter: (a, b) => safeString(a.mobile_no_1).localeCompare(safeString(b.mobile_no_1)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Mobile No.2",
      dataIndex: "mobile_no_2",
      key: "mobile_no_2",
      sorter: (a, b) => safeString(a.mobile_no_2).localeCompare(safeString(b.mobile_no_2)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    }
  ];

  // filter : 'Select' dropdown options
  const filterCol = [
    { label: "Level", value: "level" },
    { label: "Associate Buyer Name", value: "associate_buyer_name" },
    { label: "Sponsor", value: "sponsor" },
    { label: "Pin Description", value: "pin_description" },
    { label: "Mobile No.1", value: "mobile_no_1" },
    { label: "Mobile No.2", value: "mobile_no_2" }
  ];

  const stringTypesColumns = ["associate_buyer_name", "pin_description"];
  const numberTypesColumns = ["level", "sponsor", "mobile_no_1", "mobile_no_2"];

  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        const payload = {
          dist_no: val
        };
        setSearchPayload(payload);
      }
    } catch (error) {}
  };

  // handle search change / search clear
  const handleClear = () => {
    //
  };

  // api for fetching ab details by ab no
  const { isLoading } = useQuery(
    ["fetchAbUptreeDetails", searchPayload],
    () => apiService.getAbDetailsForUptree(searchPayload),
    {
      enabled: !!searchPayload, // Fetch only when payload is available
      onSuccess: (res) => {
        if (res?.data) {
          const tempArr = res?.data?.map((item, index) => ({
            sr_no: index + 1, // Add serial number starting from 1
            ...item
          }));
          setSearchFilteredData(null);
          setFetchedData(tempArr);
          setTotal(tempArr?.length); // set total count
        }
      },
      onError: (error) => {
        setFetchedData([]);
      },
      onSettled: (res) => {
        handleClearAll();
      }
    }
  );

  // Function to handle pagination of data
  const paginateData = (data) => {
    try {
      // Calculate the start index based on the current page and page size
      const startIndex = (current - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginated = [...data]?.slice(startIndex, endIndex);
      setPaginatedData(paginated);
    } catch (error) {}
  };

  // reset pagination fn
  const resetPagination = () => {
    try {
      setCurrent(1);
      setPageSize(10);
    } catch (error) {}
  };

  const handleFilterClick = () => {
    setDisplayFilter(!displayFilter);
  };

  const stringConditons = [
    {
      label: "Equals",
      value: "equals"
    },
    {
      label: "Not Equals",
      value: "not-equals"
    },
    {
      label: "Starts With",
      value: "startsWith"
    },
    {
      lable: "Contains",
      value: "includes"
    },
    {
      lable: "Ends With",
      value: "endsWith"
    }
  ];

  const numberConditions = [
    {
      label: "Equals",
      value: "equals"
    },
    {
      label: "Not Equals",
      value: "not-equals"
    },
    {
      lable: "Before",
      value: "before"
    },
    {
      label: "After",
      value: "after"
    }
  ];

  // string conditons to evaluate
  const stringHandlerConditions = {
    equals: (fieldValue, conditionValue) =>
      fieldValue?.toLowerCase() === conditionValue?.toLowerCase(),
    "not-equals": (fieldValue, conditionValue) =>
      fieldValue?.toLowerCase() !== conditionValue?.toLowerCase(),
    startsWith: (fieldValue, conditionValue) =>
      fieldValue?.toLowerCase().startsWith(conditionValue?.toLowerCase()),
    includes: (fieldValue, conditionValue) =>
      fieldValue?.toLowerCase().includes(conditionValue?.toLowerCase()),
    endsWith: (fieldValue, conditionValue) =>
      fieldValue?.toLowerCase().endsWith(conditionValue?.toLowerCase())
  };

  // number conditions to evaluate
  const numberConditionHandlers = {
    equals: (fieldValue, conditionValue) => Number(fieldValue) == Number(conditionValue),
    "not-equals": (fieldValue, conditionValue) => Number(fieldValue) !== Number(conditionValue),
    before: (fieldValue, conditionValue) => Number(fieldValue) < Number(conditionValue), // Custom "before" condition (e.g., for date comparison)
    after: (fieldValue, conditionValue) => Number(fieldValue) > Number(conditionValue) // Custom "after" condition (e.g., for date comparison)
  };

  //  function to evaluate conditions
  const evaluateCondition = (row, condition) => {
    try {
      const fieldValue = row[condition.select]; // Get the value of the field from the row
      const conditionValue = condition.value; // Get the value to match
      let handlerType;
      if (stringTypesColumns.includes(condition.select)) {
        handlerType = stringHandlerConditions;
      } else if (numberTypesColumns.includes(condition.select)) {
        handlerType = numberConditionHandlers;
      }
      // If the condition is found in the map, apply the corresponding function
      if (handlerType[condition.condition](fieldValue, conditionValue)) {
        return handlerType[condition.condition](fieldValue, conditionValue);
      }

      return false; // Default to false if condition type is unrecognized
    } catch (error) {}
  };

  // function to apply filters
  const applyFilters = (data, conditions) => {
    try {
      if (conditions.length == 1) {
        return data.filter((row) => {
          return evaluateCondition(row, ...conditions); // Use the helper function to check the conditions
        });
      }

      if (conditions.length > 1) {
        return data.filter((row) => {
          return conditions[operator ? "every" : "some"](
            (condition) => evaluateCondition(row, condition) // Use the helper function to check the conditions
          );
        });
      }
    } catch (error) {}
  };

  // handle apply filter function when the 'Apply Filter' button is clicked
  const handleApplyFilter = () => {
    form
      .validateFields() // validate form fields
      .then(async (values) => {
        resetPagination(); // reset pagination
        const filteredData = await applyFilters(fetchedData, values?.filters); // applyFilters fn call
        setFilteredDataList(filteredData || []); // update filtered data list
        // paginateData(filteredData || []); // paginate filtered data
        setTotal(filteredData?.length); // set total items after filtering
        setFilterCount(values?.filters?.length || null); // set filter count
        setDisplayFilter(false); // close filter display
      })
      .catch((err) => {
        //
      });
  };

  // handle dynamic changes for the "Condition" dropdown based on 'Selected' dropdown value
  const handleFilterSelect = (index, val) => {
    try {
      let condTypeDropdown = [];
      if (stringTypesColumns.includes(val)) {
        condTypeDropdown = stringConditons; // set for string type fields
      } else if (numberTypesColumns.includes(val)) {
        condTypeDropdown = numberConditions; // set for number type fields
      }
      const filters = form.getFieldValue("filters");
      filters[index].valueOptions = condTypeDropdown; // assign dynamic options for the 'Conditons' dropdown
      filters[index].value = null;
      filters[index].condition = null;
      form.setFieldsValue({ filters }); // update form fields
    } catch (error) {}
  };

  // update rowCount based on the filters list length
  const handleRowCount = () => {
    const filters = form.getFieldValue("filters");
    setRowCount(filters ? filters.length : 0);
  };

  useEffect(() => {
    const dataToPaginate =
      filteredDataList?.length > 0 || filterCount > 0 ? filteredDataList : fetchedData;
    // if (dataToPaginate?.length > 0) {}
    paginateData(dataToPaginate); // call paginateData after ensuring data exists
    setTotal(dataToPaginate?.length); // set the total count based on the available data
  }, [current, pageSize, fetchedData, filteredDataList, filterCount]);

  // handle clear all fn
  const handleClearAll = () => {
    try {
      form.resetFields();
      setRowCount(0);
      resetPagination();
      paginateData(fetchedData);
      setTotal(fetchedData?.length);
      setFilteredDataList([]);
      setFilterCount(null);
      setDisplayFilter(false);
    } catch (error) {}
  };

  // function to handle search on the table
  const handleSearch = (value) => {
    try {
      //allowed keys for search
      const allowedKeys = [
        "associate_buyer_name",
        "associate_buyer_number",
        "pin_description",
        "cpin_code",
        "mobile_no_1",
        "mobile_no_2",
        "sponsor"
      ];
      const filterTable =
        paginatedData.length > 0 &&
        paginatedData.filter((o) =>
          Object.keys(o).some((k) => {
            // Check if the key matches any of the specified columns and if the value contains the search text
            if (
              allowedKeys.includes(k) &&
              String(o[k])?.toLowerCase().includes(String(value)?.toLowerCase())
            ) {
              return true;
            }

            return false;
          })
        );
      setSearchFilteredData(filterTable);
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  // function to handle search on key down or backspace
  const handleKeyDown = (e) => {
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      if (e.target?.value?.length === 0) {
        setSearchFilteredData(null);
      }
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"associate_buyer_uptree"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        searchInputField={true}
      />
      <Row gutter={[20, 24]}>
        {fetchedData?.length > 0 ? (
          <div className="kyc_admin_base">
            <Flex justify="flex-start" align="flex-start" gap={10}>
              <Badge dot={filterCount > 0}>
                <Button size="large" onClick={handleFilterClick}>
                  <FilterOutlined />
                  {filterCount !== null ? `Filter (${filterCount})` : "Filter"}
                </Button>
              </Badge>
              <ExportBtn
                columns={columns}
                fetchData={searchFilteredData != null ? searchFilteredData : fetchedData}
                fileName={"ABUptree"}
              />

              <Input.Search
                allowClear
                className="marginBottom16"
                size="large"
                maxLength={50}
                onSearch={handleSearch}
                onInput={handleKeyDown}
                placeholder="Search by Associate Buyer Number or Name, Mobile Number, Sponsor, or Pin"></Input.Search>
            </Flex>
            <div style={{ position: "relative" }}>
              <Table
                columns={columns}
                dataSource={searchFilteredData != null ? searchFilteredData : paginatedData}
                bordered
                pagination={false}
              />
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

              {displayFilter && (
                <div style={StyleSheet.filterBox}>
                  <Card>
                    <Row gutter={[0, 10]}>
                      <Col span={24}>
                        <Flex gap={10} vertical>
                          <Flex gap={10}>
                            {rowCount >= 2 && (
                              <Flex
                                justify="center"
                                align="center"
                                vertical
                                className="rotated-box"
                                onClick={() => setOperator(!operator)}>
                                <Typography.Text className="rotated-text">
                                  {operator ? "AND" : "OR"}
                                </Typography.Text>
                                <Image src={closeIcon} preview={false} />
                              </Flex>
                            )}
                            <Flex vertical gap={10} style={StyleSheet.width100}>
                              <Form
                                form={form}
                                initialValues={{
                                  filters: [
                                    {
                                      select: null,
                                      condition: null,
                                      value: null,
                                      valueOptions: []
                                    }
                                  ]
                                }}>
                                <Form.List name="filters">
                                  {(fields, { add, remove }) => (
                                    <>
                                      {fields.map(({ key, name, ...restField }) => (
                                        <Flex
                                          key={key}
                                          justify="space-between"
                                          style={StyleSheet.marginBottom12}>
                                          <Flex gap={10} style={StyleSheet.width60}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, "select"]}
                                              className="removeMargin"
                                              rules={[
                                                { required: true, message: "Field is required" }
                                              ]}
                                              style={StyleSheet.minwidth30}>
                                              <Select
                                                placeholder="Select"
                                                size="large"
                                                options={filterCol}
                                                dropdownStyle={StyleSheet.zIndex100000000}
                                                // style={{ borderColor: "#FFD591" }}
                                                onSelect={(val) => handleFilterSelect(name, val)}
                                              />
                                            </Form.Item>
                                            <Form.Item
                                              {...restField}
                                              name={[name, "condition"]}
                                              className="removeMargin"
                                              rules={[
                                                { required: true, message: "Field is required" }
                                              ]}
                                              style={StyleSheet.minwidth30}>
                                              <Select
                                                placeholder="Condition"
                                                size="large"
                                                options={
                                                  form.getFieldValue("filters")?.[name]
                                                    ?.valueOptions || []
                                                }
                                                dropdownStyle={StyleSheet.zIndex100000000}
                                              />
                                            </Form.Item>
                                            <Form.Item
                                              {...restField}
                                              name={[name, "value"]}
                                              className="removeMargin"
                                              rules={[
                                                { required: true, message: "Field is required" }
                                              ]}
                                              style={StyleSheet.minWidth40}>
                                              <Input
                                                placeholder={`Enter Value`}
                                                size="large"
                                                type="text"
                                                style={StyleSheet.zIndex100000000}
                                                maxLength={18}
                                              />
                                            </Form.Item>
                                          </Flex>
                                          <Flex>
                                            <Button
                                              size="large"
                                              onClick={() => {
                                                remove(name);
                                                handleRowCount();
                                              }}
                                              style={StyleSheet.deleteBtnStyle}>
                                              <Flex justify="center" gap={8}>
                                                <img src={deleteIcon} />
                                                <span style={{ color: "#DC2626" }}>Delete</span>
                                              </Flex>
                                            </Button>
                                          </Flex>
                                        </Flex>
                                      ))}
                                      <Flex justify="space-between">
                                        <Button
                                          size="large"
                                          onClick={() => {
                                            add();

                                            handleRowCount();
                                          }}
                                          style={StyleSheet.addCondBtnStyle}>
                                          <PlusCircleTwoTone /> Add Condition
                                        </Button>

                                        <Flex gap={10}>
                                          <Button size="large" onClick={handleClearAll}>
                                            Clear All
                                          </Button>
                                          <Button
                                            size="large"
                                            type="primary"
                                            onClick={handleApplyFilter}
                                            style={{ border: "1px solid #1755A6" }}>
                                            Apply Filter
                                          </Button>
                                        </Flex>
                                      </Flex>
                                    </>
                                  )}
                                </Form.List>
                              </Form>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Col>
                    </Row>
                  </Card>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title={"Search by Associate Buyer Number / Reference Number"}
              subTitle={
                "Quickly search the Associate Buyer Number / Reference Number to check Uptree of the corresponding AB ID."
              }
              image={searchByIcon}
            />
          </>
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default ABUptree;
