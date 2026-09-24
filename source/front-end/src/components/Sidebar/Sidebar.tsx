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
  UserStar,
  UserPen,
  Menu,
  X,
  Blocks,
  ChartArea,
  Pin,
  PinOff,
  PanelLeft,
  PanelLeftOpen,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import SideBarItem from './SidebarItem'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import { useState } from 'react'

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const userRole = useSelector((state: RootState) => state.auth.user?.role)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [isSidebarLocked, setIsSidebarLocked] = useState(false)
  const isSidebarExpanded = isSidebarHovered || isSidebarLocked

  const sidebarItems = [
    {
      icon: <FormIcon />,
      label: 'Formulário',
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
    },
    {
      icon: <UserPen />,
      label: 'Definir Executor',
      path: '/admin/define-champion',
      allowedRoles: ['ADMIN'],
    },
    {
      icon: <BoxSelectIcon />,
      label: 'Definir Executor',
      path: '/define-champion',
      blockedRoles: ['ADMIN'],
    },
    {
      icon: <UserStar />,
      label: 'Definir Gestor',
      path: '/admin/define-manager',
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
      icon: <Blocks />,
      label: 'Categorias',
      path: '/categories',
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
    {
      icon: <ChartArea />,
      label: 'Relatórios',
      path: '/analytics',
      allowedRoles: ['ADMIN', 'GENERAL_MANAGER'],
    },
    { icon: <LogOut />, label: 'Sair', path: '/logout' },
  ]

  const visibleItems = sidebarItems
    .filter(
      (item) => !item.allowedRoles || (userRole ? item.allowedRoles?.includes(userRole) : false),
    )
    .filter(
      (item) => !item.blockedRoles || (userRole ? !item.blockedRoles?.includes(userRole) : false),
    )

  return (
    <div
      className={`absolute lg:static m-4 lg:mt-8 lg:mr-0 lg:ml-4 lg:h-full rounded-xl bg-white transition-[width] duration-300 ease-in-out ${isMobileMenuOpen ? 'w-49' : 'w-13'} ${isSidebarExpanded ? 'lg:w-49' : 'lg:w-13'}`}
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
    >
      <div className="flex items-center justify-between p-2 lg:hidden">
        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="relative z-40 rounded-md p-2 hover:bg-black hover:text-white transition-colors hover:cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <div className="hidden justify-start p-2 lg:flex">
        <button
          type="button"
          aria-label={isSidebarLocked ? 'Desbloquear menu lateral' : 'Fixar menu lateral aberto'}
          aria-pressed={isSidebarLocked}
          onClick={() => setIsSidebarLocked((prev) => !prev)}
          className="rounded-md p-2 transition-colors hover:cursor-pointer hover:bg-black hover:text-white"
        >
          {isSidebarLocked ? (
            <PanelLeft className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </button>
      </div>
      <hr className="text-black" />

      <nav
        className={`absolute lg:static top-16 z-30 flex h-fit flex-col gap-2 overflow-hidden rounded-xl bg-white shadow-md transition-[width,opacity,padding] duration-300 ease-in-out ${isMobileMenuOpen ? 'w-49 p-2 opacity-100' : ' w-0 p-0 opacity-0'} ${isSidebarExpanded ? 'lg:w-49' : 'lg:w-full'} lg:p-2 lg:opacity-100`}
      >
        {visibleItems.map((item) => (
          <SideBarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            isExpanded={isSidebarExpanded}
            isActive={window.location.pathname === item.path}
            onClickFunction={() => {
              navigate(item.path)
              setIsMobileMenuOpen(false)
            }}
          />
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
