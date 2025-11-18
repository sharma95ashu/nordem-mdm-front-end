import {
  PermissionAction,
  snackBarSuccessConf,
  RULES_MESSAGES,
  snackBarErrorConf
} from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Row, Select, Spin, Typography } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { debounce } from "lodash";

// Add/Edit Pinocde Area Map component
export default function AddEditPincodeAreaMapping() {
  const params = useParams();

  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [pinCodeLoading, setPinCodeLoading] = useState(false);
  const [pincodeList, setPincodeList] = useState([]);
  const [areaAssociated, setAreaAssociated] = useState(false); // state for disabling area select field

  /***
   * styles
   */
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    }
  };

  // hook for fetching single pincode area data
  const { mutate: fetchSinglePincodeAreaData, isLoading: loadingSinglePincodeAreaData } =
    useMutation(
      "fetchSinglePincodeAreaData",
      () => apiService.getSinglePincodeAreaData(params.id),
      {
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          try {
            if (data.success && data.data) {
              const { pincode, status, is_associated } = data.data;
              form.setFieldsValue(data.data);
              form.setFieldValue("status", status == "active" ? true : false);
              let tempPincodeList = [{ label: pincode, value: pincode }];
              setPincodeList(tempPincodeList);
              setAreaAssociated(is_associated);
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
      let data = value;
      data.status = "active"; // by default status will always be active

      mutate(data); // Initiate the pincode are map by triggering the mutate function
    }
  };

  // UseMutation hook for creating a new pincode area mapping via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new user
    (data) => apiService.addEditPincodeAreaMapping(data, params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        try {
          if (data) {
            // Display a success Snackbar notification with the API response message
            enqueueSnackbar(data.message, snackBarSuccessConf);

            // Navigate to the current window pathname after removing a specified portion
            navigate(`/${Paths.pincodeAreaMappingList}`);
          }
        } catch (error) {}
      },
      onError: (error) => {
        //
      }
    }
  );

  const { mutate: fetchPincode, isLoading: loadingPincodes } = useMutation(
    "fetchPincode",
    (payload) => apiService.getStorePincodeList(payload?.search),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data && data?.data?.length > 0) {
            const tempPincodeList = data?.data?.map((item) => ({
              label: item?.pincode,
              value: item?.pincode
            }));
            updatePincodeList(tempPincodeList);
          } else {
            enqueueSnackbar("Pincode not found", snackBarErrorConf);
            setPinCodeLoading(false);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  const updatePincodeList = (tempPincodeList) => {
    try {
      // Create a set of unique labels from pincode array and wholeData array
      const uniqueLabels = new Set([
        ...pincodeList.map((item) => item.value),
        ...tempPincodeList.map((item) => item.value)
      ]);

      // Create a final array by filtering the wholeData array based on uniqueLabels set
      const mergedArr = [...tempPincodeList, ...pincodeList];
      const finalArray = [...mergedArr.filter((item) => uniqueLabels.has(item.value))];

      setPincodeList([...finalArray]);
      setPinCodeLoading(false);
    } catch (error) {}
  };

  // for pincode - debounce
  const debounceFetcherPinCode = useMemo(() => {
    const loadOptions = (value) => {
      const obj = { search: value };
      fetchPincode(obj);
    };
    return debounce(loadOptions, 700);
  }, [fetchPincode]);

  const searchPinCode = (val) => {
    try {
      if (val && val.length >= 3) {
        const searchExist = pincodeList?.some((item) => String(item?.label).includes(val)); // Check if any item matches the condition
        if (!searchExist) {
          setPinCodeLoading(true);
          debounceFetcherPinCode(val);
        }
      }
    } catch (error) {}
  };

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
      title: "Pincode Area Map",
      icon: "pincodeStore",
      titlePath: Paths.pincodeMappingList,
      subtitle: params?.id ? "Edit Pincode Area Map" : "Add Pincode Area Map",
      path: Paths.users
    });

    params?.id ? fetchSinglePincodeAreaData() : form.setFieldValue("status", true);
  }, []);

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={loadingSinglePincodeAreaData} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Pincode Area Map</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="pincode"
              label="Pincode"
              whitespace={false}
              rules={[
                { required: true, message: "Pincode is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                { pattern: /^[1-9][0-9]{5}$/, message: "Please enter valid pincode" }
              ]}>
              <Select
                showSearch
                block
                size="large"
                placeholder="Search Pincode"
                onSearch={searchPinCode}
                loading={pinCodeLoading}
                notFoundContent={loadingPincodes ? <Spin size="small" /> : null}
                options={pincodeList}
                allowClear
                maxTagTextLength={6}
                onClear={() => setPincodeList([])}
                disabled={params?.id && areaAssociated}
                filterOption={(input, option) => {
                  const label = String(option?.label) ?? "";
                  return label.includes(String(input));
                }}
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item
              name="area_name"
              label="Area Name"
              whitespace={false}
              rules={[
                { required: true, message: "Area name is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,150}$/,
                  message: "The value must be between 3 and 150 characters long."
                }
              ]}>
              <Input placeholder="Area Name" size="large" />
            </Form.Item>
          </Col>

          {/* <Col className="gutter-row" span={12}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col> */}
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.pincodeAreaMappingList}>
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
