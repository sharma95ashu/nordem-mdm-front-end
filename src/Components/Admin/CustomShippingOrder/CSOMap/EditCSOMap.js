/* eslint-disable no-unused-vars */

import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Row, Select, Spin, Switch, Typography } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useUserContext } from "Hooks/UserContext";
import { debounce } from "lodash";

export default function EditCSOMap() {
  const params = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { apiService } = useServices();
  const { setBreadCrumb } = useUserContext();
  const [csoList, setCSOList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [pincodeList, setPincodeList] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [firstCSOList, setFirstCSOList] = useState([]);
  const fetchRef = useRef(0);
  const pincodeRef = useRef(0);
  const [pinCodeLoading, setPinCodeLoading] = useState(false);
  const stateIdwatch = Form.useWatch(["state_code"], form);
  const [firstPincodeList, setFirstPincodeList] = useState([]);

  const { refetch: fetchSingleCSOMapData } = useQuery(
    "fetchSingleCSOMapData",
    () => apiService.getSingleCSOMapDetails(params?.id),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data) {
            form.setFieldsValue(data?.data);
            form.setFieldValue(
              "state_code",
              data?.data?.state?.state_name + "-" + data?.data?.state?.state_code
            );
            let tempList = data?.data?.pincode_id?.map((item) => ({
              label: String(item),
              value: String(item)
            }));
            form.setFieldValue(
              "pincode_id",
              data?.data?.pincode_id?.map((item) => String(item))
            );
            setPincodeList(tempList);
            setFirstPincodeList(tempList);
            form.setFieldValue(
              "cso_map_status",
              data?.data?.cso_map_status == "active" ? true : false
            );
            let tempCSO = { label: data?.data?.cso?.cso_name, value: data?.data?.cso?.cso_id };
            form.setFieldValue("cso_id", data?.data?.cso?.cso_id);
            setCSOList([tempCSO]);
            pincodeRef.current == 1;
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const { mutate: fetchCSOList, isLoading: loadingCSOList } = useMutation(
    "fetchCSOList",
    (val) => apiService.getCSOList(val?.search),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data, val) => {
        try {
          if (data) {
            const tempCSOList = data?.data?.data?.map((item) => ({
              label: item?.cso_name,
              value: item?.cso_id
            }));
            setCSOList([...tempCSOList]);
            setFetching(false);
            form.setFieldValue("cso_id", null);

            if (fetchRef.current == 0) {
              setFirstCSOList(tempCSOList);
            }
            if (val?.fetchId && data?.data?.data?.length == 0) {
              enqueueSnackbar("No data found !", snackBarErrorConf);
            }
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const { refetch: fetchStateListForCSOMap } = useQuery(
    "fetchStateListForCSOMap",
    () => apiService.getStateListForCSOMap(),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data) {
            const tempStateList = data?.data?.data?.map((item) => ({
              label: item?.state_name,
              value: item?.state_name + "-" + item?.state_code_old
            }));
            setStateList(tempStateList);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const clearPincodeList = () => {
    return new Promise((resolve, reject) => {
      setPincodeList([]);
      resolve(); // Resolve the promise after pincodeList is cleared
    });
  };

  const handleStateChange = async (val) => {
    try {
      form.setFieldValue("state_code", val);
      form.setFieldValue("pincode_id", null);
      await clearPincodeList(); // Wait for pincodeList to be cleared
      fetchPincode(val?.split("-")[0]);
    } catch (error) {}
  };

  const { mutate: fetchPincode, isLoading: loadingPincodes } = useMutation(
    "fetchPincode",
    (payload) => apiService.getPincodeList(payload),
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
          }
          setPinCodeLoading(false);
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  const updatePincodeList = (tempPincodeList) => {
    try {
      // setPincodeList(tempPincodeList);
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

  const onFinish = (value) => {
    try {
      let pinCodeValue = [];
      if (value?.pincode_id?.length > 0) {
        if (typeof value?.pincode_id[0] == "object") {
          value?.pincode_id?.forEach((item) => {
            pinCodeValue.push(String(item?.value));
          });
        } else {
          pinCodeValue = value?.pincode_id?.toString().split(",");
        }
      } else {
        pinCodeValue = [];
      }

      let tempObj = {
        ...value,
        pincode_id: pinCodeValue,
        state_code: value?.state_code?.split("-")[1],
        cso_map_status: value?.cso_map_status ? "active" : "inactive"
      };

      updateCSOMap(tempObj);
    } catch (error) {}
  };

  const { mutate: updateCSOMap, isLoading } = useMutation(
    "updateCSOMap",
    (payload) => apiService.updateCSOMapping(params?.id, payload),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data) {
            enqueueSnackbar(data.message, snackBarSuccessConf);
            navigate(`/${Paths.sequenceMapppingList}`);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  const fetchData = () => {
    fetchStateListForCSOMap();
    fetchSingleCSOMapData();
    // form.setFieldValue("cso_map_status", true);
  };
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)
      ? fetchData()
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Sequence Mapping",
      icon: "cso",
      titlePath: Paths.sequenceMapppingList,
      subtitle: "Edit New",
      path: Paths.users
    });
  }, []);

  //for sequnece mapping- debounce
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      const val = { fetchId: fetchId, search: value };
      setFetching(true);
      fetchCSOList(val);
    };
    return debounce(loadOptions, 500);
  }, [fetchCSOList, 500]);

  const handleCSOChange = (val) => {
    try {
      form.setFieldValue("cso_id", val);
      const filterdData = csoList?.filter((item) => item?.value == val);
      setCSOList([...firstCSOList, ...filterdData]);
    } catch (error) {}
  };

  // for pincode - debounce
  const debounceFetcherPinCode = useMemo(() => {
    const loadOptions = (value) => {
      pincodeRef.current += 1;
      const fetchId = pincodeRef.current;
      const obj = { fetchId: fetchId, search: value, state: stateIdwatch?.split("-")[0] };
      fetchPincode(obj);
    };
    return debounce(loadOptions, 1000);
  }, [fetchPincode, stateIdwatch]);

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

  return actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ? (
    <>
      <Typography.Title level={5}>Edit Sequence Mapping</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name={"cso_id"}
                  label={"Shipping Sequence"}
                  rules={[
                    {
                      required: true,
                      message: "Shipping Sequence is required"
                    }
                  ]}>
                  <Select
                    showSearch
                    block
                    size="large"
                    placeholder="Search Shipping Sequence"
                    onSearch={debounceFetcher}
                    onChange={handleCSOChange}
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    // loading={fetching}
                    disabled={csoList?.length > 0 ? false : true}
                    options={csoList}
                    filterOption={(input, option) =>
                      (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name={"state_code"}
                  label={"State"}
                  rules={[
                    {
                      required: true,
                      message: "State is required"
                    }
                  ]}>
                  <Select
                    block
                    size="large"
                    showSearch
                    placeholder="Select State"
                    disabled={stateList?.length > 0 ? false : true}
                    options={stateList}
                    onChange={(val) => handleStateChange(val)}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name={"pincode_id"}
                  label={"Pincode"}
                  rules={[
                    {
                      required: true,
                      message: "Pincode is required"
                    }
                  ]}>
                  <Select
                    showSearch
                    block
                    size="large"
                    placeholder="Search Pincode"
                    mode="multiple"
                    onSearch={searchPinCode}
                    loading={pinCodeLoading}
                    // onChange={handlePincodeChange}
                    notFoundContent={loadingPincodes ? <Spin size="small" /> : null}
                    disabled={stateIdwatch ? false : true}
                    options={pincodeList}
                    filterOption={(input, option) => {
                      const label = String(option?.label) ?? "";
                      return label.includes(String(input));
                    }}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="cso_map_status" label="Status">
                  <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Flex gap="middle" align="start" vertical>
          <Flex justify={"flex-end"} align={"center"} className="width_full" gap={10}>
            <NavLink to={"/" + Paths.sequenceMapppingList}>
              <Button style={StyleSheet.backBtnStyle}>Cancel</Button>
            </NavLink>
            <Button type="primary" htmlType="submit" disabled={isLoading}>
              Update
            </Button>
          </Flex>
        </Flex>
      </Form>
    </>
  ) : (
    ""
  );
}
