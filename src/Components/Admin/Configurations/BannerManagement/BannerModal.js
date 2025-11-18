import { Button, Col, DatePicker, Form, Input, Modal, Row, Select, Switch } from "antd";
import dayjs from "dayjs";
import { DATEFORMAT, RULES_MESSAGES, sliderTypeOptions } from "Helpers/ats.constants";
import React, { useEffect, useState } from "react";

const BannerModal = (props) => {
  const { carouselImges, handleCarouselImages, handleModalClose, currentIndex } = props;
  const [modalform] = Form.useForm();
  const [type, setType] = useState("");

  const handleCancel = () => {
    handleModalClose();
    modalform.resetFields();
  };

  // funcation call - when specific image edit clicked
  const handleSlideInfo = (index) => {
    try {
      const data = carouselImges?.filter((item, currIndex) => currIndex == index);
      modalform.setFieldValue(
        "banner_type",
        data[0]?.banner_type ? data[0]?.banner_type : "message"
      );

      if (data[0]?.banner_type) {
        setType(data[0]?.banner_type);
      } else {
        setType("message");
      }
      modalform.setFieldValue("banner_order", data[0]?.banner_order ? data[0]?.banner_order : "1");
      modalform.setFieldValue("banner_redirection_link", data[0]?.banner_redirection_link);
      if (data[0]?.slide_status == "active" || data[0]?.slide_status == "inactive") {
        modalform.setFieldValue("slide_status", data[0]?.slide_status == "active" ? true : false);
      } else {
        modalform.setFieldValue("slide_status", true);
      }
      // modalform.setFieldValue("slide_status", data[0]?.slide_status);
      modalform.setFieldValue("heading", data[0]?.heading ? data[0]?.heading : "");
      modalform.setFieldValue("sub_heading", data[0]?.sub_heading ? data[0]?.sub_heading : "");
      modalform.setFieldValue("button_text", data[0]?.button_text ? data[0]?.button_text : "");
      modalform.setFieldValue(
        "dateRange",
        data[0]?.start_date && data[0]?.end_date
          ? [dayjs(data[0]?.start_date), dayjs(data[0]?.end_date)]
          : [dayjs(), dayjs()]
      );

      //   setModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  // function call - when specific banner select input changes
  const handleBannerTypeSelect = (val) => {
    setType(val);
    modalform.setFieldValue("banner_type", val);
    modalform.setFieldValue("banner_redirection_link", null);
    modalform.setFields([{ name: "banner_redirection_link", errors: [] }]);
  };

  const modalSubmit = () => {
    modalform.submit();
  };

  const linkValidation = (_, value) => {
    if (modalform.getFieldValue("banner_type") == "url" && !/^https?:\/\/[^ "]+$/.test(value)) {
      return Promise.reject("Please enter a valid URL");
    }

    if (
      modalform.getFieldValue("banner_type") == "youtube_url" &&
      !/^https?:\/\/[^ "]+$/.test(value)
    ) {
      return Promise.reject("Please enter a valid YouTube URL");
    }
    return Promise.resolve();
  };
  // form-modal onfinish function
  const modalformFinish = (values) => {
    try {
      const tempCarouselData = carouselImges?.map((item, index) =>
        index === currentIndex
          ? { ...item, ...values, slide_status: values?.slide_status ? "active" : "inactive" }
          : item
      );
      handleCarouselImages(tempCarouselData);
      modalform.resetFields();
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
        title="Edit Slide Info"
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
          form={modalform}
          layout="vertical"
          onFinish={modalformFinish}>
          <Row gutter={[24, 0]}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name="banner_type"
                label="Type"
                rules={[{ required: true, whitespace: true, message: "Type is required" }]}>
                <Select
                  // style={{ width: "100%" }}
                  size="large"
                  placeholder="Select Type"
                  value={type}
                  options={sliderTypeOptions}
                  filterOption={(input, option) =>
                    (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                  }
                  onChange={handleBannerTypeSelect}
                />
              </Form.Item>
            </Col>
            {modalform.getFieldValue("banner_type") !== "message" && (
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="banner_redirection_link"
                  label="Value"
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
            )}
            <Col className="gutter-row" span={12}>
              <Form.Item
                name="heading"
                label="Heading"
                rules={[
                  // { required: true, whitespace: true, message: "Heading is required" },
                  {
                    pattern: /^.{3,50}$/,
                    message: "The value must be between 3 and 50 characters long."
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
                <Input placeholder="Content" size="large" type="text" maxLength={50} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name="sub_heading"
                label="Sub Heading"
                rules={[
                  // { required: true, whitespace: true, message: "Sub heading is required" },
                  {
                    pattern: /^.{3,250}$/,
                    message: "The value must be between 3 and 250 characters long."
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
                <Input placeholder="Content" size="large" type="text" maxLength={250} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name="banner_order"
                label="Banner Order"
                type="number"
                rules={[
                  { required: true, whitespace: true, message: "Banner order is required" },
                  {
                    pattern: /^\d+$/,
                    message: "Only integer values are allowed"
                  }
                ]}>
                <Input placeholder="Enter Banner Order" type="number" min={0} size="large" />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item
                name="button_text"
                label="Button Label"
                rules={[
                  // { required: true, whitespace: true, message: "Heading is required" },
                  {
                    pattern: /^.{3,20}$/,
                    message: "The value must be between 3 and 20 characters long."
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
                <Input placeholder="Button Label" size="large" type="text" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Select Date Range"
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
                  style={StyleSheet.width}
                />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="slide_status" label="Status">
                <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default BannerModal;
