import { Button, Col, Flex, Form, Input, Row, Switch, Typography } from "antd";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarErrorConf, snackBarSuccessConf, RULES_MESSAGES } from "Helpers/ats.constants";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { actionsPermissionValidator } from "Helpers/ats.helper";

export default function AttributesEdit() {
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const [form] = Form.useForm();
  const { apiService } = useServices();
  const params = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();


  /**
   * Function to submit form data
   * @param {*} value
   */

  const onFinish = (value) => {

    let data = value;
    data.status = data.status ? "active" : "inactive";
    let obj = { load: data };

    // Initiate the user creation process by triggering the mutate function
    mutate(obj);
  };

  // UseMutation hook for creating a new user via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new user
    (data) => apiService.updateAttributes(data.load, params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        navigate(`/${Paths.attributesList}`);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchAttributesData");
      },
      onError: (error) => {

        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // UseQuery hook for fetching data of a single Attributes from the API
  const { refetch } = useQuery(
    "getSingleAttributes",

    // Function to fetch data of a single brand using apiService.getRequest
    () => apiService.getRequest(`/attributes/${params.id}`),
    {
      // Configuration options
      enabled: false, //Disable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data

        form.setFieldsValue(data?.data);
        form.setFieldValue("status", data?.data?.status === "active" ? true : false);
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
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
    form.setFieldValue("status", false);
    form.setFieldValue("is_single", false);
    setBreadCrumb({
      title: "Attributes",
      icon: "attributes",
      titlePath: Paths.attributesList,
      subtitle: "Edit Attribute",
      path: Paths.users
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ? (
    <>

      <Title level={5}>Edit Attribute</Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="attr_name"
                  label="Attribute Name"
                  type="text"
                  rules={[{ required: true, whitespace: true, message: "Attribute name is required" },
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
                  <Input placeholder="Enter Attribute Name" size="large" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="display_order"
                  label="Display Order"
                  rules={[{ required: true, message: "Display order is required" }, { pattern: /^.{0,5}$/, message: 'Value should not exceed 5 characters', },
                  {
                    pattern: /^[1-9]\d*$/,
                    message: 'Please enter valid number',
                  }]}>
                  <Input placeholder="Enter Display Order" size="large" type="number" min={0} />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="is_single"
                  label="Is Single">
                  <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="status"
                  label="Status">
                  <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Flex gap="middle" align="start" vertical>
          <Flex justify={"flex-end"} align={"center"} className="width_full">
            <NavLink to={"/" + Paths.attributesList}>
              <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>Cancel</Button>
            </NavLink>
            {
              actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) &&
              <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
                Update
              </Button>
            }
          </Flex>
        </Flex>
      </Form>
    </>) : (<></>)

}

/***
 * styles
 */
const StyleSheet = {
  backBtnStyle: {
    marginRight: "10px"
  }
};
