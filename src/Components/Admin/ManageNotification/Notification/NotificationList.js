/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
    Table,
    Pagination,
    Spin,
    Input,
    Tag,
    Button,
    Col,
    Row,
    Typography,
    Popconfirm,
    Divider,
    theme,
    Flex,
    TreeSelect,
    Grid
} from "antd";

import { PlusOutlined, DeleteOutlined, FilterOutlined } from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getDateTimeFormat } from "Helpers/ats.helper";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate } from "react-router-dom";
import { tabletWidth } from "Helpers/ats.constants";
import {
    actionsPermissionValidator,
} from "Helpers/ats.helper";
import { Content } from "antd/es/layout/layout";
import FormItem from "antd/es/form/FormItem";

export default function NotificationList() {
    const { Search } = Input;
    const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
    const { apiService } = useServices();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const searchEnable = useRef();
    const [current, setCurrent] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [total, setTotal] = useState(0);
    const [storeInputValue, setstoreInputValue] = useState("");
    const [loader, setLoader] = useState(false);
    const [checkFilter, setCheckFilter] = useState(false);
    const [submitSearchInpt, setSubmitSearchInput] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [delAllVisible, setDelAllVisible] = useState(false);
    const [categoryValue, setCategoryValue] = useState(undefined);
    const [category, setCategory] = useState([]);


    const {
        token: {
            borderRadiusLG,
            paddingContentHorizontal,
            colorBorder,
            colorError,
            colorPrimaryBg,
            colorPrimaryBorder,
            colorPrimary }
    } = theme.useToken();

    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

    // check window inner width
    const checkInnerWidth = () => {
        try {
            return !screens.lg && (screens.md || screens.sm || screens.xs);
        } catch (error) { }
    };

    /**
     * style
     */
    const StyleSheet = {
        paginationStyle: {
            marginTop: 25
        },
        verDividerStyle: {
            borderColor: colorBorder,
            height: 20
        },
        contentSubStyle: {
            background: colorPrimaryBg,
            padding: paddingContentHorizontal,
            borderRadius: borderRadiusLG,
            marginBottom: 10,
            border: "1px solid",
            borderColor: colorPrimaryBorder,
            marginTop: 5
        },

        filterIconStyle: {
            marginRight: 6,
            marginTop: 2,
            color: colorPrimary
        },
        formItemStyle: {
            marginBottom: 0
        },

    };

    // Column list for table
    const columns = [
        {
            title: "Notification ID",
            dataIndex: "notification_id",
            sorter: (a, b) => a.notification_id - b.notification_id,
            width: checkInnerWidth() ? "200px" : "auto",
            key: "notification_id"
        },
        {
            title: "Title",
            dataIndex: "notification_title",
            sorter: (a, b) => a.notification_title.localeCompare(b.notification_title),
            width: checkInnerWidth() ? "200px" : "auto",
            key: "notification_title"
        },
        {
            title: "Message",
            dataIndex: "notification_message",
            sorter: (a, b) => a.notification_message.localeCompare(b.notification_message),
            width: checkInnerWidth() ? "200px" : "auto",
            key: "notification_message"
        },
        {
            title: "Created On",
            dataIndex: "created_at",
            sorter: (a, b) => a.created_at.localeCompare(b.created_at),
            width: checkInnerWidth() ? "200px" : "auto",
            render: (value) => getDateTimeFormat(value),
            key: "created_at"
        },
        {
            title: "Status",
            width: "120px",
            dataIndex: "status",
            key: "status",
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (value) => (
                <>
                    {value === "active" ? (
                        <Tag color="success">Active</Tag>
                    ) : (
                        <Tag color="error">Inactive</Tag>
                    )}
                </>
            )
        }
    ];

    if (
        actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ||
        actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE)
    ) {
        columns.push({
            align: 'center',
            title: "Action",
            dataIndex: "action",
            width: "190px",
            key: "action",
            fixed: "right",
            render: (text, record) => (
                <Flex gap="small" justify="center" align="center">

                    {record.is_sent ? (
                        <>
                            <Button type="default" disabled>
                                Sent
                            </Button>
                            <Divider style={StyleSheet.verDividerStyle} type="vertical" />
                            <Button type="default" primary onClick={() => handleEdit(record)}>View</Button>
                        </>
                    ) : (
                        <Button disabled={record.status === "active" ? false : true} type="default" onClick={() => handleSend(record)}>
                            Send
                        </Button>
                    )}

                    {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && !record.is_sent && (
                        <>
                            <Divider style={StyleSheet.verDividerStyle} type="vertical" />
                            <Button type="default" primary onClick={() => handleEdit(record)}>Edit</Button>
                        </>
                    )}


                    {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) &&
                        actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) &&
                        !record.is_sent && (
                            <Divider style={StyleSheet.verDividerStyle} type="vertical" />
                        )}

                    {actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) && !record.is_sent && (
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
                            onConfirm={() => {
                                handleDelete(record);
                            }}
                            onCancel={() => { "" }}
                            okText="Yes"
                            placement="left"
                            cancelText="No">
                            <Button type="default" danger>
                                Delete
                            </Button>
                        </Popconfirm>
                    )}

                </Flex>
            )
        });
    }

    // Function to fetch notification data
    const fetchTableData = async (reset = false) => {
        try {

            // Define the base URL for the API endpoint
            let baseUrl = `/notification_list/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

            // Flag to check if any filter value is empty
            let isAnyValueEmpty = false;

            // Check if category is provided, update isAnyValueEmpty accordingly
            if (categoryValue && !reset && categoryValue !== "") {
                isAnyValueEmpty = true;
            }

            // Set the checkFilter state to indicate if any filter value is empty
            setCheckFilter(isAnyValueEmpty);

            // Create filterData object with category id as a key-value pair
            const filterData = {
                ...{ notification_category_id: categoryValue }
            };

            // Convert filterData to JSON string
            const convertData = JSON.stringify(filterData);

            // Construct parameters for the API request
            const params = {
                ...(searchTerm && { searchTerm: searchTerm.trim() }),
                ...(isAnyValueEmpty && {
                    filterTerm: convertData
                })
            };

            // Construct the complete API URL with parameters
            const apiUrl = `${baseUrl}?${new URLSearchParams(params).toString()}`;

            // Make an API call to get the table data
            const data = await apiService.getRequest(apiUrl);

            // Check if the API call is successful
            if (data.success) {
                searchEnable.current = false;
                setTotal(data?.data?.total_count);
                let tableData = data?.data?.data.map((item, index) => ({ ...item, key: index }));
                // Return the fetched data
                return tableData;
            }
        } catch (error) {
            // Handle errors by displaying a Snackbar notification
        }
    };


    // Function to delete notification
    const { mutate: deleteMutate } = useMutation(
        // Mutation function to handle the API call for creating a new notifications
        (data) => apiService.deleteNotification(data.load),
        {
            // Configuration options for the mutation
            onSuccess: (res, payload) => {
                if (res.success) {
                    if (data?.length == payload?.load?.notificationIds?.length) {
                        setCurrent(1);
                    }

                    // Display a success Snackbar notification with the API response message
                    enqueueSnackbar(res.message, snackBarSuccessConf);
                    setSelectedRowKeys([]);
                    setDelAllVisible(false);

                    // Invalidate the query in the query client to trigger a refetch
                    queryClient.invalidateQueries("fetchnotificationData");
                    refetch();
                }
            },
            onError: (error) => {
                setSelectedRowKeys([]);
            }
        }
    );

    // Destructure data, mutate function, loading status, and refetching status from useMutation hook
    const { data, mutate: refetch, isLoading } = useMutation("fetchnotificationData", fetchTableData);

    const filterDeleteIds = (deleteArr) => {
        try {
            const filteredKeys = data
                .filter((obj) => deleteArr.includes(obj.key))
                .map((obj) => obj.notification_id);
            return filteredKeys;
        } catch (error) { }
    };

    // Function to handle deletion of notifications
    const handleDelete = (data) => {
        try {
            // Create a request body with notificationsIds array
            const body = {
                notificationIds: Array.isArray(data) ? filterDeleteIds(data) : [data.notification_id]
            };

            // Define the request object with the API endpoint and request body
            let obj = { load: body };

            // Perform the API call for notifications deletion
            deleteMutate(obj);
        } catch (error) { }
    };

    const handleSend = (data) => {
        try {
            // Create a request body with notificationsIds array
            const body = {
                notificationId: data.notification_id
            };
            let obj = { load: body };
            mutate(obj);
        } catch (error) {
        }
    };

    // UseMutation hook for send via API
    const { mutate } = useMutation(
        // Mutation function to handle the API call for send
        (data) =>
            apiService.sendNotification(data.load.notificationId),
        {
            // Configuration options for the mutation
            onSuccess: (data) => {

                // Display a success Snackbar notification with the API response message
                enqueueSnackbar(data.message, snackBarSuccessConf);

                // Navigate to the current window pathname after removing a specified portion
                // navigate(0);
                refetch();


                // Invalidate the "getAllRoles" query in the query client to trigger a refetch
                queryClient.invalidateQueries("fetchNotificationData");
            },
            onError: (error) => {

                // Handle errors by displaying an error Snackbar notification
                enqueueSnackbar(error.message, snackBarErrorConf);
            }
        }
    );


    // Function to handle Edit of notifications
    const handleEdit = (data) => {
        navigate(`/${Paths.notificationEdit}/${data.notification_id}`);
    };

    // Handle key press event to detect "Enter" key and call handleSearchSubmit
    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSearchSubmit();
        }
    };
    // Calling api when click pagination
    useEffect(() => {
        actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
            ? refetch()
            : navigate("/", { state: { from: null }, replace: true });
    }, [current, pageSize]);

    // Search table data clear input then call api
    useEffect(() => {
        if (searchTerm === "" && submitSearchInpt) {
            actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
                ? refetch()
                : navigate("/", { state: { from: null }, replace: true });
            setSubmitSearchInput(false);
            setstoreInputValue("");
        }
    }, [searchTerm, submitSearchInpt]);

    // Run useEffect to get the updated data when a user changes category
    useEffect(() => {
        refetch();
    }, [categoryValue])

    // handle table search row data
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // search bar button when click search button then call api
    const handleSearchSubmit = () => {
        if (searchTerm !== null && searchTerm !== "" && searchTerm !== storeInputValue) {

            searchEnable.current = true;
            actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
                ? refetch()
                : navigate("/", { state: { from: null }, replace: true });

            setSubmitSearchInput(true);
            setstoreInputValue(searchTerm.trim());
        }
    };

    /**
  * function to filter by label in multi select dropdown
  * @param {} inputValue
  * @param {*} treeNode
  * @returns
  */
    const filterTreeNode = (inputValue, treeNode) => {
        // Check if the input value matches any part of the label of the treeNode

        return treeNode.label.toLowerCase().includes(inputValue.toLowerCase());
    };




    const apiUrl = `/notification_list/notification-categories-all/0/200`;

    // UseQuery hook for fetching data of a All Category from the API
    useQuery(
        "getAllCategory",

        // Function to fetch data of a single Category using apiService.getRequest
        () => apiService.getRequest(apiUrl),
        {
            // Configuration options
            enabled: true, // Enable the query by default
            onSuccess: (data) => {
                // Filtering category which has no sub category
                if (data.success) {
                    const categories = data?.data?.data?.map(item => ({ value: item?.notification_category_id, label: item?.notification_category_name })) || [];
                    setCategory(categories);
                }
            },
            onError: (error) => {
                // Handle errors by displaying a Snackbar notification
                enqueueSnackbar(error.message, snackBarErrorConf);
            }
        }
    );



    /**
   * Filter rest
   */
    const handleReset = () => {
        setCategoryValue(null);
        setCurrent(1);
        // Reset filter true
        refetch(true);
        setSearchTerm("")
    };

    /**
     * useEffect function to set breadCrumb data
     */
    useEffect(() => {
        setBreadCrumb({
            title: "Notification",
            icon: "manageNotification",
            path: Paths.users
        });
    }, []);

    const onSelectChange = (newSelectedRowKeys) => {
        if (newSelectedRowKeys.length >= 1) {
            setDelAllVisible(true);
        } else {
            setDelAllVisible(false);
        }

        try {
            setSelectedRowKeys(newSelectedRowKeys);
        } catch (error) { }
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    };


    return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
        <>
            <Typography.Title level={5}>Notifications</Typography.Title>
            <Spin spinning={loader} fullscreen />
            <>
                <Row gutter={[0, 6]} >
                    <Col className="gutter-row" span={24}>
                        <Flex justify="end" gap="middle" >

                            <Flex justify="space-between" gap="middle">
                                {actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) &&
                                    delAllVisible && (
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
                                            description="Are you sure to delete ?"
                                            onConfirm={() => {
                                                handleDelete(selectedRowKeys);
                                            }}
                                            onCancel={() => {
                                                //
                                            }}
                                            okText="Yes"
                                            placement="left"
                                            cancelText="No">
                                            <Button
                                                type="default"
                                                size="large"
                                                danger
                                                disabled={selectedRowKeys?.length > 0 ? false : true}>
                                                Delete
                                            </Button>
                                        </Popconfirm>
                                    )}

                                {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                                    <NavLink to={`/${Paths.notificationAdd}`}>
                                        <Button type="primary" block size="large" className="wrapButton">
                                            <PlusOutlined />
                                            Add New
                                        </Button>
                                    </NavLink>
                                )}
                            </Flex>
                        </Flex>
                    </Col>

                    <Col className="gutter-row" span={24}>
                        <Content style={StyleSheet.contentSubStyle}>
                            <Row>
                                <Col className="gutter-row" >
                                    <FormItem
                                        style={StyleSheet.formItemStyle}>

                                    </FormItem>
                                </Col>
                                <Col flex="auto">
                                    <Search
                                        addonBefore={
                                            <TreeSelect
                                                allowClear
                                                showSearch
                                                treeDefaultExpandAll
                                                className="treeselectCustomCss"
                                                value={categoryValue || "All Category"}
                                                size="large"
                                                treeData={category}
                                                filterTreeNode={filterTreeNode}
                                                onChange={(value) => {
                                                    setCategoryValue(value);
                                                    document.activeElement.blur()
                                                }}
                                                onClear={() => {
                                                    handleReset();
                                                    document.activeElement.blur();
                                                }}
                                                placeholder="Select Category"
                                            />
                                        }
                                        size="large"
                                        placeholder="Search notifications within selected category..."
                                        enterButton="Search"
                                        value={searchTerm}
                                        onSearch={handleSearchSubmit}
                                        onChange={handleSearch}
                                        onKeyPress={handleKeyPress}
                                        allowClear
                                        className="custom-input-hover"
                                    />
                                </Col>
                            </Row>
                            <Row className="noteStyle">
                                Note: Use search category to get all notifications related to the selected category.
                            </Row>
                        </Content>
                    </Col>



                </Row>
            </>
            <Table
                columns={columns}
                rowSelection={rowSelection}
                dataSource={data}
                pagination={false}
                loading={isLoading}
                bordered={true}
                scroll={{
                    x: checkInnerWidth() ? "600px" : "auto"
                }}
            />

            <div style={StyleSheet.paginationStyle}>
                <Pagination
                    total={total}
                    showTotal={(total) => `Total ${total} items`}
                    defaultPageSize={pageSize}
                    defaultCurrent={1}
                    current={current}
                    onChange={(newPage, newPageSize) => {
                        setSelectedRowKeys([]);
                        setCurrent(newPage);
                        setPageSize(newPageSize);
                        setSelectedRowKeys([]);
                    }}
                    showSizeChanger={true}
                    showQuickJumper
                />
            </div>
        </>
    ) : (
        ""
    );
}
