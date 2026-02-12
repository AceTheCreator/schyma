import React from 'react'

interface SidebarIconProps {
  isCollapsed: boolean
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ isCollapsed }) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M14 2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z" />
    <rect
      className={`panel-icon-rect ${isCollapsed ? 'panel-icon-rect-collapsed' : ''}`}
      x="10"
      y="3"
      height="10"
      rx="1"
    />
  </svg>
)

export default SidebarIcon
