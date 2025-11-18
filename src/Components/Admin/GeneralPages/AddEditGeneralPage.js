import RichEditor from "Components/Shared/richEditor";
import { PermissionAction, RULES_MESSAGES, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Row, Spin, Typography } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";

// Add/Edit Size Chart component
export default function AddEditGeneralPage() {
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
  const { mutate: fetchSingleGeneralPageData, isLoading: loadingSinglePageData } = useMutation(
    "fetchSingleGeneralPageData",
    () => apiService.getSingleGeneralDetail(params.id),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data.success && data.data) {
            const { description } = data.data;
            form.setFieldsValue(data.data);
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
      mutate(value); // api call for add/edit general-page
    }
  };

  // UseMutation hook for creating a new or updating existing general page via API
  const { mutate, isLoading } = useMutation((data) => apiService.addGeneralPage(data, params.id), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      try {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);

          // Navigate to the current window pathname after removing a specified portion
          navigate(`/${Paths.generalPagesList}`);
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
      title: "General Pages",
      icon: "pincodeStore",
      titlePath: Paths.generalPagesList,
      subtitle: params?.id ? "Edit General Page" : "Add General Page",
      path: Paths.users
    });

    params?.id && fetchSingleGeneralPageData();
  }, []);

  // handle desc if empty
  const checkIfEditorDescEmpty = (val) => {
    return val == "<p><br></p>";
  };

  // handle description change
  const handleDescription = (value) => {
    try {
      if (checkIfEditorDescEmpty(value)) {
        setDescription(null);
        form.setFields([{ name: "description", value: null, errors: ["Description is required"] }]);
      } else {
        setDescription(value);
        form.setFields([{ name: "description", value: value, errors: [] }]);
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={loadingSinglePageData} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} General Page</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="page_name"
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
              <RichEditor
                placeholder="Enter Description Here"
                setDescription={setDescription}
                handleDescription={handleDescription}
                description={description}
                image={"image"}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.generalPagesList}>
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
