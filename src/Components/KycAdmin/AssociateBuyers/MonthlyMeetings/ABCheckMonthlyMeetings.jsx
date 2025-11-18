import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Image,
  Input,
  Pagination,
  Row,
  Spin,
  Switch,
  Table,
  Typography,
  Modal
} from "antd";
import {
  actionsPermissionValidator,
  getDateTimeFormat,
  hasEditPermission,
  safeString,
  toLocalTimeString
} from "Helpers/ats.helper";
import React, { useEffect, useState } from "react";
import RowColumnData from "../../KYC/Shared/RowColumnData";
import TextArea from "antd/es/input/TextArea";
import { useMutation } from "react-query";
import {
  FALL_BACK,
  MEETING_STATUS,
  MEETING_TYPE_KEY,
  MESSAGES,
  PermissionAction,
  timeSorter
} from "Helpers/ats.constants";
import ExportBtn from "Components/Shared/ExportBtn";
import { useServices } from "Hooks/ServicesContext";
import SuccessIcon from "Static/img/terminate_success.svg";
import { TooltipWrapper } from "Components/Shared/Wrappers/TooltipWrapper";
import { getFullImageUrl } from "Helpers/functions";

const ABCheckMonthlyMeetings = () => {
  const { apiService } = useServices();
  const [searchValue, setSearchValue] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [meetingData, setMeetingData] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [isSearchEnable, setISearchEnable] = useState(false);
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [switchToggle, setSwitchToggle] = useState(true);

  useEffect(() => {
    const data = {
      page: current - 1,
      pageSize: pageSize
    };
    // API call on change in pagination
    getMonthlyMeetings(data);
  }, [current, pageSize]);

  // handle search
  const handleSearch = (values) => {
    try {
      if (values?.trim() != "") {
        setSearchValue(values);
        const data = {
          page: current - 1,
          pageSize: pageSize,
          searchTerm: values?.trim()
        };
        // api call
        current == 1 ? getMonthlyMeetings(data) : setCurrent(1);
        setISearchEnable(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle search OnChange
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
        current == 1 ? getMonthlyMeetings(data) : setCurrent(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Meeting Table Columns
  const columns = [
    {
      title: "Meeting ID",
      dataIndex: "meeting_id",
      key: "meeting_id",
      sorter: (a, b) => Number(a?.meeting_id || 0) - Number(b?.meeting_id || 0),
      render: (meeting_id) => <Typography.Text type="secondary">{meeting_id}</Typography.Text>
    },
    {
      title: "Associate Buyer No.",
      dataIndex: "associate_buyer_no",
      key: "associate_buyer_no",
      sorter: (a, b) => Number(a?.associate_buyer_no || 0) - Number(b?.associate_buyer_no || 0),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a?.date) - new Date(b?.date),
      render: (date) => <Typography.Text type="secondary">{date}</Typography.Text>
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      sorter: timeSorter,
      render: (time) => {
        return <Typography.Text type="secondary">{time}</Typography.Text>;
      }
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) => safeString(a?.city).localeCompare(safeString(b?.city)),
      render: (city) => <Typography.Text type="secondary">{city}</Typography.Text>
    },
    {
      title: "Venue",
      dataIndex: "venue",
      key: "venue",
      sorter: (a, b) => safeString(a?.venue).localeCompare(safeString(b?.venue)),
      render: (venue) => <Typography.Text type="secondary">{venue}</Typography.Text>
    },

    {
      title: "Mobile  No.",
      dataIndex: "mobile_no",
      key: "mobile_no",
      sorter: (a, b) => safeString(a?.mobile_no).localeCompare(safeString(b?.mobile_no)),
      render: (mobile_no) => <Typography.Text type="secondary">{mobile_no}</Typography.Text>
    },
    // {
    //   title: "Mobile  No. 2",
    //   dataIndex: "mobile_no_2",
    //   key: "mobile_no_2",
    //   sorter: (a, b) => safeString(a.mobile_no_2).localeCompare(safeString(b.mobile_no_2)),
    //   render: (mobile_no_2) => <Typography.Text type="secondary">{mobile_no_2}</Typography.Text>
    // },
    {
      title: "Visiting Leader",
      dataIndex: "visiting_leader",
      key: "visiting_leader",
      sorter: (a, b) =>
        safeString(a?.visiting_leader).localeCompare(safeString(b?.visiting_leader)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },

    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      fixed: "right",
      render: (action, record) => (
        <Flex justify="space-between">
          <Button type="link" onClick={() => viewMeetingDetails(record)}>
            View
          </Button>
        </Flex>
      )
    }
  ];
  //   Handle Back
  const handleBack = (values) => {
    setSwitchToggle(true);
    setShowDetails(false);
    form.resetFields();
  };

  // get Meeting data
  const { mutate: getMonthlyMeetings, isLoading: monthlyMeetingLoader } = useMutation(
    (data) => apiService.getMonthlyMeeting(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          const updatedData = data?.data.map((item, index) => {
            return {
              serial_number: index + 1,
              ...item,
              date: getDateTimeFormat(item?.date, "YYYY/MM/DD"), // Format the date
              time: getDateTimeFormat(item?.time, "hh:mm A") // Format the time
            };
          });

          setTotal(data?.totalCount);
          setDataSource(updatedData || []);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // get monthly meeting details
  const { mutate: getMonthlyMeetingsDetails, isLoading: monthlyMeetingDetailsLoader } = useMutation(
    (data) => apiService.getMonthlyMeetingDetailsById(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          setMeetingData(data?.data);
          setShowDetails(true);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // Api method Update meeting status
  const { mutate: updateMeetingStatus, isLoading: updateStatusLoader } = useMutation(
    (data) => apiService.meetingStatusUpdate(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          form.resetFields();
          setIsModalOpen(true);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  const viewMeetingDetails = (record) => {
    try {
      const payload = {
        meeting_id: record?.meeting_id
      };

      // api call for to get meeting details
      getMonthlyMeetingsDetails(payload);
    } catch (error) {
      console.log(error);
    }
  };

  // create data for Rows
  const meeting = {
    ["Associate Buyer Number"]: meetingData?.dist_no,
    ["Meeting ID"]: meetingData?.meeting_id,
    ["Meeting Date"]: { span: 24, data: getDateTimeFormat(meetingData?.date, "YYYY/MM/DD") },
    ["Meeting Start Time"]: toLocalTimeString(meetingData?.time),
    ["End Time"]: toLocalTimeString(meetingData?.end_time),
    ["Venue"]: { span: 24, data: meetingData?.venue },
    ["City"]: meetingData?.city,
    ["State"]: meetingData?.state_name,
    ["Mobile Number"]: { span: 24, data: meetingData?.phone_no },
    ["Visiting Leader"]: { span: 24, data: meetingData?.visiting_leader_name },
    ["Type"]:
      meetingData?.type == MEETING_TYPE_KEY?.ULP_QUICK
        ? "ULP QUICK"
        : meetingData?.type?.toUpperCase(),
    ...(meetingData?.type == MEETING_TYPE_KEY?.ULP_QUICK && {
      ["Store Name"]: `${meetingData?.puc_name ? meetingData?.puc_name : ""}(${meetingData?.store})`
    })
  };

  // handle update button
  const handleUpdate = () => {
    try {
      form
        .validateFields()
        .then((value) => {
          const data = {
            meeting_id: meetingData?.meeting_id,
            meet_status:
              value?.is_approved == true ? MEETING_STATUS.APPROVED : MEETING_STATUS.REJECTED,
            remark: value?.remark
          };
          // api call for update meeting status
          updateMeetingStatus(data);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {}
  };

  // handle Modal
  const handleModal = () => {
    try {
      setSearchValue("");
      const data = {
        page: current - 1,
        pageSize: pageSize
      };
      current == 1 ? getMonthlyMeetings(data) : setCurrent(1);
      setIsModalOpen(false);
      setShowDetails(false);
      setSwitchToggle(true);
    } catch (error) {
      console.log(error);
    }
  };

  const StyleSheet = {
    imageSize: {
      height: "112px",
      width: "161px"
    }
  };

  // success modal
  const successModal = () => {
    return (
      <Modal
        open={isModalOpen}
        footer={false}
        closable={false}
        className="removeModalFooter footer_border">
        <Flex vertical={true} align="center">
          <Image style={StyleSheet.imageSize} preview={false} src={SuccessIcon} alt="success" />

          <Flex vertical={true} align="center">
            <Typography.Text strong size="large">
              Success!
            </Typography.Text>
            <Typography.Text type="secondary" size="large">
              {switchToggle
                ? ` Monthly Meeting Approved Successfully`
                : "Monthly Meeting Status Updated Successfully"}
            </Typography.Text>
            <Button type="primary" size="large" onClick={() => handleModal()}>
              OK
            </Button>
          </Flex>
        </Flex>
      </Modal>
    );
  };

  // handle Switch
  const handleSwitch = (checked) => {
    try {
      setSwitchToggle(checked);
      form.setFieldsValue({ is_approved: checked });
    } catch (error) {
      console.log(error);
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={monthlyMeetingLoader || monthlyMeetingDetailsLoader}>
      <Row gutter={[20, 24]} className="margin-top-8px">
        <Col span={24}>
          <Flex justify="space-between" vertical gap={6}>
            <Typography.Title level={4} className="removeMargin">
              {"Check Monthly Meetings"}
            </Typography.Title>
            <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
              <Typography.Text type="secondary">{"Associate Buyers / "}</Typography.Text>{" "}
              {`Check Monthly Meetings`}
            </Typography.Text>
          </Flex>
        </Col>

        <Col span={24}>
          <Card className="fullWidth">
            <Row gutter={[16, 0]}>
              {/* Meetings List Table */}
              {showDetails == false && (
                <>
                  <Col span={24}>
                    <Flex justify="space-between">
                      <ExportBtn
                        columns={columns}
                        fetchData={dataSource}
                        fileName={"ab-monthly-meeting"}
                      />

                      <Input.Search
                        allowClear
                        className="removeMargin"
                        maxLength={50}
                        size="large"
                        onSearch={handleSearch}
                        onChange={handleChange}
                        value={searchValue}
                        placeholder="Search By AB No, City, Venue, Visiting Leader, Mobile No..."></Input.Search>
                    </Flex>
                  </Col>
                  <Col span={24}>
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
                </>
              )}

              {/* Selected Meeting Info */}
              {showDetails && (
                <>
                  <Row gutter={[20, 16]} className="fullWidth fullHeight">
                    <Col span={24}>
                      <Flex vertical gap={12}>
                        {/* Info */}
                        <RowColumnData
                          titleStyle={{ color: "#1755A6" }}
                          title={"Meeting Details"}
                          columnData={meeting}
                          colSpan={12}
                          indentation={false}
                        />

                        <Flex gap={16}>
                          {meetingData?.images?.map((value, index) => (
                            <div key={index} span={6} className=" text-center">
                              <Image
                                className="meeting-image-size "
                                src={getFullImageUrl(value?.url)}
                                fallback={FALL_BACK}
                              />
                            </div>
                          ))}
                        </Flex>
                      </Flex>
                    </Col>

                    <Col span={24}>
                      <Form form={form} layout="horizontal">
                        {/* Approved Toggle */}
                        <Form.Item name="is_approved" label={"Approved"} initialValue={true}>
                          <Switch
                            className="color-switch"
                            checkedChildren="Yes"
                            unCheckedChildren="No"
                            defaultChecked
                            onChange={(checked) => handleSwitch(checked)}
                          />
                        </Form.Item>

                        {/* Remarks */}

                        {!switchToggle && (
                          <Form.Item name="remark" rules={[{ required: true }]} required>
                            <TextArea rows={4} placeholder="Enter Remarks Here" maxLength={255} />
                          </Form.Item>
                        )}

                        <Row gutter={16}>
                          <Col span={12}>
                            <Button
                              htmlType="button"
                              size="large"
                              className="width100"
                              variant="outlined"
                              onClick={handleBack}>
                              Back{" "}
                            </Button>
                          </Col>
                          <Col span={12}>
                            <TooltipWrapper
                              ChildComponent={
                                <Button
                                  disabled={!hasEditPermission()}
                                  htmlType="submit"
                                  size="large"
                                  className="width100"
                                  loading={updateStatusLoader}
                                  type="primary"
                                  onClick={() => handleUpdate()}>
                                  Update
                                </Button>
                              }
                              addTooltTip={!hasEditPermission()}
                              prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                            />
                          </Col>
                        </Row>
                      </Form>
                    </Col>
                    {/* success modal */}
                    {successModal()}
                  </Row>
                </>
              )}
            </Row>
          </Card>
        </Col>
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default ABCheckMonthlyMeetings;
