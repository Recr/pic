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
      allowedRoles: ['ADMIN'],
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
    <div className="relative bg-gray-200">
      <div className="flex items-center justify-between p-2 md:hidden">
        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="rounded-md p-2 hover:bg-blue-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-20 md:hidden"
        />
      )}

      <nav
        className={`${isMobileMenuOpen ? 'flex' : 'hidden'} absolute left-2 right-2 top-full z-30 mt-1 flex-col gap-2 rounded-xl border border-gray-200 bg-gray-100 p-2 shadow-md transition-all duration-300 ease-in-out md:static md:mt-0 md:flex md:flex-row md:items-center md:justify-center md:gap-4 md:overflow-x-auto md:rounded-none md:border-0 md:bg-transparent md:p-2 md:shadow-none`}
      >
        {visibleItems.map((item) => (
          <SideBarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
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
