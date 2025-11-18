/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import RichEditor from "Components/Shared/richEditor";
import { EyeOutlined } from "@ant-design/icons";
import { PermissionAction, snackBarErrorConf, RULES_MESSAGES } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Modal, Row, Typography, Radio, Table } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { getFullImageUrl } from "Helpers/functions";

export default function ViewSendNotification() {
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkImg, setLinkImg] = useState(false);
  const [description, setDescription] = useState("");
  const [abList, setAbList] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const params = useParams();

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  /***
   * styles
   */
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    tableStyle: {
      marginBottom: "10px"
    }
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

  /**
   *  Description validation
   */
  const handleDescription = (value) => {
    setDescription(value);
    form.setFieldValue("notification_description", value);
  };

  const handleLinkChange = (e) => {
    setLinkImg(e.target.value);
  };

  // Fetching Excel Data
  const fetchExcelData = async (value) => {
    try {
      const response = await fetch(getFullImageUrl(value));

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const newColumns = jsonData[0].map((col) => ({
        title: col,
        dataIndex: col,
        key: col
      }));

      const newData = jsonData
        .slice(1)
        .map((row, index) => {
          const rowData = {};
          newColumns.forEach((col, i) => {
            rowData[col.dataIndex] = row[i];
          });
          rowData.key = index;

          return rowData;
        })
        .filter((row) => {
          // Filter out rows with empty or undefined 'AB Number'
          return (
            Object.values(row).some((value) => value !== "" && value !== undefined) &&
            row["AB Number"] !== undefined
          );
        });

      setColumns(newColumns);
      setData(newData);
    } catch (error) {
      console.error("Error fetching Excel file:", error);
    }
  };

  // UseQuery hook for fetching data of a single user from the API
  const { refetch } = useQuery(
    "getSingleSendNotification",

    // Function to fetch data of a single user using apiService.getRequest
    () => apiService.getRequest(`/send_notification_list/${params.id}`),
    {
      // Configuration options
      enabled: false, //disable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data
        form.setFieldValue("notification_title", data?.data?.notification_title);
        form.setFieldValue(
          "notification_descriptiondownload_url",
          data?.data?.notification_description
        );
        form.setFieldValue("notification_image_url", data?.data?.notification_image_url);
        form.setFieldValue("notification_type", data?.data?.notification_type);
        setDescription(data?.data?.notification_description);

        fetchExcelData(data?.data?.file_path);

        if (data?.data?.notification_type === "associate_buyers") {
          setAbList(true);
        } else {
          setAbList(false);
        }

        if (data?.data?.notification_image_url) {
          setShowPreview(false);
          setLinkImg(data?.data?.notification_image_url);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // tabing for form
  const handleTab = (value) => {
    let data = value.target.value;

    form.setFieldValue("notification_type", data);

    if (data === "associate_buyers") {
      setAbList(true);
    } else {
      setAbList(false);
    }
  };

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
    // fetchExcelData()
    setBreadCrumb({
      title: "Send Notification",
      icon: "manageNotification",
      titlePath: Paths.sendNotificationList,
      subtitle: "View Notification",
      path: Paths.users
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Typography.Title level={5}>Send New Notification</Typography.Title>

      <Form form={form} layout="vertical">
        <Form.Item name="notification_type">
          <Radio.Group
            disabled={true}
            onChange={(e) => handleTab(e)}
            size="large"
            value={abList ? "associate_buyers" : "all_device"}>
            <Radio.Button value="all_device">All Devices</Radio.Button>
            <Radio.Button value="associate_buyers">Upload Associate Buyer List</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Row gutter={[24, 0]}>
          {abList && (
            <Col span={24}>
              <Table
                style={StyleSheet.tableStyle}
                columns={columns}
                dataSource={data}
                bordered={true}
                scroll={{ x: "max-content" }}
                pagination={{
                  total: data.length, // Total number of data items
                  defaultCurrent: 1, // Default initial page number
                  showSizeChanger: true, // Option to change page size
                  showQuickJumper: true, // Option to jump to a specific page
                  pageSizeOptions: ["5", "10", "20"],
                  defaultPageSize: 5,
                  showTotal: (total) => `Total ${total} items` // Custom function to show total count
                }}
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
              <Input disabled={true} placeholder="Enter Title" size="large" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              className="edit_disabled_text"
              rules={[{ required: true, message: "Description is required" }]}
              name="notification_description"
              label="Description">
              <RichEditor
                disabled={true}
                placeholder="Enter Description Here"
                description={description}
                handleDescription={handleDescription}
              />
              <div className="edit_disabled_cover"></div>
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
                }
              ]}>
              <Input
                disabled={true}
                onChange={(e) => handleLinkChange(e)}
                placeholder="Enter Image URL"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col flex="150px">
            <Form.Item label=" ">
              <Button disabled={showPreview} size="large" onClick={showModal} type="link">
                <EyeOutlined /> Show Preview
              </Button>
            </Form.Item>
          </Col>
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.sendNotificationList}>
            <Button style={StyleSheet.backBtnStyle}>Cancel</Button>
          </NavLink>
        </Flex>
      </Form>

      <Modal
        title="Preview"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}>
        <img className="img-res" src={linkImg} />
      </Modal>
    </>
  ) : (
    <></>
  );
}
