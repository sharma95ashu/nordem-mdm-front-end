import {
  PermissionAction,
  snackBarSuccessConf,
  ALLOWED_UPLOAD_FILES_PROFILE_MENU,
  USER_TYPES,
  DEVICE_TYPES,
  ALLOWED_FILE_SIZE_FOR_SVG
} from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  profileMenuValidateFields,
  validateSVGForUpload
} from "Helpers/ats.helper";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Checkbox, Col, Flex, Form, Input, Row, Select, Spin, Switch, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import { DeleteOutlined } from "@ant-design/icons";
import { getBase64, getFullImageUrl } from "Helpers/functions";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";

// Add/Edit Profile Menu Component
const AddEditProfileMenu = () => {
  const [parentModuleList, setParentModuleList] = useState([]);
  const [menuIcon, setMenuIcon] = useState();
  const { setBreadCrumb } = useUserContext();
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm();
  const { apiService } = useServices();

  // Function to submit form data
  const onFinish = (value) => {
    const formData = new FormData();
    formData.append("module_name", value.module_name); // Append Module Name
    formData.append("parent_id", value.parent_id); // Append Parent Module
    formData.append("display_order", value.display_order); // Append Display Order

    // Append Supported Users
    value.supported_users.forEach((user, index) => {
      formData.append(`supported_user[${index}]`, user);
    });

    // Append Supported Platforms
    value.supported_platforms.forEach((platform, index) => {
      formData.append(`supported_platform[${index}]`, platform);
    });

    // Append Module Status
    formData.append("module_status", value.module_status ? "active" : "inactive");

    // Append Is New
    formData.append("is_new", value.is_new ? "true" : "false");

    // Append Menu Icon
    if (value?.menu_icon && value?.menu_icon instanceof File) {
      formData.append("menu_icon", value?.menu_icon);
    }

    try {
      if (params?.id) {
        // API CALL

        updateProfileMenuMutate(formData);
      } else {
        // API CALL

        addProfileMenuMutate(formData);
      }
    } catch (error) {}
  };

  // UseMutation hook for creating a new profile menu
  const { mutate: addProfileMenuMutate, isLoading: addProfileMenuLoading } = useMutation(
    (data) => apiService.addNewEcomProfileMenu(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          enqueueSnackbar(data.message, snackBarSuccessConf); // Display a success Snackbar notification
          navigate(`/${Paths.manageProfileMenuList}`); // Navigate to the window pathname
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // UseMutation hook for updating existing profile menu
  const { mutate: updateProfileMenuMutate, isLoading: updateProfileMenuLoading } = useMutation(
    (data) => apiService.updateEcomProfileMenu(params.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          enqueueSnackbar(data.message, snackBarSuccessConf); // Display a success Snackbar notification
          navigate(`/${Paths.manageProfileMenuList}`); // Navigate to the window pathname
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // UseMutation hook for fetching single mega menu data via API
  const { mutate: fetchSingleMenuData, isLoading: dataLoading } = useMutation(
    () => apiService.getSingleEcomProfileMenu(params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.success && data.data) {
          form.setFieldValue("module_name", data.data.module_name);
          form.setFieldValue("parent_id", data.data.parent_id);
          form.setFieldValue("display_order", data.data.display_order);
          form.setFieldValue("supported_users", data.data.supported_user);
          form.setFieldValue("supported_platforms", data.data.supported_platform);
          form.setFieldValue("module_status", data.data.module_status === "active" ? true : false);
          form.setFieldValue("is_new", data.data.is_new ? true : false);

          // Set Menu Icon
          if (data.data.icon) {
            setMenuIcon(getFullImageUrl(data.data.icon));
            form.setFieldValue("menu_icon", data.data.icon);
          }
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // UseQuery hook for fetching all profile modules data via API
  const { isLoading: profileModulesLoading } = useQuery(
    "profileModulesData",
    () => apiService.getAllEcomProfileMenu(),
    {
      enabled: true,
      onSuccess: (data) => {
        if (data.success && data.data) {
          let parentModules = data.data
            .filter((item) => item.parent_id === null)
            .map((item) => ({
              label: item.module_name,
              value: item.module_id
            }));
          setParentModuleList(parentModules);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  /**
   * Function to find type and show loader and upload file accordingly
   * @param {*} info
   * @param {*} type
   * @returns
   */
  const handleChange = async (info, type) => {
    const file = info.file;
    const isValid = validateSVGForUpload(file);

    if (!isValid) {
      form.setFieldValue(type, null);
      return false;
    }

    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        setMenuIcon(url);
        form.setFieldValue(type, info.fileList[0].originFileObj);
      });
    }
  };

  /**
   * useEffect function
   */
  useEffect(() => {
    // Check Permission
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    // Set BreadCrumn
    setBreadCrumb({
      title: "Profile Menu Management",
      icon: "menuManagement",
      titlePath: Paths.manageProfileMenuList,
      subtitle: params?.id ? "Edit" : "Add", // setting sub title based on params id
      path: Paths.manageProfileMenuList
    });

    // Fetch Single Profile Menu Data
    if (params?.id) {
      fetchSingleMenuData(); // api call for fetching single mega menu data
    } else {
      // Set Default Values
      form.setFieldValue("module_status", true);
      form.setFieldValue("is_new", false);
      form.setFieldValue("supported_platforms", DEVICE_TYPES);
    }
  }, []);

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin
        spinning={
          dataLoading || profileModulesLoading || addProfileMenuLoading || updateProfileMenuLoading
        }
        fullscreen
      />
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          {/* Icon */}
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
            <Row gutter={[24, 0]}>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 4 }}>
                <div style={StyleSheet.uploadBoxStyle}>
                  <Form.Item
                    name="menu_icon"
                    label="Menu Icon"
                    rules={[{ required: true, message: "Menu icon is required" }]}
                    extra={
                      <>
                        Allowed formats : SVG <br /> Max size : {ALLOWED_FILE_SIZE_FOR_SVG}MB
                      </>
                    }>
                    <Upload
                      name="menu_icon"
                      listType="picture-card"
                      className="avatar-uploader"
                      accept={ALLOWED_UPLOAD_FILES_PROFILE_MENU}
                      showUploadList={false}
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={(e) => handleChange(e, "menu_icon")}>
                      {menuIcon ? (
                        <>
                          <img
                            src={menuIcon}
                            alt="menu_icon"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain"
                            }}
                          />
                        </>
                      ) : (
                        <Button> Upload </Button>
                      )}
                    </Upload>
                  </Form.Item>
                  {menuIcon && (
                    <div
                      className="cover_delete"
                      type="text"
                      onClick={() => {
                        if (menuIcon) {
                          form.setFieldValue("menu_icon", null);
                          setMenuIcon(null);
                        }
                      }}>
                      <DeleteOutlined />
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Col>

          {/* Module Name */}
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="module_name"
              label="Module Name"
              rules={[
                { required: true, whitespace: true, message: "Module name is required" },
                {
                  validator: (rule, value) => {
                    return profileMenuValidateFields.moduleName(rule, value);
                  }
                }
              ]}>
              <Input maxLength={50} placeholder="Enter Module Name" size="large" />
            </Form.Item>
          </Col>

          {/* Parent Module */}
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="parent_id"
              label="Parent Module"
              rules={[{ required: true, message: "Parent module is required" }]}>
              <Select
                placeholder="Select Parent Module"
                block
                size="large"
                options={parentModuleList}
              />
            </Form.Item>
          </Col>

          {/* Display Order */}
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
                { required: true, message: `Display Order is required` },
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Please enter valid number"
                },
                { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" }
              ]}>
              <Input maxLength={5} placeholder="Enter Display Order" size="large" type="number" />
            </Form.Item>
          </Col>

          {/* Supported Users */}
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="supported_users"
              label="Supported Users"
              rules={[{ required: true, message: "Please select at least one user type" }]}>
              <Checkbox.Group>
                <Row gutter={[16, 8]}>
                  {USER_TYPES.map((value) => (
                    <Col key={value}>
                      <Checkbox value={value}>{value}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Col>

          {/* Supported Platforms */}
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="supported_platforms"
              label="Supported Platforms"
              rules={[{ required: true, message: "Please select at least one platform" }]}>
              <Checkbox.Group>
                <Row gutter={[16, 8]}>
                  {DEVICE_TYPES.map((value) => (
                    <Col key={value}>
                      <Checkbox value={value}>{value.toUpperCase()}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Col>

          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            {/* Status */}

            <Flex align="center" gap={12}>
              <Form.Item name="module_status" label="Status">
                <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>

              {/* Is New */}

              <Form.Item name="is_new" label="Is New">
                <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Flex>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Flex align="start" justify={"flex-end"} gap={10}>
          <NavLink to={"/" + Paths.manageProfileMenuList}>
            <Button disabled={addProfileMenuLoading || updateProfileMenuLoading}>Cancel</Button>
          </NavLink>
          {actionsPermissionValidator(
            window.location.pathname,
            params?.id ? PermissionAction.EDIT : PermissionAction.ADD
          ) && (
            <PopconfirmWrapper
              onConfirm={() => form.submit()}
              title={params?.id ? "Update Profile Menu" : "Add Profile Menu"}
              description={
                params?.id
                  ? "Are you sure want to update profile menu?"
                  : "Are you sure want to add profile menu?"
              }
              okText="Yes"
              cancelText="No"
              ChildComponent={
                <Button
                  loading={addProfileMenuLoading || updateProfileMenuLoading}
                  type="primary"
                  htmlType="button"
                  disabled={addProfileMenuLoading || updateProfileMenuLoading}>
                  {params?.id ? "Update" : "Add"}
                </Button>
              }></PopconfirmWrapper>
          )}
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
};

export default AddEditProfileMenu;
