import RichEditor from "Components/Shared/richEditor";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Row, Select, Spin, Switch, Typography } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";

// Add/Edit Marketing Plan component
export default function AddEditMarketingPlan() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const [languagesList, setLanguagesList] = useState([]);
  /***
   * styles
   */
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    }
  };

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
              value: item?.mp_language_code
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

  // hook for fetching single marketing-plan data
  const { mutate: fetchSingleMarketingPlanData, isLoading: loadingSingleMarketingPlanData } =
    useMutation(
      "fetchSingleMarketingPlanData",
      () => apiService.getSingleMarketingPlan(params.id),
      {
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          try {
            if (data.success && data.data) {
              const { mp_description, status } = data.data;
              form.setFieldsValue(data.data);
              form.setFieldValue("status", status == "active");
              setDescription(mp_description);
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

      mutate(data); // api call for add/edit marketing plan
    }
  };

  // UseMutation hook for creating a new marketing plan or updating existing marketing plan via API
  const { mutate, isLoading } = useMutation(
    (data) => apiService.addEditMarketingPlan(data, params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        try {
          if (data) {
            // Display a success Snackbar notification with the API response message
            enqueueSnackbar(data.message, snackBarSuccessConf);

            // Navigate to the current window pathname after removing a specified portion
            navigate(`/${Paths.marketingPlanList}`);
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
      title: "Marketing Plan",
      icon: "pincodeStore",
      titlePath: Paths.marketingPlanList,
      subtitle: params?.id ? "Edit Marketing Plan" : "Add Marketing Plan",
      path: Paths.users
    });

    params?.id ? fetchSingleMarketingPlanData() : form.setFieldValue("status", true);
  }, []);

  const handleDescription = (value) => {
    try {
      setDescription(value);
      form.setFieldsValue({ mp_description: value });
    } catch (error) {}
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={loadingSingleMarketingPlanData || loadingLanguages} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Marketing Plan</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="mp_language_code"
              label="Marketing Plan Language"
              rules={[{ required: true, message: "Marketing Plan Language Name is required" }]}>
              <Select
                size="large"
                placeholder="Select Marketing Plan Language"
                options={languagesList}
                filterOption={(input, option) =>
                  (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={24}>
            <Form.Item
              name="mp_description"
              label="Description"
              rules={[{ required: true, message: "Description is required" }]}>
              <RichEditor
                placeholder="Enter Description Here"
                description={description}
                handleDescription={handleDescription}
                image={"image"}
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
          <NavLink to={"/" + Paths.marketingPlanList}>
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
