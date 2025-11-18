import {
    PermissionAction,
    snackBarErrorConf,
    snackBarSuccessConf,
    RULES_MESSAGES
} from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Row, Switch, Typography } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import { NavLink, useNavigate } from "react-router-dom";

export default function AddNotificationCategory() {

    const { setBreadCrumb } = useUserContext();
    const { apiService } = useServices();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    /***
     * styles
     */
    const StyleSheet = {
        backBtnStyle: {
            marginRight: "10px"
        }
    };

    /**
     * Function to submit form data
     * @param {*} value
     */

    const onFinish = (value) => {

        let data = value;

        data.status = data.status ? "active" : "inactive";

        let obj = { load: data };

        // Initiate the user creation process by triggering the mutate function
        mutate(obj);
    };

    // UseMutation hook for creating a new user via API
    const { mutate, isLoading } = useMutation(
        // Mutation function to handle the API call for creating a new user
        (data) => apiService.createNotificationCategory(data.load),
        {
            // Configuration options for the mutation
            onSuccess: (data) => {

                if (data.success) {
                    // Display a success Snackbar notification with the API response message
                    enqueueSnackbar(data.message, snackBarSuccessConf);

                    // Navigate to the current window pathname after removing a specified portion
                    navigate(`/${Paths.notificationCategoryList}`);

                    // Invalidate the "getAllRoles" query in the query client to trigger a refetch
                    queryClient.invalidateQueries("fetchNotificationCategoryData");
                }

            },
            onError: (error) => {
                // Handle errors by displaying an error Snackbar notification
                enqueueSnackbar(error.message, snackBarErrorConf);
            }
        }
    );


    /**
     * useEffect function to set breadCrumb data
     */
    useEffect(() => {
        actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
            ? ""
            : navigate("/", { state: { from: null }, replace: true });
        form.setFieldValue("status", true);
        setBreadCrumb({
            title: "Notification Category",
            icon: "manageNotification",
            titlePath: Paths.notificationCategoryList,
            subtitle: "Add New",
            path: Paths.users
        });
    }, []);
    return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
        <>
            <Typography.Title level={5}>Add New Category</Typography.Title>
            <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={[24, 24]}>
                    <Col flex={'560px'}>
                        <Form.Item
                            name="notification_category_name"
                            label="Category Name"
                            whitespace={false}
                            rules={[
                                { required: true, whitespace: true, message: "Category name is required" },
                                {
                                    pattern: /^.{1,50}$/,
                                    message: RULES_MESSAGES.MIN_MAX_LENGTH_MESSAGE
                                },
                                {
                                    pattern: /^\S(.*\S)?$/,
                                    message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
                                },
                                {
                                    pattern: /^(?!.*\s{2,}).*$/,
                                    message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                                }
                            ]}>
                            <Input placeholder="Enter Category Name" size="large" />
                        </Form.Item>
                    </Col>
                    <Col flex={'auto'}>
                        <Form.Item name="status" label="Status">
                            <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                    </Col>
                </Row>

                <Flex align="start" justify={"flex-end"}>
                    <NavLink to={"/" + Paths.notificationCategoryList}>
                        <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>Cancel</Button>
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