import React, { useState } from "react";
import { Upload, Skeleton, Typography } from "antd";
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { getBase64 } from "Helpers/functions";
import { imageCompress, validateFileSize } from "Helpers/ats.helper";

const ImageUploader = ({ label, value, onChange, rules, extra }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value);

  const handleChange = async (info) => {
    setLoading(true);

    if (!validateFileSize(info.file)) {
      onChange(null, null);
      setLoading(false);
      return false;
    }
    if (info.file) {
      const selectedFile = info.file;
      const result = await imageCompress(selectedFile);
      getBase64(info.file, (url) => {
        setLoading(false);
        setImageUrl(url);
        onChange(url, result); // Update the parent form state
      });
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    onChange(null); // Clear the parent form state
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? (
        <Skeleton.Image active={loading} />
      ) : (
        <CloudUploadOutlined style={{ fontSize: "1.5rem" }} />
      )}
      {!loading && (
        <div>
          <Typography.Text className="removeMargin" style={{ fontSize: "14px" }}>
            Upload File
          </Typography.Text>
          <br />
          <Typography.Text type="secondary">
            (in .jpg, .jpeg, .png & Max File Size : 2MB)
          </Typography.Text>
        </div>
      )}
    </button>
  );

  return (
    <>
      <Upload
        name="image"
        listType="picture-card"
        className="avatar-uploader"
        accept=".jpg,.jpeg,.png"
        extra={<>()</>}
        showUploadList={false}
        beforeUpload={() => false}
        style={{ position: "relative" }}
        onChange={handleChange}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="uploaded"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          uploadButton
        )}
      </Upload>
      {imageUrl && (
        <div className="cover_delete" style={{ top: "0px" }} onClick={handleRemove}>
          <DeleteOutlined />
        </div>
      )}
      {extra && <div style={{ marginTop: 8 }}>{extra}</div>}
    </>
  );
};

export default ImageUploader;
