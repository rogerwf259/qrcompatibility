import { QRCode } from "jsqr";
import React, { ReactElement } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  info: QRCode;
}

export default function Ticket(): ReactElement {
  const location = useLocation<Props>();
  return (
    <div>
      <h3>Ticket info</h3>
      <span>
        {location.state.info ? location.state.info.data : "No data recieved"}
      </span>
    </div>
  );
}
