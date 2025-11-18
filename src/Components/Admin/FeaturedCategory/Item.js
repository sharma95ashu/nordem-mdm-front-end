/* eslint-disable no-undef */
import { EditOutlined } from "@ant-design/icons";
import { Avatar, Flex, theme, Typography } from "antd";
import React, { forwardRef } from "react";
import dummyImg from "Static/img/user.jpg";
const Item = forwardRef(
  ({ id, index, withOpacity, isDragging, style, handleModal, transform, ...props }, ref) => {
    const {
      token: { colorPrimary }
    } = theme.useToken();
    const { catName, filePath, type, dragSourceAndDestination, featured_category_id } = props;

    const StyleSheet = {
      container1: {
        opacity: withOpacity ? "0.5" : "1",
        transformOrigin: "50% 50%",
        height: "auto",
        width: "100%",
        borderRadius: "10px",
        cursor: isDragging ? "grabbing" : "grab",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: dragSourceAndDestination?.over == "container2" ? "row" : "",
        justifyContent: dragSourceAndDestination?.over == "container2" ? "start" : "start",
        alignItems: dragSourceAndDestination?.over == "container2" ? "center" : "start",
        padding: dragSourceAndDestination?.over == "container2" ? "12px" : "0px",
        boxShadow: isDragging
          ? "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px"
          : "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
        marginBottom: "0px",
        marginRight: "0px",
        ...style
      },
      container2: {
        opacity: withOpacity ? "0.5" : "1",
        transformOrigin: "50% 50%",
        width: "100%",
        borderRadius: "10px",
        cursor: isDragging ? "grabbing" : "grab",
        backgroundColor: "#ffffff",
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        boxShadow: isDragging
          ? "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px"
          : "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
        marginBottom: "10px",
        marginRight: "0px",
        padding: "16px",
        ...style
      },
      container2Over: {
        opacity: withOpacity ? "0.5" : "1",
        width: "200px",
        height: "200px",
        borderRadius: "10px",
        cursor: isDragging ? "grabbing" : "grab",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        boxShadow: isDragging
          ? "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px"
          : "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
        padding: "16px"
        // ...style
      },
      container1Over: {
        opacity: withOpacity ? "0.5" : "1",
        height: "232px",
        width: "180px",
        borderRadius: "10px",
        cursor: isDragging ? "grabbing" : "grab",
        backgroundColor: "#ffffff",
        padding: "0px",
        boxShadow: isDragging
          ? "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px"
          : "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px"
        // ...style
      }
    };

    // handle edit btn click
    const handleNavigate = (e) => {
      e.stopPropagation();
      handleModal(featured_category_id);
    };

    return (
      <>
        {type === "container1" ? (
          Object.keys(dragSourceAndDestination || {}).length === 0 ||
          dragSourceAndDestination.over !== "container2" ? (
            <div className="padding-sm">
              <Flex ref={ref} style={StyleSheet.container1} {...props} key={id} vertical>
                <Avatar shape={"square"} className="container1-img" src={filePath || dummyImg} />
                <Flex vertical className="width100" style={{ padding: "0px 5px" }}>
                  <Flex justify="center" align="center">
                    <Typography.Text size={14} className="categorytitle fontweight600">
                      {isDragging ? `${catName}` : `${index + 1}. ${catName}`}
                    </Typography.Text>
                  </Flex>
                  {featured_category_id ? (
                    <Flex
                      style={{ cursor: "pointer", height: "30px", color: colorPrimary }}
                      justify="center"
                      align="center"
                      onClick={handleNavigate}>
                      <>
                        <EditOutlined />
                        <Typography.Text style={{ marginLeft: "5px", color: colorPrimary }}>
                          Edit
                        </Typography.Text>
                      </>
                    </Flex>
                  ) : (
                    <div style={{ height: "30px" }}></div>
                  )}
                </Flex>
              </Flex>
            </div>
          ) : (
            // conatinver
            <Flex style={StyleSheet.container2Over} key={id}>
              <Avatar shape={"circle"} className="container2overImg" src={filePath || dummyImg} />
              <Typography.Text
                style={{ fontSize: "10px", transform: "scale(1,3)" }}
                className="categorytitle">
                {catName}
              </Typography.Text>
            </Flex>
          )
        ) : Object.keys(dragSourceAndDestination || {}).length === 0 ||
          dragSourceAndDestination.over !== "container1" ? (
          <Flex ref={ref} style={StyleSheet.container2} {...props} key={id}>
            <div className="width40">
              <Avatar
                shape={"circle"}
                size={64}
                className="mariginRight20"
                src={filePath || dummyImg}
              />
            </div>
            <div className="width60">
              <Typography.Text size={16} className="categorytitle">
                {catName}
              </Typography.Text>
            </div>
          </Flex>
        ) : (
          <Flex style={StyleSheet.container1Over} key={id} vertical>
            <div>
              <img className="container1overImg" src={filePath || dummyImg} />
              <Flex gap={0} vertical className="width100">
                <Flex justify="center" align="center">
                  <Typography.Text className="categorytitle fontweight600">
                    {isDragging ? `${catName}` : `${index + 1}. ${catName}`}
                  </Typography.Text>
                </Flex>
              </Flex>
            </div>
          </Flex>
        )}
      </>
    );
  }
);

export default Item;
