import { CloudUploadOutlined } from "@ant-design/icons";
import { Flex, Skeleton } from "antd";
import Typography from "antd/es/typography/Typography";

export const UploadButton = ({ loading, photo }) => (
  <button type="button" className="upload-btn">
    {loading ? (
      <Skeleton.Image
        active
        className="upload-image-loader kycskeletonImage"
        size={"large"}
        block={true}
      />
    ) : (
      <CloudUploadOutlined className="upload-icon KUPIS" />
    )}
    <br />
    {photo ? (
      "File is uploaded."
    ) : (
      <>
        {!loading && (
          <>
            <Flex className="fullWidth">
              <Typography.Text className="fullWidth">
                Upload File
                <br />
                <Typography.Text type="secondary" className="kTSYL fullWidth">
                  {" "}
                  (in .jpg, .jpeg, .png & Max File Size : 5MB){" "}
                </Typography.Text>
              </Typography.Text>
            </Flex>
          </>
        )}
      </>
    )}
  </button>
);
