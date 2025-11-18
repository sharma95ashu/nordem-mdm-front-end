import {
  DATEFORMAT,
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
  Typography
} from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";

// Add/Edit Notification component
export default function AddEditNotice() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [showOnData, setShowOnData] = useState([]);

  const navigate = useNavigate();
  const [form] = Form.useForm();

  /***
   * styles
   */
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    }
  };

  // hook to get single notice details
  const { mutate: fetchSingleNoticeDetails, isLoading: singleNoticeDataLoading } = useMutation(
    "fetchSingeEventData",
    () => apiService.getNoticeData(params?.id),
    {
      onSuccess: (data) => {
        try {
          if (data?.data) {
            const { start_date, end_date, status } = data?.data || {};
            form.setFieldsValue(data?.data);
            form.setFieldValue("start_date", dayjs(start_date));
            form.setFieldValue("end_date", dayjs(end_date));
            form.setFieldValue("status", status == "active");
            // setDates({ start_date, end_date });
          }
        } catch (error) {}
      },
      onError: (error) => {
        //
      }
    }
  );

  // Function to submit notice data
  const onFinish = (value) => {
    try {
      if (value) {
        let data = { ...value };
        data.status = value?.status ? "active" : "inactive";
        mutate(data); // api call for add/edit notice
      }
    } catch (error) {}
  };

  // UseMutation hook for creating a new notice or updating existing notice via API
  const { mutate, isLoading } = useMutation((data) => apiService.addEditNotice(params?.id, data), {
    onSuccess: (data) => {
      try {
        if (data) {
          enqueueSnackbar(data.message, snackBarSuccessConf); // Display a success Snackbar notification with the API response message
          navigate(`/${Paths.noticesList}`); // Navigate to the specified path
        }
      } catch (error) {}
    },
    onError: (error) => {
      //
    }
  });

  //Function to fetch the data of Show On Notifications
  const { isLoading: showOnLoading } = useQuery(
    "getShowOnData",
    () => apiService.getShowOnNotificationData(),
    {
      onSuccess: (res) => {
        if (res.success) {
          if (res?.data?.length > 0) {
            const dates = res.data.map((data) => {
              return { label: data.template_name, value: data.slug };
            });

            setShowOnData([{ label: "Default", value: "default" }, ...dates]);
          }
        }
      },
      onErrors: (error) => {
        console.log(error, "error occured in showOnData");
      }
    }
  );

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
      title: "Static Pages",
      icon: "pincodeStore",
      titlePath: Paths.noticesList,
      subtitle: params?.id ? "Edit Notification" : "Add Notification",
      path: Paths.users
    });

    params?.id ? fetchSingleNoticeDetails() : form.setFieldValue("status", true);
  }, []);

  // // disable past date and today's date
  const disabledDate = (current) => {
    return current && dayjs(current).isBefore(dayjs(), "day");
  };

  // handle start date change
  const handleStartDateChange = (value) => {
    try {
      const endDate = form.getFieldValue("end_date");

      if (endDate && value && value.isAfter(endDate)) {
        form.setFieldsValue({ end_date: null }); // Clear End Date if condition fails
      }
    } catch (error) {}
  };

  // handle end date change
  const handleEndDateChange = (value) => {
    try {
      const startDate = form.getFieldValue("start_date");

      if (startDate && value && value.isBefore(startDate)) {
        if (!params.id) {
          form.setFieldsValue({ start_date: null }); // Clear Start Date if condition fails
        } else {
          form.setFieldsValue({ end_date: null }); // Clear Start Date if condition fails
        }
      }
    } catch (error) {}
  };

  useMutation;

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={singleNoticeDataLoading || showOnLoading} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Notification</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col span={24}>
            <Form.Item
              name="notice_text"
              label="Notification Text"
              rules={[
                { required: true, whitespace: true, message: "Notification Text is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,150}$/,
                  message: "Notification Text must be between 3 and 150 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Text" size="large" maxLength={150} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="show_on"
              label="Show On"
              rules={[{ required: true, message: "Show On is required" }]}>
              <Select
                showSearch
                allowClear
                size="large"
                placeholder="Select Show On"
                options={showOnData}
                filterOption={(input, option) => {
                  const label = String(option?.label) ?? "";
                  return label?.toLowerCase().includes(String(input)?.toLowerCase());
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="start_date"
              label="Start Date"
              rules={[{ required: true, message: "Start Date is required" }]}>
              <DatePicker
                className="date-picker"
                format={DATEFORMAT.RANGE_FORMAT}
                disabledDate={disabledDate}
                onChange={handleStartDateChange}
                // disabled={params?.id}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="end_date"
              label="End Date"
              rules={[{ required: true, message: "End Date is required" }]}>
              <DatePicker
                className="date-picker"
                format={DATEFORMAT.RANGE_FORMAT}
                disabledDate={disabledDate}
                onChange={handleEndDateChange}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={6}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>
        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.noticesList}>
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
