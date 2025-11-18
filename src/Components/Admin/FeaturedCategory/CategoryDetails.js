import { CloudUploadOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Form, Input, Row, Skeleton, Switch, theme, Upload } from "antd";
import RichEditor from "Components/Shared/richEditor";
import { ALLOWED_FILE_TYPES, RULES_MESSAGES, snackBarSuccessConf } from "Helpers/ats.constants";
import { imagePath, validateFileSize } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

// Category Details Modal
const CategoryDetails = (props) => {
  const { id, setShowModal, modalData } = props;
  const { apiService } = useServices();

  const [form] = Form.useForm();
  const [description, setDescription] = useState(""); // text editor state
  const [loading, setLoading] = useState(false);
  const [featuredCategoryImage, setFeaturedCategoryImage] = useState();
  const [featuredCategoryImageId, setFeaturedCategoryImageId] = useState();
  const queryClient = useQueryClient();

  const {
    token: { colorText }
  } = theme.useToken();

  const getData = () => {
    try {
      const {
        data: {
          category_name,
          category_body: categorydescription,
          category_status,
          is_square,
          show_on_web,
          show_on_app,
          original_category_name
        }
      } = modalData; // destructring single category data

      form.setFieldValue("category_name", category_name);
      form.setFieldValue("category_status", category_status == "active" ? true : false);
      form.setFieldValue("is_square", is_square || false);
      form.setFieldValue("show_on_web", show_on_web);
      form.setFieldValue("show_on_app", show_on_app);
      form.setFieldValue("description", categorydescription);
      form.setFieldValue("old_category_name", original_category_name);

      setDescription(categorydescription);

      setFeaturedCategoryImage(imagePath(modalData?.data?.image));
      setFeaturedCategoryImageId(modalData?.data?.image?.attachment_id);
    } catch (error) {}
  };

  useEffect(() => {
    getData(); // functioncall to set form-data
  }, []);

  // handle description change
  const handleDescription = (value) => {
    try {
      setDescription(value);
      form.setFieldsValue({ description: value });
    } catch (error) {}
  };

  const onFinish = (value) => {
    try {
      let formData = new FormData();
      formData.append("category_id", id);
      formData.append("category_name", value?.category_name);

      if (description) {
        formData.append("description", value.description);
      }

      formData.append("category_status", value?.category_status ? "active" : "inactive");
      formData.append("is_square", value?.is_square || false);
      formData.append("show_on_web", value?.show_on_web);
      formData.append("show_on_app", value?.show_on_app);
      // Handle image
      if (value?.category_image?.file && featuredCategoryImage) {
        formData.append("category_image", value?.category_image?.file);
      }
      if (featuredCategoryImageId) {
        formData.append("category_image_id", featuredCategoryImageId);
      }
      mutate(formData);
    } catch (error) {}
  };

  // UseMutation hook for creating a new Category via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Category
    (data) => apiService.updatetSingleFeaturedCategoryData(id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        queryClient.invalidateQueries("getotherCategoryList");
        queryClient.invalidateQueries("getFetauredCategoryList");
        handleCancel();
      },
      onError: (error) => {
        //
      }
    }
  );

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const handleChange = (info, type) => {
    // Varify the size of file
    if (!validateFileSize(info.file)) {
      if (type === "category") {
        form.setFieldValue("category_image", null);
      }

      return false;
    }

    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        setLoading(false);
        setFeaturedCategoryImage(url);
      });
    }
  };
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    uploadBtnStyle: {
      border: 0,
      background: "none"
    },
    cloudIconStyle: {
      fontSize: "1.5rem",
      color: colorText
    },
    uploadLoadingStyle: {
      marginTop: 8,
      color: colorText
    },
    categoryStyle: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    }
  };

  const uploadButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      {loading ? (
        <Skeleton.Image active={loading} />
      ) : (
        <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
      )}
      {!loading && <div style={StyleSheet.uploadLoadingStyle}>Upload</div>}
    </button>
  );

  // Function to remove the uploaded image
  const handleImgRemove = () => {
    if (featuredCategoryImage) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(featuredCategoryImage);
      setFeaturedCategoryImage(null); // Clear the image state
      form.setFieldValue("category_image", null);
    }
  };

  const handleCancel = () => {
    try {
      setShowModal(false);
      form.resetFields();
      queryClient.invalidateQueries("fetchCategoryData");
    } catch (error) {}
  };

  return (
    <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={[20, 10]}>
        <Col className="gutter-row" span={4}>
          <div style={{ position: "relative" }}>
            <Form.Item
              name="category_image"
              label="Category Image"
              extra="Allowed formats: JPEG, PNG (Max size: 2MB)">
              <Upload
                name="category_image"
                listType="picture-card"
                className="avatar-uploader"
                accept={ALLOWED_FILE_TYPES}
                showUploadList={false}
                maxCount={1}
                beforeUpload={() => false}
                onChange={(e) => handleChange(e, "category")}>
                {featuredCategoryImage ? (
                  <img
                    src={featuredCategoryImage}
                    alt="category"
                    style={StyleSheet.categoryStyle}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
            {featuredCategoryImage && (
              <div className="cover_delete" type="text" onClick={handleImgRemove}>
                <DeleteOutlined />
              </div>
            )}
          </div>
        </Col>
        <Col className="gutter-row" span={20}>
          <Flex>
            <Col span={12} className="gutter-row">
              <Form.Item name="old_category_name" label="Category Name">
                <Input placeholder="Category Name" size="large" disabled />
              </Form.Item>
            </Col>
            <Col span={12} className="gutter-row">
              <Form.Item
                name="category_name"
                label="New Category Name"
                rules={[
                  { required: true, message: "Category is required" },
                  { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                  {
                    pattern: /^.{3,50}$/,
                    message: "The value must be between 3 and 50 characters long."
                  },
                  {
                    pattern: /^(?!.*\s{2,}).*$/,
                    message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                  }
                ]}
                tooltip={{
                  title: "This will not affect original category name.",
                  icon: <InfoCircleOutlined />
                }}>
                <Input placeholder="Enter Category Name" size="large" en />
              </Form.Item>
            </Col>
          </Flex>
          <Col className="gutter-row" span={24}>
            <Form.Item name="description" label="Description">
              <RichEditor
                name="description"
                placeholder="Enter Description Here"
                description={description}
                handleDescription={handleDescription}
              />
            </Form.Item>
          </Col>
          <Flex>
            <Col className="gutter-row" span={6}>
              <Form.Item name="category_status" label="Status">
                <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
            {/* <Col className="gutter-row" span={6}>
              <Form.Item name="is_square" label="Is Square">
                <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col> */}

            <Col className="gutter-row" span={6}>
              <Form.Item name="show_on_web" label="Show on Web">
                <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={6}>
              <Form.Item name="show_on_app" label="Show on App">
                <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Flex>
        </Col>
        <Col span={24}>
          <Flex align="start" justify={"flex-end"}>
            <Button
              style={StyleSheet.backBtnStyle}
              disabled={isLoading}
              onClick={() => handleCancel()}>
              Cancel
            </Button>

            {/* {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
              <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
                Update
              </Button>
            )} */}

            <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
              Update
            </Button>
          </Flex>
        </Col>
      </Row>
    </Form>
  );
};

export default CategoryDetails;
