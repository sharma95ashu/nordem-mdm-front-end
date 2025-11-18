import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PlaceholderItem = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  };
  const flex = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  };
  return (
    <div style={flex} className="calcHeight330">
      <div
        ref={setNodeRef}
        style={style}
        //   withOpacity={isDragging}
        //   index={0}
        {...props}
        {...attributes}
        {...listeners}>
        <div>
          <strong>
            <i>Drag items here ...</i>
          </strong>
          <br />
          <small>
            <i>Drag items from right and drop it in this area</i>
          </small>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderItem;
