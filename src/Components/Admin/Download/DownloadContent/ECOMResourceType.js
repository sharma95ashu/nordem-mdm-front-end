import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Col, Form, Input, Select, Skeleton, Upload } from "antd";
import RichEditor from "Components/Shared/richEditor";
import { ALLOWED_FILE_TYPES, snackBarErrorConf } from "Helpers/ats.constants";
import { validateImageSize } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useQuery } from "react-query";

const ECOMResourceType = (props) => {
  const {
    form,
    thumbnailImagePreview,
    handleThumbnailImage,
    description,
    handleDescription,
    styleSheet: StyleSheet
  } = props;
  const { apiService } = useServices();
  const [loading, setLoading] = useState(false);
  const [downLoadCategoryList, setDownLoadCategoryList] = useState([]);
  const [downLoadLanguageList, setDownLoadLanguageList] = useState([]);
  const [contentTypeList, setContentTypeList] = useState([]);

  // useQuery hook for fetching categories list data
  useQuery(
    "getAllDownloadCategoriesForDropDown",
    () => apiService.getAllDownloadCategoriesForDropDown(),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          const tempList = data?.data?.map((item) => ({
            label: item?.download_category_name,
            value: item?.download_category_id
          }));
          setDownLoadCategoryList(tempList);
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // useQuery hook for fetching language list data
  useQuery(
    "getAllDownloadLanguagesForDropDown",
    () => apiService.getAllDownloadLanguagesForDropDown(),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          const tempList = data?.data?.map((item) => ({
            label: item?.language_name,
            value: item?.language_id
          }));
          setDownLoadLanguageList(tempList);
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // useQuery hook for fetching  content-type data
  useQuery("getAllContentTypeForDropDown", () => apiService.getAllContentTypeForDropDown(), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      if (data) {
        const tempList = data?.data?.map((item) => ({
          label: item?.content_type_name,
          value: item?.content_type_id
        }));
        setContentTypeList(tempList);
      }
    },
    onError: (error) => {
      // Handle errors by displaying an error Snackbar notification
      enqueueSnackbar(error.message, snackBarErrorConf);
    }
  });

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  // handle thumbnail image change
  const handleThumbnailImgChange = (info) => {
    try {
      // Varify the size of file
      if (!validateImageSize(info.file)) {
        form.setFieldValue("thumbnail_image", null);
        setLoading(false);
        return false;
      }

      if (info.file && info.fileList.length === 1) {
        // Get this url from response in real world.
        getBase64(info.fileList[0].originFileObj, (url) => {
          handleThumbnailImage(url);
        });
      }
    } catch (error) {
      console.log(error);
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

  // Function to remove the uploaded Category image
  const handlethumbnailImgRemove = () => {
    if (thumbnailImagePreview) {
      form.setFieldValue("thumbnail_image", null);
      handleThumbnailImage(null);
    }
  };
  return (
    <>
      <Col className="gutter-row" span={24}>
        <Form.Item
          name="description"
          label="Description"
          // rules={[{ required: true, message: `Description is required` }]}
        >
          <RichEditor
            name="description"
            placeholder="Enter Description Here"
            description={description}
            handleDescription={handleDescription}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="download_category_id"
          label="Download Category"
          rules={[{ required: true, message: "Download Category is required" }]}>
          <Select
            placeholder="Select Download Category"
            showSearch
            allowClear
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
            size="large"
            options={downLoadCategoryList}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="language_id"
          label="Download Language"
          rules={[{ required: true, message: "Download Language is required" }]}>
          <Select
            placeholder="Select Download Language"
            size="large"
            allowClear
            options={downLoadLanguageList}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="content_type_id"
          label="Download Content Type"
          rules={[{ required: true, message: "Download Content Type is required" }]}>
          <Select
            placeholder="Select Download Content Type"
            size="large"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
            options={contentTypeList}
          />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={12}>
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
          <Input placeholder="Enter Display Order" size="large" type="number" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <div style={StyleSheet.uploadBoxStyle}>
          <Form.Item
            name="thumbnail_image"
            label="Thubmnail Image"
            extra="Allowed formats: JPEG, PNG (Max size: 2MB)"
            rules={[{ required: true, message: `Thubmnail Image is required` }]}>
            <Upload
              name="thumbnail_image"
              listType="picture-card"
              className="avatar-uploader"
              accept={ALLOWED_FILE_TYPES}
              showUploadList={false}
              maxCount={1}
              beforeUpload={() => false}
              onChange={(e) => handleThumbnailImgChange(e)}>
              {thumbnailImagePreview ? (
                <img src={thumbnailImagePreview} alt="category" style={StyleSheet.categoryStyle} />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          {thumbnailImagePreview && (
            <div className="cover_delete" type="text" onClick={handlethumbnailImgRemove}>
              <DeleteOutlined />
            </div>
          )}
        </div>
      </Col>
    </>
  );
};

export default ECOMResourceType;
