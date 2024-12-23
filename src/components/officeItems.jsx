import React from 'react';
import { Rect, Text } from 'react-konva';

const OfficeItems = ({ width, height }) => {
  return (
    <>
      {/* Conference Table */}
      <Rect x={130} y={130} width={200} height={100} fill="#8B4513" cornerRadius={5} />
      <Text x={200} y={170} text="Conference Table" fontSize={16} fill="white" />

      {/* Plant */}
      <Rect x={400} y={120} width={80} height={80} fill="#228B22" cornerRadius={8} />
      <Text x={415} y={150} text="Plant" fontSize={14} fill="white" />

      {/* Sofa */}
      <Rect x={600} y={200} width={150} height={60} fill="#4682B4" cornerRadius={5} />
      <Text x={640} y={220} text="Sofa" fontSize={14} fill="white" />

      {/* Water Cooler */}
      <Rect x={width - 150} y={100} width={40} height={40} fill="#87CEEB" cornerRadius={5} />
      <Text x={width - 170} y={150} text="Water Cooler" fontSize={14} fill="#333" />
    </>
  );
};

export default OfficeItems;