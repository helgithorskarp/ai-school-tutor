import styles from "./chatComponents.module.css"
import TextareaAutosize from "react-textarea-autosize";
import { useState } from "react";
import React from "react";

export default function Input({ appendMessage }) {

    const [text, setText] = React.useState("");


    return (
        <div className={styles.chatInputBar}>
            <TextareaAutosize
                placeholder="Ask me anything about Reiknrit!"
                style={{
                    resize: "none",
                    overflow: "hidden",
                }}
                minRows={1}
                maxRows={6}
                onChange={(e) => setText(e.target.value)}
                className={styles.input}>
            </TextareaAutosize>

            <div className={styles.inputIcons}>
                <span className={styles.clipContainer}>
                    <i className={`bi bi-paperclip ${styles.clip} ${styles.inputIcon}`}></i>
                    <span className={`hoverText ${styles.clipText}`}>Add files</span>
                </span>
                <i onClick={() => { appendMessage(text, 'user') }} className={`bi bi-arrow-up-circle-fill ${styles.arrow} ${styles.inputIcon}`} id="arrow"></i>
                <i className={`bi bi-stop-circle-fill ${styles.stop} ${styles.inputIcon} ${styles.arrow}`} id="stop"></i>
            </div>
        </div>
    )
}


