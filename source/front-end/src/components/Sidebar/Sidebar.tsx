import {
  BoxSelectIcon,
  FormIcon,
  LandPlotIcon,
  Lightbulb,
  ListIcon,
  LogOut,
  PersonStandingIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import SideBarItem from './SidebarItem'

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const sidebarItems = [
    {
      icon: <FormIcon />,
      label: 'Formulário de Sugestões',
      path: '/',
    },
    {
      icon: <ListIcon />,
      label: 'Lista de Sugestões',
      path: '/suggestion-list',
    },
    {
      icon: <BoxSelectIcon />,
      label: 'Definir Campeão',
      path: '/admin/define-champion',
    },
    {
      icon: <PersonStandingIcon />,
      label: 'Colaboradores',
      path: '/employee',
    },
    {
      icon: <LandPlotIcon />,
      label: 'Áreas',
      path: '/areas',
    },
    {
      icon: <Lightbulb />,
      label: 'Propostas',
      path: '/proposals',
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
      {sidebarItems.map((item) => (
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
