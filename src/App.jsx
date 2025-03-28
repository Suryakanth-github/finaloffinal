//app.jsx

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";



function App() {
  const [userText, setUserText] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioBase64, setAudioBase64] = useState(null);
  const [mouthCues, setMouthCues] = useState(null);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const token = import.meta.env.VITE_DATABRICKS_TOKEN;

  const handleSend = async () => {
    if (!userText.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch("/api/serving-endpoints/mindmatever/invocations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
          
        },
        body: JSON.stringify({
          inputs: {
            text: [userText]
          }
        })
      });  
      const data = await response.json();
      const [emotion, backendReply] = data.predictions[0];
      setReply(backendReply);
      speakText(backendReply);
    } catch (error) {
      console.error("❌ Backend Error:", error);
      setReply("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }
  
    if (listening && recognition) {
      recognition.stop();
      setListening(false);
      return;
    }
  
    const newRecognition = new window.webkitSpeechRecognition();
    newRecognition.continuous = false;
    newRecognition.interimResults = false;
    newRecognition.lang = 'en-US';
  
    newRecognition.onstart = () => {
      setListening(true);
    };
  
    newRecognition.onend = () => {
      setListening(false);
    };
  
    newRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserText(transcript);
      handleSend(); // Automatically send when done speaking
    };
  
    newRecognition.onerror = (event) => {
      console.error("Mic error:", event.error);
      setListening(false);
    };
  
    newRecognition.start();
    setRecognition(newRecognition);
  };
    
  
  

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
  
    // Start talking animation
    window.dispatchEvent(new CustomEvent("changeAnimation", { detail: "Greeting" }));
    window.dispatchEvent(new Event("startSpeaking"));
  
    utter.onend = () => {
      // Go idle + stop mouth
      window.dispatchEvent(new CustomEvent("changeAnimation", { detail: "Idle" }));
      window.dispatchEvent(new Event("stopSpeaking"));
    };
  
    synth.speak(utter);
  };
  

  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
        <color attach="background" args={["#ececec"]} />
        <Experience />
      </Canvas>

      <div style={{ position: "absolute", top: 20, left: 20, background: "#fff", padding: "10px", borderRadius: "10px" }}>
  <input
    style={{ marginBottom: "10px", padding: "5px" }}
    type="text"
    placeholder="Talk to the avatar..."
    value={userText}
    onChange={(e) => setUserText(e.target.value)}
  />
  <button onClick={handleSend} disabled={loading}>
    {loading ? "Thinking..." : "Send"}
  </button>

  {/* ✅ Add mic button right here: */}
  <button onClick={handleMicClick} style={{ marginLeft: "10px" }}>
    {listening ? "🎙 Stop" : "🎤 Mic"}
  </button>

  <p><strong>Reply:</strong> {reply}</p>
</div>

    </>
  );
}

export default App;