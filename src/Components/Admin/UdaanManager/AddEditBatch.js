/* eslint-disable no-unused-vars */
import {
  batchTypes,
  DATEFORMAT,
  PermissionAction,
  RULES_MESSAGES,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  disableDateTillToday,
  disabledDate,
  getTitle,
  UrlValidation,
  validationNumber
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import dayjs from "dayjs";
import {
  Button,
  Col,
  DatePicker,
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
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { get } from "lodash";
import { ALL_FORM_VALIDATIONS } from "Helpers/mdm.form.validate";

function AddEditBatch() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [languagesList, setLanguagesList] = useState([]);

  // const [showOnData, setShowOnData] = useState([]);
  // const [fetchBatchTypes, setFetchBatchTypes] = useState([]);

  const navigate = useNavigate();
  const [form] = Form.useForm();
  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? params?.id
        ? getBatchData()
        : null
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Static Pages",
      icon: "",
      titlePath: Paths.manageBatch,
      subtitle: params?.id ? "Edit Batch" : "Add Batch",
      path: Paths.users
    });

    params?.id ? null : form.setFieldValue("status", true);
  }, []);

  // hook for fetching single marketing-plan data
  const { isLoading: loadingLanguages } = useQuery(
    "fetchLanguageData",
    () => apiService.getMarketingPlanLanguage(),
    {
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data.data) {
            const tempLanguagesData = data?.data?.data?.map((item) => ({
              label: item.mp_language_name + " - " + item?.mp_language_code,
              value: item?.mp_language_name
            }));
            setLanguagesList(tempLanguagesData || []);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // handle start date change
  const handleStartDateChange = (value) => {
    if (value) {
      const minEndDate = value.add(14, "day"); // Enforce 14-day gap
      const endDate = form.getFieldValue("end_time");

      if (endDate && endDate < minEndDate) {
        form.setFieldsValue({ end_time: null }); // Reset end date if invalid
      }

      form.setFieldsValue({ start_time: value });
    }
  };

  // handle end date change
  const handleEndDateChange = (value) => {
    try {
      const startDate = form.getFieldValue("start_date");
      if (startDate && value && value.isBefore(startDate)) {
        form.setFieldsValue({ start_date: null }); // Clear Start Date if condition fails
      }
      if (!startDate) {
        form.setFieldsValue({ end_date: null }); // Clear Start Date
        message.info("Please select start date first!");
      }
    } catch (error) {}
  };

  // Function to fetch single batch data
  const { mutate: getBatchData } = useMutation(() => apiService.getBatchUdaan(params?.id), {
    onSuccess: (res) => {
      if (res?.success && res?.data) {
        const data = res.data;
        delete data.batch_id;

        const startDate = dayjs(data.start_time); // Keep as Day.js object
        const endDate = dayjs(data.end_time); // Keep as Day.js object

        form.setFieldsValue({
          ...data,
          start_date: startDate, // DatePicker expects a Day.js object
          end_date: endDate, // DatePicker expects a Day.js object
          start_and_end_time: [startDate, endDate] // TimePicker RangePicker expects array
        });
      }
    },
    onError: (err) => {
      console.log(err, "error occurred in get batch data");
    }
  });

  // APi call to add batch in Udaan
  const { mutate: addBatch, isLoading: addBatchLoading } = useMutation(
    (payload) => apiService.addBatchUdaan(payload),
    {
      onSuccess: (res) => {
        if (res?.success) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
          navigate(`/${Paths.manageBatch}`);
          form.resetFields();
        }
      },
      onError: (err) => {
        console.log(err, "error occured in add batch");
      }
    }
  );

  // APi call to update batch in Udaan
  const { mutate: updateBatchUdaan, isLoading: updateBatchLoading } = useMutation(
    (payload) => apiService.updateBatchUdaan(payload, params?.id),
    {
      onSuccess: (res) => {
        if (res?.success) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
          navigate(`/${Paths.manageBatch}`);
        }
      },
      onError: (err) => {
        console.log(err, "error occured in add batch");
      }
    }
  );

  // API call for fetching states list
  const { data: statesList, isLoading: loadingStates } = useQuery(
    ["fechStateList"], // Query key
    () => apiService.getStatesGeneric(),
    {
      enabled: true,
      select: (res) => {
        if (res?.success && res?.data && res?.data.length > 0) {
          let options = res.data.map((e, index) => ({
            label: getTitle(e.state_name),
            value: e.state_code_old
          }));
          return options;
        }
      },
      onError: (error) => {
        console.error("Failed to fetch Order Detail", error);
      }
    }
  );

  // Function to disable end date before start date
  const disabledEndDate = (current) => {
    const startDate = form.getFieldValue("start_date");

    if (startDate) {
      const startDateObj = dayjs(startDate).startOf("day");
      return current && dayjs(current).startOf("day").isSameOrBefore(startDateObj.add(13, "day"));
    } else {
      return current && dayjs(current).startOf("day").isSameOrBefore(dayjs(), "day");
    }
  };

  // Function to submit notice data
  const onFinish = (values) => {
    try {
      if (values) {
        const { start_date, end_date, start_and_end_time, ...restValues } = values;

        const payload = {
          ...restValues,
          start_time: `${start_date.format("YYYY-MM-DD")} ${start_and_end_time[0].format(
            "HH:mm:ss"
          )}`,
          end_time: `${end_date.format("YYYY-MM-DD")} ${start_and_end_time[1].format("HH:mm:ss")}`
        };

        if (params?.id) {
          updateBatchUdaan(payload);
        } else {
          addBatch(payload);
        }
      }
    } catch (error) {
      console.error("Error in onFinish:", error);
    }
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={loadingLanguages || addBatchLoading || updateBatchLoading} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Batch</Typography.Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col span={12}>
            <Form.Item
              name="batch_type"
              label="Batch Type"
              rules={[{ required: true, message: "Please select batch type" }]}>
              <Select
                placeholder="Select Type"
                size="large"
                options={batchTypes}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label?.toLowerCase() ?? "").includes(input?.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="language"
              label="Language"
              rules={[{ required: true, message: "Please select language" }]}>
              <Select
                placeholder="Select Language"
                size="large"
                options={languagesList}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label?.toLowerCase() ?? "").includes(input?.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          <Col span={9}>
            <Form.Item
              name="start_date"
              label="Start Date"
              rules={[{ required: true, message: "Please enter start date" }]}>
              <DatePicker
                className="date-picker"
                format="DD MMMM YYYY"
                disabledDate={disableDateTillToday}
                placeholder="Start Date"
                onChange={handleStartDateChange}
                allowClear
                onClear={() => {
                  form.setFieldValue("start_date", null);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="start_and_end_time"
              label="Start & End Time"
              rules={[{ required: true, message: "Please enter start & end time" }]}>
              <TimePicker.RangePicker
                size="large"
                showTime={{ format: "HH:mm" }}
                format="hh:mm a"
                minuteStep={10}
                placeholder="Select Start & End Time"
              />
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item
              name="end_date"
              label="End Date"
              rules={[{ required: true, message: "Please enter end date" }]}>
              <DatePicker
                className="date-picker"
                format="DD MMMM YYYY"
                disabledDate={disabledEndDate}
                placeholder="End Date"
                onChange={handleEndDateChange}
                defaultPickerValue={dayjs(form.getFieldValue("start_date")).add(14, "day")}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="capacity"
              label="Capacity"
              rules={[
                ...ALL_FORM_VALIDATIONS.validateNumberRange(
                  "Capacity",
                  1, // Minimum value
                  1000 // Maximum value
                ).validations,
                ...ALL_FORM_VALIDATIONS.required_validation("capacity").validations
              ]}>
              <Input
                placeholder="Capacity"
                size="large"
                maxLength={4}
                max={999}
                onInput={validationNumber}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="course_id" label="Course Id/Class No">
              <Input placeholder="Course Id" maxLength={20} size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="class_id" label="Class Id">
              <Input placeholder="Class Id" maxLength={20} size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="short_link"
              label="Short Link"
              rules={[
                { validator: UrlValidation },
                {
                  pattern: /^.{1,200}$/,
                  message: "The value must be between 1 and 200 characters long."
                },
                {
                  pattern: /^\S(.*\S)?$/,
                  message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Short Link" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="youtube_link"
              label="YouTube Link"
              rules={[
                { validator: UrlValidation },
                {
                  pattern: /^.{1,200}$/,
                  message: "The value must be between 1 and 200 characters long."
                },
                {
                  pattern: /^\S(.*\S)?$/,
                  message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="YouTube Link" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<>State (Training)</>}
              name="training_state"
              rules={[{ required: true, message: "Please select training state" }]}>
              <Select
                placeholder="Select Training State"
                showSearch
                size="large"
                options={statesList || []}
                loading={loadingStates}
                filterOption={(input, option) =>
                  (option?.label?.toLowerCase() ?? "").includes(input?.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end">
          <Button
            type="default"
            onClick={() =>
              navigate(`/${Paths.manageBatch}`, { state: { from: null }, replace: true })
            }>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" style={{ marginLeft: "10px" }}>
            {params?.id ? "Update" : "Add"}
          </Button>
        </Row>
      </Form>
    </>
  ) : (
    <></>
  );
}

export default AddEditBatch;
