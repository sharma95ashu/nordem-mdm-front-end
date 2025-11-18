import { Col, Form, Input, Modal, Row, Switch } from "antd";
import Joditor from "Components/Shared/Joditor";
import { checkIfEditorEmpty } from "Helpers/ats.helper";
import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react";

const AddMoreSection = forwardRef(({ handleSectionData, formData, resetFormData }, ref) => {
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (formData) {
      form.setFieldsValue(formData);
      setDescription(formData?.long_desc);
      form.setFieldValue("status", formData?.status === "active" ? true : false);
      form.setFieldValue("collapse", formData.collapse);
      setOpen(true);
    } else {
      form.setFieldValue("status", true);
      form.setFieldValue("collapse", true);
    }
  }, [formData]);

  const onCancel = () => {
    setOpen(false);
    form.resetFields();
    setDescription("");
    resetFormData();
  };

  const openModal = () => {
    setOpen(true);
  };

  useImperativeHandle(ref, () => ({
    openModal
  }));

  const handleDescription = (value) => {
    let updatedValue = checkIfEditorEmpty(value);
    setDescription(updatedValue);
    form.setFields([{ name: "long_desc", errors: [], value: updatedValue }]);
  };

  const onFinish = (values) => {
    values["status"] = values?.status ? "active" : "inactive";
    values["collapse"] = values?.collapse ? true : false;
    handleSectionData(values);
    setDescription("");
    setOpen(false);
    form.resetFields();
    form.setFieldValue("status", true);
  };

  return (
    <div>
      <Modal
        title="Product Detail Section"
        open={open}
        onCancel={onCancel}
        okText={formData ? "Update Section" : "Add Section"}
        onOk={() => form.submit()} // Trigger form submission on OK click
      >
        <Form name="form_basic" form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={[24, 0]}>
            <Col className="gutter-row" span={24}>
              <Form.Item
                name="title"
                label="Section Title"
                rules={[
                  { required: true, message: "Please enter title" },
                  {
                    max: 100,

                    min: 3,
                    message: "Title must be between 3 and 100 characters"
                  }
                ]}>
                <Input placeholder="Enter Section Title" maxLength={100} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                name="long_desc"
                label="Section Description"
                rules={[{ required: true, message: "Description is required" }]}>
                {/* <RichEditor
                  name="long_desc"
                  placeholder="Enter Section Description Here.."
                  description={description}
                  handleDescription={handleDescription}
                  image={"image"}
                /> */}

                <Joditor
                  placeholder="Enter Section Description Here.."
                  description={description}
                  handleDescription={handleDescription}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item name="status" label="Status">
                <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="collapse" label="Collapsible">
                <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
});

export default memo(AddMoreSection);
