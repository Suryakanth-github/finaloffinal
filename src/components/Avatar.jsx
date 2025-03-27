import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function Avatar(props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [animation, setAnimation] = useState("Idle");

  const script = "welcome";
  const headFollow = true;
  const smoothMorphTarget = true;
  const morphTargetSmoothing = 0.5;

  const { nodes, materials } = useGLTF("/models/646d9dcdc8a5f5bddbfac913.glb");
  const { animations: idleAnimation } = useFBX("/animations/Idle.fbx");
  const { animations: angryAnimation } = useFBX("/animations/Angry Gesture.fbx");
  const { animations: greetingAnimation } = useFBX("/animations/Standing Greeting.fbx");

  idleAnimation[0].name = "Idle";
  angryAnimation[0].name = "Angry";
  greetingAnimation[0].name = "Greeting";

  const group = useRef();
  const { actions } = useAnimations(
    [idleAnimation[0], angryAnimation[0], greetingAnimation[0]],
    group
  );

  useEffect(() => {
    actions[animation].reset().fadeIn(0.5).play();
    return () => actions[animation].fadeOut(0.5);
  }, [animation]);
  
  useEffect(() => {
    const handleChange = (e) => setAnimation(e.detail);
    const handleSpeakingStart = () => setIsSpeaking(true);
    const handleSpeakingStop = () => setIsSpeaking(false);

    window.addEventListener("changeAnimation", handleChange);
    window.addEventListener("startSpeaking", handleSpeakingStart);
    window.addEventListener("stopSpeaking", handleSpeakingStop);

    return () => {
      window.removeEventListener("changeAnimation", handleChange);
      window.removeEventListener("startSpeaking", handleSpeakingStart);
      window.removeEventListener("stopSpeaking", handleSpeakingStop);
    };
    
  }, []);
  useEffect(() => {
    console.log("Mouth morphs available in Head:", Object.keys(nodes.Wolf3D_Head.morphTargetDictionary));
  }, []);
  

  useFrame((state) => {
    if (headFollow && group.current) {
      group.current.getObjectByName("Head").lookAt(state.camera.position);
    }
  
    const headIndex = nodes.Wolf3D_Head.morphTargetDictionary["viseme_aa"];
    const teethIndex = nodes.Wolf3D_Teeth.morphTargetDictionary["viseme_aa"];
  
    if (isSpeaking) {
      const mouthOpen = Math.abs(Math.sin(state.clock.elapsedTime * 5)); // value between 0–1
      nodes.Wolf3D_Head.morphTargetInfluences[headIndex] = mouthOpen;
      nodes.Wolf3D_Teeth.morphTargetInfluences[teethIndex] = mouthOpen;
  
      // ✅ Safe log here
      console.log("Speaking... mouthOpen:", mouthOpen);
    } else {
      nodes.Wolf3D_Head.morphTargetInfluences[headIndex] = 0;
      nodes.Wolf3D_Teeth.morphTargetInfluences[teethIndex] = 0;
  
      // ✅ Optional log for idle
      console.log("Not speaking. Mouth closed.");
    }
  });
  
  
  


  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

useGLTF.preload("/models/646d9dcdc8a5f5bddbfac913.glb");
