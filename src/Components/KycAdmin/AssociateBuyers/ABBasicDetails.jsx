import { Button, Col, Divider, Flex, Form, Input, Row, Typography } from "antd";
import ImageUploader from "Components/Shared/ImageUploader";

import { panInput, validatePAN } from "Helpers/ats.helper";

import React from "react";
import ConfirmationModal from "./Shared/Modal";
import { TooltipWrapper } from "Components/Shared/Wrappers/TooltipWrapper";
import { MESSAGES } from "Helpers/ats.constants";

const ABBasicDetails = (props) => {
  const {
    data = {},
    module,
    danger = false,
    panDetails = false,
    finalSubmit,
    loadingSubmission,
    modal,
    handleModal,
    handlePanImgFile,
    onBackClick,
    hasActionPermission
  } = props;

  const { basic_details = {}, card_data = {} } = data;

  const [form] = Form.useForm();

  // handle search submission
  const handleSubmit = () => {
    handleModal(true);
  };

  const label = (key) => {
    return key?.replace(/_/g, " ")?.replace(/\b\w/g, (char) => char?.toUpperCase()) || key;
  };

  const handleConfirmation = () => {
    module !== "AB PAN Add" && finalSubmit(); // api all
    module == "AB PAN Add" && finalSubmit(form.getFieldsValue());
  };

  const tempData = {
    "Stop Associate Buyer ID": {
      btnText: "Stop Associate Buyer ID ",
      cnfrmTnTitle: "Are you sure you want to Stop Associate Buyer ID ?",
      cnfrmtnBtnTxt: "Yes, Stop",
      danger: true
    },
    "Reset Password": {
      btnText: "Reset Password",
      cnfrmTnTitle: "Confirmation to Reset Associate Buyer Password ?",
      cnfrmtnBtnTxt: "Yes,Sure",
      danger: false
    },
    "AB PAN Add": {
      btnText: "Add PAN",
      cnfrmTnTitle: "Are you sure you want to Add PAN Details ?",
      cnfrmtnBtnTxt: "Yes, Add",
      danger: false
    },
    "UnStop Associate Buyer ID": {
      btnText: "UnStop Associate Buyer ID ",
      cnfrmTnTitle: "Are you sure you want to UnStop Associate Buyer ID ?",
      cnfrmtnBtnTxt: "Yes, UnStop",
      danger: false
    }
  };

  return (
    <>
      <Row gutter={[12, 12]} className="marginTop24">
        <Col span={24}>
          <Typography.Text className="font-size-14 color-primary" strong>
            Basic Details
          </Typography.Text>
        </Col>

        {Object.values(basic_details)?.length > 0 &&
          Object.entries(basic_details).map(([key, value], index) => {
            return (
              <Col span={6} key={index}>
                <Flex vertical gap={2}>
                  <Typography.Text type="secondary">{label(key) || "N/A"}</Typography.Text>
                  <Typography.Text>{label(value) || "N/A"}</Typography.Text>
                </Flex>
              </Col>
            );
          })}

        <Col span={24}>
          {panDetails && (
            <>
              <Form name="form_item_path" form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={[12, 12]}>
                  <Divider className="removeMargin" />

                  <Col span={24}>
                    <Typography.Text className="font-size-14 color-primary" strong>
                      PAN Detail
                    </Typography.Text>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={"pan_no"}
                      label={"PAN Number"}
                      rules={[{ validator: validatePAN }]}
                      required>
                      <Input
                        placeholder={`Enter PAN Number`}
                        size="large"
                        type="text"
                        onInput={panInput}
                        maxLength={10}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="pan_proof"
                      label="Upload Original PAN Image"
                      rules={[{ required: true, message: "PAN Image is required" }]}>
                      <div style={{ position: "relative" }} className="custom-image-uploader">
                        <ImageUploader
                          label="Upload Original PAN Image"
                          onChange={(url, file) => {
                            form.setFieldValue("pan_image", url);
                            handlePanImgFile(file);
                          }}
                        />
                      </div>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Button
                      {...(onBackClick ? { onClick: onBackClick } : {})}
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
                          size="large"
                          disabled={!hasActionPermission}
                          className="width100"
                          type="primary"
                          danger={danger}
                          htmlType="submit">
                          {"Add PAN"}
                        </Button>
                      }
                      addTooltTip={!hasActionPermission}
                      prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                    />
                  </Col>
                </Row>
              </Form>
            </>
          )}
        </Col>
      </Row>
      {!panDetails && (
        <Row gutter={[12, 12]} style={{ marginTop: "24px" }}>
          <Col span={12}>
            <Button
              {...(onBackClick ? { onClick: onBackClick } : {})}
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
                  disabled={!hasActionPermission}
                  size="large"
                  className="width100"
                  type="primary"
                  loading={loadingSubmission}
                  danger={danger}
                  onClick={handleSubmit}>
                  {tempData[module]?.btnText}
                </Button>
              }
              addTooltTip={!hasActionPermission}
              prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
            />
          </Col>
        </Row>
      )}
      {modal && (
        <ConfirmationModal
          handleConfirmation={handleConfirmation}
          loadingSubmission={loadingSubmission}
          handleModal={handleModal}
          danger={danger}
          cnfrmTnTitle={tempData[module]?.cnfrmTnTitle}
          module={module}
          form={form}
          userDetails={card_data}
        />
      )}
    </>
  );
};

export default ABBasicDetails;
