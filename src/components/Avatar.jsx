import React from 'react';
import { Group, Rect, Text } from 'react-konva';

const CELL_SIZE = 40;
const AVATAR_SIZE = 30;

const Avatar = ({ position, username, isCurrentUser }) => {
  return (
    <Group>
      <Rect
        x={position.x * CELL_SIZE + (CELL_SIZE - AVATAR_SIZE) / 2}
        y={position.y * CELL_SIZE + (CELL_SIZE - AVATAR_SIZE) / 2}
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        fill={isCurrentUser ? "red" : "blue"}
        cornerRadius={5}
      />
      <Text
        x={position.x * CELL_SIZE - 20}
        y={(position.y + 1) * CELL_SIZE + 5}
        text={username || "No Name"}
        fontSize={14}
        fill="black"
      />
    </Group>
  );
};

export default Avatar;