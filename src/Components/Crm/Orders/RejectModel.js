import { memo, useState } from "react";
import { Button, Checkbox, Col, Form, Input, Modal, Row, Select } from "antd";
import { validateReason } from "Helpers/ats.helper";

const RejectModal = (props) => {
  const { rejectModel, orderNo } = props;
  const [selectValue, setSelectValue] = useState(null);
  const [check, setCheck] = useState(false);
  const { TextArea } = Input;

  const [rejectForm] = Form.useForm();

  // handle  Reset form
  const handleResetForm = () => {
    rejectForm.resetFields();

    props.setRejectModel(false);
  };

  const handleRejectForm = (values) => {
    let reason;
    if (values?.return_reason != "other" && rejectModel.dialog === "reject") {
      reason = values?.return_reason;
    } else {
      reason = values?.other;
    }
    try {
      const data = {
        reject_reason: reason,
        return_order_no: orderNo,
        customer_satisfaction: check
      };

      props.handleReturnOperation(data);
      //   rejectReturn(data);
    } catch (error) {
      console.log(error);
    }
  };
  const RETURN_ORDER_OPTIONS = [
    {
      value: "Product not in original packaging",
      label: "Product not in original packaging"
    },
    {
      value: "Product is damage",
      label: "Product is damage"
    },
    {
      value: "Missing accessories/manuals",
      label: "Missing accessories/manuals"
    },
    {
      value: "Incorrect product returned",
      label: "Incorrect product returned"
    },
    {
      value: "other",
      label: "Other"
    }
  ];

  return (
    <>
      {/* Reject model*/}

      <Modal
        title={rejectModel.dialog == "accept" ? "Return Acceptance" : "Return Pickup Rejection"}
        open={rejectModel.open}
        maskClosable={false}
        onCancel={handleResetForm}
        footer={[
          <Button
            key={"submit"}
            onClick={() => {
              rejectForm.submit();
            }}
            type="primary">
            Submit
          </Button>,
          <Button key="cancel" onClick={handleResetForm}>
            Cancel
          </Button>
        ]}>
        <Form layout="vertical" form={rejectForm} onFinish={handleRejectForm}>
          <Row gutter={[20, 0]}>
            {rejectModel.dialog === "accept" ? (
              <Col span={24}>
                <Form.Item name="customer_satisfaction" valuePropName="checked">
                  <Checkbox value={check} onChange={(val) => setCheck(val.target.checked)}>
                    Is this return accepted for customer satisfaction despite failing benchmarks
                  </Checkbox>
                </Form.Item>
              </Col>
            ) : (
              <Col span={24}>
                <Form.Item
                  name={"return_reason"}
                  label="Reason for reject"
                  rules={[
                    {
                      required: true,
                      message: "Select Reason For Reject"
                    }
                  ]}>
                  <Select
                    allowClear
                    onChange={(value) => setSelectValue(value)}
                    size="large"
                    placeholder="Select Reason For Reject"
                    className="fullWidth"
                    options={RETURN_ORDER_OPTIONS}
                  />
                </Form.Item>
              </Col>
            )}

            {selectValue == "other" || (rejectModel.dialog === "accept" && check) ? (
              <Col span={24}>
                <Form.Item
                  name={"other"}
                  rules={[
                    { validator: validateReason } // Custom validator
                  ]}>
                  <TextArea
                    rows={4}
                    placeholder={
                      rejectModel.dialog === "accept" ? "Any Comment" : "Enter Reason For Reject"
                    }
                    maxLength={250}
                  />
                </Form.Item>
              </Col>
            ) : (
              <></>
            )}
          </Row>
        </Form>
      </Modal>
    </>
  );
};
export default memo(RejectModal);
