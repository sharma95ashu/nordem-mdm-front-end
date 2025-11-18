/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Spin, Input, Button, Col, Row, Popconfirm, theme, Flex, Form, Card, Select } from "antd";

import { DeleteOutlined } from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQuery } from "react-query";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { useNavigate } from "react-router-dom";
import { actionsPermissionValidator, validationNumber } from "Helpers/ats.helper";
import { validateAnyMonthPV } from "./ULPTargetHelper";

// Events List component
export default function EventsList() {
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();

  const [form] = Form.useForm();
  const currentYear = new Date().getFullYear();

  const {
    token: { colorBorder, colorError }
  } = theme.useToken();

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    setBreadCrumb({
      title: "ULP Target",
      icon: "pincodeStore",
      path: Paths.ulpTarget
    });
    form.setFieldValue("year", currentYear);
    getULPTargets(currentYear);
  }, []);

  const { mutate: insertTargets, isLoading: insertTargetsLoading } = useMutation(
    (data) => apiService.addULPTargets(data),
    {
      onSuccess: (res) => {
        if (res.success) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
        }
      },
      onError: (err) => {
        console.log(err, "Error occured in insertTargets");
        enqueueSnackbar(err.message, snackBarErrorConf);
      }
    }
  );

  const { isLoading: targetsLoading, mutate: getULPTargets } = useMutation(
    (data) => apiService.getTargets(data),
    {
      onSuccess: (res) => {
        if (res.success) {
          console.log(res, "check initial res values");

          form.setFieldValue("ulpTarget", res.data);
        }
      },
      onError: (err) => {
        console.log(err, "error occured in getTargets");
        enqueueSnackbar(err.message, snackBarErrorConf);
      }
    }
  );

  //Function to submit the form
  const submitForm = (values) => {
    const data = values?.ulpTarget;
    const year = form.getFieldValue("year");

    const cleanedData = data.map((item) => {
      const cleanedItem = { ...item };

      Object.keys(cleanedItem).forEach((key) => {
        if (key.startsWith("pv_")) {
          const val = cleanedItem[key];
          cleanedItem[key] = !val ? null : Number(val);
        }
      });

      cleanedItem.no_of_prospect = Number(cleanedItem.no_of_prospect);
      cleanedItem.year = Number(year);

      return cleanedItem;
    });
    const dataObj = {
      year,
      targets: cleanedData
    };

    insertTargets(dataObj);
  };

  // Generate 100 years starting from current year
  const yearOptions = Array.from({ length: 100 }, (_, i) => {
    const year = currentYear + i;
    return {
      label: year.toString(),
      value: year.toString()
    };
  });

  //Function to handle the year change
  const handleYearChange = (val) => {
    if (val) {
      getULPTargets(val);
    }
  };

  //Funtion to disable the submit form button
  const disableButton = () => {
    const targets = form.getFieldValue("ulpTarget");
    return !targets;
  };

  const onChangeInput = (val) => {
    console.log(val, "Check value");
    form.setFieldValue("");
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) &&
    actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Spin fullscreen spinning={insertTargetsLoading || targetsLoading} />
      <Form
        layout="vertical"
        form={form}
        name="ulpTargetForm"
        onFinish={submitForm}
        autoComplete="off"
        initialValues={{ ulpTarget: [{}] }}>
        <Flex align="start" justify={"flex-end"} className="fullWidth" gap={8}>
          {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.ulpTarget !== curr.ulpTarget}>
              {() => (
                <Button loading={false} type="primary" htmlType="submit" disabled={disableButton()}>
                  Save
                </Button>
              )}
            </Form.Item>
          )}
        </Flex>
        <div className="">
          {/* Year Dropdown */}
          <Form.Item
            label="Year"
            name="year"
            initialValue={yearOptions[0].value} // default to current year
            rules={[{ required: true, message: "Please select year" }]}>
            <Select
              showSearch
              placeholder="Select Year"
              options={yearOptions}
              filterOption={(input, option) =>
                option?.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleYearChange}
            />
          </Form.Item>

          <Form.List name="ulpTarget">
            {(fields, { add, remove }) => (
              <div
                style={{ display: "flex", rowGap: 16, flexDirection: "column" }}
                className="mt-32">
                {fields.map((field, index) => (
                  <Card key={field.key}>
                    <Flex align="center" justify="flex-end">
                      <Popconfirm
                        title="Delete"
                        icon={
                          <DeleteOutlined
                            style={{
                              color: colorError
                            }}
                          />
                        }
                        okButtonProps={{ danger: true }}
                        description="Are you sure you want to delete this ?"
                        onConfirm={() => {
                          remove(field.name);
                        }}
                        onCancel={() => {
                          "";
                        }}
                        okText="Yes"
                        placement="left"
                        cancelText="No">
                        <Button type="default" danger>
                          Delete
                        </Button>
                      </Popconfirm>
                    </Flex>

                    {/* PV for each month */}
                    <Row gutter={[16, 0]}>
                      {[
                        "january",
                        "february",
                        "march",
                        "april",
                        "may",
                        "june",
                        "july",
                        "august",
                        "september",
                        "october",
                        "november",
                        "december"
                      ].map((month) => (
                        <Col xs={24} sm={12} md={6} key={month}>
                          <Form.Item
                            label={`PV ${month.charAt(0).toUpperCase() + month.slice(1)}`}
                            name={[field.name, `pv_${month}`]}
                            validateTrigger="onChange"
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (value === undefined || value === null || value === "") {
                                    return Promise.resolve(); // allow empty, no error
                                  }
                                  if (Number(value) <= 0) {
                                    return Promise.reject(
                                      new Error("Please enter PV greater than zero")
                                    );
                                  }
                                  return Promise.resolve(); // valid > 0
                                }
                              }
                            ]}>
                            <Input
                              onInput={validationNumber}
                              maxLength={10}
                              onChange={() => {
                                onChangeInput(field.name, `pv_${month}`);
                              }}
                            />
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>

                    <Form.Item
                      name={[field.name, "monthValidation"]}
                      validateTrigger="onSubmit"
                      rules={[
                        {
                          validator: validateAnyMonthPV(form, field.name)
                        }
                      ]}
                      className="hideFormInpVal">
                      {/* AntD needs some child element to render errors against */}
                      <span style={{ display: "none" }} />
                    </Form.Item>

                    {/* No of prospects */}
                    <Form.Item
                      label="No of Prospect"
                      name={[field.name, "no_of_prospect"]}
                      rules={[{ required: true, message: "Please enter the number of prospects" }]}>
                      <Input maxLength={10} onInput={validationNumber} />
                    </Form.Item>
                  </Card>
                ))}

                <Button type="dashed" onClick={() => add()} block>
                  + Add ULP Target
                </Button>
              </div>
            )}
          </Form.List>
        </div>

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.ulpTarget?.length !== curr.ulpTarget?.length}>
          {({ getFieldValue }) => {
            const targets = getFieldValue("ulpTarget") || [];
            return targets.length > 1 ? (
              <Flex align="start" justify={"flex-end"} className="fullWidth mt-16">
                {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                  <Form.Item noStyle>
                    <Button
                      loading={false}
                      type="primary"
                      htmlType="submit"
                      disabled={disableButton()}>
                      Save
                    </Button>
                  </Form.Item>
                )}
              </Flex>
            ) : null;
          }}
        </Form.Item>
      </Form>
    </>
  ) : (
    ""
  );
}
