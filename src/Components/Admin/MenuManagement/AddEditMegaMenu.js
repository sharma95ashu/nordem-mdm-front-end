import {
  PermissionAction,
  snackBarSuccessConf,
  RULES_MESSAGES,
  menuTupeOptions
} from "Helpers/ats.constants";
import { actionsPermissionValidator, firstlettCapital } from "Helpers/ats.helper";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Row, Select, Spin, Switch, TreeSelect } from "antd";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";

// Add/Edit Mega Menu Component
const AddEditMegaMenu = () => {
  const { setBreadCrumb } = useUserContext();
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm();
  const { apiService } = useServices();
  const [selectedMenuType, setSelectedMenuType] = useState(null); // currently selected menu type state
  const [categoryList, setCategoryList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [parentMenuList, setParentMenuList] = useState([]);

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
        menu_type:
          value?.menu_type == "Category Mega Menu"
            ? "category_mega_menu"
            : value?.menu_type.toLowerCase(),
        menu_data: value?.menu_data || null,
        parent_menu_id: value?.parent_menu_id || null,
        status: value?.status ? "active" : "inactive"
      };
      const data = {
        id: params?.id || null,
        payload: payload
      };

      mutate(data); // api call for add/update form data
    } catch (error) {}
  };

  // UseMutation hook for creating a new mega menu or update existing mega menu via API
  const { mutate, isLoading } = useMutation((data) => apiService.addUpdateMenu(data), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      if (data.success) {
        enqueueSnackbar(data.message, snackBarSuccessConf); // Display a success Snackbar notification
        navigate(`/${Paths.manageMenuList}`); // Navigate to the window pathname
      }
    },
    onError: (error) => {
      // Handle errors
    }
  });

  // UseMutation hook for fetching single mega menu data via API
  const { mutate: fetchData, isLoading: dataLoading } = useMutation(
    () => apiService.getSingleMenuData(params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.data) {
          const { display_order, status, menu_type } = data.data; // destructuring api data

          //setting form data
          form.setFieldsValue(data.data);
          form.setFieldValue("status", status == "active" ? true : false);
          form.setFieldValue("display_order", String(display_order));
          form.setFieldValue(
            "menu_type",
            menu_type == "category_mega_menu" ? "Category Mega Menu" : firstlettCapital(menu_type)
          );

          setSelectedMenuType(
            menu_type == "category_mega_menu" ? "Category Mega Menu" : firstlettCapital(menu_type)
          );

          //api calls
          menu_type == "category" && categoryList?.length == 0 && fetchCategoriesList();
          menu_type == "brand" && brandsList?.length == 0 && fetchBrandsList();
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for fetching category list data via API
  const { mutate: fetchCategoriesList, isLoading: categoriesLoading } = useMutation(
    () => apiService.getCategoriesForMenuData(),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.data) {
          //modifying api data for treeselect field
          const tempArr =
            data.data?.map((item) => ({
              value: String(item.category_id),
              label: firstlettCapital(item.category_name),
              children:
                item?.children?.map((child) => ({
                  value: String(child.category_id),
                  label: firstlettCapital(child.category_name),
                  children: child?.children?.map((subchild) => ({
                    value: String(subchild.category_id),
                    label: firstlettCapital(subchild.category_name)
                  }))
                })) || []
            })) || [];

          setCategoryList(tempArr);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for fetching brand list data via API
  const { mutate: fetchBrandsList, isLoading: brandsLoading } = useMutation(
    () => apiService.getBrandsForMenuData(),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.data) {
          //modifying api data for treeselect field
          const tempArr = data.data?.map((item) => ({
            value: String(item?.brand_id),
            label: item?.brand_name
          }));

          setBrandsList(tempArr);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for fetching brand list data via API
  const { mutate: fetchParentMenuList } = useMutation(() => apiService.getParentMenuListData(), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      if (data.data) {
        const tempArr = data.data?.map((item) => ({
          value: item.menu_id,
          label: firstlettCapital(item.menu_title),
          children: item?.children?.map((child) => ({
            value: child.menu_id,
            label: firstlettCapital(child.menu_title),
            children: child?.children?.map((subchild) => ({
              value: subchild.menu_id,
              label: firstlettCapital(subchild.menu_title)
            }))
          }))
        }));
        setParentMenuList(tempArr);
      }
    },
    onError: (error) => {
      //
    }
  });

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
      title: "Menu Management",
      icon: "menuManagement",
      titlePath: Paths.manageMenuList,
      subtitle: params?.id ? "Edit" : "Add", // setting sub title based on params id
      path: Paths.users
    });

    // initializing default form values
    form.setFieldValue("status", true);
    form.setFieldValue("menu_type", "Category");

    fetchParentMenuList(); // api call parent menu list

    if (params?.id) {
      fetchData(); // api call for fetching single mega menu data
    } else {
      setSelectedMenuType("Category");
      fetchCategoriesList();
    }
  }, []);

  // function to handle menu type change
  const handleMenuType = (val) => {
    try {
      setSelectedMenuType(val);

      //initialising menu_data to default values
      form.setFieldValue("menu_data", null);
      form.setFields([{ name: "menu_data", errors: [] }]);

      val == "Category" && categoryList?.length == 0 && fetchCategoriesList(); // api call for category list
      val == "Brand" && brandsList?.length == 0 && fetchBrandsList(); // api call for brands list

      if (val == "Category Mega Menu") {
        form.setFieldValue("parent_menu_id", null);
      }
    } catch (error) {}
  };

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
      <Spin spinning={dataLoading || categoriesLoading || brandsLoading} fullscreen />
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="menu_title"
              label="Menu Title"
              rules={[
                { required: true, whitespace: true, message: "Menu title is required" },
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
              <Input placeholder="Enter Menu Title" size="large" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="menu_type"
              label="Menu  Type"
              rules={[{ required: true, message: "Menu type is required" }]}>
              <Select
                placeholder="Select Menu Type"
                block
                size="large"
                onChange={(e) => handleMenuType(e)}
                options={menuTupeOptions}
              />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="menu_data"
              label={selectedMenuType}
              rules={[
                selectedMenuType !== "Category Mega Menu" && {
                  required: true,
                  whitespace: true,
                  message: `${selectedMenuType} is required`
                }
                // selectedMenuType == "Link" && {
                //   pattern:
                //     /^((https?|ftp|smtp):\/\/)?(www\.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+)?\/?$/,
                //   message: "Invalid link"
                // }
              ]}>
              {selectedMenuType == "Category" || selectedMenuType == "Brand" ? (
                <TreeSelect
                  allowClear
                  showSearch
                  treeDefaultExpandAll
                  className="width_full"
                  size="large"
                  treeData={selectedMenuType == "Category" ? categoryList : brandsList}
                  filterTreeNode={filterTreeNode}
                  onClear={() => form.setFieldValue("menu_data", null)}
                  placeholder={
                    selectedMenuType == "Category"
                      ? "Select Category"
                      : selectedMenuType == "Brand"
                        ? "Select Brand"
                        : selectedMenuType == "Link"
                          ? "Enter URL"
                          : ""
                  }
                  loading={selectedMenuType == "Category" ? categoriesLoading : brandsLoading}
                />
              ) : (
                <Input
                  placeholder={selectedMenuType == "Link" && "Enter URL"}
                  size="large"
                  disabled={selectedMenuType == "Category Mega Menu"}
                />
              )}
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="parent_menu_id"
              label="Parent Menu"
              rules={[{ pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE }]}>
              <TreeSelect
                allowClear
                showSearch
                treeDefaultExpandAll
                className="width_full"
                size="large"
                treeData={parentMenuList}
                filterTreeNode={filterTreeNode}
                onClear={() => form.setFieldValue("parent_menu_id", null)}
                placeholder="Select Parent Menu"
                disabled={selectedMenuType == "Category Mega Menu"}
              />
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
          <NavLink to={"/" + Paths.manageMenuList}>
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

export default AddEditMegaMenu;
