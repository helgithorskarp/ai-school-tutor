import styles from "./SideBar.module.css"
import SidebarHeader from "./SidebarHeader"

export default function Sidebar({toggleSidebar, collapsed}) {
    return (
        <div className={styles.Sidebar}>
            <SidebarHeader toggleSidebar={toggleSidebar} collapsed={collapsed} />
            <div onClick={toggleSidebar}>
            </div>
        </div>
    )
}