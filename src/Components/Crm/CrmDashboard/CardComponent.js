import React from "react";
import { Card, Col, Flex, Grid, Row, Segmented, Spin, Statistic, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { PermissionAction } from "Helpers/ats.constants";
import { getDateRange, navigatePath } from "CrmHelper/crm.helper";
import { CRM_OPTIONS_TOTAL } from "CrmHelper/crmConstant";

const CardComponent = (props) => {
  const { useBreakpoint } = Grid;
  const navigate = useNavigate();
  const screens = useBreakpoint();
  // check window inner width
  const checkInnerWidth = () => {
    try {
      return !screens.lg && (screens.md || screens.sm || screens.xs);
    } catch (error) {}
  };

  // handle card click
  const handleCardClick = (item) => {
    if (actionsPermissionValidator(Paths.crmOrders, PermissionAction.VIEW)) {
      const path = navigatePath(item);
      navigate(`/${path}`);
    }
  };

  const handleSegment = (value) => {
    const data = getDateRange(value);
    props?.fetchOrderCount(data);
  };

  return (
    <>
      <Col span={24}>
        <Card bordered={true}>
          <Row gutter={[24, 10]}>
            <Col span={24}>
              <Flex justify="space-between" gap={10}>
                <Typography.Title level={5}>{props.title || "N/A"}</Typography.Title>
                <Segmented
                  options={CRM_OPTIONS_TOTAL}
                  className="textCapitalize"
                  onChange={handleSegment}
                />
              </Flex>
            </Col>

            <Col span={24}>
              <Flex gap={10} wrap={checkInnerWidth() ? "wrap" : "nowrap"}>
                {props.data &&
                  props.data.map((item, index) => (
                    <Card
                      size="small"
                      className={`boxShadow fullWidth ${item.gradient} `}
                      key={index}
                      onClick={() => handleCardClick(item)}
                      hoverable>
                      <Row align="middle" gutter={[24, 0]}>
                        <Col xs={18}>
                          <Statistic
                            title={
                              <Typography.Text strong style={{ color: item.type }}>
                                {item.sales}
                              </Typography.Text>
                            }
                            value={item.value}
                            formatter={(value) =>
                              props?.loading ? (
                                <Spin />
                              ) : (
                                <Typography.Title className="removeMargin" level={3}>
                                  {value}
                                </Typography.Title>
                              )
                            }
                          />
                        </Col>
                        <Col span={6}>
                          <Flex align="center" justify="end">
                            <img
                              src={item.icon}
                              style={{ maxWidth: "56px", maxHeight: "50px" }}
                              alt={item.title}
                            />
                          </Flex>
                        </Col>
                      </Row>
                    </Card>
                  ))}{" "}
              </Flex>
            </Col>
          </Row>
        </Card>
      </Col>
    </>
  );
};

export default CardComponent;
