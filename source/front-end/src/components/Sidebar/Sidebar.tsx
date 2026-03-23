import {
  BoxSelectIcon,
  FormIcon,
  LandPlotIcon,
  Lightbulb,
  ListIcon,
  LogOut,
  PersonStandingIcon,
  UserIcon,
  Coins,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import SideBarItem from './SidebarItem'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const userRole = useSelector((state: RootState) => state.auth.user?.role)

  const sidebarItems = [
    {
      icon: <FormIcon />,
      label: 'Formulário de Sugestões',
      path: '/',
    },
    {
      icon: <UserIcon />,
      label: 'Perfil',
      path: '/profile',
    },
    {
      icon: <ListIcon />,
      label: 'Lista de Sugestões',
      path: '/suggestion-list',
      allowedRoles: ['ADMIN'],
    },
    {
      icon: <BoxSelectIcon />,
      label: 'Definir Campeão',
      path: '/admin/define-champion',
      allowedRoles: ['ADMIN'],
    },
    {
      icon: <PersonStandingIcon />,
      label: 'Colaboradores',
      path: '/employee',
      allowedRoles: ['ADMIN'],
    },
    {
      icon: <LandPlotIcon />,
      label: 'Áreas',
      path: '/areas',
      allowedRoles: ['ADMIN'],
    },
    {
      icon: <Lightbulb />,
      label: 'Propostas',
      path: '/proposals',
    },
    {
      icon: <Coins />,
      label: 'Pagamentos',
      path: '/payouts',
      allowedRoles: ['ADMIN', 'HUMAN_RESOURCES'],
    },
    { icon: <LogOut />, label: 'Sair', path: '/logout' },
  ]

  return (
    <aside
      className={`flex flex-col gap-4 p-4 bg-gray-200 h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-72' : 'w-16'
      }`}
      onMouseOver={() => setIsSidebarOpen(true)}
      onMouseLeave={() => setIsSidebarOpen(false)}
    >
      {sidebarItems
        .filter(
          (item) =>
            !item.allowedRoles || (userRole ? item.allowedRoles?.includes(userRole) : false),
        )
        .map((item) => (
          <SideBarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            onClickFunction={() => navigate(item.path)}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
    </aside>
  )
}

export default Sidebar
