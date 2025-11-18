import { Button, Col, Flex, Form, Image, message, Row, Switch, Typography } from "antd";
import React, { useState } from "react";
import { CopyOutlined, FullscreenOutlined } from "@ant-design/icons";
import { renderColumnData } from "Helpers/ats.helper";
import { FALL_BACK } from "Helpers/ats.constants";

const { Text } = Typography;

const ImageTextDetails = ({
  ColumnData,
  title,
  document,
  copyIcon,
  moduleType,
  handleStatusToggleChange
}) => {
  const [visible, setVisible] = useState(false);

  const StyleSheet = {
    heading: {
      color: "#1755A6"
    },
    imageContainer: {
      padding: "24px 24px",
      borderRadius: "8px",
      border: "2px dotted #D9D9D9",
      backgroundColor: "#F5F5F5",
      position: "relative",
      maxHeight: "400px"
    },
    imageFile: {
      borderRadius: "8px",
      maxHeight: "348px"
    },
    fullscreenOutlinedStyle: {
      position: "absolute",
      top: "16px",
      right: "16px",
      fontSize: "22px",
      color: "#ffffff",
      backgroundColor: "#737373",
      padding: "8px",
      borderRadius: "50%",
      cursor: "pointer"
    }
  };

  const handleCopyDetails = () => {
    if (!navigator.clipboard) {
      message.error("Copy to clicpboard is not supported in this browser.");
      return;
    }

    // Get the text content from the div
    const textToCopy = window.document.getElementById(`Section__${title}`)?.innerText;

    // Copy the text to the clipboard
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={14}>
        <Flex vertical gap={12}>
          <Flex gap={10} align="center">
            <Text strong style={StyleSheet.heading}>
              {" "}
              {title}{" "}
            </Text>
            {copyIcon && <Button icon={<CopyOutlined />} onClick={handleCopyDetails} />}
          </Flex>
          <Flex gap={10}>
            <div></div>
            <Row gutter={[20, 16]} className="fullWidth" id={`Section__${title}`}>
              {Object.values(ColumnData || {})?.length > 0 &&
                Object.entries(ColumnData || {}).map(([key, value], index) => {
                  return (
                    <Col key={index} span={value?.span || 12}>
                      <Flex vertical gap={2}>
                        <Text type="secondary"> {renderColumnData(key?.toString())} </Text>
                        <Text> {renderColumnData(value) || "N/A"} </Text>
                      </Flex>
                    </Col>
                  );
                })}
              {moduleType == "bank-update-request" && (
                <Col span={24}>
                  <Form.Item name="status" label="Request Status" required>
                    <Switch
                      size="large"
                      checkedChildren="Approve "
                      unCheckedChildren="Reject"
                      onChange={handleStatusToggleChange}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Flex>
        </Flex>
      </Col>
      <Col xs={24} md={10}>
        {document && (
          <Flex 
          style={{ flexDirection: Array.isArray(document) ? 'row' : 'column' }}
          gap={12}>
            {Array.isArray(document) ? (
              document.map((doc, index) => (
                <div key={index}>
                  {doc.type && <Text type="secondary">{doc.type}</Text>}
                  {doc.src && (
                    <div style={StyleSheet.imageContainer}>
                      <Flex justify="center" align="center" className="height_full">
                        <Image
                          preview={{
                            visible,
                            mask: false,
                            src: doc.src,
                            onVisibleChange: (value) => {
                              setVisible(value);
                            }
                          }}
                          fallback={FALL_BACK}
                          src={doc.src}
                          style={StyleSheet.imageFile}
                        />
                      </Flex>
                      <FullscreenOutlined
                        style={StyleSheet.fullscreenOutlinedStyle}
                        onClick={() => setVisible(true)}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              // If it's a single document (object)
              <>
                {document.type && <Text type="secondary">{document.type}</Text>}
                {document.src && (
                  <div style={StyleSheet.imageContainer}>
                    <Flex justify="center" align="center" className="height_full">
                      <Image
                        preview={{
                          visible,
                          mask: false,
                          src: document.src,
                          onVisibleChange: (value) => {
                            setVisible(value);
                          }
                        }}
                        fallback={FALL_BACK}
                        src={document.src}
                        style={StyleSheet.imageFile}
                      />
                    </Flex>
                    <FullscreenOutlined
                      style={StyleSheet.fullscreenOutlinedStyle}
                      onClick={() => setVisible(true)}
                    />
                  </div>
                )}
              </>
            )}
          </Flex>
        )}
      </Col>
    </Row>
  );
};

export default ImageTextDetails;
