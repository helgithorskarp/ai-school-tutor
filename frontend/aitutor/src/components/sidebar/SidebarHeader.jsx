import styles from "./SideBar.module.css";
import logo from "../../assets/logo.png";

export default function SidebarHeader({ toggleSidebar, collapsed }) {
  return (
    <div className={styles.header}>
      <img src={logo} alt="" className={styles.sidebarhover} />

      {!collapsed && (
        <span className={styles.sidebarIconContainer}>
        <i
          onClick={toggleSidebar}
          className={`bi bi-layout-sidebar-inset ${styles.sidebarIcon} ${styles.sidebarhover}`}
        ></i>
        <span className={`hoverText ${styles.closeText}`}>Close sidebar</span>

        </span>
      )}
    </div>
  );
}
