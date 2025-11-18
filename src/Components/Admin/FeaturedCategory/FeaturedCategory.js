import React, { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Row, Col, Typography, Button, Flex, Modal, Spin, Alert } from "antd"; // Import Ant Design components
import SortableItem from "./SortableItem"; // Ensure this component is correctly implemented
import Item from "./Item"; // For drag overlay
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { snackBarSuccessConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import CategoryDetails from "./CategoryDetails";
import PlaceholderItem from "./ItemPlaceholder";
import _ from "lodash";
import { imagePath } from "Helpers/ats.helper";

// Featured Category Component
const FeaturedCategory = () => {
  const { apiService } = useServices();
  const { setBreadCrumb } = useUserContext();
  const [showModal, setShowModal] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const queryClient = useQueryClient();
  const [items, setItems] = useState([]); // all other categories state
  const [selectedItems, setSelectedItems] = useState([]); // selected category or featured category state
  const [activeId, setActiveId] = useState(null);
  const [dragSourceAndDestination, setDragSourceAndDestination] = useState({});
  const [modalData, setModalData] = useState(null);
  const [trackChange, setTrackChanges] = useState(false); // track status state for tracking changes

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0.01 //! Do Not Remove: used for delaying the event so that edit btn click works properly
      }
    }),
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  // api for fetching other category data
  const { isLoading: fetchOtherCategoriesList } = useQuery(
    "getotherCategoryList",
    // Function to fetch data of a single Category using apiService.getRequest
    () => apiService.getAllCategoriesForFeatured(),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        if (data) {
          setItems(data?.data?.data || []); //
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // api for fetching feateured/selected categories list
  const { isLoading: fetchFeaturedCategoriesList } = useQuery(
    "getFetauredCategoryList",
    // Function to fetch data of a single Category using apiService.getRequest
    () => apiService.getFeaturedCategoriesList(),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        if (data?.data?.data) {
          setSelectedItems([...data.data.data]);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // on-drag function
  const handleDragStart = useCallback((event) => {
    try {
      const draggedSourceContainer = event?.active?.data?.current?.sortable?.containerId;
      const isSelectedItemsEmpty = selectedItems?.length == 0;

      // filtering out dragged category data
      const temp = event?.active?.data?.current?.sortable?.items.filter(
        (item) => item.category_id == event.active.id
      );

      let tempObj = {
        ...temp[0],
        containerId: draggedSourceContainer,
        isSelectedItemsEmpty: isSelectedItemsEmpty
      };

      setActiveId(tempObj); // setting state for dragged category component
    } catch (error) {}
  }, []);

  // drag-move function
  const handleDragMove = useCallback((event) => {
    try {
      const { active, over } = event;
      const sourceContainer = active?.data.current.sortable.containerId;
      const destinationContainer = over?.data.current.sortable.containerId;

      setDragSourceAndDestination({
        source: sourceContainer,
        over: destinationContainer
      });
    } catch (error) {}
  }, []);

  // darg-end function
  const handleDragEnd = useCallback(
    (event) => {
      try {
        setTrackChanges(true);
        const { active, over } = event;

        // Exit if there's no valid "over" target
        if (!over) {
          setActiveId(null);
          return;
        }
        //finding source conatiner ,destination conatiner
        const sourceContainer = active?.data?.current?.sortable?.containerId;
        const destinationContainer = over?.data?.current?.sortable?.containerId;

        //finding active/over item in original items or selected items list
        const activeIndexInItems = items.findIndex((item) => item.category_id === active.id);
        const activeIndexInSelectedItems = selectedItems.findIndex(
          (item) => item.category_id === active.id
        );

        const overIndexInItems = items.findIndex((item) => item.category_id === over.id);
        const overIndexInSelectedItems = selectedItems.findIndex(
          (item) => item.category_id === over.id
        );
        // Moving within the same context
        if (sourceContainer === destinationContainer) {
          if (activeIndexInItems !== -1 && overIndexInItems !== -1 && active.id !== over.id) {
            setItems((prevItems) => arrayMove(prevItems, activeIndexInItems, overIndexInItems)); // setting other categories
          } else if (
            activeIndexInSelectedItems !== -1 &&
            overIndexInSelectedItems !== -1 &&
            active.id !== over.id
          ) {
            setSelectedItems((prevSelectedItems) =>
              arrayMove(prevSelectedItems, activeIndexInSelectedItems, overIndexInSelectedItems)
            ); // setting selected categories
          }
        } else {
          // Handle moving between different contexts
          if (activeIndexInSelectedItems !== -1 && overIndexInItems !== -1) {
            // Moving from selectedItems to items
            const movedItem = selectedItems[activeIndexInSelectedItems];
            setSelectedItems((prevSelectedItems) =>
              prevSelectedItems.filter((item) => item.category_id !== active.id)
            );
            setItems((prevItems) => [...prevItems, movedItem]);
          } else if (activeIndexInItems !== -1 && overIndexInSelectedItems !== -1) {
            // Moving from items to selectedItems
            const movedItem = items[activeIndexInItems];
            setItems((prevItems) => prevItems.filter((item) => item.category_id !== active.id));
            if (overIndexInSelectedItems == selectedItems?.length - 1) {
              setSelectedItems((prevSelectedItems) => [...prevSelectedItems, movedItem]);
            } else {
              setSelectedItems((prevSelectedItems) => {
                const newIndex = Math.max(overIndexInSelectedItems, 0); // Ensure it doesn't go below 0
                const newSelectedItems = [...prevSelectedItems];
                newSelectedItems.splice(newIndex, 0, movedItem); // Insert movedItem at newIndex
                return newSelectedItems;
              });
            }
          } else if (activeIndexInSelectedItems !== -1 && overIndexInSelectedItems !== -1) {
            // Moving within selectedItems, which may also handle empty selectedItems
            // Moving within selectedItems (may want to reorder)
            setSelectedItems((prevSelectedItems) =>
              arrayMove(prevSelectedItems, activeIndexInSelectedItems, overIndexInSelectedItems)
            );
          } else if (activeIndexInItems !== -1 && overIndexInItems !== -1) {
            // Moving within items
            //"Moving within items (may want to reorder)");

            setItems((prevItems) => arrayMove(prevItems, activeIndexInItems, overIndexInItems));
          } else if (
            activeIndexInSelectedItems == -1 &&
            overIndexInSelectedItems == -1 &&
            overIndexInItems == -1
          ) {
            // moving item to slected item when selected item is empty

            const movedItem = items[activeIndexInItems];

            setSelectedItems([movedItem]);
            setItems((prevItems) =>
              prevItems.filter((item) => item.category_id !== movedItem.category_id)
            );
          } else if (
            activeIndexInItems == -1 &&
            overIndexInSelectedItems == -1 &&
            overIndexInItems == -1
          ) {
            // moving selected item to item when item is empty

            const movedItem = selectedItems[activeIndexInSelectedItems];

            setItems([movedItem]);
            setSelectedItems((prevItems) =>
              prevItems.filter((item) => item.category_id !== movedItem.category_id)
            );
          }
        }

        setActiveId(null);
      } catch (error) {}
    },
    [items, selectedItems]
  );

  useEffect(() => {
    setBreadCrumb({
      title: "Featured Category",
      icon: "category",
      path: Paths.users
    });
  }, []);

  // function for selected categories submission
  const handleCategorySubmit = () => {
    try {
      const selectedItemsCopy = _.cloneDeep(selectedItems);
      const payload = selectedItemsCopy.map((item) => {
        item["image_id"] = item.attachment_id;
        delete item.attachment_id;
        delete item.file_path; // Delete the property
        return item; // Return the modified item
      });
      sendCategoryData(payload); // api call for submitting data
    } catch (error) {}
  };

  // api to update category sequence
  const { mutate: sendCategoryData } = useMutation(
    // Mutation function to handle the API call for creating a new tags
    (data) => apiService.updateCategoriesForFeatured(data),
    {
      // Configuration options for the mutation
      onSuccess: (res) => {
        if (res) {
          enqueueSnackbar(res.message, snackBarSuccessConf);
          setTrackChanges(false);
          queryClient.invalidateQueries("getotherCategoryList");
          queryClient.invalidateQueries("getFetauredCategoryList");
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for fetchcing Category data via API
  const { mutate: fetchCategoryDetails, isLoading: loadingSingleCategoryData } = useMutation(
    "getSinglefeaturedCategoryDeatils",
    // Mutation function to handle the API call for fetching Category data
    (id) => apiService.getSingleFeaturedCategoryData(id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.data) {
          setModalData(data);
          setShowModal(true);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // handle edit btn click function : fetch data and open modal
  const handleModal = (val) => {
    try {
      setEditCategoryId(val);
      fetchCategoryDetails(val);
    } catch (error) {}
  };

  return (
    <>
      <Spin
        spinning={
          loadingSingleCategoryData || fetchOtherCategoriesList || fetchFeaturedCategoriesList
        }
        fullscreen
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}>
        <Row gutter={[20, 20]}>
          <Col span={18}>
            <Typography.Title level={5}>Featured Categories</Typography.Title>
            <div className="container1">
              <SortableContext
                items={selectedItems}
                id={"container1"}
                strategy={rectSortingStrategy}>
                {selectedItems?.length > 0 ? (
                  <Row gutter={[0, 0]}>
                    {selectedItems?.length > 0 ? (
                      selectedItems.map((cat, index) => {
                        return (
                          <>
                            <Col
                              span={6}
                              key={cat?.category_id}
                              className={!((index + 1) % 4 === 0) ? "bR-bB" : "bB"}>
                              <SortableItem
                                id={cat?.category_id}
                                catName={cat.category_name}
                                filePath={imagePath({
                                  file_path: cat.file_path,
                                  origin_type: cat.origin_type
                                })}
                                type="container1"
                                handleModal={handleModal}
                                index={index}
                                featured_category_id={cat?.featured_category_id || null}
                              />
                            </Col>
                          </>
                        );
                      })
                    ) : (
                      <PlaceholderItem
                        key={"dummy"}
                        id={"dummy"}
                        catName={"Drop the items here  ..."}
                        type="container1"
                      />
                    )}
                  </Row>
                ) : (
                  <PlaceholderItem
                    key={"dummy"}
                    id={"dummy"}
                    catName={"Drop the items here  ..."}
                    type="container1"
                  />
                )}
              </SortableContext>
            </div>
          </Col>
          <Col span={6}>
            <Typography.Title level={5}>Other Categories</Typography.Title>
            <SortableContext items={items} id={"container2"} strategy={verticalListSortingStrategy}>
              <div className="container2-outer">
                <div className="container2">
                  {items?.length > 0 ? (
                    items?.map((cat) => (
                      <SortableItem
                        key={cat?.category_id}
                        id={cat?.category_id}
                        catName={cat.category_name}
                        filePath={imagePath({
                          file_path: cat.file_path,
                          origin_type: cat.origin_type
                        })}
                        type="container2"
                      />
                    ))
                  ) : (
                    <SortableItem
                      key={"dummy1"}
                      id={"dummy1"}
                      catName={"Dummy Category"}
                      filePath={`${process.env.REACT_APP_IMAGE_URL}\\upload\\categories\\1719823342145-969894643.jpg"`}
                      type="container2"
                    />
                  )}
                </div>
              </div>
            </SortableContext>
          </Col>
          <Col span={24}>
            <Flex justify={trackChange ? "flex-start" : "flex-end"}>
              {trackChange ? (
                <Alert
                  message="You have some unsaved changes. Kindly save !"
                  type="warning"
                  showIcon
                  style={{ width: "100%" }}
                  action={
                    <Button type="primary" onClick={() => handleCategorySubmit()}>
                      Save Changes
                    </Button>
                  }
                />
              ) : (
                <Button type="primary" onClick={() => handleCategorySubmit()}>
                  Save Changes
                </Button>
              )}
            </Flex>
          </Col>
        </Row>
        <DragOverlay>
          {activeId ? (
            <Item
              className="manjeet3"
              id={activeId?.category_id}
              catName={activeId?.category_name}
              filePath={imagePath({
                file_path: activeId.file_path,
                origin_type: activeId.origin_type
              })}
              type={activeId?.containerId}
              dragSourceAndDestination={dragSourceAndDestination}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {showModal ? (
        <Modal
          title="Featured Category Details"
          centered
          open={true}
          closable={false}
          width={900}
          footer={false}>
          <>
            <CategoryDetails
              modalData={modalData}
              id={editCategoryId}
              setShowModal={setShowModal}
              dragSourceAndDestination={dragSourceAndDestination}
            />
          </>
        </Modal>
      ) : (
        <></>
      )}
    </>
  );
};

export default FeaturedCategory;
