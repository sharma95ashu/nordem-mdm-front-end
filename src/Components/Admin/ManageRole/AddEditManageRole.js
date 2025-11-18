import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Typography,
  Flex,
  Spin,
  Switch,
  theme,
  Divider
} from "antd";
import React, { useState } from "react";
import { useUserContext } from "Hooks/UserContext";
import { useEffect } from "react";
import { Paths } from "Router/Paths";
import { useMutation, useQueries } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import {
  PermissionAction,
  snackBarErrorConf,
  snackBarSuccessConf,
  RULES_MESSAGES
} from "Helpers/ats.constants";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  actionsPermissionValidator,
  capitalizeFirstLetterAndRemoveUnderScore,
  firstlettCapital
} from "Helpers/ats.helper";

export default function AddEditMangeRole() {
  const { setBreadCrumb } = useUserContext();
  const navigate = useNavigate();
  const params = useParams();
  const { apiService } = useServices();
  const [rolePermissionForm] = Form.useForm();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [groupedModules, setGroupedModules] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [checkedModuleTypes, setCheckedModuleTypes] = useState([]);
  const [loader, setLoader] = useState(false);
  const moduleTypeOptions = ["MDM", "KYC", "CRM"];
  const {
    token: { borderRadiusLG, colorPrimaryBorder, colorPrimaryBg, colorBorder }
  } = theme.useToken();

  const StyleSheet = {
    colStyle: {
      marginTop: "8px"
    },
    cardStyle: {
      border: "1px solid",
      borderColor: colorPrimaryBorder,
      padding: borderRadiusLG,
      borderRadius: borderRadiusLG,
      background: colorPrimaryBg
    },
    verDividerStyle: {
      borderColor: colorBorder,
      margin: "16px 0px"
    }
  };

  const [
    { data: modulesData, error: modulesError, isLoading: modulesLoading },
    { data: permissionsData, error: permissionsError, isLoading: permissionsLoading },
    {
      data: singleRolePermissionData,
      error: singleRolePermissionDataError,
      isLoading: singleRolePermissionDataLoading
    }
  ] = useQueries([
    {
      queryKey: "getAllModules",
      queryFn: () => apiService.getAllModules(),
      enabled: permissionGranted // Only enable query if permission is granted
    },
    {
      queryKey: "getAllActivePermissions",
      queryFn: () => apiService.getAllModulesPermissions(),
      enabled: permissionGranted // Only enable query if permission is granted
    },
    {
      queryKey: "getSingleRolePermissionsData",
      queryFn: () => (params?.id ? apiService.getSingleRoleData(params.id) : Promise.resolve(null)), // Only fetch if id exists
      enabled: !!params?.id, // Only enable query if params?.id exists
      onSuccess: (data) => {
        if (data?.data) {
          try {
            // modify permission data
            const transformedPermissionData = data?.data?.modulePermissions?.reduce(
              (obj, module) => {
                obj[module.module_id] = module?.permissions?.reduce((permObj, perm) => {
                  permObj[perm] = true;
                  return permObj;
                }, {});
                return obj;
              },
              {}
            );
            setSelectedPermissions(transformedPermissionData); //update seleceted permisssions

            rolePermissionForm.setFieldValue("role", data?.data?.role_name);
            rolePermissionForm.setFieldValue("status", data?.data?.role_status === "active");
          } catch (error) {}
        }
      }
    }
  ]);

  // Handle errors outside useEffect
  useEffect(() => {
    if (modulesError) enqueueSnackbar(modulesError?.message, snackBarErrorConf);
    if (permissionsError) enqueueSnackbar(permissionsError?.message, snackBarErrorConf);
    if (singleRolePermissionDataError)
      enqueueSnackbar(singleRolePermissionDataError?.message, snackBarErrorConf);
  }, [modulesError, permissionsError, singleRolePermissionDataError]);

  // fn to group modules based on parent_name
  const groupModulesByParentName = (data) => {
    return data?.reduce((acc, module) => {
      if (!module.parent_name) {
        acc["Standalone"] = acc["Standalone"] || [];
        acc["Standalone"].push(module);
      } else {
        acc[module?.parent_name] = acc[module?.parent_name] || [];
        acc[module?.parent_name].push(module);
      }
      return acc;
    }, {});
  };

  // Optimized useEffect for setting data
  useEffect(() => {
    try {
      // case : add role permissions
      if (modulesData && !params?.id) {
        let tempGroupedModules = groupModulesByParentName(modulesData?.data);
        setGroupedModules(tempGroupedModules);
        setCheckedModuleTypes(moduleTypeOptions);
        rolePermissionForm.setFieldValue("status", true);
      } else if (modulesData && params?.id && singleRolePermissionData) {
        // case : edit  role permission

        // find unique module types
        const uniqueGroups = [
          ...new Set(
            singleRolePermissionData?.data?.modulePermissions.map((item) =>
              item.group?.toUpperCase()
            )
          )
        ];
        setCheckedModuleTypes(uniqueGroups);
        // based on unique groupes, group the modules based on "group" key
        let tempModules = modulesData?.data?.filter((item) =>
          uniqueGroups?.includes(item?.group?.toUpperCase())
        );
        let tempGroupedModules = groupModulesByParentName(tempModules);
        setGroupedModules(tempGroupedModules); //update grouped modules
      }
    } catch (error) {}
  }, [modulesData, permissionsData, singleRolePermissionData]);

  // fn call on submitting data
  const onFinish = (value) => {
    try {
      if (value?.role && Object.keys(selectedPermissions).length > 0) {
        // modifying data as per payload
        const output = Object.entries(selectedPermissions)
          .map(([module_id, permissions]) => {
            const filteredPermissions = Object.keys(permissions).filter((key) => permissions[key]);
            if (filteredPermissions.length > 0) {
              return {
                module_id: Number(module_id),
                permissions: filteredPermissions // Return only the filtered permissions
              };
            }
            return undefined; // If no permissions are true, return undefined, which will be filtered out
          })
          .filter((item) => item !== undefined); // Remove any undefined entries

        // user have to select atleast one permission before updating
        if (output.length === 0) {
          enqueueSnackbar("Please select at least one permission", snackBarErrorConf);
          return;
        }

        setLoader(true);
        let payload = {
          role_name: value?.role?.trim(),
          mappingArray: output,
          ...(params?.id ? { role_status: value?.status ? "active" : "inactive" } : {})
        };
        params?.id ? updateRole(payload) : addRole(payload); // api call
      } else {
        enqueueSnackbar("Please select at least one permission", snackBarErrorConf);
      }
    } catch (error) {}
  };

  // useMutation hook for creating a new role via API
  const { mutate: addRole, isLoadingCreateRole } = useMutation(
    "createRole",
    (data) => apiService.createRole(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.manageRole}`);
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      },
      onSettled: () => {
        setLoader(false);
      }
    }
  );

  // useMutation hook for updating role data via API
  const { mutate: updateRole, isLoadingUpdateRole } = useMutation(
    "updateRole",
    (data) => apiService.updateRole(params.id, data),
    {
      onSuccess: (data) => {
        if (data) {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.manageRole}`);
        }
      },
      onError: (error) => {
        enqueueSnackbar(error.message, snackBarErrorConf); // Handle errors by displaying a Snackbar notification
      },
      onSettled: () => {
        setLoader(false);
      }
    }
  );

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Manage Role",
      icon: "category",
      titlePath: Paths.manageRole,
      subtitle: params?.id ? "Edit Role" : "Add role",
      path: Paths.AddEditMangeRole
    });
    // Check if user has permission to view the page
    if (actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)) {
      // If permission granted, enable the queries
      setPermissionGranted(true);
    } else {
      // If permission denied, navigate to a different page
      navigate("/", { state: { from: null }, replace: true });
    }
  }, []);

  // function to check if ["Permissions"] checkbox is selected
  const isAllPermissionsChecked = () => {
    try {
      if (Object.keys(selectedPermissions).length === 0) return false;
      const totalVisibleModulesCount = Object.values(groupedModules).reduce(
        (sum, array) => sum + array.length,
        0
      );
      if (totalVisibleModulesCount !== Object.keys(selectedPermissions).length) return false;
      const tempMap = Object.values(groupedModules)?.map((mods) => {
        // for each module group, we check the permissions for each module
        return mods?.every((mod) => {
          // check if the module's permissions match the selected permissions length
          if (
            mod?.module_permissions?.length ===
            Object.keys(selectedPermissions[mod?.module_id])?.length
          ) {
            // If they match, check if all the selected permissions are true
            return Object.values(selectedPermissions[mod?.module_id]).every(Boolean);
          } else {
            // If lengths don't match, return false
            return false;
          }
        });
      });

      return tempMap.every(Boolean);
    } catch (error) {}
  };

  // function to toggle all ["Permissions"] checkbox
  const toggleAllPermissions = (e) => {
    try {
      const newState = {};
      Object.entries(groupedModules).forEach(([_, modules]) => {
        modules.forEach((module) => {
          newState[module.module_id] = module?.module_permissions?.reduce((acc, perm) => {
            acc[perm] = e.target.checked;
            return acc;
          }, {});
        });
      });
      setSelectedPermissions(newState);
    } catch (error) {}
  };

  // fn to find specific module's all permissions
  const findModulePermissions = (modId) => {
    return modulesData?.data?.find((item) => item?.module_id == modId)?.module_permissions;
  };

  // function to check if a parent module is fully selected
  const isParentModuleChecked = (parentModuleName) => {
    const childModules = groupedModules[parentModuleName] || [];
    // Check if selectedPermissions is empty or undefined
    if (!selectedPermissions || Object.keys(selectedPermissions).length === 0) {
      return false;
    }

    // Loop through each child module and check if the permissions are true
    return childModules.every((module) => {
      // Check if the current module's permissions are available and if any permission is true
      if (
        selectedPermissions[module.module_id] &&
        Object.values(selectedPermissions[module.module_id] || {})?.length ==
          module?.module_permissions?.length
      ) {
        return Object.values(selectedPermissions[module.module_id]).every(Boolean);
      }
      return false; // Return false if no permissions are available for the module
    });
  };

  // function to toggle a parent module
  const toggleParentModule = (parentModuleName) => {
    const childModules = groupedModules[parentModuleName] || [];
    const allSelected = isParentModuleChecked(parentModuleName);

    setSelectedPermissions((prev) => {
      const newState = { ...prev };

      childModules.forEach((module) => {
        newState[module.module_id] = module?.module_permissions.reduce((acc, perm) => {
          acc[perm] = !allSelected; // Toggle all
          return acc;
        }, {});
      });

      return newState;
    });
  };

  // function to check if a module is fully selected
  const isModuleChecked = (moduleId) => {
    if (
      !selectedPermissions ||
      Object.keys(selectedPermissions).length === 0 ||
      !selectedPermissions[moduleId]
    ) {
      return false;
    }
    return (
      Object.values(selectedPermissions[moduleId] || {})?.length ==
        findModulePermissions(moduleId)?.length &&
      Object.values(selectedPermissions[moduleId] || {}).every(Boolean)
    );
  };

  // function to toggle module permissions
  const toggleModulePermissions = (e, moduleId) => {
    try {
      let tempAllPermission = findModulePermissions(moduleId);
      setSelectedPermissions((prev) => ({
        ...prev,
        [moduleId]: tempAllPermission.reduce((acc, perm) => {
          acc[perm] = e.target.checked;
          return acc;
        }, {})
      }));
    } catch (error) {}
  };

  // function to toggle individual permission
  const togglePermission = (moduleId, permKey) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [permKey]: !prev[moduleId]?.[permKey],
        ...(permKey !== PermissionAction.VIEW &&
          !prev[moduleId]?.[permKey] && { [PermissionAction.VIEW]: true }),
        ...(permKey === PermissionAction.VIEW && prev[moduleId]?.[permKey]
          ? Object.fromEntries(
              [PermissionAction.EDIT, PermissionAction.ADD, PermissionAction.DELETE].map((key) => [
                key,
                false
              ])
            )
          : {})
      }
    }));
  };

  // fn to handle [Module Type] checkbox change
  const handleModuleTypesCheck = (val) => {
    try {
      if (val?.length === 0) {
        return; // Prevent unchecking the last checkbox
      }
      setLoader(true);
      const selectedGroups = new Set(val?.map((element) => element?.toLowerCase()));
      const filteredModules =
        modulesData?.data?.filter((item) => selectedGroups.has(item?.group)) || [];
      const groupedModules = groupModulesByParentName(filteredModules);

      setGroupedModules(groupedModules);
      setCheckedModuleTypes(val);
      setSelectedPermissions({});
      setLoader(false);
    } catch (error) {}
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin
        spinning={modulesLoading || permissionsLoading || singleRolePermissionDataLoading || loader}
        fullscreen
      />
      <Typography.Title level={5}>{params?.id ? "Edit Role" : "Add Role"}</Typography.Title>
      <Form
        name="manage_role_Permission_form"
        form={rolePermissionForm}
        layout="vertical"
        onFinish={onFinish}>
        <Row gutter={10}>
          <Col className="gutter-row" span={21}>
            <Form.Item
              name="role"
              label="Role Name"
              rules={[
                { required: true, whitespace: true, message: "Role name is required" },
                {
                  pattern: /^.{1,50}$/,
                  message: RULES_MESSAGES.MIN_MAX_LENGTH_MESSAGE
                },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE }
              ]}>
              <Input placeholder="Enter Role Name" size="large" />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={3}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={24}>
            <Flex vertical gap={8}>
              <b>{}Module Type</b>
              <Checkbox.Group value={checkedModuleTypes} onChange={handleModuleTypesCheck}>
                {moduleTypeOptions.map((option) => (
                  <Checkbox
                    key={option}
                    value={option}
                    disabled={
                      checkedModuleTypes.length === 1 && checkedModuleTypes.includes(option)
                    }>
                    {option}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Flex>
            <Divider style={StyleSheet.verDividerStyle} />
          </Col>
          <Col className="gutter-row" span={24}>
            <Checkbox onChange={(e) => toggleAllPermissions(e)} checked={isAllPermissionsChecked()}>
              <b>Permissions</b>
            </Checkbox>
            {Object.entries(groupedModules).map(([parentModuleName, modules]) => (
              <Row key={parentModuleName} span={24} gutter={[10]}>
                {parentModuleName === "Standalone" ? (
                  // Render standalone modules (no parent)
                  modules.map((module) => (
                    <>
                      <Col key={module.module_id} span={8} offset={0} style={StyleSheet.colStyle}>
                        <Flex vertical style={StyleSheet.cardStyle}>
                          <Row span={24}>
                            <Col span={24}>
                              <Checkbox
                                checked={isModuleChecked(module.module_id)}
                                onChange={(val) => toggleModulePermissions(val, module?.module_id)}>
                                {" "}
                                <b>{module.module_name}</b>
                              </Checkbox>
                            </Col>
                            <Col span={22} offset={2}>
                              {module?.module_permissions?.map((perm) => (
                                <>
                                  <Checkbox
                                    key={perm}
                                    checked={selectedPermissions[module.module_id]?.[perm] || false}
                                    onChange={() => togglePermission(module?.module_id, perm)}>
                                    {firstlettCapital(perm)}
                                  </Checkbox>
                                </>
                              ))}
                            </Col>
                          </Row>
                        </Flex>
                      </Col>
                    </>
                  ))
                ) : (
                  <>
                    <Col span={20} style={StyleSheet.colStyle}>
                      <Checkbox
                        checked={isParentModuleChecked(parentModuleName)}
                        onChange={() => toggleParentModule(parentModuleName)}>
                        <b>{capitalizeFirstLetterAndRemoveUnderScore(parentModuleName)}</b>
                      </Checkbox>
                    </Col>
                    {/* Child Modules */}
                    {modules.map((item) => (
                      <>
                        <Col key={item.module_id} span={8} style={StyleSheet.colStyle}>
                          <Flex vertical style={StyleSheet.cardStyle}>
                            <Row span={24}>
                              <Col span={24}>
                                <Checkbox
                                  checked={isModuleChecked(item?.module_id)}
                                  onChange={(val) => toggleModulePermissions(val, item?.module_id)}>
                                  <b>{item.module_name}</b>
                                </Checkbox>
                              </Col>
                              <Col span={22} offset={2}>
                                {item?.module_permissions?.map((perm) => (
                                  <Checkbox
                                    key={perm}
                                    checked={selectedPermissions[item?.module_id]?.[perm] || false}
                                    onChange={() => togglePermission(item?.module_id, perm)}>
                                    {firstlettCapital(perm)}
                                  </Checkbox>
                                ))}
                              </Col>
                            </Row>
                          </Flex>
                        </Col>
                      </>
                    ))}
                  </>
                )}
              </Row>
            ))}
          </Col>
          {actionsPermissionValidator(
            window.location.pathname,
            params?.id ? PermissionAction.EDIT : PermissionAction.ADD
          ) && (
            <Col className="gutter-row" span={24}>
              <Flex
                style={{ width: "100%" }}
                justify={"flex-end"}
                align={"flex-end"}
                className="marginTop16"
                gap={10}>
                <NavLink to={"/" + Paths.manageRole}>
                  <Button disabled={isLoadingCreateRole || isLoadingUpdateRole}>Cancel</Button>
                </NavLink>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoadingCreateRole || isLoadingUpdateRole}
                  disabled={
                    isLoadingCreateRole ||
                    isLoadingUpdateRole ||
                    !checkedModuleTypes?.length ||
                    !Object.keys(selectedPermissions)?.length ||
                    loader
                  }>
                  {params?.id ? "Update" : "Add"}
                </Button>
              </Flex>
            </Col>
          )}
        </Row>
      </Form>
    </>
  ) : (
    <></>
  );
}
