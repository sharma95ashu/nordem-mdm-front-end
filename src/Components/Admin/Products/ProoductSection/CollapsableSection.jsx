import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, Collapse, Flex, Popconfirm, Row, Tag, theme, Typography } from "antd";
import React, { useEffect, useState } from "react";
const { Panel } = Collapse;

function CollapsableSection({ productSection, getUpdatedSection, getEditData }) {
  const [productSectionData, setProductSectionData] = useState(productSection || []);

  useEffect(() => {
    setProductSectionData(productSection);
  }, [productSection]);

  const {
    token: { colorError }
  } = theme.useToken();

  //Function to edit the product section data
  const handleEdit = (data, i) => {
    try {
      getEditData(data, i);
    } catch (error) { }
  };

  //Function to delete the product section data
  const handleDelete = (i) => {
    try {
      let d = [...productSectionData];
      d.splice(i, 1);
      setProductSectionData(d);
      getUpdatedSection(d);
    } catch (error) { }
  };

  return (
    <div>
      <div style={{ cursor: "pointer" }} className="productSection">
        <Row gutter={[0, 12]} className="mt-24">
          {productSectionData?.length > 0 &&
            productSectionData.map((data, index) => {
              return (
                <Col span={24} key={index}>
                  <Collapse
                    className="panelHeader"
                    key={index}
                    defaultActiveKey={["1"]}
                    accordion={true}
                    expandIconPosition="start">
                    <Panel
                      header={
                        <>
                          <Flex justify="space-between" align="">
                            <Flex justify="center" align="center">
                              <Typography.Title level={5} className="removeMargin">
                                {data.title}
                              </Typography.Title>
                            </Flex>

                            <Flex>

                              <Flex justify="center" align="center">
                                <div>
                                  {
                                    data?.status == 'active' ? (
                                      <Tag color="success">Active</Tag>
                                    ) : (
                                      <Tag color="error">Inactive</Tag>
                                    )
                                  }
                                </div>
                              </Flex>

                              <Button
                                icon={<EditOutlined />}
                                type="text"
                                className="ml-4"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent Collapse trigger

                                  handleEdit(data, index);
                                }}>
                                Edit
                              </Button>

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
                                description="Are you sure to delete this ?"
                                onConfirm={(e) => {
                                  e.stopPropagation(); // Prevent Collapse trigger

                                  handleDelete(index);
                                }}
                                onCancel={(e) => {
                                  e.stopPropagation();
                                }} // Prevent Collapse trigger on cancel
                                okText="Yes"
                                placement="left"
                                cancelText="No">
                                <Button
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  danger
                                  onClick={(e) => e.stopPropagation()}>
                                  Delete
                                </Button>
                              </Popconfirm>
                            </Flex>
                          </Flex>
                        </>
                      }
                      key={0}>
                      <div dangerouslySetInnerHTML={{ __html: data.long_desc }}></div>
                    </Panel>
                  </Collapse>
                </Col>
              );
            })}
        </Row>
      </div>
    </div>
  );
}

export default CollapsableSection;
