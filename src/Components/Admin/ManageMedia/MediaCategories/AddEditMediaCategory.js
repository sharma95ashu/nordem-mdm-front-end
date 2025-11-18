import { PermissionAction, snackBarSuccessConf, RULES_MESSAGES } from "Helpers/ats.constants";
import { actionsPermissionValidator, firstlettCapital } from "Helpers/ats.helper";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Row, Spin, Switch, TreeSelect } from "antd";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";

// Add/Edit Media Category Component
const AddEditMediaCategory = () => {
  const { setBreadCrumb } = useUserContext();
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm();
  const { apiService } = useServices();
  const [parentMediaCategoryList, setParentMediaCategory] = useState([]);

  // Styles
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    }
  };

  // Function to submit form data
  const onFinish = (value) => {
    try {
      const payload = {
        ...value,
        status: value?.status ? "active" : "inactive"
      };
      const data = {
        id: params?.id || null,
        payload: payload
      };

      mutate(data); // api call for add/update form data
    } catch (error) {}
  };

  // UseMutation hook for creating a new media category or update existing media category via API
  const { mutate, isLoading } = useMutation((data) => apiService.addUpdateMediaCategory(data), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      if (data.success) {
        enqueueSnackbar(data.message, snackBarSuccessConf); // Display a success Snackbar notification
        navigate(`/${Paths.mediaCategory}`); // Navigate to the window pathname
      }
    },
    onError: (error) => {
      // Handle errors
    }
  });

  // UseMutation hook for fetching single media category data via API
  const { mutate: fetchData, isLoading: dataLoading } = useMutation(
    () => apiService.getSingleMediaCategoryData(params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.data) {
          const { display_order, status } = data.data; // destructuring api data

          //setting form data
          form.setFieldsValue(data.data);
          form.setFieldValue("status", status == "active" ? true : false);
          form.setFieldValue("display_order", String(display_order));
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for fetching parent category data via API
  const { mutate: fetchParentMediaCategoryList, isLoading: parentCategoriesLoading } = useMutation(
    () => apiService.getParentMediaCategoryListData(),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.data) {
          const tempArr = data?.data?.data?.map((item) => ({
            value: item.media_category_id,
            label: firstlettCapital(item.media_category_name),
            children: item?.children?.map((child) => ({
              value: child.media_category_id,
              label: firstlettCapital(child.media_category_name)
            }))
          }));
          setParentMediaCategory(tempArr); // updating parent category list
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  /**
   * useEffect function
   */
  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Manage Media",
      icon: "manageMedia",
      titlePath: Paths.mediaCategory,
      subtitle: params?.id ? "Edit" : "Add", // setting sub title based on params id
      path: Paths.users
    });

    fetchParentMediaCategoryList(); // api call parent category list

    if (params?.id) {
      fetchData(); // api call for fetching single mega menu data
    } else {
      form.setFieldValue("status", true); // initializing default status values
    }
  }, []);

  // function to filter by label in multi select dropdown
  const filterTreeNode = (inputValue, treeNode) => {
    // Check if the input value matches any part of the label of the treeNode
    return treeNode.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={dataLoading} fullscreen />
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="media_category_name"
              label="Media Category Name"
              rules={[
                { required: true, whitespace: true, message: "Media Category Name is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,50}$/,
                  message: "The value must be between 3 and 50 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Media Category Name" size="large" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="display_order"
              label="Display Order"
              rules={[
                { required: true, whitespace: true, message: `Display Order is required` },
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Please enter valid number"
                },
                { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" }
              ]}>
              <Input placeholder="Enter Display Order" size="large" type="number" />
            </Form.Item>
          </Col>

          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item name="media_category_parent" label={"Parent Media Category"}>
              <TreeSelect
                allowClear
                showSearch
                treeDefaultExpandAll
                className="width_full"
                size="large"
                treeData={parentMediaCategoryList}
                filterTreeNode={filterTreeNode}
                onClear={() => form.setFieldValue("media_category_parent", null)}
                placeholder={"Select Parent Media Category"}
                loading={parentCategoriesLoading}
              />
            </Form.Item>
          </Col>

          <Col
            className="gutter-row"
            xs={{ span: 12 }}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            lg={{ span: 12 }}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>
        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.mediaCategory}>
            <Button disabled={isLoading} style={StyleSheet.backBtnStyle}>
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
};

export default AddEditMediaCategory;
