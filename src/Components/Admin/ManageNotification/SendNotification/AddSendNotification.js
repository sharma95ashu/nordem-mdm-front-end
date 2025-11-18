import RichEditor from "Components/Shared/richEditor";
import { EyeOutlined } from "@ant-design/icons";
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
import { Button, Col, Flex, Form, Input, Modal, Row, Typography, Radio } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { NavLink, useNavigate } from "react-router-dom";

import NotificationUpload from "./xlsx_upload/NotificationUpload";
import NotificationProgressCount from "./xlsx_upload/NotificationProgressCount";


export default function AddSendNotification() {

    const { setBreadCrumb } = useUserContext();
    const { apiService } = useServices();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [linkImg, setLinkImg] = useState(false);
    const [description, setDescription] = useState("");
    const [abList, setAbList] = useState(false);
    const [percentageCountLoading, setPercentageCountLoading] = useState(false)
    const [uploadFile, setUploadFile] = useState();
    const [validFileCheck, setValidFileCheck] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    /***
     * styles
     */
    const StyleSheet = {
        backBtnStyle: {
            marginRight: "10px"
        },
    };

    /**
     * Function to submit form data
     * @param {*} value
     */

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };


    const onFinish = (value) => {

        let formData = new FormData();

        formData.append("notification_title", value?.notification_title);

        formData.append("notification_description", value?.notification_description);

        if (value.notification_image_url) {
            formData.append("notification_image_url", value?.notification_image_url);
        }

        formData.append("notification_type", value?.notification_type);

        if (uploadFile) {
            formData.append("notification_excel", uploadFile);
        }

        let obj = { load: formData };
        mutate(obj);
    };


    // UseMutation hook for creating a new user via API
    const { mutate, isLoading } = useMutation(
        // Mutation function to handle the API call for creating a new user
        (data) => apiService.createSendNotification(data.load, true),
        {

            // Configuration options for the mutation
            onSuccess: (data) => {

                if (data.success) {
                    // Display a success Snackbar notification with the API response message
                    enqueueSnackbar(data.message, snackBarSuccessConf);

                    // Navigate to the current window pathname after removing a specified portion
                    navigate(`/${Paths.sendNotificationList}`);

                    // Invalidate the "getAllRoles" query in the query client to trigger a refetch
                    queryClient.invalidateQueries("fetchSendNotificationData");
                }

            },
            onError: (error) => {

                // Handle errors by displaying an error Snackbar notification
                enqueueSnackbar(error.message, snackBarErrorConf);
            }
        }
    );


    /**
   *  Description validation
   */
    const handleDescription = (value) => {
        setDescription(value);
        form.setFieldValue("notification_description", value);
    };

    const handleLinkChange = (e) => {
        setLinkImg(e.target.value);
    }


    // Validating image URL 
    const validateURLRegex = (rule, value) => {

        const regex = /\b(?:www\.)?\S+\.\S+\b/;

        if (value && !regex.test(value)) {
            setShowPreview(true);
            return Promise.reject('Enter valid url');
        }

        if (value == "") {
            setShowPreview(true);
        } else {
            setShowPreview(false);
        }

        return Promise.resolve();
    };


    // tabing for form 
    const handleTab = (value) => {

        let data = value.target.value;

        form.setFieldValue('notification_type', data)

        if (data === "associate_buyers") {
            setAbList(true);
        } else {
            setAbList(false);
        }
    }

    /**
     * useEffect function to set breadCrumb data
     */
    useEffect(() => {
        actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
            ? ""
            : navigate("/", { state: { from: null }, replace: true });

        setBreadCrumb({
            title: "Send Notification",
            icon: "manageNotification",
            titlePath: Paths.sendNotificationList,
            subtitle: "Send New",
            path: Paths.users
        });
    }, []);


    return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
        <>
            <Typography.Title level={5}>Send New Notification</Typography.Title>

            <Form initialValues={{ notification_type: 'all_device' }} form={form} layout="vertical" onFinish={onFinish}>

                <Form.Item name="notification_type">
                    <Radio.Group onChange={(e) => handleTab(e)} size="large" value={abList ? "associate_buyers" : "all_device"}>
                        <Radio.Button value="all_device">All Devices</Radio.Button>
                        <Radio.Button value="associate_buyers">Upload Associate Buyer List</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Row gutter={[24, 0]}>
                    {abList && (
                        <Col span={24}>

                            <NotificationUpload
                                uploadFile={uploadFile}
                                setUploadFile={setUploadFile}
                                setPercentageCountLoading={setPercentageCountLoading}
                                validFileCheck={validFileCheck}
                                setValidFileCheck={setValidFileCheck}
                            />

                        </Col>
                    )}

                    <Col span={24}>
                        <Form.Item
                            name="notification_title"
                            label="Title"
                            whitespace={false}
                            rules={[
                                { required: true, whitespace: true, message: "Title is required" },
                                {
                                    pattern: /^.{2,50}$/,
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
                            <Input placeholder="Enter Title" size="large" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            rules={[
                                { required: true, message: "Description is required" },
                            ]}
                            name="notification_description" label="Description">
                            <RichEditor
                                placeholder="Enter Description Here"
                                description={description}
                                handleDescription={handleDescription}
                            />
                        </Form.Item>
                    </Col>

                    <Col flex="auto">
                        <Form.Item
                            name="notification_image_url"
                            label="Image URL"
                            whitespace={false}
                            rules={[
                                {
                                    pattern: /^\S*$/,
                                    message: "Enter valid URL"
                                },
                                { validator: validateURLRegex }
                            ]}>
                            <Input onChange={(e) => handleLinkChange(e)} placeholder="Enter Image URL" size="large" />
                        </Form.Item>
                    </Col>
                    <Col flex="150px">
                        <Form.Item label=" ">
                            <Button disabled={showPreview} size="large" onClick={showModal} type="link"><EyeOutlined /> Show Preview</Button>
                        </Form.Item>
                    </Col>
                </Row>

                <Flex align="start" justify={"flex-end"}>
                    <NavLink to={"/" + Paths.sendNotificationList}>
                        <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>Cancel</Button>
                    </NavLink>
                    {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                        <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading || validFileCheck}>
                            Send Now
                        </Button>
                    )}
                </Flex>

            </Form >

            <Modal title="Preview"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <img className="img-res" src={linkImg} />
            </Modal>

            {
                percentageCountLoading ?
                    <Modal
                        title="Upload Progress"
                        centered
                        open={true}
                        closable={false}
                        width={700}
                        footer={false}
                    >
                        <>
                            <Flex justify="center" align="middle" style={{ height: '100%' }}>
                                <NotificationProgressCount setPercentageCountLoading={setPercentageCountLoading} />
                            </Flex>
                        </>
                    </Modal> : <></>
            }

        </>
    ) : (
        <></>
    );
}