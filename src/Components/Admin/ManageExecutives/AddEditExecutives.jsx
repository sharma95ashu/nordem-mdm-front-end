import { Form, Input, Button, Typography, Row, Col, Flex, Switch } from "antd";
import React from "react";
import { useUserContext } from "Hooks/UserContext";
import { useEffect } from "react";
import { Paths } from "Router/Paths";
import { useMutation, useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { PermissionAction, snackBarSuccessConf, RULES_MESSAGES } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { actionsPermissionValidator, validationNumber } from "Helpers/ats.helper";

export default function AddEditExecutives() {
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const params = useParams();
  const navigate = useNavigate();

  // handle form submit
  const onFinish = (value) => {
    if (params?.id) {
      delete value.user_phone_number;
    }
    mutate({ ...value, user_status: value?.user_status ? "active" : "inactive" }); // api call to create new executives
  };

  // UseMutation hook for creating new execuitve
  useQuery(
    "getSingleExecutiveDetails", // Unique mutation key for tracking in the query client
    () => apiService.getSingleExecutiveData(params?.id),
    {
      enabled: !!params?.id,
      onSuccess: (resp) => {
        if (resp?.data && resp?.success) {
          form.setFieldsValue({
            user_name: resp?.data?.user_name,
            user_email: resp?.data?.user_email,
            user_phone_number: resp?.data?.user_phone_number,
            user_status: resp?.data?.user_status === "active" ? true : false
          });
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
      }
    }
  );

  // UseMutation hook for creating new executive
  const { mutate, isLoading } = useMutation(
    "createNewExecutive", // Unique mutation key for tracking in the query client
    params?.id
      ? (data) => apiService.updateSingleExecutiveData(data, params?.id)
      : (data) => apiService.createExecutive(data),
    {
      onSuccess: (response) => {
        // Display a success Snackbar notification with the API response message
        if (response) {
          enqueueSnackbar(response.message, snackBarSuccessConf);
          navigate(`/${Paths.executivesList}`);
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
      }
    }
  );

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Manage Executives",
      icon: "category",
      titlePath: Paths.executivesList,
      subtitle: params?.id ? "Edit Executive" : "Add Executive",
      path: Paths.executiveAdd
    });

    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? null
      : navigate("/", { state: { from: null }, replace: true });
    !params?.id && form.setFieldValue("user_status", true);
  }, []);

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Typography.Title level={5}>
        {params?.id ? "Edit Execuitve" : "Add Execuitve"}
      </Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={30}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="user_name"
              label="Full Name"
              rules={[
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                { pattern: /^[a-zA-Z ]+$/, message: "Please enter a valid name" },
                {
                  pattern: /^.{1,35}$/,
                  message: "The value must be between 1 and 35 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                },
                {
                  required: true,
                  message: "Full Name is required"
                }
              ]}>
              <Input size="large" placeholder="Enter Full Name" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="user_email"
              label="Email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email address!" }
              ]}>
              <Input size="large" placeholder="Enter Email" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              type="number"
              name="user_phone_number"
              label="Mobile Number"
              rules={[
                { required: true, message: "Mobile number is required" },
                { pattern: /^[6-9]{1}[0-9]{9}$/, message: "Please enter a valid phone number" }
              ]}>
              <Input
                maxLength={10}
                size="large"
                placeholder="Mobile Number"
                disabled={params?.id}
                onInput={validationNumber}
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={6}>
            <Form.Item name="user_status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={24}>
            <Flex style={{ width: "100%" }} justify={"flex-end"} align={"flex-end"}>
              <NavLink to={"/" + Paths.executivesList}>
                <Button disabled={isLoading} style={{ marginRight: "10px" }}>
                  Cancel
                </Button>
              </NavLink>
              <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
                {params?.id ? "Update" : "Add"}
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>
    </>
  ) : (
    <></>
  );
}
