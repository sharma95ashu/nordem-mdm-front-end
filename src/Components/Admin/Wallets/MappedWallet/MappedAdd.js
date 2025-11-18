import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Typography
} from "antd";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import dayjs from "dayjs";

export default function MappedAdd() {
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const [form] = Form.useForm();
  const { apiService } = useServices();
  const [walletId, SetWalletId] = useState([]);
  const [selectedWalletCode, setSelectedWalletCode] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  /**
   * Function to submit form data
   * @param {*} value
   */

  const onFinish = (value) => {
    let data = value;

    data.user_id = Number(data.user_id);
    data.wallet_code = selectedWalletCode;
    data.wallet_map_status = "active";

    let obj = { load: data };
    // Initiate the mapped Walled creation process by triggering the mutate function
    mutate(obj);
  };

  // UseMutation hook for creating a new mapped Walled via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new mapped Wallet
    (data) => apiService.createMappedData(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        navigate(`/${Paths.mappedList}`);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchWalletMapData");
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // UseQuery hook for fetching data of a all Wallet Details from the API
  useQuery(
    "getAllWalletDetails",

    // Function to fetch data of a all wallet Details using apiService.getAllWalletDetails
    () => apiService.getAllWalletDetails(),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        data?.data?.data?.map((item) => {
          if (item?.wallet_code !== null) {
            SetWalletId((prev) => [
              ...prev,
              {
                label: `${item?.wallet_name} (${item.wallet_code})`,
                value: item?.wallet_id,
                wallet_code: item.wallet_code
              }
            ])
          }
        });
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    form.setFieldValue("wallet_map_status", true);

    setBreadCrumb({
      title: "AB Wallets",
      icon: "wallet",
      titlePath: Paths.mappedList,
      subtitle: "Add New",
      path: Paths.users
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Title level={5}>Add New</Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="user_id"
                  label="AB ID"
                  type="number"
                  rules={[
                    { required: true, message: "AB ID is required" },
                    {
                      pattern: /^.{0,10}$/,
                      message: "Value should not exceed 10 characters"
                    },
                    {
                      pattern: /^-?\d*$/,
                      message: "Float values are not allowed."
                    }
                  ]}>
                  <Input placeholder="Enter AB ID" size="large" type="number" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="wallet_id"
                  label="Wallet Name"
                  rules={[{ required: true, message: "Wallet Name is required" }]}>
                  <Select
                    size="large"
                    showSearch
                    allowClear
                    placeholder="Select Wallet Name"
                    options={walletId}
                    onSelect={(_, option) => {
                      setSelectedWalletCode(option.wallet_code);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="amount"
                  label="Balance Amount"
                  type="text"
                  rules={[
                    { required: true, message: "Balance Amount is required" },
                    { pattern: /^(?:0|[1-9]\d{0,9}(?:\.\d+)?|1000000000(?:\.0+)?)$/, message: "Please enter a number up to 1,000,000,000" }
                  ]}>
                  <Input type="number" placeholder="Enter Balance Amount" size="large" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="expiry_date"
                  label="Expiry Date of Balance"
                  rules={[{ required: true, message: "Expiry Date of Balance is required" }]}>
                  <DatePicker
                    block
                    size="large"
                    placeholder="Select Expiry Date of Balance"
                    format={"DD/MM/YYYY"}
                    style={{ width: "100%" }}
                    disabledDate={(current) => {
                      // Disable today's date and dates before today
                      return current && dayjs(current).isBefore(dayjs().startOf("day"), "day");
                    }}
                  />
                </Form.Item>
              </Col>

              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="supported_types"
                  label="Show on"
                  rules={[{ required: true, message: "Show on is required" }]}
                >
                  <Checkbox.Group>
                    <Checkbox value="web">Web (E-com)</Checkbox>
                    <Checkbox value="app">App (E-com)</Checkbox>
                    <Checkbox value="puc">PUC</Checkbox>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Flex gap="middle" align="start" vertical>
          <Flex justify={"flex-end"} align={"center"} className="width_full">
            <NavLink to={"/" + Paths.mappedList}>
              <Button disabled={isLoading} style={StyleSheet.backBtnStyle}>
                Cancel
              </Button>
            </NavLink>
            {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
              <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
                Add
              </Button>
            )}
          </Flex>
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}

/***
 * styles
 */
const StyleSheet = {
  backBtnStyle: {
    marginRight: "10px"
  }
};
