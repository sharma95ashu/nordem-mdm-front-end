/* eslint-disable no-undef */
/* eslint-disable no-empty */
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Switch,
  Typography
  // theme
} from "antd";
import React, { useEffect, useState } from "react";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { actionsPermissionValidator } from "Helpers/ats.helper";

export default function EcomUserPermissionEdit() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [form] = Form.useForm();

  const [permissionList, setPermissionList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userPermission, setUserPermission] = useState([]);

  // const {
  //     token: { colorText }
  // } = theme.useToken();

  // Custom style object for internal use
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    }
  };

  // Fetch all permissions to populate the switch list
  useQuery("getPermissions", () => apiService.getAllPermission(), {
    enabled: true,
    onSuccess: (data) => {
      setPermissionList(data.data);
    },
    onError: (error) => {
      enqueueSnackbar(error.message, snackBarErrorConf);
    }
  });

  // Fetch single user data
  const { mutate: refetch } = useMutation(
    "getSingleEcomUserForPermission",
    () => apiService.getSingleEcomUserForPermission(params.id),
    {
      enabled: true,
      onSuccess: (data) => {
        if (data) {
          const { user_name, cust_name, user_phone_number, distno, customer_type } = data.data;
          form.setFieldsValue({
            user_name: user_name || cust_name,
            mobile: user_phone_number,
            dist_no: customer_type == "REG" ? "" : distno ? distno : "",
            customer_type: customer_type
          });
          permissionList.push({
            label: "Reset OTP Count",
            value: "reset_otp_count"
          });

          // Default true if field not in response
          permissionList.forEach((e) => {
            if (data?.data?.permission && data?.data?.permission.length > 0) {
              data.data.permission.forEach((item) => {
                if (item.access_type === e.value) {
                  form.setFieldsValue({ [item.access_type]: item.value });
                  form.setFieldsValue({ [item.reset_otp_count]: false });
                }
              });
            } else if (!Object.prototype.hasOwnProperty.call(data.data, e.value)) {
              form.setFieldsValue({ [e.value]: true });
            }
          });

          if (data.data.permission) {
            setUserPermission(data.data.permission);
          }

          setUserId(user_phone_number);
        }
      },
      onError: (error) => {
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // Handle form submit
  const onFinish = (value) => {
    try {
      let bodyToInsert = [];
      // if (value.reset_otp_count) {
      //   value.reset_otp_count = 0;
      // } else {
      //   value.reset_otp_count = null; // or skip it if not needed
      // }

      if (userPermission && userPermission.length > 0) {
        userPermission.forEach((item) => {
          if (Object.prototype.hasOwnProperty.call(value, item.access_type)) {
            bodyToInsert.push({
              ...item,
              ...(value.reset_otp_count && { reset_otp_count: value.reset_otp_count }),
              access_type: item.access_type,
              value: value[item.access_type],
              id: item.id,
              user_id: userId
            });
          }
        });
      }

      if (permissionList && permissionList.length > 0) {
        permissionList.forEach((item) => {
          if (Object.prototype.hasOwnProperty.call(value, item.value)) {
            // const existingPermission = bodyToInsert.find((perm) => perm.access_type === item.value);
            // if (!existingPermission) {
            //   bodyToInsert.push({
            //     access_type: item.value,
            //     value: value[item.value] || false,
            //     user_id: userId,
            //     reset_otp_count: false
            //   });
            // }
          }
        });
      }

      mutate({ load: bodyToInsert });
    } catch (error) {
      console.log(error);
    }
  };

  // API call to update user permission
  const { mutate, isLoading } = useMutation(
    (data) => apiService.updateEcomUserPermission(params.id, data.load, true),
    {
      onSuccess: (data) => {
        enqueueSnackbar(data.message, snackBarSuccessConf);
        navigate(`/${Paths.ecomUserPermissionList}`);
        queryClient.invalidateQueries("fetchbrandData");
      },
      onError: (error) => {
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // Setup breadcrumb and validate permission
  useEffect(() => {
    if (actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)) {
      setBreadCrumb({
        title: "Block/Unblock User",
        icon: "User Permission",
        titlePath: Paths.EcomUserPermissionEdit,
        subtitle: "Block/Unblock User Update",
        path: Paths.users
      });
    } else {
      navigate("/", { state: { from: null }, replace: true });
    }
  }, []);

  useEffect(() => {
    if (permissionList.length > 0) {
      refetch();
    }
  }, [permissionList]);

  // UI rendering conditionally based on edit permission
  return actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ? (
    <>
      <Title level={5}>Edit Block/Unblock Ecom User</Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col span={24}>
            <Row gutter={[24, 0]}>
              <Col span={8}>
                <Form.Item name="user_name" label="User Name">
                  <Input size="large" placeholder="" disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="mobile" label="Mobile No.">
                  <Input size="large" placeholder="" disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dist_no" label="A.B. No">
                  <Input size="large" placeholder="" disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="customer_type" label="User Type">
                  <Input size="large" placeholder="" disabled />
                </Form.Item>
              </Col>

              {permissionList.map((item, index) => (
                <Col xs={6} sm={6} md={6} lg={4} key={index}>
                  <Form.Item name={item.value} label={item.label} valuePropName="checked">
                    <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
                  </Form.Item>
                </Col>
              ))}
              {/* <Col xs={6} sm={6} md={6} lg={4}>
                <Form.Item name="reset_otp_count" label="Reset OTP Count">
                  <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col> */}
            </Row>
          </Col>
        </Row>
        <Flex gap="middle" align="start" vertical>
          <Flex justify="flex-end" align="center" className="width_full">
            <NavLink to={`/${Paths.ecomUserPermissionList}`}>
              <Button disabled={isLoading} style={StyleSheet.backBtnStyle}>
                Cancel
              </Button>
            </NavLink>
            <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
              Update
            </Button>
          </Flex>
        </Flex>
      </Form>
    </>
  ) : null;
}
