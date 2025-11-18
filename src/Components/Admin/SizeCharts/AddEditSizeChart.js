import Joditor from "Components/Shared/Joditor";
import { PermissionAction, RULES_MESSAGES, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator, checkIfEditorEmpty } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Row, Spin, Switch, Typography } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";

// Add/Edit Size Chart component
export default function AddEditSizeChart() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");

  /***
   * styles
   */
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    }
  };

  // hook for fetching single size-chart data
  const { mutate: fetchSingleSizeChartData, isLoading: loadingSingleSizeChartData } = useMutation(
    "fetchSingleSizeChartData",
    () => apiService.getSingleSizeChartDetail(params.id),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data.success && data.data) {
            const { description, status } = data.data;
            form.setFieldsValue(data.data);
            form.setFieldValue("status", status == "active");
            setDescription(description);
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
      mutate(data); // api call for add/edit size-chart
    }
  };

  // UseMutation hook for creating a new or updating existing size chart via API
  const { mutate, isLoading } = useMutation((data) => apiService.addSizeChart(data, params.id), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      try {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);

          // Navigate to the current window pathname after removing a specified portion
          navigate(`/${Paths.sizeChartList}`);
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
      title: "Size Chart",
      icon: "pincodeStore",
      titlePath: Paths.sizeChartList,
      subtitle: params?.id ? "Edit Size Chart" : "Add Size Chart",
      path: Paths.users
    });

    params?.id ? fetchSingleSizeChartData() : form.setFieldValue("status", true);
  }, []);

  // handle description change
  const handleDescription = (value) => {
    try {
      let updatedValue = checkIfEditorEmpty(value);
      setDescription(updatedValue);
      form.setFieldsValue({ description: updatedValue });
    } catch (error) {}
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={loadingSingleSizeChartData} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Size Chart</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="name"
              label="Title"
              rules={[
                { required: true, message: "Title is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                },
                {
                  pattern: /^.{1,50}$/,
                  message: RULES_MESSAGES.MIN_MAX_LENGTH_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Name" size="large" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Description is required" }]}>
              <Joditor
                placeholder="Enter Description Here"
                description={description}
                handleDescription={handleDescription}
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
          <NavLink to={"/" + Paths.sizeChartList}>
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
