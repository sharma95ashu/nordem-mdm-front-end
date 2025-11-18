import {
  DATEFORMAT,
  PermissionAction,
  PROGRAM_TYPE,
  RULES_MESSAGES,
  snackBarErrorConf,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  disableDateTillToday,
  validationNumber
} from "Helpers/ats.helper";
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
  message,
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

// Add/Edit Events component
export default function AddEditEvents() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [zoneList, setZoneList] = useState([]);
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

  // hook to get single event details
  const { mutate: fetchSingleEventDetails, isLoading: singleEventDataLoading } = useMutation(
    "fetchSingeEventData",
    () => apiService.getEventData(params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        try {
          if (data.data) {
            const {
              date,
              start_time,
              end_time,
              state,
              zone,
              status,
              passcode_start_time,
              passcode_end_time
            } = data?.data || {};
            form.setFieldsValue(data?.data);
            form.setFieldValue("date", dayjs(date));
            form.setFieldValue("passcode_start_time", dayjs(passcode_start_time));
            form.setFieldValue("passcode_end_time", dayjs(passcode_end_time));
            form.setFieldValue("time", [dayjs(start_time), dayjs(end_time)]);
            form.setFieldValue("status", status == "active");
            zone && fetchStateList(zone);
            state && fetchDistrictList(state);
          }
        } catch (error) {}
      },
      onError: (error) => {
        //
      }
    }
  );

  // hook for fetching zone list
  const { mutate: fetchZoneList, isLoading: loadingZonesList } = useMutation(
    "fetchZoneList",
    () => apiService.getZonesList(params.id),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data.data) {
            const transformedData = data?.data?.map((item) => ({
              label: item,
              value: item
            }));
            setZoneList(transformedData);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // hook for fetching state list
  const { mutate: fetchStateList, isLoading: loadingStateList } = useMutation(
    "fetchStateList",
    (data) => apiService.getStatesListBasedOnZone(data),
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
        data.start_time = value.time[0];
        data.end_time = value.time[1];

        // Define two datetime values
        const date1 = dayjs(data.start_time);
        const date2 = dayjs(data.end_time);

        data.passcode_start_time = dayjs(value.passcode_start_time);
        data.passcode_end_time = dayjs(value.passcode_end_time);

        // Get the difference in minutes
        const minuteDiff = date2.diff(date1, "minute");

        if (minuteDiff <= 0) {
          enqueueSnackbar("Require at-least 30 min time difference", snackBarErrorConf);
          return;
        }

        data.status = value.status ? "active" : "inactive";
        delete data.time;

        mutate(data); // api call for add/edit events
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // UseMutation hook for creating a new events or updating existing events via API
  const { mutate, isLoading } = useMutation((data) => apiService.addEditEvent(params.id, data), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      try {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);

          // Navigate to the current window pathname after removing a specified portion
          navigate(`/${Paths.eventsList}`);
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
      title: "RCM Events",
      icon: "pincodeStore",
      titlePath: Paths.eventsList,
      subtitle: params?.id ? "Edit Events" : "Add Events",
      path: Paths.users
    });

    fetchZoneList();

    params?.id ? fetchSingleEventDetails() : form.setFieldValue("status", true);
  }, []);

  // handle zone change
  const handleZoneChange = (val) => {
    try {
      if (val) {
        fetchStateList(val);
        form.setFields([
          { name: "state", errors: [], value: null },
          { name: "city", errors: [], value: null }
        ]);
        setStatesList([]);
        setDistrictList([]);
      }
    } catch (error) {}
  };

  // handle state change
  const handleStateChange = (val) => {
    try {
      if (val) {
        fetchDistrictList(val);
        form.setFields([{ name: "city", errors: [], value: null }]);
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

  //Function to run when the passcode end time is changed
  const handlePasscodeEndTime = (value) => {
    try {
      const startDate = form.getFieldValue("passcode_start_time");
      if (startDate && value && value.isBefore(startDate)) {
        form.setFieldsValue({ passcode_start_time: null }); // Clear Start Date if condition fails
        message.info("Please reenter the start time again!");
      }
      if (!startDate) {
        form.setFieldsValue({ passcode_end_time: null }); // Clear Start Date
        message.info("Please select passcode start time first!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Function to run when the passcode start time is changed
  const handlePasscodeStartTime = (value) => {
    try {
      const endTime = form.getFieldValue("passcode_end_time");
      if (endTime && value && endTime.isBefore(value)) {
        form.setFieldsValue({ passcode_start_time: null }); // Clear Start Date if condition fails
        message.info("Please select a start time that is earlier than the end time.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={singleEventDataLoading} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Events</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col span={12}>
            <Form.Item
              name="event_type"
              label="Event Type"
              rules={[{ required: true, message: "Event Type is required" }]}>
              <Select
                allowClear
                size="large"
                placeholder="Select Event Type"
                filterOption={(input, option) => (option?.label ?? "").includes(input)}
                options={PROGRAM_TYPE}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="zone"
              label="Zone"
              rules={[{ required: true, message: "Zone is required" }]}>
              <Select
                allowClear
                size="large"
                placeholder="Select Zone"
                onChange={handleZoneChange}
                filterOption={(input, option) => (option?.label ?? "").includes(input)}
                options={zoneList}
                loading={loadingZonesList}
                disabled={zoneList.length == 0}
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
                showSearch
                size="large"
                placeholder="Select State"
                onChange={handleStateChange}
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={stateList}
                loading={loadingStateList}
                disabled={stateList.length == 0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: "City is required" }]}>
              <Select
                allowClear
                size="large"
                showSearch
                placeholder="Select City"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={districtList}
                loading={loadingDistrictList}
                disabled={districtList.length == 0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="venue"
              label="Venue"
              rules={[
                { required: true, whitespace: true, message: "Venue is required" },
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
              <TimePicker.RangePicker
                className="time-picker"
                use12Hours
                format="h:mm a"
                minuteStep={30}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="capacity"
              label="Capacity"
              rules={[{ required: true, message: "Capacity is required" }]}>
              <Input
                size="large"
                style={{ width: "100%" }}
                placeholder="Enter Capacity"
                onInput={validationNumber}
                maxLength={6}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="passcode"
              label="Passcode"
              rules={[
                { required: true, message: "Passcode is required" },
                { max: 50, message: "Passcode must be 50 characters or less" }
              ]}>
              <Input size="large" placeholder="Enter Passcode" maxLength={50} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="passcode_start_time"
              label="Passcode Start Time"
              rules={[{ required: true, message: "Passcode start time is required" }]}>
              <DatePicker
                showTime
                size="large"
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm"
                disabledDate={disableDateTillToday}
                onChange={handlePasscodeStartTime}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="passcode_end_time"
              label="Passcode End Time"
              rules={[{ required: true, message: "Passcode end time is required" }]}>
              <DatePicker
                showTime
                size="large"
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm"
                onChange={handlePasscodeEndTime}
                disabledDate={disableDateTillToday}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.eventsList}>
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
