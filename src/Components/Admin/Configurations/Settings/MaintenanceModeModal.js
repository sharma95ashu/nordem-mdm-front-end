import React, { useEffect, memo, useRef } from "react";
import { Modal, Row, Col, Form, DatePicker, Checkbox, Flex } from "antd";
import dayjs from "dayjs";
import { DATEFORMAT, snackBarErrorConf } from "Helpers/ats.constants";
import { getCurrentDate } from "CrmHelper/crm.helper";
import { disabledDateTime, validateRange } from "Helpers/ats.helper";
import { enqueueSnackbar } from "notistack";

function MaintenanceModeModal({
  open,
  submitHandleMaintenance,
  handleCancelMaintenanceModal,
  setPermissionsArr,
  permissionsArr,
  modules,
  dateRange,
  setScheduleList,
  form,
  optionValue,
  setSaveSettingState
}) {

  const scrollToTop = useRef();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = () => {
    form.submit();
  };

  const onFinish = async (values) => {
    try {
      if (permissionsArr.length > 0) {
        setScheduleList({
          start_date: dayjs(values.rangeDate[0], DATEFORMAT.MAINTENANCE_TIME).valueOf().toString(),
          end_date: dayjs(values.rangeDate[1], DATEFORMAT.MAINTENANCE_TIME).valueOf().toString(),
          modules: permissionsArr
        });
        setSaveSettingState(false);
        submitHandleMaintenance();
      } else {
        enqueueSnackbar("Please Select atleast 1 permission",snackBarErrorConf);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const rangePresets = [
    {
      label: "Next 7 Days",
      value: [dayjs().add(7, "d"), dayjs()]
    }
  ];

  // Select/Deselect All
  const checkHandleAllModulePermission = () => {
    return modules.length > 0 && permissionsArr.length === modules.length;
  };

  const CheckAllPermission = () => {
    if (permissionsArr.length === modules.length) {
      setPermissionsArr([]);
    } else {
      setPermissionsArr(modules.map((m) => ({ module_slug: m.module_slug })));
    }
  };

  const handleModulePermission = (module_slug) => {
    const exists = permissionsArr.some((item) => item.module_slug === module_slug);
    if (exists) {
      setPermissionsArr(permissionsArr.filter((item) => item.module_slug !== module_slug));
    } else {
      setPermissionsArr([...permissionsArr, { module_slug }]);
    }
  };

  /**
   * useEffect function to set fields
   */
  useEffect(() => {
    try {
      scrollToTop?.current?.scrollTo(0, 0);

      // Check if backend optionValue and dateRange are available
      if (optionValue && optionValue.length > 0 && dateRange?.length == 2) {
        // Only set dates if both are valid dayjs objects
        if (dayjs(dateRange[0])?.isValid() && dayjs(dateRange[1])?.isValid()) {
          form.setFieldValue("rangeDate", dateRange);
        } else {
          // If invalid dates are received → keep RangePicker blank
          form.setFieldValue("rangeDate", []);
        }
      } else {
        // If no dateRange from backend → keep RangePicker blank
        form.setFieldValue("rangeDate", []);
      }
    } catch (error) {
      console.log(error);
    }
  }, [open]);

  return (
    <Modal
      title="Maintenance Mode"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancelMaintenanceModal}
      okText="Done"
      width={600}>
      <Form name="maintenance_mode_form" layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={30}>
          <Col span={24}>
            <Form.Item
              name="rangeDate"
              label="Select Start & End Date"
              rules={[
                { required: true, message: "Start & End Date is required" },
                { validator: (_, value) => validateRange(_, value) }
              ]}>
              <DatePicker.RangePicker
                use12Hours
                minDate={dayjs(getCurrentDate(), DATEFORMAT.MAINTENANCE_TIME)}
                showTime
                className="fullWidth"
                presets={rangePresets}
                format={DATEFORMAT.MAINTENANCE_TIME}
                disabledTime={disabledDateTime}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Checkbox
              size="large"
              checked={checkHandleAllModulePermission()}
              onChange={CheckAllPermission}>
              <b>Module Permissions</b>
            </Checkbox>
            <div className="settingScrollPermission" ref={scrollToTop}>
              <Row gutter={[16, 0]}>
                {modules.map((item) => (
                  <Col key={item.module_slug} span={12}>
                    <Flex vertical>
                      <Checkbox
                        size="large"
                        checked={permissionsArr.some((p) => p.module_slug === item.module_slug)}
                        onChange={() => handleModulePermission(item.module_slug)}>
                        {item.module_name}
                      </Checkbox>
                    </Flex>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default memo(MaintenanceModeModal);
