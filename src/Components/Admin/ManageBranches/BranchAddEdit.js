import { Button, Col, Flex, Form, Input, Row, Select, Spin, Switch, theme, Typography } from "antd";

import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQueries } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Paths } from "Router/Paths";

// Branch Add/Edit Component
const BranchAddEdit = () => {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedState, setSelectedState] = useState(null);
  const [isBranchManuallyEdited, setIsBranchManuallyEdited] = useState(false);

  const {
    token: { colorText }
  } = theme.useToken();

  // UseMutation hook for fetching single branch data
  const { mutate: fetchBranchData, isLoading: loadingBranch } = useMutation(
    () => apiService.getSingleBranchData(params?.id),
    {
      // Configuration options for the mutation
      onSuccess: (response) => {
        if (response.data?.length) {
          const branch = response.data[0];
          form.setFieldsValue({
            ...branch,
            status: branch.status == "A" //  convert string to boolean
          });
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const onFinish = (values) => {
    // Convert boolean status to 'A' or 'I'
    const payload = {
      ...values,
      status: values.status ? "A" : "I"
    };
    mutate(payload);
  };

  // UseMutation hook for add/edit branch via API
  const { mutate, isLoading } = useMutation(
    (data) => {
      // API call
      return apiService.addUpdateBranch(params?.id, data);
    },
    {
      // Configuration options for the mutation
      onSuccess: (res) => {
        if (res.success) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
          navigate(`/${Paths.branchList}`);
        }
      },
      onError: (error) => {
        console.error("Error:", error);
        // Handle error (e.g., show error notification)
      }
    }
  );

  // Fetch banks, states, and districts
  const [
    { data: bankList, isLoading: bankLoading },
    { data: getStates, isLoading: statesLoading },
    { data: getDistrict, isLoading: districtsLoading }
  ] = useQueries([
    {
      queryKey: ["getAllBanks"],
      queryFn: () => apiService.getAllBanksList(), // your API call
      enabled: true, // fetch on load
      select: (data) =>
        data.success && data?.data
          ? data?.data?.map((e) => ({
              value: e?.bank_code,
              label: e?.bank_name,
              short_name: e?.short_name
            }))
          : [],
      onError: (error) => {
        console.error("Error fetching banks:", error);
      }
    },
    {
      queryKey: "getStates",
      queryFn: () => apiService.getStatesForSearchABByName(),
      enabled: true, // fetching states on load
      select: (data) =>
        data.success && data?.data
          ? data?.data?.map((e) => ({ value: e?.state_code, label: e?.state_name }))
          : [],
      onError: (error) => {
        // Handle error here
        console.error("Error fetching states:", error);
      }
    },
    {
      queryKey: ["getDistrict", selectedState],
      queryFn: () => apiService.getDistrictForSearchABByName(selectedState),
      enabled: !!selectedState, // Only fetch when a state is selected
      select: (data) =>
        data.success && data?.data
          ? [...new Set(data.data.map((e) => e.dist_name))] 
              .map((name) => ({ value: name, label: name }))
          : [],
      onError: (error) => {
        console.error("Error fetching districts:", error);
      },
      onSettled: () => {
        // clear the DISTRICT form select option
        form.setFieldsValue({ city: null });
      }
    }
  ]);

  // When state changes, set selected state & reset city
  const handleStateChange = (value) => {
    setSelectedState(value);
    form.setFieldsValue({ city: null });
  };

  // When city changes, auto-fill branch name unless manually edited
  const handleCityChange = (value) => {
    const current = form.getFieldValue("branch_name") || "";
    if (!value) {
      if (!isBranchManuallyEdited) form.setFieldsValue({ branch_name: "" });
      return;
    }
    if (!isBranchManuallyEdited || !current.trim()) {
      form.setFieldsValue({ branch_name: value });
    }
  };

  // Mark branch name as manually edited
  const handleBranchChange = () => {
    if (!isBranchManuallyEdited) setIsBranchManuallyEdited(true);
  };

  // Auto-prefix IFSC code with selected bank short name
  const handleBankChange = (value) => {
    const selectedBank = bankList?.find((b) => b.value == value);
    if (selectedBank?.short_name) {
      form.setFieldsValue({ branch_code: `${selectedBank.short_name.toUpperCase()}` });
    } else {
      form.setFieldsValue({ branch_code: "" });
    }
  };

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
      title: "Manage Branches",
      titlePath: Paths.branchList,
      subtitle: params?.id ? "Edit Branch" : "Add Branch",
      path: Paths.branchList
    });

    params?.id ? fetchBranchData() : form.setFieldValue("status", true);
  }, []);

  return (
    <>
      <Spin spinning={loadingBranch || statesLoading || districtsLoading} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit Branch" : "Add Branch"}</Typography.Title>

      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[20, 10]}>
          {/* Bank Name */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              name="bank_code"
              label="Bank"
              rules={[{ required: true, message: "Bank is required" }]}>
              <Select
                placeholder="Select Bank"
                showSearch
                size="large"
                options={bankList}
                loading={bankLoading}
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                disabled={!!params?.id}
                onChange={handleBankChange}
              />
            </Form.Item>
          </Col>
          {/* State */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              name="state_code"
              label="State"
              rules={[{ required: true, message: "State is required" }]}>
              <Select
                placeholder="Select State"
                options={getStates}
                showSearch
                size="large"
                onChange={handleStateChange}
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          {/* IFSC Code */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              name="branch_code"
              label="IFSC Code"
              rules={[
                { required: true, message: "IFSC Code is required" },
                { pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: "Enter valid IFSC code" }
              ]}>
              <Input placeholder="Enter IFSC Code" size="large" disabled={!!params?.id} />
            </Form.Item>
          </Col>

          {/* City (Optional) */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item name="city" label="City">
              <Select
                placeholder="Select City"
                options={getDistrict}
                disabled={!getDistrict?.length}
                allowClear
                showSearch
                size="large"
                onChange={handleCityChange}
              />
            </Form.Item>
          </Col>
          {/* Branch Name (auto or manual) */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              name="branch_name"
              label="Branch Name"
              rules={[{ required: true, message: "Branch Name is required" }]}>
              <Input placeholder="Enter Branch Name" size="large" onChange={handleBranchChange} />
            </Form.Item>
          </Col>

          {/* Branch Address */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              name="branch_address"
              label="Branch Address"
              rules={[
                { required: true, message: "Branch Address is required" },
                { min: 5, message: "Branch Address must be at least 5 characters" },
                { max: 200, message: "Branch Address cannot exceed 200 characters" }
              ]}>
              <Input.TextArea
                placeholder="Enter Branch Address"
                rows={2}
                size="large"
                maxLength={200}
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
              <NavLink to={"/" + Paths.branchList}>
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

export default BranchAddEdit;
