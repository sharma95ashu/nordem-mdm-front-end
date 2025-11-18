import { Button, Col, Flex, Form, Input, Row, Select, Skeleton, Switch, Typography } from "antd";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  PermissionAction,
  snackBarErrorConf,
  snackBarSuccessConf,
  RULES_MESSAGES
} from "Helpers/ats.constants";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { actionsPermissionValidator } from "Helpers/ats.helper";

export default function VariantsAdd() {
  const params = useParams();
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [parentAttributes, setParentAttributes] = useState([]);
  const [allLoading, setAllLoading] = useState(false);

  /**
   * Function to submit form data
   * @param {*} value
   */

  // UseQuery hook for fetching data of a single variants from the API
  useQuery(
    "getSinglevariants",

    // Function to fetch data of a single variants using apiService.getRequest
    () => apiService.getRequest(`/attributeValues/${params.id}`),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data

        form.setFieldsValue(data?.data || {});
        form.setFieldValue("status", data?.data?.status == "active" ? true : false);
        setAllLoading(true);
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const onFinish = (value) => {
    let data = value;
    data.status = data.status ? "active" : "inactive";
    data.attr_value = data?.attr_value.toLowerCase();
    let obj = { load: data };

    // Initiate the variants creation process by triggering the mutate function
    mutate(obj);
  };

  // UseMutation hook for creating a new variants via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new variants
    (data) => apiService.updateVariant(data.load, params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        navigate(`/${Paths.variantsList}`);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchVariantData");
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const filterData = {
    status: "active"
  };

  // Convert filterData to JSON string
  const convertData = JSON.stringify(filterData);

  // If sort is provided, set the sorting state

  // Construct parameters for the API request
  const paramsList = {
    filterTerm: convertData
  };

  // Construct the complete API URL with parameters
  const apiUrl = `/attributes/all?${new URLSearchParams(paramsList).toString()}`;

  // UseQuery hook for fetching data of a All Attributes from the API
  useQuery(
    "getAllAttributes",

    // Function to fetch data of a single variants using apiService.getRequest
    () => apiService.getRequest(apiUrl),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data
        setParentAttributes([]);
        data?.data?.data.map((item) =>
          setParentAttributes((prev) => [...prev, { value: item?.attr_id, label: item?.attr_name }])
        );
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );
  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });
    form.setFieldValue("status", false);
    setBreadCrumb({
      title: "Attribute Values",
      icon: "variants",
      titlePath: Paths.variantsList,
      subtitle: "Edit Attribute Value",
      path: Paths.users
    });
  }, []);

  return allLoading &&
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ? (
    <>
      <Title level={5}>Edit Attribute Values</Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="attr_id"
                  label="Attribute Name"
                  type="text"
                  rules={[{ required: true, message: "Variants name is required" }]}>
                  <Select
                    disabled
                    showSearch
                    size="large"
                    placeholder="Select Attribute Name"
                    options={parentAttributes}
                    filterOption={(input, option) => (option?.label ?? "").includes(input)}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="attr_value"
                  label="Attribute Value"
                  type="text"
                  rules={[
                    { required: true, whitespace: true, message: "Attribute value is required" },
                    {
                      pattern: /^.{1,50}$/,
                      message: RULES_MESSAGES.MIN_MAX_LENGTH_MESSAGE
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
                  <Input placeholder="Enter Attribute Value" size="large" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="display_order"
                  label="Display Order"
                  rules={[
                    { required: true, message: "Display order is required" },
                    { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
                    {
                      pattern: /^[1-9]\d*$/,
                      message: "Please enter valid number"
                    }
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
          </Col>
        </Row>
        <Flex gap="middle" align="start" vertical>
          <Flex justify={"flex-end"} align={"center"} className="width_full">
            <NavLink to={"/" + Paths.variantsList}>
              <Button disabled={isLoading} style={{ marginRight: "10px" }}>
                Cancel
              </Button>
            </NavLink>
            {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
              <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
                Update
              </Button>
            )}
          </Flex>
        </Flex>
      </Form>
    </>
  ) : (
    <Skeleton active />
  );
}
