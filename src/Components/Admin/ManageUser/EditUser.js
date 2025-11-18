/* eslint-disable no-unused-vars */
import { Form, Input, Button, AutoComplete, Typography, Row, Col, Flex, Select, Switch } from "antd";
import React, { useState } from "react";
import { useUserContext } from "Hooks/UserContext";
import { useEffect } from "react";
import { Paths } from "Router/Paths";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { PermissionAction, snackBarSuccessConf, RULES_MESSAGES } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { actionsPermissionValidator } from "Helpers/ats.helper";

export default function EditUser() {
    const [form] = Form.useForm();
    const params = useParams()
    const { setBreadCrumb } = useUserContext();
    const { apiService } = useServices();
    // const queryClient = useQueryClient();
    const navigate = useNavigate()
    const queryClient = useQueryClient();
    const [roleOptionsList, setRoleOptionsList] = useState([])


    const onFinish = (value) => {

        let tempObj = { ...value, "user_status": value?.user_status ? "active" : "inactive" }
        delete tempObj.user_phone_number
        mutate(tempObj)
    };

    // UseMutation hook for deleting user data via API
    const { refetch: fetchAllRoles, isLoading: rolesLoading } = useQuery(
        "deleteRoleData", // Unique mutation key for tracking in the query client
        // Mutation function to handle the API call for deleting user data
        () => apiService.getAllRoles(),
        {
            // Configuration options for the mutation
            onSuccess: (response) => {
                if (response) {
                    let optionsRole = (response?.data || [])?.map((item) => {
                        return {
                            label: item?.role_name,
                            value: item?.role_id
                        }
                    })
                    setRoleOptionsList(optionsRole)
                }
                // Invalidate the "fetchRoleData" query in the query client to trigger a refetch
                // queryClient.invalidateQueries("fetchRoleData");
            },
            onError: (error) => {
                // Handle errors by displaying an error Snackbar notification
                // enqueueSnackbar(error.message, snackBarErrorConf);
            }
        }
    );


    // UseMutation hook for creating new user
    const { refetch: fetchSingleUserData, isLoading: singleUserDataLoading } = useQuery(
        "getSingleUserData", // Unique mutation key for tracking in the query client
        // Mutation function to handle the API call for deleting user data
        () => apiService.getSingleUserDetails(params.id),
        {
            // Configuration options for the mutation
            onSuccess: (response) => {
                // Display a success Snackbar notification with the API response message
                if (response.data) {
                    const { user_name, user_phone_number, user_email, role_id, user_status } = response.data
                    form.setFieldValue('user_name', user_name)
                    form.setFieldValue('user_phone_number', user_phone_number)
                    form.setFieldValue('user_email', user_email)
                    form.setFieldValue('user_role', role_id)
                    form.setFieldValue('user_status', user_status == "active" ? true : false)
                }
            },
            onError: (error) => {
                // Handle errors by displaying an error Snackbar notification
            }
        }
    );


    // UseMutation hook for creating new user
    const { mutate, isLoading } = useMutation(
        "updateUser", // Unique mutation key for tracking in the query client
        // Mutation function to handle the API call for deleting user data
        (data) => apiService.updateUser(params.id, data),
        {
            // Configuration options for the mutation
            onSuccess: (response) => {

                // Display a success Snackbar notification with the API response message
                if (response) {
                    enqueueSnackbar(response.message, snackBarSuccessConf);
                    navigate(`/${Paths.manageUser}`)
                    // Invalidate the "fetchRoleData" query in the query client to trigger a refetch
                    queryClient.invalidateQueries("fetchUserData");
                }
            },
            onError: (error) => {

                // Handle errors by displaying an error Snackbar notification
            }
        }
    );

    /**
       * UseEffect function to set breadcrumb
       */
    useEffect(() => {
        setBreadCrumb({
            title: "Manage Users",
            icon: "category",
            titlePath: Paths.manageUser,
            subtitle: "Edit User",
            path: Paths.addUsers
        });

        actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)
            ? fetchSingleUserData()
            : navigate("/", { state: { from: null }, replace: true });

        fetchAllRoles()
    }, []);


    return actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ? (
        <>

            <Typography.Title level={5}>Edit User</Typography.Title>
            <Form name="form_item_path" layout="vertical" form={form} onFinish={onFinish}>
                <Row gutter={30}>
                    <Col className="gutter-row" span={12}>
                        <Form.Item name="user_name" label="First Name"
                            rules={[
                                { required: true, whitespace: true, message: "First name is required" },
                                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE, },
                                { pattern: /^[a-zA-Z ]+$/, message: 'Please enter a valid name' },
                                {
                                    pattern: /^.{1,35}$/,
                                    message: 'The value must be between 1 and 35 characters long.'
                                },
                                {
                                    pattern: /^(?!.*\s{2,}).*$/,
                                    message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                                }
                            ]}>
                            <Input size="large" placeholder="Enter First Name" />
                        </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Form.Item name="user_email" label="Email" rules={[{ required: true, whitespace: true, message: "Email is required" }, { type: 'email', message: 'Please enter a valid email address!', }]}>
                            <Input size="large" placeholder="Enter Email" />
                        </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Form.Item type='number' name="user_phone_number" label="Mobile Number" rules={[{ required: true, whitespace: true, message: "Mobile number is required" }]}>
                            <Input maxLength={10} size="large" placeholder="Mobile Number" disabled />
                        </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Form.Item name="user_role" label="Roles" rules={[{ required: true, message: "Role is required" }]}>
                            <Select
                                size="large"
                                allowClear
                                showSearch
                                placeholder="Select Roles"
                                options={roleOptionsList}
                                disabled={rolesLoading}
                                filterOption={(input, option) =>
                                    (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={6}>
                        <Form.Item
                            name="user_status"
                            label="Status"
                        >
                            <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={24}>
                        <Flex style={{ width: '100%' }} justify={'flex-end'} align={'flex-end'}>
                            <NavLink to={"/" + Paths.manageUser}>
                                <Button disabled={isLoading} style={{ marginRight: "10px" }}>Cancel</Button>
                            </NavLink>
                            <Button type="primary" htmlType="submit"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Update
                            </Button>
                        </Flex>
                    </Col>
                </Row>
            </Form>
        </>
    ) : <></>;
}
