/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { Form, Image, Input, Modal, Skeleton, Switch, Upload } from "antd";
import { ALLOWED_FILE_TYPES, FALL_BACK } from "Helpers/ats.constants";
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { linkValidation, validateVideoFileSize } from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";

function TestimonialModal(props) {
  const {
    setIsModalOpen,
    form,
    StyleSheet,
    bannerStyle,
    getBase64,
    onTestimonialFinish,
    isEditing,
    editingRecord
  } = props;

  const [loadingBanner, setLoadingBanner] = useState(false);
  const [bannerImage, setBannerImage] = useState();
  /**
   * Function to find type and show loader and upload file accordingly
   * @param {*} info
   * @param {*} type
   * @returns
   */
  const handleChange = (info, type) => {
    // Varify the size of file
    if (!validateVideoFileSize(info.file)) {
      if (type === "banner") {
        form.setFieldValue("category_banner", null);
      }

      return false;
    }

    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        if (type === "banner") {
          setLoadingBanner(false);
          setBannerImage(url);
        }
      });
    }
  };

  // Function to remove the uploaded banner image
  const handleBannerRemove = () => {
    if (bannerImage) {
      setBannerImage(null);
    }
  };
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        var arr = [];
        // Edit existing record
        arr.push({
          testimonialType: "media",
          displayOrder: values.displayOrder,
          url: values.url,
          content: form.getFieldValue("category_banner")?.file,
          data: values.testimonialType === "url" ? values.url : bannerImage,
          active: values?.active,
          ...(editingRecord?.attachment_id ? { attachment_id: editingRecord.attachment_id } : {})
        });

        onTestimonialFinish(arr, editingRecord?.testimonial_id);
        setIsModalOpen(false);
        form.resetFields();
      })
      .catch((info) => {
        //
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    if (isEditing) {
      var img = getFullImageUrl(editingRecord?.file_path);
      setBannerImage(img);
    }
  }, [isEditing]);

  /**
   * Update Banner Button UI
   */

  const uploadBannerButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      {loadingBanner ? (
        <Skeleton.Image active={loadingBanner} />
      ) : (
        <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
      )}
      {!loadingBanner && <div style={StyleSheet.uploadLoadingStyle}>Upload</div>}
    </button>
  );
  return (
    <Modal
      title={isEditing ? "Edit Testimonial" : "Add Testimonial"}
      width={750}
      open={true}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isEditing ? "Update" : "Save"}
      cancelText="Cancel">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          testimonialType: "url"
        }}>
        <div style={StyleSheet.uploadBoxStyle}>
          <Form.Item
            name="category_banner"
            label="Thumbnail Image"
            extra="Allowed formats: JPEG, PNG | Maximum size: 2 MB | Resolution: 1528 x 720 px">
            <Upload
              name="category_banner"
              listType="picture-card"
              className="avatar-uploader"
              accept={ALLOWED_FILE_TYPES}
              showUploadList={false}
              maxCount={1}
              beforeUpload={() => false}
              onChange={(e) => handleChange(e, "banner")}>
              {bannerImage ? (
                <Image src={bannerImage} alt="Banner" style={bannerStyle} fallback={FALL_BACK} />
              ) : (
                uploadBannerButton
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { validator: linkValidation },
              {
                required: true,
                message: "Please enter URL!"
              }
            ]}>
            <Input placeholder="Enter URL" />
          </Form.Item>
          <Form.Item
            name="displayOrder"
            label="Display Order"
            type="number"
            rules={[
              { required: true, message: "Please enter display order!" },
              {
                pattern: /^\d+$/,
                message: "Only integer values are allowed"
              }
            ]}>
            <Input placeholder="Enter Display Number" min={0} className="fullWidth" type="number" />
          </Form.Item>

          {bannerImage && (
            <div className="cover_delete" type="text" onClick={handleBannerRemove}>
              <DeleteOutlined />
            </div>
          )}
        </div>

        <Form.Item name="active" label="Status">
          <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default TestimonialModal;
