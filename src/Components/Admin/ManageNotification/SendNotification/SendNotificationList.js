// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable no-undef */
// /* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
    Table,
    Pagination,
    Spin,
    Input,
    Button,
    Col,
    Row,
    Typography,
    theme,
    Flex
} from "antd";

import { PlusOutlined, } from "@ant-design/icons";
import { PermissionAction } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate } from "react-router-dom";
import { tabletWidth } from "Helpers/ats.constants";
import {
    actionsPermissionValidator,
    getDateTimeFormat
} from "Helpers/ats.helper";

export default function SendNotificationList() {
    const { Search } = Input;
    const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
    const { apiService } = useServices();
    const navigate = useNavigate();
    const searchEnable = useRef();
    const [current, setCurrent] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [total, setTotal] = useState(0);
    const [storeInputValue, setstoreInputValue] = useState("");
    const [loader] = useState(false);

    const [submitSearchInpt, setSubmitSearchInput] = useState(false);
    const [pageSize, setPageSize] = useState(10);


    const {
        token: { colorBorder }
    } = theme.useToken();

    // check window inner width
    const checkInnerWidth = () => {
        try {
            return windowWidth < tabletWidth;
        } catch (error) { }

        // check window width and set inner width
        React.useEffect(() => {
            try {
                const handleResize = () => setWindowWidth(window.innerWidth);
                window.addEventListener("resize", handleResize);
                return () => window.removeEventListener("resize", handleResize);
            } catch (error) { }
        }, [windowWidth]);
    };

    /**
     * style
     */
    const StyleSheet = {
        searchBarStyle: {
            marginBottom: 16,
            maxWidth: 538
        },
        paginationStyle: {
            marginTop: 25
        },
        verDividerStyle: {
            borderColor: colorBorder,
            height: 20
        }
    };

    // Column list for table
    const columns = [
        {
            title: "Notification ID",
            dataIndex: "bulk_notification_id",
            sorter: (a, b) => a.bulk_notification_id - b.bulk_notification_id,
            key: "bulk_notification_id",
            width: '150px'
        },
        {
            title: "Sent To",
            dataIndex: "sent_users",
            // sorter: (a, b) => a.sent_users.localeCompare(b.sent_users),
            key: "sent_users",
            render: (value, record) => (
                <>
                    {record.notification_type === 'associate_buyers' ? (
                        "Associate Buyer List"
                    ) : (
                        'All Devices'
                    )}
                </>
            )
        },
        {
            title: "Title",
            dataIndex: "notification_title",
            sorter: (a, b) => a.notification_title.localeCompare(b.notification_title),
            key: "notification_title"
        },
        {
            title: "Message",
            dataIndex: "notification_description",
            sorter: (a, b) => a.notification_description.localeCompare(b.notification_description),
            key: "notification_description",
            render: (text) => {
                const truncatedText = text?.length > 20 ? text.substring(0, 40) + "..." : text;
                return (
                    <span className="message_cover" dangerouslySetInnerHTML={{ __html: truncatedText }} />
                );
            }
        },
        {
            title: "Created On",
            dataIndex: "created_at",
            sorter: (a, b) => a.created_at.localeCompare(b.created_at),
            render: (value) => getDateTimeFormat(value),
            key: "created_at"
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
                    {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
                        <>
                            <Button type="default" primary onClick={() => handleEdit(record)}>
                                View
                            </Button>
                        </>
                    )}
                </Flex>
            )
        });
    }

    // Function to fetch tag data
    const fetchTableData = async (storeFilterData) => {
        try {
            // Ensure storeFilterData is defined, set to an empty object if not provided
            storeFilterData = storeFilterData || {};

            // Extract sort and status from storeFilterData
            const { sort, status } = storeFilterData;

            // Define the base URL for the API endpoint
            let baseUrl = `/send_notification_list/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

            // Flag to check if any filter value is empty
            let isAnyValueEmpty = false;

            // Check if status is provided, update isAnyValueEmpty accordingly
            if (status) {
                isAnyValueEmpty = true;
            }

            // Set the checkFilter state to indicate if any filter value is empty

            // Create filterData object with status as a key-value pair
            const filterData = {
                ...{ status: status?.value }
            };

            // Convert filterData to JSON string
            const convertData = JSON.stringify(filterData);

            // Construct parameters for the API request
            const params = {
                ...(searchTerm && { searchTerm: searchTerm.trim() }),
                ...(isAnyValueEmpty && {
                    filterTerm: convertData
                }),
                ...(sort &&
                    sort.length > 0 && {
                    sortOrder: sort[0].desc ? "desc" : "asc"
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

    // Destructure data, mutate function, loading status, and refetching status from useMutation hook
    const { data, mutate: refetch, isLoading } = useMutation("fetchTagData", fetchTableData);

    // Function to handle Edit of tags
    const handleEdit = (data) => {
        navigate(`/${Paths.sendNotificationView}/${data.bulk_notification_id}`);
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
     * useEffect function to set breadCrumb data
     */
    useEffect(() => {
        setBreadCrumb({
            title: "Send Notifications",
            icon: "manageNotification",
            path: Paths.users
        });
    }, []);



    return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
        <>
            <Typography.Title level={5}>Send Notifications</Typography.Title>
            <Spin spinning={loader} fullscreen />
            <>
                <Row gutter={[12, 30]}>
                    <Col className="gutter-row" span={24}>
                        <Flex justify="space-between" gap="middle">
                            <Search
                                className="search_bar_box"
                                size="large"
                                placeholder="Search Here..."
                                value={searchTerm}
                                onSearch={handleSearchSubmit}
                                onChange={handleSearch}
                                onKeyPress={handleKeyPress}
                                allowClear
                                style={StyleSheet.searchBarStyle}
                            />
                            <Flex justify="space-between" gap="middle">
                                {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                                    <NavLink to={`/${Paths.sendNotificationAdd}`}>
                                        <Button type="primary" block size="large" className="wrapButton">
                                            <PlusOutlined />
                                            Send New
                                        </Button>
                                    </NavLink>
                                )}
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </>
            <Table
                columns={columns}
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
                        setCurrent(newPage);
                        setPageSize(newPageSize);
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
