import { UserOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Row, theme, Tree, Typography } from "antd";
import Search from "antd/es/input/Search";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

const TechnicalLeaderTreeView = () => {
  const [searchPayload, setSearchPayload] = useState(null);
  const { apiService } = useServices();
  const [treeData, setTreeData] = useState([]);
  const [expandedKeys, setExpandedKey] = useState([]);
  const [filteredData, setFilteredData] = useState(treeData);

  const {
    token: { colorPrimary, colorErrorText, colorSuccessTextActive }
  } = theme.useToken();

  // api for fetching ab details by ab no
  const { data: fetchData, isLoading } = useQuery(
    ["fetchAbDetailsByAbNo", searchPayload],
    () => apiService.getTechnicalLeaderDetails(searchPayload),
    {
      enabled: !!searchPayload, // Fetch only when payload is available
      onSuccess: (res) => {
        if (res?.success && res?.data) {
          const { dist_name, dist_no } = res.data[0];
          let tempTreeData = [
            {
              title: dist_name,
              key: dist_no
            }
          ];
          setTreeData(tempTreeData);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        const payload = {
          dist_no: val
        };
        setSearchPayload(payload);
      }
    } catch (error) {}
  };

  // handle search clear
  const handleClear = () => {
    //
  };

  const renderTreeNodes = (data) =>
    data?.map((item) => ({
      title: (
        <>
          <Flex gap={10}>
            {item.key == searchPayload?.dist_no ? (
              <>
                <Typography.Title
                  level={5}
                  strong={true}
                  style={{
                    color:
                      item.key == searchPayload?.dist_no ? colorSuccessTextActive : colorPrimary
                  }}>
                  <UserOutlined /> {item.title}
                </Typography.Title>
              </>
            ) : (
              <>
                <Typography.Title
                  level={5}
                  style={{
                    color: colorPrimary
                  }}>
                  <UserOutlined />
                  {` ${item.title} `}
                  <Typography.Text type="secondary">[ Pin Achieved :</Typography.Text>{" "}
                  <Typography.Text style={{ color: colorErrorText }}>
                    {item?.pin_level} ]
                  </Typography.Text>
                  <Typography.Text type="secondary"> [ Current Pin :</Typography.Text>{" "}
                  <Typography.Text>{item?.current_level} ]</Typography.Text>
                </Typography.Title>
              </>
            )}
          </Flex>
        </>
      ),
      key: item.key,
      children: renderTreeNodes(item?.children || []),
      isLeaf: false
    }));

  const { mutate: getDownline } = useMutation(
    (data) => apiService.getTechnicalLeaderDownlineDetails(data),
    {
      onSuccess: async (res, data) => {
        if (res?.success) {
          let tempTreeData = res?.data?.map((item) => ({
            title: item?.dist_name,
            key: item?.dist_no,
            ...item
          }));

          await insertNode(treeData, data?.dist_no, tempTreeData); // fn call to manage expanded rows
          setTreeData(treeData);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  const insertNode = (tree, parentKey, newNode) => {
    try {
      for (let node of tree) {
        // Check if the current node's key matches the parentKey
        if (node.key === parentKey) {
          // Insert the new node into this node's children
          node.children = newNode;
          setExpandedKey((prevKeys) => Array.from(new Set([...prevKeys, parentKey])));
          return tree; // Node inserted, stop further recursion
        }

        // If the node has children, recursively search in them
        if (node.children?.length > 0) {
          const inserted = insertNode(node.children, parentKey, newNode);
          if (inserted) {
            setExpandedKey((prevKeys) => Array.from(new Set([...prevKeys, parentKey])));
            return tree;
          }
          // Stop recursion once the node is inserted
        }
      }
      return false;
    } catch (error) {
      //
    }
    // Return false if the key is not found
  };

  const onNodeClick = (keys, { node }) => {
    try {
      const dist_no = node.key;
      setExpandedKey(keys);
      if (!node.children || (node.children && node.children.length === 0)) {
        getDownline({ dist_no: dist_no });
      }
    } catch (error) {}
  };

  // expand all matching nodes
  const getExpandedKeys = (data) =>
    data.reduce((keys, node) => {
      keys.push(node.key);
      if (node.children) {
        keys.push(...getExpandedKeys(node.children));
      }
      return keys;
    }, []);

  // handle search submit
  const handleSearchSubmit = (value) => {
    try {
      const filterTree = (data) => {
        return data
          .map((node) => {
            const shouldInclude =
              node.title?.toLowerCase()?.includes(value?.toLowerCase()) ||
              node.pin_level?.toLowerCase()?.includes(value?.toLowerCase()) ||
              node.current_level?.toLowerCase()?.includes(value?.toLowerCase());

            if (node.children) {
              const filteredChildren = filterTree(node.children);
              if (filteredChildren.length > 0 || shouldInclude) {
                return { ...node, children: filteredChildren };
              }
            }

            return shouldInclude ? { ...node } : null;
          })
          .filter(Boolean);
      };

      if (value) {
        const filtered = filterTree(treeData);
        setFilteredData(filtered);
        setExpandedKey(getExpandedKeys(filtered));
      } else {
        setFilteredData([]);
        setExpandedKey(getExpandedKeys(treeData));
      }
    } catch (error) {}
  };

  const handleSearch = (e) => {
    if (!e.target.value) {
      setFilteredData([]);
      setExpandedKey(getExpandedKeys(treeData));
    }
  };
  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"technical_leader_tree_view"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
      />
      <Row gutter={[20, 24]}>
        {fetchData ? (
          <Card className="fullWidth marginTop24">
            <Search
              className="search_bar_box"
              size="large"
              placeholder="Search..."
              onSearch={handleSearchSubmit}
              onChange={handleSearch}
              allowClear
              onPressEnter={(e) => handleSearchSubmit(e.target.value)}
            />
            <Tree
              className="marginTop24"
              treeData={renderTreeNodes(filteredData?.length > 0 ? filteredData : treeData)}
              defaultExpandAll={true}
              showLine={true}
              showIcon={true}
              expandedKeys={expandedKeys}
              onExpand={onNodeClick}
            />
          </Card>
        ) : (
          <>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title={"Search by Associate Buyer Number"}
              subTitle={
                "Quickly search the Associate Buyer Number to process the Technical Leader Tree View"
              }
              image={searchByIcon}
            />
          </>
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default TechnicalLeaderTreeView;
