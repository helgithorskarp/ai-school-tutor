import styles from "./ChatPage.module.css"
import { createElement, useState } from "react";
import React from "react";
import Sidebar from "../components/sidebar/SideBar";
import Header from "../components/ChatContentComponents/Header";
import MainScreen from "../components/ChatContentComponents/mainScreen";
import Input from "../components/ChatContentComponents/input";
import { connectWS, sendWS } from "../services/websockets";
import { useRef, useEffect } from "react";

export default function ChatPage() {

  /// call server for information about current course
  const courseInfo = getCourseInfo()

  // get chat history for thies course/ user , dummy data for now
  const chatHistory = getChatHistory()

  const getChatsNames = getChatNames()


  /// SIDEBAR STATE LOGIC
  const [collapsed, setCollapsed] = React.useState(false);
  function toggleSidebar() {
    console.log("hi")
    setCollapsed(!collapsed);
  }


  /// CHAT HISTORY STATE LOGIC
  const [chatState, changeChatState] = React.useState(chatHistory)  

  /// STATE WHETHER EXTRA PADDING OF BOTTOM OF CHATSCREEN IS ENABLED
  const [paddingOn, changePaddingState] = React.useState(false);


  /// WEBSOCLET CONNECTION
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = connectWS(appendAIresponse);
  }, []);

  ///APPEND A MESSAGE TO MAIN CHAT SCREEN
  function appendMessage(text, type) {
    if (type == 'user') {
      toggleStopArrow();
      changePaddingState(true) 
      ScreenScrollToBottom() /// scroll user to bottom
      // send message to server via websocket
      socketRef.current.send(text)
      changeChatState(prev => [...prev, { type: type, text: text }])
      //append an ai bubble to it also
      changeChatState(prev => [...prev, { type: 'ai', text: "" }])

    }
  }


  function appendAIresponse(text, type) {
      if (type == 'end') {
        toggleStopArrow();
      }

      changeChatState(prev => { /// IF AI RESPONSE EITHER CREATE A NEW AI MESSAGE DIV

        const copy = [...prev];///OR APPEND TO THE CURRENT EXISTING ONE
        const lastItem = copy[copy.length - 1];
      
       
          copy[copy.length - 1] = {
            ...lastItem,
            text: lastItem.text + text,
          };
          return copy;
      });
  
  }


  return (
    <div className={`${styles.layout} ${collapsed ? styles.collapsed : ""}`}>
      <Sidebar toggleSidebar={toggleSidebar} collapsed={collapsed} />
      <div className={styles.chatContainer}>
        <div className={styles.headerWrapper}>
          <Header courseName={courseInfo.courseName} />
        </div>
        <div className={styles.contentWrapper}>
          <div className={`${styles.scrollScreen}`} id="scrollScreen">

            <div className={`${styles.contentItem} `}>
              <MainScreen chatState={chatState} breathing={paddingOn}/>
            </div>

          </div>

          <div className={`${styles.contentItem} ${styles.input}`}>
              <Input appendMessage={appendMessage} />
          </div>

        </div>
      </div>
    </div>
  );
}


function ScreenScrollToBottom() {
  setTimeout(() => {
    const scrollScreen = document.getElementById("scrollScreen");
  scrollScreen.scrollTo({
    top: scrollScreen.scrollHeight,
    behavior: "smooth",
  });
  }, 100)
}


function toggleStopArrow() {
  const arrowEl = document.getElementById('arrow');
  const stopEl = document.getElementById('stop');

  if (getComputedStyle(stopEl).display === 'none') {
    stopEl.style.display = 'block';
    arrowEl.style.display = 'none';
  } else {
    stopEl.style.display = 'none';
    arrowEl.style.display = 'block';
  }
}

function getCourseInfo() {
  /// this will later call server for this info depending on the id that is in url
  /// FOR NOW DUMMY DATA
  return {
    id: 1,
    courseName: "Reiknirit"
  };
}

function getChatHistory() {
  return [
    {
      type: "user",
      text: "Can you explain Prim’s algorithm and when I should use it instead of Dijkstra?"
    },
    {
      type: "ai",
      text: `Good question — they *look* similar, but they solve different problems 🙂

### 🌳 Prim’s Algorithm
Prim builds a **Minimum Spanning Tree (MST)**:
- connects **all nodes**
- with **no cycles**
- while minimizing **total edge weight**

So Prim is about building the **cheapest possible network**.

---

### 🧠 High-level idea
You start with one node and keep growing a tree by always picking the **cheapest edge that brings in a new node**.

---

### ✏️ Simple pseudocode

\`\`\`
start from any node
mark it visited

while not all nodes visited:
    find cheapest edge from visited → unvisited
    add that edge to MST
    mark new node visited
\`\`\`

---

### 💻 Tiny code-style example (conceptual)

\`\`\`js
function prim(graph, start) {
  visited = new Set([start])
  mst = []

  while (visited.size < graph.nodes.length) {
    edge = cheapestEdge(visited, graph)
    mst.push(edge)
    visited.add(edge.to)
  }

  return mst
}
\`\`\`

(Not full production code — just to show the flow.)

---

### 🚗 Dijkstra (for comparison)
Dijkstra finds the **shortest paths from ONE starting node** to every other node.

It answers:
> “What’s the cheapest way to go from A to B?”

Not:
> “What’s the cheapest way to connect everything?”

---

### ✅ When to use which
Use **Prim** when:
- you want to connect everything cheaply (networks, cables, roads)
- total cost matters

Use **Dijkstra** when:
- you care about shortest paths from a source
- routing/navigation problems

---

### TL;DR
🌳 **Prim** → cheapest *overall* connection  
🚗 **Dijkstra** → cheapest *paths from a start*

If you want, I can walk through a tiny example step-by-step too 👍`
    },
    {
      type: "user",
      text: "Thanks bro 🙏"
    },
    {
      type: "ai",
      text: `No worries bro — goooood question 😄
Ping me anytime if you want examples or visuals 👍`
    }
  ];
}



export function getChatNames() {
  // DUMY DATA FOR NOW
  return [
    { id: 1, name: "Prim’s Algorithm" },
    { id: 2, name: "React Layout" },
    { id: 3, name: "WebSockets Setup" },
    { id: 4, name: "Markdown Blocks" },
    { id: 5, name: "CSS Positioning" },
    { id: 6, name: "Fetch Streaming" },
    { id: 7, name: "Django Backend" },
    { id: 8, name: "Sidebar UI" },
  ];
}
