import { Button, Col, DatePicker, Form, Input, Modal, Row, Switch } from "antd";
import dayjs from "dayjs";
import { DATEFORMAT, RULES_MESSAGES } from "Helpers/ats.constants";
import React, { useEffect } from "react";

const BannerModalMobile = (props) => {
  const { carouselImagesM, handleCarouselImagesM, handleModalCloseM, currentIndexM } = props;
  const [modalForm] = Form.useForm();

  const handleCancel = () => {
    handleModalCloseM();
    modalForm.resetFields();
  };

  // function call - when specific image edit clicked
  const handleSlideInfo = (index) => {
    try {
      const data = carouselImagesM?.filter((item, currIndex) => currIndex == index);
      modalForm.setFieldValue("display_order", data[0]?.display_order || 1);
      modalForm.setFieldValue("url", data[0]?.url);
      if (data[0]?.active === undefined) {
        modalForm.setFieldValue("active", true);
      } else if (data[0]?.active && typeof data[0]?.active === "string") {
        if (data[0]?.active === "true") {
          modalForm.setFieldValue("active", true);
        }
        if (data[0]?.active === "false") {
          modalForm.setFieldValue("active", false);
        }
      } else {
        modalForm.setFieldValue("active", data[0].active);
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
      const tempCarouselData = carouselImagesM?.map((item, index) =>
        index === currentIndexM
          ? { ...item, ...values, active: values?.active ? true : false }
          : item
      );

      handleCarouselImagesM(tempCarouselData);
      modalForm.resetFields();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleSlideInfo(currentIndexM);
  }, [currentIndexM]);

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
                  style={StyleSheet.width}
                />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="active" label="Status">
                <Switch
                  size="large"
                  defaultChecked
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default BannerModalMobile;
