import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { PermissionAction, RULES_MESSAGES, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Button, Col, Flex, Form, Input, Row, Select, Switch, Typography } from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import dragIcon from "Static/img/dragIcon.svg";

export default function AddCSO() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { apiService } = useServices();
  const [depotLists, setDepotLists] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const currentCSOSequenceVal = Form.useWatch(["cso_sequence"], form);
  const { setBreadCrumb } = useUserContext();

  const { refetch: getCSODepots } = useQuery("getCSODepots", () => apiService.getCSODepots(), {
    enabled: false, // Enable the query by default
    onSuccess: (data) => {
      try {
        if (data) {
          let tempDepotList = data.data.data
            ?.filter((item) => item?.depot_code !== "D001")
            ?.map((item) => ({
              label: item?.depot_name,
              value: item?.depot_code + "-" + item?.depot_name
            }));
          setDepotLists(tempDepotList);
        }
      } catch (error) {}
    },
    onError: (error) => {
      // Handle errors by displaying a Snackbar notification
      // enqueueSnackbar(error.message, snackBarErrorConf);
    }
  });

  const handleRemoveField = (name, remove) => {
    try {
      if (form.getFieldValue(["cso_sequence", name, "type"] == "depot")) {
        const depots = [...depotLists];
        const depot = form.getFieldValue(["cso_sequence", name, "depotId"]);
        const tempDepot = depots?.find((item) => item?.value == depot);
        setDepotLists([...depots, tempDepot]);
      }
      setErrorMessage(null);
      remove(name);
    } catch (error) {}
  };

  const isTypeHoExistExceptLast = (arr) => {
    try {
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i].type == "ho") {
          return true;
        }
      }
      return false;
    } catch (error) {}
  };

  const isTypePUCExistExecptFirst = (arr) => {
    try {
      for (let i = 1; i < arr.length; i++) {
        if (arr[i].type == "puc") {
          return true;
        }
      }
      return false;
    } catch (error) {}
  };

  const onFinish = (value) => {
    try {
      if (value?.cso_sequence?.some((item) => item.type === "ho")) {
        const typeHoExistExceptLast = isTypeHoExistExceptLast(value?.cso_sequence);
        const typePUCExistExecptFirst = isTypePUCExistExecptFirst(value?.cso_sequence);
        if (typeHoExistExceptLast) {
          setErrorMessage("Head Office should be selected at last row only.");
        } else {
          if (typePUCExistExecptFirst) {
            setErrorMessage("PUC should be selected at first row only.");
          } else {
            let tempObj = { ...value, cso_status: value?.cso_status ? "active" : "inactive" };
            if (errorMessage == null) {
              addCSO(tempObj);
            }
          }
        }
      } else {
        value?.cso_sequence
          ? setErrorMessage("Please select Head Office.")
          : setErrorMessage("Please add field.");
      }
    } catch (error) {}
  };

  const { mutate: addCSO, isLoading } = useMutation(
    "addCSO",
    (payload) => apiService.addCSO(payload),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.shippingSequencesList}`);
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const isDepotIdUnique = (array) => {
    try {
      // Extract all depotIds except null values
      const depotIds = array.map((obj) => obj.depotId).filter((id) => id !== null);
      const uniqueDepotIds = new Set(depotIds); // Convert to Set to remove duplicates
      return depotIds.length === uniqueDepotIds.size; // If lengths match, all IDs are unique
    } catch (error) {}
  };

  const checkSelectedDepot = (name) => (_, value) => {
    try {
      if (value) {
        const tempCSOsequenceValue = form.getFieldValue(["cso_sequence"]);
        if (isDepotIdUnique(tempCSOsequenceValue)) {
          tempCSOsequenceValue?.forEach((item, index) => {
            form.setFields([{ name: ["cso_sequence", index, "depotId"], errors: [] }]);
          });
        }
        const depots = tempCSOsequenceValue
          .filter((item, index) => index !== name)
          .map((item) => item.depotId); // Extract existing depotIds
        if (depots.includes(value)) {
          return Promise.reject(
            "This depot has already been selected. Please choose another depot."
          );
        }
      }
      return Promise.resolve();
    } catch (error) {}
  };

  const handleType = (val, name) => {
    try {
      if (val) {
        form.setFieldValue(["cso_sequence", name, "depotId"], null);
        const types = form
          .getFieldValue("cso_sequence")
          ?.filter((item, index) => index !== name)
          ?.map((item) => item?.type);
        if (name !== 0 && val == "puc" && types.includes("depot")) {
          form.setFieldValue(["cso_sequence", name, "type"], null);
          form.setFields([
            { name: ["cso_sequence", name, "type"], errors: ["PUC can not be selcted after Depot"] }
          ]);
        } else {
          form.setFieldValue(["cso_sequence", name, "type"], val);
          setErrorMessage(null);
        }

        form.setFieldValue(["cso_sequence", name, "depotId"], null);
        form.setFields([{ name: ["cso_sequence", name, "depotId"], errors: [] }]);
      }
    } catch (error) {}
  };

  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.ADD)
      ? getCSODepots()
      : navigate("/", { state: { from: null }, replace: true });
    setBreadCrumb({
      title: "Shipping Sequence",
      icon: "cso",
      titlePath: Paths.shippingSequencesList,
      subtitle: "Add Shipping Sequence",
      path: Paths.users
    });

    form.setFieldValue("cso_status", true);
  }, []);

  const grid = 8;

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: "10px 0",
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "white" : "#fff",

    // styles we need to apply on draggables
    ...draggableStyle
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "white" : "#fff",
    padding: grid,
    width: "100%"
  });

  const onDragEnd = (result) => {
    try {
      // dropped outside the list
      if (!result.destination) {
        return;
      }

      if (result.source.index !== result.destination.index) {
        const sourceTypeVal = form.getFieldValue(["cso_sequence", result.source.index, "type"]);
        const sourceDepotVal = form.getFieldValue(["cso_sequence", result.source.index, "depotId"]);
        const destinationTypeVal = form.getFieldValue([
          "cso_sequence",
          result.destination.index,
          "type"
        ]);
        const destinationDepotVal = form.getFieldValue([
          "cso_sequence",
          result.destination.index,
          "depotId"
        ]);

        form.setFieldValue(["cso_sequence", result.destination.index, "type"], sourceTypeVal);
        form.setFieldValue(["cso_sequence", result.destination.index, "depotId"], sourceDepotVal);

        form.setFieldValue(["cso_sequence", result.source.index, "type"], destinationTypeVal);
        form.setFieldValue(["cso_sequence", result.source.index, "depotId"], destinationDepotVal);

        // form.validateFields()
        setErrorMessage(null);
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Typography.Title level={5}>Add Shipping Sequence</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="cso_name"
                  label="Shipping Sequence Name"
                  type="text"
                  rules={[
                    { required: true, message: "Shipping Sequence is required" },
                    {
                      pattern: /^.{1,50}$/,
                      message: RULES_MESSAGES.MIN_MAX_LENGTH_MESSAGE
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
                  <Input placeholder="Enter Shipping Sequence Name" size="large" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="cso_status" label="Status">
                  <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Typography.Title level={5}>Shipping Sequence</Typography.Title>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row gutter={[24, 0]}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Form.List name="cso_sequence">
              {(fields, { add, remove }) => (
                <>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}>
                        <>
                          <>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <Draggable key={index} draggableId={index.toString()} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                    )}>
                                    <Row gutter={[20, 0]}>
                                      <Col span={1}>
                                        <Flex
                                          align="center"
                                          justify="flex-end"
                                          className="fullHeight">
                                          <Typography.Text code>{1 + name}</Typography.Text>
                                        </Flex>
                                      </Col>
                                      <Col span={11}>
                                        <Form.Item
                                          style={{ margin: "0" }}
                                          {...restField}
                                          name={[name, "type"]}
                                          rules={[
                                            {
                                              required: true,
                                              message: "Missing type"
                                            }
                                          ]}>
                                          <Select
                                            block
                                            size="large"
                                            placeholder="Select  Type"
                                            onChange={(val) => handleType(val, name)}
                                            options={[
                                              // {
                                              //   value: "puc",
                                              //   label: "PUC"
                                              // },
                                              {
                                                value: "depot",
                                                label: "Depot"
                                              },
                                              {
                                                value: "ho",
                                                label: "Head Office"
                                              }
                                            ]}
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col span={10}>
                                        <Form.Item
                                          style={{ margin: "0" }}
                                          {...restField}
                                          name={[name, "depotId"]}
                                          rules={[
                                            {
                                              required:
                                                currentCSOSequenceVal[name]?.type == "depot"
                                                  ? true
                                                  : false,
                                              message: "Depot is required"
                                            },
                                            { validator: checkSelectedDepot(name) }
                                          ]}>
                                          <Select
                                            block
                                            size="large"
                                            filterOption={(input, option) =>
                                              (option?.label?.toLowerCase() ?? "").includes(
                                                input?.toLowerCase()
                                              )
                                            }
                                            showSearch
                                            placeholder={
                                              currentCSOSequenceVal[name]?.type == "depot"
                                                ? "Select Depot"
                                                : "N/A"
                                            }
                                            disabled={
                                              currentCSOSequenceVal[name]?.type == "depot"
                                                ? false
                                                : true
                                            }
                                            options={depotLists || []}
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col span={1}>
                                        <Flex
                                          align="center"
                                          justify="center"
                                          className="fullHeight">
                                          <img src={dragIcon} />
                                        </Flex>
                                      </Col>
                                      <Col span={1}>
                                        <Flex
                                          align="center"
                                          justify="flex-start"
                                          className="fullHeight">
                                          <DeleteOutlined
                                            style={{ fontSize: "large", color: "#DC2626" }}
                                            onClick={() => handleRemoveField(name, remove)}
                                          />
                                        </Flex>
                                      </Col>
                                    </Row>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </>
                        </>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <Col span={24}>
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          setErrorMessage(null);
                          add();
                        }}
                        block
                        icon={<PlusOutlined />}>
                        Add field
                      </Button>
                    </Form.Item>
                  </Col>
                </>
              )}
            </Form.List>
          </DragDropContext>
          {errorMessage && (
            <Typography.Paragraph type="danger">{errorMessage}</Typography.Paragraph>
          )}
        </Row>

        <Flex gap="middle" align="start" vertical>
          <Flex justify={"flex-end"} align={"center"} className="width_full" gap={10}>
            <NavLink to={"/" + Paths.shippingSequencesList}>
              <Button style={StyleSheet.backBtnStyle}>Cancel</Button>
            </NavLink>
            {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
              <Button type="primary" htmlType="submit" disabled={isLoading}>
                Add
              </Button>
            )}
          </Flex>
        </Flex>
      </Form>
    </>
  ) : (
    ""
  );
}
