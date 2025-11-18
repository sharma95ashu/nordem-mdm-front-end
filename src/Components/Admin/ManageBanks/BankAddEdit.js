import { InfoCircleOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  theme,
  Tooltip,
  Typography
} from "antd";

import {
  bankAccountLengthOptions,
  PermissionAction,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Paths } from "Router/Paths";

// Bank Add/Edit Component
const BankAddEdit = () => {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [originalData, setOriginalData] = React.useState({});

  const {
    token: { colorText }
  } = theme.useToken();

  // UseMutation hook for  fetching single bank data
  const { mutate: fetchBankData, isLoading: loadingBankData } = useMutation(
    (data) => apiService.getSingleBankData(params?.id),
    {
      // Configuration options for the mutation
      onSuccess: (response) => {
        if (response.data) {
          const bank = response.data;
          form.setFieldsValue({
            ...bank,
            status: bank.status == "A" // convert string → boolean
          });
          setOriginalData({
            ...bank,
            status: bank.status == "A"
          });
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
      }
    }
  );

  const onFinish = (values) => {
    // Convert boolean status to 'A' or 'I'
    const payload = {
      ...values,
      status: values.status ? "A" : "I"
    };

    if (!params?.id) return mutate(payload);

    payload.bank_code = Number(params.id);

    // Compare with original fetched data
    const changed = Object.keys(payload).reduce(
      (acc, key) => {
        if (payload[key] !== originalData[key]) acc[key] = payload[key];
        return acc;
      },
      { bank_code: Number(params.id) }
    );

    mutate(changed);
  };

  // UseMutation hook for add/edit bank via API
  const { mutate, isLoading } = useMutation(
    (data) => {
      const { bank_code, bank_name, status, short_name, acc_code_final } = data;

      const updatedData = {
        bank_code,
        bank_name,
        status,
        short_name,
        acc_code_final
      };

      // API call
      return apiService.addUpdateBank(params?.id, params?.id ? updatedData : data);
    },
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.success) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.bankList}`);
        }
      },
      onError: (error) => {
        console.error("Error:", error);
        // Handle error (e.g., show error notification)
      }
    }
  );

  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    uploadBtnStyle: {
      border: 0,
      background: "none"
    },
    cloudIconStyle: {
      fontSize: "1.5rem",
      color: colorText
    },
    uploadLoadingStyle: {
      marginTop: 8,
      color: colorText
    },
    categoryStyle: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    }
  };

  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Manage Banks",
      titlePath: Paths.bankList,
      subtitle: params?.id ? "Edit Bank" : "Add Bank",
      path: Paths.bankList
    });

    if (params?.id) {
      fetchBankData(); // api call for fetching single bank data
    } else {
      //initializing default values
      form.setFieldValue("status", true);
    }
  }, []);

  return (
    <>
      <Spin spinning={loadingBankData} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit Bank" : "Add Bank"}</Typography.Title>

      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[20, 10]}>
          <Flex gap={10} vertical>
            <Alert
              message="Banks without branches will not appear in KYC or PUC lists. Please add at least one branch to make it visible."
              type="warning"
              showIcon
            />
            <div></div>
          </Flex>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item
              name="bank_name"
              label="Bank Name"
              rules={[
                { required: true, message: `Bank Name is required` },
                { min: 2, message: "Bank Name must be at least 2 characters" },
                { max: 255, message: "Bank Name cannot exceed 255 characters" }
              ]}>
              <Input placeholder="Enter Bank Name" size="large" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="short_name"
              label={
                <span>
                  Short Name&nbsp;
                  <Tooltip title="This short name may be used for IFSC or internal bank reference codes.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </span>
              }
              rules={[
                { required: true, message: "Short Name is required" },
                { min: 2, message: "Short Name must be at least 2 characters" },
                { max: 20, message: "Short Name cannot exceed 20 characters" }
              ]}>
              <Input placeholder="Enter Short Name" size="large" />
            </Form.Item>
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item
              name="acc_code_final"
              label="Account Length"
              rules={[{ required: true, message: "Account Length is required" }]}>
              <Select
                mode="multiple"
                placeholder="Select Account Length"
                options={bankAccountLengthOptions}
                allowClear
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 6 }}>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
            <Flex align="start" justify={"flex-end"}>
              <NavLink to={"/" + Paths.bankList}>
                <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>
                  Cancel
                </Button>
              </NavLink>
              {actionsPermissionValidator(
                window.location.pathname,
                params?.id ? PermissionAction.EDIT : PermissionAction.ADD
              ) && (
                <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
                  {params?.id ? "Update" : "Add"}
                </Button>
              )}
            </Flex>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default BankAddEdit;
