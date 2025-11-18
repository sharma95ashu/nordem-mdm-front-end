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

// Add/Edit Content Type component
export default function AddEditContentType() {
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

  // hook for fetching single content type data
  const { mutate: fetchSingleContentTypeData, isLoading: loadingSingleContentTypeData } =
    useMutation("fetchSingleContentTypeData", () => apiService.getSingleContentType(params.id), {
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
    });

  /**
   * Function to submit form data
   * @param {*} value
   */
  const onFinish = (value) => {
    if (value) {
      let data = { ...value };
      data.status = value.status ? "active" : "inactive"; // by default status will always be active

      mutate(data); // api call for add/edit content type
    }
  };

  // UseMutation hook for creating a new content type or updating existing content type via API
  const { mutate, isLoading } = useMutation(
    (data) => apiService.addEditContentType(data, params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        try {
          if (data) {
            // Display a success Snackbar notification with the API response message
            enqueueSnackbar(data.message, snackBarSuccessConf);

            // Navigate to the current window pathname after removing a specified portion
            navigate(`/${Paths.contentTypeList}`);
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
      title: "Content Type",
      icon: "pincodeStore",
      titlePath: Paths.contentTypeList,
      subtitle: params?.id ? "Edit Content Type" : "Add Content Type",
      path: Paths.users
    });

    params?.id ? fetchSingleContentTypeData() : form.setFieldValue("status", true);
  }, []);

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={loadingSingleContentTypeData} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Content Type</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="content_type_name"
              label="Content Type Name"
              rules={[
                { required: true, message: "Content Type Name is required" },
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
              <Input placeholder="Enter Content Type Name" size="large" />
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
          <NavLink to={"/" + Paths.contentTypeList}>
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
