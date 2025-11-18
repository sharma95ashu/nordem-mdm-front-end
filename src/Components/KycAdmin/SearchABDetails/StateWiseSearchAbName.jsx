import {
  Alert,
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
import React, { useEffect, useState } from "react";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQueries } from "react-query";
import {
  actionsPermissionValidator,
  safeString,
  sanitizeName,
  validateNameField
} from "Helpers/ats.helper";
import { PermissionAction } from "Helpers/ats.constants";
import SearchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import { SearchOutlined } from "@ant-design/icons";

// Search by - State component
const StateWiseSearchAbName = () => {
  const [selectedState, setSelectedState] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [filterData, setFilterData] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [show, setShow] = useState(false);

  const [form] = Form.useForm();
  const { apiService } = useServices();

  // table columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "index",
      sorter: (a, b) => a.index - b.index,
      render: (index) => <Typography.Text type="secondary">{index + 1}</Typography.Text>
    },
    {
      title: "Associate Buyer Number",
      dataIndex: "ab_no",
      key: "ab_no",
      sorter: (a, b) => Number(a.ab_no) - Number(b.ab_no),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "ab_name",
      key: "ab_name",
      sorter: (a, b) => safeString(a?.ab_name).localeCompare(safeString(b?.ab_name)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      sorter: (a, b) => safeString(a?.district).localeCompare(safeString(b?.district)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => safeString(a?.state).localeCompare(safeString(b?.state)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    }
  ];

  // rules and validations
  const rules = {
    select: [
      {
        required: true,
        message: "Field selection is required."
      }
    ]
  };

  // fetching the state and the districts
  const [
    { data: getStates, isLoading: statesLoading },
    { data: getDistrict, isLoading: districtsLoading }
  ] = useQueries([
    {
      queryKey: "getStates",
      queryFn: () => apiService.getStatesForSearchABByName(),
      enabled: true, // fetching states on load
      select: (data) =>
        data.success && data?.data
          ? data?.data?.map((e) => ({ value: e?.state_code, label: e?.state_name }))
          : [],
      onError: (error) => {
        // Handle error here
        console.error("Error fetching states:", error);
      }
    },
    {
      queryKey: ["getDistrict", selectedState],
      queryFn: () => apiService.getDistrictForSearchABByName(selectedState),
      enabled: !!selectedState, // Only fetch when a state is selected
      select: (data) =>
        data.success && data?.data
          ? data?.data?.map((e) => ({ value: e?.dist_name, label: e?.dist_name }))
          : [],
      onError: (error) => {
        console.error("Error fetching districts:", error);
      },
      onSettled: () => {
        // clear the DISTRICT form slect otpion
        form.setFieldsValue({ district_name: null });
      }
    }
  ]);

  // ------------- Fetch Associate Details -------------
  const fetchAssociate = (values) => {
    const { state_code, district_name, name, father_name, nominee_name, spouse_name } =
      values || {}; // De-structing the form values

    // early return if all the required fields are not avaialble...
    if (!state_code || !district_name || !name) {
      return;
    }

    // Preparing the API request
    const request = {
      page: current - 1,
      size: pageSize,
      body: {
        state_code: state_code,
        district: district_name?.toString(),
        name: name,
        father_name: father_name,
        nominee_name: nominee_name,
        spouse_name: spouse_name
      }
    };

    // making the API CALL
    current == 1 ? getAbDetailsMutate(request) : setCurrent(1);
  };

  // ON FINISH: triggered on form submission...
  const handleFinish = (values) => {
    fetchAssociate(values);
  };

  // UseMutation hook for fetching AB...
  const { mutate: getAbDetailsMutate, isLoading } = useMutation(
    (request) => apiService.searchABByStateDistrictName(request.page, request.size, request.body),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setTotal(data?.totalCount);
          setFilterData(null);
          setDataSource(
            data?.data?.map((item, index) => ({
              ...item,
              index // Adding index  for sorting
            })) || []
          );
          setShow(true);
        }
      },
      onError: (error) => {
        setTotal(0);
        setFilterData(null);
        setDataSource([]);
        setShow(false);
        console.error(error);
      }
    }
  );

  /** ----------------------------------------------------------
  -----------------------  Table Methods   ---------------------
  ------------------------------------------------------------ */

  // function to fetch data on the page size change...
  useEffect(() => {
    fetchAssociate(form.getFieldsValue());
  }, [current, pageSize]);

  // handle Search
  const handleSearch = (value) => {
    try {
      //allowed keys for search
      const allowedKeys = ["ab_no", "ab_name"];
      const filterTable =
        dataSource.length > 0 &&
        dataSource.filter((o) =>
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
      setFilterData(filterTable);
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  // function to handle search on key down or backspace
  const handleKeyDown = (e) => {
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      if (e.target?.value?.length === 0) {
        setFilterData(null);
      }
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={statesLoading || districtsLoading || isLoading}>
      <Row gutter={[20, 24]} style={StyleSheet.marginTop8}>
        <Flex justify="space-between" vertical gap={8} className="fullWidth">
          <Typography.Title level={4} className="removeMargin">
            Search By Associate Buyer Name
          </Typography.Title>
          <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
            <Typography.Text type="secondary">Search AB Details By /</Typography.Text> Associate
            Buyer Name
          </Typography.Text>
        </Flex>
        <Card className={"fullWidth"}>
          <Form name="search_form" form={form} layout="vertical" onFinish={handleFinish}>
            <Row gutter={[20, 24]}>
              {/* State */}
              <Col span={7}>
                <Form.Item
                  name={"state_code"}
                  label={"Select State"}
                  rules={rules.select}
                  className="removeMargin"
                  required>
                  <Select
                    placeholder={"Select State"}
                    showSearch
                    size="large"
                    options={getStates}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(value) => setSelectedState(value)} // Update state dependency on change
                  />
                </Form.Item>
              </Col>
              {/* District */}
              <Col span={7}>
                <Form.Item
                  name={"district_name"}
                  label={"Select District"}
                  rules={rules.select}
                  className="removeMargin"
                  required>
                  <Select
                    placeholder={"Select District"}
                    showSearch
                    size="large"
                    options={getDistrict}
                    disabled={!getDistrict?.length}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              {/* Name */}
              <Col span={7}>
                <Form.Item
                  name={"name"}
                  label={"Name"}
                  className="removeMargin"
                  required
                  rules={[
                    {
                      validator: validateNameField
                    }
                  ]}>
                  <Input
                    placeholder={`Enter Name`}
                    size="large"
                    type="text"
                    onInput={sanitizeName}
                    maxLength={100}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name={"father_name"} label={"Father Name"} className="removeMargin">
                  <Input
                    placeholder={`Enter Father Name`}
                    size="large"
                    type="text"
                    onInput={sanitizeName}
                    maxLength={100}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name={"nominee_name"} label={"Nominee Name"} className="removeMargin">
                  <Input
                    placeholder={`Enter Nominee Name`}
                    size="large"
                    type="text"
                    onInput={sanitizeName}
                    maxLength={100}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name={"spouse_name"} label={"Spouse Name"} className="removeMargin">
                  <Input
                    placeholder={`Enter Spouse Name`}
                    size="large"
                    type="text"
                    onInput={sanitizeName}
                    maxLength={100}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item label=" " className="removeMargin">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="fullWidth"
                    style={{ marginBottom: "8px" }}
                    icon={<SearchOutlined />}>
                    Search
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        <Alert
          className="bordered__info__alert fullWidth"
          message={
            "Dynamically apply AND conditions for each provided name field: name, father name, nominee name, and spouse name."
          }
          type="info"
          showIcon
        />
        {/* Table */}
        {show ? (
          <Card className="fullWidth">
            <Flex gap={24} vertical>
              <Row>
                <Col span={12}>
                  {/* <ExportBtn columns={columns} fetchData={filterData != null ? filterData : dataSource} /> */}
                </Col>
                <Col span={24}>
                  <Input.Search
                    allowClear
                    span={12}
                    className="removeMargin"
                    maxLength={50}
                    size="large"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onSearch={handleSearch}
                    onInput={handleKeyDown}
                    placeholder="Search..."></Input.Search>
                </Col>
              </Row>
              <Table
                dataSource={filterData != null ? filterData : dataSource}
                columns={columns}
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
            </Flex>
          </Card>
        ) : (
          <>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title={"Search AB By Name"}
              subTitle={
                "Quickly search for AB’s by name within a state to generate the respective list."
              }
              image={SearchByIcon}
            />
          </>
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default StateWiseSearchAbName;
