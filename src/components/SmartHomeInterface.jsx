// import React, { useState, useEffect, useRef } from 'react';
// import { database } from '../firebase';
// import { ref, set, onValue } from "firebase/database";
// import './SmartHomeInterface.css';

// const SmartHomeInterface = () => {
//   // Room value mapping for Firebase
//   const FIREBASE_VALUES = {
//     ALL_OFF: 0,
//     ALL_ON: 1,
//     BEDROOM_ON: 2,
//     BEDROOM_OFF: 3,
//     BATHROOM_ON: 4,
//     BATHROOM_OFF: 5,
//     KITCHEN_ON: 6,
//     KITCHEN_OFF: 7,
//     OTHER_ON: 8,
//     OTHER_OFF: 9
//   };

//   // State for each room's light status
//   const [lights, setLights] = useState({
//     bedroom: false,
//     bathroom: false,
//     kitchen: false,
//     other: false
//   });

//   // State for voice recognition
//   const [isListening, setIsListening] = useState(false);
//   const [notification, setNotification] = useState('');
//   const [speechSupported, setSpeechSupported] = useState(false);

//   // State for temperature
//   const [temperature, setTemperature] = useState(null);

//   // State for gesture detection
//   const [isGestureDetecting, setIsGestureDetecting] = useState(false);
//   const [detectedFingers, setDetectedFingers] = useState(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const handModelRef = useRef(null);

//   // Check if speech recognition is supported
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       setSpeechSupported(true);
//     } else {
//       setNotification('Speech recognition is not supported in this browser.');
//     }
//   }, []);

//   // Connect to Firebase and listen for changes
//   useEffect(() => {
//     const lightsRef = ref(database, 'lights');

//     // Listen for changes in Firebase and update local state
//     onValue(lightsRef, (snapshot) => {
//       const value = snapshot.val();

//       // Only update UI if the value is defined
//       if (value !== null && value !== undefined) {
//         console.log("Firebase value received:", value);

//         // Update local state based on the Firebase value
//         switch (parseInt(value)) {
//           case FIREBASE_VALUES.ALL_ON:
//             console.log("Setting all lights ON");
//             setLights({
//               bedroom: true,
//               bathroom: true,
//               kitchen: true,
//               other: true
//             });
//             break;
//           case FIREBASE_VALUES.ALL_OFF:
//             console.log("Setting all lights OFF");
//             setLights({
//               bedroom: false,
//               bathroom: false,
//               kitchen: false,
//               other: false
//             });
//             break;
//           case FIREBASE_VALUES.BEDROOM_ON:
//             setLights(prev => ({ ...prev, bedroom: true }));
//             break;
//           case FIREBASE_VALUES.BEDROOM_OFF:
//             setLights(prev => ({ ...prev, bedroom: false }));
//             break;
//           case FIREBASE_VALUES.BATHROOM_ON:
//             setLights(prev => ({ ...prev, bathroom: true }));
//             break;
//           case FIREBASE_VALUES.BATHROOM_OFF:
//             setLights(prev => ({ ...prev, bathroom: false }));
//             break;
//           case FIREBASE_VALUES.KITCHEN_ON:
//             setLights(prev => ({ ...prev, kitchen: true }));
//             break;
//           case FIREBASE_VALUES.KITCHEN_OFF:
//             setLights(prev => ({ ...prev, kitchen: false }));
//             break;
//           case FIREBASE_VALUES.OTHER_ON:
//             setLights(prev => ({ ...prev, other: true }));
//             break;
//           case FIREBASE_VALUES.OTHER_OFF:
//             setLights(prev => ({ ...prev, other: false }));
//             break;
//           default:
//             console.log("Unknown value from Firebase:", value);
//         }
//       }
//     });

//     // Listen for temperature updates
//     const temperatureRef = ref(database, 'sensorData/temperature');
//     onValue(temperatureRef, (snapshot) => {
//       const value = snapshot.val();
//       if (value !== null && value !== undefined) {
//         console.log("Temperature value received:", value);
//         setTemperature(value);
//       }
//     });

//     // Clean up listeners
//     return () => {
//       // Clean up listeners
//     };
//   }, []);

//   // Load HandPose model
//   useEffect(() => {
//     const loadHandPoseModel = async () => {
//       try {
//         // Dynamically import TensorFlow.js and HandPose
//         const tf = await import('@tensorflow/tfjs');
//         const handpose = await import('@tensorflow-models/handpose');

//         // Load the HandPose model
//         handModelRef.current = await handpose.load();
//         console.log("Handpose model loaded");
//       } catch (error) {
//         console.error("Error loading handpose model:", error);
//         setNotification("Error: Could not load hand detection model");
//       }
//     };

//     loadHandPoseModel();
//   }, []);

//   // Toggle light function for individual rooms
//   const toggleLight = (room) => {
//     const newStatus = !lights[room];

//     // Update local state (will be overwritten when Firebase updates)
//     setLights(prevState => ({
//       ...prevState,
//       [room]: newStatus
//     }));

//     // Determine which Firebase value to send
//     let valueToSend;
//     if (room === 'bedroom') {
//       valueToSend = newStatus ? FIREBASE_VALUES.BEDROOM_ON : FIREBASE_VALUES.BEDROOM_OFF;
//     } else if (room === 'bathroom') {
//       valueToSend = newStatus ? FIREBASE_VALUES.BATHROOM_ON : FIREBASE_VALUES.BATHROOM_OFF;
//     } else if (room === 'kitchen') {
//       valueToSend = newStatus ? FIREBASE_VALUES.KITCHEN_ON : FIREBASE_VALUES.KITCHEN_OFF;
//     } else if (room === 'other') {
//       valueToSend = newStatus ? FIREBASE_VALUES.OTHER_ON : FIREBASE_VALUES.OTHER_OFF;
//     }

//     // Update Firebase
//     set(ref(database, 'lights'), valueToSend)
//       .then(() => {
//         setNotification(`${room.charAt(0).toUpperCase() + room.slice(1)} light turned ${newStatus ? 'on' : 'off'}`);
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotification(`Error: Could not update ${room} light status`);
//       });

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification('');
//     }, 3000);
//   };

//   // Function to turn all lights on
//   const turnAllOn = () => {
//     // Update local state immediately
//     setLights({
//       bedroom: true,
//       bathroom: true,
//       kitchen: true,
//       other: true
//     });

//     // Update Firebase
//     set(ref(database, 'lights'), FIREBASE_VALUES.ALL_ON)
//       .then(() => {
//         setNotification('All lights turned on');
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotification('Error: Could not turn all lights on');

//         // Revert local state if Firebase update fails
//         setLights(prevState => ({...prevState}));
//       });

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification('');
//     }, 3000);
//   };

//   // Function to turn all lights off
//   const turnAllOff = () => {
//     // Update local state immediately
//     setLights({
//       bedroom: false,
//       bathroom: false,
//       kitchen: false,
//       other: false
//     });

//     // Update Firebase
//     set(ref(database, 'lights'), FIREBASE_VALUES.ALL_OFF)
//       .then(() => {
//         setNotification('All lights turned off');
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotification('Error: Could not turn all lights off');

//         // Revert local state if Firebase update fails
//         setLights(prevState => ({...prevState}));
//       });

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification('');
//     }, 3000);
//   };

//   // Process voice command
//   const processCommand = (command) => {
//     if (!command) return;

//     command = command.toLowerCase();

//     // Check for "all" commands first
//     if (command.includes('all') || command.includes('every')) {
//       if (command.includes('on')) {
//         turnAllOn();
//         return;
//       } else if (command.includes('off')) {
//         turnAllOff();
//         return;
//       }
//     }

//     // Process commands for individual rooms
//     if (command.includes('turn on') || command.includes('turn off')) {
//       const isOn = command.includes('turn on');

//       // Check which room is mentioned
//       const rooms = ['bedroom', 'bathroom', 'kitchen', 'other'];
//       const mentionedRoom = rooms.find(room => command.includes(room));

//       if (mentionedRoom) {
//         // Only toggle if the current state is different
//         if (lights[mentionedRoom] !== isOn) {
//           toggleLight(mentionedRoom);
//         } else {
//           setNotification(`${mentionedRoom.charAt(0).toUpperCase() + mentionedRoom.slice(1)} light is already ${isOn ? 'on' : 'off'}`);

//           // Clear notification after 3 seconds
//           setTimeout(() => {
//             setNotification('');
//           }, 3000);
//         }
//       } else {
//         setNotification('Sorry, I didn\'t recognize which room you meant');

//         // Clear notification after 3 seconds
//         setTimeout(() => {
//           setNotification('');
//         }, 3000);
//       }
//     } else if (command.includes('hello') || command.includes('hi')) {
//       setNotification('Hello! How can I help you with the lights?');

//       // Clear notification after 3 seconds
//       setTimeout(() => {
//         setNotification('');
//       }, 3000);
//     } else {
//       setNotification('Try saying "Turn on bedroom light" or "Turn all lights off"');

//       // Clear notification after 3 seconds
//       setTimeout(() => {
//         setNotification('');
//       }, 3000);
//     }
//   };

//   // Start voice recognition
//   const startListening = () => {
//     if (!speechSupported) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();

//     recognition.lang = 'en-US';
//     recognition.interimResults = false;
//     recognition.maxAlternatives = 1;

//     setIsListening(true);
//     setNotification('Listening...');

//     recognition.start();

//     recognition.onresult = (event) => {
//       const speechResult = event.results[0][0].transcript;
//       setNotification(`You said: "${speechResult}"`);
//       processCommand(speechResult);
//     };

//     recognition.onerror = (event) => {
//       console.error('Speech recognition error', event.error);
//       setNotification(`Error: ${event.error}`);
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//     };
//   };

//   // Start gesture detection
//   const startGestureDetection = async () => {
//     if (!handModelRef.current) {
//       console.log("Model not loaded yet");
//       setNotification('Hand detection model is not loaded yet. Please try again in a moment.');
//       return;
//     }

//     console.log("Starting gesture detection");

//     try {
//       // Access webcam with more specific constraints
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//           facingMode: 'user'
//         } 
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();

//         // Start detection loop
//         setIsGestureDetecting(true);
//         setNotification('Gesture detection started. Show your hand with fingers extended.');

//         // Setup canvas
//         if (canvasRef.current) {
//           canvasRef.current.width = videoRef.current.clientWidth;
//           canvasRef.current.height = videoRef.current.clientHeight;

//           // Start the detection loop
//           console.log("Gesture detection loop started");
//           detectGestures();
//         }
//       }
//     } catch (error) {
//       console.error('Error accessing webcam:', error);
//       setNotification('Error: Could not access webcam. Please check camera permissions.');
//       setIsGestureDetecting(false);
//     }
//   };

//   // Stop gesture detection
//   const stopGestureDetection = () => {
//     setIsGestureDetecting(false);

//     // Stop the webcam stream
//     if (videoRef.current && videoRef.current.srcObject) {
//       const tracks = videoRef.current.srcObject.getTracks();
//       tracks.forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//     }

//     setNotification('Gesture detection stopped');
//   };

//   // Improved helper function to count extended fingers
//   const countExtendedFingers = (landmarks) => {
//     // Get key points
//     const wrist = landmarks[0];
//     const thumbTip = landmarks[4];
//     const indexTip = landmarks[8];
//     const middleTip = landmarks[12];
//     const ringTip = landmarks[16];
//     const pinkyTip = landmarks[20];

//     // Get base points
//     const indexBase = landmarks[5];
//     const middleBase = landmarks[9];
//     const ringBase = landmarks[13];
//     const pinkyBase = landmarks[17];

//     let count = 0;

//     // SIMPLE DETECTION ALGORITHM that prioritizes reliability over accuracy

//     // Special case for just one finger (index) - very lenient detection
//     // Many users just point with index finger, so we make this especially easy to detect
//     const indexRaised = indexTip[1] < indexBase[1] - 15; // Vertical check with smaller threshold

//     if (indexRaised &&
//         // Make sure other fingers are not clearly extended
//         middleTip[1] > middleBase[1] - 10 &&
//         ringTip[1] > ringBase[1] - 10 &&
//         pinkyTip[1] > pinkyBase[1] - 10) {

//       console.log("INDEX FINGER CLEARLY DETECTED");
//       return 1; // Directly return 1 for clear index finger pointing
//     }

//     // More general detection for other cases
//     // Thumb (simplified)
//     if (Math.abs(thumbTip[0] - wrist[0]) > 30) {
//       count++;
//       console.log("Thumb detected");
//     }

//     // Index finger
//     if (indexTip[1] < indexBase[1] - 25) {
//       count++;
//       console.log("Index finger detected");
//     }

//     // Middle finger
//     if (middleTip[1] < middleBase[1] - 25) {
//       count++;
//       console.log("Middle finger detected");
//     }

//     // Ring finger
//     if (ringTip[1] < ringBase[1] - 25) {
//       count++;
//       console.log("Ring finger detected");
//     }

//     // Pinky
//     if (pinkyTip[1] < pinkyBase[1] - 25) {
//       count++;
//       console.log("Pinky detected");
//     }

//     console.log(`Total fingers detected: ${count}`);
//     return count;
//   };


//   // Process detected finger count and execute command
//   const processGestureCommand = (fingerCount) => {
//     console.log(`PROCESSING COMMAND: ${fingerCount} fingers`);

//     // Always log to debugData for verification
//     set(ref(database, 'debugData/fingerCount'), fingerCount)
//       .then(() => console.log(`Debug data updated with count ${fingerCount}`))
//       .catch(error => console.error("Debug update error:", error));

//     // Explicitly process each count
//     switch (fingerCount) {
//       case 1:
//         console.log("*** SENDING VALUE 1 TO FIREBASE ***");

//         // Direct update to Firebase - no conditional logic
//         set(ref(database, 'lights'), FIREBASE_VALUES.ALL_ON)
//           .then(() => {
//             console.log("SUCCESS: Firebase value set to 1 (ALL_ON)");
//             setNotification('All lights turned ON via gesture');
//           })
//           .catch((error) => {
//             console.error("Firebase error:", error);
//             setNotification('Error sending to Firebase');
//           });
//         break;

//       // Handle other finger counts similarly
//       case 0:
//         set(ref(database, 'lights'), FIREBASE_VALUES.ALL_OFF);
//         break;
//       case 2:
//         set(ref(database, 'lights'), FIREBASE_VALUES.BEDROOM_ON);
//         break;
//       case 3:
//         set(ref(database, 'lights'), FIREBASE_VALUES.BATHROOM_ON);
//         break;
//       case 4:
//         set(ref(database, 'lights'), FIREBASE_VALUES.KITCHEN_ON);
//         break;
//       case 5:
//         set(ref(database, 'lights'), FIREBASE_VALUES.OTHER_ON);
//         break;
//     }

//     // Stop detection after successfully processing command
//     setTimeout(() => {
//       stopGestureDetection();
//     }, 2000);
//   };

//   // Improved gesture detection with consistency check
//   const detectGestures = async () => {
//     if (!isGestureDetecting || !handModelRef.current || !videoRef.current || !canvasRef.current) return;

//     try {
//       // Get hand predictions
//       const predictions = await handModelRef.current.estimateHands(videoRef.current);

//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

//       // Draw video
//       ctx.drawImage(
//         videoRef.current, 
//         0, 0, 
//         canvasRef.current.width, 
//         canvasRef.current.height
//       );

//       // Add detection readings history for stability
//       const readingsHistory = [];

//       if (predictions.length > 0) {
//         // Get hand and count fingers
//         const hand = predictions[0];
//         const fingerCount = countExtendedFingers(hand.landmarks);

//         // Update UI
//         setDetectedFingers(fingerCount);
//         setNotification(`Detected ${fingerCount} finger${fingerCount !== 1 ? 's' : ''}`);

//         // Log to console for debugging
//         console.log(`Current finger count: ${fingerCount}`);

//         // Draw landmarks
//         for (const landmark of hand.landmarks) {
//           ctx.beginPath();
//           ctx.arc(
//             landmark[0] * canvasRef.current.width / videoRef.current.videoWidth,
//             landmark[1] * canvasRef.current.height / videoRef.current.videoHeight,
//             5, 0, 2 * Math.PI
//           );
//           ctx.fillStyle = 'red';
//           ctx.fill();
//         }

//         // Draw finger count prominently
//         ctx.font = 'bold 100px Arial';
//         ctx.fillStyle = 'white';
//         ctx.strokeStyle = 'black';
//         ctx.lineWidth = 5;
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
//         ctx.strokeText(
//           fingerCount.toString(),
//           canvasRef.current.width / 2,
//           canvasRef.current.height / 2
//         );
//         ctx.fillText(
//           fingerCount.toString(),
//           canvasRef.current.width / 2,
//           canvasRef.current.height / 2
//         );

//         // Send directly to Firebase after detection
//         if (fingerCount >= 0 && fingerCount <= 5) {
//           // Immediately send to Firebase - no delay for better responsiveness
//           // In a real app you might want a small delay, but for debugging immediate feedback helps
//           processGestureCommand(fingerCount);
//         }
//       } else {
//         setDetectedFingers(null);
//         setNotification('No hand detected. Please show your hand to the camera.');
//       }

//       // Continue loop
//       if (isGestureDetecting) {
//         requestAnimationFrame(detectGestures);
//       }
//     } catch (error) {
//       console.error('Error in hand detection:', error);
//       setNotification('Error in hand detection');
//       setIsGestureDetecting(false);
//     }
//   };

//   // Custom Switch component
//   const Switch = ({ isOn, onToggle }) => {
//     return (
//       <label className="switch">
//         <input 
//           type="checkbox" 
//           checked={isOn} 
//           onChange={onToggle} 
//         />
//         <span className={`slider ${isOn ? 'active' : ''}`}>
//           <span className={`slider-thumb ${isOn ? 'active' : ''}`}></span>
//         </span>
//       </label>
//     );
//   };

//   return (
//     <div className="container">
//       <div className="header">
//         <div className='smart'>
//           <div className="assistant-icon">G</div>
//           <h1 className="title">Smart Home Controls</h1>
//         </div>
//         {/* Temperature and Fan Status Display */}
//         {temperature !== null && (
//           <div className="temperature-display">
//             <span className="temp-icon">🌡️</span>
//             <span className="temp-value">{temperature}°C</span>
//             <div className={`fan-status ${temperature >= 29 ? 'fan-on' : 'fan-off'}`}>
//               <span className="fan-icon">{temperature >= 29 ? '🔄' : '⏹️'}</span>
//               <span className="fan-text">Fan {temperature >= 29 ? 'ON' : 'OFF'}</span>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="master-controls">
//         <button 
//           className="master-button on" 
//           onClick={turnAllOn}
//         >
//           All Lights On
//         </button>
//         <button 
//           className="master-button off" 
//           onClick={turnAllOff}
//         >
//           All Lights Off
//         </button>
//       </div>

//       <div className="controls">
//         {Object.entries(lights).map(([room, isOn]) => (
//           <div key={room} className={`room ${isOn ? 'active' : ''}`}>
//             <h2 className="room-name">{room.charAt(0).toUpperCase() + room.slice(1)}</h2>
//             <Switch isOn={isOn} onToggle={() => toggleLight(room)} />
//           </div>
//         ))}
//       </div>

//       {/* Gesture Detection Section */}
//       <div className="gesture-section">
//         <h2>Gesture Control</h2>
//         <p>Control your lights with hand gestures:</p>
//         <ul className="gesture-examples">
//           <li><strong>0 fingers:</strong> Turn all lights off</li>
//           <li><strong>1 finger:</strong> Turn all lights on</li>
//           <li><strong>2 fingers:</strong> Toggle bedroom light</li>
//           <li><strong>3 fingers:</strong> Toggle bathroom light</li>
//           <li><strong>4 fingers:</strong> Toggle kitchen light</li>
//           <li><strong>5 fingers:</strong> Toggle other lights</li>
//         </ul>

//         <div className="gesture-controls">
//           <button 
//             onClick={isGestureDetecting ? stopGestureDetection : startGestureDetection} 
//             className={`gesture-button ${isGestureDetecting ? 'detecting' : ''}`}
//           >
//             <span className="camera-icon">📷</span>
//             {isGestureDetecting ? 'Stop Gesture Detection' : 'Start Gesture Detection'}
//           </button>
//         </div>

//         <div className="gesture-display">
//           <video 
//             ref={videoRef} 
//             className={`gesture-video ${isGestureDetecting ? 'active' : ''}`}
//             playsInline
//             muted
//           />
//           <canvas 
//             ref={canvasRef} 
//             className={`gesture-canvas ${isGestureDetecting ? 'active' : ''}`}
//           />
//         </div>
//       </div>

//       <div className="voice-section">
//         <h2>Voice Commands</h2>
//         <p>Click the microphone button and try saying:</p>
//         <ul className="command-examples">
//           <li>"Turn on bedroom light"</li>
//           <li>"Turn off kitchen light"</li>
//           <li>"Turn all lights on"</li>
//           <li>"Turn all lights off"</li>
//         </ul>

//         <button 
//           onClick={startListening} 
//           className={`voice-button ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
//           disabled={!speechSupported || isListening}
//         >
//           <span className="mic-icon">🎤</span>
//           {isListening ? 'Listening...' : 'Start Voice Command'}
//         </button>
//       </div>

//       {notification && (
//         <div className="notification">
//           {notification}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SmartHomeInterface;


import React, { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, set, onValue } from "firebase/database";
import './SmartHomeInterface.css';

const SmartHomeInterface = () => {
  // State for each room's light status - using "0" and "1" strings
  const [lights, setLights] = useState({
    bedroom: "0",
    kitchen: "0",
    bathroom: "0",
    living_room: "0"
  });

  // State for voice recognition
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US'); // Default language
  const recognitionRef = useRef(null);

  // State for notifications
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [currentNotification, setCurrentNotification] = useState('');

  // Language configurations
  const languages = {
    'en-US': { name: 'English', code: 'en-US', flag: '🇺🇸' },
    'kn-IN': { name: 'ಕನ್ನಡ (Kannada)', code: 'kn-IN', flag: '🇮🇳' },
    'hi-IN': { name: 'हिन्दी (Hindi)', code: 'hi-IN', flag: '🇮🇳' },
    'es-ES': { name: 'Español (Spanish)', code: 'es-ES', flag: '🇪🇸' },
    'de-DE': { name: 'Deutsch (German)', code: 'de-DE', flag: '🇩🇪' }
  };

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    } else {
      setNotificationQueue(prev => [...prev, 'Speech recognition is not supported in this browser.']);
    }
  }, []);

  // Manage notification queue
  useEffect(() => {
    if (notificationQueue.length > 0) {
      setCurrentNotification(notificationQueue[0]);
      const timer = setTimeout(() => {
        setNotificationQueue(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setCurrentNotification('');
    }
  }, [notificationQueue]);

  // Connect to Firebase and listen for changes
  useEffect(() => {
    if (!database) {
      setNotificationQueue(prev => [...prev, 'Error: Firebase database not initialized']);
      return;
    }

    const bedroomRef = ref(database, 'Home_Automation_1/Relay1');
    const kitchenRef = ref(database, 'Home_Automation_1/Relay2');
    const bathroomRef = ref(database, 'Home_Automation_1/Relay3');
    const livingRoomRef = ref(database, 'Home_Automation_1/Relay4');

    const bedroomListener = onValue(bedroomRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setLights(prev => ({ ...prev, bedroom: String(value) }));
      }
    });

    const kitchenListener = onValue(kitchenRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setLights(prev => ({ ...prev, kitchen: String(value) }));
      }
    });

    const bathroomListener = onValue(bathroomRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setLights(prev => ({ ...prev, bathroom: String(value) }));
      }
    });

    const livingRoomListener = onValue(livingRoomRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setLights(prev => ({ ...prev, living_room: String(value) }));
      }
    });

    return () => {
      bedroomListener();
      kitchenListener();
      bathroomListener();
      livingRoomListener();
    };
  }, []);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Helper function to update lights
  const updateLights = (updates) => {
    setLights(prev => ({ ...prev, ...updates }));
    Object.entries(updates).forEach(([roomKey, status]) => {
      // Map room names to relay numbers
      const roomToRelay = {
        bedroom: 'Relay1',
        kitchen: 'Relay2',
        bathroom: 'Relay3',
        living_room: 'Relay4'
      };
      
      const firebasePath = roomToRelay[roomKey];
      
      set(ref(database, `Home_Automation_1/${firebasePath}`), Number(status))
        .then(() => {
          setNotificationQueue(prev => [...prev, `${formatRoomName(roomKey)} light turned ${status === "1" ? 'on' : 'off'}`]);
        })
        .catch((error) => {
          console.error("Error updating database: ", error);
          setNotificationQueue(prev => [...prev, `Error: Could not update ${formatRoomName(roomKey)} light status`]);
        });
    });
  };

  // Toggle light function for individual rooms
  const toggleLight = (roomKey) => {
    const newStatus = lights[roomKey] === "0" ? "1" : "0";
    updateLights({ [roomKey]: newStatus });
  };

  // Function to turn all lights on
  const turnAllOn = () => {
    const updates = {
      bedroom: "1",
      kitchen: "1",
      bathroom: "1",
      living_room: "1"
    };
    updateLights(updates);
    setNotificationQueue(prev => [...prev, 'All lights turned on']);
  };

  // Function to turn all lights off
  const turnAllOff = () => {
    const updates = {
      bedroom: "0",
      kitchen: "0",
      bathroom: "0",
      living_room: "0"
    };
    updateLights(updates);
    setNotificationQueue(prev => [...prev, 'All lights turned off']);
  };

  // Multi-language command patterns
  const getCommandPatterns = (lang) => {
    const patterns = {
      'en-US': {
        turnOn: ['turn on', 'switch on', 'on'],
        turnOff: ['turn off', 'switch off', 'off'],
        all: ['all', 'every'],
        bedroom: ['bedroom', 'bed room'],
        kitchen: ['kitchen'],
        bathroom: ['bathroom', 'bath room'],
        living_room: ['living room', 'living', 'lounge'],
        greeting: ['hello', 'hi', 'hey']
      },
      'kn-IN': {
        turnOn: ['ಆನ್ ಮಾಡಿ', 'ಹಚ್ಚು', 'ಹಾಕು', 'ಹಚ್ಚಿ'],
        turnOff: ['ಆಫ್ ಮಾಡಿ', 'ಆರಿಸು', 'ಆರಿಸಿ', 'ಆಫ್'],
        all: ['ಎಲ್ಲಾ', 'ಸಕಲ', 'ಎಲ್ಲ'],
        bedroom: ['ಮಲಗುವ ಕೋಣೆ', 'ಮಲಗುವ'],
        kitchen: ['ಅಡುಗೆ ಮನೆ', 'ಅಡುಗೆ'],
        bathroom: ['ಸ್ನಾನ ಕೋಣೆ', 'ಸ್ನಾನ'],
        living_room: ['ಕುಳಿತುಕೊಳ್ಳುವ ಕೋಣೆ', 'ಲಿವಿಂಗ್'],
        greeting: ['ನಮಸ್ಕಾರ', 'ಹಲೋ']
      },
      'hi-IN': {
        turnOn: ['चालू करो', 'ऑन करो', 'जलाओ', 'चालू'],
        turnOff: ['बंद करो', 'ऑफ करो', 'बुझाओ', 'बंद'],
        all: ['सभी', 'सब', 'सारे'],
        bedroom: ['बेडरूम', 'सोने का कमरा', 'शयन कक्ष'],
        kitchen: ['किचन', 'रसोई', 'रसोईघर'],
        bathroom: ['बाथरूम', 'स्नानघर'],
        living_room: ['लिविंग रूम', 'बैठक', 'ड्राइंग रूम'],
        greeting: ['नमस्ते', 'हैलो', 'हाय']
      },
      'es-ES': {
        turnOn: ['encender', 'enciende', 'prender', 'prende', 'activar'],
        turnOff: ['apagar', 'apaga', 'desactivar'],
        all: ['todas', 'todos', 'todo'],
        bedroom: ['dormitorio', 'habitación', 'cuarto'],
        kitchen: ['cocina'],
        bathroom: ['baño'],
        living_room: ['sala de estar', 'salón', 'sala'],
        greeting: ['hola', 'buenos días', 'buenas tardes']
      },
      'de-DE': {
        turnOn: ['einschalten', 'anmachen', 'an', 'schalte an'],
        turnOff: ['ausschalten', 'ausmachen', 'aus', 'schalte aus'],
        all: ['alle', 'alles'],
        bedroom: ['schlafzimmer'],
        kitchen: ['küche'],
        bathroom: ['badezimmer', 'bad'],
        living_room: ['wohnzimmer'],
        greeting: ['hallo', 'guten tag', 'guten morgen']
      }
    };
    return patterns[lang] || patterns['en-US'];
  };

  // Process voice command with multi-language support
  const processCommand = (command) => {
    if (!command) return;

    command = command.toLowerCase();
    const patterns = getCommandPatterns(selectedLanguage);

    // Check for greeting
    if (patterns.greeting.some(greeting => command.includes(greeting))) {
      const greetingMessages = {
        'en-US': 'Hello! How can I help you with the lights?',
        'kn-IN': 'ನಮಸ್ಕಾರ! ಬೆಳಕಿನ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
        'hi-IN': 'नमस्ते! मैं लाइट्स के साथ आपकी कैसे मदद कर सकता हूं?',
        'es-ES': '¡Hola! ¿Cómo puedo ayudarte con las luces?',
        'de-DE': 'Hallo! Wie kann ich Ihnen mit den Lichtern helfen?'
      };
      setNotificationQueue(prev => [...prev, greetingMessages[selectedLanguage]]);
      return;
    }

    // Check for "all" commands first
    if (patterns.all.some(word => command.includes(word))) {
      const hasOnCommand = patterns.turnOn.some(cmd => command.includes(cmd));
      const hasOffCommand = patterns.turnOff.some(cmd => command.includes(cmd));
      
      if (hasOnCommand) {
        turnAllOn();
        return;
      } else if (hasOffCommand) {
        turnAllOff();
        return;
      }
    }

    // Check for turn on/off commands
    const hasOnCommand = patterns.turnOn.some(cmd => command.includes(cmd));
    const hasOffCommand = patterns.turnOff.some(cmd => command.includes(cmd));

    if (hasOnCommand || hasOffCommand) {
      const isOn = hasOnCommand;
      const targetStatus = isOn ? "1" : "0";
      let roomKey = null;

      // Check for room names in command
      if (patterns.bedroom.some(room => command.includes(room))) {
        roomKey = 'bedroom';
      } else if (patterns.kitchen.some(room => command.includes(room))) {
        roomKey = 'kitchen';
      } else if (patterns.bathroom.some(room => command.includes(room))) {
        roomKey = 'bathroom';
      } else if (patterns.living_room.some(room => command.includes(room))) {
        roomKey = 'living_room';
      }

      if (roomKey) {
        if (lights[roomKey] !== targetStatus) {
          toggleLight(roomKey);
        } else {
          const alreadyMessages = {
            'en-US': `${formatRoomName(roomKey)} light is already ${isOn ? 'on' : 'off'}`,
            'kn-IN': `${formatRoomName(roomKey)} ಬೆಳಕು ಈಗಾಗಲೇ ${isOn ? 'ಆನ್' : 'ಆಫ್'} ಆಗಿದೆ`,
            'hi-IN': `${formatRoomName(roomKey)} की लाइट पहले से ${isOn ? 'चालू' : 'बंद'} है`,
            'es-ES': `La luz de ${formatRoomName(roomKey)} ya está ${isOn ? 'encendida' : 'apagada'}`,
            'de-DE': `Das Licht im ${formatRoomName(roomKey)} ist bereits ${isOn ? 'an' : 'aus'}`
          };
          setNotificationQueue(prev => [...prev, alreadyMessages[selectedLanguage]]);
        }
      } else {
        const notRecognizedMessages = {
          'en-US': 'Sorry, I didn\'t recognize which room you meant',
          'kn-IN': 'ಕ್ಷಮಿಸಿ, ನೀವು ಯಾವ ಕೋಣೆಯನ್ನು ಹೇಳಿದ್ದೀರಿ ಎಂದು ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ',
          'hi-IN': 'क्षमा करें, मुझे समझ नहीं आया आप किस कमरे के बारे में बात कर रहे हैं',
          'es-ES': 'Lo siento, no reconocí qué habitación querías decir',
          'de-DE': 'Entschuldigung, ich habe nicht verstanden, welches Zimmer Sie meinten'
        };
        setNotificationQueue(prev => [...prev, notRecognizedMessages[selectedLanguage]]);
      }
    } else {
      const helpMessages = {
        'en-US': 'Try saying "Turn on bedroom light" or "Turn all lights off"',
        'kn-IN': 'ಪ್ರಯತ್ನಿಸಿ "ಮಲಗುವ ಕೋಣೆ ಬೆಳಕು ಹಚ್ಚು" ಅಥವಾ "ಎಲ್ಲಾ ಬೆಳಕು ಆರಿಸು"',
        'hi-IN': 'कहें "बेडरूम की लाइट चालू करो" या "सभी लाइट बंद करो"',
        'es-ES': 'Intenta decir "Enciende la luz del dormitorio" o "Apaga todas las luces"',
        'de-DE': 'Versuchen Sie zu sagen "Schalte das Schlafzimmerlicht an" oder "Schalte alle Lichter aus"'
      };
      setNotificationQueue(prev => [...prev, helpMessages[selectedLanguage]]);
    }
  };

  // Start voice recognition with selected language
  const startListening = () => {
    if (!speechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.lang = selectedLanguage;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    setIsListening(true);
    
    const listeningMessages = {
      'en-US': 'Listening...',
      'kn-IN': 'ಕೇಳುತ್ತಿದೆ...',
      'hi-IN': 'सुन रहा हूँ...',
      'es-ES': 'Escuchando...',
      'de-DE': 'Höre zu...'
    };
    setNotificationQueue(prev => [...prev, listeningMessages[selectedLanguage]]);

    recognitionRef.current.start();

    recognitionRef.current.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      const youSaidMessages = {
        'en-US': `You said: "${speechResult}"`,
        'kn-IN': `ನೀವು ಹೇಳಿದ್ದು: "${speechResult}"`,
        'hi-IN': `आपने कहा: "${speechResult}"`,
        'es-ES': `Dijiste: "${speechResult}"`,
        'de-DE': `Sie sagten: "${speechResult}"`
      };
      setNotificationQueue(prev => [...prev, youSaidMessages[selectedLanguage]]);
      processCommand(speechResult);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      const errorMessages = {
        'en-US': `Error: ${event.error}`,
        'kn-IN': `ದೋಷ: ${event.error}`,
        'hi-IN': `त्रुटि: ${event.error}`,
        'es-ES': `Error: ${event.error}`,
        'de-DE': `Fehler: ${event.error}`
      };
      setNotificationQueue(prev => [...prev, errorMessages[selectedLanguage]]);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  };

  // Custom Switch component
  const Switch = ({ isOn, onToggle }) => {
    return (
      <label className="switch">
        <input
          type="checkbox"
          checked={isOn === "1"}
          onChange={onToggle}
        />
        <span className={`slider ${isOn === "1" ? 'active' : ''}`}>
          <span className={`slider-thumb ${isOn === "1" ? 'active' : ''}`}></span>
        </span>
      </label>
    );
  };

  // Helper function to format room name for display
  const formatRoomName = (roomKey) => {
    const roomNames = {
      bedroom: 'Bedroom',
      kitchen: 'Kitchen',
      bathroom: 'Bathroom',
      living_room: 'Living Room'
    };
    return roomNames[roomKey] || roomKey;
  };

  return (
    <div className="container">
      <div className="header">
        <div className='smart'>
          <div className="assistant-icon">G</div>
          <h1 className="title">Smart Home Controls</h1>
        </div>
      </div>

      <div className="master-controls">
        <button
          className="master-button on"
          onClick={turnAllOn}
        >
          All Lights On
        </button>
        <button
          className="master-button off"
          onClick={turnAllOff}
        >
          All Lights Off
        </button>
      </div>

      <div className="controls">
        {Object.entries(lights).map(([roomKey, isOn]) => (
          <div key={roomKey} className={`room ${isOn === "1" ? 'active' : ''}`}>
            <h2 className="room-name">{formatRoomName(roomKey)}</h2>
            <Switch isOn={isOn} onToggle={() => toggleLight(roomKey)} />
          </div>
        ))}
      </div>

      <div className="voice-section">
        <h2>Voice Commands</h2>
        
        {/* Language Selector */}
        <div className="language-selector">
          <label htmlFor="language-select">
            <span className="language-label">🌐 Select Language:</span>
          </label>
          <select 
            id="language-select"
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-dropdown"
          >
            {Object.entries(languages).map(([code, lang]) => (
              <option key={code} value={code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <p>Click the microphone button and try saying:</p>
        <ul className="command-examples">
          {selectedLanguage === 'en-US' && (
            <>
              <li>"Turn on bedroom light"</li>
              <li>"Turn off kitchen light"</li>
              <li>"Turn on bathroom light"</li>
              <li>"Turn on living room light"</li>
              <li>"Turn all lights on"</li>
              <li>"Turn all lights off"</li>
            </>
          )}
          {selectedLanguage === 'kn-IN' && (
            <>
              <li>"ಮಲಗುವ ಕೋಣೆ ಬೆಳಕು ಹಚ್ಚು"</li>
              <li>"ಅಡುಗೆ ಮನೆ ಬೆಳಕು ಆರಿಸು"</li>
              <li>"ಸ್ನಾನ ಕೋಣೆ ಬೆಳಕು ಹಚ್ಚು"</li>
              <li>"ಲಿವಿಂಗ್ ರೂಮ್ ಬೆಳಕು ಹಚ್ಚು"</li>
              <li>"ಎಲ್ಲಾ ಬೆಳಕು ಹಚ್ಚು"</li>
              <li>"ಎಲ್ಲಾ ಬೆಳಕು ಆರಿಸು"</li>
            </>
          )}
          {selectedLanguage === 'hi-IN' && (
            <>
              <li>"बेडरूम की लाइट चालू करो"</li>
              <li>"किचन की लाइट बंद करो"</li>
              <li>"बाथरूम की लाइट चालू करो"</li>
              <li>"लिविंग रूम की लाइट चालू करो"</li>
              <li>"सभी लाइट चालू करो"</li>
              <li>"सभी लाइट बंद करो"</li>
            </>
          )}
          {selectedLanguage === 'es-ES' && (
            <>
              <li>"Enciende la luz del dormitorio"</li>
              <li>"Apaga la luz de la cocina"</li>
              <li>"Enciende la luz del baño"</li>
              <li>"Enciende la luz de la sala"</li>
              <li>"Enciende todas las luces"</li>
              <li>"Apaga todas las luces"</li>
            </>
          )}
          {selectedLanguage === 'de-DE' && (
            <>
              <li>"Schalte das Schlafzimmerlicht an"</li>
              <li>"Schalte das Küchenlicht aus"</li>
              <li>"Schalte das Badezimmerlicht an"</li>
              <li>"Schalte das Wohnzimmerlicht an"</li>
              <li>"Schalte alle Lichter an"</li>
              <li>"Schalte alle Lichter aus"</li>
            </>
          )}
        </ul>

        <button
          onClick={startListening}
          className={`voice-button ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
          disabled={!speechSupported || isListening}
        >
          <span className="mic-icon">🎤</span>
          {isListening ? (
            selectedLanguage === 'kn-IN' ? 'ಕೇಳುತ್ತಿದೆ...' :
            selectedLanguage === 'hi-IN' ? 'सुन रहा हूँ...' :
            selectedLanguage === 'es-ES' ? 'Escuchando...' :
            selectedLanguage === 'de-DE' ? 'Höre zu...' :
            'Listening...'
          ) : (
            selectedLanguage === 'kn-IN' ? 'ಧ್ವನಿ ಆದೇಶ ಪ್ರಾರಂಭಿಸಿ' :
            selectedLanguage === 'hi-IN' ? 'वॉयस कमांड शुरू करें' :
            selectedLanguage === 'es-ES' ? 'Iniciar comando de voz' :
            selectedLanguage === 'de-DE' ? 'Sprachbefehl starten' :
            'Start Voice Command'
          )}
        </button>
      </div>

      {currentNotification && (
        <div className="notification">
          {currentNotification}
        </div>
      )}
    </div>
  );
};

export default SmartHomeInterface;