import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import Avatar from '../components/Avatar';
import { useUser } from '../context/userContext';
import webSocketService from '../hooks/webSocketService';


const CELL_SIZE = 40;
const FURNITURE = [/* your existing furniture array */];

const Office = () => {
  const { user } = useUser();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [userPositions, setUserPositions] = useState({});
  const [avatarPos, setAvatarPos] = useState({ x: 5, y: 5 });

  // Calculate grid dimensions
  const gridWidth = Math.floor(dimensions.width / CELL_SIZE);
  const gridHeight = Math.floor(dimensions.height / CELL_SIZE);

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Set up WebSocket connection and subscriptions
    webSocketService.subscribe('/user/public', (data) => {
      setUserPositions(data);
    });

    // Send join message with initial position
    webSocketService.send('/app/office.join', {
      username: user.username,
      x: avatarPos.x,
      y: avatarPos.y
    });

    // Cleanup on unmount
    return () => {
      webSocketService.send('/app/office.leave', user.username);
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const moveMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };

      const move = moveMap[e.key];
      if (move) {
        const newPos = {
          x: Math.max(0, Math.min(gridWidth - 1, avatarPos.x + move.x)),
          y: Math.max(0, Math.min(gridHeight - 1, avatarPos.y + move.y))
        };

        // Check collision with furniture
        const collision = FURNITURE.some(item => 
          newPos.x >= item.x && 
          newPos.x < item.x + item.width && 
          newPos.y >= item.y && 
          newPos.y < item.y + item.height
        );

        if (!collision) {
          setAvatarPos(newPos);
          // Send position update
          webSocketService.send('/app/office.position', {
            username: user.username,
            x: newPos.x,
            y: newPos.y
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [avatarPos, gridWidth, gridHeight, user]);

  return (
    <Stage width={dimensions.width} height={dimensions.height}>
      <Layer>
        {/* Background */}
        <Rect width={dimensions.width} height={dimensions.height} fill="#f5f5f5" />

        {/* Grid */}
        {Array.from({ length: gridWidth }).map((_, i) => (
          <Line
            key={`vertical-${i}`}
            points={[i * CELL_SIZE, 0, i * CELL_SIZE, dimensions.height]}
            stroke="#ddd"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: gridHeight }).map((_, i) => (
          <Line
            key={`horizontal-${i}`}
            points={[0, i * CELL_SIZE, dimensions.width, i * CELL_SIZE]}
            stroke="#ddd"
            strokeWidth={1}
          />
        ))}

        {/* Furniture */}
        {FURNITURE.map((item, index) => (
          <Group key={`furniture-${index}`}>
            <Rect
              x={item.x * CELL_SIZE}
              y={item.y * CELL_SIZE}
              width={item.width * CELL_SIZE}
              height={item.height * CELL_SIZE}
              fill={item.color}
              cornerRadius={5}
            />
            <Text
              x={item.x * CELL_SIZE + 5}
              y={item.y * CELL_SIZE + item.height * CELL_SIZE / 2}
              text={item.type}
              fontSize={12}
              fill="white"
            />
          </Group>
        ))}

        {/* Render all users */}
        {Object.values(userPositions).map((userPos) => (
          <Avatar 
            key={userPos.username}
            position={{ x: userPos.x, y: userPos.y }}
            username={userPos.username}
            isCurrentUser={userPos.username === user.username}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Office;