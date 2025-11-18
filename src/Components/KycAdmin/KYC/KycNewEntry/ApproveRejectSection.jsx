import {
  Button,
  Checkbox,
  Col,
  Flex,
  Form,
  Modal,
  Popconfirm,
  Row,
  Spin,
  Switch,
  Typography
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";
import { TooltipWrapper } from "Components/Shared/Wrappers/TooltipWrapper";
import { MESSAGES, RejectionReason } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";

const ApproveRejectSection = ({
  currentStatus,
  kycStatusForm,
  onFinish,
  modalVisible,
  onModalCancel,
  handleCheckboxChange,
  handleKycUpdate,
  KycUpdateLoading,
  onBackClick,
  parentModule,
  hasActionPermission,
  preSelectedReasons, // list of reasons we have to pre-select in the modal - [TYPE - Array of Numbers]
  preEnteredRemark // remark
}) => {
  const [checkboxOptions, setCheckboxOptions] = useState([]);
  const { apiService } = useServices();

  const modules = {
    "kyc-old-entry": {
      label: "Application Status",
      checkedChildren: "verified",
      unCheckedChildren: "unverified",
      success: {
        popConfirmTitle: "Mark as KYC Approved",
        popConfirmDesc: "Are you sure the KYC is Approved ?"
      },
      reject: {
        popConfirmTitle: "Mark as KYC Rejected",
        popConfirmDesc: "Are you sure the KYC is Rejected ?"
      },
      modal: {
        title: "Select Remark for KYC Not OK",
        okText: "Update"
      },
      actionButtons: {
        success: "Update",
        reject: "Add Remarks & Update"
      }
    },
    "kyc-new-entry": {
      label: "KYC Status",
      checkedChildren: "Ok",
      unCheckedChildren: "Not OK",
      success: {
        popConfirmTitle: "KYC OK",
        popConfirmDesc: "Are you sure the KYC is OK ?"
      },
      reject: {
        popConfirmTitle: "KYC Not OK",
        popConfirmDesc: "Are you sure the KYC is Not OK ?"
      },
      modal: {
        title: "Select Remark for KYC Not OK",
        okText: "Update"
      },
      actionButtons: {
        success: "Update",
        reject: "Add Remarks & Update"
      }
    },
    "executive-feedback": {
      label: "Status",
      checkedChildren: "Approve",
      unCheckedChildren: "Reject",
      success: {
        popConfirmTitle: "Approve",
        popConfirmDesc: "Are you sure you want to Soft Terminate AB?"
      },
      reject: {
        popConfirmTitle: "Reject",
        popConfirmDesc: "Are you sure you want to Soft Terminate AB?"
      },
      modal: {
        title: "Select Remarks",
        okText: "Yes, Reject"
      },
      actionButtons: {
        success: "Approve",
        reject: "Add Remarks & Reject"
      }
    },
    "senior-executive-feedback": {
      label: "KYC Status",
      checkedChildren: "Ok",
      unCheckedChildren: "Terminate",
      success: {
        popConfirmTitle: "Mark as KYC OK",
        popConfirmDesc: "Are you sure the KYC is OK ?"
      },
      reject: {
        popConfirmTitle: "Mark KYC as Terminated",
        popConfirmDesc: "Are you sure you want to terminate the KYC?"
      },
      modal: {
        title: "Select Remarks",
        okText: "Update"
      },
      actionButtons: {
        success: "Update",
        reject: "Add Remarks & Update"
      }
    }
  };

  // api call to fetch the rejection reasons

  useQuery("getKYCRejectionReasons", () => apiService.getKYCRejectionReasons(), {
    enabled: true, //enabled the query by default
    onSuccess: (response) => {
      if (response?.success && response?.data) {
        const other = [response?.data.find((e) => e.id === 15)];
        const predefined = response?.data.filter((e) => e.id !== 15);
        const newData = [...predefined, ...other];
        setCheckboxOptions(newData);
      }
    },
    onError: (error) => {
      console.log(error);
    }
  });

  /**------------------------------------------------------------------
   * Setting up default states of FORM
   ------------------------------------------------------------------*/
  useEffect(() => {
    // toggle button state updated
    kycStatusForm?.setFieldValue("is_checked", currentStatus);

    // checkboxes states updated
    if (preSelectedReasons?.length > 0) {
      // reasons updated
      kycStatusForm?.setFieldsValue({
        rejection_reasons: preSelectedReasons
      });

      // not ok remark updated
      if (preEnteredRemark && preSelectedReasons?.indexOf(RejectionReason.Other) > -1) {
        kycStatusForm?.setFieldValue("rejection_remark", preEnteredRemark);
      }
    }

    // ok remark updated
    if (preEnteredRemark && preSelectedReasons?.length === 0) {
      kycStatusForm?.setFieldValue("success_remark", preEnteredRemark);
    }
  }, []);

  return (
    <Form form={kycStatusForm} layout="vertical" onFinish={hasActionPermission && onFinish}>
      <Row gutter={[0, 24]}>
        <Col span={24}></Col>
        <Col span={24}>
          <Row gutter={[0, 6]}>
            {/* Form Fields */}
            <Col span={24}>
              <Row gutter={24}>
                {/* KYC Switch */}
                <Col span={3}>
                  <Form.Item
                    name="is_checked"
                    label={modules[parentModule].label}
                    rules={[
                      {
                        required: true,
                        message: "This field is required."
                      }
                    ]}>
                    <Switch
                      className="color-switch"
                      checkedChildren={modules[parentModule].checkedChildren}
                      unCheckedChildren={modules[parentModule].unCheckedChildren}
                      defaultChecked
                    />
                  </Form.Item>
                </Col>

                {/* Remarks Section */}
                {parentModule !== "executive-feedback" && (
                  <Col span={21}>
                    <Form.Item shouldUpdate>
                      {() => {
                        const kycOk = kycStatusForm.getFieldValue("is_checked");
                        return (
                          <>
                            {kycOk && ( // Show remarks textarea if KYC is approved
                              <Form.Item
                                name="success_remark"
                                label={
                                  <span>
                                    Remark{" "}
                                    <Typography.Text type="secondary">(optional)</Typography.Text>
                                  </span>
                                }>
                                <TextArea
                                  minLength={3}
                                  rows={4}
                                  placeholder="Enter Remarks Here"
                                  maxLength={150}
                                />
                              </Form.Item>
                            )}
                          </>
                        );
                      }}
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Col>

            {/* Action Button */}
            <Col span={24}>
              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    onClick={() => onBackClick(true)}
                    htmlType="button"
                    size="large"
                    className="width100"
                    variant="outlined">
                    Back
                  </Button>
                </Col>
                <Col span={12}>
                  <Form.Item shouldUpdate>
                    {() => {
                      const kycOk = kycStatusForm.getFieldValue("is_checked");
                      return (
                        <>
                          {kycOk ? (
                            <PopconfirmWrapper
                              title={modules[parentModule].success.popConfirmTitle}
                              description={modules[parentModule].success.popConfirmDesc}
                              onConfirm={() => {
                                hasActionPermission && kycStatusForm.submit(); // submit form on confirm
                              }}
                              okText="Yes"
                              cancelText="No"
                              ChildComponent={
                                <Button
                                  disabled={!hasActionPermission}
                                  size="large"
                                  className="width100"
                                  type="primary">
                                  {modules[parentModule].actionButtons.success}
                                </Button>
                              }
                              addTooltTip={!hasActionPermission}
                              prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                            />
                          ) : (
                            <TooltipWrapper
                              ChildComponent={
                                <Button
                                  htmlType="submit"
                                  disabled={!hasActionPermission}
                                  size="large"
                                  className="width100"
                                  type="primary">
                                  {modules[parentModule].actionButtons.reject}
                                </Button>
                              }
                              addTooltTip={!hasActionPermission}
                              prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                            />
                          )}
                        </>
                      );
                    }}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* KYC Not OK Modal */}
      <Modal
        open={modalVisible}
        width={1080}
        title={modules[parentModule].modal.title}
        onCancel={onModalCancel}
        footer={[
          <div key={"footer-buttons"}>
            <Flex justify="end" align="center" className="fullWidth">
              <Button size="large" key="back" onClick={onModalCancel}>
                Cancel
              </Button>
              <Form.Item
                key="submit"
                shouldUpdate
                style={{ marginLeft: "8px" }}
                className="margin-bottom-0">
                {() => {
                  const isAnySelected = !kycStatusForm.getFieldValue("rejection_reasons")?.length;
                  return (
                    <Popconfirm
                      title={modules[parentModule].reject.popConfirmTitle}
                      description={modules[parentModule].reject.popConfirmDesc}
                      onConfirm={() => {
                        kycStatusForm
                          .validateFields()
                          .then((values) => {
                            handleKycUpdate(values);
                          })
                          .catch((err) => {
                            console.error(err);
                            // Scroll to remark section
                            document
                              .getElementById("rejection_remark")
                              ?.scrollIntoView({ behavior: "smooth" });
                          });
                      }}
                      okText="Yes"
                      cancelText="No">
                      <Button size="large" type="primary" disabled={isAnySelected} danger>
                        {modules[parentModule].modal.okText}
                      </Button>
                    </Popconfirm>
                  );
                }}
              </Form.Item>
            </Flex>
          </div>
        ]}>
        <Spin spinning={KycUpdateLoading}>
          <div className="rejection__options__container">
            <Form.Item name="rejection_reasons" className="margin-bottom-0">
              <Checkbox.Group onChange={handleCheckboxChange}>
                <Row gutter={[24, 8]}>
                  {checkboxOptions.map((option) => (
                    <Col key={option.id} span={12}>
                      <Checkbox value={option.id}>{option.description}</Checkbox>
                    </Col>
                  ))}
                  <Col span={24}></Col>
                  <Col span={24}>
                    <Form.Item shouldUpdate className="margin-bottom-0">
                      {() => {
                        const otherChecked =
                          kycStatusForm
                            .getFieldValue("rejection_reasons")
                            ?.indexOf(RejectionReason.Other) > -1;
                        return (
                          <>
                            {otherChecked && (
                              <Form.Item
                                className="margin-bottom-0"
                                name="rejection_remark"
                                rules={[{ required: true, message: "Remark is required." }]}>
                                <TextArea
                                  minLength={3}
                                  rows={4}
                                  placeholder="Remark"
                                  maxLength={150}
                                />
                              </Form.Item>
                            )}
                          </>
                        );
                      }}
                    </Form.Item>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </div>
        </Spin>
      </Modal>
    </Form>
  );
};

export default ApproveRejectSection;
