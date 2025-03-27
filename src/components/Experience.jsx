import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Avatar } from "./Avatar";

export const Experience = ({ audioUrl, visemeUrl, animationType, playAudio }) => {
  const texture = useTexture("textures/youtubeBackground.jpg");
  const viewport = useThree((state) => state.viewport);

  return (
    <>
      <Avatar 
          position={[0, -5.9, 1]}   // Slightly lower and closer to camera
          scale={3.9}               // Smaller size
          audioUrl={audioUrl} 
          playAudio={playAudio}
          visemeUrl={visemeUrl} 
          animationType={animationType}
          // playAudio={playAudio}
        />

      <Environment preset="sunset" />
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </>
  );
};
