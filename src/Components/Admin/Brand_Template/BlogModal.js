import { Button, Col, DatePicker, Form, Input, Modal, Row, Switch } from "antd";
import dayjs from "dayjs";
import { DATEFORMAT, RULES_MESSAGES } from "Helpers/ats.constants";
import React, { useEffect } from "react";

const BlogModal = (props) => {
  const { carouselImages, handleCarouselImages, handleModalClose, currentIndex } = props;
  const [modalForm] = Form.useForm();

  const handleCancel = () => {
    handleModalClose();
    modalForm.resetFields();
  };

  // function call - when specific image edit clicked
  const handleSlideInfo = (index) => {
    try {
      const data = carouselImages?.filter((item, currIndex) => currIndex == index);
      modalForm.setFieldValue("heading", data[0]?.heading);
      modalForm.setFieldValue("subtext", data[0]?.subtext);
      modalForm.setFieldValue("tag", data[0]?.tag);
      modalForm.setFieldValue("display_order", data[0]?.display_order || 1);
      modalForm.setFieldValue("url", data[0]?.url);

      if (data[0]?.active && typeof data[0]?.active === "string") {
        if (data[0]?.active === "true") {
          modalForm.setFieldValue("active", true);
        }
        if (data[0]?.active === "false") {
          modalForm.setFieldValue("active", false);
        }
      } else {
        if (data[0]?.active === undefined) {
          modalForm.setFieldValue("active", true);
        } else {
          modalForm.setFieldValue("active", data[0]?.active);
        }
      }
      const threeMonthsFromToday = dayjs().add(3, "month");

      if (data[0]?.dateRange?.length > 0) {
        modalForm.setFieldValue("dateRange", [
          dayjs(data[0]?.dateRange[0]),
          dayjs(data[0]?.dateRange[1])
        ]);
      } else {
        modalForm.setFieldValue(
          "dateRange",
          data[0]?.start_date && data[0]?.end_date
            ? [dayjs(data[0]?.start_date), dayjs(data[0]?.end_date)]
            : [dayjs(), threeMonthsFromToday]
        );
      }

      //   setModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const modalSubmit = () => {
    modalForm.submit();
  };

  const linkValidation = (_, value) => {
    if (!/^https?:\/\/[^ "]+$/.test(value)) {
      return Promise.reject("Please enter a valid URL");
    }

    return Promise.resolve();
  };

  // form-modal onfinish function
  const modalFormFinish = (values) => {
    try {
      const tempCarouselData = carouselImages?.map((item, index) =>
        index === currentIndex
          ? { ...item, ...values, active: values?.active ? true : false }
          : item
      );
      handleCarouselImages(tempCarouselData);
      modalForm.resetFields();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleSlideInfo(currentIndex);
  }, [currentIndex]);

  // Disable past dates
  const disabledDate = (current) => {
    return current && dayjs(current).isBefore(dayjs(), "day");
  };

  return (
    <>
      <Modal
        title="Edit Info"
        centered
        open={true}
        closable={true}
        onCancel={handleCancel}
        width={700}
        footer={[
          <Button key="back" type="primary" onClick={modalSubmit}>
            Save
          </Button>
        ]}>
        <Form
          name="banner_form_modal"
          form={modalForm}
          layout="vertical"
          onFinish={modalFormFinish}>
          <Row gutter={[24, 0]}>
            <Col className="gutter-row" span={24}>
              <Form.Item
                name={"heading"}
                label="Heading"
                rules={[
                  { required: true, message: "Please enter value of heading" },
                  {
                    max: 40,
                    min: 3,
                    message: "The value must be between 3 and 40 characters long."
                  }
                ]}>
                <Input placeholder="Enter Heading" maxLength={40} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                name={"subtext"}
                label="Sub Text"
                rules={[
                  { required: true, message: "Please enter value of Subtext" },
                  {
                    max: 200,
                    min: 3,
                    message: "The value must be between 3 and 200 characters long."
                  }
                ]}>
                <Input.TextArea
                  placeholder="Enter Subtext"
                  autoSize={{ minRows: 2 }}
                  maxLength={200}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                name={"tag"}
                label="Tag"
                rules={[
                  { required: true, message: "Please enter value of tag" },
                  {
                    max: 30,
                    min: 3,
                    message: "The value must be between 3 and 30 characters long."
                  }
                ]}>
                <Input placeholder="Enter Tag" maxLength={30} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                name="url"
                label="URL"
                rules={[
                  { required: true, whitespace: true, message: "Value is required" },
                  { validator: linkValidation },
                  {
                    pattern: /^.{1,200}$/,
                    message: "The value must be between 1 and 200 characters long."
                  },
                  {
                    pattern: /^\S(.*\S)?$/,
                    message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
                  },
                  {
                    pattern: /^(?!.*\s{2,}).*$/,
                    message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                  }
                ]}>
                <Input placeholder="Value" size="large" type="text" />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={24}>
              <Form.Item
                name="display_order"
                label="Display Order"
                type="number"
                rules={[
                  { required: true, message: "Display order is required" },
                  {
                    pattern: /^\d+$/,
                    message: "Only integer values are allowed"
                  }
                ]}>
                <Input placeholder="Enter Display Order" type="number" min={0} size="large" />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Select Date & End Date"
                name="dateRange"
                rules={[
                  {
                    required: true,
                    message: "Please select dates"
                  }
                ]}>
                <DatePicker.RangePicker
                  className="fullWidth"
                  block
                  placeholder="Select Date"
                  format={DATEFORMAT.RANGE_FORMAT}
                  size={"large"}
                  disabledDate={disabledDate}
                  // defaultValue={[dayjs(), dayjs().add(1, "month")]}
                  style={StyleSheet.width}
                />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="active" label="Status">
                <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default BlogModal;
