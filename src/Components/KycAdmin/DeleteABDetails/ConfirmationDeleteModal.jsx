import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Card, Col, Divider, Flex, Image, Modal, Row, Typography } from "antd";
import { MODULE_TYPE } from "./ABUserDashboard";
import { getDateTimeFormat } from "Helpers/ats.helper";
import { FALL_BACK } from "Helpers/ats.constants";
import { getFullImageUrl } from "Helpers/functions";

export const ConfirmationDeleteModal = ({
  moduleType,
  ABDetails,
  isDeleteModalOpen,
  handleConfirmDelete,
  setIsDeleteModalOpen,
  submissionForm
}) => {
  const ModalStyle = {
    Card: {
      backgroundColor: "#F5F5F5"
    },
    profileImage: {
      width: "100%",
      maxWidth: "125px",
      height: "125px",
      borderRadius: "8px",
      border: "1px solid #fff"
    },
    Icon: {
      color: "#FA8C16",
      fontSize: "24px",
      marginTop: 4
    }
  };

  const deleteRecord = () => {
    const { remark } = (submissionForm && submissionForm.getFieldsValue()) || {};
    handleConfirmDelete(ABDetails?.dist_no, remark);
  };

  return (
    <>
      <Modal
        title={
          <>
            <Flex gap={16} align="start">
              <ExclamationCircleOutlined style={ModalStyle.Icon} />
              {moduleType === MODULE_TYPE.REKYC ? (
                "Confirmation to Enable Re-KYC ?"
              ) : (
                <Flex gap={4} vertical>
                  {`Confirmation to Enable ${
                    moduleType === MODULE_TYPE.BANK
                      ? "Bank Details"
                      : moduleType === MODULE_TYPE.PAN
                        ? "PAN Details"
                        : moduleType === MODULE_TYPE.PHOTO
                          ? "Associate Buyer Photo"
                          : ""
                  } ?`}
                  <Typography.Text type="secondary">
                    Once enabled, This action cannot be reversed.
                  </Typography.Text>
                </Flex>
              )}
            </Flex>
          </>
        }
        width={700}
        cancelText="Cancel"
        // okText={moduleType !== MODULE_TYPE.REKYC ? "Yes, Delete" : "Yes, Enable"}
        okText={"Yes, Enable"}
        className="border-less-modal-popup"
        okButtonProps={{ size: "large" }}
        cancelButtonProps={{ size: "large" }}
        open={isDeleteModalOpen}
        onOk={deleteRecord}
        onCancel={() => setIsDeleteModalOpen(false)}>
        {/* -----------  (BANK) ------------- */}
        {moduleType === MODULE_TYPE.BANK && (
          <Card style={ModalStyle.Card}>
            <Row gutter={[24, 12]}>
              <Col xs={12} md={8}>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    {" "}
                    Bank Name{" "}
                  </Typography.Text>
                  <Typography.Text> {ABDetails?.bank_name} </Typography.Text>
                </Flex>
              </Col>
              <Col xs={12} md={8}>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    {" "}
                    Bank Account Number{" "}
                  </Typography.Text>
                  <Typography.Text> {ABDetails?.bank_acc_no} </Typography.Text>
                </Flex>
              </Col>
              <Col xs={12} md={8}>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    {" "}
                    IFSC Code{" "}
                  </Typography.Text>
                  <Typography.Text> {ABDetails?.branch_code} </Typography.Text>
                </Flex>
              </Col>
              <Col xs={12} md={8}>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    {" "}
                    Branch Name{" "}
                  </Typography.Text>
                  <Typography.Text> {ABDetails?.branch_name} </Typography.Text>
                </Flex>
              </Col>
              <Col xs={12} md={8}>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    {" "}
                    A/c Created on{" "}
                  </Typography.Text>
                  <Typography.Text>
                    {" "}
                    {ABDetails?.bank_created_on
                      ? getDateTimeFormat(ABDetails?.bank_created_on, "DD / MMM / YYYY")
                      : "N/A"}{" "}
                  </Typography.Text>
                </Flex>
              </Col>
            </Row>

            {submissionForm?.getFieldValue("remark") && (
              <>
                <Divider style={StyleSheet.divider}></Divider>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    {" "}
                    Remark{" "}
                  </Typography.Text>
                  <Typography.Text> {submissionForm?.getFieldValue("remark")} </Typography.Text>
                </Flex>
              </>
            )}
          </Card>
        )}

        {/* -----------  (PAN) ------------- */}
        {moduleType === MODULE_TYPE.PAN && (
          <Card style={ModalStyle.Card} className="ant-card-body">
            <Row gutter={[24, 12]}>
              <Col xs={12} md={8}>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    {" "}
                    PAN Number{" "}
                  </Typography.Text>
                  <Typography.Text> {ABDetails?.pan_no || "-"} </Typography.Text>
                </Flex>
              </Col>
            </Row>

            {submissionForm?.getFieldValue("remark") && (
              <>
                <Divider style={StyleSheet.divider}></Divider>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    {" "}
                    Remark{" "}
                  </Typography.Text>
                  <Typography.Text> {submissionForm?.getFieldValue("remark")} </Typography.Text>
                </Flex>
              </>
            )}
          </Card>
        )}

        {/* -----------  (PHOTO) ------------- */}
        {moduleType === MODULE_TYPE.PHOTO && (
          <Image
            style={ModalStyle.profileImage}
            preview={false}
            src={getFullImageUrl(ABDetails?.doc_path)}
            fallback={FALL_BACK}
          />
        )}

        {/* -----------  (Enable Re-KYC) ------------- */}
        {moduleType === MODULE_TYPE.REKYC && (
          <Card style={ModalStyle.Card} className="ant-card-body">
            <Row gutter={[24, 12]}>
              <Col xs={12} md={8}>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    Associate Buyer Name
                  </Typography.Text>
                  <Typography.Text> {ABDetails?.dist_name || "-"} </Typography.Text>
                </Flex>
              </Col>
              <Col xs={12} md={8}>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    Associate Buyer Number
                  </Typography.Text>
                  <Typography.Text> {ABDetails?.dist_no || "-"} </Typography.Text>
                </Flex>
              </Col>
            </Row>

            {submissionForm?.getFieldValue("remark") && (
              <>
                <Divider style={StyleSheet.divider}></Divider>
                <Flex vertical gap={2}>
                  <Typography.Text strong type="secondary">
                    {" "}
                    Remark{" "}
                  </Typography.Text>
                  <Typography.Text> {submissionForm?.getFieldValue("remark")} </Typography.Text>
                </Flex>
              </>
            )}
          </Card>
        )}
      </Modal>
    </>
  );
};
