import {
  DATEFORMAT,
  MEETING_TYPE,
  PermissionAction,
  RULES_MESSAGES,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  TimePicker,
  Typography
} from "antd";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";

// Add/Edit Meeting component
export default function AddEditMeeting() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [stateList, setStatesList] = useState([]);
  const [districtList, setDistrictList] = useState([]);

  /***
   * styles
   */
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    }
  };

  // hook to get single meeting details
  const { mutate: fetchSingleEventDetails, isLoading: singleMeetingDataLoading } = useMutation(
    "fetchSingleMeetingData",
    () => apiService.getMeetingData(params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        try {
          if (data.data) {
            const { date, time, state, status } = data?.data || {};
            form.setFieldsValue(data?.data);
            form.setFieldValue("date", dayjs(date));
            form.setFieldValue("time", dayjs(time));
            form.setFieldValue("status", status == "active");
            state && fetchDistrictList(state);
          }
        } catch (error) {}
      },
      onError: (error) => {
        //
      }
    }
  );

  // hook for fetching state list
  const { mutate: fetchStateList, isLoading: loadingStateList } = useMutation(
    "fetchStateList",
    () => apiService.getStatesList(),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data.data) {
            const transformedData = data?.data?.map((item) => ({
              label: item.state_name.toUpperCase(),
              value: item.state_name.toUpperCase()
            }));
            setStatesList(transformedData);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // hook for fetching district list
  const { mutate: fetchDistrictList, isLoading: loadingDistrictList } = useMutation(
    "fetchDistrictList",
    (data) => apiService.getSDistrictListBasedOnState(data),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data.data) {
            const transformedData = data?.data?.data?.map((item) => ({
              label: item.district.toUpperCase(),
              value: item.district.toUpperCase()
            }));
            setDistrictList(transformedData);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  /**
   * Function to submit form data
   * @param {*} value
   */
  const onFinish = (value) => {
    try {
      if (value) {
        let data = { ...value };
        data.status = value.status ? "active" : "inactive";

        mutate(data); // api call for add/edit meeting
      }
    } catch (error) {}
  };

  // UseMutation hook for creating a new meeting or updating existing meeting via API
  const { mutate, isLoading } = useMutation((data) => apiService.addEditMeeting(params.id, data), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      try {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);

          // Navigate to the current window pathname after removing a specified portion
          navigate(`/${Paths.meetingsList}`);
        }
      } catch (error) {}
    },
    onError: (error) => {
      //
    }
  });

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Meetings Schedule",
      icon: "pincodeStore",
      titlePath: Paths.meetingsList,
      subtitle: params?.id ? "Edit Meeting" : "Add Meeting",
      path: Paths.users
    });
    fetchStateList();
    params?.id ? fetchSingleEventDetails() : form.setFieldValue("status", true);
  }, []);

  // handle state change
  const handleStateChange = (val) => {
    try {
      if (val) {
        fetchDistrictList(val);
        form.setFields([
          { name: "district", errors: [], value: null },
          { name: "city", errors: [], value: null }
        ]);
        setDistrictList([]);
      }
    } catch (error) {}
  };

  // disable past date and today's date
  const disabledDate = (current) => {
    return (
      current && (dayjs(current).isBefore(dayjs(), "day") || dayjs(current).isSame(dayjs(), "day"))
    );
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={singleMeetingDataLoading} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Meeting</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col span={12}>
            <Form.Item
              name="visiting_leader"
              label="Visiting Leader"
              rules={[
                { required: true, message: "Visiting Leader is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,100}$/,
                  message: "The value must be between 3 and 100 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Visiting Leader Name" size="large" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="phone_no"
              label="Phone No"
              rules={[
                { required: true, message: "Phone no. is required" },
                {
                  pattern: /^[6-9]{1}[0-9]{9}$/,
                  message: "Invalid Phone no."
                }
              ]}>
              <Input placeholder="Enter Phone No" size="large" type="number" maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: "Type is required" }]}>
              <Select
                allowClear
                size="large"
                placeholder="Select Type"
                filterOption={(input, option) => (option?.label ?? "").includes(input)}
                options={MEETING_TYPE}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: "State is required" }]}>
              <Select
                allowClear
                size="large"
                placeholder="Select State"
                onChange={handleStateChange}
                filterOption={(input, option) => (option?.label ?? "").includes(input)}
                options={stateList}
                loading={loadingStateList}
                disabled={stateList.length == 0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="district"
              label="District"
              rules={[{ required: true, message: "District is required" }]}>
              <Select
                allowClear
                size="large"
                placeholder="Select District"
                filterOption={(input, option) => (option?.label ?? "").includes(input)}
                options={districtList}
                loading={loadingDistrictList}
                disabled={districtList.length == 0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[
                { required: true, message: "City is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,50}$/,
                  message: "The value must be between 3 and 50 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter City" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="venue"
              label="Venue"
              rules={[
                { required: true, message: "Venue is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,100}$/,
                  message: "The value must be between 3 and 100 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Venue" size="large" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Date is required" }]}>
              <DatePicker
                className="date-picker"
                format={DATEFORMAT.RANGE_FORMAT}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: "Time is required" }]}>
              <TimePicker className="time-picker" use12Hours format="h:mm a" />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.meetingsList}>
            <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>
              Cancel
            </Button>
          </NavLink>
          {actionsPermissionValidator(
            window.location.pathname,
            params?.id ? PermissionAction.EDIT : PermissionAction.ADD
          ) && (
            <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
              {params?.id ? "Update" : "Add"}
            </Button>
          )}
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}
