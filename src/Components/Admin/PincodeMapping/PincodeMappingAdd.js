import { LoadingOutlined } from "@ant-design/icons";
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
import {
  Button,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  Typography
} from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { debounce } from "lodash";

export default function PincodeMappingAdd() {
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const pincodeRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [pinCodeLoading, setPinCodeLoading] = useState(false);
  const [pincodeList, setPincodeList] = useState([]);
  const [firstPincodeList, setFirstPincodeList] = useState([]);

  const [pincodeAreaList, setPincodeAreaList] = useState([]);
  const [areaFieldDisabled, setAreaFieldDisabled] = useState(true);

  /***
   * styles
   */
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    loadingStyle: {
      position: "absolute",
      top: "38px",
      left: "0",
      right: "0"
    }
  };

  /**
   * Function to submit form data
   * @param {*} value
   */
  const onFinish = (value) => {
    try {
      if (value) {
        let { status, pincode_areas } = value;
        let tempObj = { ...value };
        tempObj["status"] = status ? "active" : "inactive";
        tempObj["pincode_cover_all_area"] = areaFieldDisabled;
        tempObj["pincode_areas"] = areaFieldDisabled ? null : pincode_areas;

        // api call for add pincode store map
        mutate(tempObj);
      }
    } catch (error) {}
  };

  // UseMutation hook for creating a new store pincode mapping via API
  const { mutate, isLoading } = useMutation((data) => apiService.createPincodeMapping(data), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      if (data) {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        navigate(`/${Paths.pincodeMappingList}`);

        // Invalidate the "fetchPincodeMappingData" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchPincodeMappingData");
      }
    },
    onError: (error) => {
      // Handle errors by displaying an error Snackbar notification
      // enqueueSnackbar(error.message, snackBarErrorConf);
    }
  });

  // UseQuery hook for fetching data of store code from the API
  const fetchData = async (value) => {
    try {
      form.setFieldValue("store_name", "");
      const responseData = await apiService.getStoreCode(value);
      if (responseData.success) {
        setLoading(false);
        // Check if the response is successful and set the form value accordingly
        let storeName = responseData?.data?.store_name;
        form.setFieldValue("store_name", storeName);
      }
      // Set the validity state to false, regardless of success or failure
      form.setFields([{ name: "store_code", errors: [] }]);
      form.setFields([{ name: "store_name", errors: [] }]);
    } catch (error) {
      setLoading(false);
      // showSnackbar('Failed to fetch store data. Please try again.', 'error');
      form.setFields([{ name: "store_code", errors: ["Invalid store code"] }]);
      form.setFields([{ name: "store_name", errors: [] }]);
    }
  };

  const checkStoreCode = useCallback(
    debounce((e) => {
      try {
        let text = e?.target?.value;
        if (text && text.length >= 3) {
          setLoading(true);
          fetchData(text);
        }
      } catch (error) {}
    }, 1000),
    []
  ); // 500ms debounce time

  // hook for fetching searched pincode
  const { mutate: fetchPincode, isLoading: loadingPincodes } = useMutation(
    "fetchPincode",
    (payload) => apiService.getStorePincodeList(payload.search),
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
      if (pincodeRef.current == 0) {
        setFirstPincodeList(tempPincodeList);
      }
      // Create a set of unique labels from pincode array and wholeData array
      const uniqueLabels = new Set([
        ...firstPincodeList.map((item) => item.label),
        ...tempPincodeList.map((item) => item.label)
      ]);

      // Create a final array by filtering the wholeData array based on uniqueLabels set
      const mergedArr = [...tempPincodeList, ...pincodeList];
      const finalArray = [...mergedArr.filter((item) => uniqueLabels.has(item.label))];
      setPincodeList([...finalArray]);
      setPinCodeLoading(false);
    } catch (error) {}
  };

  // for pincode - debounce
  const debounceFetcherPinCode = useMemo(() => {
    const loadOptions = (value) => {
      pincodeRef.current += 1;
      const fetchId = pincodeRef.current;
      const obj = { fetchId: fetchId, search: value };
      fetchPincode(obj);
    };
    return debounce(loadOptions, 1000);
  }, [fetchPincode]);

  const searchPinCode = (val) => {
    try {
      if (val && val.length >= 3) {
        form.setFields([{ name: "pincode_areas", value: null, errors: [] }]);
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
    actionsPermissionValidator(window.location.pathname, PermissionAction.ADD)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Pincode Store Map",
      icon: "pincodeStore",
      titlePath: Paths.pincodeMappingList,
      subtitle: "Add Pincode Store Map",
      path: Paths.users
    });

    form.setFieldValue("status", true);
    form.setFieldValue("pincode_cover_all_area", true);
  }, []);

  const { mutate: fetchPincodeAreas, isLoading: loadingPincodeAreas } = useMutation(
    "fetchPincodeArea",
    (payload) => apiService.getStorePincodeAreaList(payload),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data) {
            const tempAreaList = data?.data?.data?.map((item) => ({
              label: item?.area_name,
              value: item?.pincode_area_map_id
            }));
            setPincodeAreaList(tempAreaList);
          } else {
            enqueueSnackbar("Area not found", snackBarErrorConf);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // handle pincode select
  const handlePincodeSelect = (val) => {
    try {
      setAreaFieldDisabled(false);
      fetchPincodeAreas(val);
    } catch (error) {}
  };

  // handle pincode checkBox change
  const handlePincodeCheckBox = (val) => {
    try {
      form.setFieldValue("pincode_cover_all_area", val);
      form.setFields([{ name: "pincode_areas", errors: [], value: null }]);
      setAreaFieldDisabled(val);
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Typography.Title level={5}>Add Pincode Store Map</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="store_code"
              label="Store Code"
              whitespace={false}
              rules={[
                { required: true, whitespace: true, message: "Store code is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                { pattern: /^(?!0$)[1-9][0-9]{0,7}$/, message: "Please enter valid store code" }
                // { validator: customValidator }
              ]}>
              <Input
                onChange={(e) => {
                  form.setFields([{ name: "store_name", errors: [], value: null }]);
                  checkStoreCode(e);
                }}
                type="number"
                placeholder="Enter Store Code"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="store_name"
              label="Store Name"
              whitespace={false}
              extra="The store name will be fetched based on the store code."
              rules={[
                { required: true, whitespace: true, message: "Store name is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE }
              ]}>
              <Input disabled={true} placeholder="Store Name" size="large" />
            </Form.Item>

            {loading && (
              <Spin style={StyleSheet.loadingStyle} indicator={<LoadingOutlined spin />} />
            )}
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item
              name="pincode"
              label="Pincode"
              className="pincode-select"
              rules={[
                { required: true, message: "Pincode is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                { pattern: /^[1-9][0-9]{5}$/, message: "Please enter valid pincode" }
              ]}>
              <Select
                showSearch
                block
                size="large"
                placeholder="Search & Select Pincode"
                onSearch={searchPinCode}
                onSelect={handlePincodeSelect}
                loading={pinCodeLoading}
                notFoundContent={loadingPincodes ? <Spin size="small" /> : null}
                options={pincodeList}
                allowClear
                maxTagTextLength={6}
                onClear={() => setPincodeList([])}
                filterOption={(input, option) => {
                  const label = String(option?.label) ?? "";
                  return label.includes(String(input));
                }}
              />
            </Form.Item>

            <Form.Item name="pincode_cover_all_area" label="">
              <Checkbox
                checked={areaFieldDisabled}
                name="pincode_cover_all_area"
                onChange={(e) => handlePincodeCheckBox(e.target.checked)}>
                This pincode covers all nearby areas.
              </Checkbox>
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item
              name="pincode_areas"
              label="Pincode Area"
              rules={
                !areaFieldDisabled && [{ required: true, message: "Pincode Area is required" }]
              }
              extra={"Area will be fetched based on the pincode"}>
              <Select
                showSearch
                block
                mode="multiple"
                size="large"
                placeholder="Select Area"
                options={pincodeAreaList}
                loading={loadingPincodeAreas}
                allowClear
                filterOption={(input, option) => {
                  const label = String(option?.label) ?? "";
                  return label.includes(String(input));
                }}
                disabled={areaFieldDisabled}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={24}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={24}>
            <Typography.Text level={5} type="secondary">
              Example : A new entry with Store Code 94101, Pincode 302002, and Pincode Area Hawa
              Mahal cannot be added if the same combination already exists. To associate a different
              Pincode Area with the same Store Code and Pincode, please edit the existing entry to
              include the new Pincode Area. Do not create a new entry.
            </Typography.Text>
          </Col>
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.pincodeMappingList}>
            <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>
              Cancel
            </Button>
          </NavLink>
          {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
            <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
              Add
            </Button>
          )}
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}
