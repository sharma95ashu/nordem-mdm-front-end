import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Image, Modal, Row, Typography } from "antd";
import React from "react";

const ConfirmationModal = ({
  handleConfirmation,
  loadingSubmission,
  handleModal,
  danger,
  cnfrmTnTitle,
  form,
  module,
  userDetails
}) => {
  const StyleSheet = {
    content: {
      backgroundColor: "#F5F5F5",
      borderRadius: "12px",
      padding: "16px",
      marginTop: "16px"
    },
    icon: {
      color: "#FA8C16",
      fontSize: "24px",
      marginTop: 4
    }
  };
  const handleConfirmationClick = () => {
    handleConfirmation();
  };

  return (
    <Modal
      className="modal"
      open={true}
      onCancel={() => {
        handleModal(false);
      }}
      footer={[
        <Button size="large" key="back" onClick={() => handleModal(false)}>
          Cancel
        </Button>,
        <Button
          size="large"
          key="submit"
          loading={loadingSubmission}
          disabled={loadingSubmission}
          type="primary"
          danger={danger}
          onClick={handleConfirmationClick}>
          {danger
            ? "Yes, Stop"
            : module === "AB PAN Add"
              ? "Yes, Add"
              : module === "UnStop Associate Buyer ID"
                ? "Yes,UnStop"
                : "Yes, Sure"}
        </Button>
      ]}
      width={700}>
      <Row>
        <Col span={23}>
          <Flex gap={16} align="start">
            <ExclamationCircleOutlined style={StyleSheet.icon} />
            <Flex vertical>
              <Typography.Title level={5} className="removeMargin">
                {cnfrmTnTitle}
              </Typography.Title>
              <Typography.Text className="removeMargin" type="secondary">
                This action cannot be undone.
              </Typography.Text>
            </Flex>
          </Flex>
        </Col>
      </Row>
      <Row gutter={[20, 10]} style={StyleSheet.content}>
        {module !== "AB PAN Add" && module !== "Death Case" && (
          <>
            <Col span={12}>
              <Flex vertical>
                <Typography.Text type="secondary">Associate Buyer Number</Typography.Text>
                <Typography.Text>{userDetails?.dist_no ?? "-"}</Typography.Text>
              </Flex>
            </Col>
            <Col span={12}>
              <Flex vertical>
                <Typography.Text type="secondary">Associate Buyer Name</Typography.Text>
                <Typography.Text>{userDetails?.dist_name ?? "-"}</Typography.Text>
              </Flex>
            </Col>

            {module == "Reset Password" && (
              <>
                <Col span={12}>
                  <Flex vertical>
                    <Typography.Text type="secondary">Registered Mobile Number</Typography.Text>
                    <Typography.Text>{userDetails?.user_phone_number ?? "-"}</Typography.Text>
                  </Flex>
                </Col>

                <Col span={12}>
                  <Flex vertical>
                    <Typography.Text type="secondary">Gender</Typography.Text>
                    <Typography.Text>{userDetails?.gender ?? "-"}</Typography.Text>
                  </Flex>
                </Col>
              </>
            )}
          </>
        )}
        {module == "AB PAN Add" && (
          <>
            <Col span={12}>
              <Flex vertical>
                <Typography.Text type="secondary">PAN Number</Typography.Text>
                <Typography.Text>{form.getFieldValue("pan_no")}</Typography.Text>
              </Flex>
            </Col>
            <Col span={12}>
              <Flex vertical>
                <Image src={form.getFieldValue("pan_image")} alt="key soul icon" preview={false} />
              </Flex>
            </Col>
          </>
        )}

        {module == "Death Case" && (
          <>
            <Col span={24}>
              <Typography.Title level={5} className="removeMargin">
                Old Associate Buyer
              </Typography.Title>
              <Row className="fullWidth marginTop8">
                <Col span={12}>
                  <Flex vertical>
                    <Typography.Text type="secondary">Associate Buyer ID</Typography.Text>
                    <Typography.Text>{userDetails?.diedABNo}</Typography.Text>
                  </Flex>
                </Col>
                <Col span={12}>
                  <Flex vertical>
                    <Typography.Text type="secondary">Associate Buyer Name</Typography.Text>
                    <Typography.Text className="textCapitalize">
                      {userDetails?.diedABName}
                    </Typography.Text>
                  </Flex>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Typography.Title level={5} className="removeMargin">
                New Associate Buyer
              </Typography.Title>
              <Row className="fullWidth marginTop8">
                <Col span={12}>
                  <Flex vertical>
                    <Typography.Text type="secondary">Associate Buyer ID</Typography.Text>
                    <Typography.Text>{userDetails?.newABNo}</Typography.Text>
                  </Flex>
                </Col>
                <Col span={12}>
                  <Flex vertical>
                    <Typography.Text type="secondary">Associate Buyer Name</Typography.Text>
                    <Typography.Text className="textCapitalize">
                      {userDetails?.newABNAme}
                    </Typography.Text>
                  </Flex>
                </Col>
              </Row>
            </Col>
          </>
        )}
      </Row>
    </Modal>
  );
};

export default ConfirmationModal;
