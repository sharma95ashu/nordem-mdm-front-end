import { Col, Divider, Flex, Row, Typography, Button, Form, Card, Alert } from "antd";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { getDateTimeFormat, hasEditPermission, validateRemarks } from "Helpers/ats.helper";
import React from "react";
import UserProfileCard from "../UserProfileCard";
import TextArea from "antd/es/input/TextArea";
import { ConfirmationDeleteModal } from "./ConfirmationDeleteModal";
import searchByAssociateBuyer from "Static/KYC_STATIC/img/search_by_associate_buyer.svg";
import { TooltipWrapper } from "Components/Shared/Wrappers/TooltipWrapper";
import { MESSAGES } from "Helpers/ats.constants";

export const MODULE_TYPE = {
  BANK: "bank-account",
  PAN: "pan-number",
  PHOTO: "photo-delete",
  REKYC: "enable-re-kyc"
};

const ABUserDashboard = ({
  module,
  handleConfirmDelete,
  handleAfterSearch,
  show,
  ABDetails,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  isLoading,
  fallBackSubtitle,
  submissionForm,
  searchRef,
  onBackClick
}) => {
  const StyleSheet = {
    divider: {
      marginTop: "12px",
      marginBottom: "12px"
    },
    sectionHeading: {
      color: "#1755A6"
    },
    submissionForm: {
      marginTop: "20px"
    },
    nullPaddingInline: {
      paddingInline: "0"
    },
    Card: {
      paddingBottom: "24px"
    },
    RecordColumn: {
      width: "100%",
      maxWidth: module.TYPE === MODULE_TYPE.BANK ? "20%" : "25%"
    }
  };

  // handle search click
  const handleSearch = (value) => {
    handleAfterSearch(value);
  };

  // this will be triggered on the form submission
  const onFinish = () => {
    // Opening the delete confirmation modal popup
    setIsDeleteModalOpen(true);
  };

  return (
    <Row gutter={[20, 24]}>
      <Col span={24}>
        <SearchByComponent
          ref={searchRef}
          handleClear={() => {
            /** */
          }}
          handleSearchClick={handleSearch}
          searchLoading={isLoading}
          moduleName={module.NAME}
        />
      </Col>

      {/* Alert for Re-KYC */}
      {module.TYPE === MODULE_TYPE.REKYC && !ABDetails?.dist_no && (
        <Alert
          className="bordered__info__alert fullWidth"
          message={
            "Allow KYC refills only for users whose status is Inactive and whose KYC was last filled before October 2020."
          }
          type="info"
          showIcon
        />
      )}

      {show && !isLoading ? (
        <Card className="fullWidth">
          <div className="" style={StyleSheet.Card}>
            <Col span={24} style={StyleSheet.nullPaddingInline}>
              <Row gutter={[0, 32]}>
                <Col span={24} style={StyleSheet.nullPaddingInline}>
                  <UserProfileCard
                    moduleType={module.TYPE}
                    handlePhotoDelete={() => setIsDeleteModalOpen(true)}
                    userDetails={ABDetails}
                  />
                </Col>
                <Col span={24} style={StyleSheet.nullPaddingInline}>
                  <Flex vertical gap={12}>
                    {/* Basic Details */}
                    <Flex vertical gap={12}>
                      <Typography.Text strong style={StyleSheet.sectionHeading}>
                        {" "}
                        Basic Details{" "}
                      </Typography.Text>
                      <div>
                        <Flex gap={10}>
                          <div></div>
                          <Flex gap={24} className="fullWidth">
                            <Flex style={StyleSheet.RecordColumn} vertical gap={2}>
                              <Typography.Text strong type="secondary">
                                {" "}
                                Sponsor Number{" "}
                              </Typography.Text>
                              <Typography.Text> {ABDetails?.sponsor || "-"} </Typography.Text>
                            </Flex>
                            <Flex style={StyleSheet.RecordColumn} vertical gap={2}>
                              <Typography.Text strong type="secondary">
                                {" "}
                                Sponsor Name{" "}
                              </Typography.Text>
                              <Typography.Text> {ABDetails?.sponsor_name || "-"} </Typography.Text>
                            </Flex>
                            <Flex style={StyleSheet.RecordColumn} vertical gap={2}>
                              <Typography.Text strong type="secondary">
                                {" "}
                                Proposer Number{" "}
                              </Typography.Text>
                              <Typography.Text> {ABDetails?.proposer || "-"} </Typography.Text>
                            </Flex>
                            <Flex style={StyleSheet.RecordColumn} vertical gap={2}>
                              <Typography.Text strong type="secondary">
                                {" "}
                                Proposer Name{" "}
                              </Typography.Text>
                              <Typography.Text> {ABDetails?.proposer_name || "-"} </Typography.Text>
                            </Flex>
                            {module.TYPE === MODULE_TYPE.BANK && (
                              <>
                                <div style={StyleSheet.RecordColumn}></div>
                              </>
                            )}
                          </Flex>
                        </Flex>
                      </div>
                    </Flex>

                    {/* Bank Details */}
                    {module.TYPE === MODULE_TYPE.BANK && (
                      <>
                        <Divider style={StyleSheet.divider}></Divider>
                        <Flex vertical gap={12}>
                          <Typography.Text strong style={StyleSheet.sectionHeading}>
                            {" "}
                            Bank Details{" "}
                          </Typography.Text>
                          <div>
                            <Flex gap={10}>
                              <div></div>
                              <Col span={24}>
                                <Flex gap={24}>
                                  <Flex style={StyleSheet.RecordColumn} vertical gap={2}>
                                    <Typography.Text strong type="secondary">
                                      {" "}
                                      Bank Name{" "}
                                    </Typography.Text>
                                    <Typography.Text>
                                      {" "}
                                      {ABDetails?.bank_name || "-"}{" "}
                                    </Typography.Text>
                                  </Flex>
                                  <Flex style={StyleSheet.RecordColumn} vertical gap={2}>
                                    <Typography.Text strong type="secondary">
                                      {" "}
                                      Bank Account Number{" "}
                                    </Typography.Text>
                                    <Typography.Text>
                                      {" "}
                                      {ABDetails?.bank_acc_no || "-"}{" "}
                                    </Typography.Text>
                                  </Flex>
                                  <Flex style={StyleSheet.RecordColumn} vertical gap={2}>
                                    <Typography.Text strong type="secondary">
                                      {" "}
                                      IFSC Code{" "}
                                    </Typography.Text>
                                    <Typography.Text>
                                      {" "}
                                      {ABDetails?.branch_code || "-"}{" "}
                                    </Typography.Text>
                                  </Flex>
                                  <Flex style={StyleSheet.RecordColumn} vertical gap={2}>
                                    <Typography.Text strong type="secondary">
                                      {" "}
                                      Branch Name{" "}
                                    </Typography.Text>
                                    <Typography.Text>
                                      {" "}
                                      {ABDetails?.branch_name || "-"}{" "}
                                    </Typography.Text>
                                  </Flex>
                                  <Flex style={StyleSheet.RecordColumn} vertical gap={2}>
                                    <Typography.Text strong type="secondary">
                                      {" "}
                                      A/c Created on{" "}
                                    </Typography.Text>
                                    <Typography.Text>
                                      {" "}
                                      {ABDetails?.bank_created_on
                                        ? getDateTimeFormat(
                                            ABDetails?.bank_created_on,
                                            "DD / MMM / YYYY"
                                          )
                                        : "N/A"}{" "}
                                    </Typography.Text>
                                  </Flex>
                                </Flex>
                              </Col>
                              <div></div>
                            </Flex>
                          </div>
                        </Flex>
                      </>
                    )}

                    {/* PAN Details */}
                    {module.TYPE === MODULE_TYPE.PAN && (
                      <>
                        <Divider style={StyleSheet.divider}></Divider>
                        <Flex vertical gap={12}>
                          <Typography.Text strong style={StyleSheet.sectionHeading}>
                            {" "}
                            PAN Details{" "}
                          </Typography.Text>
                          <div>
                            <Flex gap={10}>
                              <div></div>
                              <Col span={24}>
                                <Row gutter={24}>
                                  <Col xs={12} md={4}>
                                    <Flex vertical gap={2}>
                                      <Typography.Text strong type="secondary">
                                        {" "}
                                        PAN Number{" "}
                                      </Typography.Text>
                                      <Typography.Text>
                                        {" "}
                                        {ABDetails?.pan_no || "-"}{" "}
                                      </Typography.Text>
                                    </Flex>
                                  </Col>
                                </Row>
                              </Col>
                              <div></div>
                            </Flex>
                          </div>
                        </Flex>
                      </>
                    )}

                    {/* Remarks */}
                    {(module.TYPE === MODULE_TYPE.BANK || module.TYPE === MODULE_TYPE.PAN) && (
                      <Form
                        form={submissionForm}
                        layout="vertical"
                        onFinish={onFinish}
                        style={StyleSheet.submissionForm}>
                        <Form.Item
                          name="remark"
                          label="Remarks"
                          required
                          rules={[{ validator: validateRemarks }]}>
                          <TextArea rows={4} placeholder="Enter Remarks Here" />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Button
                              onClick={onBackClick}
                              htmlType="button"
                              size="large"
                              className="width100"
                              variant="outlined">
                              Back{" "}
                            </Button>
                          </Col>
                          <Col span={12}>
                            <TooltipWrapper
                              ChildComponent={
                                <Button
                                  disabled={!hasEditPermission()}
                                  htmlType="submit"
                                  size="large"
                                  className="width100"
                                  type="primary">
                                  {`Enable ${
                                    module.TYPE === MODULE_TYPE.BANK
                                      ? "Bank Details"
                                      : module.TYPE === MODULE_TYPE.PAN
                                        ? "PAN Details"
                                        : ""
                                  }`}
                                </Button>
                              }
                              addTooltTip={!hasEditPermission()}
                              prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                            />
                          </Col>
                        </Row>
                      </Form>
                    )}

                    {module.TYPE === MODULE_TYPE.REKYC && (
                      <>
                        <Row gutter={16} className="marginTop24">
                          <Col span={12}>
                            <Button
                              onClick={onBackClick}
                              htmlType="button"
                              size="large"
                              className="width100"
                              variant="outlined">
                              Back{" "}
                            </Button>
                          </Col>
                          <Col span={12}>
                            <TooltipWrapper
                              ChildComponent={
                                <Button
                                  disabled={!hasEditPermission()}
                                  onClick={onFinish}
                                  size="large"
                                  className="width100"
                                  type="primary">
                                  Enable Re-KYC
                                </Button>
                              }
                              addTooltTip={!hasEditPermission()}
                              prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                            />
                          </Col>
                        </Row>
                      </>
                    )}

                    {/* Modals */}
                    <ConfirmationDeleteModal
                      moduleType={module.TYPE}
                      ABDetails={ABDetails}
                      isDeleteModalOpen={isDeleteModalOpen}
                      handleConfirmDelete={handleConfirmDelete}
                      setIsDeleteModalOpen={setIsDeleteModalOpen}
                      submissionForm={submissionForm}
                    />
                  </Flex>
                </Col>
              </Row>
            </Col>
          </div>
        </Card>
      ) : (
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number"}
          subTitle={fallBackSubtitle}
          image={searchByAssociateBuyer}
        />
      )}
    </Row>
  );
};

export default ABUserDashboard;
