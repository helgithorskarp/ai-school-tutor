import styles from "./chatComponents.module.css"

export default function Header({ courseName }) {
    return (
        <div>
            <span className={`${styles.courseText}`}>
                Course/ 
            </span>
            <span className={`${styles.courseText} ${styles.courseName}`}>
                {courseName}
            </span>
        </div>
    )
}