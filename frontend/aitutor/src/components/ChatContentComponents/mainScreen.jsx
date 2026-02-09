import styles from "./chatComponents.module.css";
import markdownStyles from "./markdown.module.css"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";


export default function MainScreen({ chatState, breathing }) {
  return (
    <div className={styles.chatMain}>

      {chatState.map((element, index) => (
        <div key={index} className={styles.textContainer}>
          {element.type === "ai" ? (
            <div className={markdownStyles.markdown}>
            <ReactMarkdown   remarkPlugins={[remarkGfm, remarkMath]}
  rehypePlugins={[rehypeKatex]}>
              {element.text}
            </ReactMarkdown>
            </div>
          ) : (
            <div className={styles.userBubble}>{element.text}</div>
          )}
        </div>
      ))}
      
      <div className={`bottomSpacer ${breathing ? "breathing" : ""}`} />
    </div>
  );
}
