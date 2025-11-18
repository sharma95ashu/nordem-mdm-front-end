import { PermissionAction, snackBarSuccessConf, RULES_MESSAGES } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Row, Spin, Switch, Typography } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";

// Add/Edit Download Language component
export default function AddEditDownloadLanguage() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
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

  // hook for fetching single download language data
  const { mutate: fetchSingleLanguageData, isLoading: loadingSingleLanguageData } = useMutation(
    "fetchSingleLanguageData",
    () => apiService.getSingleDownloadLanguage(params.id),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data.success && data.data) {
            const { status } = data.data;
            form.setFieldsValue(data.data);
            form.setFieldValue("status", status == "active" ? true : false);
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
    if (value) {
      let data = { ...value };
      data.status = value.status ? "active" : "inactive"; // by default status will always be active

      mutate(data); // api call for add/edit download language
    }
  };

  // UseMutation hook for creating a new download language or updating existing download language via API
  const { mutate, isLoading } = useMutation(
    (data) => apiService.addEditDownloadLanguage(data, params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        try {
          if (data) {
            // Display a success Snackbar notification with the API response message
            enqueueSnackbar(data.message, snackBarSuccessConf);

            // Navigate to the current window pathname after removing a specified portion
            navigate(`/${Paths.downloadLanguageList}`);
          }
        } catch (error) {}
      },
      onError: (error) => {
        //
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
      title: "Download Language",
      icon: "pincodeStore",
      titlePath: Paths.downloadLanguageList,
      subtitle: params?.id ? "Edit Download Language" : "Add Download Language",
      path: Paths.users
    });

    params?.id ? fetchSingleLanguageData() : form.setFieldValue("status", true);
  }, []);

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={loadingSingleLanguageData} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Download Language</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="language_name"
              label="Language Name"
              rules={[
                { required: true, message: "Language Name is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,150}$/,
                  message: "The value must be between 3 and 150 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Language Name" size="large" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="display_order"
              label="Display Order"
              rules={[
                { required: true, message: `Display Order is required` },
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Please enter valid number"
                },
                { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" }
              ]}>
              <Input placeholder="Enter Display Order" size="large" type="number" />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.downloadLanguageList}>
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
